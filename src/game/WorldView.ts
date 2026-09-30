import Phaser from 'phaser';
import { EQUIPMENT } from '../content/equipment';
import type { GameSimulation } from '../simulation/GameSimulation';
import type { EquipmentKind, GameSnapshot, Vec2 } from '../simulation/types';
import { depthFor, isoToScreen, screenToIso, TILE_H } from './iso';
const SKY = 0x8ec8ef;
const STEEL_DARK = 0x5a6370;

/** Earth-tone cliff faces — avoid bright green wedges that clash with grass tiles. */
const CLIFF_FACE_W = 0x3d3428;
const CLIFF_FACE_E = 0x4a4032;

type AmbientMotion = {
  sprite: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics;
  baseX: number;
  baseY: number;
  phase: number;
  amp: number;
  period: number;
  drift?: number;
};

type SkyBird = {
  g: Phaser.GameObjects.Graphics;
  x: number;
  y: number;
  vx: number;
  wing: number;
};

type PowerLineMid = { x: number; y: number; depth: number };

type DustMote = {
  dot: Phaser.GameObjects.Arc;
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
};

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
  private readonly lockedOverlays = new Map<string, Phaser.GameObjects.Image>();
  private readonly props: Phaser.GameObjects.GameObject[] = [];
  private readonly entitySprites = new Map<string, Phaser.GameObjects.Image>();
  private readonly entityShadows = new Map<string, Phaser.GameObjects.Image>();
  private readonly overlays = new Map<string, Phaser.GameObjects.Image>();
  private ghost: Phaser.GameObjects.Image | null = null;
  private ghostPad: Phaser.GameObjects.Image | null = null;
  private selectRing: Phaser.GameObjects.Image | null = null;
  private hoverHighlight: Phaser.GameObjects.Image | null = null;
  private hoverTile: Vec2 | null = null;
  private pointerInWorld = true;
  private readonly gravelPads = new Map<string, Phaser.GameObjects.Image>();
  private readonly faultHalos = new Map<string, Phaser.GameObjects.Image>();
  private readonly buildRings = new Map<string, Phaser.GameObjects.Image>();
  private readonly commissionPuffs = new Map<string, Phaser.GameObjects.Graphics>();
  private readonly prevConstruction = new Map<string, number>();
  private readonly prevCommissioned = new Map<string, boolean>();
  private clouds: Phaser.GameObjects.Image[] = [];
  private foam: Phaser.GameObjects.Image[] = [];
  private weatherVeil: Phaser.GameObjects.Rectangle | null = null;
  private sunGlare: Phaser.GameObjects.Ellipse | null = null;
  private readonly windowGlows: Phaser.GameObjects.Rectangle[] = [];
  private rainDrops: Phaser.GameObjects.Rectangle[] = [];
  private ambientMotion: AmbientMotion[] = [];
  private birds: SkyBird[] = [];
  private readonly powerLineMidpoints: PowerLineMid[] = [];
  private powerSparks: Phaser.GameObjects.Graphics | null = null;
  private dustMotes: DustMote[] = [];
  private readonly staffLastTileX = new Map<string, number>();
  private readonly staffFacing = new Map<string, number>();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly sim: GameSimulation,
  ) {
    scene.cameras.main.setBackgroundColor(SKY);
    this.spawnMountains();
    this.buildTerrain();
    this.scatterEnvironment();
    this.spawnClouds();
    this.spawnBirds();
    this.spawnFoam();
    this.drawParkingMarks();
    this.spawnDustMotes();
    this.powerSparks = scene.add.graphics();
    this.powerSparks.setDepth(850);
    this.initWindowGlows();
    this.weatherVeil = scene.add.rectangle(0, 0, 4000, 3000, 0x0a1a30, 0);
    this.weatherVeil.setOrigin(0.5, 0.5);
    this.weatherVeil.setDepth(900);
    this.weatherVeil.setScrollFactor(0);
    this.sunGlare = scene.add.ellipse(0, 0, 720, 520, 0xffe8a0, 0);
    this.sunGlare.setOrigin(0.5, 0.5);
    this.sunGlare.setDepth(895);
    this.sunGlare.setScrollFactor(0);
    this.sunGlare.setBlendMode(Phaser.BlendModes.ADD);
    this.sunGlare.setVisible(false);
    // Seed a few rain streaks (hidden until wet weather)
    for (let i = 0; i < 36; i++) {
      const drop = scene.add.rectangle(
        Phaser.Math.Between(40, 1220),
        Phaser.Math.Between(20, 700),
        2,
        Phaser.Math.Between(8, 16),
        0xb8d8ff,
        0.55,
      );
      drop.setDepth(910);
      drop.setScrollFactor(0);
      drop.setVisible(false);
      this.rainDrops.push(drop);
    }
    const cam = scene.cameras.main;
    // Pull back slightly so more of the valley reads like the concept target.
    const center = isoToScreen(18, 12);
    // Frame slightly higher so snow-capped mountains read in the opening viewport.
    cam.centerOn(center.x, center.y - 38);
    cam.setZoom(0.82);
    cam.setBounds(-200, -200, 2200, 1600);
  }

  private tileKey(x: number, y: number): string {
    return `${x},${y}`;
  }

  /** Pick river/water tile variant from neighbor flow + meander tangent. */
  private riverTileKey(x: number, y: number): string {
    const h = hash(x, y);
    const cx = riverCenterX(y);
    const nearEdge = Math.abs(x - cx) > 0.55;
    if (nearEdge && h % 3 === 0) return `tile_water_foam_${h % 3}`;

    const wN = isWater(x, y - 1);
    const wS = isWater(x, y + 1);
    const wE = isWater(x + 1, y);
    const wW = isWater(x - 1, y);
    const ewCount = (wE ? 1 : 0) + (wW ? 1 : 0);
    const nsCount = (wN ? 1 : 0) + (wS ? 1 : 0);
    const meanderEw = Math.abs(riverCenterX(y + 1) - riverCenterX(y - 1)) > 0.25;
    const runsEw = ewCount > nsCount || (ewCount === nsCount && meanderEw);

    if (runsEw) {
      if (h % 5 === 0) return 'tile_water_n';
      if (h % 3 === 0) return 'tile_water';
      return h % 2 === 0 ? 'tile_river_ew' : 'tile_water';
    }
    if (h % 5 === 0) return 'tile_river_ew';
    if (h % 3 === 0) return 'tile_water_n';
    return h % 2 === 0 ? 'tile_river' : 'tile_water';
  }

  private smallTreeKey(h: number): string {
    return `tree_sm_${h % 4}`;
  }

  private terrainKey(x: number, y: number): string {
    if (isWater(x, y)) {
      return this.riverTileKey(x, y);
    }

    if (isBank(x, y)) {
      const h = hash(x, y);
      // Sandy beach shelves on the warmer sun-facing banks; muddy banks elsewhere.
      if (h % 4 === 0) return 'tile_beach';
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

    // Occasional dirt wear speckles beside main roads
    if (
      !inRect(x, y, SITE_A) &&
      !inRect(x, y, SITE_B) &&
      (isMainRoad(x - 1, y) ||
        isMainRoad(x + 1, y) ||
        isMainRoad(x, y - 1) ||
        isMainRoad(x, y + 1))
    ) {
      const h = hash(x, y);
      if (h % 9 === 0 || h % 13 === 0) return 'tile_dirt';
    }

    // Service / dirt pads near office
    if (x >= 4 && x <= 7 && y >= 5 && y <= 7) return 'tile_dirt';

    // Rolling hill crowns on elevated far edges
    const elev = this.heightAt(x, y);
    if (elev >= 2.4 && !inRect(x, y, SITE_A) && !inRect(x, y, SITE_B)) {
      if (hash(x, y) % 3 === 0) return 'tile_hill';
    }

    if (!inRect(x, y, SITE_A) && !inRect(x, y, SITE_B) && hash(x, y) % 11 === 0) {
      return 'tile_dirt';
    }

    const h = hash(x, y);
    // Prefer higher-detail landscape grass where available; fall back to roads pack.
    return `tile_grass_hd_${h % 8}`;
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

  /** Draw cliff faces only where a neighbor drops — earth tones, not green wedges. */
  private drawCliffRisers(x: number, y: number, elev: number, key: string): void {
    if (elev < 1.0 || key.startsWith('tile_water') || key.startsWith('tile_river')) return;

    const screen = isoToScreen(x, y);
    const cx = screen.x;
    const cy = screen.y - elev * 5;
    const westDrop = elev - this.heightAt(x - 1, y);
    const eastDrop = elev - this.heightAt(x + 1, y);
    if (westDrop < 0.55 && eastDrop < 0.55) return;

    const riser = this.scene.add.graphics();
    if (westDrop >= 0.55) {
      const h = Math.min(28, westDrop * 6);
      riser.fillStyle(CLIFF_FACE_W, 0.88);
      riser.beginPath();
      riser.moveTo(cx - 40, cy);
      riser.lineTo(cx, cy + 20);
      riser.lineTo(cx, cy + 20 + h);
      riser.lineTo(cx - 40, cy + h);
      riser.closePath();
      riser.fillPath();
      riser.fillStyle(0x2e2820, 0.35);
      riser.fillRect(cx - 38, cy + h - 4, 36, 3);
    }
    if (eastDrop >= 0.55) {
      const h = Math.min(28, eastDrop * 6);
      riser.fillStyle(CLIFF_FACE_E, 0.86);
      riser.beginPath();
      riser.moveTo(cx + 40, cy);
      riser.lineTo(cx, cy + 20);
      riser.lineTo(cx, cy + 20 + h);
      riser.lineTo(cx + 40, cy + h);
      riser.closePath();
      riser.fillPath();
    }
    riser.setDepth(depthFor(x, y, -6));
    this.props.push(riser);
  }

  private buildTerrain(): void {
    for (let y = 0; y < WORLD_H; y++) {
      for (let x = 0; x < WORLD_W; x++) {
        const screen = isoToScreen(x, y);
        const elev = this.heightAt(x, y);
        const key = this.terrainKey(x, y);
        this.drawCliffRisers(x, y, elev, key);
        const img = this.scene.add.image(screen.x, screen.y - elev * 5, key);
        img.setDepth(depthFor(x, y, -5));
        this.ground.set(this.tileKey(x, y), img);
      }
    }
    this.refreshLockedTiles();
  }

  private addProp(
    tex: string,
    x: number,
    y: number,
    yOff = 0,
    depthBias = 2,
    scale = 1,
    motion: 'bob' | 'sway' | null = null,
  ): void {
    const s = isoToScreen(x, y);
    const elev = this.heightAt(x, y);
    const baseY = s.y - elev * 5;
    // Grounding shadow for props (trees, buildings, vehicles). Skip fences / foam / clouds.
    const skipShadow =
      tex === 'fence' ||
      tex === 'fence_short' ||
      tex.startsWith('foam') ||
      tex === 'cloud' ||
      tex === 'tile_bridge';
    if (!skipShadow) {
      const sh = this.scene.add.image(s.x - 8, baseY + 10, 'shadow_blob');
      const treeish = tex.startsWith('tree') || tex === 'bush';
      sh.setScale(treeish ? 0.7 * scale : 1.05 * scale, treeish ? 0.4 * scale : 0.55 * scale);
      sh.setAlpha(0.75);
      sh.setDepth(depthFor(x, y, depthBias - 1));
      this.props.push(sh);
    }
    const img = this.scene.add.image(s.x, baseY + yOff, tex);
    img.setScale(scale);
    img.setDepth(depthFor(x, y, depthBias));
    this.props.push(img);
    if (motion) {
      this.ambientMotion.push({
        sprite: img,
        baseX: s.x,
        baseY: baseY + yOff,
        phase: hash(x, y) * 0.01,
        amp: motion === 'bob' ? 1.4 : 0.8,
        period: motion === 'bob' ? 920 + (hash(x, y) % 400) : 1400,
        drift: motion === 'sway' ? 0.15 : undefined,
      });
    }
  }

  /** Draw sagging steel cables — each span depth matches its midpoint tile. */
  private drawPowerLines(
    pylons: Array<{ x: number; y: number; yOff: number; scale: number }>,
  ): void {
    for (let i = 0; i < pylons.length - 1; i++) {
      const a = pylons[i];
      const b = pylons[i + 1];
      const midTileX = (a.x + b.x) / 2;
      const midTileY = (a.y + b.y) / 2;
      const g = this.scene.add.graphics();
      g.setDepth(depthFor(midTileX, midTileY, 7));
      g.lineStyle(1.25, STEEL_DARK, 0.92);

      const sa = isoToScreen(a.x, a.y);
      const sb = isoToScreen(b.x, b.y);
      const ax = sa.x;
      const ay = sa.y + a.yOff - 58 * a.scale;
      const bx = sb.x;
      const by = sb.y + b.yOff - 58 * b.scale;
      const midX = (ax + bx) / 2;
      const midY = (ay + by) / 2 + 14;
      this.powerLineMidpoints.push({
        x: midX,
        y: midY,
        depth: depthFor(midTileX, midTileY, 7),
      });
      for (let c = 0; c < 3; c++) {
        const dy = (c - 1) * 4;
        g.beginPath();
        g.moveTo(ax - 8 + c * 8, ay + dy);
        g.lineTo(midX - 4 + c * 4, midY + dy);
        g.lineTo(bx - 8 + c * 8, by + dy);
        g.strokePath();
      }
      this.props.push(g);
    }
  }

  /** White dashed parking bays on the office dirt pad. */
  private drawParkingMarks(): void {
    const g = this.scene.add.graphics();
    g.setDepth(depthFor(5, 6, 1));
    const bays: Array<[number, number]> = [
      [4.3, 5.4],
      [5.3, 5.7],
      [6.3, 6.0],
    ];
    for (const [tx, ty] of bays) {
      const s = isoToScreen(tx, ty);
      const elev = this.heightAt(Math.floor(tx), Math.floor(ty));
      const cx = s.x;
      const cy = s.y - elev * 5 + 4;
      // Iso-aligned bay rectangle (diamond-ish footprint)
      const w = 22;
      const h = 14;
      g.lineStyle(1.2, 0xffffff, 0.72);
      for (let dash = 0; dash < 4; dash++) {
        const t0 = dash / 4;
        const t1 = (dash + 0.55) / 4;
        const x0 = cx - w / 2 + (w * t0);
        const x1 = cx - w / 2 + (w * t1);
        g.beginPath();
        g.moveTo(x0, cy - h / 2);
        g.lineTo(x1, cy - h / 2);
        g.strokePath();
        g.beginPath();
        g.moveTo(x0, cy + h / 2);
        g.lineTo(x1, cy + h / 2);
        g.strokePath();
      }
      // Side lines (dashed)
      for (let dash = 0; dash < 3; dash++) {
        const t0 = dash / 3;
        const t1 = (dash + 0.5) / 3;
        const y0 = cy - h / 2 + h * t0;
        const y1 = cy - h / 2 + h * t1;
        g.beginPath();
        g.moveTo(cx - w / 2, y0);
        g.lineTo(cx - w / 2, y1);
        g.strokePath();
        g.beginPath();
        g.moveTo(cx + w / 2, y0);
        g.lineTo(cx + w / 2, y1);
        g.strokePath();
      }
      // Centre divider tick
      g.lineStyle(1, 0xffffff, 0.45);
      g.beginPath();
      g.moveTo(cx, cy - h / 2 + 2);
      g.lineTo(cx, cy + h / 2 - 2);
      g.strokePath();
    }
    this.props.push(g);
  }

  /** Screen-space dust motes — visible in daylight only. */
  private spawnDustMotes(): void {
    const count = 16;
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(60, 1180);
      const y = Phaser.Math.Between(80, 620);
      const gold = i % 3 === 0;
      const dot = this.scene.add.circle(x, y, 1.2 + (i % 2) * 0.4, gold ? 0xffe8a0 : 0xffffff, 0.18);
      dot.setDepth(880);
      dot.setScrollFactor(0);
      dot.setBlendMode(Phaser.BlendModes.ADD);
      this.dustMotes.push({
        dot,
        x,
        y,
        vx: 0.04 + (i % 5) * 0.012,
        vy: -0.02 - (i % 4) * 0.008,
        phase: i * 2.1,
      });
      this.props.push(dot);
    }
  }

  /** Low-density wildflowers along meadow fence lines and sparse interior. */
  private scatterMeadowWildflowers(): void {
    const sites = [SITE_A, SITE_B];
    for (const site of sites) {
      for (let x = site.x0; x < site.x1; x++) {
        const hN = hash(x, site.y0 - 1);
        if (hN % 4 === 0) {
          this.addProp(`flower_${hN % 2}`, x, site.y0 - 1, -5, 1, 0.5 + (hN % 3) * 0.06);
        }
        const hS = hash(x, site.y1);
        if (hS % 5 === 0) {
          this.addProp(`flower_${hS % 2}`, x, site.y1, -5, 1, 0.48 + (hS % 3) * 0.06);
        }
      }
      for (let y = site.y0; y < site.y1; y++) {
        const hW = hash(site.x0 - 1, y);
        if (hW % 4 === 0) {
          this.addProp(`flower_${hW % 2}`, site.x0 - 1, y, -5, 1, 0.52);
        }
        const hE = hash(site.x1, y);
        if (hE % 5 === 0) {
          this.addProp(`flower_${hE % 2}`, site.x1, y, -5, 1, 0.5);
        }
      }
      for (let y = site.y0 + 2; y < site.y1 - 2; y++) {
        for (let x = site.x0 + 2; x < site.x1 - 2; x++) {
          if (isMainRoad(x, y)) continue;
          const h = hash(x, y);
          if (h % 29 !== 0) continue;
          this.addProp(`flower_${h % 2}`, x, y, -4, 1, 0.42 + (h % 4) * 0.05);
        }
      }
    }
  }

  private spawnCommissionPuff(x: number, y: number, elev: number): void {
    const anchor = isoToScreen(x, y);
    const g = this.scene.add.graphics();
    g.setDepth(depthFor(x, y, 18));
    this.props.push(g);
    const key = `puff_${x}_${y}_${this.scene.time.now}`;
    this.commissionPuffs.set(key, g);
    const baseY = anchor.y - elev * 5 - 20;
    const born = this.scene.time.now;
    const tick = () => {
      const age = this.scene.time.now - born;
      if (age > 900) {
        g.destroy();
        this.commissionPuffs.delete(key);
        this.scene.events.off('update', tick);
        return;
      }
      const t = age / 900;
      g.clear();
      const alpha = (1 - t) * 0.55;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const r = 8 + t * 22 + i * 2;
        g.fillStyle(i % 2 === 0 ? 0xf5e6c8 : 0xffffff, alpha);
        g.fillCircle(anchor.x + Math.cos(a) * r, baseY + Math.sin(a) * r * 0.4 - t * 8, 3 + t * 2);
      }
      g.fillStyle(0xffe88a, alpha * 0.7);
      g.fillCircle(anchor.x, baseY - t * 6, 6 + t * 10);
    };
    this.scene.events.on('update', tick);
  }

  private scatterEnvironment(): void {
    // Bridge across river on main road (y=6 crossing)
    {
      const s = isoToScreen(19, 6);
      const bridge = this.scene.add.image(s.x, s.y - 8, 'tile_bridge');
      bridge.setDepth(depthFor(19, 6, 6));
      this.props.push(bridge);
    }

    // Lattice transmission pylons with sagging conductors
    const pylons: Array<{ x: number; y: number; yOff: number; scale: number }> = [
      { x: 10, y: 2, yOff: -52, scale: 0.58 },
      { x: 14, y: 3, yOff: -52, scale: 0.65 },
      { x: 22, y: 4, yOff: -52, scale: 0.58 },
      { x: 28, y: 3, yOff: -52, scale: 0.52 },
    ];
    for (const p of pylons) {
      this.addProp('pylon', p.x, p.y, p.yOff, 8, p.scale);
    }
    this.drawPowerLines(pylons);
    this.scatterMeadowWildflowers();
    this.addProp('water_tower', 13, 4, -40, 7, 0.5);
    this.addProp('tank', 14, 5, -28, 6, 0.45);

    // Maintenance yard near office — warehouse shed + small office_kit + container + yard kit
    this.addProp('warehouse', 4, 8, -30, 6, 0.72);
    this.addProp('office_kit', 3, 9, -20, 6, 0.52);
    this.addProp('yard', 5, 9, -24, 5, 0.85);
    this.addProp('container', 6, 9, -18, 5, 0.7);

    // Neighbor solar farm south of Site B (scenery only — keeps Site A clear for placement)
    const neighborRows: Array<[number, number]> = [
      [23, 18],
      [24, 19],
      [25, 20],
      [26, 18],
      [27, 19],
      [28, 20],
      [24, 21],
      [26, 21],
    ];
    for (const [x, y] of neighborRows) {
      this.addProp('pv_group', x, y, -22, 5, 0.72);
    }
    for (let x = 22; x <= 29; x += 1) {
      this.addProp('fence_short', x, 17, -4, 3, 0.72);
      this.addProp('fence_short', x, 22, -4, 3, 0.72);
    }
    for (let y = 18; y <= 21; y += 1) {
      this.addProp('fence_short', 22, y, -4, 3, 0.68);
      this.addProp('fence_short', 29, y, -4, 3, 0.68);
    }

    // Decorative vehicles — sky-keyed vans; subtle idle bob
    this.addProp('van', 6, 6, -10, 7, 0.85, 'bob');
    this.addProp('truck_delivery', 5, 7, -12, 7, 0.78, 'bob');
    this.addProp('van', 7, 5, -10, 7, 0.8, 'bob');
    this.addProp('van', 14, 5, -10, 7, 0.82, 'bob');
    this.addProp('van', 27, 9, -10, 7, 0.8, 'bob');

    // Ambient techs near yard / substation only (sim staff are the interactive ones)
    this.addProp('tech', 6, 8, -14, 9, 0.85, 'sway');
    this.addProp('tech', 13, 5, -14, 9, 0.88, 'sway');
    this.addProp('tech', 14, 6, -14, 9, 0.82, 'sway');

    // Full fence perimeter around Site A meadow (tighter spacing)
    for (let x = SITE_A.x0; x < SITE_A.x1; x += 1) {
      this.addProp('fence', x, SITE_A.y0, -6, 3, 0.86);
      this.addProp('fence', x, SITE_A.y1 - 1, -6, 3, 0.86);
    }
    for (let y = SITE_A.y0 + 1; y < SITE_A.y1 - 1; y += 1) {
      this.addProp('fence_short', SITE_A.x0, y, -4, 3, 0.8);
      this.addProp('fence_short', SITE_A.x1 - 1, y, -4, 3, 0.8);
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
        // Dense concept-style forests on hills; still leave meadow interiors clear.
        const threshold = edge ? 620 : 280;
        if (h % 1000 < threshold) {
          pines.push([x, y, h % 3 === 0]);
        }
      }
    }
    for (const [x, y, big] of pines) {
      const h = hash(x, y);
      const key =
        h % 7 === 0
          ? 'tree_deciduous'
          : h % 5 === 0
            ? 'tree_round'
            : h % 4 === 0
              ? this.smallTreeKey(h)
              : h % 3 === 0
                ? this.smallTreeKey(h + 1)
                : big
                  ? 'tree_big'
                  : h % 2 === 0
                    ? this.smallTreeKey(h + 2)
                    : 'tree';
      this.addProp(key, x, y, big ? -36 : -28, 3, big ? 1.05 : 0.95);
    }

    // Rocks along river banks + bush/rock clusters at water edges
    for (let y = 1; y < WORLD_H; y++) {
      for (let x = 0; x < WORLD_W; x++) {
        if (!isBank(x, y) && !isWater(x, y)) continue;
        const h = hash(x, y);
        if (isBank(x, y) && h % 2 === 0) {
          this.addProp('rock', x, y, -4, 2, 0.85 + (h % 3) * 0.08);
        }
        if (isBank(x, y) && (h % 6 === 0 || h % 7 === 1)) {
          this.addProp('bush', x, y, -10, 3, 0.72 + (h % 4) * 0.06);
          if (h % 2 === 0) {
            this.addProp('rock', x + (h % 3 === 0 ? 1 : -1), y, -4, 2, 0.78);
          }
        }
        // Occasional rocks sitting in shallow water / foam edge
        if (isWater(x, y) && (h % 4 === 0 || h % 9 === 2) && y !== 6) {
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

  private spawnMountains(): void {
    // Soft sky gradient band so the backdrop isn't flat browser blue.
    const skyBand = this.scene.add.graphics();
    skyBand.fillGradientStyle(0xb8dcff, 0xb8dcff, 0x8ec8ef, 0x7eb0d8, 1);
    skyBand.fillRect(-400, -80, 2400, 280);
    skyBand.setDepth(-220);
    skyBand.setScrollFactor(0.02);
    this.props.push(skyBand);

    // Far snow-capped ridge behind the valley (concept backdrop).
    const mounts = [
      { key: 'mountain_0', x: 180, y: 82, scale: 1.55, a: 0.85 },
      { key: 'mountain_1', x: 480, y: 66, scale: 1.78, a: 0.9 },
      { key: 'mountain_2', x: 820, y: 76, scale: 1.61, a: 0.82 },
      { key: 'mountain_1', x: 1100, y: 92, scale: 1.38, a: 0.75 },
      { key: 'mountain_0', x: -40, y: 102, scale: 1.27, a: 0.7 },
    ];
    for (let i = 0; i < mounts.length; i++) {
      const m = mounts[i];
      const key = this.scene.textures.exists(m.key) ? m.key : 'tile_hill';
      const img = this.scene.add.image(m.x, m.y, key);
      img.setScale(m.scale);
      img.setAlpha(m.a);
      img.setDepth(-200 + i);
      img.setScrollFactor(0.08);
      this.props.push(img);
    }
  }

  private spawnClouds(): void {
    const variants = ['cloud', 'cloud_soft', 'cloud_wide'] as const;
    for (let i = 0; i < 10; i++) {
      const s = isoToScreen(4 + i * 5, 0 + (i % 2));
      const key = variants[i % variants.length];
      const tex = this.scene.textures.exists(key) ? key : 'cloud';
      const cloud = this.scene.add.image(s.x, s.y - 110 - (i % 4) * 18, tex);
      cloud.setAlpha(0.38 + (i % 5) * 0.1 + (hash(i, 7) % 12) / 100);
      cloud.setScale(0.62 + (i % 4) * 0.14 + (hash(i, 3) % 8) / 100);
      cloud.setDepth(-120 + i);
      cloud.setScrollFactor(0.15 + (i % 3) * 0.05);
      this.clouds.push(cloud);
      this.props.push(cloud);
    }
  }

  private spawnBirds(): void {
    for (let i = 0; i < 10; i++) {
      const g = this.scene.add.graphics();
      g.setDepth(-90);
      g.setScrollFactor(0.25);
      this.birds.push({
        g,
        x: 120 + i * 110,
        y: 50 + (i % 4) * 28,
        vx: 0.35 + (i % 3) * 0.14,
        wing: i * 1.7,
      });
      this.props.push(g);
    }
  }

  private drawBird(b: SkyBird, night: number): void {
    const flap = Math.sin(this.scene.time.now / 180 + b.wing) * 3;
    const alpha = night > 0.35 ? 0.15 : 0.45;
    b.g.clear();
    b.g.lineStyle(1.6, 0x2a3548, alpha);
    b.g.beginPath();
    b.g.moveTo(-5, flap);
    b.g.lineTo(0, -1);
    b.g.lineTo(5, flap);
    b.g.strokePath();
  }

  private spawnFoam(): void {
    // True froth strips along bank edges + bridge — not mini water diamonds.
    for (let y = 1; y < WORLD_H; y += 1) {
      if (hash(19, y) % 2 !== 0) continue;
      const cx = riverCenterX(y);
      for (const side of [-1.05, 1.05] as const) {
        const fx = cx + side;
        const s = isoToScreen(fx, y);
        const key = `foam_strip_${y % 3}`;
        const foam = this.scene.add.image(s.x, s.y - 1, this.scene.textures.exists(key) ? key : 'foam');
        foam.setDepth(depthFor(Math.floor(fx), y, 1));
        foam.setAlpha(0.5);
        foam.setScale(0.85 + (hash(y, Math.floor(side + 2)) % 20) / 100);
        this.foam.push(foam);
        this.props.push(foam);
      }
    }
    // Extra froth churn near the bridge crossing (y=6).
    const bridgeY = 6;
    const bridgeCx = riverCenterX(bridgeY);
    const bridgeOffsets = [-0.6, 0, 0.6, -1.2, 1.2];
    for (let i = 0; i < bridgeOffsets.length; i++) {
      const fx = bridgeCx + bridgeOffsets[i];
      const s = isoToScreen(fx, bridgeY);
      const key = `foam_strip_${i % 3}`;
      const foam = this.scene.add.image(s.x, s.y - 2, this.scene.textures.exists(key) ? key : 'foam');
      foam.setDepth(depthFor(Math.floor(fx), bridgeY, 2));
      foam.setAlpha(0.62);
      foam.setScale(0.95 + (i % 3) * 0.08);
      this.foam.push(foam);
      this.props.push(foam);
    }
  }

  /** Warm window rectangles near office / maintenance yard — visible at night. */
  private initWindowGlows(): void {
    const spots: Array<[number, number]> = [
      [5, 5],
      [6, 5],
      [4, 8],
      [5, 9],
    ];
    for (const [x, y] of spots) {
      const s = isoToScreen(x, y);
      const elev = this.heightAt(x, y);
      const glow = this.scene.add.rectangle(s.x + 6, s.y - elev * 5 - 26, 5, 7, 0xffe066, 0);
      glow.setDepth(depthFor(x, y, 9));
      this.windowGlows.push(glow);
      this.props.push(glow);
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
      const locked = inSiteB && siteB && !siteB.unlocked;

      if (locked) {
        if (img.texture.key === 'tile_locked') {
          img.setTexture(this.terrainKey(x, y));
        }
        let overlay = this.lockedOverlays.get(key);
        if (!overlay) {
          const screen = isoToScreen(x, y);
          const elev = this.heightAt(x, y);
          const hatchKey = this.scene.textures.exists('tile_locked_hatch')
            ? 'tile_locked_hatch'
            : 'tile_locked';
          overlay = this.scene.add.image(screen.x, screen.y - elev * 5, hatchKey);
          overlay.setDepth(depthFor(x, y, -3));
          this.lockedOverlays.set(key, overlay);
        }
        overlay.setVisible(true);
      } else {
        this.lockedOverlays.get(key)?.setVisible(false);
        if (img.texture.key === 'tile_locked') {
          img.setTexture(this.terrainKey(x, y));
        }
      }
    }
  }

  sync(snapshot: GameSnapshot): void {
    // Day/night + weather presentation (align world with HUD)
    const hour = snapshot.hour;
    const night =
      hour < 5.5 || hour > 20.5
        ? 0.48
        : hour < 7
          ? (7 - hour) / 1.5 * 0.4
          : hour > 18.5
            ? ((hour - 18.5) / 2) * 0.45
            : 0;
    let weatherAlpha = 0;
    let weatherColor = 0x0a1a30;
    if (snapshot.weather === 'overcast') {
      weatherAlpha = 0.18;
      weatherColor = 0x3a4a5a;
    } else if (snapshot.weather === 'rain' || snapshot.weather === 'hail') {
      weatherAlpha = 0.28;
      weatherColor = 0x1a3048;
    } else if (snapshot.weather === 'partly_cloudy') {
      weatherAlpha = 0.08;
      weatherColor = 0x4a6078;
    }
    const nightCap = night > 0.25 ? 0.5 : 0.72;
    const veilAlpha = Math.min(nightCap, night + weatherAlpha);
    if (this.weatherVeil) {
      this.weatherVeil.setFillStyle(weatherColor, veilAlpha);
      const cam = this.scene.cameras.main;
      // Size to viewport each frame — fixed scrollFactor 0, screen-space centre.
      const pad = 8;
      this.weatherVeil.setSize(cam.width + pad * 2, cam.height + pad * 2);
      this.weatherVeil.setPosition(cam.width / 2, cam.height / 2);
      this.weatherVeil.setVisible(veilAlpha > 0.02);
    }
    const peakSun =
      snapshot.weather === 'clear' && snapshot.irradiance >= 0.88 && night < 0.08;
    if (this.sunGlare) {
      const cam = this.scene.cameras.main;
      const glareAlpha = peakSun
        ? 0.1 + Math.sin(this.scene.time.now / 2200) * 0.035
        : 0;
      this.sunGlare.setPosition(cam.width * 0.72, cam.height * 0.16);
      this.sunGlare.setAlpha(glareAlpha);
      this.sunGlare.setVisible(glareAlpha > 0.02);
    }
    const nightGlow = night > 0.32;
    for (let i = 0; i < this.windowGlows.length; i++) {
      const glow = this.windowGlows[i];
      const pulse = 0.5 + Math.sin(this.scene.time.now / 850 + i * 1.4) * 0.22;
      glow.setAlpha(nightGlow ? pulse * 0.8 : 0);
    }
    const wet = snapshot.weather === 'rain' || snapshot.weather === 'hail';
    for (let i = 0; i < this.rainDrops.length; i++) {
      const d = this.rainDrops[i];
      d.setVisible(wet);
      if (!wet) continue;
      d.y += 6 + (i % 4);
      d.x -= 1.2;
      if (d.y > 720) {
        d.y = -10;
        d.x = Phaser.Math.Between(20, 1260);
      }
      d.setAlpha(snapshot.weather === 'hail' ? 0.75 : 0.45);
    }
    // Sky colour shifts with time of day
    const skyColor =
      night > 0.35
        ? 0x1a2a48
        : night > 0.1
          ? 0x5a7aaa
          : snapshot.weather === 'overcast' || snapshot.weather === 'rain'
            ? 0x7a92a8
            : SKY;
    this.scene.cameras.main.setBackgroundColor(skyColor);

    const cam = this.scene.cameras.main;
    // gentle cloud drift (parallax scrollFactor already set)
    for (let i = 0; i < this.clouds.length; i++) {
      const c = this.clouds[i];
      c.x += 0.06 + i * 0.012;
      if (c.x > cam.width + 200) c.x = -220;
      c.setAlpha(
        night > 0.3
          ? 0.16 + (i % 4) * 0.05
          : 0.4 + (i % 5) * 0.09 + Math.sin(this.scene.time.now / 2800 + i) * 0.07,
      );
    }
    for (const b of this.birds) {
      b.x += b.vx;
      if (b.x > cam.width + 40) {
        b.x = -30;
        b.y = 40 + (hash(Math.floor(b.x), Math.floor(b.y)) % 80);
      }
      b.g.setPosition(b.x, b.y);
      this.drawBird(b, night);
    }
    for (const m of this.ambientMotion) {
      const t = this.scene.time.now;
      const bob = Math.sin(t / m.period + m.phase) * m.amp;
      m.sprite.y = m.baseY + bob;
      if (m.drift) {
        m.sprite.x = m.baseX + Math.sin(t / (m.period * 1.3) + m.phase) * m.drift;
      }
    }
    // Water shimmer: pulse alpha + gentle cyan/blue tint cycle
    const t = this.scene.time.now;
    const pulse = 0.9 + Math.sin(t / 550) * 0.1;
    for (const [key, img] of this.ground) {
      const k = img.texture.key;
      if (k.startsWith('tile_water') || k.startsWith('tile_river')) {
        img.setAlpha(pulse);
        const [xs, ys] = key.split(',');
        const phase = (Number(xs) + Number(ys) * 3) * 0.4;
        const shimmer = 0.5 + 0.5 * Math.sin(t / 420 + phase);
        img.setTint(
          Phaser.Display.Color.GetColor(
            Math.floor(90 + shimmer * 40),
            Math.floor(160 + shimmer * 50),
            Math.floor(210 + shimmer * 40),
          ),
        );
      } else if (k.startsWith('tile_grass_hd_')) {
        // Micro hue jitter so meadows don't look like one stamped tile
        const [xs, ys] = key.split(',');
        const h = hash(Number(xs), Number(ys));
        const gBoost = (h % 20) - 8;
        img.setTint(
          Phaser.Display.Color.GetColor(110 + gBoost, 170 + gBoost, 70 + (h % 12)),
        );
      }
    }
    for (let i = 0; i < this.foam.length; i++) {
      const f = this.foam[i];
      f.x += Math.sin(this.scene.time.now / 800 + i) * 0.12;
      f.setAlpha(0.4 + Math.sin(this.scene.time.now / 500 + i) * 0.18);
    }

    // Power-line sparks when exporting
    const sparking = snapshot.exportedKw > 0.5 && night < 0.2;
    if (this.powerSparks) {
      this.powerSparks.clear();
      if (sparking) {
        const now = this.scene.time.now;
        for (let i = 0; i < this.powerLineMidpoints.length; i++) {
          const mid = this.powerLineMidpoints[i];
          const flicker = Math.sin(now / 90 + i * 2.7);
          if (flicker < 0.25) continue;
          const alpha = 0.35 + flicker * 0.45;
          const r = 2 + flicker * 2.5;
          this.powerSparks.setDepth(mid.depth + 1);
          this.powerSparks.fillStyle(0xffe44a, alpha);
          this.powerSparks.fillCircle(mid.x, mid.y + (i % 3 - 1) * 3, r);
          if (flicker > 0.7) {
            this.powerSparks.fillStyle(0xffffff, alpha * 0.6);
            this.powerSparks.fillCircle(mid.x + 3, mid.y - 2, r * 0.5);
          }
        }
      }
    }

    // Ambient dust motes — daytime only
    const daytime = night < 0.12;
    const camW = cam.width;
    const camH = cam.height;
    for (let i = 0; i < this.dustMotes.length; i++) {
      const m = this.dustMotes[i];
      m.dot.setVisible(daytime && snapshot.weather !== 'rain' && snapshot.weather !== 'hail');
      if (!daytime) continue;
      m.x += m.vx;
      m.y += m.vy;
      if (m.x > camW + 20) m.x = -10;
      if (m.x < -20) m.x = camW + 10;
      if (m.y < 40) m.y = camH - 40;
      if (m.y > camH - 20) m.y = 50;
      const twinkle = 0.12 + Math.sin(t / 1400 + m.phase) * 0.08;
      m.dot.setPosition(m.x, m.y);
      m.dot.setAlpha(twinkle);
    }

    const seen = new Set<string>();

    for (const eq of snapshot.equipment) {
      seen.add(eq.id);
      const def = EQUIPMENT[eq.kind];
      const tx = eq.tile.x + def.footprint.x / 2 - 0.5;
      const ty = eq.tile.y + def.footprint.y / 2 - 0.5;
      const elev = this.heightAt(Math.floor(tx), Math.floor(ty));
      const anchor = isoToScreen(tx, ty);
      const yOff = (isPv(eq.kind) ? -36 : eq.kind === 'office' || eq.kind === 'substation' ? -40 : -18) - elev * 5;

      const prevProg = this.prevConstruction.get(eq.id);
      const prevComm = this.prevCommissioned.get(eq.id);
      if (
        (prevComm === false && eq.commissioned) ||
        (prevProg !== undefined && prevProg < 1 && eq.constructionProgress >= 1)
      ) {
        this.spawnCommissionPuff(Math.floor(tx), Math.floor(ty), elev);
      }
      this.prevConstruction.set(eq.id, eq.constructionProgress);
      this.prevCommissioned.set(eq.id, eq.commissioned);

      if (isPv(eq.kind)) {
        let pad = this.gravelPads.get(eq.id);
        if (!pad) {
          pad = this.scene.add.image(anchor.x, anchor.y + 10 - elev * 5, 'gravel_pad');
          this.gravelPads.set(eq.id, pad);
        }
        pad.setPosition(anchor.x, anchor.y + 10 - elev * 5);
        pad.setScale(Math.max(def.footprint.x, def.footprint.y) * 0.62 + 0.25);
        pad.setDepth(depthFor(eq.tile.x, eq.tile.y, 2));
        pad.setAlpha(eq.commissioned ? 0.92 : 0.45 + eq.constructionProgress * 0.4);
        pad.setVisible(true);
      }

      let shadow = this.entityShadows.get(eq.id);
      if (!shadow) {
        shadow = this.scene.add.image(anchor.x - 6, anchor.y + 10 - elev * 5, 'shadow_blob');
        this.entityShadows.set(eq.id, shadow);
      }
      const shadowScale = isPv(eq.kind) ? 1.6 : eq.kind === 'office' || eq.kind === 'substation' ? 1.8 : 1.1;
      shadow.setPosition(anchor.x - 10, anchor.y + 14 - elev * 5);
      shadow.setScale(shadowScale, shadowScale * 0.55);
      shadow.setDepth(depthFor(eq.tile.x, eq.tile.y, 3));
      shadow.setAlpha(0.85);

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
      if (eq.faulted) {
        sprite.setTint(0xff8899);
      } else if (isPv(eq.kind) && eq.soiling > 0.35) {
        // Light dusting only when heavily soiled — avoid purple/blue tint wash.
        const dust = Math.min(0.35, eq.soiling * 0.4);
        sprite.setTint(
          Phaser.Display.Color.GetColor(
            Math.floor(255 - dust * 40),
            Math.floor(255 - dust * 30),
            Math.floor(255 - dust * 10),
          ),
        );
      } else if (
        isPv(eq.kind) &&
        eq.commissioned &&
        !eq.faulted &&
        snapshot.irradiance > 0.35
      ) {
        // Soft production glint when exporting under sun
        const glint = 0.08 + Math.sin(this.scene.time.now / 400) * 0.04;
        sprite.setTint(
          Phaser.Display.Color.GetColor(
            Math.floor(255 - glint * 20),
            Math.floor(255 - glint * 5),
            255,
          ),
        );
      } else {
        sprite.clearTint();
      }

      const building = eq.constructionProgress < 1;
      let buildRing = this.buildRings.get(eq.id);
      if (building) {
        if (!buildRing) {
          buildRing = this.scene.add.image(anchor.x, anchor.y + 8 - elev * 5, 'build_ring');
          this.buildRings.set(eq.id, buildRing);
        }
        const pulse = 0.85 + Math.sin(this.scene.time.now / 320) * 0.12;
        buildRing.setPosition(anchor.x, anchor.y + 8 - elev * 5);
        buildRing.setDepth(depthFor(eq.tile.x, eq.tile.y, 16));
        buildRing.setVisible(true);
        buildRing.setAlpha(0.35 + eq.constructionProgress * 0.45);
        buildRing.setScale(pulse * (Math.max(def.footprint.x, def.footprint.y) * 0.22 + 0.55));
      } else if (buildRing) {
        buildRing.setVisible(false);
      }

      let overlay = this.overlays.get(eq.id);
      let halo = this.faultHalos.get(eq.id);
      if (eq.faulted) {
        if (!halo) {
          halo = this.scene.add.image(anchor.x, anchor.y - 48, 'fault_halo');
          this.faultHalos.set(eq.id, halo);
        }
        const haloPulse = 1.15 + Math.sin(this.scene.time.now / 280) * 0.18;
        halo.setPosition(anchor.x, anchor.y - 48);
        halo.setDepth(depthFor(eq.tile.x, eq.tile.y, 19));
        halo.setVisible(true);
        halo.setScale(haloPulse);
        halo.setAlpha(0.28 + Math.sin(this.scene.time.now / 220) * 0.12);

        if (!overlay) {
          overlay = this.scene.add.image(anchor.x, anchor.y - 48, 'fault_icon');
          this.overlays.set(eq.id, overlay);
        }
        overlay.setPosition(anchor.x, anchor.y - 48);
        overlay.setDepth(depthFor(eq.tile.x, eq.tile.y, 20));
        overlay.setVisible(true);
        overlay.setScale(1 + Math.sin(this.scene.time.now / 200) * 0.08);
      } else {
        if (halo) halo.setVisible(false);
        if (overlay) overlay.setVisible(false);
      }
    }

    for (const staff of snapshot.staff) {
      seen.add(staff.id);
      const pos = isoToScreen(staff.tile.x, staff.tile.y);
      const elev = this.heightAt(Math.floor(staff.tile.x), Math.floor(staff.tile.y));
      let shadow = this.entityShadows.get(staff.id);
      if (!shadow) {
        shadow = this.scene.add.image(pos.x - 4, pos.y + 6 - elev * 5, 'shadow_blob');
        this.entityShadows.set(staff.id, shadow);
      }
      shadow.setPosition(pos.x - 4, pos.y + 6 - elev * 5);
      shadow.setScale(0.45, 0.28);
      shadow.setAlpha(0.7);
      shadow.setDepth(depthFor(staff.tile.x, staff.tile.y, 6));

      let sprite = this.entitySprites.get(staff.id);
      if (!sprite) {
        sprite = this.scene.add.image(pos.x, pos.y - 18 - elev * 5, 'tech');
        this.entitySprites.set(staff.id, sprite);
      }
      const moving =
        staff.task.type === 'travel' ||
        staff.task.type === 'repair' ||
        staff.task.type === 'clean';
      const bob =
        staff.task.type === 'idle'
          ? Math.sin(this.scene.time.now / 280) * 1.5
          : Math.sin(this.scene.time.now / 95) * 4.2;
      sprite.setPosition(pos.x, pos.y - 18 - elev * 5 + bob);
      sprite.setDepth(depthFor(staff.tile.x, staff.tile.y, 8));
      const prevX = this.staffLastTileX.get(staff.id);
      if (prevX !== undefined && staff.tile.x !== prevX) {
        this.staffFacing.set(staff.id, staff.tile.x > prevX ? 1 : -1);
      } else if (moving) {
        const task = staff.task;
        if (task.type === 'travel' || task.type === 'repair' || task.type === 'clean') {
          const target = snapshot.equipment.find((e) => e.id === task.targetId);
          if (target && prevX !== undefined) {
            this.staffFacing.set(staff.id, target.tile.x >= prevX ? 1 : -1);
          }
        }
      }
      this.staffLastTileX.set(staff.id, staff.tile.x);
      const face = this.staffFacing.get(staff.id) ?? 1;
      sprite.setScale(1.05 * face, 1.05);
      if (staff.task.type === 'idle') {
        sprite.clearTint();
      } else if (staff.task.type === 'repair') {
        sprite.setTint(0xffaa66);
      } else if (staff.task.type === 'clean') {
        sprite.setTint(0x88ccaa);
      } else {
        sprite.setTint(0xffcc88);
      }
    }

    for (const [id, sprite] of this.entitySprites) {
      if (!seen.has(id)) {
        sprite.destroy();
        this.entitySprites.delete(id);
        this.overlays.get(id)?.destroy();
        this.overlays.delete(id);
        this.faultHalos.get(id)?.destroy();
        this.faultHalos.delete(id);
        this.gravelPads.get(id)?.destroy();
        this.gravelPads.delete(id);
        this.buildRings.get(id)?.destroy();
        this.buildRings.delete(id);
        this.prevConstruction.delete(id);
        this.prevCommissioned.delete(id);
        this.entityShadows.get(id)?.destroy();
        this.entityShadows.delete(id);
      }
    }

    if (snapshot.selectedId) {
      const eq = snapshot.equipment.find((e) => e.id === snapshot.selectedId);
      if (eq) {
        const def = EQUIPMENT[eq.kind];
        const tx = eq.tile.x + def.footprint.x / 2 - 0.5;
        const ty = eq.tile.y + def.footprint.y / 2 - 0.5;
        const elev = this.heightAt(Math.floor(tx), Math.floor(ty));
        const anchor = isoToScreen(tx, ty);
        if (!this.selectRing) {
          this.selectRing = this.scene.add.image(anchor.x, anchor.y + 10 - elev * 5, 'select_ring');
        }
        const ringBase = Math.max(def.footprint.x, def.footprint.y) * 0.55 + 0.5;
        const ringPulse = 0.92 + Math.sin(this.scene.time.now / 380) * 0.1;
        this.selectRing.setVisible(true);
        this.selectRing.setPosition(anchor.x, anchor.y + 10 - elev * 5);
        this.selectRing.setScale(ringBase * ringPulse);
        this.selectRing.setAlpha(0.72 + Math.sin(this.scene.time.now / 420) * 0.18);
        this.selectRing.setDepth(depthFor(eq.tile.x, eq.tile.y, 4));
      }
    } else if (this.selectRing) {
      this.selectRing.setVisible(false);
    }

    this.refreshLockedTiles();
  }

  setPointerInWorld(inside: boolean): void {
    this.pointerInWorld = inside;
    if (!inside) {
      this.hoverTile = null;
      this.hoverHighlight?.setVisible(false);
    }
  }

  updateHoverTile(snapshot: GameSnapshot, pointerWorld: { x: number; y: number }): void {
    if (snapshot.buildMode || !this.pointerInWorld) {
      this.hoverHighlight?.setVisible(false);
      if (snapshot.buildMode) this.hoverTile = null;
      return;
    }
    const iso = screenToIso(pointerWorld.x, pointerWorld.y);
    const tile = { x: Math.floor(iso.x), y: Math.floor(iso.y) };
    if (tile.x < 0 || tile.y < 0 || tile.x >= WORLD_W || tile.y >= WORLD_H) {
      this.hoverTile = null;
      this.hoverHighlight?.setVisible(false);
      return;
    }
    this.hoverTile = tile;
    const elev = this.heightAt(tile.x, tile.y);
    const screen = isoToScreen(tile.x + 0.5, tile.y + 0.5);
    if (!this.hoverHighlight) {
      this.hoverHighlight = this.scene.add.image(screen.x, screen.y - elev * 5 + 6, 'hover_tile');
    }
    this.hoverHighlight.setTexture('hover_tile');
    this.hoverHighlight.setPosition(screen.x, screen.y - elev * 5 + 6);
    this.hoverHighlight.setDepth(depthFor(tile.x, tile.y, 12));
    this.hoverHighlight.setAlpha(0.55);
    this.hoverHighlight.setVisible(true);
  }

  updateGhost(snapshot: GameSnapshot, pointerWorld: { x: number; y: number }): void {
    if (!snapshot.buildMode) {
      this.ghost?.setVisible(false);
      this.ghostPad?.setVisible(false);
      return;
    }
    this.hoverHighlight?.setVisible(false);
    const iso = screenToIso(pointerWorld.x, pointerWorld.y);
    const tile = { x: Math.floor(iso.x), y: Math.floor(iso.y) };
    this.hoverTile = tile;
    const plotId = this.sim.plotAtTile(tile);
    const ok = plotId ? this.sim.canPlace(snapshot.buildMode, plotId, tile) === null : false;
    const def = EQUIPMENT[snapshot.buildMode];
    const elev = this.heightAt(tile.x, tile.y);
    const screen = isoToScreen(
      tile.x + def.footprint.x / 2 - 0.5,
      tile.y + def.footprint.y / 2 - 0.5,
    );
    const padY = screen.y - elev * 5 + 8;
    const yOff = (isPv(snapshot.buildMode) ? -36 : snapshot.buildMode === 'office' || snapshot.buildMode === 'substation' ? -40 : -18) - elev * 5;
    // Footprint pad + building silhouette tinted green/red.
    if (!this.ghostPad) {
      this.ghostPad = this.scene.add.image(screen.x, padY, ok ? 'ghost_ok' : 'ghost_bad');
    }
    this.ghostPad.setTexture(ok ? 'ghost_ok' : 'ghost_bad');
    this.ghostPad.setPosition(screen.x, padY);
    this.ghostPad.setScale(Math.max(def.footprint.x, def.footprint.y) * 0.7 + 0.35);
    this.ghostPad.setDepth(depthFor(tile.x, tile.y, 14));
    this.ghostPad.setAlpha(ok ? 0.88 : 0.92);
    this.ghostPad.setVisible(true);

    const tex = textureFor(snapshot.buildMode);
    if (!this.ghost) {
      this.ghost = this.scene.add.image(screen.x, screen.y + yOff, tex);
    }
    this.ghost.setTexture(tex);
    this.ghost.setPosition(screen.x, screen.y + yOff);
    this.ghost.setDepth(depthFor(tile.x, tile.y, 15));
    this.ghost.setAlpha(ok ? 0.62 : 0.68);
    this.ghost.setScale(isPv(snapshot.buildMode) ? 1.15 : 1);
    this.ghost.setTint(ok ? 0x33ff88 : 0xff2244);
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
