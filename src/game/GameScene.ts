import Phaser from 'phaser';
import { initAudio, playSfx } from '../audio/Sfx';
import { saveGame } from '../persistence/save';
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
  private autosaveAcc = 0;
  private lastStars = 0;
  private lastMsg: string | null = null;

  constructor() {
    super('GameScene');
  }

  preload(): void {
    preloadGameAssets(this);
  }

  create(): void {
    generateOverlayTextures(this);
    this.bootGame(true);
    // Immediate: don't wait for first update() or title clicks hit the canvas.
    if (this.game.canvas) this.game.canvas.style.pointerEvents = 'none';
    this.input.enabled = false;

    const cam = this.cameras.main;
    let pressWorld: { x: number; y: number } | null = null;
    let pressScreen = { x: 0, y: 0 };
    let moved = false;

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      initAudio();
      if (this.hud.isTitleVisible() || this.sim.snapshot().activeEvent) return;
      if (pointer.rightButtonDown() || pointer.button === 2) {
        if (this.sim.snapshot().buildMode) {
          this.sim.setBuildMode(null);
          playSfx('click');
        }
        return;
      }
      pressScreen = { x: pointer.x, y: pointer.y };
      pressWorld = cam.getWorldPoint(pointer.x, pointer.y);
      moved = false;
      this.dragging = false;
      this.dragLast = { x: pointer.x, y: pointer.y };
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.hud.isTitleVisible() || this.sim.snapshot().activeEvent) {
        this.dragging = false;
        return;
      }
      if (pointer.button === 2) return;
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
          if (plotId) {
            const ok = this.sim.placeEquipment(snapshot.buildMode, plotId, tile);
            playSfx(ok ? 'place' : 'error');
          } else {
            this.sim.message = 'Build inside an unlocked site fence.';
            playSfx('error');
          }
        }
        return;
      }
      const id = this.world.pickEntity(snapshot, worldPoint.x, worldPoint.y);
      this.sim.selectEntity(id);
      if (id) playSfx('click');
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown || this.hud.isTitleVisible() || this.sim.snapshot().activeEvent) return;
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
      if (this.hud.isTitleVisible()) return;
      const next = Phaser.Math.Clamp(cam.zoom - dy * 0.0015, 0.5, 2.4);
      cam.setZoom(next);
    });

    this.input.on('gameout', () => {
      this.world?.setPointerInWorld(false);
    });
    this.input.on('gameover', () => {
      this.world?.setPointerInWorld(true);
    });

    this.game.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    this.input.keyboard?.on('keydown-SPACE', () => {
      if (this.hud.isTitleVisible()) return;
      const snap = this.sim.snapshot();
      this.sim.setSpeed(snap.speed === 0 ? 1 : 0);
    });
    this.input.keyboard?.on('keydown-R', () => {
      if (this.hud.isTitleVisible() || this.sim.activeEvent) return;
      initAudio();
      const ok = this.sim.dispatchRepair();
      playSfx(ok ? 'repair' : 'error');
    });
    this.input.keyboard?.on('keydown-C', () => {
      if (this.hud.isTitleVisible() || this.sim.activeEvent) return;
      initAudio();
      const ok = this.sim.dispatchClean();
      playSfx(ok ? 'clean' : 'error');
    });
    this.input.keyboard?.on('keydown-ESC', () => {
      if (this.sim.snapshot().buildMode) {
        this.sim.setBuildMode(null);
        playSfx('click');
      }
    });
    this.input.keyboard?.on('keydown-ENTER', () => {
      if (this.hud.isTitleVisible()) this.hud.startFromTitle();
    });
  }

  private rebuildWorld(): void {
    this.children.removeAll(true);
    generateOverlayTextures(this);
    this.world = new WorldView(this, this.sim);
    this.lastStars = this.sim.stars;
  }

  /** Fresh sim + world. First boot shows title; New Game skips title via DomHud. */
  private bootGame(showTitle: boolean): void {
    this.children.removeAll(true);
    generateOverlayTextures(this);
    this.sim = new GameSimulation();
    this.world = new WorldView(this, this.sim);
    this.lastStars = 0;
    this.lastMsg = null;
    this.autosaveAcc = 0;
    if (!this.hud) {
      this.hud = new DomHud(
        this.sim,
        () => this.bootGame(false),
        () => this.rebuildWorld(),
      );
    } else {
      this.hud.rebindingSim(this.sim);
    }
    if (showTitle) this.hud.showTitleScreen();
    else this.hud.hideTitleScreen();
    if (this.game.canvas) {
      this.game.canvas.style.pointerEvents = showTitle ? 'none' : 'auto';
    }
    this.input.enabled = !showTitle;
  }

  update(_t: number, delta: number): void {
    if (!this.sim || !this.hud) return;
    const titleUp = this.hud.isTitleVisible();
    if (this.game.canvas) {
      this.game.canvas.style.pointerEvents = titleUp ? 'none' : 'auto';
    }
    this.input.enabled = !titleUp;
    if (!titleUp) {
      this.sim.update(delta / 1000);
      this.autosaveAcc += delta / 1000;
      if (this.autosaveAcc >= 45) {
        this.autosaveAcc = 0;
        saveGame(this.sim.serialize());
      }
    }
    const snap = this.sim.snapshot();

    if (snap.stars > this.lastStars) {
      playSfx('star');
      this.lastStars = snap.stars;
    }
    if (this.sim.consumeCommissionFlag()) playSfx('commission');
    if (this.sim.consumeFaultToast()) playSfx('fault');
    if (this.sim.consumeUnlockToast()) playSfx('unlock');
    if (snap.message && snap.message !== this.lastMsg) {
      const m = snap.message.toLowerCase();
      if (m.includes('hail')) playSfx('hail');
    }
    this.lastMsg = snap.message;

    this.world.sync(snap);
    const pointer = this.input.activePointer;
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    if (pointer.x >= 0 && pointer.y >= 0 && pointer.x <= this.scale.width && pointer.y <= this.scale.height) {
      this.world.setPointerInWorld(true);
    }
    this.world.updateHoverTile(snap, worldPoint);
    this.world.updateGhost(snap, worldPoint);
    this.hud.render(snap);
  }
}
