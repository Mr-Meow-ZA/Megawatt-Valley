import Phaser from 'phaser';
import { EQUIPMENT } from '../content/equipment';
import type { GameSimulation } from '../simulation/GameSimulation';
import type { EquipmentKind, GameSnapshot, Vec2 } from '../simulation/types';
import { depthFor, isoToScreen, screenToIso, TILE_H } from './iso';
import { Palette } from './isoArt';

const WORLD_W = 42;
const WORLD_H = 30;

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

function isPv(kind: EquipmentKind): boolean {
  return kind === 'bargain_pv' || kind === 'premium_pv';
}

function hash(x: number, y: number): number {
  return Math.abs((x * 73856093) ^ (y * 19349663)) % 1000;
}

export class WorldView {
  private readonly ground = new Map<string, Phaser.GameObjects.Image>();
  private readonly props: Phaser.GameObjects.GameObject[] = [];
  private readonly entitySprites = new Map<string, Phaser.GameObjects.Image>();
  private readonly overlays = new Map<string, Phaser.GameObjects.Image>();
  private ghost: Phaser.GameObjects.Image | null = null;
  private selectRing: Phaser.GameObjects.Image | null = null;
  private hoverTile: Vec2 | null = null;
  private clouds: Phaser.GameObjects.Image[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly sim: GameSimulation,
  ) {
    scene.cameras.main.setBackgroundColor(Palette.sky);
    this.buildTerrain();
    this.scatterEnvironment();
    this.spawnClouds();
    const cam = scene.cameras.main;
    const center = isoToScreen(16, 11);
    cam.centerOn(center.x, center.y - 20);
    cam.setZoom(0.95);
  }

  private tileKey(x: number, y: number): string {
    return `${x},${y}`;
  }

  private terrainKey(x: number, y: number): string {
    // River corridor through valley
    if (x >= 18 && x <= 20) return 'tile_water';
    if (x === 17 || x === 21) return 'tile_bank';

    // Main loop roads (asphalt)
    if (y === 6 && x >= 3 && x <= 34) return hash(x, y) % 5 === 0 ? 'tile_road_mark' : 'tile_road';
    if (x === 11 && y >= 6 && y <= 16) return 'tile_road';
    if (x === 15 && y >= 6 && y <= 12) return 'tile_road';
    if (y === 12 && x >= 11 && x <= 15) return 'tile_road';
    // Site B access
    if (y === 8 && x >= 21 && x <= 32) return 'tile_road';
    if (x === 26 && y >= 8 && y <= 14) return 'tile_road';

    // Service / dirt pads near office
    if (x >= 4 && x <= 7 && y >= 5 && y <= 7) return 'tile_dirt';

    const inSiteA = x >= 4 && x < 18 && y >= 4 && y < 16;
    const inSiteB = x >= 22 && x < 34 && y >= 6 && y < 16;
    if (!inSiteA && !inSiteB && hash(x, y) % 11 === 0) return 'tile_dirt';

    return `tile_grass_${hash(x, y) % 4}`;
  }

  private buildTerrain(): void {
    for (let y = 0; y < WORLD_H; y++) {
      for (let x = 0; x < WORLD_W; x++) {
        const screen = isoToScreen(x, y);
        const key = this.terrainKey(x, y);
        const img = this.scene.add.image(screen.x, screen.y, key);
        img.setDepth(depthFor(x, y, -5));
        this.ground.set(this.tileKey(x, y), img);
      }
    }
    this.refreshLockedTiles();
  }

  private addProp(tex: string, x: number, y: number, yOff = 0, depthBias = 2, scale = 1): void {
    const s = isoToScreen(x, y);
    const img = this.scene.add.image(s.x, s.y + yOff, tex);
    img.setScale(scale);
    img.setDepth(depthFor(x, y, depthBias));
    this.props.push(img);
  }

