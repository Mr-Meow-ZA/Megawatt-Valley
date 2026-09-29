import Phaser from 'phaser';
import { EQUIPMENT } from '../content/equipment';
import type { GameSimulation } from '../simulation/GameSimulation';
import type { EquipmentKind, GameSnapshot, Vec2 } from '../simulation/types';
import { depthFor, isoToScreen, screenToIso, TILE_H } from './iso';
const SKY = 0x8ec8ef;
const GRASS_DEEP = 0x2f6b1c;
const STEEL_DARK = 0x5a6370;

const WORLD_W = 42;
const WORLD_H = 30;

/** Site A buildable meadow — keep clear of trees; fence the perimeter. */
const SITE_A = { x0: 4, x1: 18, y0: 4, y1: 16 };
/** Site B locked meadow. */
const SITE_B = { x0: 22, x1: 34, y0: 6, y1: 16 };

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

function inRect(
  x: number,
  y: number,
  r: { x0: number; x1: number; y0: number; y1: number },
): boolean {
  return x >= r.x0 && x < r.x1 && y >= r.y0 && y < r.y1;
}

/** Slight meander so the river corridor is not a perfect rectangle. */
function riverCenterX(y: number): number {
  const wobble = Math.sin(y * 0.45) * 0.7 + Math.sin(y * 0.17) * 0.4;
  return 19 + wobble;
}

function isWater(x: number, y: number): boolean {
  const cx = riverCenterX(y);
  return x >= Math.floor(cx - 1.15) && x <= Math.floor(cx + 1.15);
}

function isBank(x: number, y: number): boolean {
  if (isWater(x, y)) return false;
  const cx = riverCenterX(y);
  const dist = Math.abs(x - cx);
  return dist >= 1.15 && dist < 2.55;
}

function isMainRoad(x: number, y: number): boolean {
  if (y === 6 && x >= 3 && x <= 34) return true;
  if (x === 11 && y >= 6 && y <= 16) return true;
  if (x === 15 && y >= 6 && y <= 12) return true;
  if (y === 12 && x >= 11 && x <= 15) return true;
  if (y === 8 && x >= 21 && x <= 32) return true;
  if (x === 26 && y >= 8 && y <= 14) return true;
  return false;
}

export class WorldView {
  private readonly ground = new Map<string, Phaser.GameObjects.Image>();
  private readonly props: Phaser.GameObjects.GameObject[] = [];
  private readonly entitySprites = new Map<string, Phaser.GameObjects.Image>();
  private readonly entityShadows = new Map<string, Phaser.GameObjects.Image>();
  private readonly overlays = new Map<string, Phaser.GameObjects.Image>();
  private ghost: Phaser.GameObjects.Image | null = null;
  private selectRing: Phaser.GameObjects.Image | null = null;
  private hoverTile: Vec2 | null = null;
  private clouds: Phaser.GameObjects.Image[] = [];
  private foam: Phaser.GameObjects.Image[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly sim: GameSimulation,
  ) {
    scene.cameras.main.setBackgroundColor(SKY);
    this.buildTerrain();
    this.scatterEnvironment();
    this.spawnClouds();
    this.spawnFoam();
    const cam = scene.cameras.main;
    // Pull back slightly so more of the valley reads like the concept target.
    const center = isoToScreen(18, 12);
    cam.centerOn(center.x, center.y - 10);
    cam.setZoom(0.82);
  }

  private tileKey(x: number, y: number): string {
    return `${x},${y}`;
  }

