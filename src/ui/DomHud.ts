import { SITE_ICONS } from '../game/siteArt';
import { ROAD_TILES, riverCenterX } from '../content/valleyLayout';
import { sound } from '../audio/sound';
import { BUILD_MENU_ORDER, EQUIPMENT } from '../content/equipment';
import { CAPABILITY_INFO } from '../content/scenario';
import type { GameSimulation } from '../simulation/GameSimulation';
import type { CapabilityId, EquipmentKind, GameSnapshot, StaffMember } from '../simulation/types';
import { clearSave, loadGame, saveGame } from '../persistence/save';

function money(n: number): string {
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

function weatherLabel(w: GameSnapshot['weather']): string {
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

/** Weather chip sub-label — never show nonsense like "-100% sun" when weather is Sunny. */
function weatherModLabel(weather: GameSnapshot['weather'], irradiance: number): string {
  // Combined irradiance includes daylight; near-zero means night regardless of sky label.
  if (irradiance < 0.05) return 'Night';

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
  // Cloudy / rain: show sky quality, not a negative delta from 100%.
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

const BUILD_ICONS: Record<string, string> = {
  bargain_pv: '<img src="/assets/game/pv_bargain.png" alt="" width="40" height="28"/>',
  premium_pv: '<img src="/assets/game/pv_premium.png" alt="" width="40" height="28"/>',
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
  office: '<img src="/assets/game/office.png" alt="" width="36" height="28"/>',
  substation: '<img src="/assets/game/substation.png" alt="" width="36" height="28"/>',
};

export class DomHud {
  private root: HTMLElement;
  private readonly listeners = new AbortController();
  destroy(): void { this.listeners.abort(); }

  private lastEventId: string | null = null;
  private lastObjectivesKey = '__uninit__';
  private lastBuildKey = '__uninit__';
  private lastCapsKey = '__uninit__';
  private lastCapabilityHtml = '';
  private lastRosterHtml = '';
  private lastSelectionKey = '__uninit__';
  private lastSelectionActionsKey = '__uninit__';
  private lastMessage: string | null = '__uninit__';
  private toastClearAt = 0;
  private buildCategory: 'all' | 'generation' | 'grid' | 'support' = 'generation';
  private minimapCtx: CanvasRenderingContext2D | null = null;
  private lastCash = -1;
  private cashFloatUntil = 0;
  private cashFloatAmount = 0;
  private lastExportedKw = -1;
  private powerFloatUntil = 0;
  private powerFloatAmount = 0;
  private lastStars = 0;
  private readonly completedObjectiveIds = new Set<string>();

  constructor(
    private readonly sim: GameSimulation,
    private readonly onNewGame: () => void,
  ) {
    for(const [kind,uri]of Object.entries(SITE_ICONS)) BUILD_ICONS[kind]='<img src="'+uri+'" alt="" width="48" height="38" style="object-fit:contain;image-rendering:pixelated"/>';
    const el = document.getElementById('ui-root');
    if (!el) throw new Error('#ui-root missing');
    this.root = el;
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
          <span class="chip-icon"><img src="/assets/game/icon_dollar.png" alt="" width="22" height="22"/></span>
          <div>
            <span class="chip-label">Cash</span>
            <strong data-k="cash-val">—</strong>
            <em data-k="cash-rate">—</em>
          </div>
          <span class="cash-float" data-k="cash-float" hidden></span>
        </div>

        <div class="chip power" data-k="power-chip">
          <span class="chip-icon"><img src="/assets/game/icon_power.png" alt="" width="22" height="22" style="filter:invert(1) sepia(1) saturate(5) hue-rotate(80deg)"/></span>
          <div class="chip-power">
            <span class="chip-label">Power output</span>
            <strong data-k="power-val">—</strong>
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
      </header>

      <aside class="panel objectives">
        <h2>Objectives</h2>
        <ul data-k="objectives"></ul>
      </aside>

      <aside class="panel minimap-panel">
        <h2>Valley map</h2>
        <canvas data-k="minimap" width="220" height="120"></canvas>
        <div class="minimap-legend">
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
          <button type="button" data-cat="all">All</button>
          <button type="button" data-cat="generation" class="active">Generation</button>
          <button type="button" data-cat="grid">Grid</button>
          <button type="button" data-cat="support">Support</button>
        </div>
        <div class="build-grid" data-k="build"></div>
        <button type="button" class="ghost" data-action="cancel-build">Cancel placement</button>
      </aside>

      <aside class="panel selection" data-k="selection">
        <h2>Selection</h2>
        <div data-k="selection-body">Click equipment or staff.</div>
        <div class="row" data-k="selection-actions"></div>
      </aside>

      <aside class="panel caps">
        <h2>Capabilities</h2>
        <ul data-k="caps"><li class="muted">None yet — earn them in play.</li></ul>
        <div data-k="capability-actions"></div>
      </aside>
      <aside class="panel"><h2>People & operations</h2><div data-k="roster"></div>
        <button type="button" data-action="hire" data-id="technician">Technician · $1,500</button>
        <button type="button" data-action="hire" data-id="cleaner">Cleaner · $1,500</button>
        <button type="button" data-action="hire" data-id="engineer">Engineer · $1,500</button>
        <button type="button" data-action="hire" data-id="manager">Site Manager · $1,500</button>
        <small>Technicians repair; cleaners clean. Engineers reduce faults; managers speed up field work. Salaries $1–2/sim hour.</small>
      </aside>
      <aside class="panel"><h2>Finance & reports</h2><div data-k="finance"></div>
        <small>1★ Complete all core lessons and the storm · 2★ 220 kW + Site B + Radio · 3★ 300 kW + prepared hail + Cleaning Kit. Scenario 2 unlock is recorded at 1★; its playable map is future content.</small>
      </aside>
      </div>

      <div class="toast" data-k="toast" hidden></div>
      <div class="build-banner" data-k="build-banner" hidden>
        <strong data-k="build-banner-label">Placing…</strong>
        <span>Click a valid meadow tile · Esc / Cancel to abort</span>
      </div>

      <footer class="hud-bottom">
        <button type="button" data-action="save">Save</button>
        <button type="button" data-action="load">Load</button>
        <button type="button" data-action="new">New Game</button>
        <button type="button" data-action="export-save">Export save</button>
        <button type="button" data-action="import-save">Import save</button>
        <button type="button" data-action="audio">Sound: off</button>
        <span class="hint">Drag pan · Wheel zoom · 1/2 events · R repair · C clean</span>
      </footer>

      <div class="modal" data-k="modal" hidden>
        <div class="modal-card">
          <h2 data-k="modal-title"></h2>
          <p data-k="modal-body"></p>
          <div class="modal-actions" data-k="modal-actions"></div>
        </div>
      </div>

      <div class="win" data-k="win" hidden>
        <div class="modal-card">
          <h2>1★ Complete!</h2>
          <p>Here Comes the Sun — scenario cleared. Keep playing for 2★ / 3★ mastery.</p>
          <button type="button" data-action="dismiss-win">Continue</button>
        </div>
      </div>
    `;

    const canvas = this.root.querySelector('[data-k="minimap"]') as HTMLCanvasElement;
    this.minimapCtx = canvas.getContext('2d');

    const handleUiAction = (ev: Event) => {
      const t = (ev.target as HTMLElement).closest(
        '[data-speed],[data-build],[data-action],[data-cat]',
      ) as HTMLElement | null;
      if (!t) return;
      ev.preventDefault();
      ev.stopPropagation();
      if ((t as HTMLButtonElement).disabled) return;
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
        return;
      }
      const build = t.getAttribute('data-build') as EquipmentKind | null;
      if (build) {
        this.sim.setBuildMode(build);
        return;
      }
      const action = t.getAttribute('data-action');
      if (action === 'cancel-build') this.sim.setBuildMode(null);
      if (action === 'save') {
        this.sim.message = saveGame(this.sim.serialize()) ? 'Game saved.' : 'Could not save. Use Export save to keep your progress.';
      }
      if (action === 'load') {
        const data = loadGame();
        if (data) {
          this.sim.load(data);
          this.sim.message = 'Game loaded.';
        } else {
          this.sim.message = 'No save found.';
        }
      }
      if (action === 'new') {
        if (!window.confirm('Start a new company? This replaces the local save. Export first to keep a copy.')) return;
        clearSave();
        this.onNewGame();
      }
      if (action === 'demolish') this.sim.demolish(t.getAttribute('data-id') ?? '');
      if (action === 'capability') this.sim.buyCapability(t.getAttribute('data-id') as CapabilityId);
      if (action === 'hire') this.sim.hireStaff(t.getAttribute('data-id') as StaffMember['role']);
      if (action === 'train') this.sim.trainStaff(t.getAttribute('data-id') ?? '');
      if (action === 'audio') {
        sound.toggle(); t.textContent = sound.enabled ? 'Sound: on' : 'Sound: off';
      }
      if (action === 'export-save') {
        const url = URL.createObjectURL(new Blob([JSON.stringify({ version: 1, savedAt: new Date().toISOString(), state: this.sim.serialize() })], { type: 'application/json' }));
        const a = document.createElement('a'); a.href = url; a.download = 'megawatt-valley-save.json'; a.click(); URL.revokeObjectURL(url);
      }
      if (action === 'import-save') {
        const input = document.createElement('input'); input.type = 'file'; input.accept = '.json,application/json';
        input.onchange = async () => {
          try {
            const file = input.files?.[0]; if (!file || file.size > 2_000_000) throw Error();
            const parsed = JSON.parse(await file.text());
            if (parsed.version !== 1) throw Error();
            this.sim.load(parsed.state); this.sim.message = 'Save imported.';
          } catch { this.sim.message = 'Invalid save file; your company was not changed.'; }
        };
        input.click();
      }
      sound.note(440, 0.04);
      if (action === 'repair') {
        const id = t.getAttribute('data-id');
        if (id) this.sim.dispatchRepair(id);
      }
      if (action === 'clean') {
        const id = t.getAttribute('data-id');
        if (id) this.sim.dispatchClean(id);
      }
      if (action === 'event-choice') {
        const id = t.getAttribute('data-id');
        if (id) this.sim.resolveEventChoice(id);
      }
      if (action === 'dismiss-win') {
        const win = this.root.querySelector('[data-k="win"]') as HTMLElement;
        win.hidden = true;
      }
    };
    this.root.addEventListener('click', handleUiAction, { signal: this.listeners.signal });

    window.addEventListener('keydown', (ev) => {
      if (ev.repeat || (ev.target as HTMLElement)?.closest('input,textarea,button')) return;
      if (ev.key === 'Escape' && this.sim.snapshot().buildMode) {
        this.sim.setBuildMode(null);
        return;
      }
      if (!this.sim.activeEvent) return;
      if (ev.key === '1' || ev.key === '2' || ev.key === '3') {
        const idx = Number(ev.key) - 1;
        const choice = this.sim.activeEvent.choices[idx];
        if (choice) this.sim.resolveEventChoice(choice.id);
      }
    }, { signal: this.listeners.signal });
  }

  private drawMinimap(snapshot: GameSnapshot): void {
    const ctx = this.minimapCtx;
    if (!ctx) return;
    const w = 220;
    const h = 120;
    const sx = (tx: number) => 8 + tx * 4.8;
    const sy = (ty: number) => 6 + ty * 3.5;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle='#91a674';ctx.fillRect(0,0,w,h);
    ctx.beginPath();
    for(let y=0;y<=30;y+=.5){const x=sx(riverCenterX(y));if(y===0)ctx.moveTo(x,sy(y));else ctx.lineTo(x,sy(y));}
    ctx.strokeStyle='#5d9f9e';ctx.lineWidth=11;ctx.stroke();
    ctx.fillStyle='#858e80';
    for(const tile of ROAD_TILES)ctx.fillRect(sx(tile.x)-2.4,sy(tile.y)-1.75,4.8,3.5);

    // Plots
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

    // Staff dots
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

    // Equipment dots
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
    if (this.lastCash >= 0 && snapshot.cash > this.lastCash + 1) {
      this.cashFloatAmount = snapshot.cash - this.lastCash;
      this.cashFloatUntil = performance.now() + 1100;
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
    const cheapestBuild = EQUIPMENT.bargain_pv.cost;
    const cashChip = this.root.querySelector('[data-k="cash-chip"]') as HTMLElement | null;
    cashChip?.classList.toggle('cash-low', snapshot.cash < cheapestBuild);
    setText('power-val', `${snapshot.exportedKw.toFixed(1)} kW export`);
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
    setText('weather-val', weatherLabel(snapshot.weather));
    // Irradiance folds in hour-of-day — don't show "-100% sun" at night while weather says Sunny.
    setText('weather-mod', weatherModLabel(snapshot.weather, snapshot.irradiance));

    setText('time-val', `Day ${snapshot.day}, ${seasonForDay(snapshot.day)}, Year 1`);
    setText('time-clock', clock(snapshot.hour));

    const stars = this.root.querySelector('[data-k="stars"]') as HTMLElement;
    const starText = `${'★'.repeat(snapshot.stars)}${'☆'.repeat(3 - snapshot.stars)}`;
    if (stars.textContent !== starText) {
      stars.textContent = starText;
      if (snapshot.stars > this.lastStars) {
        stars.classList.remove('stars-fill-pop');
        void stars.offsetWidth;
        stars.classList.add('stars-fill-pop');
      }
    }
    this.lastStars = snapshot.stars;

    this.root.querySelectorAll('[data-speed]').forEach((btn) => {
      const b = btn as HTMLElement;
      b.classList.toggle('active', Number(b.getAttribute('data-speed')) === snapshot.speed);
    });

    const activeObjs = snapshot.objectives.filter((o) => o.active || o.complete);
    const doneCount = activeObjs.filter((o) => o.complete).length;
    const objectivesKey = `${doneCount}/${activeObjs.length}|` + activeObjs.map((o) => `${o.id}:${o.complete}:${o.active}`).join('|');
    if (objectivesKey !== this.lastObjectivesKey) {
      const newlyDone = activeObjs.filter((o) => o.complete && !this.completedObjectiveIds.has(o.id));
      this.lastObjectivesKey = objectivesKey;
      const objList = this.root.querySelector('[data-k="objectives"]') as HTMLElement;
      const progressPct = activeObjs.length ? Math.round((doneCount / activeObjs.length) * 100) : 0;
      objList.innerHTML =
        `<li class="obj-progress"><div class="bar"><i style="width:${progressPct}%"></i></div><span>${doneCount}/${activeObjs.length} complete</span></li>` +
        activeObjs
          .sort((a, b) => Number(a.complete) - Number(b.complete))
          .slice(0, 6)
          .map((o) => {
            const mark = o.complete ? '✓' : '○';
            const pulse = o.complete && newlyDone.some((n) => n.id === o.id) ? ' check-pulse' : '';
            return `<li class="${o.complete ? 'done' : 'active'}">
            <span class="check${pulse}">${mark}</span>
            <div><strong>${o.title}</strong><span>${o.description}</span></div>
          </li>`;
          })
          .join('');
      for (const o of activeObjs) {
        if (o.complete) this.completedObjectiveIds.add(o.id);
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
            <span class="price">${money(def.cost)}</span><small>${def.nameplateKw ? def.nameplateKw + " kW · " + Math.round(def.reliability * 100) + "% reliability" : "Site improvement"}</small><small>${def.description}</small>
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

    const capsKey = snapshot.capabilities.join(',') + '|' + snapshot.plots[1].unlocked;
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

    const capActions = this.root.querySelector('[data-k="capability-actions"]') as HTMLElement;
    const capHtml = (['cleaning_rig','remote_monitoring','scheduled_cleaning'] as CapabilityId[]).map((id) => {
      const owned = snapshot.capabilities.includes(id);
      const locked = !snapshot.plots[1].unlocked || (id === 'scheduled_cleaning' && !snapshot.capabilities.includes('cleaning_rig'));
      return '<button type="button" data-action="capability" data-id="' + id + '" ' + (owned || locked ? 'disabled' : '') + ' title="' + CAPABILITY_INFO[id].description + '">' + (owned ? '✓ ' : locked ? 'Locked · ' : '') + CAPABILITY_INFO[id].name + '</button><small>' + CAPABILITY_INFO[id].description + '</small>';
    }).join('') + '<details><summary>Company capability tree</summary><h3>Generation technology</h3><small>✓ Fixed tilt → ✓ Premium PV → 🔒 Bifacial → 🔒 Trackers → 🔒 Wind</small><h3>Operations & reliability</h3><small>✓ Manual repairs → Earn Radio Dispatch + Workshop → Cleaning Kit → Cleaning Rig → Scheduled Cleaning → 🔒 Predictive Maintenance</small><h3>Digital & automation</h3><small>✓ Basic monitoring → Radio Dispatch → Remote Monitoring → 🔒 SCADA → 🔒 Robots → 🔒 Command Centre</small><h3>People & organisation</h3><small>✓ Technician → Hire Cleaner / Engineer / Manager → Train skills → 🔒 Regional O&M</small><h3>Grid & flexibility</h3><small>✓ Basic grid → Build Inverter → 🔒 BESS → 🔒 Hybrid systems</small><h3>Development & commercial</h3><small>✓ Site A → Earn Site B → 🔒 Site studies → 🔒 PPAs → 🔒 Multi-project finance</small><small>Locked future nodes are previews for later scenarios.</small></details>';
    if (this.lastCapabilityHtml !== capHtml) { this.lastCapabilityHtml = capHtml; capActions.innerHTML = capHtml; }
    const roster = this.root.querySelector('[data-k="roster"]') as HTMLElement;
    const rosterHtml = snapshot.staff.map((s) => '<div><strong>' + s.name + '</strong><small>' + s.role + ' · ' + (s.trait ?? 'Panel Whisperer') + ' · skill ' + (s.skill ?? 1).toFixed(1) + ' · ' + s.task.type + '</small><button type="button" data-action="train" data-id="' + s.id + '">Train · $800</button></div>').join('');
    if (this.lastRosterHtml !== rosterHtml) { this.lastRosterHtml = rosterHtml; roster.innerHTML = rosterHtml; }
    const finance = this.root.querySelector('[data-k="finance"]') as HTMLElement;
    finance.textContent = 'Sales ' + money(this.sim.lifetimeRevenue) + ' · Operating expenses ' + money(this.sim.totalExpenses) + ' · Energy ' + Math.round(snapshot.totalEnergyKwh) + ' kWh · Peak ' + Math.round(this.sim.peakExportKw) + ' kW · Staff ' + snapshot.staff.length;
    sound.update(snapshot.weather, snapshot.faultsRepaired, snapshot.cleansCompleted, snapshot.stars);

    const toast = this.root.querySelector('[data-k="toast"]') as HTMLElement;
    if (snapshot.message !== this.lastMessage) {
      this.lastMessage = snapshot.message;
      if (snapshot.message) {
        toast.hidden = false;
        toast.textContent = snapshot.message;
        const msg = snapshot.message.toLowerCase();
        const isSuccess =
          msg.includes('complete') || msg.includes('unlocked') || msg.includes('commissioned');
        toast.classList.toggle('toast-success', isSuccess);
        this.toastClearAt = performance.now() + 3500;
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
        let actions = EQUIPMENT[selected.kind].buildable ? '<button type="button" data-action="demolish" data-id="' + selected.id + '">Sell · 60% resale</button>' : '';
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
      }
    } else {
      modal.hidden = true;
      this.lastEventId = null;
    }

    const win = this.root.querySelector('[data-k="win"]') as HTMLElement;
    if (snapshot.scenarioComplete && snapshot.stars >= 1 && !win.dataset.shown) {
      win.hidden = false;
      win.dataset.shown = '1';
    }

    this.drawMinimap(snapshot);
  }
}
