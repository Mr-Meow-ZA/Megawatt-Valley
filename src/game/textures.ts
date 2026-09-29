import Phaser from 'phaser';
import {
  chainFence,
  drawPineTree,
  fillDiamond,
  gravelPad,
  groundShadow,
  insulatorStack,
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

/** Tiny isometric-ish car for parking lots. */
function drawCar(g: G, x: number, y: number, color: number, flip = false): void {
  const dir = flip ? -1 : 1;
  groundShadow(g, x + 2 * dir, y + 6, 22, 8, 0.28);
  g.fillStyle(color, 1);
  g.fillRoundedRect(x - 10, y, 22, 9, 2);
  g.fillStyle(0x2a3344, 0.9);
  g.fillRoundedRect(x - 10, y + 5, 22, 5, 1);
  g.fillStyle(Palette.window, 0.95);
  g.fillRect(x - 6 * dir, y + 1, 7, 4);
  g.fillStyle(0x1a1a1a, 1);
  g.fillCircle(x - 6, y + 10, 2.5);
  g.fillCircle(x + 7, y + 10, 2.5);
  g.fillStyle(0x666666, 1);
  g.fillCircle(x - 6, y + 10, 1);
  g.fillCircle(x + 7, y + 10, 1);
}

/**
 * Solar array: 4 rows × 5 panels, mounting racks, chain fence, gravel, soft shadow.
 * Light from top-right → panel glints on upper-right.
 */
function drawSolarArray(g: G, w: number, h: number, premium: boolean): void {
  const cx = w / 2;
  const baseY = h - 28;
  const padW = 138;
  const padH = 48;

  groundShadow(g, cx - 3, baseY + 10, 142, 40, 0.4);
  gravelPad(g, cx, baseY, padW, padH, premium ? 3 : 1);
  // back fence behind panels
  chainFence(g, cx, baseY, padW - 6, padH - 4, 14, 8, 'back');

  const panelColor = premium ? Palette.panelBlueDark : Palette.panelBlue;
  const cellColor = premium ? 0x5ab0ff : Palette.panelCell;
  const frameColor = premium ? Palette.accentYellow : Palette.panelBlueDark;
  const rows = 4;
  const cols = 5;
  const pw = 22;
  const ph = 13;
  const startX = 18;
  const startY = 10;
  const gapX = 26;
  const gapY = 18;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const px = startX + col * gapX + row * 2;
      const py = startY + row * gapY;
      // mounting rack legs (shadow side bottom-left)
      g.lineStyle(2, Palette.steelDark, 1);
      g.lineBetween(px + 4, py + ph, px + 2, py + ph + 10);
      g.lineBetween(px + pw - 4, py + ph, px + pw - 2, py + ph + 10);
      g.lineStyle(1, Palette.steel, 0.9);
      g.lineBetween(px + 2, py + ph + 10, px + pw - 2, py + ph + 10);
      g.lineStyle(1, Palette.steelLite, 0.7);
      g.lineBetween(px + 6, py + ph + 2, px + pw - 6, py + ph + 8);

      g.fillStyle(0x0a1a40, 0.45);
      g.fillRoundedRect(px - 1, py + 2, pw + 2, ph, 2);
      g.fillStyle(panelColor, 1);
      g.fillRoundedRect(px, py, pw, ph, 2);
      g.lineStyle(1, frameColor, premium ? 0.95 : 0.85);
      g.strokeRoundedRect(px, py, pw, ph, 2);

      g.lineStyle(1, cellColor, 0.55);
      g.lineBetween(px + 7, py + 2, px + 7, py + ph - 2);
      g.lineBetween(px + 14, py + 2, px + 14, py + ph - 2);
      g.lineBetween(px + 2, py + 6, px + pw - 2, py + 6);

      // glint (top-right light)
      g.fillStyle(0xffffff, premium ? 0.35 : 0.22);
      g.fillRect(px + pw - 8, py + 2, 5, 3);
      if (premium) {
        g.fillStyle(0xffffff, 0.18);
        g.fillRect(px + 3, py + 2, 3, 2);
      }
    }
  }

  chainFence(g, cx, baseY, padW - 6, padH - 4, 14, 8, 'front');
  g.lineStyle(2, Palette.steelLite, 0.9);
  g.lineBetween(cx - 10, baseY + padH / 2 - 2, cx + 10, baseY + padH / 2 - 2);
  g.fillStyle(Palette.accentYellow, 0.85);
  g.fillRect(cx - 3, baseY + padH / 2 - 12, 6, 3);
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

  // --- solar (larger, 4×5 detailed) ---
  make('pv_bargain', 160, 120, (g, w, h) => drawSolarArray(g, w, h, false));
  make('pv_premium', 160, 120, (g, w, h) => drawSolarArray(g, w, h, true));

  // --- inverter ---
  make('inverter', 64, 72, (g, w, h) => {
    groundShadow(g, w / 2, h - 12, 40, 16, 0.36);
    isoBox(g, w / 2, 28, 36, 20, 22, Palette.steelDark, 0x3a4250, 0x4a5464);
    g.fillStyle(0x3ddc84, 1);
    g.fillCircle(w / 2 - 6, 34, 3);
    g.fillStyle(Palette.accentYellow, 1);
    g.fillCircle(w / 2 + 6, 34, 3);
    g.fillStyle(Palette.steelLite, 1);
    g.fillRect(w / 2 - 10, 42, 20, 4);
  });

  // --- office: crisp white 2-storey + parking lot ---
  make('office', 160, 130, (g, w, h) => {
    const bx = w / 2 - 18;
    const by = 42;
    groundShadow(g, w / 2 - 4, h - 16, 130, 40, 0.4);

    // parking lot asphalt
    fillDiamond(g, w / 2 + 28, h - 28, 88, 34, 0x3a3e46);
    fillDiamond(g, w / 2 + 28, h - 30, 82, 30, Palette.road);
    // parking lines
    g.lineStyle(1, Palette.roadEdge, 0.75);
    g.lineBetween(w / 2 + 4, h - 40, w / 2 + 22, h - 28);
    g.lineBetween(w / 2 + 18, h - 42, w / 2 + 36, h - 30);
    g.lineBetween(w / 2 + 32, h - 44, w / 2 + 50, h - 32);
    g.lineBetween(w / 2 + 46, h - 42, w / 2 + 62, h - 30);

    // building footing
    fillDiamond(g, bx, by + 48, 78, 40, Palette.concreteDark, 0.6);

    // 2-storey body
    isoBox(g, bx, by, 74, 38, 44, Palette.white, Palette.whiteShade, 0xc8d0dc);
    // flat roof parapet
    fillDiamond(g, bx, by - 2, 78, 40, 0xe8eef6);
    fillDiamond(g, bx, by, 70, 34, 0xd0d8e4);
    // roof HVAC box (right/lit side)
    isoBox(g, bx + 16, by - 6, 16, 10, 6, Palette.steelLite, Palette.steelDark, Palette.steel);

    // windows — 2 floors × 3
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const wx = bx - 22 + col * 18;
        const wy = by + 10 + row * 16;
        // left-face shaded panes slightly darker
        g.fillStyle(row === 0 ? 0x4aa0d4 : Palette.window, 0.95);
        g.fillRect(wx, wy, 12, 11);
        g.lineStyle(1, 0x3a5a78, 0.85);
        g.strokeRect(wx, wy, 12, 11);
        g.lineStyle(1, 0xffffff, 0.35);
        g.lineBetween(wx + 1, wy + 1, wx + 5, wy + 1);
        // mullion
        g.lineStyle(1, 0x2a4a68, 0.5);
        g.lineBetween(wx + 6, wy, wx + 6, wy + 11);
      }
    }
    // door
    g.fillStyle(0x3a4558, 1);
    g.fillRect(bx + 10, by + 36, 12, 18);
    g.fillStyle(Palette.accentOrange, 1);
    g.fillRect(bx + 10, by + 34, 12, 3);
    g.fillStyle(Palette.hardhat, 1);
    g.fillCircle(bx + 19, by + 46, 1.5);
    // brand accent strip
    g.fillStyle(Palette.accentOrange, 1);
    g.fillRect(bx - 28, by + 4, 18, 3);

    // cars in lot
    drawCar(g, w / 2 + 18, h - 48, 0x3a6ad4, false);
    drawCar(g, w / 2 + 42, h - 40, Palette.white, true);
    drawCar(g, w / 2 + 58, h - 52, Palette.accentOrange, false);
  });

  // --- substation complex ---
  make('substation', 160, 140, (g, w, h) => {
    const cx = w / 2;
    const padY = h - 30;
    groundShadow(g, cx - 3, padY + 8, 138, 42, 0.4);

    // concrete pad
    fillDiamond(g, cx, padY + 2, 136, 46, Palette.concreteDark);
    fillDiamond(g, cx, padY, 128, 42, Palette.concrete);
    fillDiamond(g, cx + 4, padY - 2, 70, 24, 0xd8dce4, 0.4);
    // pad seams
    g.lineStyle(1, Palette.concreteDark, 0.4);
    g.lineBetween(cx - 30, padY - 8, cx + 10, padY + 10);
    g.lineBetween(cx + 20, padY - 10, cx - 10, padY + 12);

    // transformer boxes (multiple)
    isoBox(g, cx - 36, 58, 32, 18, 22, Palette.steel, Palette.steelDark, 0x7a8490);
    // cooling fins
    g.lineStyle(1, Palette.steelDark, 0.8);
    for (let i = 0; i < 5; i++) {
      g.lineBetween(cx - 48, 64 + i * 3, cx - 48, 68 + i * 3);
      g.lineBetween(cx - 50, 65 + i * 3, cx - 46, 65 + i * 3);
    }
    // yellow warning stripe
    g.fillStyle(Palette.accentYellow, 1);
    g.fillRect(cx - 42, 70, 14, 3);
    g.fillStyle(0x1a1a1a, 1);
    g.fillRect(cx - 42, 73, 14, 2);

    isoBox(g, cx - 4, 62, 28, 16, 20, Palette.steelLite, Palette.steelDark, Palette.steel);
    g.fillStyle(Palette.accentYellow, 1);
    g.fillRect(cx - 8, 72, 12, 3);

    isoBox(g, cx + 32, 66, 24, 14, 16, Palette.steel, 0x4a5460, Palette.steelLite);
    g.fillStyle(Palette.accentYellow, 0.95);
    g.fillRect(cx + 28, 74, 10, 2);

    // insulator stacks
    insulatorStack(g, cx - 36, 50, 5, 5);
    insulatorStack(g, cx - 4, 54, 4, 4.5);
    insulatorStack(g, cx + 30, 58, 4, 4);
    insulatorStack(g, cx + 48, 52, 3, 4);

    // gantry beams (A-frame lattice)
    g.lineStyle(3, Palette.steelDark, 1);
    g.lineBetween(cx - 55, 78, cx - 55, 28);
    g.lineBetween(cx + 55, 82, cx + 55, 28);
    g.lineStyle(3, Palette.steel, 1);
    g.lineBetween(cx - 55, 28, cx + 55, 28);
    g.lineBetween(cx - 55, 38, cx + 55, 38);
    // lattice cross braces on gantry posts
    g.lineStyle(1, Palette.steelLite, 0.75);
    for (let y = 32; y < 76; y += 10) {
      g.lineBetween(cx - 55, y, cx - 48, y + 8);
      g.lineBetween(cx - 48, y, cx - 55, y + 8);
      g.lineBetween(cx + 55, y, cx + 48, y + 8);
      g.lineBetween(cx + 48, y, cx + 55, y + 8);
    }
    // bus bars / wires
    g.lineStyle(1, Palette.steelDark, 0.7);
    g.lineBetween(cx - 36, 42, cx - 36, 28);
    g.lineBetween(cx - 4, 46, cx - 4, 28);
    g.lineBetween(cx + 30, 50, cx + 30, 28);
    g.lineBetween(cx + 48, 44, cx + 48, 28);
    g.lineStyle(1, Palette.accentYellow, 0.55);
    g.lineBetween(cx - 50, 34, cx + 50, 34);

    // yellow hazard poles
    g.lineStyle(2, Palette.accentYellow, 1);
    g.lineBetween(cx - 60, padY - 4, cx - 60, padY - 18);
    g.lineBetween(cx + 60, padY, cx + 60, padY - 16);
    g.fillStyle(0x1a1a1a, 1);
    g.fillRect(cx - 62, padY - 12, 4, 3);
    g.fillRect(cx + 58, padY - 10, 4, 3);

    chainFence(g, cx, padY, 130, 42, 14, 9);
  });

  // --- pylon with denser lattice ---
  make('pylon', 88, 150, (g, w, h) => {
    const cx = w / 2;
    const base = h - 10;
    const top = 18;
    groundShadow(g, cx - 3, base + 2, 42, 16, 0.38);

    const leftBase = cx - 16;
    const rightBase = cx + 16;
    const leftTop = cx - 5;
    const rightTop = cx + 5;

    // main legs
    g.lineStyle(3, Palette.steelDark, 1);
    g.lineBetween(leftBase, base, leftTop, top);
    g.lineBetween(rightBase, base, rightTop, top);
    g.lineStyle(2, Palette.steel, 0.9);
    g.lineBetween(leftBase + 1, base, leftTop + 1, top);
    g.lineBetween(rightBase - 1, base, rightTop - 1, top);

    // horizontal braces + X lattice
    const levels = [0.15, 0.28, 0.42, 0.55, 0.68, 0.8, 0.9];
    for (let i = 0; i < levels.length; i++) {
      const t = levels[i]!;
      const y = top + (base - top) * t;
      const spread = (1 - t) * 11 + 5;
      const lx = cx - spread;
      const rx = cx + spread;
      g.lineStyle(2, Palette.steel, 0.95);
      g.lineBetween(lx, y, rx, y);
      if (i < levels.length - 1) {
        const t2 = levels[i + 1]!;
        const y2 = top + (base - top) * t2;
        const spread2 = (1 - t2) * 11 + 5;
        g.lineStyle(1, Palette.steelLite, 0.75);
        g.lineBetween(lx, y, cx + spread2, y2);
        g.lineBetween(rx, y, cx - spread2, y2);
      }
    }

    // cross arms
    const arms = [
      { y: 32, span: 28 },
      { y: 48, span: 24 },
      { y: 64, span: 18 },
    ];
    for (const arm of arms) {
      g.lineStyle(3, Palette.steelDark, 1);
      g.lineBetween(cx - arm.span, arm.y, cx + arm.span, arm.y);
      g.lineStyle(1, Palette.steelLite, 0.8);
      g.lineBetween(cx - arm.span, arm.y + 3, cx + arm.span, arm.y + 3);
      // hangers + insulators
      for (const side of [-1, 1]) {
        const hx = cx + side * (arm.span - 4);
        g.lineStyle(1, Palette.steelDark, 1);
        g.lineBetween(hx, arm.y, hx, arm.y + 8);
        g.fillStyle(Palette.white, 1);
        g.fillEllipse(hx, arm.y + 10, 6, 4);
        g.fillStyle(Palette.whiteShade, 1);
        g.fillEllipse(hx, arm.y + 13, 5, 3);
      }
    }

    // peak plate
    g.fillStyle(Palette.steelLite, 1);
    g.fillRect(cx - 6, top - 2, 12, 4);
    g.fillStyle(Palette.accentYellow, 0.85);
    g.fillRect(cx - 2, top - 4, 4, 2);
  });

  // --- bridge ---
  make('bridge', 160, 80, (g, w, h) => {
    groundShadow(g, w / 2, h - 14, 130, 28, 0.32);
    isoBox(g, 40, 40, 28, 16, 24, Palette.rockLite, Palette.rockDark, Palette.rock);
    isoBox(g, w - 40, 40, 28, 16, 24, Palette.rockLite, Palette.rockDark, Palette.rock);
    fillDiamond(g, w / 2, 36, 140, 36, Palette.concrete);
    fillDiamond(g, w / 2, 34, 130, 30, Palette.road);
    g.lineStyle(2, Palette.roadLine, 0.9);
    g.lineBetween(w / 2 - 40, 34, w / 2 + 40, 34);
    g.lineStyle(3, Palette.steelDark, 1);
    g.lineBetween(20, 28, w - 20, 28);
    g.lineBetween(24, 48, w - 24, 48);
  });

  // --- pine trees ---
  make('tree', 64, 100, (g, w, h) => {
    drawPineTree(g, w / 2, h - 8, 0.95, 0);
  });

  make('tree_big', 84, 130, (g, w, h) => {
    drawPineTree(g, w / 2, h - 8, 1.25, 1);
  });

  make('tree_snow', 68, 104, (g, w, h) => {
    drawPineTree(g, w / 2, h - 8, 1.0, 2);
  });

  make('tree_round', 72, 96, (g, w, h) => {
    drawPineTree(g, w / 2, h - 8, 1.05, 3);
  });

  make('rock', 48, 36, (g, w, h) => {
    groundShadow(g, w / 2, h - 8, 30, 12, 0.32);
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
    // mesh hint
    g.lineStyle(1, Palette.steelLite, 0.25);
    for (let i = 0; i < 4; i++) {
      const x = 16 + i * 14;
      g.lineBetween(x, h - 26, x + 8, h - 16);
    }
  });

  // --- technician ---
  make('tech', 36, 56, (g, w, h) => {
    groundShadow(g, w / 2, h - 6, 16, 8, 0.32);
    g.fillStyle(Palette.hardhat, 1);
    g.fillEllipse(w / 2, 10, 16, 10);
    g.fillStyle(0xe0c080, 1);
    g.fillCircle(w / 2, 16, 6);
    g.fillStyle(Palette.vest, 1);
    g.fillRoundedRect(w / 2 - 8, 22, 16, 16, 2);
    g.fillStyle(Palette.hardhat, 1);
    g.fillRect(w / 2 - 6, 24, 3, 12);
    g.fillRect(w / 2 + 3, 24, 3, 12);
    g.fillStyle(0x3a4558, 1);
    g.fillRect(w / 2 - 6, 38, 5, 12);
    g.fillRect(w / 2 + 1, 38, 5, 12);
    g.fillStyle(Palette.steelLite, 1);
    g.fillRect(w / 2 + 8, 26, 4, 10);
  });

  // --- vehicles ---
  make('van', 72, 48, (g, w, h) => {
    groundShadow(g, w / 2, h - 8, 48, 16, 0.36);
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
    groundShadow(g, w / 2, h - 8, 56, 16, 0.36);
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
    groundShadow(g, w / 2, h - 14, 90, 30, 0.34);
    fillDiamond(g, w / 2, h - 18, 96, 32, Palette.dirt);
    isoBox(g, w / 2 - 10, 36, 56, 28, 26, 0xd8a050, 0xa86a28, 0xc48438);
    isoRoof(g, w / 2 - 10, 30, 60, 30, 14, 0x8a4030, 0x6a3020);
    g.fillStyle(0x3a2a18, 1);
    g.fillRect(w / 2 - 6, 48, 14, 20);
  });
}
