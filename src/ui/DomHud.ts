import { BUILD_MENU_ORDER, EQUIPMENT } from '../content/equipment';
import { CAPABILITY_INFO, ONBOARDING_STEPS } from '../content/scenario';
import { initAudio, isMuted, playSfx, setAmbienceWeather, startAmbience, toggleMute } from '../audio/Sfx';
import type { GameSimulation } from '../simulation/GameSimulation';
import type { CeremonyKind, EquipmentKind, GameSnapshot } from '../simulation/types';
import { clearSave, getSaveMeta, hasSave, loadGame, saveGame } from '../persistence/save';

const CEREMONY_COPY: Record<CeremonyKind, { title: string; body: string }> = {
  first_power: {
    title: 'First Power!',
    body: 'Electrons are leaving the valley. Watch export kW and +$/h climb in the sun.',
  },
  unlock: {
    title: 'Capability Unlocked!',
    body: 'A new management verb is yours — check Capabilities on the right.',
  },
  site_b: {
    title: 'Site B Open!',
    body: 'River Bench unlocked — weaker sun, congested spur. Expand carefully.',
  },
  star: {
    title: 'Star Earned!',
    body: 'Scenario progress stamped. Push for the next mastery tier.',
  },
  hail: {
    title: 'Hailstorm!',
    body: 'Ice on the arrays — assess damage and keep the crew moving.',
  },
};

