import Phaser from 'phaser';
import { GameSimulation } from '../simulation/GameSimulation';
import { DomHud } from '../ui/DomHud';
import { generateTextures } from './textures';
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

  create(): void {
    generateTextures(this);
    this.startNewGame();

    const cam = this.cameras.main;
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown() || pointer.middleButtonDown()) {
        this.dragging = true;
        this.dragLast = { x: pointer.x, y: pointer.y };
        return;
      }
      // left click: place or select
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

    this.input.on('pointerup', () => {
      this.dragging = false;
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.dragging && pointer.isDown) {
        cam.scrollX -= (pointer.x - this.dragLast.x) / cam.zoom;
        cam.scrollY -= (pointer.y - this.dragLast.y) / cam.zoom;
        this.dragLast = { x: pointer.x, y: pointer.y };
      }
    });

    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _over: unknown, _dx: number, dy: number) => {
      const next = Phaser.Math.Clamp(cam.zoom - dy * 0.0015, 0.55, 2.2);
      cam.setZoom(next);
    });

    // Space / number keys for speed
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.sim.setSpeed(this.sim.speed === 0 ? 1 : 0);
    });
    this.input.keyboard?.on('keydown-ONE', () => this.sim.setSpeed(1));
    this.input.keyboard?.on('keydown-TWO', () => this.sim.setSpeed(2));
    this.input.keyboard?.on('keydown-FOUR', () => this.sim.setSpeed(4));
  }

  private startNewGame(): void {
    this.children.removeAll();
    this.sim = new GameSimulation();
    this.world = new WorldView(this, this.sim);
    this.hud = new DomHud(this.sim, () => this.startNewGame());
  }

  update(_time: number, delta: number): void {
    this.sim.update(delta / 1000);
    const snapshot = this.sim.snapshot();
    this.world.sync(snapshot);
    const pointer = this.input.activePointer;
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    this.world.updateGhost(snapshot, worldPoint);
    this.hud.render(snapshot);
  }
}