  private terrainKey(x: number, y: number): string {
    if (isWater(x, y)) {
      const h = hash(x, y) % 3;
      return h === 0 ? 'tile_water' : h === 1 ? 'tile_water_n' : 'tile_river';
    }

    if (isBank(x, y)) {
      const h = hash(x, y);
      // Mix bank variants with occasional grass/dirt for organic edges.
      if (h % 7 === 0) return h % 2 === 0 ? 'tile_grass' : 'tile_grass_alt';
      if (h % 5 === 0) return 'tile_dirt';
      return h % 2 === 0 ? 'tile_bank' : 'tile_bank_ew';
    }

    // Main loop roads (asphalt)
    if (y === 6 && x >= 3 && x <= 34) {
      if (x === 11 || x === 15) return 'tile_crossroad';
      return hash(x, y) % 4 === 0 ? 'tile_road_ew' : 'tile_road';
    }
    if (x === 11 && y >= 6 && y <= 16) return 'tile_road_ns';
    if (x === 15 && y >= 6 && y <= 12) return 'tile_road_ns';
    if (y === 12 && x >= 11 && x <= 15) return 'tile_road_ew';
    // Site B access
    if (y === 8 && x >= 21 && x <= 32) return 'tile_road_ew';
    if (x === 26 && y >= 8 && y <= 14) return 'tile_road_ns';

    // Service / dirt pads near office
    if (x >= 4 && x <= 7 && y >= 5 && y <= 7) return 'tile_dirt';

    if (!inRect(x, y, SITE_A) && !inRect(x, y, SITE_B) && hash(x, y) % 11 === 0) {
      return 'tile_dirt';
    }

    return hash(x, y) % 2 === 0 ? 'tile_grass' : 'tile_grass_alt';
  }

  /** Fake valley elevation: hills on far edges, lower near river. */
  private heightAt(x: number, y: number): number {
    if (isWater(x, y) || isBank(x, y)) return 0;
    const edge =
      Math.max(0, 3 - x) +
      Math.max(0, 3 - y) +
      Math.max(0, x - (WORLD_W - 4)) +
      Math.max(0, y - (WORLD_H - 4));
    const ridge = Math.max(0, 6 - Math.abs(y - 1)) * 0.35;
    return Math.min(5, edge * 0.85 + ridge);
  }

  private buildTerrain(): void {
    for (let y = 0; y < WORLD_H; y++) {
      for (let x = 0; x < WORLD_W; x++) {
        const screen = isoToScreen(x, y);
        const elev = this.heightAt(x, y);
        const key = this.terrainKey(x, y);
        // cliff riser for elevated tiles
        if (elev >= 1.2 && !key.startsWith('tile_water')) {
          const riser = this.scene.add.graphics();
          const cx = screen.x;
          const cy = screen.y - elev * 5;
          riser.fillStyle(GRASS_DEEP, 0.95);
          riser.beginPath();
          riser.moveTo(cx - 40, cy);
          riser.lineTo(cx, cy + 20);
          riser.lineTo(cx, cy + 20 + elev * 5);
          riser.lineTo(cx - 40, cy + elev * 5);
          riser.closePath();
          riser.fillPath();
          riser.fillStyle(0x2a5a1a, 0.95);
          riser.beginPath();
          riser.moveTo(cx + 40, cy);
          riser.lineTo(cx, cy + 20);
          riser.lineTo(cx, cy + 20 + elev * 5);
          riser.lineTo(cx + 40, cy + elev * 5);
          riser.closePath();
          riser.fillPath();
          riser.setDepth(depthFor(x, y, -6));
          this.props.push(riser);
        }
        const img = this.scene.add.image(screen.x, screen.y - elev * 5, key);
        img.setDepth(depthFor(x, y, -5));
        this.ground.set(this.tileKey(x, y), img);
      }
    }
    this.refreshLockedTiles();
  }

