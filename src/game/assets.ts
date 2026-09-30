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
  'tile_water_foam_2',
  'tile_water_foam_1',
  'tile_water_foam_0',
  'tile_grass_hd_0',
  'tile_grass_hd_1',
  'tile_grass_hd_2',
  'tile_grass_hd_3',
  'tile_grass_hd_4',
  'tile_grass_hd_5',
  'tile_grass_hd_6',
  'tile_grass_hd_7',
  'mountain_0',
  'mountain_1',
  'mountain_2',
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
  'stump',
  'log',
  'fence',
  'fence_short',
  'foam_strip_0',
  'foam_strip_1',
  'foam_strip_2',
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
    g.fillStyle(0xff4455, 0.42);
    g.beginPath();
    g.moveTo(50, 5);
    g.lineTo(95, 30);
    g.lineTo(50, 55);
    g.lineTo(5, 30);
    g.closePath();
    g.fillPath();
    g.lineStyle(3.5, 0xff1122, 1);
    g.strokePath();
    g.lineStyle(2, 0xff6677, 0.75);
    g.beginPath();
    g.moveTo(50, 10);
    g.lineTo(50, 50);
    g.strokePath();
  });

  make('ghost_footprint', 100, 60, (g) => {
    g.fillStyle(0x44ff88, 0.08);
    g.beginPath();
    g.moveTo(50, 5);
    g.lineTo(95, 30);
    g.lineTo(50, 55);
    g.lineTo(5, 30);
    g.closePath();
    g.fillPath();
    g.lineStyle(1, 0x88ffbb, 0.35);
    g.strokePath();
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

  make('fault_halo', 64, 64, (g) => {
    g.fillStyle(0xff2233, 0.22);
    g.fillCircle(32, 32, 30);
    g.fillStyle(0xff4455, 0.35);
    g.fillCircle(32, 32, 20);
    g.fillStyle(0xff6677, 0.18);
    g.fillCircle(32, 32, 10);
  });

  make('hover_tile', 100, 60, (g) => {
    g.fillStyle(0xffffff, 0.12);
    g.beginPath();
    g.moveTo(50, 5);
    g.lineTo(95, 30);
    g.lineTo(50, 55);
    g.lineTo(5, 30);
    g.closePath();
    g.fillPath();
    g.lineStyle(1.5, 0xffffff, 0.28);
    g.strokePath();
  });

  make('gravel_pad', 100, 60, (g) => {
    g.fillStyle(0x6a6258, 0.9);
    g.beginPath();
    g.moveTo(50, 5);
    g.lineTo(95, 30);
    g.lineTo(50, 55);
    g.lineTo(5, 30);
    g.closePath();
    g.fillPath();
    g.fillStyle(0x9a9488, 0.85);
    g.beginPath();
    g.moveTo(50, 10);
    g.lineTo(88, 30);
    g.lineTo(50, 50);
    g.lineTo(12, 30);
    g.closePath();
    g.fillPath();
    g.fillStyle(0xb8b4a8, 0.55);
    for (let i = 0; i < 18; i++) {
      const px = 18 + (i * 17) % 64;
      const py = 14 + (i * 23) % 32;
      g.fillRect(px, py, 2, 1);
    }
    g.lineStyle(1, 0x5a5448, 0.35);
    g.beginPath();
    g.moveTo(50, 5);
    g.lineTo(95, 30);
    g.lineTo(50, 55);
    g.lineTo(5, 30);
    g.closePath();
    g.strokePath();
  });

  make('build_ring', 80, 80, (g) => {
    g.lineStyle(3, 0xf5c542, 0.75);
    g.strokeCircle(40, 40, 28);
    g.lineStyle(2, 0xffe88a, 0.45);
    g.strokeCircle(40, 40, 22);
  });

  const drawFlower = (petal: number, center: number) => (g: Phaser.GameObjects.Graphics) => {
    g.fillStyle(0x2a6a28, 1);
    g.fillRect(7, 14, 2, 6);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      g.fillStyle(petal, 0.95);
      g.fillEllipse(8 + Math.cos(a) * 4, 10 + Math.sin(a) * 4, 4, 3);
    }
    g.fillStyle(center, 1);
    g.fillCircle(8, 10, 2.5);
  };

  make('flower_0', 16, 20, drawFlower(0xff6a8a, 0xffe14a));
  make('flower_1', 16, 20, drawFlower(0xffb84a, 0xff6688));

  make('shadow_blob', 96, 48, (g) => {
    g.fillStyle(0x061208, 0.6);
    g.fillEllipse(48, 24, 90, 32);
    g.fillStyle(0x061208, 0.35);
    g.fillEllipse(44, 26, 70, 22);
  });

  make('cloud', 140, 56, (g) => {
    g.fillStyle(0xffffff, 0.55);
    g.fillEllipse(28, 32, 44, 22);
    g.fillStyle(0xffffff, 0.72);
    g.fillEllipse(58, 26, 52, 28);
    g.fillStyle(0xffffff, 0.62);
    g.fillEllipse(92, 30, 40, 20);
    g.fillStyle(0xffffff, 0.45);
    g.fillEllipse(72, 38, 36, 16);
  });

  make('cloud_soft', 180, 64, (g) => {
    g.fillStyle(0xffffff, 0.42);
    g.fillEllipse(36, 36, 56, 24);
    g.fillStyle(0xffffff, 0.58);
    g.fillEllipse(78, 28, 64, 30);
    g.fillStyle(0xffffff, 0.5);
    g.fillEllipse(120, 34, 48, 22);
    g.fillStyle(0xffffff, 0.38);
    g.fillEllipse(58, 42, 70, 18);
    g.fillStyle(0xffffff, 0.32);
    g.fillEllipse(100, 44, 38, 14);
  });

  make('cloud_wide', 220, 52, (g) => {
    g.fillStyle(0xffffff, 0.48);
    g.fillEllipse(50, 28, 80, 26);
    g.fillStyle(0xffffff, 0.65);
    g.fillEllipse(110, 24, 90, 32);
    g.fillStyle(0xffffff, 0.55);
    g.fillEllipse(170, 28, 70, 24);
    g.fillStyle(0xffffff, 0.35);
    g.fillEllipse(130, 36, 60, 16);
  });

  make('foam', 40, 24, (g) => {
    g.fillStyle(0xffffff, 0.55);
    g.fillEllipse(12, 12, 16, 8);
    g.fillEllipse(24, 10, 14, 7);
  });

  // Compact inverter cabinet with vents + status LEDs
  make('inverter', 72, 72, (g) => {
    g.fillStyle(0x061208, 0.4);
    g.fillEllipse(34, 60, 48, 16);
    g.fillStyle(0x3a4454, 1);
    g.fillRoundedRect(18, 14, 36, 42, 4);
    g.fillStyle(0x2a3344, 1);
    g.fillRoundedRect(22, 18, 28, 20, 2);
    g.lineStyle(1, 0x5a6a7a, 0.9);
    for (let i = 0; i < 4; i++) g.lineBetween(24, 22 + i * 4, 48, 22 + i * 4);
    g.fillStyle(0x1a2230, 1);
    g.fillRoundedRect(22, 42, 28, 10, 2);
    g.fillStyle(0x3ddc84, 1);
    g.fillCircle(28, 47, 2.5);
    g.fillStyle(0xf5c542, 1);
    g.fillCircle(36, 47, 2.5);
    g.fillStyle(0x6ec8ff, 1);
    g.fillCircle(44, 47, 2.5);
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

  // Locked plot hatch overlay — sits on grass, not a flat replacement tile
  make('tile_locked_hatch', 100, 65, (g) => {
    g.fillStyle(0x5a6a58, 0.18);
    g.beginPath();
    g.moveTo(50, 5);
    g.lineTo(95, 30);
    g.lineTo(50, 55);
    g.lineTo(5, 30);
    g.closePath();
    g.fillPath();
    g.lineStyle(1, 0x3a4a38, 0.32);
    for (let i = -50; i < 100; i += 7) {
      g.lineBetween(5 + i, 8, 45 + i, 52);
    }
    for (let i = -50; i < 100; i += 7) {
      g.lineBetween(95 - i, 8, 55 - i, 52);
    }
    g.lineStyle(1, 0x7a8a70, 0.28);
    g.strokePath();
  });
}
