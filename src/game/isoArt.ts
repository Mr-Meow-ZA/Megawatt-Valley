import type Phaser from 'phaser';

/** Shared palette matching the Megawatt Valley concept art. */
export const Palette = {
  grassLight: 0x7ec850,
  grassMid: 0x5aae3a,
  grassDark: 0x3f8a28,
  grassDeep: 0x2f6b1c,
  dirt: 0xb8955a,
  dirtDark: 0x8a6a3a,
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

/** Soft ground shadow ellipse under objects (light from top-right → shadow bottom-left). */
export function groundShadow(g: G, cx: number, cy: number, w: number, h: number, alpha = 0.28): void {
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
  // left wall
  g.fillStyle(left, 1);
  g.beginPath();
  g.moveTo(cx - hw, cy);
  g.lineTo(cx, cy + hh);
  g.lineTo(cx, cy + hh + depth);
  g.lineTo(cx - hw, cy + depth);
  g.closePath();
  g.fillPath();
  // right wall
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
  // left roof slope
  g.fillStyle(shade, 1);
  g.beginPath();
  g.moveTo(cx - hw, cy);
  g.lineTo(cx, cy - peak);
  g.lineTo(cx, cy + hh);
  g.closePath();
  g.fillPath();
  // right roof slope
  g.fillStyle(color, 1);
  g.beginPath();
  g.moveTo(cx + hw, cy);
  g.lineTo(cx, cy - peak);
  g.lineTo(cx, cy + hh);
  g.closePath();
  g.fillPath();
}
