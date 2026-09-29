import type Phaser from 'phaser';

/** Shared palette matching the Megawatt Valley concept art. */
export const Palette = {
  grassLight: 0x7ec850,
  grassMid: 0x5aae3a,
  grassDark: 0x3f8a28,
  grassDeep: 0x2f6b1c,
  dirt: 0xb8955a,
  dirtDark: 0x8a6a3a,
  gravel: 0xb8b4a8,
  gravelDark: 0x8a8678,
  gravelLite: 0xd0ccc0,
  road: 0x5a5f68,
  roadLight: 0x787e88,
  roadLine: 0xf0c84a,
  roadEdge: 0xffffff,
  waterDeep: 0x2a7ab8,
  waterMid: 0x3f9ad4,
  waterLite: 0x7ec8ef,
  waterFoam: 0xd8f0ff,
  rock: 0x8a909a,
  rockLite: 0xb0b6c0,
  rockDark: 0x5a606a,
  pine: 0x1f6b35,
  pineLite: 0x2f8f48,
  pineDark: 0x0f4a22,
  pineDeep: 0x0a3818,
  trunk: 0x6b4424,
  panelBlue: 0x1a4a9a,
  panelBlueLite: 0x2f6fd4,
  panelBlueDark: 0x0d2f6a,
  panelCell: 0x4a9aef,
  steel: 0x9aa3b0,
  steelDark: 0x5a6370,
  steelLite: 0xd0d6e0,
  concrete: 0xc8ccd4,
  concreteDark: 0x8a90a0,
  white: 0xf4f7fb,
  whiteShade: 0xd8dee8,
  window: 0x6ec8ff,
  accentOrange: 0xf06a20,
  accentYellow: 0xf5c542,
  vest: 0xff7a1a,
  hardhat: 0xffe14a,
  shadow: 0x1a2a18,
  fence: 0x707880,
  sky: 0x8ec8ef,
} as const;

type G = Phaser.GameObjects.Graphics;

/** Flat isometric diamond (tile footprint). */
export function fillDiamond(
  g: G,
  cx: number,
  cy: number,
  w: number,
  h: number,
  color: number,
  alpha = 1,
): void {
  g.fillStyle(color, alpha);
  g.beginPath();
  g.moveTo(cx, cy - h / 2);
  g.lineTo(cx + w / 2, cy);
  g.lineTo(cx, cy + h / 2);
  g.lineTo(cx - w / 2, cy);
  g.closePath();
  g.fillPath();
}

export function strokeDiamond(
  g: G,
  cx: number,
  cy: number,
  w: number,
  h: number,
  color: number,
  width = 1,
  alpha = 0.9,
): void {
  g.lineStyle(width, color, alpha);
  g.beginPath();
  g.moveTo(cx, cy - h / 2);
  g.lineTo(cx + w / 2, cy);
  g.lineTo(cx, cy + h / 2);
  g.lineTo(cx - w / 2, cy);
  g.closePath();
  g.strokePath();
}

/**
 * Soft ground shadow ellipse under objects.
 * Light from top-right → shadow biased bottom-left.
 * Default alpha raised so props read as grounded.
 */
export function groundShadow(g: G, cx: number, cy: number, w: number, h: number, alpha = 0.36): void {
  g.fillStyle(Palette.shadow, alpha * 0.55);
  g.fillEllipse(cx - 4, cy + 3, w * 1.08, h * 1.1);
  g.fillStyle(Palette.shadow, alpha);
  g.fillEllipse(cx - 2, cy + 2, w, h);
}

/**
 * Draw an isometric box.
 * `cx,cy` = center of the top face.
 * `tw,th` = top face width/height (diamond).
 * `depth` = vertical wall height in px.
 */
export function isoBox(
  g: G,
  cx: number,
  cy: number,
  tw: number,
  th: number,
  depth: number,
  top: number,
  left: number,
  right: number,
): void {
  const hw = tw / 2;
  const hh = th / 2;
  // left wall (shaded — away from top-right light)
  g.fillStyle(left, 1);
  g.beginPath();
  g.moveTo(cx - hw, cy);
  g.lineTo(cx, cy + hh);
  g.lineTo(cx, cy + hh + depth);
  g.lineTo(cx - hw, cy + depth);
  g.closePath();
  g.fillPath();
  // right wall (lit)
  g.fillStyle(right, 1);
  g.beginPath();
  g.moveTo(cx + hw, cy);
  g.lineTo(cx, cy + hh);
  g.lineTo(cx, cy + hh + depth);
  g.lineTo(cx + hw, cy + depth);
  g.closePath();
  g.fillPath();
  // top
  fillDiamond(g, cx, cy, tw, th, top);
}

