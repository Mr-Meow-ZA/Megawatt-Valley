import Phaser from 'phaser';
import { EQUIPMENT } from '../content/equipment';
import type { GameSimulation } from '../simulation/GameSimulation';
import type { EquipmentKind, GameSnapshot, Vec2 } from '../simulation/types';
import { depthFor, isoToScreen, screenToIso, TILE_H, TILE_W } from './iso';

const WORLD_W = 40;
const WORLD_H = 28;

function textureFor(kind: EquipmentKind): string {
  switch (kind) {
    case 'bargain_pv':
      return 'pv_bargain';
    case 'premium_pv':
      return 'pv_premium';
    case 'inverter':
      return 'inverter';
    case 'office':
      return 'office';
    case 'substation':
      return 'substation';
    default:
      return 'rock';
  }
}

export class WorldView {
  private readonly ground = new Map<string, Phaser.GameObjects.Image>();
  private readonly props: Phaser.GameObjects.Image[] = [];
  private readonly entitySprites = new Map<string, Phaser.GameObjects.Image>();
  private readonly overlays = new Map<string, Phaser.GameObjects.Image>();
  private ghost: Phaser.GameObjects.Image | null = null;
  private selectRing: Phaser.GameObjects.Image | null = null;
  private hoverTile: Vec2 | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly sim: GameSimulation,
  ) {
    this.buildTerrain();
    this.scatterProps();
    const cam = scene.cameras.main;
    const center = isoToScreen(18, 12);
    cam.centerOn(center.x, center.y);
    cam.setZoom(1.1);
  }

  private tileKey(x: number, y: number): string {
    return `${x},${y}`;
  }

  private buildTerrain(): void {
    for (let y = 0; y < WORLD_H; y++) {
      for (let x = 0; x < WORLD_W; x++) {
        const screen = isoToScreen(x, y);
        let key = 'tile_grass';
        // river
        if (x >= 18 && x <= 20) key = 'tile_water';
        // service road
        if (y === 5 && x >= 4 && x <= 30) key = 'tile_road';
        if (x === 12 && y >= 5 && y <= 14) key = 'tile_road';

        const inSiteA = x >= 4 && x < 18 && y >= 4 && y < 16;
        const inSiteB = x >= 22 && x < 34 && y >= 6 && y < 16;
        if (!inSiteA && !inSiteB && key === 'tile_grass' && (x + y) % 7 === 0) {
          key = 'tile_dirt';
        }

        const img = this.scene.add.image(screen.x, screen.y, key);
        img.setDepth(depthFor(x, y, -5));
        img.setData('tile', { x, y });
        this.ground.set(this.tileKey(x, y), img);
      }
    }
    this.refreshLockedTiles();
  }

  private scatterProps(): void {
    const trees = [
      [2, 3],
      [3, 10],
      [7, 17],
      [15, 18],
      [21, 4],
      [28, 18],
      [35, 8],
      [10, 2],
      [25, 20],
    ];
    for (const [x, y] of trees) {
      const s = isoToScreen(x, y);
      const tree = this.scene.add.image(s.x, s.y - 18, 'tree');
      tree.setDepth(depthFor(x, y, 2));
      this.props.push(tree);
    }
    const rocks = [
      [6, 15],
      [16, 8],
      [24, 14],
      [31, 7],
    ];
    for (const [x, y] of rocks) {
      const s = isoToScreen(x, y);
      const rock = this.scene.add.image(s.x, s.y - 4, 'rock');
      rock.setDepth(depthFor(x, y, 1));
      this.props.push(rock);
    }
  }

  refreshLockedTiles(): void {
    const snap = this.sim.snapshot();
    for (const [key, img] of this.ground) {
      const [xs, ys] = key.split(',');
      const x = Number(xs);
      const y = Number(ys);
      const siteB = snap.plots.find((p) => p.id === 'site_b');
      const inSiteB = x >= 22 && x < 34 && y >= 6 && y < 16;
      if (inSiteB && siteB && !siteB.unlocked) {
        img.setTexture('tile_locked');
      } else if (img.texture.key === 'tile_locked') {
        img.setTexture((x >= 18 && x <= 20) ? 'tile_water' : 'tile_grass');
      }
    }
  }

  sync(snapshot: GameSnapshot): void {
    const seen = new Set<string>();

    for (const eq of snapshot.equipment) {
      seen.add(eq.id);
      const def = EQUIPMENT[eq.kind];
      const anchor = isoToScreen(eq.tile.x + def.footprint.x / 2 - 0.5, eq.tile.y + def.footprint.y / 2 - 0.5);
      let sprite = this.entitySprites.get(eq.id);
      if (!sprite) {
        sprite = this.scene.add.image(anchor.x, anchor.y - 10, textureFor(eq.kind));
        this.entitySprites.set(eq.id, sprite);
      }
      sprite.setTexture(textureFor(eq.kind));
      sprite.setPosition(anchor.x, anchor.y - 10);
      sprite.setDepth(depthFor(eq.tile.x, eq.tile.y, 5));
      sprite.setAlpha(eq.commissioned ? 1 : 0.45 + eq.constructionProgress * 0.55);
      if (isPv(eq.kind)) {
        const dust = 1 - eq.soiling * 0.35;
        sprite.setTint(Phaser.Display.Color.GetColor(Math.floor(255 * dust), Math.floor(255 * dust), Math.floor(255 * (0.9 + dust * 0.1))));
      } else {
        sprite.clearTint();
      }

      const needsFault = eq.faulted;
      let overlay = this.overlays.get(eq.id);
      if (needsFault) {
        if (!overlay) {
          overlay = this.scene.add.image(anchor.x, anchor.y - 40, 'fault_icon');
          this.overlays.set(eq.id, overlay);
        }
        overlay.setPosition(anchor.x, anchor.y - 40);
        overlay.setDepth(depthFor(eq.tile.x, eq.tile.y, 20));
        overlay.setVisible(true);
      } else if (overlay) {
        overlay.setVisible(false);
      }
    }

    for (const staff of snapshot.staff) {
      seen.add(staff.id);
      const pos = isoToScreen(staff.tile.x, staff.tile.y);
      let sprite = this.entitySprites.get(staff.id);
      if (!sprite) {
        sprite = this.scene.add.image(pos.x, pos.y - 16, 'tech');
        this.entitySprites.set(staff.id, sprite);
      }
      const bob = staff.task.type === 'idle' ? Math.sin(this.scene.time.now / 250) * 1.5 : Math.sin(this.scene.time.now / 120) * 2;
      sprite.setPosition(pos.x, pos.y - 16 + bob);
      sprite.setDepth(depthFor(staff.tile.x, staff.tile.y, 8));
    }

    for (const [id, sprite] of this.entitySprites) {
      if (!seen.has(id)) {
        sprite.destroy();
        this.entitySprites.delete(id);
        this.overlays.get(id)?.destroy();
        this.overlays.delete(id);
      }
    }

    if (snapshot.selectedId) {
      const eq = snapshot.equipment.find((e) => e.id === snapshot.selectedId);
      if (eq) {
        const def = EQUIPMENT[eq.kind];
        const anchor = isoToScreen(eq.tile.x + def.footprint.x / 2 - 0.5, eq.tile.y + def.footprint.y / 2 - 0.5);
        if (!this.selectRing) {
          this.selectRing = this.scene.add.image(anchor.x, anchor.y + 8, 'select_ring');
        }
        this.selectRing.setVisible(true);
        this.selectRing.setPosition(anchor.x, anchor.y + 8);
        this.selectRing.setDepth(depthFor(eq.tile.x, eq.tile.y, 4));
      }
    } else if (this.selectRing) {
      this.selectRing.setVisible(false);
    }

    this.refreshLockedTiles();
  }

  updateGhost(snapshot: GameSnapshot, pointerWorld: { x: number; y: number }): void {
    if (!snapshot.buildMode) {
      this.ghost?.setVisible(false);
      this.hoverTile = null;
      return;
    }
    const iso = screenToIso(pointerWorld.x, pointerWorld.y);
    const tile = { x: Math.floor(iso.x), y: Math.floor(iso.y) };
    this.hoverTile = tile;
    const plotId = this.sim.plotAtTile(tile);
    const ok = plotId ? this.sim.canPlace(snapshot.buildMode, plotId, tile) === null : false;
    const screen = isoToScreen(tile.x, tile.y);
    if (!this.ghost) {
      this.ghost = this.scene.add.image(screen.x, screen.y, ok ? 'ghost_ok' : 'ghost_bad');
    }
    this.ghost.setTexture(ok ? 'ghost_ok' : 'ghost_bad');
    this.ghost.setPosition(screen.x, screen.y);
    this.ghost.setDepth(depthFor(tile.x, tile.y, 15));
    this.ghost.setVisible(true);
  }

  getHoverTile(): Vec2 | null {
    return this.hoverTile;
  }

  pickEntity(snapshot: GameSnapshot, worldX: number, worldY: number): string | null {
    let best: { id: string; d: number } | null = null;
    for (const eq of snapshot.equipment) {
      const def = EQUIPMENT[eq.kind];
      const anchor = isoToScreen(eq.tile.x + def.footprint.x / 2 - 0.5, eq.tile.y + def.footprint.y / 2 - 0.5);
      const d = Phaser.Math.Distance.Between(worldX, worldY, anchor.x, anchor.y - 10);
      if (d < 36 && (!best || d < best.d)) best = { id: eq.id, d };
    }
    for (const staff of snapshot.staff) {
      const anchor = isoToScreen(staff.tile.x, staff.tile.y);
      const d = Phaser.Math.Distance.Between(worldX, worldY, anchor.x, anchor.y - 16);
      if (d < 28 && (!best || d < best.d)) best = { id: staff.id, d };
    }
    return best?.id ?? null;
  }
}

function isPv(kind: EquipmentKind): boolean {
  return kind === 'bargain_pv' || kind === 'premium_pv';
}

export { WORLD_W, WORLD_H, TILE_W, TILE_H };
