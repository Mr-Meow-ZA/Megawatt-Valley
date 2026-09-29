import Phaser from 'phaser';
import { GameSimulation } from '../simulation/GameSimulation';
import { DomHud } from '../ui/DomHud';
import { generateOverlayTextures, preloadGameAssets } from './assets';
import { WorldView } from './WorldView';

export class GameScene extends Phaser.Scene {
  private sim!: GameSimulation;
  private world!: WorldView;
  private hud!: DomHud;
  private dragging = false;
  private dragLast = { x: 0, y: 0 };

  constructor() {
    super('GameScene');
  }

  preload(): void {
    preloadGameAssets(this);
  }

  create(): void {
    generateOverlayTextures(this);
    this.startNewGame();

    const cam = this.cameras.main;
    let pressWorld: { x: number; y: number } | null = null;
    let pressScreen = { x: 0, y: 0 };
    let moved = false;

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.sim.snapshot().activeEvent) return;
      pressScreen = { x: pointer.x, y: pointer.y };
      pressWorld = cam.getWorldPoint(pointer.x, pointer.y);
      moved = false;
      this.dragging = false;
      this.dragLast = { x: pointer.x, y: pointer.y };
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.sim.snapshot().activeEvent) {
        this.dragging = false;
        return;
      }
      const wasDragging = this.dragging || moved;
      this.dragging = false;
      if (wasDragging || !pressWorld) return;

      const snapshot = this.sim.snapshot();
      const worldPoint = cam.getWorldPoint(pointer.x, pointer.y);
      if (snapshot.buildMode) {
        this.world.updateGhost(snapshot, worldPoint);
        const tile = this.world.getHoverTile();
        if (tile) {
          const plotId = this.sim.plotAtTile(tile);
          if (plotId) this.sim.placeEquipment(snapshot.buildMode, plotId, tile);
        }
        return;
      }
      const id = this.world.pickEntity(snapshot, worldPoint.x, worldPoint.y);
      this.sim.selectEntity(id);
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown || this.sim.snapshot().activeEvent) return;
      const dx = pointer.x - pressScreen.x;
      const dy = pointer.y - pressScreen.y;
      if (!moved && Math.hypot(dx, dy) > 6) {
        moved = true;
        this.dragging = true;
      }
      if (this.dragging) {
        cam.scrollX -= (pointer.x - this.dragLast.x) / cam.zoom;
        cam.scrollY -= (pointer.y - this.dragLast.y) / cam.zoom;
        this.dragLast = { x: pointer.x, y: pointer.y };
      }
    });

    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _over: unknown, _dx: number, dy: number) => {
      const next = Phaser.Math.Clamp(cam.zoom - dy * 0.0015, 0.5, 2.4);
      cam.setZoom(next);
    });

    this.input.keyboard?.on('keydown-SPACE', () => {
      const snap = this.sim.snapshot();
      this.sim.setSpeed(snap.speed === 0 ? 1 : 0);
    });
    this.input.keyboard?.on('keydown-R', () => {
      const snap = this.sim.snapshot();
      if (snap.selectedId) this.sim.dispatchRepair(snap.selectedId);
    });
    this.input.keyboard?.on('keydown-C', () => {
      const snap = this.sim.snapshot();
      if (snap.selectedId) this.sim.dispatchClean(snap.selectedId);
    });
  }

  private startNewGame(): void {
    // Destroy previous world display objects
    this.children.removeAll(true);
    generateOverlayTextures(this);
    this.sim = new GameSimulation();
    this.world = new WorldView(this, this.sim);
    this.hud = new DomHud(this.sim, () => this.startNewGame());
  }

  update(_t: number, delta: number): void {
    if (!this.sim) return;
    this.sim.update(delta / 1000);
    const snap = this.sim.snapshot();
    this.world.sync(snap);
    const pointer = this.input.activePointer;
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    this.world.updateGhost(snap, worldPoint);
    this.hud.render(snap);
  }
}