  private addProp(tex: string, x: number, y: number, yOff = 0, depthBias = 2, scale = 1): void {
    const s = isoToScreen(x, y);
    const elev = this.heightAt(x, y);
    const baseY = s.y - elev * 5;
    // Grounding shadow for props (trees, buildings, vehicles)
    if (tex !== 'fence' && tex !== 'foam' && tex !== 'cloud' && tex !== 'tile_bridge') {
      const sh = this.scene.add.image(s.x - 6, baseY + 8, 'shadow_blob');
      const treeish = tex.startsWith('tree') || tex === 'bush';
      sh.setScale(treeish ? 0.55 * scale : 0.85 * scale, treeish ? 0.35 * scale : 0.5 * scale);
      sh.setAlpha(0.5);
      sh.setDepth(depthFor(x, y, depthBias - 1));
      this.props.push(sh);
    }
    const img = this.scene.add.image(s.x, baseY + yOff, tex);
    img.setScale(scale);
    img.setDepth(depthFor(x, y, depthBias));
    this.props.push(img);
  }

  /** Draw sagging steel cables once between pylon tops. */
  private drawPowerLines(
    pylons: Array<{ x: number; y: number; yOff: number; scale: number }>,
  ): void {
    const g = this.scene.add.graphics();
    g.setDepth(depthFor(20, 4, 7));
    // Thin dark steel cables (concept: transmission spans)
    g.lineStyle(1.25, STEEL_DARK, 0.92);

    for (let i = 0; i < pylons.length - 1; i++) {
      const a = pylons[i];
      const b = pylons[i + 1];
      const sa = isoToScreen(a.x, a.y);
      const sb = isoToScreen(b.x, b.y);
      // Approximate cross-arm height relative to image anchor
      const ax = sa.x;
      const ay = sa.y + a.yOff - 52 * a.scale;
      const bx = sb.x;
      const by = sb.y + b.yOff - 52 * b.scale;
      const midX = (ax + bx) / 2;
      const midY = (ay + by) / 2 + 14; // slight sag
      // Three parallel conductors with small vertical offset
      for (let c = 0; c < 3; c++) {
        const dy = (c - 1) * 4;
        g.beginPath();
        g.moveTo(ax - 8 + c * 8, ay + dy);
        g.lineTo(midX - 4 + c * 4, midY + dy);
        g.lineTo(bx - 8 + c * 8, by + dy);
        g.strokePath();
      }
    }
    this.props.push(g);
  }