export function isoRoof(
  g: G,
  cx: number,
  cy: number,
  tw: number,
  th: number,
  peak: number,
  color: number,
  shade: number,
): void {
  const hw = tw / 2;
  const hh = th / 2;
  // left roof slope (shaded)
  g.fillStyle(shade, 1);
  g.beginPath();
  g.moveTo(cx - hw, cy);
  g.lineTo(cx, cy - peak);
  g.lineTo(cx, cy + hh);
  g.closePath();
  g.fillPath();
  // right roof slope (lit)
  g.fillStyle(color, 1);
  g.beginPath();
  g.moveTo(cx + hw, cy);
  g.lineTo(cx, cy - peak);
  g.lineTo(cx, cy + hh);
  g.closePath();
  g.fillPath();
}

/** Speckled gravel / dirt pad texture inside a diamond footprint. */
export function gravelPad(g: G, cx: number, cy: number, w: number, h: number, seed = 0): void {
  fillDiamond(g, cx, cy + 2, w, h, Palette.gravelDark, 0.85);
  fillDiamond(g, cx, cy, w - 4, h - 2, Palette.gravel);
  fillDiamond(g, cx + 2, cy - 1, w * 0.55, h * 0.45, Palette.gravelLite, 0.35);
  g.fillStyle(Palette.gravelDark, 0.55);
  for (let i = 0; i < 28; i++) {
    const t = (i * 37 + seed * 17) % 100;
    const u = (i * 53 + seed * 11) % 100;
    const px = cx + ((t - 50) / 50) * (w * 0.32);
    const py = cy + ((u - 50) / 50) * (h * 0.32);
    g.fillRect(px, py, 1 + (i % 2), 1);
  }
  g.fillStyle(Palette.gravelLite, 0.5);
  for (let i = 0; i < 14; i++) {
    const t = (i * 41 + seed * 7) % 100;
    const u = (i * 29 + seed * 19) % 100;
    const px = cx + ((t - 50) / 50) * (w * 0.28);
    const py = cy + ((u - 50) / 50) * (h * 0.28);
    g.fillRect(px, py, 1, 1);
  }
}

/**
 * Chain-link fence around an isometric diamond pad.
 * Posts + dual rails + diamond mesh suggestion.
 * `edges`: which sides to draw — 'back' (NW+NE), 'front' (SW+SE), or 'all'.
 */
export function chainFence(
  g: G,
  cx: number,
  cy: number,
  w: number,
  h: number,
  postH = 12,
  posts = 7,
  edges: 'all' | 'back' | 'front' = 'all',
): void {
  const hw = w / 2;
  const hh = h / 2;
  const corners = [
    { x: cx, y: cy - hh },
    { x: cx + hw, y: cy },
    { x: cx, y: cy + hh },
    { x: cx - hw, y: cy },
  ];
  // edge indices: 0 = NE (top→right), 1 = SE (right→bottom), 2 = SW (bottom→left), 3 = NW (left→top)
  const edgeList =
    edges === 'back' ? [0, 3] : edges === 'front' ? [1, 2] : [0, 1, 2, 3];

  g.lineStyle(1, Palette.fence, 0.85);
  for (const e of edgeList) {
    const a = corners[e]!;
    const b = corners[(e + 1) % 4]!;
    g.lineBetween(a.x, a.y - postH + 2, b.x, b.y - postH + 2);
    g.lineBetween(a.x, a.y - 3, b.x, b.y - 3);
  }
  for (const e of edgeList) {
    const a = corners[e]!;
    const b = corners[(e + 1) % 4]!;
    const n = Math.max(2, Math.floor(posts / 2));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const px = a.x + (b.x - a.x) * t;
      const py = a.y + (b.y - a.y) * t;
      g.lineStyle(1.5, Palette.steelDark, 0.95);
      g.lineBetween(px, py - postH, px, py + 2);
      g.fillStyle(Palette.steelLite, 0.9);
      g.fillCircle(px, py - postH, 1.5);
    }
  }
  // mesh hint on front edges
  if (edges === 'all' || edges === 'front') {
    g.lineStyle(1, Palette.steelLite, 0.28);
    for (const e of edges === 'front' ? edgeList : [1, 2]) {
      const a = corners[e]!;
      const b = corners[(e + 1) % 4]!;
      for (let i = 1; i < 6; i++) {
        const t0 = (i - 0.4) / 6;
        const t1 = (i + 0.4) / 6;
        const x0 = a.x + (b.x - a.x) * t0;
        const y0 = a.y + (b.y - a.y) * t0;
        const x1 = a.x + (b.x - a.x) * t1;
        const y1 = a.y + (b.y - a.y) * t1;
        g.lineBetween(x0, y0 - postH * 0.65, x1, y1 - postH * 0.25);
      }
    }
  }
}

