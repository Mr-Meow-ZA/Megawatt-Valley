import Phaser from 'phaser';

/**
 * Load curated Kenney / OGA sprites from /assets/game/.
 * Falls back to procedural Graphics only for ghosts / select / fault.
 */
export const ASSET_KEYS = [
  'tile_grass',
  'tile_grass_alt',
  'tile_dirt',
  'tile_road',
  'tile_road_ns',
  'tile_road_ew',
  'tile_crossroad',
  'tile_water',
  'tile_water_n',
  'tile_river',
  'tile_river_ew',
  'tile_bank',
  'tile_bank_ew',
  'tile_bridge',
  'tile_hill',
  'tile_beach',
  'tile_grass_hd_0',
  'tile_grass_hd_1',
  'tile_grass_hd_2',
  'tile_grass_hd_3',
  'tree',
  'tree_big',
  'tree_round',
  'tree_deciduous',
  'tree_sm_0',
  'tree_sm_1',
  'tree_sm_2',
  'tree_sm_3',
  'bush',
  'rock',
  'fence',
  'fence_short',
  'pv_bargain',
  'pv_premium',
  'pv_group',
  'pv_single',
  'office',
  'office_kit',
  'yard',
  'warehouse',
  'substation',
  'tank',
  'water_tower',
  'pylon',
  'chimney',
  'container',
  'van',
  'truck',
  'truck_delivery',
  'tech',
  'icon_coin',
  'icon_power',
  'icon_dollar',
] as const;

export type AssetKey = (typeof ASSET_KEYS)[number];

export function preloadGameAssets(scene: Phaser.Scene): void {
  for (const key of ASSET_KEYS) {
    scene.load.image(key, `/assets/game/${key}.png`);
  }
  }

/** Procedural overlays that don't need sourced art. */
export function generateOverlayTextures(scene: Phaser.Scene): void {
  const make = (key: string, w: number, h: number, draw: (g: Phaser.GameObjects.Graphics) => void) => {
    if (scene.textures.exists(key)) scene.textures.remove(key);
    const g = scene.make.graphics({ x: 0, y: 0 });
    draw(g);
    g.generateTexture(key, w, h);
    g.destroy();
  };

  make('ghost_ok', 100, 60, (g) => {
    g.fillStyle(0x44ff88, 0.35);
    g.beginPath();
    g.moveTo(50, 5);
    g.lineTo(95, 30);
    g.lineTo(50, 55);
    g.lineTo(5, 30);
    g.closePath();
    g.fillPath();
    g.lineStyle(2, 0x22cc66, 0.9);
    g.strokePath();
  });

  make('ghost_bad', 100, 60, (g) => {
    g.fillStyle(0xff4455, 0.35);
    g.beginPath();
    g.moveTo(50, 5);
    g.lineTo(95, 30);
    g.lineTo(50, 55);
    g.lineTo(5, 30);
    g.closePath();
    g.fillPath();
  });

  make('select_ring', 140, 70, (g) => {
    g.lineStyle(3, 0xf5c542, 0.95);
    g.beginPath();
    g.moveTo(70, 8);
    g.lineTo(130, 35);
    g.lineTo(70, 62);
    g.lineTo(10, 35);
    g.closePath();
    g.strokePath();
  });

  make('fault_icon', 32, 32, (g) => {
    g.fillStyle(0xff3344, 1);
    g.fillCircle(16, 16, 14);
    g.fillStyle(0xffffff, 1);
    g.fillRect(14, 7, 4, 12);
    g.fillRect(14, 22, 4, 4);
  });

  make('shadow_blob', 96, 48, (g) => {
    g.fillStyle(0x061208, 0.6);
    g.fillEllipse(48, 24, 90, 32);
    g.fillStyle(0x061208, 0.35);
    g.fillEllipse(44, 26, 70, 22);
  });

  make('cloud', 140, 56, (g) => {
    g.fillStyle(0xffffff, 0.7);
    g.fillEllipse(40, 30, 55, 26);
    g.fillEllipse(80, 24, 60, 30);
    g.fillEllipse(110, 32, 45, 22);
  });

  make('foam', 40, 24, (g) => {
    g.fillStyle(0xffffff, 0.55);
    g.fillEllipse(12, 12, 16, 8);
    g.fillEllipse(24, 10, 14, 7);
  });

  // Simple inverter box (no sourced match)
  make('inverter', 64, 64, (g) => {
    g.fillStyle(0x061208, 0.35);
    g.fillEllipse(30, 52, 40, 14);
    g.fillStyle(0x4a5464, 1);
    g.fillRoundedRect(16, 18, 32, 28, 3);
    g.fillStyle(0x3ddc84, 1);
    g.fillCircle(26, 30, 3);
    g.fillStyle(0xf5c542, 1);
    g.fillCircle(38, 30, 3);
  });

  // Tech sprite loaded from /assets/game/tech.png via ASSET_KEYS.
  // Procedural fallback only if the file failed to load.
  if (!scene.textures.exists('tech')) {
    make('tech', 36, 48, (g) => {
      g.fillStyle(0x061208, 0.3);
      g.fillEllipse(18, 42, 18, 8);
      g.fillStyle(0xffe14a, 1);
      g.fillEllipse(18, 10, 14, 10);
      g.fillStyle(0xe0c080, 1);
      g.fillCircle(18, 16, 5);
      g.fillStyle(0xff7a1a, 1);
      g.fillRoundedRect(10, 20, 16, 14, 2);
      g.fillStyle(0x3a4558, 1);
      g.fillRect(12, 34, 5, 10);
      g.fillRect(19, 34, 5, 10);
    });
  }

  // Locked / unavailable plot overlay
  make('tile_locked', 100, 65, (g) => {
    g.fillStyle(0x2a3a2f, 0.75);
    g.beginPath();
    g.moveTo(50, 5);
    g.lineTo(95, 30);
    g.lineTo(50, 55);
    g.lineTo(5, 30);
    g.closePath();
    g.fillPath();
    g.lineStyle(1, 0x6a7a68, 0.4);
    g.lineBetween(30, 30, 70, 30);
    g.lineBetween(50, 18, 50, 42);
  });
}