  private scatterEnvironment(): void {
    // Bridge across river on main road
    {
      const s = isoToScreen(19, 6);
      const bridge = this.scene.add.image(s.x, s.y - 10, 'bridge');
      bridge.setDepth(depthFor(19, 6, 6));
      this.props.push(bridge);
    }

    // Pylon near substation
    this.addProp('pylon', 14, 3, -40, 8, 1);
    this.addProp('pylon', 22, 4, -40, 8, 0.9);

    // Maintenance yard near office
    this.addProp('yard', 5, 8, -18, 5);

    // Vehicles
    this.addProp('van', 6, 6, -10, 7);
    this.addProp('truck', 13, 7, -10, 7);
    this.addProp('van', 27, 9, -10, 7);

    // Fence rings around Site A solar meadow edges
    for (let x = 5; x <= 16; x += 2) {
      this.addProp('fence', x, 15, -6, 3, 0.9);
    }
    for (let y = 8; y <= 14; y += 2) {
      this.addProp('fence', 4, y, -6, 3, 0.85);
    }

    // Dense pine forests — north hills and river sides
    const pines: Array<[number, number, boolean]> = [];
    for (let x = 0; x < WORLD_W; x++) {
      for (let y = 0; y < WORLD_H; y++) {
        const onRiver = x >= 17 && x <= 21;
        const onRoad =
          (y === 6 && x >= 3 && x <= 34) ||
          (x === 11 && y >= 6 && y <= 16) ||
          (y === 8 && x >= 21 && x <= 32);
        const inSiteA = x >= 4 && x < 18 && y >= 4 && y < 16;
        const inSiteB = x >= 22 && x < 34 && y >= 6 && y < 16;
        if (onRiver || onRoad || inSiteA || inSiteB) continue;
        const h = hash(x, y);
        // denser forests on edges / hills
        const edge = x < 3 || y < 3 || x > 36 || y > 24;
        const threshold = edge ? 280 : 120;
        if (h % 1000 < threshold) {
          pines.push([x, y, h % 3 === 0]);
        }
      }
    }
    for (const [x, y, big] of pines) {
      this.addProp(big ? 'tree_big' : 'tree', x, y, big ? -28 : -20, 3);
    }

    // Rocks along river banks
    for (let y = 2; y < WORLD_H; y += 2) {
      if (hash(17, y) % 3 === 0) this.addProp('rock', 17, y, -4, 2);
      if (hash(21, y) % 3 === 0) this.addProp('rock', 21, y, -4, 2);
    }

    // Decorative workers near yard
    this.addProp('tech', 7, 9, -14, 9, 0.95);
  }

  private spawnClouds(): void {
    for (let i = 0; i < 5; i++) {
      const s = isoToScreen(6 + i * 7, 1 + (i % 2));
      const cloud = this.scene.add.image(s.x, s.y - 120 - (i % 3) * 20, 'cloud');
      cloud.setAlpha(0.55 + (i % 3) * 0.1);
      cloud.setScale(0.8 + (i % 3) * 0.15);
      cloud.setDepth(-100 + i);
      this.clouds.push(cloud);
      this.props.push(cloud);
    }
  }

  refreshLockedTiles(): void {
    const snap = this.sim.snapshot();
    const siteB = snap.plots.find((p) => p.id === 'site_b');
    for (const [key, img] of this.ground) {
      const [xs, ys] = key.split(',');
      const x = Number(xs);
      const y = Number(ys);
      const inSiteB = x >= 22 && x < 34 && y >= 6 && y < 16;
      if (inSiteB && siteB && !siteB.unlocked) {
        img.setTexture('tile_locked');
      } else if (img.texture.key === 'tile_locked') {
        img.setTexture(this.terrainKey(x, y));
      }
    }
  }

