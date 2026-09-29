import Phaser from 'phaser';
import {
  fillDiamond,
  groundShadow,
  isoBox,
  isoRoof,
  Palette,
  strokeDiamond,
} from './isoArt';
import { TILE_H, TILE_W } from './iso';

type G = Phaser.GameObjects.Graphics;

function drawGrassTile(g: G, w: number, h: number, variant: number): void {
  const cx = w / 2;
  const cy = h / 2 - 2;
  fillDiamond(g, cx, cy + 3, w - 2, TILE_H - 2, Palette.grassDeep, 0.55);
  fillDiamond(g, cx, cy, w - 2, TILE_H - 2, Palette.grassMid);
  fillDiamond(g, cx, cy - 1, w - 14, TILE_H - 10, Palette.grassLight, 0.55);
  // blade speckles
  g.fillStyle(Palette.grassLight, 0.85);
  for (let i = 0; i < 8; i++) {
    const t = (i * 37 + variant * 13) % 100;
    const u = (i * 53 + variant * 7) % 100;
    const px = cx + ((t - 50) / 50) * (w * 0.28);
    const py = cy + ((u - 50) / 50) * (TILE_H * 0.28);
    g.fillRect(px, py, 2, 2);
  }
  strokeDiamond(g, cx, cy, w - 2, TILE_H - 2, Palette.grassDeep, 1, 0.35);
}

function drawSolarArray(g: G, w: number, h: number, premium: boolean): void {
  const cx = w / 2;
  const baseY = h - 22;
  groundShadow(g, cx, baseY + 8, 110, 36, 0.3);
  // gravel pad
  fillDiamond(g, cx, baseY, 118, 42, Palette.dirtDark);
  fillDiamond(g, cx, baseY - 1, 108, 36, Palette.dirt);
  // fence posts
  g.lineStyle(1, Palette.fence, 0.9);
  for (let i = 0; i < 5; i++) {
    const fx = 18 + i * 24;
    g.lineBetween(fx, baseY - 8, fx, baseY + 6);
  }
  g.lineStyle(1, Palette.steelLite, 0.5);
  g.lineBetween(18, baseY - 6, w - 18, baseY - 6);

  // three rows of tilted panels
  const panelColor = premium ? Palette.panelBlueDark : Palette.panelBlue;
  const cellColor = premium ? 0x5ab0ff : Palette.panelCell;
  for (let row = 0; row < 3; row++) {
    const ry = 14 + row * 16;
    for (let col = 0; col < 4; col++) {
      const px = 16 + col * 28;
      // rack leg
      g.lineStyle(2, Palette.steel, 1);
      g.lineBetween(px + 6, ry + 18, px + 4, ry + 28);
      g.lineBetween(px + 20, ry + 18, px + 22, ry + 28);
      // panel face (tilted parallelogram-ish rect)
      g.fillStyle(panelColor, 1);
      g.fillRoundedRect(px, ry, 24, 16, 2);
      if (premium) {
        g.lineStyle(1, Palette.accentYellow, 0.9);
        g.strokeRoundedRect(px, ry, 24, 16, 2);
      } else {
        g.lineStyle(1, Palette.panelBlueDark, 1);
        g.strokeRoundedRect(px, ry, 24, 16, 2);
      }
      g.lineStyle(1, cellColor, 0.65);
      g.lineBetween(px + 8, ry + 2, px + 8, ry + 14);
      g.lineBetween(px + 16, ry + 2, px + 16, ry + 14);
      g.lineBetween(px + 2, ry + 8, px + 22, ry + 8);
      // glint
      g.fillStyle(0xffffff, 0.25);
      g.fillRect(px + 3, ry + 3, 4, 3);
    }
  }
}