function money(n: number): string {
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

function weatherLabel(w: GameSnapshot['weather'], irradiance: number): string {
  if (irradiance < 0.05) {
    switch (w) {
      case 'clear':
        return 'Clear night';
      case 'partly_cloudy':
        return 'Cloudy night';
      case 'overcast':
        return 'Overcast night';
      case 'rain':
        return 'Rainy night';
      case 'hail':
        return 'Stormy night';
    }
  }
  switch (w) {
    case 'clear':
      return 'Sunny';
    case 'partly_cloudy':
      return 'Partly cloudy';
    case 'overcast':
      return 'Overcast';
    case 'rain':
      return 'Rain';
    case 'hail':
      return 'Hail';
  }
}

function weatherIconClass(w: GameSnapshot['weather'], irradiance: number): string {
  if (irradiance < 0.05) return 'svg-moon';
  switch (w) {
    case 'clear':
      return 'svg-sun';
    case 'partly_cloudy':
      return 'svg-cloud-sun';
    case 'overcast':
      return 'svg-cloud';
    case 'rain':
      return 'svg-rain';
    case 'hail':
      return 'svg-storm';
  }
}

/** Weather chip sub-label — never "Sunny" + "Night"; night is folded into weather-val. */
function weatherModLabel(weather: GameSnapshot['weather'], irradiance: number): string {
  if (irradiance < 0.05) return 'No generation';

  const weatherSun: Record<GameSnapshot['weather'], number> = {
    clear: 100,
    partly_cloudy: 75,
    overcast: 45,
    rain: 30,
    hail: 15,
  };
  const sky = weatherSun[weather];
  const now = Math.round(irradiance * 100);

  if (weather === 'clear' && irradiance >= 0.95) return 'Peak sun';
  if (weather === 'clear') return `${now}% sun`;
  if (now >= sky - 5) return `${sky}% sun`;
  return `${now}% sun`;
}

function clock(hour: number): string {
  const h = Math.floor(hour) % 24;
  const m = Math.floor((hour % 1) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function seasonForDay(day: number): string {
  const s = ['Spring', 'Summer', 'Autumn', 'Winter'];
  return s[Math.floor(((day - 1) % 120) / 30)];
}

function starWinTitle(stars: number): string {
  if (stars >= 3) return '3★ Valley Pro!';
  if (stars >= 2) return '2★ Strong Operator!';
  return '1★ Complete!';
}

function starWinBody(stars: number): string {
  if (stars >= 3) {
    return 'Full mastery — Here Comes the Sun cleared at the highest tier. Keep tinkering in the sandbox.';
  }
  if (stars >= 2) {
    return 'Strong Operator — scenario mastery unlocked. Push for 3★ Valley Pro.';
  }
  return 'Here Comes the Sun — scenario cleared. Keep playing for 2★ / 3★ mastery.';
}

const ASSET_BASE = `${import.meta.env.BASE_URL ?? './'}assets/game/`;

const BUILD_ICONS: Record<string, string> = {
  bargain_pv: `<img src="${ASSET_BASE}pv_bargain.png" alt="" width="40" height="28"/>`,
  premium_pv: `<img src="${ASSET_BASE}pv_premium.png" alt="" width="40" height="28"/>`,
  inverter:
    '<svg viewBox="0 0 36 36" width="36" height="28" aria-hidden="true" class="build-icon-inverter">' +
    '<ellipse cx="18" cy="30" rx="11" ry="3.5" fill="rgba(0,0,0,0.28)"/>' +
    '<rect x="10" y="8" width="16" height="18" rx="3" fill="#3a4454"/>' +
    '<rect x="12" y="10" width="12" height="10" rx="1.5" fill="#2a3344"/>' +
    '<line x1="13" y1="12" x2="23" y2="12" stroke="#5a6a7a" stroke-width="0.9"/>' +
    '<line x1="13" y1="15" x2="23" y2="15" stroke="#5a6a7a" stroke-width="0.9"/>' +
    '<line x1="13" y1="18" x2="23" y2="18" stroke="#5a6a7a" stroke-width="0.9"/>' +
    '<rect x="12" y="21" width="12" height="5" rx="1.5" fill="#1a2230"/>' +
    '<circle cx="14.5" cy="23.5" r="1.4" fill="#3ddc84"/>' +
    '<circle cx="18" cy="23.5" r="1.4" fill="#f5c542"/>' +
    '<circle cx="21.5" cy="23.5" r="1.4" fill="#6ec8ff"/>' +
    '</svg>',
  office: `<img src="${ASSET_BASE}office.png" alt="" width="36" height="28"/>`,
  substation: `<img src="${ASSET_BASE}substation.png" alt="" width="36" height="28"/>`,
};

export class DomHud {
  private root: HTMLElement;
  private showTitle: boolean;
  private _starting = false;
  private lastEventId: string | null = null;
  private lastObjectivesKey = '__uninit__';
  private lastBuildKey = '__uninit__';
  private lastCapsKey = '__uninit__';
  private lastSelectionKey = '__uninit__';
  private lastSelectionActionsKey = '__uninit__';
  private lastMessage: string | null = '__uninit__';
  private lastCoachStep = -1;
  private lastSiteBUnlocked: boolean | null = null;
  private toastClearAt = 0;
  private buildCategory: 'all' | 'generation' | 'grid' | 'support' = 'all';
  private minimapCtx: CanvasRenderingContext2D | null = null;
  private lastCash = -1;
  private cashAccrued = 0;
  private cashFloatUntil = 0;
  private cashFloatAmount = 0;
  private lastExportedKw = -1;
  private powerFloatUntil = 0;
  private powerFloatAmount = 0;
  private lastStars = 0;
  private lastWeather: GameSnapshot['weather'] | null = null;
  private ceremonyClearAt = 0;
  private lastCeremonyShown: CeremonyKind | null = null;
  private readonly completedObjectiveIds = new Set<string>();
  private audioPrimed = false;

  constructor(
    private sim: GameSimulation,
    private readonly onNewGame: () => void,
    private readonly onHudReset?: () => void,
  ) {
    const el = document.getElementById('ui-root');
    if (!el) throw new Error('#ui-root missing');
    this.root = el;
    this.showTitle = true;

    this.root.innerHTML = `
      <header class="hud-top">
        <div class="brand-block">
          <div class="brand">
            <svg class="brand-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M2 20h20" stroke="#c5e4ff" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M4 18l6-10 4 6 3-4 5 8" fill="none" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/>
              <path d="M10 8l2-3 2 3" fill="#fff" opacity="0.95"/>
            </svg>
            Megawatt Valley
          </div>
          <div class="brand-sub">Solar · Here Comes the Sun</div>
        </div>

        <div class="chip cash" data-k="cash-chip">
          <span class="chip-icon"><img src="${ASSET_BASE}icon_dollar.png" alt="" width="22" height="22"/></span>
          <div>
            <span class="chip-label">Cash</span>
            <strong data-k="cash-val">—</strong>
            <em data-k="cash-rate">—</em>
          </div>
          <span class="cash-float" data-k="cash-float" hidden></span>
        </div>

        <div class="chip power" data-k="power-chip">
          <span class="chip-icon"><img src="${ASSET_BASE}icon_power.png" alt="" width="22" height="22" style="filter:invert(1) sepia(1) saturate(5) hue-rotate(80deg)"/></span>
          <div class="chip-power">
            <span class="chip-label">Power output</span>
            <strong data-k="power-val">—</strong>
            <em data-k="power-gen" hidden></em>
            <div class="bar"><i data-k="power-bar"></i></div>
          </div>
          <span class="power-float" data-k="power-float" hidden></span>
        </div>

        <div class="chip weather" data-k="weather-chip">
          <span class="chip-icon svg-sun" data-k="weather-icon" aria-hidden="true"></span>
          <div>
            <span class="chip-label">Weather</span>
            <strong data-k="weather-val">—</strong>
            <em data-k="weather-mod">—</em>
          </div>
        </div>

        <div class="chip time" data-k="time-chip">
          <span class="chip-icon svg-cal" aria-hidden="true"></span>
          <div>
            <span class="chip-label">Calendar</span>
            <strong data-k="time-val">—</strong>
            <em data-k="time-clock">—</em>
          </div>
        </div>

        <div class="speed-group">
          <button data-speed="0" type="button" title="Pause">❚❚</button>
          <button data-speed="1" type="button" title="Play">▶</button>
          <button data-speed="2" type="button" title="2x">▶▶</button>
          <button data-speed="4" type="button" title="4x">▶▶▶</button>
        </div>
        <div class="stars" data-k="stars">☆☆☆</div>
        <div class="ops-chip" data-k="ops-chip" hidden title="Open faults / crew status">
          <strong data-k="ops-faults">0 faults</strong>
          <em data-k="ops-busy"></em>
        </div>
      </header>

      <aside class="panel objectives">
        <h2>Objectives</h2>
        <ul data-k="objectives"></ul>
      </aside>

      <aside class="panel minimap-panel">
        <h2>Valley map</h2>
        <canvas data-k="minimap" width="220" height="120"></canvas>
        <div class="minimap-legend" data-k="minimap-legend">
          <span><i class="swatch grass"></i>Terrain</span>
          <span><i class="swatch solar"></i>Solar</span>
          <span><i class="swatch grid"></i>Grid</span>
          <span><i class="swatch build"></i>Buildings</span>
        </div>
      </aside>

      <div class="sidebar-right">
      <aside class="panel build">
        <h2>Build</h2>
        <div class="build-tabs">
          <button type="button" data-cat="all" class="active">All</button>
          <button type="button" data-cat="generation">Generation</button>
          <button type="button" data-cat="grid">Grid</button>
          <button type="button" data-cat="support">Support</button>
        </div>
        <div class="build-grid" data-k="build"></div>
        <button type="button" class="primary quick-place-btn" data-action="quick-place" data-k="quick-place">Place on Site A</button>
        <button type="button" class="ghost cancel-build-btn" data-action="cancel-build" data-k="cancel-build">Cancel placement</button>
      </aside>

      <aside class="panel selection" data-k="selection">
        <h2>Selection</h2>
        <div data-k="selection-body">Click equipment or staff.</div>
        <div class="row" data-k="selection-actions"></div>
      </aside>

      <aside class="panel caps">
        <h2>Capabilities</h2>
        <ul data-k="caps"><li class="muted">None yet — earn them in play.</li></ul>
      </aside>
      </div>

      <div class="coach" data-k="coach" hidden>
        <div class="coach-card">
          <h3 data-k="coach-title"></h3>
          <p data-k="coach-body"></p>
          <div class="coach-actions">
            <button type="button" class="ghost" data-action="coach-skip">Skip</button>
            <button type="button" data-action="coach-next">Next</button>
          </div>
        </div>
      </div>

      <div class="toast" data-k="toast" hidden></div>
      <div class="ceremony" data-k="ceremony" hidden>
        <div class="ceremony-card" data-k="ceremony-card">
          <div class="ceremony-kicker" data-k="ceremony-kicker">Megawatt Valley</div>
          <h2 data-k="ceremony-title"></h2>
          <p data-k="ceremony-body"></p>
        </div>
      </div>
      <div class="sun-hint" data-k="sun-hint" hidden>Waiting for sun — press ▶▶ for midday export</div>
      <div class="build-banner" data-k="build-banner" hidden>
        <strong data-k="build-banner-label">Placing…</strong>
        <span>Click a bright meadow tile · or use Place on Site A · Esc cancels</span>
      </div>

      <footer class="hud-bottom">
        <button type="button" data-action="save">Save</button>
        <button type="button" data-action="load">Load</button>
        <button type="button" data-action="new">New Game</button>
        <button type="button" class="mute-btn" data-action="mute" data-k="mute">Mute</button>
        <span class="hint">Drag pan · Wheel zoom · Esc cancel · 1/2/3 events · R repair · C clean</span>
      </footer>

      <div class="modal" data-k="modal" hidden>
        <div class="modal-card">
          <h2 data-k="modal-title"></h2>
          <p data-k="modal-body"></p>
          <div class="modal-actions" data-k="modal-actions"></div>
        </div>
      </div>

      <div class="win" data-k="win" hidden>
        <div class="confetti" data-k="win-confetti" aria-hidden="true"></div>
        <div class="modal-card win-card">
          <div class="star-stamp" data-k="star-stamp">★</div>
          <h2 data-k="win-title">1★ Complete!</h2>
          <p data-k="win-body">Here Comes the Sun — scenario cleared. Keep playing for 2★ / 3★ mastery.</p>
          <button type="button" data-action="dismiss-win">Continue</button>
        </div>
      </div>
      <div class="confetti confetti-overlay" data-k="confetti" hidden aria-hidden="true"></div>

      <div class="title-screen" data-k="title" hidden>
        <div class="title-card">
          <div class="title-brand">Megawatt Valley</div>
          <h1>Here Comes the Sun</h1>
          <p class="title-blurb">Place panels on Site A, export power, hire help, weather the hail — earn your stars.</p>
          <div class="title-actions" data-k="title-actions"></div>
          <p class="title-meta" data-k="title-meta"></p>
        </div>
      </div>
    `;

    const canvas = this.root.querySelector('[data-k="minimap"]') as HTMLCanvasElement;
    this.minimapCtx = canvas.getContext('2d');

    const primeAudio = () => {
      if (this.audioPrimed) return;
      this.audioPrimed = true;
      initAudio();
      startAmbience();
    };

    const handleUiAction = (ev: Event) => {
      primeAudio();
      const t = (ev.target as HTMLElement).closest(
        '[data-speed],[data-build],[data-action],[data-cat]',
      ) as HTMLElement | null;
      if (!t) return;
      ev.preventDefault();
      ev.stopPropagation();
      const cat = t.getAttribute('data-cat') as typeof this.buildCategory | null;
      if (cat) {
        this.buildCategory = cat;
        this.lastBuildKey = '__force__';
        this.root.querySelectorAll('[data-cat]').forEach((b) => {
          b.classList.toggle('active', b.getAttribute('data-cat') === cat);
        });
        return;
      }
      const speed = t.getAttribute('data-speed');
      if (speed) {
        this.sim.setSpeed(Number(speed) as 0 | 1 | 2 | 4);
        playSfx('click');
        return;
      }
      const build = t.getAttribute('data-build') as EquipmentKind | null;
      if (build) {
        this.sim.setBuildMode(build);
        playSfx('click');
        return;
      }
      const action = t.getAttribute('data-action');
      if (!action) return;
      if (action === 'cancel-build') {
        this.sim.setBuildMode(null);
        playSfx('click');
        return;
      }
      if (action === 'quick-place') {
        const kind = this.sim.buildMode ?? 'bargain_pv';
        if (!this.sim.buildMode) this.sim.setBuildMode(kind);
        const ok = this.sim.quickPlace(kind, 'site_a');
        playSfx(ok ? 'place' : 'error');
        return;
      }
      if (action === 'save') {
        saveGame(this.sim.serialize());
        playSfx('save');
        this.sim.message = 'Game saved.';
        return;
      }
      if (action === 'load') {
        this.applyLoad();
        return;
      }
      if (action === 'new') {
        this.beginNewGame();
        return;
      }
      if (action === 'mute') {
        toggleMute();
        this.syncMuteButton();
        playSfx('click');
        return;
      }
      if (action === 'repair') {
        const id = t.getAttribute('data-id');
        this.sim.dispatchRepair(id);
        playSfx('repair');
        return;
      }
      if (action === 'clean') {
        const id = t.getAttribute('data-id');
        this.sim.dispatchClean(id);
        playSfx('clean');
        return;
      }
      if (action === 'event-choice') {
        const id = t.getAttribute('data-id');
        if (id) this.sim.resolveEventChoice(id);
        playSfx('click');
        return;
      }
      if (action === 'dismiss-win') {
        const win = this.root.querySelector('[data-k="win"]') as HTMLElement;
        win.hidden = true;
        playSfx('click');
        return;
      }
      if (action === 'coach-next') {
        this.sim.advanceOnboarding();
        playSfx('click');
        return;
      }
      if (action === 'coach-skip') {
        this.sim.dismissOnboarding();
        playSfx('click');
        return;
      }
      if (action === 'title-continue') {
        this.applyLoadFromTitle();
        return;
      }
      if (action === 'title-new') {
        this.beginNewGame();
      }
    };
    // Click only — avoid double-firing beginNewGame from pointerdown+click.
    this.root.addEventListener('click', handleUiAction);

    // Direct binding — computer-use / overlay stacking sometimes misses delegated clicks.
    const quick = this.root.querySelector('[data-action="quick-place"]') as HTMLButtonElement | null;
    quick?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      primeAudio();
      const kind = this.sim.buildMode ?? 'bargain_pv';
      if (!this.sim.buildMode) this.sim.setBuildMode(kind);
      const ok = this.sim.quickPlace(kind, 'site_a');
      playSfx(ok ? 'place' : 'error');
    });
    const cancel = this.root.querySelector('[data-action="cancel-build"]') as HTMLButtonElement | null;
    cancel?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.sim.setBuildMode(null);
      playSfx('click');
    });

    window.addEventListener('keydown', (ev) => {
      primeAudio();
      if (ev.key === 'Escape' && this.sim.snapshot().buildMode) {
        this.sim.setBuildMode(null);
        playSfx('click');
        return;
      }
      const key = ev.key.toLowerCase();
      if (key === 'r') {
        this.sim.dispatchRepair();
        playSfx('repair');
        return;
      }
      if (key === 'c') {
        this.sim.dispatchClean();
        playSfx('clean');
        return;
      }
      if (!this.sim.activeEvent) return;
      if (ev.key === '1' || ev.key === '2' || ev.key === '3') {
        const idx = Number(ev.key) - 1;
        const choice = this.sim.activeEvent.choices[idx];
        if (choice) {
          this.sim.resolveEventChoice(choice.id);
          playSfx('click');
        }
      }
    });

    this.syncMuteButton();
    this.refreshTitleActions();
    if (this.showTitle) this.showTitleScreen();
    else this.hideTitleScreen();
  }

  showTitleScreen(): void {
    this.showTitle = true;
    const title = this.root.querySelector('[data-k="title"]') as HTMLElement;
    title.hidden = false;
    this.refreshTitleActions();
  }

  hideTitleScreen(): void {
    this.showTitle = false;
    const title = this.root.querySelector('[data-k="title"]') as HTMLElement;
    title.hidden = true;
  }

  isTitleVisible(): boolean {
    return this.showTitle;
  }

  /** Enter key / external start from title. */
  startFromTitle(): void {
    if (!this.showTitle) return;
    if (hasSave()) this.applyLoadFromTitle();
    else this.beginNewGame();
  }

  /** Swap simulation without recreating DOM listeners. */
  rebindingSim(sim: GameSimulation): void {
    this.sim = sim;
    this._starting = false;
    this.resetCaches();
    this.refreshTitleActions();
    this.syncMuteButton();
  }

  /** Reset internal HUD caches after load / world rebuild (callable from GameScene). */
  resetCaches(): void {
    this.lastObjectivesKey = '__uninit__';
    this.completedObjectiveIds.clear();
    this.lastEventId = null;
    const win = this.root.querySelector('[data-k="win"]') as HTMLElement | null;
    if (win) {
      win.hidden = true;
      delete win.dataset.shown;
    }
    this.lastStars = 0;
    this.lastCash = -1;
    this.lastExportedKw = -1;
    this.lastCapsKey = '__uninit__';
    this.lastBuildKey = '__uninit__';
    this.lastSelectionKey = '__uninit__';
    this.lastSelectionActionsKey = '__uninit__';
    this.lastMessage = '__uninit__';
    this.lastCoachStep = -1;
    this.lastSiteBUnlocked = null;
    this.toastClearAt = 0;
    this.cashFloatUntil = 0;
    this.powerFloatUntil = 0;
  }

  private beginNewGame(): void {
    if (this._starting) return;
    this._starting = true;
    clearSave();
    this.hideTitleScreen();
    playSfx('click');
    this.onNewGame();
    this._starting = false;
  }

  private applyLoad(): void {
    const data = loadGame();
    if (!data) {
      this.sim.message = 'No save found.';
      playSfx('error');
      return;
    }
    this.sim.load(data);
    this.resetCaches();
    this.hideTitleScreen();
    this.onHudReset?.();
    playSfx('save');
    this.sim.message = 'Game loaded.';
  }

  private applyLoadFromTitle(): void {
    const data = loadGame();
    if (!data) {
      this.sim.message = 'No save found.';
      playSfx('error');
      return;
    }
    this.sim.load(data);
    this.resetCaches();
    this.hideTitleScreen();
    this.onHudReset?.();
    playSfx('save');
    this.sim.message = 'Welcome back — save loaded.';
  }

  private refreshTitleActions(): void {
    const actions = this.root.querySelector('[data-k="title-actions"]') as HTMLElement | null;
    const meta = this.root.querySelector('[data-k="title-meta"]') as HTMLElement | null;
    if (!actions) return;
    const saved = hasSave();
    const saveMeta = getSaveMeta();
    actions.replaceChildren();
    if (saved) {
      const cont = document.createElement('button');
      cont.type = 'button';
      cont.className = 'primary';
      cont.dataset.action = 'title-continue';
      cont.textContent = 'Continue';
      cont.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.applyLoadFromTitle();
      });
      actions.appendChild(cont);
    }
    const start = document.createElement('button');
    start.type = 'button';
    start.className = saved ? '' : 'primary';
    start.dataset.action = 'title-new';
    start.textContent = saved ? 'New Game' : 'Start';
    start.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.beginNewGame();
    });
    actions.appendChild(start);
    if (meta) {
      meta.textContent = saveMeta
        ? `Save from ${new Date(saveMeta.savedAt).toLocaleString()}`
        : 'A solar management slice — Level 1';
    }
  }

  private syncMuteButton(): void {
    const btn = this.root.querySelector('[data-k="mute"]') as HTMLElement | null;
    if (!btn) return;
    btn.textContent = isMuted() ? 'Unmute' : 'Mute';
    btn.classList.toggle('muted-on', isMuted());
  }

  private drawMinimap(snapshot: GameSnapshot): void {
    const ctx = this.minimapCtx;
    if (!ctx) return;
    const w = 220;
    const h = 120;
    const sx = (tx: number) => 8 + tx * 4.8;
    const sy = (ty: number) => 6 + ty * 3.5;
    ctx.clearRect(0, 0, w, h);

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#7ec4ef');
    grad.addColorStop(0.28, '#6db848');
    grad.addColorStop(1, '#3f8a28');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(90, 170, 55, 0.35)';
    ctx.beginPath();
    ctx.ellipse(55, 48, 42, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(155, 62, 48, 30, 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    for (let y = 0; y <= h; y += 2) {
      const t = y / h;
      const worldY = t * 30;
      const wobble = Math.sin(worldY * 0.45) * 0.7 + Math.sin(worldY * 0.17) * 0.4;
      const x = sx(19 + wobble);
      if (y === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#2e7eb8';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.strokeStyle = '#4aade0';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(190, 230, 255, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const roads: Array<[number, number, number, number]> = [
      [3, 6, 34, 6],
      [11, 6, 11, 16],
      [15, 6, 15, 12],
      [11, 12, 15, 12],
      [21, 8, 32, 8],
      [26, 8, 26, 14],
    ];
    ctx.strokeStyle = '#4a4e56';
    ctx.lineWidth = 3;
    ctx.lineCap = 'butt';
    for (const [x0, y0, x1, y1] of roads) {
      ctx.beginPath();
      ctx.moveTo(sx(x0), sy(y0));
      ctx.lineTo(sx(x1), sy(y1));
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(220, 210, 140, 0.55)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    for (const [x0, y0, x1, y1] of roads) {
      ctx.beginPath();
      ctx.moveTo(sx(x0), sy(y0));
      ctx.lineTo(sx(x1), sy(y1));
      ctx.stroke();
    }
    ctx.setLineDash([]);

    for (const plot of snapshot.plots) {
      const px = sx(plot.origin.x);
      const py = sy(plot.origin.y);
      const pw = plot.size.x * 4.8;
      const ph = plot.size.y * 3.5;
      ctx.fillStyle = plot.unlocked ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.28)';
      ctx.fillRect(px, py, pw, ph);
      ctx.strokeStyle = plot.unlocked ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.12)';
      ctx.strokeRect(px, py, pw, ph);
    }

    for (const member of snapshot.staff) {
      const px = sx(member.tile.x);
      const py = sy(member.tile.y);
      ctx.beginPath();
      ctx.fillStyle = '#f5d742';
      ctx.arc(px + 2, py + 2, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(40, 30, 0, 0.45)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    for (const eq of snapshot.equipment) {
      const px = sx(eq.tile.x);
      const py = sy(eq.tile.y);
      if (eq.kind === 'office') {
        ctx.fillStyle = '#f4f7fb';
        ctx.fillRect(px - 1, py - 1, 6, 6);
      } else if (eq.kind === 'substation') {
        ctx.fillStyle = '#9aa3b0';
        ctx.fillRect(px - 1, py - 1, 5, 5);
      } else if (eq.kind.includes('pv')) {
        ctx.beginPath();
        ctx.fillStyle = eq.faulted ? '#ff4455' : '#2f7fe0';
        ctx.arc(px + 2, py + 2, 2.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.fillStyle = '#f5c542';
        ctx.arc(px + 2, py + 2, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  render(snapshot: GameSnapshot): void {
    const setText = (k: string, text: string) => {
      const el = this.root.querySelector(`[data-k="${k}"]`) as HTMLElement | null;
      if (el && el.textContent !== text) el.textContent = text;
    };

    setText('cash-val', money(snapshot.cash));
    const cashFloat = this.root.querySelector('[data-k="cash-float"]') as HTMLElement;
    // Accumulate trickle revenue — per-frame +$1 rarely fires at early export rates.
    if (this.lastCash >= 0 && snapshot.cash > this.lastCash) {
      this.cashAccrued += snapshot.cash - this.lastCash;
    }
    if (this.cashAccrued >= 4) {
      this.cashFloatAmount = this.cashAccrued;
      this.cashAccrued = 0;
      this.cashFloatUntil = performance.now() + 1200;
      cashFloat.textContent = `+${money(this.cashFloatAmount)}`;
      cashFloat.hidden = false;
      cashFloat.classList.remove('cash-float-animate');
      void cashFloat.offsetWidth;
      cashFloat.classList.add('cash-float-animate');
    }
    this.lastCash = snapshot.cash;
    if (this.cashFloatUntil && performance.now() > this.cashFloatUntil) {
      cashFloat.hidden = true;
      this.cashFloatUntil = 0;
    }
    const rate = snapshot.revenuePerHour || 0;
    setText('cash-rate', `${rate >= 0 ? '+' : '−'}${money(Math.abs(rate))}/h`);
    const cashRateEl = this.root.querySelector('[data-k="cash-rate"]') as HTMLElement | null;
    if (cashRateEl) cashRateEl.style.color = rate >= 0 ? 'var(--accent)' : 'var(--danger)';
    const cheapestBuild = Math.min(...BUILD_MENU_ORDER.map((id) => EQUIPMENT[id].cost));
    const cashChip = this.root.querySelector('[data-k="cash-chip"]') as HTMLElement | null;
    cashChip?.classList.toggle('cash-low', snapshot.cash < cheapestBuild);
    cashChip?.classList.toggle('cash-earning', rate >= 2);

    setText('power-val', `${snapshot.exportedKw.toFixed(1)} kW export`);
    const powerGen = this.root.querySelector('[data-k="power-gen"]') as HTMLElement | null;
    const genGap = Math.abs(snapshot.powerKw - snapshot.exportedKw);
    if (powerGen) {
      if (genGap >= 0.4) {
        powerGen.hidden = false;
        powerGen.textContent = `gen ${snapshot.powerKw.toFixed(1)} kW`;
      } else {
        powerGen.hidden = true;
        powerGen.textContent = '';
      }
    }

    const powerFloat = this.root.querySelector('[data-k="power-float"]') as HTMLElement;
    const powerChip = this.root.querySelector('[data-k="power-chip"]') as HTMLElement | null;
    if (this.lastExportedKw >= 0 && snapshot.exportedKw > this.lastExportedKw + 0.2) {
      this.powerFloatAmount = snapshot.exportedKw - this.lastExportedKw;
      this.powerFloatUntil = performance.now() + 1100;
      powerFloat.textContent = `+${this.powerFloatAmount.toFixed(1)} kW`;
      powerFloat.hidden = false;
      powerFloat.classList.remove('power-float-animate');
      void powerFloat.offsetWidth;
      powerFloat.classList.add('power-float-animate');
      powerChip?.classList.remove('power-chip-pop');
      void powerChip?.offsetWidth;
      powerChip?.classList.add('power-chip-pop');
    }
    this.lastExportedKw = snapshot.exportedKw;
    if (this.powerFloatUntil && performance.now() > this.powerFloatUntil) {
      powerFloat.hidden = true;
      this.powerFloatUntil = 0;
    }
    const capacity = Math.max(100, snapshot.powerKw * 1.15, snapshot.exportedKw);
    const pct = Math.min(100, (snapshot.exportedKw / capacity) * 100);
    const bar = this.root.querySelector('[data-k="power-bar"]') as HTMLElement;
    bar.style.width = `${pct}%`;
    bar.classList.toggle('bar-glow', pct > 40);

    const weatherEl = this.root.querySelector('[data-k="weather-icon"]') as HTMLElement;
    weatherEl.className = `chip-icon ${weatherIconClass(snapshot.weather, snapshot.irradiance)}`;
    setText('weather-val', weatherLabel(snapshot.weather, snapshot.irradiance));
    setText('weather-mod', weatherModLabel(snapshot.weather, snapshot.irradiance));
    if (snapshot.weather !== this.lastWeather) {
      this.lastWeather = snapshot.weather;
      setAmbienceWeather(snapshot.weather);
    }

    setText('time-val', `Day ${snapshot.day}, ${seasonForDay(snapshot.day)}, Year 1`);
    setText('time-clock', clock(snapshot.hour));

    const hasPv = snapshot.equipment.some(
      (e) => (e.kind === 'bargain_pv' || e.kind === 'premium_pv') && e.commissioned,
    );
    const sunHint = this.root.querySelector('[data-k="sun-hint"]') as HTMLElement;
    const waitingForSun = hasPv && snapshot.irradiance < 0.35 && snapshot.exportedKw < 1;
    sunHint.hidden = this.showTitle || !waitingForSun;

    const stars = this.root.querySelector('[data-k="stars"]') as HTMLElement;
    const starText = `${'★'.repeat(snapshot.stars)}${'☆'.repeat(3 - snapshot.stars)}`;
    if (stars.textContent !== starText) {
      stars.textContent = starText;
      if (snapshot.stars > this.lastStars) {
        stars.classList.remove('stars-fill-pop');
        void stars.offsetWidth;
        stars.classList.add('stars-fill-pop');
        // SFX owned by GameScene.consumeCeremony / star path — avoid double play.
      }
    }
    this.lastStars = snapshot.stars;

    this.renderCeremony();

    this.root.querySelectorAll('[data-speed]').forEach((btn) => {
      const b = btn as HTMLElement;
      b.classList.toggle('active', Number(b.getAttribute('data-speed')) === snapshot.speed);
    });

    const opsChip = this.root.querySelector('[data-k="ops-chip"]') as HTMLElement;
    const busy = snapshot.staffBusyHours > 0.05;
    const showOps = snapshot.openFaults > 0 || busy;
    opsChip.hidden = this.showTitle || !showOps;
    opsChip.classList.toggle('ops-alert', snapshot.openFaults >= 2);
    opsChip.classList.toggle('ops-busy', busy);
    setText(
      'ops-faults',
      snapshot.openFaults === 0
        ? 'Clear'
        : snapshot.openFaults === 1
          ? '1 fault'
          : `${snapshot.openFaults} faults`,
    );
    setText(
      'ops-busy',
      busy ? `Crew busy ${Math.ceil(snapshot.staffBusyHours)}h` : snapshot.openFaults > 0 ? 'Press R' : '',
    );

    // Onboarding coach
    const coach = this.root.querySelector('[data-k="coach"]') as HTMLElement;
    const step = snapshot.onboardingStep;
    if (!this.showTitle && step >= 0 && step < ONBOARDING_STEPS.length) {
      coach.hidden = false;
      if (step !== this.lastCoachStep) {
        this.lastCoachStep = step;
        const def = ONBOARDING_STEPS[step];
        setText('coach-title', def.title);
        setText('coach-body', def.body);
        const nextBtn = this.root.querySelector('[data-action="coach-next"]') as HTMLElement | null;
        if (nextBtn) {
          nextBtn.textContent = step >= ONBOARDING_STEPS.length - 1 ? 'Got it' : 'Next';
        }
      }
    } else {
      coach.hidden = true;
      this.lastCoachStep = -1;
    }

    // Objectives — incomplete first, then recent complete; count = completed / total
    const totalObjectives = snapshot.objectives.length;
    const completedCount = snapshot.objectives.filter((o) => o.complete).length;
    const incompleteActive = snapshot.objectives.filter((o) => !o.complete && o.active);
    const incompleteInactive = snapshot.objectives.filter((o) => !o.complete && !o.active);
    const completeRecent = snapshot.objectives.filter((o) => o.complete);
    const ordered = [...incompleteActive, ...incompleteInactive, ...completeRecent].slice(0, 6);
    const objectivesKey =
      `${completedCount}/${totalObjectives}|` +
      ordered.map((o) => `${o.id}:${o.complete}:${o.active}`).join('|');
    if (objectivesKey !== this.lastObjectivesKey) {
      const newlyDone = ordered.filter((o) => o.complete && !this.completedObjectiveIds.has(o.id));
      this.lastObjectivesKey = objectivesKey;
      const objList = this.root.querySelector('[data-k="objectives"]') as HTMLElement;
      const progressPct = totalObjectives ? Math.round((completedCount / totalObjectives) * 100) : 0;
      const focus = incompleteActive[0] ?? incompleteInactive[0];
      const focusReward = focus?.rewardText
        ? `<em class="focus-reward">${focus.rewardText}</em>`
        : '';
      const focusHtml = focus
        ? `<li class="obj-focus"><span class="focus-label">Next</span><strong>${focus.title}</strong><span>${focus.description}</span>${focusReward}</li>`
        : '';
      objList.innerHTML =
        `<li class="obj-progress"><div class="bar"><i style="width:${progressPct}%"></i></div><span>${completedCount}/${totalObjectives} complete</span></li>` +
        focusHtml +
        ordered
          .map((o) => {
            const mark = o.complete ? '✓' : '○';
            const pulse = o.complete && newlyDone.some((n) => n.id === o.id) ? ' check-pulse' : '';
            const cls = o.complete ? 'done' : o.active ? 'active' : 'pending';
            const reward = o.rewardText && !o.complete
              ? `<em class="obj-reward">${o.rewardText}</em>`
              : o.complete && o.rewardText && newlyDone.some((n) => n.id === o.id)
                ? `<em class="obj-reward done">${o.rewardText}</em>`
                : '';
            return `<li class="${cls}">
            <span class="check${pulse}">${mark}</span>
            <div><strong>${o.title}</strong><span>${o.description}</span>${reward}</div>
          </li>`;
          })
          .join('');
      for (const o of newlyDone) {
        if (o.id === 'first_power') {
          this.sim.message =
            'First Power! Electrons are leaving the valley — watch +$/h and keep building.';
          if (this.sim.onboardingStep < 4) this.sim.onboardingStep = 3;
        }
      }
      for (const o of snapshot.objectives) {
        if (o.complete) this.completedObjectiveIds.add(o.id);
      }
    }

    // Site B badge on minimap legend
    const siteB = snapshot.plots.find((p) => p.id === 'site_b');
    const siteBUnlocked = !!siteB?.unlocked;
    if (siteBUnlocked !== this.lastSiteBUnlocked) {
      this.lastSiteBUnlocked = siteBUnlocked;
      const legend = this.root.querySelector('[data-k="minimap-legend"]') as HTMLElement;
      const existing = legend.querySelector('.site-b-badge');
      if (siteBUnlocked && !existing) {
        const badge = document.createElement('span');
        badge.className = 'site-b-badge';
        badge.innerHTML = `<i class="swatch site-b"></i>Site B open`;
        legend.appendChild(badge);
      } else if (!siteBUnlocked && existing) {
        existing.remove();
      }
    }

    const buildKey = `${snapshot.buildMode ?? ''}|${this.buildCategory}`;
    if (buildKey !== this.lastBuildKey) {
      this.lastBuildKey = buildKey;
      const build = this.root.querySelector('[data-k="build"]') as HTMLElement;
      const items = BUILD_MENU_ORDER.filter((id) => {
        const def = EQUIPMENT[id];
        if (this.buildCategory === 'all') return true;
        if (this.buildCategory === 'generation') return def.category === 'generation';
        if (this.buildCategory === 'grid') return def.category === 'electrical';
        if (this.buildCategory === 'support') return def.category === 'building';
        return true;
      });
      build.innerHTML = items
        .map((id) => {
          const def = EQUIPMENT[id];
          const active = snapshot.buildMode === id ? 'active' : '';
          const tip = `${def.name} — ${def.description}`;
          return `<button type="button" class="build-card ${active}" data-build="${id}" title="${tip.replace(/"/g, '&quot;')}">
            <span class="build-icon">${BUILD_ICONS[id] ?? '■'}</span>
            <strong>${def.name}</strong>
            <span class="price">${money(def.cost)}</span>
          </button>`;
        })
        .join('');
      if (items.length === 0) {
        build.innerHTML = `<div class="muted">Nothing in this category yet.</div>`;
      }
    }

    const buildPanel = this.root.querySelector('.panel.build') as HTMLElement;
    buildPanel?.classList.toggle('build-mode-active', !!snapshot.buildMode);

    const banner = this.root.querySelector('[data-k="build-banner"]') as HTMLElement;
    if (snapshot.buildMode) {
      banner.hidden = false;
      banner.classList.add('active');
      const def = EQUIPMENT[snapshot.buildMode];
      setText('build-banner-label', `Placing ${def.name}`);
    } else {
      banner.hidden = true;
      banner.classList.remove('active');
    }

    const capsKey = snapshot.capabilities.join(',');
    if (capsKey !== this.lastCapsKey) {
      this.lastCapsKey = capsKey;
      const caps = this.root.querySelector('[data-k="caps"]') as HTMLElement;
      if (snapshot.capabilities.length === 0) {
        caps.innerHTML = `<li class="muted">None yet — earn them in play.</li>`;
      } else {
        caps.innerHTML = snapshot.capabilities
          .map(
            (c) =>
              `<li><strong>${CAPABILITY_INFO[c].name}</strong><span>${CAPABILITY_INFO[c].description}</span></li>`,
          )
          .join('');
      }
    }

    const toast = this.root.querySelector('[data-k="toast"]') as HTMLElement;
    if (snapshot.message !== this.lastMessage) {
      this.lastMessage = snapshot.message;
      if (snapshot.message) {
        toast.hidden = false;
        toast.textContent = snapshot.message;
        const msg = snapshot.message.toLowerCase();
        const isSuccess =
          msg.includes('complete') ||
          msg.includes('unlocked') ||
          msg.includes('commissioned') ||
          msg.includes('first power') ||
          msg.includes('—');
        toast.classList.toggle('toast-success', isSuccess);
        // Unlock / first-power / star SFX come from ceremony path — avoid doubles.
        this.toastClearAt = performance.now() + (isSuccess ? 4200 : 3500);
      } else {
        toast.hidden = true;
        toast.classList.remove('toast-success');
        this.toastClearAt = 0;
      }
    } else if (this.toastClearAt && performance.now() > this.toastClearAt) {
      toast.hidden = true;
      toast.classList.remove('toast-success');
      this.toastClearAt = 0;
      if (this.sim.message === snapshot.message) {
        this.sim.message = null;
        this.lastMessage = null;
      }
    }

    const selected = snapshot.equipment.find((e) => e.id === snapshot.selectedId);
    const staff = snapshot.staff.find((s) => s.id === snapshot.selectedId);
    const selectionBodyKey = selected
      ? `eq:${selected.id}:${Math.floor(selected.soiling * 10)}:${Math.floor(selected.condition * 10)}:${selected.faulted}:${selected.commissioned}`
      : staff
        ? `staff:${staff.id}:${staff.task.type}`
        : 'none';
    const selectionActionsKey = selected
      ? `act:${selected.id}:${selected.faulted}:${selected.soiling >= 0.15}:${snapshot.capabilities.includes('radio_dispatch')}:${selected.kind}`
      : staff
        ? `act:staff:${staff.id}`
        : 'act:none';

    if (selectionBodyKey !== this.lastSelectionKey) {
      this.lastSelectionKey = selectionBodyKey;
      const selBody = this.root.querySelector('[data-k="selection-body"]') as HTMLElement;
      if (selected) {
        const def = EQUIPMENT[selected.kind];
        selBody.innerHTML = `
        <strong>${def.name}</strong>
        <div class="sel-grid">
          <span>Condition</span><b>${(selected.condition * 100).toFixed(0)}%</b>
          <span>Soiling</span><b>${(selected.soiling * 100).toFixed(0)}%</b>
          <span>Status</span><b class="${selected.faulted ? 'bad' : 'ok'}">${selected.faulted ? 'FAULTED' : selected.commissioned ? 'Online' : 'Building…'}</b>
          <span>Plot</span><b>${selected.plotId}</b>
        </div>`;
      } else if (staff) {
        selBody.innerHTML = `<strong>${staff.name}</strong><div>Technician · ${staff.task.type}</div>`;
      } else {
        selBody.textContent = 'Click equipment or staff.';
      }
    }

    if (selectionActionsKey !== this.lastSelectionActionsKey) {
      this.lastSelectionActionsKey = selectionActionsKey;
      const selActions = this.root.querySelector('[data-k="selection-actions"]') as HTMLElement;
      if (selected) {
        let actions = '';
        if (selected.faulted && !snapshot.capabilities.includes('radio_dispatch')) {
          actions += `<button type="button" data-action="repair" data-id="${selected.id}">Dispatch Repair</button>`;
        }
        if ((selected.kind === 'bargain_pv' || selected.kind === 'premium_pv') && selected.soiling >= 0.15) {
          actions += `<button type="button" data-action="clean" data-id="${selected.id}">Clean Array</button>`;
        }
        selActions.innerHTML = actions || `<span class="muted">No actions</span>`;
      } else {
        selActions.innerHTML = '';
      }
    }

    const modal = this.root.querySelector('[data-k="modal"]') as HTMLElement;
    if (snapshot.activeEvent) {
      modal.hidden = false;
      if (this.lastEventId !== snapshot.activeEvent.id) {
        this.lastEventId = snapshot.activeEvent.id;
        (this.root.querySelector('[data-k="modal-title"]') as HTMLElement).textContent =
          snapshot.activeEvent.title;
        (this.root.querySelector('[data-k="modal-body"]') as HTMLElement).textContent =
          snapshot.activeEvent.body;
        const actions = this.root.querySelector('[data-k="modal-actions"]') as HTMLElement;
        actions.innerHTML = snapshot.activeEvent.choices
          .map(
            (c, i) =>
              `<button type="button" data-action="event-choice" data-id="${c.id}"><strong>${i + 1}. ${c.label}</strong><span>${c.description}</span></button>`,
          )
          .join('');
        playSfx('event');
      }
    } else {
      modal.hidden = true;
      this.lastEventId = null;
    }

    const win = this.root.querySelector('[data-k="win"]') as HTMLElement;
    if (snapshot.scenarioComplete && snapshot.stars >= 1 && !win.dataset.shown) {
      win.hidden = false;
      win.dataset.shown = '1';
      setText('win-title', starWinTitle(snapshot.stars));
      setText('win-body', starWinBody(snapshot.stars));
      const stamp = this.root.querySelector('[data-k="star-stamp"]') as HTMLElement;
      stamp.textContent = '★'.repeat(Math.max(1, snapshot.stars));
      stamp.classList.remove('stamp-pop');
      void stamp.offsetWidth;
      stamp.classList.add('stamp-pop');
      this.burstConfetti(this.root.querySelector('[data-k="win-confetti"]') as HTMLElement, 48);
      // Star SFX already fired by ceremony banner when the star objective completed.
    } else if (win.dataset.shown && snapshot.stars > 0) {
      // Keep win card text current if stars climb while modal still open
      const titleEl = this.root.querySelector('[data-k="win-title"]') as HTMLElement | null;
      if (titleEl && !win.hidden) {
        setText('win-title', starWinTitle(snapshot.stars));
        setText('win-body', starWinBody(snapshot.stars));
        const stamp = this.root.querySelector('[data-k="star-stamp"]') as HTMLElement;
        const next = '★'.repeat(Math.max(1, snapshot.stars));
        if (stamp.textContent !== next) {
          stamp.textContent = next;
          stamp.classList.remove('stamp-pop');
          void stamp.offsetWidth;
          stamp.classList.add('stamp-pop');
          this.burstConfetti(this.root.querySelector('[data-k="win-confetti"]') as HTMLElement, 28);
        }
      }
    }

    this.drawMinimap(snapshot);
  }

  private burstConfetti(host: HTMLElement | null, count: number): void {
    if (!host) return;
    host.hidden = false;
    host.innerHTML = '';
    const colors = ['#3ddc84', '#f5c542', '#2f6fd4', '#e8943a', '#f4f7ff', '#ff5d6c'];
    for (let i = 0; i < count; i++) {
      const bit = document.createElement('i');
      bit.style.setProperty('--x', `${Math.random() * 100}%`);
      bit.style.setProperty('--delay', `${Math.random() * 0.35}s`);
      bit.style.setProperty('--dur', `${1.4 + Math.random() * 1.2}s`);
      bit.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`);
      bit.style.background = colors[i % colors.length];
      bit.style.width = `${4 + (i % 4)}px`;
      bit.style.height = `${6 + (i % 5)}px`;
      host.appendChild(bit);
    }
    window.setTimeout(() => {
      host.innerHTML = '';
      if (host.dataset.persist !== '1') host.hidden = true;
    }, 2800);
  }

  private renderCeremony(): void {
    const el = this.root.querySelector('[data-k="ceremony"]') as HTMLElement;
    // Peek only — GameScene consumes for camera / world FX after HUD render.
    const kind = this.sim.pendingCeremony;
    if (kind && kind !== this.lastCeremonyShown) {
      this.lastCeremonyShown = kind;
      const copy = CEREMONY_COPY[kind];
      el.hidden = false;
      el.dataset.kind = kind;
      (this.root.querySelector('[data-k="ceremony-title"]') as HTMLElement).textContent = copy.title;
      (this.root.querySelector('[data-k="ceremony-body"]') as HTMLElement).textContent = copy.body;
      const card = this.root.querySelector('[data-k="ceremony-card"]') as HTMLElement;
      card.classList.remove('ceremony-pop');
      void card.offsetWidth;
      card.classList.add('ceremony-pop');
      if (kind === 'first_power') playSfx('first_power');
      else if (kind === 'star') playSfx('star');
      else if (kind === 'hail') playSfx('hail');
      else playSfx('unlock');
      if (kind === 'first_power' || kind === 'star' || kind === 'site_b') {
        this.burstConfetti(this.root.querySelector('[data-k="confetti"]') as HTMLElement, kind === 'star' ? 40 : 26);
      }
      this.ceremonyClearAt = performance.now() + (kind === 'first_power' || kind === 'hail' ? 4200 : 3200);
    } else if (this.ceremonyClearAt && performance.now() > this.ceremonyClearAt) {
      el.hidden = true;
      el.removeAttribute('data-kind');
      this.ceremonyClearAt = 0;
      this.lastCeremonyShown = null;
    }
  }
}
