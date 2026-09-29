import Phaser from 'phaser';
import { GameScene } from './game/GameScene';

const parent = document.getElementById('game-root');
if (!parent) {
  throw new Error('#game-root missing');
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#7eb7e0',
  scene: [GameScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: false,
  },
});

window.addEventListener('resize', () => {
  // Phaser Scale.RESIZE handles canvas; ensure parent fills viewport
  parent.style.width = '100%';
  parent.style.height = '100%';
});
