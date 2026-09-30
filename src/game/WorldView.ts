import Phaser from 'phaser';
import { EQUIPMENT } from '../content/equipment';
import type { GameSimulation } from '../simulation/GameSimulation';
import type { EquipmentKind, GameSnapshot, Vec2 } from '../simulation/types';
import { depthFor, isoToScreen, screenToIso, TILE_H, TILE_W } from './iso';
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

type PowerLineSpark = { x: number; y: number; depth: number };

type DustMote = {
  dot: Phaser.GameObjects.Arc;
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
};

type PollenMote = {
  shape: Phaser.GameObjects.Ellipse;
  worldX: number;
  worldY: number;
  vx: number;
  vy: number;
  phase: number;
  spin: number;
};

type StaffTrailBlob = {
  img: Phaser.GameObjects.Image;
  born: number;
};

const WORLD_W = 42;
const WORLD_H = 30;

/** Site A buildable meadow — keep clear of trees; fence the perimeter. */
const SITE_A = { x0: 3, x1: 19, y0: 3, y1: 17 };
/** Site B locked meadow. */
const SITE_B = { x0: 21, x1: 35, y0: 5, y1: 17 };

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

/** Matches scatterEnvironment forest density — used for pollen spawn at edges. */
function isForestTile(x: number, y: number): boolean {
  if (isWater(x, y) || isBank(x, y)) return false;
  if (isMainRoad(x, y)) return false;
  if (inRect(x, y, SITE_A) || inRect(x, y, SITE_B)) return false;
  // Wide clear apron around both sites so the farm reads as open meadow.
  if (x >= SITE_A.x0 - 3 && x <= SITE_A.x1 + 2 && y >= SITE_A.y0 - 3 && y <= SITE_A.y1 + 2) {
    return false;
  }
  if (x >= SITE_B.x0 - 2 && x <= SITE_B.x1 + 2 && y >= SITE_B.y0 - 2 && y <= SITE_B.y1 + 2) {
    return false;
  }
  const h = hash(x, y);
  const edge = x < 3 || y < 3 || x > 36 || y > 24;
  // Sparse tree belts — previous 620/280 filled the valley and drowned Site A.
  const threshold = edge ? 200 : 55;
  return h % 1000 < threshold;
}

function isForestEdge(x: number, y: number): boolean {
  if (!isForestTile(x, y)) return false;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      if (!isForestTile(x + dx, y + dy)) return true;
    }
  }
  return false;
}