  private scatterEnvironment(): void {
    // Bridge across river on main road (y=6 crossing)
    {
      const s = isoToScreen(19, 6);
      const bridge = this.scene.add.image(s.x, s.y - 8, 'tile_bridge');
      bridge.setDepth(depthFor(19, 6, 6));
      this.props.push(bridge);
    }

    // Tall industrial towers as stand-ins for transmission structures
    const pylons: Array<{ x: number; y: number; yOff: number; scale: number }> = [
      { x: 10, y: 2, yOff: -55, scale: 0.45 },
      { x: 14, y: 3, yOff: -55, scale: 0.5 },
      { x: 22, y: 4, yOff: -55, scale: 0.45 },
      { x: 28, y: 3, yOff: -55, scale: 0.4 },
    ];
    for (const p of pylons) {
      this.addProp('chimney', p.x, p.y, p.yOff, 8, p.scale);
    }
    this.drawPowerLines(pylons);
    this.addProp('water_tower', 13, 4, -40, 7, 0.5);
    this.addProp('tank', 14, 5, -28, 6, 0.45);

    // Maintenance yard near office
    this.addProp('yard', 5, 8, -24, 5, 0.85);
    this.addProp('container', 6, 9, -18, 5, 0.7);

    // Decorative starter solar rows (visual density matching concept farm)
    const demoRows: Array<[number, number]> = [
      [8, 10],
      [9, 11],
      [10, 12],
      [11, 10],
      [12, 11],
    ];
    for (const [x, y] of demoRows) {
      this.addProp('pv_bargain', x, y, -28, 5, 0.42);
    }

    // Decorative vehicles — office / yard / substation / Site B access
    this.addProp('van', 6, 6, -10, 7);
    this.addProp('truck', 5, 7, -10, 7, 0.95);
    this.addProp('van', 7, 5, -10, 7, 0.9);
    this.addProp('truck', 13, 7, -10, 7);
    this.addProp('van', 14, 5, -10, 7, 0.92);
    this.addProp('truck', 12, 11, -10, 7, 0.88);
    this.addProp('van', 27, 9, -10, 7);
    this.addProp('truck', 25, 10, -10, 7, 0.9);

    // Tech workers around office, yard, and substation
    this.addProp('tech', 7, 9, -14, 9, 0.95);
    this.addProp('tech', 6, 8, -14, 9, 0.9);
    this.addProp('tech', 8, 7, -14, 9, 0.92);
    this.addProp('tech', 13, 5, -14, 9, 0.95);
    this.addProp('tech', 14, 6, -14, 9, 0.88);
    this.addProp('tech', 12, 10, -14, 9, 0.9);
    this.addProp('tech', 15, 11, -14, 9, 0.85);

    // Full fence perimeter around Site A meadow
    for (let x = SITE_A.x0; x < SITE_A.x1; x += 2) {
      this.addProp('fence', x, SITE_A.y0, -6, 3, 0.9);
      this.addProp('fence', x, SITE_A.y1 - 1, -6, 3, 0.9);
    }
    for (let y = SITE_A.y0 + 1; y < SITE_A.y1 - 1; y += 2) {
      this.addProp('fence', SITE_A.x0, y, -6, 3, 0.85);
      this.addProp('fence', SITE_A.x1 - 1, y, -6, 3, 0.85);
    }

    // Dense pine forests — north hills and river sides (Site A stays clear)
    const pines: Array<[number, number, boolean]> = [];
    for (let x = 0; x < WORLD_W; x++) {
      for (let y = 0; y < WORLD_H; y++) {
        if (isWater(x, y) || isBank(x, y)) continue;
        if (isMainRoad(x, y)) continue;
        if (inRect(x, y, SITE_A) || inRect(x, y, SITE_B)) continue;
        // Keep a thin clear strip beside Site A fence for readability
        if (x >= SITE_A.x0 - 1 && x <= SITE_A.x1 && y >= SITE_A.y0 - 1 && y <= SITE_A.y1) {
          continue;
        }
        const h = hash(x, y);
        const edge = x < 3 || y < 3 || x > 36 || y > 24;
        const threshold = edge ? 320 : 140;
        if (h % 1000 < threshold) {
          pines.push([x, y, h % 3 === 0]);
        }
      }
    }
    for (const [x, y, big] of pines) {
      const h = hash(x, y);
      const key =
        h % 5 === 0
          ? 'tree_deciduous'
          : h % 4 === 0
            ? 'tree_round'
            : h % 3 === 0
              ? 'tree_sm_0'
              : big
                ? 'tree_big'
                : 'tree';
      this.addProp(key, x, y, big ? -36 : -28, 3, big ? 1.05 : 0.95);
    }

    // Rocks along river banks + occasional props in the water edge
    for (let y = 1; y < WORLD_H; y++) {
      for (let x = 0; x < WORLD_W; x++) {
        if (!isBank(x, y) && !isWater(x, y)) continue;
        const h = hash(x, y);
        if (isBank(x, y) && h % 3 === 0) {
          this.addProp('rock', x, y, -4, 2, 0.85 + (h % 3) * 0.08);
        }
        // Occasional rocks sitting in shallow water / foam edge
        if (isWater(x, y) && h % 7 === 0 && y !== 6) {
          this.addProp('rock', x, y, -2, 1, 0.7 + (h % 2) * 0.1);
        }
      }
    }

    // Bush / rock clusters at meadow–forest transitions
    const clusters: Array<[number, number]> = [
      [3, 4],
      [3, 10],
      [3, 15],
      [8, 3],
      [16, 3],
      [17, 14],
      [18, 16],
      [21, 5],
      [21, 14],
      [34, 7],
      [34, 14],
      [30, 5],
      [2, 20],
      [10, 18],
      [24, 18],
      [36, 12],
    ];
    for (const [cx, cy] of clusters) {
      if (inRect(cx, cy, SITE_A)) continue;
      const h = hash(cx, cy);
      this.addProp('tree_round', cx, cy, -12, 3, 0.85 + (h % 3) * 0.08);
      if (h % 2 === 0) this.addProp('rock', cx + 1, cy, -4, 2, 0.8);
      if (h % 3 === 0) this.addProp('bush', cx, cy + 1, -10, 3, 0.75);
      if (h % 5 === 0) this.addProp('tree_round', cx - 1, cy + 1, -12, 3, 0.7);
    }
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

  private spawnFoam(): void {
    for (let y = 1; y < WORLD_H; y += 1) {
      if (hash(19, y) % 3 !== 0) continue;
      const cx = riverCenterX(y);
      const s = isoToScreen(cx, y);
      const foam = this.scene.add.image(s.x, s.y - 4, 'foam');
      foam.setDepth(depthFor(Math.floor(cx), y, 1));
      foam.setAlpha(0.45);
      foam.setScale(0.7 + (hash(y, 3) % 40) / 100);
      this.foam.push(foam);
      this.props.push(foam);
    }
  }

  refreshLockedTiles(): void {
    const snap = this.sim.snapshot();
    const siteB = snap.plots.find((p) => p.id === 'site_b');
    for (const [key, img] of this.ground) {
      const [xs, ys] = key.split(',');
      const x = Number(xs);
      const y = Number(ys);
      const inSiteB = inRect(x, y, SITE_B);
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
    // Soft alpha pulse on water / river tiles
    const pulse = 0.94 + Math.sin(this.scene.time.now / 700) * 0.06;
    for (const [, img] of this.ground) {
      const k = img.texture.key;
      if (k.startsWith('tile_water') || k.startsWith('tile_river')) {
        img.setAlpha(pulse);
      }
    }
    for (let i = 0; i < this.foam.length; i++) {
      const f = this.foam[i];
      f.x += Math.sin(this.scene.time.now / 800 + i) * 0.15;
      f.setAlpha(0.35 + Math.sin(this.scene.time.now / 500 + i) * 0.2);
    }

    const seen = new Set<string>();

    for (const eq of snapshot.equipment) {
      seen.add(eq.id);
      const def = EQUIPMENT[eq.kind];
      const tx = eq.tile.x + def.footprint.x / 2 - 0.5;
      const ty = eq.tile.y + def.footprint.y / 2 - 0.5;
      const elev = this.heightAt(Math.floor(tx), Math.floor(ty));
      const anchor = isoToScreen(tx, ty);
      const yOff = -14 - elev * 5;
      let shadow = this.entityShadows.get(eq.id);
      if (!shadow) {
        shadow = this.scene.add.image(anchor.x - 6, anchor.y + 10 - elev * 5, 'shadow_blob');
        this.entityShadows.set(eq.id, shadow);
      }
      const shadowScale = isPv(eq.kind) ? 1.6 : eq.kind === 'office' || eq.kind === 'substation' ? 1.8 : 1.1;
      shadow.setPosition(anchor.x - 10, anchor.y + 14 - elev * 5);
      shadow.setScale(shadowScale, shadowScale * 0.55);
      shadow.setDepth(depthFor(eq.tile.x, eq.tile.y, 3));
      shadow.setAlpha(0.7);

      let sprite = this.entitySprites.get(eq.id);
      if (!sprite) {
        sprite = this.scene.add.image(anchor.x, anchor.y + yOff, textureFor(eq.kind));
        this.entitySprites.set(eq.id, sprite);
      }
      sprite.setTexture(textureFor(eq.kind));
      sprite.setPosition(anchor.x, anchor.y + yOff);
      sprite.setDepth(depthFor(eq.tile.x, eq.tile.y, 5));
      sprite.setScale(isPv(eq.kind) ? 1.2 : 1);
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
        this.entityShadows.get(id)?.destroy();
        this.entityShadows.delete(id);
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