export function generateTextures(scene: Phaser.Scene): void {
  const make = (key: string, w: number, h: number, draw: (g: G, w: number, h: number) => void) => {
    if (scene.textures.exists(key)) scene.textures.remove(key);
    const g = scene.make.graphics({ x: 0, y: 0 });
    draw(g, w, h);
    g.generateTexture(key, w, h);
    g.destroy();
  };

  // --- ground tiles ---
  for (let v = 0; v < 4; v++) {
    make(`tile_grass_${v}`, TILE_W, TILE_H + 12, (g, w, h) => drawGrassTile(g, w, h, v));
  }
  make('tile_grass', TILE_W, TILE_H + 12, (g, w, h) => drawGrassTile(g, w, h, 0));

  make('tile_dirt', TILE_W, TILE_H + 12, (g, w, h) => {
    const cx = w / 2;
    const cy = h / 2 - 2;
    fillDiamond(g, cx, cy + 2, w - 2, TILE_H - 2, Palette.dirtDark);
    fillDiamond(g, cx, cy, w - 2, TILE_H - 2, Palette.dirt);
    g.fillStyle(Palette.dirtDark, 0.5);
    g.fillCircle(cx - 10, cy, 3);
    g.fillCircle(cx + 12, cy + 4, 2);
    strokeDiamond(g, cx, cy, w - 2, TILE_H - 2, Palette.dirtDark, 1, 0.4);
  });

  make('tile_road', TILE_W, TILE_H + 12, (g, w, h) => {
    const cx = w / 2;
    const cy = h / 2 - 2;
    fillDiamond(g, cx, cy + 2, w - 2, TILE_H - 2, 0x3a3e46);
    fillDiamond(g, cx, cy, w - 2, TILE_H - 2, Palette.road);
    fillDiamond(g, cx, cy - 1, w - 20, TILE_H - 14, Palette.roadLight, 0.35);
    // yellow dashes along long diagonal
    g.lineStyle(2, Palette.roadLine, 0.95);
    g.lineBetween(cx - 10, cy - 2, cx - 2, cy + 2);
    g.lineBetween(cx + 4, cy - 4, cx + 12, cy);
    strokeDiamond(g, cx, cy, w - 2, TILE_H - 2, 0x2a2e34, 1, 0.5);
  });

  make('tile_road_mark', TILE_W, TILE_H + 12, (g, w, h) => {
    const cx = w / 2;
    const cy = h / 2 - 2;
    fillDiamond(g, cx, cy + 2, w - 2, TILE_H - 2, 0x3a3e46);
    fillDiamond(g, cx, cy, w - 2, TILE_H - 2, Palette.road);
    g.lineStyle(2, Palette.roadEdge, 0.85);
    g.lineBetween(cx - 8, cy + 4, cx + 8, cy - 4);
    strokeDiamond(g, cx, cy, w - 2, TILE_H - 2, 0x2a2e34, 1, 0.5);
  });

  make('tile_water', TILE_W, TILE_H + 12, (g, w, h) => {
    const cx = w / 2;
    const cy = h / 2 - 2;
    fillDiamond(g, cx, cy + 2, w - 2, TILE_H - 2, Palette.waterDeep);
    fillDiamond(g, cx, cy, w - 2, TILE_H - 2, Palette.waterMid);
    fillDiamond(g, cx, cy - 3, w - 22, TILE_H - 16, Palette.waterLite, 0.45);
    g.lineStyle(1, Palette.waterFoam, 0.55);
    g.lineBetween(cx - 16, cy, cx - 4, cy - 6);
    g.lineBetween(cx + 2, cy + 4, cx + 14, cy - 2);
    strokeDiamond(g, cx, cy, w - 2, TILE_H - 2, 0x1a5a88, 1, 0.45);
  });

  make('tile_bank', TILE_W, TILE_H + 12, (g, w, h) => {
    const cx = w / 2;
    const cy = h / 2 - 2;
    fillDiamond(g, cx, cy + 2, w - 2, TILE_H - 2, Palette.rockDark);
    fillDiamond(g, cx, cy, w - 2, TILE_H - 2, Palette.rock);
    fillDiamond(g, cx - 8, cy - 2, 20, 12, Palette.grassMid, 0.7);
    g.fillStyle(Palette.rockLite, 0.7);
    g.fillEllipse(cx + 8, cy + 2, 12, 6);
    strokeDiamond(g, cx, cy, w - 2, TILE_H - 2, Palette.rockDark, 1, 0.4);
  });

  make('tile_locked', TILE_W, TILE_H + 12, (g, w, h) => {
    const cx = w / 2;
    const cy = h / 2 - 2;
    fillDiamond(g, cx, cy, w - 2, TILE_H - 2, 0x3d4a3f, 0.75);
    strokeDiamond(g, cx, cy, w - 2, TILE_H - 2, 0x243028, 1, 0.6);
    g.lineStyle(1, 0x6a7a68, 0.35);
    g.lineBetween(cx - 12, cy, cx + 12, cy);
    g.lineBetween(cx, cy - 8, cx, cy + 8);
  });

  make('ghost_ok', TILE_W, TILE_H + 12, (g, w, h) => {
    fillDiamond(g, w / 2, h / 2 - 2, w - 2, TILE_H - 2, 0x44ff88, 0.35);
    strokeDiamond(g, w / 2, h / 2 - 2, w - 2, TILE_H - 2, 0x22cc66, 2, 0.8);
  });

  make('ghost_bad', TILE_W, TILE_H + 12, (g, w, h) => {
    fillDiamond(g, w / 2, h / 2 - 2, w - 2, TILE_H - 2, 0xff4455, 0.35);
    strokeDiamond(g, w / 2, h / 2 - 2, w - 2, TILE_H - 2, 0xcc2233, 2, 0.8);
  });

  // --- solar ---
  make('pv_bargain', 128, 96, (g, w, h) => drawSolarArray(g, w, h, false));
  make('pv_premium', 128, 96, (g, w, h) => drawSolarArray(g, w, h, true));

  // --- inverter ---
  make('inverter', 64, 72, (g, w, h) => {
    groundShadow(g, w / 2, h - 12, 40, 16, 0.3);
    isoBox(g, w / 2, 28, 36, 20, 22, Palette.steelDark, 0x3a4250, 0x4a5464);
    g.fillStyle(0x3ddc84, 1);
    g.fillCircle(w / 2 - 6, 34, 3);
    g.fillStyle(Palette.accentYellow, 1);
    g.fillCircle(w / 2 + 6, 34, 3);
    g.fillStyle(Palette.steelLite, 1);
    g.fillRect(w / 2 - 10, 42, 20, 4);
  });

  // --- office (white modern 2-storey) ---
  make('office', 140, 120, (g, w, h) => {
    groundShadow(g, w / 2, h - 18, 100, 36, 0.32);
    // parking pad
    fillDiamond(g, w / 2 + 8, h - 22, 90, 32, Palette.road);
    g.lineStyle(1, Palette.roadEdge, 0.7);
    g.lineBetween(w / 2 - 10, h - 28, w / 2 + 20, h - 18);
    // building body
    isoBox(g, w / 2 - 8, 40, 70, 36, 38, Palette.white, Palette.whiteShade, 0xc0c8d4);
    // flat roof ledge
    fillDiamond(g, w / 2 - 8, 36, 74, 38, 0xe8eef6);
    // windows grid
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const wx = w / 2 - 28 + col * 16;
        const wy = 48 + row * 14;
        g.fillStyle(Palette.window, 0.95);
        g.fillRect(wx, wy, 10, 10);
        g.lineStyle(1, 0x3a6a90, 0.7);
        g.strokeRect(wx, wy, 10, 10);
      }
    }
    // door
    g.fillStyle(0x4a5568, 1);
    g.fillRect(w / 2 + 8, 68, 10, 16);
    // sign accent
    g.fillStyle(Palette.accentOrange, 1);
    g.fillRect(w / 2 - 30, 44, 14, 3);
    // parked car
    g.fillStyle(0x3a6ad4, 1);
    g.fillRoundedRect(w / 2 + 28, h - 40, 22, 10, 2);
    g.fillStyle(0x222222, 1);
    g.fillCircle(w / 2 + 32, h - 28, 3);
    g.fillCircle(w / 2 + 46, h - 28, 3);
  });

  // --- substation ---
  make('substation', 140, 120, (g, w, h) => {
    groundShadow(g, w / 2, h - 16, 100, 34, 0.3);
    fillDiamond(g, w / 2, h - 20, 100, 34, Palette.concreteDark);
    fillDiamond(g, w / 2, h - 22, 92, 30, Palette.concrete);
    // transformer boxes
    isoBox(g, w / 2 - 24, 50, 28, 16, 20, Palette.steel, Palette.steelDark, 0x6a7380);
    isoBox(g, w / 2 + 10, 54, 24, 14, 18, Palette.steelLite, Palette.steelDark, Palette.steel);
    // ceramic insulators
    g.fillStyle(Palette.white, 1);
    for (let i = 0; i < 3; i++) {
      g.fillEllipse(w / 2 - 24, 42 - i * 5, 10, 5);
    }
    // bus bars / gantry
    g.lineStyle(3, Palette.steelDark, 1);
    g.lineBetween(w / 2 - 40, 36, w / 2 + 40, 36);
    g.lineStyle(2, Palette.accentYellow, 0.9);
    g.lineBetween(w / 2 - 30, 30, w / 2 - 30, 50);
    g.lineBetween(w / 2 + 20, 30, w / 2 + 20, 54);
    // fence
    g.lineStyle(1, Palette.fence, 0.85);
    g.lineBetween(w / 2 - 48, h - 34, w / 2 + 48, h - 34);
    for (let i = 0; i < 7; i++) {
      const fx = w / 2 - 48 + i * 16;
      g.lineBetween(fx, h - 34, fx, h - 22);
    }
  });

  // --- pylon ---
  make('pylon', 80, 140, (g, w, h) => {
    groundShadow(g, w / 2, h - 8, 36, 14, 0.28);
    g.lineStyle(3, Palette.steelDark, 1);
    g.lineBetween(w / 2 - 14, h - 10, w / 2 - 4, 20);
    g.lineBetween(w / 2 + 14, h - 10, w / 2 + 4, 20);
    g.lineBetween(w / 2 - 4, 20, w / 2 + 4, 20);
    // cross arms
    g.lineStyle(2, Palette.steel, 1);
    g.lineBetween(w / 2 - 22, 34, w / 2 + 22, 34);
    g.lineBetween(w / 2 - 18, 50, w / 2 + 18, 50);
    g.lineBetween(w / 2 - 12, 70, w / 2 + 12, 70);
    // lattice
    g.lineStyle(1, Palette.steelLite, 0.7);
    g.lineBetween(w / 2 - 12, h - 20, w / 2 + 8, 40);
    g.lineBetween(w / 2 + 12, h - 20, w / 2 - 8, 40);
    // insulators
    g.fillStyle(Palette.white, 1);
    g.fillCircle(w / 2 - 20, 34, 3);
    g.fillCircle(w / 2 + 20, 34, 3);
    g.fillCircle(w / 2 - 16, 50, 3);
    g.fillCircle(w / 2 + 16, 50, 3);
  });

  // --- bridge ---
  make('bridge', 160, 80, (g, w, h) => {
    groundShadow(g, w / 2, h - 14, 130, 28, 0.25);
    // stone piers
    isoBox(g, 40, 40, 28, 16, 24, Palette.rockLite, Palette.rockDark, Palette.rock);
    isoBox(g, w - 40, 40, 28, 16, 24, Palette.rockLite, Palette.rockDark, Palette.rock);
    // deck
    fillDiamond(g, w / 2, 36, 140, 36, Palette.concrete);
    fillDiamond(g, w / 2, 34, 130, 30, Palette.road);
    g.lineStyle(2, Palette.roadLine, 0.9);
    g.lineBetween(w / 2 - 40, 34, w / 2 + 40, 34);
    // rails
    g.lineStyle(3, Palette.steelDark, 1);
    g.lineBetween(20, 28, w - 20, 28);
    g.lineBetween(24, 48, w - 24, 48);
  });

  // --- pine tree ---
  make('tree', 64, 96, (g, w, h) => {
    groundShadow(g, w / 2, h - 10, 28, 12, 0.3);
    g.fillStyle(Palette.trunk, 1);
    g.fillRect(w / 2 - 3, h - 36, 6, 28);
    // layered cones
    const layers = [
      { y: h - 70, s: 28, c: Palette.pineDark },
      { y: h - 58, s: 24, c: Palette.pine },
      { y: h - 46, s: 18, c: Palette.pineLite },
    ];
    for (const L of layers) {
      g.fillStyle(L.c, 1);
      g.beginPath();
      g.moveTo(w / 2, L.y - L.s);
      g.lineTo(w / 2 + L.s * 0.7, L.y + 4);
      g.lineTo(w / 2 - L.s * 0.7, L.y + 4);
      g.closePath();
      g.fillPath();
    }
  });

  make('tree_big', 80, 120, (g, w, h) => {
    groundShadow(g, w / 2, h - 10, 36, 14, 0.32);
    g.fillStyle(Palette.trunk, 1);
    g.fillRect(w / 2 - 4, h - 44, 8, 36);
    const layers = [
      { y: h - 90, s: 36, c: Palette.pineDark },
      { y: h - 74, s: 30, c: Palette.pine },
      { y: h - 58, s: 22, c: Palette.pineLite },
    ];
    for (const L of layers) {
      g.fillStyle(L.c, 1);
      g.beginPath();
      g.moveTo(w / 2, L.y - L.s);
      g.lineTo(w / 2 + L.s * 0.72, L.y + 6);
      g.lineTo(w / 2 - L.s * 0.72, L.y + 6);
      g.closePath();
      g.fillPath();
    }
  });

  make('rock', 48, 36, (g, w, h) => {
    groundShadow(g, w / 2, h - 8, 30, 12, 0.25);
    g.fillStyle(Palette.rockDark, 1);
    g.fillEllipse(w / 2, h - 14, 34, 16);
    g.fillStyle(Palette.rock, 1);
    g.fillEllipse(w / 2 - 2, h - 16, 28, 14);
    g.fillStyle(Palette.rockLite, 0.7);
    g.fillEllipse(w / 2 - 6, h - 18, 12, 7);
  });

  make('fence', 80, 40, (g, w, h) => {
    g.lineStyle(2, Palette.fence, 0.95);
    g.lineBetween(8, h - 18, w - 8, h - 18);
    for (let i = 0; i < 5; i++) {
      const x = 12 + i * 14;
      g.lineBetween(x, h - 28, x, h - 12);
    }
    g.lineStyle(1, Palette.steelLite, 0.5);
    g.lineBetween(8, h - 24, w - 8, h - 24);
  });

  // --- technician ---
  make('tech', 36, 56, (g, w, h) => {
    groundShadow(g, w / 2, h - 6, 16, 8, 0.25);
    // hardhat
    g.fillStyle(Palette.hardhat, 1);
    g.fillEllipse(w / 2, 10, 16, 10);
    g.fillStyle(0xe0c080, 1);
    g.fillCircle(w / 2, 16, 6);
    // vest
    g.fillStyle(Palette.vest, 1);
    g.fillRoundedRect(w / 2 - 8, 22, 16, 16, 2);
    g.fillStyle(Palette.hardhat, 1);
    g.fillRect(w / 2 - 6, 24, 3, 12);
    g.fillRect(w / 2 + 3, 24, 3, 12);
    // pants
    g.fillStyle(0x3a4558, 1);
    g.fillRect(w / 2 - 6, 38, 5, 12);
    g.fillRect(w / 2 + 1, 38, 5, 12);
    // tool
    g.fillStyle(Palette.steelLite, 1);
    g.fillRect(w / 2 + 8, 26, 4, 10);
  });

  // --- vehicles ---
  make('van', 72, 48, (g, w, h) => {
    groundShadow(g, w / 2, h - 8, 48, 16, 0.3);
    g.fillStyle(Palette.white, 1);
    g.fillRoundedRect(10, 12, 50, 20, 3);
    g.fillStyle(Palette.whiteShade, 1);
    g.fillRoundedRect(10, 22, 50, 12, 2);
    g.fillStyle(Palette.window, 0.95);
    g.fillRect(14, 14, 12, 8);
    g.fillStyle(Palette.accentOrange, 1);
    g.fillRect(40, 14, 16, 6);
    g.fillStyle(0x222222, 1);
    g.fillCircle(22, h - 12, 5);
    g.fillCircle(52, h - 12, 5);
    g.fillStyle(0x666666, 1);
    g.fillCircle(22, h - 12, 2);
    g.fillCircle(52, h - 12, 2);
  });

  make('truck', 84, 52, (g, w, h) => {
    groundShadow(g, w / 2, h - 8, 56, 16, 0.3);
    g.fillStyle(Palette.accentOrange, 1);
    g.fillRoundedRect(8, 14, 40, 18, 3);
    g.fillStyle(Palette.white, 1);
    g.fillRoundedRect(48, 16, 26, 16, 3);
    g.fillStyle(Palette.window, 0.95);
    g.fillRect(54, 18, 12, 8);
    g.fillStyle(0x222222, 1);
    g.fillCircle(22, h - 12, 5);
    g.fillCircle(40, h - 12, 5);
    g.fillCircle(64, h - 12, 5);
  });

  make('fault_icon', 28, 28, (g) => {
    g.fillStyle(0xff3344, 1);
    g.fillCircle(14, 14, 12);
    g.fillStyle(0xffffff, 1);
    g.fillRect(12, 6, 4, 10);
    g.fillRect(12, 18, 4, 4);
  });

  make('select_ring', 120, 64, (g, w, h) => {
    strokeDiamond(g, w / 2, h / 2, 108, 44, Palette.accentYellow, 2, 0.95);
    strokeDiamond(g, w / 2, h / 2, 100, 40, 0xffffff, 1, 0.35);
  });

  make('cloud', 120, 48, (g) => {
    g.fillStyle(0xffffff, 0.75);
    g.fillEllipse(40, 28, 50, 24);
    g.fillEllipse(70, 22, 56, 28);
    g.fillEllipse(96, 30, 40, 20);
  });

  // maintenance yard shed
  make('yard', 120, 90, (g, w, h) => {
    groundShadow(g, w / 2, h - 14, 90, 30, 0.28);
    fillDiamond(g, w / 2, h - 18, 96, 32, Palette.dirt);
    isoBox(g, w / 2 - 10, 36, 56, 28, 26, 0xd8a050, 0xa86a28, 0xc48438);
    isoRoof(g, w / 2 - 10, 30, 60, 30, 14, 0x8a4030, 0x6a3020);
    g.fillStyle(0x3a2a18, 1);
    g.fillRect(w / 2 - 6, 48, 14, 20);
  });
}