export class WorldView {
  private readonly ground = new Map<string, Phaser.GameObjects.Image>();
  private readonly lockedOverlays = new Map<string, Phaser.GameObjects.Image>();
  private readonly buildDimOverlays = new Map<string, Phaser.GameObjects.Image>();
  private readonly props: Phaser.GameObjects.GameObject[] = [];
  private readonly entitySprites = new Map<string, Phaser.GameObjects.Image>();
  private readonly entityShadows = new Map<string, Phaser.GameObjects.Image>();
  private readonly overlays = new Map<string, Phaser.GameObjects.Image>();
  private ghost: Phaser.GameObjects.Image | null = null;
  private ghostPad: Phaser.GameObjects.Image | null = null;
  private ghostInvalidX: Phaser.GameObjects.Graphics | null = null;
  private ghostRing: Phaser.GameObjects.Image | null = null;
  private readonly ghostFootprintPads: Phaser.GameObjects.Image[] = [];
  private ghostFootprintLabel: Phaser.GameObjects.Text | null = null;
  private selectRing: Phaser.GameObjects.Image | null = null;
  private hoverHighlight: Phaser.GameObjects.Image | null = null;
  private hoverTile: Vec2 | null = null;
  private pointerInWorld = true;
  private readonly gravelPads = new Map<string, Phaser.GameObjects.Image>();
  private readonly productionGlows = new Map<string, Phaser.GameObjects.Ellipse>();
  private readonly substationLights = new Map<string, Phaser.GameObjects.Ellipse>();
  private readonly faultHalos = new Map<string, Phaser.GameObjects.Image>();
  private readonly buildRings = new Map<string, Phaser.GameObjects.Image>();
  private readonly commissionPuffs = new Map<string, Phaser.GameObjects.Graphics>();
  private readonly prevConstruction = new Map<string, number>();
  private readonly prevCommissioned = new Map<string, boolean>();
  private clouds: Phaser.GameObjects.Image[] = [];
  private foam: Phaser.GameObjects.Image[] = [];
  private weatherVeil: Phaser.GameObjects.Rectangle | null = null;
  private sunGlare: Phaser.GameObjects.Ellipse | null = null;
  private vignette: Phaser.GameObjects.Image | null = null;
  private readonly windowGlows: Phaser.GameObjects.Rectangle[] = [];
  private rainDrops: Phaser.GameObjects.Rectangle[] = [];
  private ambientMotion: AmbientMotion[] = [];
  private birds: SkyBird[] = [];
  private readonly powerLineSparkPoints: PowerLineSpark[] = [];
  private powerSparks: Phaser.GameObjects.Graphics | null = null;
  private staffTaskLines: Phaser.GameObjects.Graphics | null = null;
  private dustMotes: DustMote[] = [];
  private pollenMotles: PollenMote[] = [];
  private forestEdgeTiles: Array<[number, number]> = [];
  private readonly staffLastTileX = new Map<string, number>();
  private readonly staffFacing = new Map<string, number>();
  private readonly staffTrails = new Map<string, StaffTrailBlob[]>();
  private readonly staffTrailLastSpawn = new Map<string, number>();
  private readonly staffToolIcons = new Map<string, Phaser.GameObjects.Graphics>();
  private readonly staffWalkTextures = ['tech_walk_0', 'tech_walk_1'] as const;
  private lastSiteBUnlocked = false;
  private siteBUnlockPulseUntil = 0;

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
    this.drawRoadLaneMarkings();
    this.spawnDustMotes();
    this.spawnPollenDrift();
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
    if (scene.textures.exists('vignette')) {
      this.vignette = scene.add.image(0, 0, 'vignette');
      this.vignette.setOrigin(0.5, 0.5);
      this.vignette.setDepth(920);
      this.vignette.setScrollFactor(0);
      this.vignette.setAlpha(0.18);
      this.vignette.setBlendMode(Phaser.BlendModes.MULTIPLY);
    }
    // Seed a few rain streaks (hidden until wet weather)
    for (let i = 0; i < 18; i++) {
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
      const cx = riverCenterX(y);
      const southFacing = x > cx;
      // Sandy beach shelves more often on warmer south-facing banks.
      if (southFacing && (h % 3 === 0 || h % 5 === 1)) return 'tile_beach';
      if (!southFacing && h % 6 === 0) return 'tile_beach';
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

    // Service / dirt pads near office + outer wear ring
    if (x >= 4 && x <= 7 && y >= 5 && y <= 7) return 'tile_dirt';
    if (
      (x >= 3 && x <= 8 && y >= 4 && y <= 8) &&
      !(x >= 4 && x <= 7 && y >= 5 && y <= 7)
    ) {
      const h = hash(x, y);
      if (h % 3 !== 0) return 'tile_dirt';
    }

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
      const h = Math.min(20, westDrop * 5);
      riser.fillStyle(CLIFF_FACE_W, 0.68);
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
      const h = Math.min(20, eastDrop * 5);
      riser.fillStyle(CLIFF_FACE_E, 0.65);
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
        if (key === 'tile_beach') {
          img.setTint(
            Phaser.Display.Color.GetColor(255, Math.floor(228 + (hash(x, y) % 8)), Math.floor(175 + (hash(x, y) % 12))),
          );
          const h = hash(x, y);
          if (h % 10 === 0) {
            const jx = 0.25 + (h % 7) * 0.08;
            const jy = 0.2 + ((h >> 2) % 6) * 0.07;
            this.addProp('rock', x + jx, y + jy, -3, 1, 0.38 + (h % 3) * 0.05);
          }
        } else if (key.startsWith('tile_grass_hd_')) {
          const h = hash(x, y);
          const gBoost = (h % 20) - 8;
          let r = 110 + gBoost;
          let g = 170 + gBoost;
          let b = 70 + (h % 12);
          if (elev >= 2) {
            r = Math.max(72, r - 22);
            g = Math.max(118, g - 28);
            b = Math.max(48, b - 14);
          }
          img.setTint(Phaser.Display.Color.GetColor(r, g, b));
        } else if (isBank(x, y)) {
          const adjWater =
            isWater(x - 1, y) ||
            isWater(x + 1, y) ||
            isWater(x, y - 1) ||
            isWater(x, y + 1);
          if (adjWater) {
            const h = hash(x, y);
            img.setTint(
              Phaser.Display.Color.GetColor(
                92 + (h % 14),
                168 + (h % 12),
                136 + (h % 10),
              ),
            );
          }
        }
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
    tint?: number,
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
    if (tint !== undefined) img.setTint(tint);
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
      const sparkDepth = depthFor(midTileX, midTileY, 7);
      for (const t of [1 / 3, 0.5, 2 / 3]) {
        const mt = 1 - t;
        this.powerLineSparkPoints.push({
          x: mt * mt * ax + 2 * mt * t * midX + t * t * bx,
          y: mt * mt * ay + 2 * mt * t * midY + t * t * by,
          depth: sparkDepth,
        });
      }
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
    const bays: Array<[number, number]> = [[5.3, 5.7]];
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

  /** Yellow dashed segment between two screen points (staff dispatch indicator). */
  private drawDashedLine(
    g: Phaser.GameObjects.Graphics,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    dash = 7,
    gap = 5,
  ): void {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (len < 2) return;
    const ux = dx / len;
    const uy = dy / len;
    let t = 0;
    while (t < len) {
      const tEnd = Math.min(t + dash, len);
      g.beginPath();
      g.moveTo(x1 + ux * t, y1 + uy * t);
      g.lineTo(x1 + ux * tEnd, y1 + uy * tEnd);
      g.strokePath();
      t += dash + gap;
    }
  }

  private updateStaffTaskLines(snapshot: GameSnapshot): void {
    if (!this.staffTaskLines) {
      this.staffTaskLines = this.scene.add.graphics();
      this.staffTaskLines.setDepth(848);
    }
    const g = this.staffTaskLines;
    g.clear();
    let any = false;
    for (const staff of snapshot.staff) {
      const task = staff.task;
      if (task.type !== 'travel' && task.type !== 'repair') continue;
      const target = snapshot.equipment.find((e) => e.id === task.targetId);
      if (!target) continue;
      any = true;
      const staffPos = isoToScreen(staff.tile.x, staff.tile.y);
      const staffElev = this.heightAt(Math.floor(staff.tile.x), Math.floor(staff.tile.y));
      const sx = staffPos.x;
      const sy = staffPos.y - 18 - staffElev * 5;
      const def = EQUIPMENT[target.kind];
      const tx = target.tile.x + def.footprint.x / 2 - 0.5;
      const ty = target.tile.y + def.footprint.y / 2 - 0.5;
      const elev = this.heightAt(Math.floor(tx), Math.floor(ty));
      const anchor = isoToScreen(tx, ty);
      const yOff =
        (isPv(target.kind) ? -36 : target.kind === 'office' || target.kind === 'substation' ? -40 : -18) -
        elev * 5;
      const ex = anchor.x;
      const ey = anchor.y + yOff + 14;
      g.lineStyle(2.2, 0xffdd44, 0.88);
      this.drawDashedLine(g, sx, sy, ex, ey);
    }
    g.setVisible(any);
  }

  /** Thin white dashed centre line on the main E–W asphalt corridor (y = 6). */
  private drawRoadLaneMarkings(): void {
    const g = this.scene.add.graphics();
    g.setDepth(depthFor(18, 6, 2));
    const roadDy = TILE_H / 2;
    const roadDx = TILE_W / 2;
    g.lineStyle(1.4, 0xffffff, 0.68);
    for (let x = 3; x <= 34; x++) {
      if (x === 11 || x === 15) continue;
      const elev = this.heightAt(x, 6);
      const s = isoToScreen(x, 6);
      const cx = s.x;
      const cy = s.y - elev * 5 + 2;
      if (x % 2 === 0) {
        g.beginPath();
        g.moveTo(cx - roadDx * 0.34, cy - roadDy * 0.34);
        g.lineTo(cx + roadDx * 0.34, cy + roadDy * 0.34);
        g.strokePath();
      }
    }
    this.props.push(g);
  }

  /** Procedural wrench (repair), sparkle (clean), or boot/arrow (travel) icon above tech. */
  private drawStaffToolIcon(
    g: Phaser.GameObjects.Graphics,
    taskType: 'repair' | 'clean' | 'travel',
    t: number,
  ): void {
    g.clear();
    g.setScale(1.6);
    const pulse = 0.85 + Math.sin(t / 180) * 0.15;
    if (taskType === 'repair') {
      g.fillStyle(0xffcc66, 0.92 * pulse);
      g.fillCircle(0, 0, 5.5);
      g.lineStyle(2.2, 0x8a5520, 0.95);
      g.beginPath();
      g.moveTo(-4, 2);
      g.lineTo(2, -4);
      g.lineTo(5, -1);
      g.strokePath();
      g.lineStyle(1.8, 0x5a3818, 0.9);
      g.beginPath();
      g.arc(4, -3, 2.2, Math.PI * 0.15, Math.PI * 1.35);
      g.strokePath();
    } else if (taskType === 'clean') {
      g.fillStyle(0xa8e8c8, 0.9 * pulse);
      g.fillCircle(0, 0, 5);
      g.lineStyle(1.6, 0xffffff, 0.85 * pulse);
      for (let i = 0; i < 4; i++) {
        const a = (Math.PI / 2) * i + t / 400;
        g.beginPath();
        g.moveTo(Math.cos(a) * 2.5, Math.sin(a) * 2.5);
        g.lineTo(Math.cos(a) * 7, Math.sin(a) * 7);
        g.strokePath();
      }
      g.fillStyle(0xffffff, 0.75);
      g.fillCircle(0, 0, 2);
    } else {
      g.fillStyle(0xffcc88, 0.88 * pulse);
      g.fillRoundedRect(-3.5, -1, 5, 7, 1.2);
      g.fillStyle(0x8a5520, 0.9);
      g.fillRect(-2.5, 4, 3.5, 2);
      g.lineStyle(2, 0xffffff, 0.9 * pulse);
      g.beginPath();
      g.moveTo(4, 0);
      g.lineTo(9, 0);
      g.moveTo(7, -3);
      g.lineTo(9, 0);
      g.lineTo(7, 3);
      g.strokePath();
    }
  }

  /** Screen-space dust motes — visible in daylight only. */
  private spawnDustMotes(): void {
    const count = 6;
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(60, 1180);
      const y = Phaser.Math.Between(80, 620);
      const gold = i % 3 === 0;
      const dot = this.scene.add.circle(x, y, 1.6 + (i % 2) * 0.55, gold ? 0xffe8a0 : 0xffffff, 0.28);
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

  /** World-space leaf/pollen motes drifting from forest edges. */
  private spawnPollenDrift(): void {
    this.forestEdgeTiles = [];
    for (let x = 0; x < WORLD_W; x++) {
      for (let y = 0; y < WORLD_H; y++) {
        if (isForestEdge(x, y)) this.forestEdgeTiles.push([x, y]);
      }
    }
    const edges = this.forestEdgeTiles;
    const count = edges.length > 0 ? 4 : 0;
    if (count === 0) return;
    for (let i = 0; i < count; i++) {
      const pick = edges[(hash(i, 41) + i * 17) % edges.length];
      const [tx, ty] = pick;
      const elev = this.heightAt(tx, ty);
      const base = isoToScreen(tx + 0.5, ty + 0.5);
      const worldX = base.x + (hash(tx, ty + i) % 20) - 10;
      const worldY = base.y - elev * 5 - 8 + (hash(ty, tx + i) % 14) - 7;
      const greenish = i % 3 !== 0;
      const color = greenish ? 0x7ab84a : 0xc8d84a;
      const shape = this.scene.add.ellipse(worldX, worldY, 3.2, 2.1, color, 0.32);
      shape.setDepth(depthFor(tx, ty, 4));
      shape.setAngle(hash(tx, ty) % 90);
      this.pollenMotles.push({
        shape,
        worldX,
        worldY,
        vx: 0.14 + (i % 4) * 0.04,
        vy: -0.03 - (i % 3) * 0.015,
        phase: i * 1.9,
        spin: (hash(i, tx) % 40) - 20,
      });
      this.props.push(shape);
    }
  }

  private spawnStaffTrailBlob(staffId: string, x: number, y: number, depth: number): void {
    const trail = this.staffTrails.get(staffId) ?? [];
    const img = this.scene.add.image(x, y, 'shadow_blob');
    img.setScale(0.38, 0.2);
    img.setAlpha(0.7);
    img.setTint(0xffcc66);
    img.setDepth(depth - 1);
    trail.push({ img, born: this.scene.time.now });
    while (trail.length > 5) {
      const old = trail.shift();
      old?.img.destroy();
    }
    this.staffTrails.set(staffId, trail);
  }

  private updateStaffTrails(): void {
    const now = this.scene.time.now;
    for (const [staffId, trail] of this.staffTrails) {
      for (let i = trail.length - 1; i >= 0; i--) {
        const blob = trail[i];
        const age = now - blob.born;
        if (age > 1100) {
          blob.img.destroy();
          trail.splice(i, 1);
          continue;
        }
        blob.img.setAlpha(0.7 * (1 - age / 1100));
        blob.img.setScale(0.38 + age / 5000, 0.2 + age / 9000);
      }
      if (trail.length === 0) this.staffTrails.delete(staffId);
    }
  }

  /** Sparse wildflowers on Site A fence corners only — keep meadows open. */
  private scatterMeadowWildflowers(): void {
    const corners: Array<[number, number]> = [
      [SITE_A.x0 - 1, SITE_A.y0 - 1],
      [SITE_A.x1, SITE_A.y0 - 1],
      [SITE_A.x0 - 1, SITE_A.y1],
      [SITE_A.x1, SITE_A.y1],
    ];
    for (const [x, y] of corners) {
      const h = hash(x, y);
      this.addProp(`flower_${h % 2}`, x, y, -5, 1, 0.5);
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

    // Few pylons — enough to sell the grid without a forest of steel.
    const pylons: Array<{ x: number; y: number; yOff: number; scale: number }> = [
      { x: 14, y: 3, yOff: -52, scale: 0.62 },
      { x: 24, y: 3, yOff: -52, scale: 0.55 },
    ];
    for (const p of pylons) {
      this.addProp('pylon', p.x, p.y, p.yOff, 8, p.scale);
    }
    this.drawPowerLines(pylons);
    this.scatterMeadowWildflowers();
    // One yard landmark + one spare tank — no chimney/container pile-up.
    this.addProp('warehouse', 4, 8, -30, 6, 0.72);
    this.addProp('tank', 14, 5, -28, 6, 0.45);
    this.addProp('van', 5, 7, -10, 7, 0.82, 'bob', 0xffc090);

    // Site A fence — every other post so the meadow still has an edge without a solid wall.
    for (let x = SITE_A.x0; x < SITE_A.x1; x += 2) {
      this.addProp('fence', x, SITE_A.y0, -6, 3, 0.98);
      this.addProp('fence', x, SITE_A.y1 - 1, -6, 3, 0.98);
    }
    for (let y = SITE_A.y0 + 1; y < SITE_A.y1 - 1; y += 2) {
      this.addProp('fence', SITE_A.x0, y, -6, 3, 0.94);
      this.addProp('fence', SITE_A.x1 - 1, y, -6, 3, 0.94);
    }

    // Sparse tree belts on map edges only (shared density with isForestTile).
    for (let x = 0; x < WORLD_W; x++) {
      for (let y = 0; y < WORLD_H; y++) {
        if (!isForestTile(x, y)) continue;
        const h = hash(x, y);
        const big = h % 3 === 0;
        const key = big
          ? h % 2 === 0
            ? 'tree_deciduous'
            : 'tree_big'
          : h % 3 === 0
            ? this.smallTreeKey(h)
            : 'tree_deciduous';
        this.addProp(key, x, y, big ? -36 : -28, 3, big ? 1.05 : 0.95);
      }
    }

    // Light riverbank accents — foam + rare rock/bush, not a rockery.
    for (let y = 1; y < WORLD_H; y++) {
      for (let x = 0; x < WORLD_W; x++) {
        if (!isBank(x, y)) continue;
        const h = hash(x, y);
        if (h % 11 === 2) {
          const cx = riverCenterX(y);
          const towardWater = x > cx ? -0.18 : 0.18;
          this.addBankFoamStrip(x + towardWater, y, h);
        }
        if (h % 9 === 0) {
          this.addProp('rock', x, y, -4, 2, 0.85 + (h % 3) * 0.08);
        } else if (h % 13 === 0) {
          this.addProp('bush', x, y, -10, 3, 0.72);
        }
      }
    }

    // A handful of edge bushes — one prop each, far from build sites.
    const clusters: Array<[number, number]> = [
      [2, 4],
      [2, 20],
      [8, 3],
      [34, 7],
      [36, 14],
      [18, 28],
      [30, 27],
    ];
    for (const [cx, cy] of clusters) {
      if (inRect(cx, cy, SITE_A) || inRect(cx, cy, SITE_B)) continue;
      const h = hash(cx, cy);
      this.addProp(h % 2 === 0 ? 'bush' : 'tree_deciduous', cx, cy, h % 2 === 0 ? -10 : -28, 3, 0.8);
    }
  }

  private spawnMountains(): void {
    // Soft sky gradient band so the backdrop isn't flat browser blue.
    const skyBand = this.scene.add.graphics();
    // Warmer horizon band — cyan aloft fading to pale yellow at the ridge line.
    skyBand.fillGradientStyle(0xb8dcff, 0xb8dcff, 0xa8e8f0, 0xfff0b8, 1);
    skyBand.fillRect(-400, -80, 2400, 280);
    skyBand.setDepth(-220);
    skyBand.setScrollFactor(0.02);
    this.props.push(skyBand);

    // Far snow-capped ridge behind the valley (concept backdrop).
    const mounts = [
      // Cleaner rebuilt mountains — avoid extreme upscale that caused grey seams
      { key: 'mountain_0', x: 200, y: 70, scale: 1.15, a: 0.92 },
      { key: 'mountain_1', x: 520, y: 55, scale: 1.25, a: 0.95 },
      { key: 'mountain_2', x: 860, y: 65, scale: 1.18, a: 0.9 },
      { key: 'mountain_1', x: 1140, y: 80, scale: 1.05, a: 0.82 },
      { key: 'mountain_0', x: -20, y: 88, scale: 1.0, a: 0.78 },
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
    for (let i = 0; i < 5; i++) {
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
    for (let i = 0; i < 4; i++) {
      const g = this.scene.add.graphics();
      g.setDepth(-90);
      g.setScrollFactor(0.25);
      this.birds.push({
        g,
        x: 100 + i * 92,
        y: 42 + (i % 5) * 24,
        vx: 0.35 + (i % 3) * 0.14,
        wing: i * 1.7,
      });
      this.props.push(g);
    }
  }

  private drawBird(b: SkyBird, night: number): void {
    const flap = Math.sin(this.scene.time.now / 180 + b.wing) * 3;
    const alpha = night > 0.35 ? 0.15 : 0.48;
    b.g.clear();
    b.g.lineStyle(2.2, 0x2a3548, alpha);
    b.g.beginPath();
    b.g.moveTo(-5, flap);
    b.g.lineTo(0, -1);
    b.g.lineTo(5, flap);
    b.g.strokePath();
  }

  /** Bank-edge froth overlapping water line — registered for foam animation. */
  private addBankFoamStrip(worldX: number, tileY: number, seed: number): void {
    const s = isoToScreen(worldX, tileY);
    const key = `foam_strip_${seed % 3}`;
    const foam = this.scene.add.image(s.x, s.y - 1, this.scene.textures.exists(key) ? key : 'foam');
    foam.setDepth(depthFor(Math.floor(worldX), tileY, 1));
    foam.setAlpha(0.55);
    foam.setScale(0.78 + (seed % 15) / 100);
    this.foam.push(foam);
    this.props.push(foam);
  }

  /** Very subtle warm/cool entity tint from sun angle — skip when status tint active. */
  private applyDirectionalLight(
    sprite: Phaser.GameObjects.Image,
    irradiance: number,
    night: number,
  ): void {
    if (night > 0.25) {
      sprite.setTint(Phaser.Display.Color.GetColor(195, 205, 228));
    } else if (irradiance > 0.7) {
      sprite.setTint(Phaser.Display.Color.GetColor(255, 250, 238));
    } else {
      sprite.clearTint();
    }
  }

  private spawnFoam(): void {
    // Sparse froth along the river + a little at the bridge.
    for (let y = 1; y < WORLD_H; y += 3) {
      if (hash(19, y) % 3 !== 0) continue;
      const cx = riverCenterX(y);
      const fx = cx + (y % 2 === 0 ? -1.05 : 1.05);
      const s = isoToScreen(fx, y);
      const key = `foam_strip_${y % 3}`;
      const foam = this.scene.add.image(s.x, s.y - 1, this.scene.textures.exists(key) ? key : 'foam');
      foam.setDepth(depthFor(Math.floor(fx), y, 1));
      foam.setAlpha(0.45);
      foam.setScale(0.85);
      this.foam.push(foam);
      this.props.push(foam);
    }
    const bridgeY = 6;
    const bridgeCx = riverCenterX(bridgeY);
    for (const off of [-0.6, 0.6] as const) {
      const fx = bridgeCx + off;
      const s = isoToScreen(fx, bridgeY);
      const foam = this.scene.add.image(s.x, s.y - 2, 'foam_strip_0');
      if (!this.scene.textures.exists('foam_strip_0')) foam.setTexture('foam');
      foam.setDepth(depthFor(Math.floor(fx), bridgeY, 2));
      foam.setAlpha(0.55);
      foam.setScale(0.95);
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
    const inBuildMode = !!snap.buildMode;
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
        if (inBuildMode) {
          overlay.setTint(0xff8888);
          overlay.setAlpha(0.88);
        } else {
          overlay.clearTint();
          overlay.setAlpha(1);
        }
      } else {
        const lockedOverlay = this.lockedOverlays.get(key);
        lockedOverlay?.setVisible(false);
        lockedOverlay?.clearTint();
        lockedOverlay?.setAlpha(1);
        if (img.texture.key === 'tile_locked') {
          img.setTexture(this.terrainKey(x, y));
        }
      }
    }
  }

  /** Dim non-buildable tiles while build mode is active. */
  private refreshBuildDimTiles(snapshot: GameSnapshot): void {
    const siteB = snapshot.plots.find((p) => p.id === 'site_b');
    const inBuildMode = !!snapshot.buildMode;

    for (const [key] of this.ground) {
      const [xs, ys] = key.split(',');
      const x = Number(xs);
      const y = Number(ys);
      const inSiteB = inRect(x, y, SITE_B);
      const lockedSiteB = inSiteB && siteB && !siteB.unlocked;

      let needsDim = false;
      if (inBuildMode) {
        if (lockedSiteB || isWater(x, y) || isBank(x, y)) {
          needsDim = true;
        } else {
          let inUnlockedPlot = false;
          for (const plot of snapshot.plots) {
            if (!plot.unlocked) continue;
            if (
              x >= plot.origin.x &&
              y >= plot.origin.y &&
              x < plot.origin.x + plot.size.x &&
              y < plot.origin.y + plot.size.y
            ) {
              inUnlockedPlot = true;
              break;
            }
          }
          if (!inUnlockedPlot) needsDim = true;
        }
      }

      let overlay = this.buildDimOverlays.get(key);
      if (needsDim) {
        if (!overlay) {
          const screen = isoToScreen(x, y);
          const elev = this.heightAt(x, y);
          const dimKey = this.scene.textures.exists('tile_build_dim')
            ? 'tile_build_dim'
            : 'ghost_bad';
          overlay = this.scene.add.image(screen.x, screen.y - elev * 5, dimKey);
          overlay.setDepth(depthFor(x, y, -2));
          overlay.setAlpha(lockedSiteB ? 0.42 : 0.34);
          this.buildDimOverlays.set(key, overlay);
        }
        overlay.setAlpha(lockedSiteB ? 0.42 : 0.34);
        overlay.setVisible(true);
      } else {
        overlay?.setVisible(false);
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
    if (this.vignette) {
      const cam = this.scene.cameras.main;
      const pad = 16;
      this.vignette.setPosition(cam.width / 2, cam.height / 2);
      this.vignette.setDisplaySize(cam.width + pad * 2, cam.height + pad * 2);
    }
    const nightGlow = night > 0.32;
    for (let i = 0; i < this.windowGlows.length; i++) {
      const glow = this.windowGlows[i];
      const pulse = 0.5 + Math.sin(this.scene.time.now / 850 + i * 1.4) * 0.22;
      glow.setAlpha(nightGlow ? pulse * 0.8 : 0);
    }
    const wet = snapshot.weather === 'rain' || snapshot.weather === 'hail';
    const isHail = snapshot.weather === 'hail';
    for (let i = 0; i < this.rainDrops.length; i++) {
      const d = this.rainDrops[i];
      d.setVisible(wet);
      if (!wet) continue;
      d.y += isHail ? 9 + (i % 5) : 6 + (i % 4);
      d.x -= isHail ? 0.4 : 1.2;
      if (d.y > 720) {
        d.y = -10;
        d.x = Phaser.Math.Between(20, 1260);
      }
      if (isHail) {
        d.setFillStyle(0xf0f6ff, 0.9);
        d.setSize(3, 7);
        d.setAlpha(0.85);
      } else {
        d.setFillStyle(0xa8c8e8, 0.7);
        d.setSize(2, 10);
        d.setAlpha(0.45);
      }
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
      c.x += (0.06 + i * 0.012) * 1.5;
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
      }
    }
    for (let i = 0; i < this.foam.length; i++) {
      const f = this.foam[i];
      f.x += Math.sin(this.scene.time.now / 800 + i) * 0.12;
      f.setAlpha(0.5 + Math.sin(this.scene.time.now / 500 + i) * 0.22);
      // 3-frame foam cycle so river froth reads as animated, not static blocks
      const frame = Math.floor(this.scene.time.now / 220 + i) % 3;
      const foamKey = `foam_strip_${frame}`;
      if (this.scene.textures.exists(foamKey) && f.texture.key !== foamKey) {
        f.setTexture(foamKey);
      }
    }

    // Power-line sparks when exporting (powerKw fallback when export capped / pre-inverter)
    const exporting = snapshot.exportedKw > 0.05;
    const sparking = (exporting || snapshot.powerKw > 1) && night < 0.25;
    if (this.powerSparks) {
      this.powerSparks.clear();
      if (sparking) {
        const now = this.scene.time.now;
        for (let i = 0; i < this.powerLineSparkPoints.length; i++) {
          const pt = this.powerLineSparkPoints[i];
          const flicker = Math.sin(now / 70 + i * 2.7);
          if (flicker < 0.05) continue;
          const exportBoost = exporting ? 1.35 : 1;
          const alpha = (0.55 + flicker * 0.4) * exportBoost;
          const r = (3.5 + flicker * 3.5) * exportBoost;
          this.powerSparks.setDepth(pt.depth + 1);
          this.powerSparks.fillStyle(0xffe44a, Math.min(1, alpha));
          this.powerSparks.fillCircle(pt.x, pt.y + (i % 3 - 1) * 3, r);
          this.powerSparks.fillStyle(0xffffff, Math.min(1, alpha * 0.75));
          this.powerSparks.fillCircle(pt.x + 2, pt.y - 2, r * 0.55);
          if (exporting) {
            const segLen = 5 + flicker * 9;
            const angle = now / 85 + i * 1.9;
            const x2 = pt.x + Math.cos(angle) * segLen;
            const y2 = pt.y + Math.sin(angle) * segLen;
            this.powerSparks.lineStyle(1.6, 0xffe866, Math.min(1, alpha * 0.95));
            this.powerSparks.beginPath();
            this.powerSparks.moveTo(pt.x - 2, pt.y + (i % 3 - 1) * 2);
            this.powerSparks.lineTo(x2, y2);
            this.powerSparks.strokePath();
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
      const twinkle = 0.16 + Math.sin(t / 1400 + m.phase) * 0.1;
      m.dot.setPosition(m.x, m.y);
      m.dot.setAlpha(twinkle);
    }

    // Forest-edge pollen / leaf drift — world space, daytime only
    const pollenVisible = daytime && snapshot.weather !== 'rain' && snapshot.weather !== 'hail';
    const windBoost =
      snapshot.weather === 'clear' || snapshot.weather === 'partly_cloudy' ? 1 : 0.65;
    for (let i = 0; i < this.pollenMotles.length; i++) {
      const p = this.pollenMotles[i];
      p.shape.setVisible(pollenVisible);
      if (!pollenVisible) continue;
      p.worldX += p.vx * windBoost;
      p.worldY += p.vy + Math.sin(t / 2200 + p.phase) * 0.04;
      p.shape.setPosition(p.worldX, p.worldY);
      p.shape.setAlpha(0.22 + Math.sin(t / 1600 + p.phase) * 0.1);
      p.shape.setAngle(p.spin + Math.sin(t / 3000 + p.phase) * 12);
      const camLeft = cam.scrollX - 40;
      const camRight = cam.scrollX + camW + 40;
      const camTop = cam.scrollY - 40;
      const camBottom = cam.scrollY + camH + 40;
      if (
        p.worldX < camLeft ||
        p.worldX > camRight ||
        p.worldY < camTop ||
        p.worldY > camBottom
      ) {
        if (this.forestEdgeTiles.length > 0) {
          const pick =
            this.forestEdgeTiles[
              (hash(Math.floor(p.worldX), i) + i) % this.forestEdgeTiles.length
            ];
          const elev = this.heightAt(pick[0], pick[1]);
          const base = isoToScreen(pick[0] + 0.5, pick[1] + 0.5);
          p.worldX = base.x + (hash(pick[0], pick[1]) % 16) - 8;
          p.worldY = base.y - elev * 5 - 8 + (hash(pick[1], pick[0]) % 12) - 6;
        }
      }
    }

    this.updateStaffTrails();

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

        const producing =
          eq.commissioned && !eq.faulted && snapshot.irradiance > 0.3;
        let glow = this.productionGlows.get(eq.id);
        if (producing) {
          if (!glow) {
            glow = this.scene.add.ellipse(
              anchor.x,
              anchor.y + 14 - elev * 5,
              92,
              36,
              0xffe066,
              0,
            );
            glow.setBlendMode(Phaser.BlendModes.ADD);
            this.productionGlows.set(eq.id, glow);
          }
          const pulse = 0.28 + Math.sin(this.scene.time.now / 480 + hash(eq.tile.x, eq.tile.y)) * 0.1;
          glow.setPosition(anchor.x, anchor.y + 14 - elev * 5);
          glow.setScale(Math.max(def.footprint.x, def.footprint.y) * 0.62 + 0.4);
          glow.setAlpha(pulse);
          glow.setDepth(depthFor(eq.tile.x, eq.tile.y, 3));
          glow.setVisible(true);
        } else if (glow) {
          glow.setVisible(false);
        }
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
      sprite.setScale(isPv(eq.kind) ? 1.2 : eq.kind === 'office' ? 1.1 : 1);
      sprite.setAlpha(eq.commissioned ? 1 : 0.4 + eq.constructionProgress * 0.6);
      let statusTinted = false;
      if (eq.faulted) {
        sprite.setTint(0xff8899);
        statusTinted = true;
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
        statusTinted = true;
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
        statusTinted = true;
      } else {
        sprite.clearTint();
      }
      if (!statusTinted) {
        this.applyDirectionalLight(sprite, snapshot.irradiance, night);
      }

      if (eq.kind === 'substation') {
        let opsLight = this.substationLights.get(eq.id);
        if (eq.commissioned) {
          if (!opsLight) {
            opsLight = this.scene.add.ellipse(anchor.x, anchor.y + yOff - 52, 12, 9, 0xffaa22, 0);
            opsLight.setBlendMode(Phaser.BlendModes.ADD);
            this.substationLights.set(eq.id, opsLight);
          }
          const pulse = 0.5 + Math.sin(this.scene.time.now / 380 + hash(eq.tile.x, eq.tile.y)) * 0.28;
          opsLight.setPosition(anchor.x + 18, anchor.y + yOff - 54);
          opsLight.setScale(0.9 + Math.sin(this.scene.time.now / 520) * 0.12);
          opsLight.setAlpha(pulse);
          opsLight.setDepth(depthFor(eq.tile.x, eq.tile.y, 18));
          opsLight.setVisible(true);
        } else if (opsLight) {
          opsLight.setVisible(false);
        }
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
        sprite = this.scene.add.image(pos.x, pos.y - 22 - elev * 5, 'tech');
        this.entitySprites.set(staff.id, sprite);
      }
      const traveling = staff.task.type === 'travel';
      const moving =
        traveling ||
        staff.task.type === 'repair' ||
        staff.task.type === 'clean';
      const bob =
        staff.task.type === 'idle'
          ? Math.sin(this.scene.time.now / 280) * 1.5
          : Math.sin(this.scene.time.now / 95) * 4.2;
      // Slightly larger staff so Tess/Pat read against the iso farm.
      const staffScale = 1.38;
      sprite.setPosition(pos.x, pos.y - 22 - elev * 5 + bob);
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
      const squashY = traveling
        ? staffScale + Math.sin(this.scene.time.now / 95) * 0.06
        : staffScale;
      sprite.setScale(staffScale * face, squashY);
      if (traveling) {
        const walkFrame = Math.floor(this.scene.time.now / 120) % 2;
        sprite.setTexture(this.staffWalkTextures[walkFrame]);
      } else {
        sprite.setTexture('tech');
      }
      if (traveling) {
        const lastSpawn = this.staffTrailLastSpawn.get(staff.id) ?? 0;
        if (this.scene.time.now - lastSpawn > 70) {
          this.spawnStaffTrailBlob(
            staff.id,
            pos.x - 4,
            pos.y + 6 - elev * 5,
            depthFor(staff.tile.x, staff.tile.y, 6),
          );
          this.staffTrailLastSpawn.set(staff.id, this.scene.time.now);
        }
      }
      const taskTinted = staff.task.type !== 'idle';
      if (staff.task.type === 'idle') {
        sprite.clearTint();
      } else if (staff.task.type === 'repair') {
        sprite.setTint(0xffaa66);
      } else if (staff.task.type === 'clean') {
        sprite.setTint(0x88ccaa);
      } else {
        sprite.setTint(0xffcc88);
      }
      if (!taskTinted) {
        this.applyDirectionalLight(sprite, snapshot.irradiance, night);
      }

      if (
        staff.task.type === 'repair' ||
        staff.task.type === 'clean' ||
        staff.task.type === 'travel'
      ) {
        const workType = staff.task.type;
        let toolIcon = this.staffToolIcons.get(staff.id);
        if (!toolIcon) {
          toolIcon = this.scene.add.graphics();
          this.staffToolIcons.set(staff.id, toolIcon);
        }
        this.drawStaffToolIcon(toolIcon, workType, this.scene.time.now);
        toolIcon.setPosition(pos.x, pos.y - 40 - elev * 5 + bob);
        toolIcon.setDepth(depthFor(staff.tile.x, staff.tile.y, 10));
        toolIcon.setVisible(true);
      } else {
        const toolIcon = this.staffToolIcons.get(staff.id);
        toolIcon?.setVisible(false);
      }
    }

    this.updateStaffTaskLines(snapshot);

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
        this.productionGlows.get(id)?.destroy();
        this.productionGlows.delete(id);
        this.substationLights.get(id)?.destroy();
        this.substationLights.delete(id);
        this.buildRings.get(id)?.destroy();
        this.buildRings.delete(id);
        this.prevConstruction.delete(id);
        this.prevCommissioned.delete(id);
        this.entityShadows.get(id)?.destroy();
        this.entityShadows.delete(id);
        this.staffTrails.get(id)?.forEach((b) => b.img.destroy());
        this.staffTrails.delete(id);
        this.staffTrailLastSpawn.delete(id);
        this.staffLastTileX.delete(id);
        this.staffFacing.delete(id);
        this.staffToolIcons.get(id)?.destroy();
        this.staffToolIcons.delete(id);
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
    this.refreshBuildDimTiles(snapshot);

    const siteBOpen = !!snapshot.plots.find((p) => p.id === 'site_b')?.unlocked;
    if (siteBOpen && !this.lastSiteBUnlocked) {
      this.siteBUnlockPulseUntil = this.scene.time.now + 2200;
    }
    this.lastSiteBUnlocked = siteBOpen;
    if (this.siteBUnlockPulseUntil > 0) {
      const active = this.siteBUnlockPulseUntil > this.scene.time.now;
      const t = active ? 1 - (this.siteBUnlockPulseUntil - this.scene.time.now) / 2200 : 1;
      const pulse = active ? 0.55 + Math.sin(this.scene.time.now / 120) * 0.25 * (1 - t) : 0;
      for (const [key, img] of this.ground) {
        const [xs, ys] = key.split(',');
        const x = Number(xs);
        const y = Number(ys);
        if (!inRect(x, y, SITE_B)) continue;
        if (active) {
          img.setTint(Phaser.Display.Color.GetColor(140 + pulse * 80, 210 + pulse * 30, 120));
        } else {
          img.clearTint();
        }
      }
      if (!active) this.siteBUnlockPulseUntil = 0;
    }
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
      this.ghostRing?.setVisible(false);
      this.ghostInvalidX?.setVisible(false);
      this.ghostFootprintLabel?.setVisible(false);
      for (const pad of this.ghostFootprintPads) pad.setVisible(false);
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
    const t = this.scene.time.now;

    // Footprint pad + building silhouette tinted green/red.
    if (!this.ghostPad) {
      this.ghostPad = this.scene.add.image(screen.x, padY, ok ? 'ghost_ok' : 'ghost_bad');
    }
    this.ghostPad.setTexture(ok ? 'ghost_ok' : 'ghost_bad');
    this.ghostPad.setPosition(screen.x, padY);
    this.ghostPad.setScale(Math.max(def.footprint.x, def.footprint.y) * 0.7 + 0.35);
    this.ghostPad.setDepth(depthFor(tile.x, tile.y, 14));
    if (ok) {
      const pulse = 0.78 + Math.sin(t / 320) * 0.12;
      this.ghostPad.setAlpha(pulse);
    } else {
      const flash = 0.82 + Math.sin(t / 140) * 0.14;
      this.ghostPad.setAlpha(flash);
    }
    this.ghostPad.setVisible(true);

    // Invalid placement — flashing X mark over ghost
    if (!this.ghostInvalidX) {
      this.ghostInvalidX = this.scene.add.graphics();
    }
    if (!ok) {
      const xFlash = 0.72 + Math.sin(t / 100) * 0.28;
      this.ghostInvalidX.clear();
      this.ghostInvalidX.lineStyle(5.5, 0xff2244, xFlash);
      const sz = 22;
      this.ghostInvalidX.beginPath();
      this.ghostInvalidX.moveTo(screen.x - sz, padY - sz * 0.5);
      this.ghostInvalidX.lineTo(screen.x + sz, padY + sz * 0.5);
      this.ghostInvalidX.moveTo(screen.x + sz, padY - sz * 0.5);
      this.ghostInvalidX.lineTo(screen.x - sz, padY + sz * 0.5);
      this.ghostInvalidX.strokePath();
      this.ghostInvalidX.setDepth(depthFor(tile.x, tile.y, 16));
      this.ghostInvalidX.setVisible(true);
      this.ghostRing?.setVisible(false);
    } else {
      this.ghostInvalidX.setVisible(false);
      if (!this.ghostRing) {
        this.ghostRing = this.scene.add.image(screen.x, padY, 'select_ring');
        this.ghostRing.setTint(0xffffff);
      }
      const ringPulse = 0.92 + Math.sin(t / 340) * 0.1;
      const ringAlpha = 0.22 + Math.sin(t / 380) * 0.1;
      this.ghostRing.setPosition(screen.x, padY);
      this.ghostRing.setScale((Math.max(def.footprint.x, def.footprint.y) * 0.55 + 0.45) * ringPulse);
      this.ghostRing.setAlpha(ringAlpha);
      this.ghostRing.setDepth(depthFor(tile.x, tile.y, 13));
      this.ghostRing.setVisible(true);
    }

    // Multi-tile footprint — faint per-cell diamond pads (2×2 PV)
    const fpX = def.footprint.x;
    const fpY = def.footprint.y;
    const cellCount = fpX * fpY;
    while (this.ghostFootprintPads.length < cellCount) {
      const pad = this.scene.add.image(0, 0, 'ghost_footprint');
      this.ghostFootprintPads.push(pad);
    }
    let cellIdx = 0;
    for (let dy = 0; dy < fpY; dy++) {
      for (let dx = 0; dx < fpX; dx++) {
        const cx = tile.x + dx + 0.5;
        const cy = tile.y + dy + 0.5;
        const cellElev = this.heightAt(Math.floor(cx), Math.floor(cy));
        const cellScreen = isoToScreen(cx, cy);
        const pad = this.ghostFootprintPads[cellIdx];
        pad.setPosition(cellScreen.x, cellScreen.y - cellElev * 5 + 8);
        pad.setScale(0.55);
        pad.setDepth(depthFor(tile.x + dx, tile.y + dy, 13));
        pad.setAlpha(ok ? 0.28 + Math.sin(t / 400 + cellIdx) * 0.08 : 0.18);
        pad.setTint(ok ? 0x88ffbb : 0xff8899);
        pad.setVisible(cellCount > 1);
        cellIdx++;
      }
    }
    for (let i = cellCount; i < this.ghostFootprintPads.length; i++) {
      this.ghostFootprintPads[i].setVisible(false);
    }

    const tex = textureFor(snapshot.buildMode);
    if (!this.ghost) {
      this.ghost = this.scene.add.image(screen.x, screen.y + yOff, tex);
    }
    this.ghost.setTexture(tex);
    this.ghost.setPosition(screen.x, screen.y + yOff);
    this.ghost.setDepth(depthFor(tile.x, tile.y, 15));
    this.ghost.setAlpha(0.7);
    const baseScale = isPv(snapshot.buildMode) ? 1.15 : 1;
    const scalePulse = ok ? 1 + 0.05 * (0.5 + 0.5 * Math.sin(t / 280)) : 1;
    this.ghost.setScale(baseScale * scalePulse);
    this.ghost.setTint(ok ? 0x55ff99 : 0xff2244);
    this.ghost.setVisible(true);

    const showFootprintLabel = cellCount > 1;
    if (showFootprintLabel) {
      if (!this.ghostFootprintLabel) {
        this.ghostFootprintLabel = this.scene.add.text(0, 0, '', {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '13px',
          fontStyle: 'bold',
          color: ok ? '#ccffdd' : '#ffcccc',
          stroke: '#1a2230',
          strokeThickness: 3,
        });
        this.ghostFootprintLabel.setOrigin(0.5, 1);
      }
      this.ghostFootprintLabel.setText(`${fpX}×${fpY}`);
      this.ghostFootprintLabel.setPosition(screen.x, padY - 8);
      this.ghostFootprintLabel.setDepth(depthFor(tile.x, tile.y, 17));
      this.ghostFootprintLabel.setAlpha(ok ? 0.92 : 0.78);
      this.ghostFootprintLabel.setColor(ok ? '#ccffdd' : '#ffcccc');
      this.ghostFootprintLabel.setVisible(true);
    } else {
      this.ghostFootprintLabel?.setVisible(false);
    }
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
