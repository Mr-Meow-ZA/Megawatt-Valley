import Phaser from 'phaser';
import { TILE_H, TILE_W } from './iso';

type G = Phaser.GameObjects.Graphics;

function diamond(g: G, cx: number, cy: number, w: number, h: number, color: number, alpha = 1): void {
  g.fillStyle(color, alpha);
  g.beginPath();
  g.moveTo(cx, cy - h / 2);
  g.lineTo(cx + w / 2, cy);
  g.lineTo(cx, cy + h / 2);
  g.lineTo(cx - w / 2, cy);
  g.closePath();
  g.fillPath();
}

function strokeDiamond(g: G, cx: number, cy: number, w: number, h: number, color: number, width = 1): void {
  g.lineStyle(width, color, 0.85);
  g.beginPath();
  g.moveTo(cx, cy - h / 2);
  g.lineTo(cx + w / 2, cy);
  g.lineTo(cx, cy + h / 2);
  g.lineTo(cx - w / 2, cy);
  g.closePath();
  g.strokePath();
}

export function generateTextures(scene: Phaser.Scene): void {
  const make = (key: string, w: number, h: number, draw: (g: G, w: number, h: number) => void) => {
    if (scene.textures.exists(key)) return;
    const g = scene.make.graphics({ x: 0, y: 0 });
    draw(g, w, h);
    g.generateTexture(key, w, h);
    g.destroy();
  };

  make('tile_grass', TILE_W, TILE_H + 8, (g, w, h) => {
    diamond(g, w / 2, h / 2 - 2, w - 2, TILE_H - 2, 0x4fae5a);
    diamond(g, w / 2, h / 2 - 2, w - 10, TILE_H - 8, 0x5fc86a, 0.55);
    strokeDiamond(g, w / 2, h / 2 - 2, w - 2, TILE_H - 2, 0x2f6d38);
  });

  make('tile_dirt', TILE_W, TILE_H + 8, (g, w, h) => {
    diamond(g, w / 2, h / 2 - 2, w - 2, TILE_H - 2, 0x9a7a4a);
    strokeDiamond(g, w / 2, h / 2 - 2, w - 2, TILE_H - 2, 0x6b5230);
  });

  make('tile_road', TILE_W, TILE_H + 8, (g, w, h) => {
    diamond(g, w / 2, h / 2 - 2, w - 2, TILE_H - 2, 0x6a6f78);
    diamond(g, w / 2, h / 2 - 2, w - 18, TILE_H - 14, 0x8a9099, 0.5);
    strokeDiamond(g, w / 2, h / 2 - 2, w - 2, TILE_H - 2, 0x3d4248);
  });

  make('tile_water', TILE_W, TILE_H + 8, (g, w, h) => {
    diamond(g, w / 2, h / 2 - 2, w - 2, TILE_H - 2, 0x3a8ec9);
    diamond(g, w / 2, h / 2 - 4, w - 16, TILE_H - 12, 0x6ec4ef, 0.45);
    strokeDiamond(g, w / 2, h / 2 - 2, w - 2, TILE_H - 2, 0x215f8c);
  });

  make('tile_locked', TILE_W, TILE_H + 8, (g, w, h) => {
    diamond(g, w / 2, h / 2 - 2, w - 2, TILE_H - 2, 0x3d4a3f, 0.7);
    strokeDiamond(g, w / 2, h / 2 - 2, w - 2, TILE_H - 2, 0x243028);
  });

  make('ghost_ok', TILE_W, TILE_H + 8, (g, w, h) => {
    diamond(g, w / 2, h / 2 - 2, w - 2, TILE_H - 2, 0x44ff88, 0.35);
  });

  make('ghost_bad', TILE_W, TILE_H + 8, (g, w, h) => {
    diamond(g, w / 2, h / 2 - 2, w - 2, TILE_H - 2, 0xff4455, 0.35);
  });

  make('pv_bargain', 96, 72, (g, w, h) => {
    // base pad
    diamond(g, w / 2, h - 18, 84, 28, 0x6b5a3e);
    // panel face
    g.fillStyle(0x1a3f8a, 1);
    g.fillRoundedRect(18, 10, 60, 34, 3);
    g.lineStyle(2, 0x0d2458, 1);
    g.strokeRoundedRect(18, 10, 60, 34, 3);
    g.lineStyle(1, 0x4ea1ff, 0.7);
    for (let i = 1; i < 4; i++) g.lineBetween(18 + i * 15, 12, 18 + i * 15, 42);
    for (let j = 1; j < 3; j++) g.lineBetween(20, 10 + j * 11, 76, 10 + j * 11);
    // legs
    g.lineStyle(3, 0x888888, 1);
    g.lineBetween(28, 44, 24, 58);
    g.lineBetween(68, 44, 72, 58);
  });

  make('pv_premium', 96, 72, (g, w, h) => {
    diamond(g, w / 2, h - 18, 84, 28, 0x5a6b4a);
    g.fillStyle(0x0f2f6e, 1);
    g.fillRoundedRect(16, 8, 64, 36, 4);
    g.lineStyle(2, 0xf0c14a, 1);
    g.strokeRoundedRect(16, 8, 64, 36, 4);
    g.lineStyle(1, 0x7ec8ff, 0.85);
    for (let i = 1; i < 5; i++) g.lineBetween(16 + i * 12.5, 10, 16 + i * 12.5, 42);
    for (let j = 1; j < 3; j++) g.lineBetween(18, 8 + j * 12, 78, 8 + j * 12);
    g.lineStyle(3, 0xbbbbbb, 1);
    g.lineBetween(28, 44, 24, 58);
    g.lineBetween(68, 44, 72, 58);
  });

  make('inverter', 48, 56, (g, w, h) => {
    diamond(g, w / 2, h - 10, 40, 18, 0x555555);
    g.fillStyle(0x2c3340, 1);
    g.fillRoundedRect(10, 8, 28, 30, 3);
    g.fillStyle(0x3ddc84, 1);
    g.fillCircle(24, 18, 4);
    g.fillStyle(0xf5c542, 1);
    g.fillRect(16, 28, 16, 4);
  });

  make('office', 96, 88, (g, w, h) => {
    diamond(g, w / 2, h - 16, 78, 28, 0x6d5b42);
    // walls
    g.fillStyle(0xe8d7b0, 1);
    g.fillRect(24, 28, 48, 36);
    // roof
    g.fillStyle(0xc45c26, 1);
    g.beginPath();
    g.moveTo(20, 32);
    g.lineTo(48, 10);
    g.lineTo(76, 32);
    g.closePath();
    g.fillPath();
    g.fillStyle(0x6ec8ff, 0.9);
    g.fillRect(34, 40, 12, 12);
    g.fillStyle(0x5a3a22, 1);
    g.fillRect(52, 44, 12, 20);
  });

  make('substation', 96, 88, (g, w, h) => {
    diamond(g, w / 2, h - 16, 78, 28, 0x555555);
    g.fillStyle(0x7a8694, 1);
    g.fillRect(28, 30, 40, 34);
    g.lineStyle(3, 0xd0d6de, 1);
    g.strokeRect(28, 30, 40, 34);
    g.lineStyle(2, 0xf0c14a, 1);
    g.lineBetween(34, 22, 34, 30);
    g.lineBetween(62, 22, 62, 30);
    g.lineBetween(34, 22, 62, 22);
    g.fillStyle(0x222222, 1);
    g.fillCircle(48, 44, 6);
  });

  make('tech', 32, 48, (g) => {
    g.fillStyle(0xffdbac, 1);
    g.fillCircle(16, 10, 7);
    g.fillStyle(0x2f6fed, 1);
    g.fillRoundedRect(9, 18, 14, 16, 3);
    g.fillStyle(0x333333, 1);
    g.fillRect(11, 34, 4, 10);
    g.fillRect(17, 34, 4, 10);
    g.fillStyle(0xf5c542, 1);
    g.fillRect(22, 20, 6, 10);
  });

  make('tree', 48, 64, (g) => {
    g.fillStyle(0x6b4a2e, 1);
    g.fillRect(21, 40, 6, 16);
    g.fillStyle(0x2f8f45, 1);
    g.fillCircle(24, 30, 16);
    g.fillStyle(0x48b85c, 0.85);
    g.fillCircle(18, 26, 10);
    g.fillCircle(30, 28, 11);
  });

  make('rock', 40, 28, (g) => {
    g.fillStyle(0x8a8f98, 1);
    g.fillEllipse(20, 16, 30, 16);
    g.fillStyle(0xa8adb6, 0.7);
    g.fillEllipse(16, 14, 12, 8);
  });

  make('fault_icon', 24, 24, (g) => {
    g.fillStyle(0xff3344, 1);
    g.fillCircle(12, 12, 10);
    g.fillStyle(0xffffff, 1);
    g.fillRect(10, 5, 4, 9);
    g.fillRect(10, 16, 4, 3);
  });

  make('select_ring', 100, 56, (g, w, h) => {
    strokeDiamond(g, w / 2, h / 2, 90, 40, 0xfff1a8, 2);
  });
}
