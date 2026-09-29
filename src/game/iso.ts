/** 2:1 isometric helpers. Larger tiles for concept-art density. */
export const TILE_W = 80;
export const TILE_H = 40;

export function isoToScreen(tileX: number, tileY: number): { x: number; y: number } {
  return {
    x: (tileX - tileY) * (TILE_W / 2),
    y: (tileX + tileY) * (TILE_H / 2),
  };
}

export function screenToIso(screenX: number, screenY: number): { x: number; y: number } {
  const x = screenX / (TILE_W / 2);
  const y = screenY / (TILE_H / 2);
  return {
    x: (x + y) / 2,
    y: (y - x) / 2,
  };
}

export function depthFor(tileX: number, tileY: number, bias = 0): number {
  return (tileX + tileY) * 10 + bias;
}
