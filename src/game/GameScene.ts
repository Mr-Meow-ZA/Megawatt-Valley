import Phaser from 'phaser';
import { initAudio, playSfx, setAmbienceWeather } from '../audio/Sfx';
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
  private lastBuildMode: string | null = null;

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
          let plotId = this.sim.plotAtTile(tile);
          // If the iso pick lands just outside, try nearest unlocked plot and snap.
          if (!plotId) {
            for (const plot of this.sim.plots) {
              if (!plot.unlocked) continue;
              const near =
                tile.x >= plot.origin.x - 2 &&
                tile.y >= plot.origin.y - 2 &&
                tile.x < plot.origin.x + plot.size.x + 2 &&
                tile.y < plot.origin.y + plot.size.y + 2;
              if (near) {
                plotId = plot.id;
                break;
              }
            }
          }
          if (plotId) {
            const snapped = this.sim.snapTileToPlot(snapshot.buildMode, plotId, tile);
            const ok = this.sim.placeEquipment(snapshot.buildMode, plotId, snapped);
            playSfx(ok ? 'place' : 'error');
          } else {
            this.sim.message = 'Click the bright meadow inside the Site A fence.';
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
    // Debug/helpers for automated QA and power users.
    (window as unknown as { __MV?: { quickPlace: () => boolean; sim: GameSimulation } }).__MV = {
      quickPlace: () => this.sim.quickPlace(this.sim.buildMode ?? 'bargain_pv', 'site_a'),
      sim: this.sim,
    };
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

    // First time entering a build mode: frame Site A so placement clicks land in-bounds.
    if (snap.buildMode && snap.buildMode !== this.lastBuildMode) {
      const siteA = snap.plots.find((p) => p.id === 'site_a');
      if (siteA) {
        const cx = siteA.origin.x + siteA.size.x / 2;
        const cy = siteA.origin.y + siteA.size.y / 2;
        // Iso approx used by WorldView
        const wx = (cx - cy) * 50;
        const wy = (cx + cy) * 25;
        this.cameras.main.centerOn(wx, wy);
        this.cameras.main.setZoom(Math.max(this.cameras.main.zoom, 1.1));
      }
    }
    this.lastBuildMode = snap.buildMode;

    // Stars / unlock / hail SFX owned by ceremony path in DomHud — avoid doubles.
    if (snap.stars > this.lastStars) {
      this.lastStars = snap.stars;
    }
    if (this.sim.consumeCommissionFlag()) playSfx('commission');
    if (this.sim.consumeFaultToast()) playSfx('fault');
    this.sim.consumeUnlockToast(); // clear flag; ceremony banner plays unlock SFX

    this.world.sync(snap);
    const pointer = this.input.activePointer;
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    if (pointer.x >= 0 && pointer.y >= 0 && pointer.x <= this.scale.width && pointer.y <= this.scale.height) {
      this.world.setPointerInWorld(true);
    }
    this.world.updateHoverTile(snap, worldPoint);
    this.world.updateGhost(snap, worldPoint);
    this.hud.render(snap);

    const ceremony = this.sim.consumeCeremony();
    if (ceremony === 'hail') {
      this.cameras.main.shake(420, 0.004);
      setAmbienceWeather('hail');
    } else if (ceremony === 'site_b') {
      const siteB = snap.plots.find((p) => p.id === 'site_b');
      if (siteB) {
        const cx = siteB.origin.x + siteB.size.x / 2;
        const cy = siteB.origin.y + siteB.size.y / 2;
        const wx = (cx - cy) * 50;
        const wy = (cx + cy) * 25;
        this.cameras.main.pan(wx, wy, 700, 'Sine.easeInOut');
      }
    } else if (ceremony === 'first_power') {
      this.cameras.main.flash(280, 180, 230, 160, false);
    }
  }
}
