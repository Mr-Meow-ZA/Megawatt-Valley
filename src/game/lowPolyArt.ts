import type Phaser from 'phaser';
import manifest from '../../public/assets/low-poly/manifest.json';

/** CC0 meshes rendered once at the park's exact 2:1 projection. No 3D runtime. */
export function preloadLowPolyArt(scene: Phaser.Scene): void {
  const embedded = (window as Window & { __MW_VECTOR_ASSETS__?: Record<string,string> }).__MW_VECTOR_ASSETS__;
  for (const sprite of manifest) {
    scene.load.svg('rendered_' + sprite.key, embedded?.[sprite.key] ?? `/assets/low-poly/${sprite.key}.svg`);
  }
}

/** Keep the original ground anchors, dimensions and texture keys used by the world.
 * Full resolution replaces the half-resolution procedural fallback after preload. */
export function applyLowPolyArt(scene: Phaser.Scene): void {
  for (const sprite of manifest) {
    const texture = scene.textures.get('rendered_' + sprite.key);
    if (!scene.textures.exists('rendered_' + sprite.key)) continue;
    const canvas = document.createElement('canvas');
    canvas.width = sprite.width; canvas.height = sprite.height;
    canvas.getContext('2d')!.drawImage(texture.getSourceImage() as CanvasImageSource,0,0,sprite.width,sprite.height);
    if (scene.textures.exists(sprite.key)) scene.textures.remove(sprite.key);
    scene.textures.addCanvas(sprite.key,canvas);
  }
}