/** Stacked ceramic insulator discs. */
export function insulatorStack(g: G, x: number, y: number, discs = 4, radius = 5): void {
  for (let i = discs - 1; i >= 0; i--) {
    const dy = y - i * (radius * 0.7);
    g.fillStyle(Palette.whiteShade, 1);
    g.fillEllipse(x - 1, dy + 1, radius * 2, radius);
    g.fillStyle(Palette.white, 1);
    g.fillEllipse(x, dy, radius * 2, radius * 0.9);
    g.lineStyle(1, Palette.steelDark, 0.35);
    g.strokeEllipse(x, dy, radius * 2, radius * 0.9);
  }
  g.fillStyle(Palette.steelDark, 1);
  g.fillRect(x - 1, y - discs * (radius * 0.7) - 2, 2, discs * (radius * 0.7) + 4);
}

/**
 * Layered pine foliage with darker underside (bottom-left) for depth.
 * `variant`: 0 = standard, 1 = tall, 2 = snow-dusted tips, 3 = rounder/bushier.
 */
export function drawPineTree(
  g: G,
  cx: number,
  baseY: number,
  scale = 1,
  variant = 0,
): void {
  const trunkW = Math.max(4, Math.round(6 * scale));
  const trunkH = Math.round((variant === 3 ? 22 : 30) * scale);
  groundShadow(g, cx - 2, baseY + 2, 26 * scale, 11 * scale, 0.38);

  g.fillStyle(Palette.trunk, 1);
  g.fillRect(cx - trunkW / 2, baseY - trunkH, trunkW, trunkH);
  g.fillStyle(0x5a3820, 1);
  g.fillRect(cx - trunkW / 2, baseY - trunkH, Math.max(1, trunkW / 3), trunkH);

  type Layer = { y: number; s: number; mid: number; dark: number; lite: number };
  const layers: Layer[] =
    variant === 3
      ? [
          { y: baseY - trunkH * 0.55, s: 30 * scale, mid: Palette.pineDark, dark: Palette.pineDeep, lite: Palette.pine },
          { y: baseY - trunkH * 0.9, s: 26 * scale, mid: Palette.pine, dark: Palette.pineDark, lite: Palette.pineLite },
          { y: baseY - trunkH * 1.2, s: 20 * scale, mid: Palette.pineLite, dark: Palette.pine, lite: 0x48a858 },
          { y: baseY - trunkH * 1.42, s: 14 * scale, mid: 0x3a9a50, dark: Palette.pine, lite: 0x58b868 },
        ]
      : [
          { y: baseY - trunkH * 0.45, s: 32 * scale, mid: Palette.pineDark, dark: Palette.pineDeep, lite: Palette.pine },
          { y: baseY - trunkH * 0.85, s: 28 * scale, mid: Palette.pine, dark: Palette.pineDark, lite: Palette.pineLite },
          { y: baseY - trunkH * 1.2, s: 22 * scale, mid: Palette.pineLite, dark: Palette.pine, lite: 0x48a858 },
          { y: baseY - trunkH * 1.48, s: 15 * scale, mid: 0x3a9a50, dark: Palette.pine, lite: 0x58b868 },
        ];

  if (variant === 1) {
    layers.push({
      y: baseY - trunkH * 1.72,
      s: 10 * scale,
      mid: 0x48a858,
      dark: Palette.pineLite,
      lite: 0x68c070,
    });
  }

  for (const L of layers) {
    const half = L.s * 0.72;
    // dark underside blob (bottom-left, away from light)
    g.fillStyle(L.dark, 1);
    g.beginPath();
    g.moveTo(cx - 2, L.y - L.s * 0.85);
    g.lineTo(cx - half * 0.95, L.y + 5);
    g.lineTo(cx + half * 0.25, L.y + 5);
    g.closePath();
    g.fillPath();
    // main cone
    g.fillStyle(L.mid, 1);
    g.beginPath();
    g.moveTo(cx, L.y - L.s);
    g.lineTo(cx + half, L.y + 4);
    g.lineTo(cx - half, L.y + 4);
    g.closePath();
    g.fillPath();
    // lit right edge
    g.fillStyle(L.lite, 0.85);
    g.beginPath();
    g.moveTo(cx + 1, L.y - L.s * 0.92);
    g.lineTo(cx + half * 0.9, L.y + 2);
    g.lineTo(cx + half * 0.15, L.y + 2);
    g.closePath();
    g.fillPath();
    // snow tips
    if (variant === 2) {
      g.fillStyle(0xf0f4f8, 0.9);
      g.beginPath();
      g.moveTo(cx, L.y - L.s);
      g.lineTo(cx + half * 0.35, L.y - L.s * 0.55);
      g.lineTo(cx - half * 0.2, L.y - L.s * 0.55);
      g.closePath();
      g.fillPath();
    }
  }
}