  sync(snapshot: GameSnapshot): void {
    // gentle cloud drift
    for (let i = 0; i < this.clouds.length; i++) {
      const c = this.clouds[i];
      c.x += 0.08 + i * 0.01;
      if (c.x > 1400) c.x = -400;
    }

    const seen = new Set<string>();

    for (const eq of snapshot.equipment) {
      seen.add(eq.id);
      const def = EQUIPMENT[eq.kind];
      const anchor = isoToScreen(
        eq.tile.x + def.footprint.x / 2 - 0.5,
        eq.tile.y + def.footprint.y / 2 - 0.5,
      );
      let sprite = this.entitySprites.get(eq.id);
      if (!sprite) {
        sprite = this.scene.add.image(anchor.x, anchor.y - 14, textureFor(eq.kind));
        this.entitySprites.set(eq.id, sprite);
      }
      sprite.setTexture(textureFor(eq.kind));
      sprite.setPosition(anchor.x, anchor.y - 14);
      sprite.setDepth(depthFor(eq.tile.x, eq.tile.y, 5));
      sprite.setAlpha(eq.commissioned ? 1 : 0.4 + eq.constructionProgress * 0.6);
      if (isPv(eq.kind)) {
        const dust = 1 - eq.soiling * 0.4;
        sprite.setTint(
          Phaser.Display.Color.GetColor(
            Math.floor(220 * dust + 35),
            Math.floor(230 * dust + 25),
            Math.floor(255 * (0.85 + dust * 0.15)),
          ),
        );
      } else {
        sprite.clearTint();
      }

      let overlay = this.overlays.get(eq.id);
      if (eq.faulted) {
        if (!overlay) {
          overlay = this.scene.add.image(anchor.x, anchor.y - 48, 'fault_icon');
          this.overlays.set(eq.id, overlay);
        }
        overlay.setPosition(anchor.x, anchor.y - 48);
        overlay.setDepth(depthFor(eq.tile.x, eq.tile.y, 20));
        overlay.setVisible(true);
        overlay.setScale(1 + Math.sin(this.scene.time.now / 200) * 0.08);
      } else if (overlay) {
        overlay.setVisible(false);
      }
    }

    for (const staff of snapshot.staff) {
      seen.add(staff.id);
      const pos = isoToScreen(staff.tile.x, staff.tile.y);
      let sprite = this.entitySprites.get(staff.id);
      if (!sprite) {
        sprite = this.scene.add.image(pos.x, pos.y - 18, 'tech');
        this.entitySprites.set(staff.id, sprite);
      }
      const bob =
        staff.task.type === 'idle'
          ? Math.sin(this.scene.time.now / 280) * 1.5
          : Math.sin(this.scene.time.now / 110) * 2.5;
      sprite.setPosition(pos.x, pos.y - 18 + bob);
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
        const anchor = isoToScreen(
          eq.tile.x + def.footprint.x / 2 - 0.5,
          eq.tile.y + def.footprint.y / 2 - 0.5,
        );
        if (!this.selectRing) {
          this.selectRing = this.scene.add.image(anchor.x, anchor.y + 10, 'select_ring');
        }
        this.selectRing.setVisible(true);
        this.selectRing.setPosition(anchor.x, anchor.y + 10);
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
      const anchor = isoToScreen(
        eq.tile.x + def.footprint.x / 2 - 0.5,
        eq.tile.y + def.footprint.y / 2 - 0.5,
      );
      const d = Phaser.Math.Distance.Between(worldX, worldY, anchor.x, anchor.y - 14);
      if (d < 48 && (!best || d < best.d)) best = { id: eq.id, d };
    }
    for (const staff of snapshot.staff) {
      const anchor = isoToScreen(staff.tile.x, staff.tile.y);
      const d = Phaser.Math.Distance.Between(worldX, worldY, anchor.x, anchor.y - 18);
      if (d < 30 && (!best || d < best.d)) best = { id: staff.id, d };
    }
    return best?.id ?? null;
  }
}

export { WORLD_W, WORLD_H, TILE_H };
