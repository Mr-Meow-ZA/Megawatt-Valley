import { RESEARCH, RESEARCH_BRANCHES, type ResearchId } from '../content/research';
import type { Vec2 } from '../simulation/types';
import { SITE_ICONS } from '../game/siteArt';
import { ROAD_TILES, SCENERY, riverCenterX } from '../content/valleyLayout';
import { sound } from '../audio/sound';
import { BUILD_MENU_ORDER, EQUIPMENT } from '../content/equipment';
import { CAPABILITY_INFO, STAR_THRESHOLDS } from '../content/scenario';
import type { GameSimulation } from '../simulation/GameSimulation';
import type { CapabilityId, EquipmentKind, GameSnapshot, StaffMember } from '../simulation/types';
import { clearSave, loadGame, saveGame } from '../persistence/save';
import { ROLE_LABEL, staffPortrait, weatherLandscape } from './referenceArt';

const BUILD_LABEL: Partial<Record<EquipmentKind, string>> = { bargain_pv: 'Solar Array', premium_pv: 'Premium Array', inverter: 'Inverter Station', workshop: 'Maintenance Garage', road: 'Service Road', fence: 'Site Fence', gate: 'Service Gate', tree: 'Valley Tree', sign: 'Safety Sign' };
function escapeHtml(value: string): string { return value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!)); }

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

  private lastFinanceHtml = '';
  private lastResearchHtml = '';
  private lastAlertHtml = '';
  private alertLayoutKey = '';
  private researchReturnFocus: HTMLElement | null = null;
  isOverlayOpen(): boolean { return !!this.root.querySelector('.research-modal:not([hidden]), .modal:not([hidden]), .win:not([hidden])'); }
  private lastEventId: string | null = null;
  private lastObjectivesKey = '__uninit__';
  private lastBuildKey = '__uninit__';
  private lastCapsKey = '__uninit__';
  private lastCapabilityHtml = '';
  private lastRosterHtml = '';
  private lastOverviewHtml = '';
  private lastWeatherScene = '';
  private lastSelectionKey = '__uninit__';
  private lastSelectionActionsKey = '__uninit__';
  private lastMessage: string | null = '__uninit__';
  private toastClearAt = 0;
  private buildCategory: 'all' | 'generation' | 'grid' | 'support' | 'decor' = 'all';
  private managementView: 'build' | 'people' | 'caps' | 'finance' = 'build';
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
    private readonly onCamera: (tile: Vec2 | null) => void = () => {},
  ) {
    for(const [kind,uri]of Object.entries(SITE_ICONS)) BUILD_ICONS[kind]='<img src="'+uri+'" alt=""/>';
    const el = document.getElementById('ui-root');
    if (!el) throw new Error('#ui-root missing');
    this.root = el;
    this.root.classList.add('reference-hud');
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
        <div class="panel-title-row">
          <h2><span class="objective-star">★</span> Objectives</h2>
          <span class="panel-kicker">Here Comes the Sun</span>
        </div>
        <ul data-k="objectives"></ul>
      </aside>

      <aside class="panel selection contextual-panel" data-k="selection" hidden>
        <div class="panel-title-row">
          <h2>Selected</h2>
          <button type="button" class="inspector-close" data-action="close-inspector" aria-label="Close inspector">×</button>
        </div>
        <div data-k="selection-body">Click equipment or staff.</div>
        <div class="row" data-k="selection-actions"></div>
      </aside>

      <aside class="panel minimap-panel">
        <div class="panel-title-row">
          <h2>Valley Map</h2>
          <button type="button" class="map-home" data-action="map-home" title="Return to home view" aria-label="Return to home view">⌂</button>
        </div>
        <canvas data-k="minimap" width="660" height="360"></canvas>
        <div class="minimap-legend">
          <span><i class="swatch grass"></i>Terrain</span>
          <span><i class="swatch solar"></i>Solar</span>
          <span><i class="swatch grid"></i>Grid</span>
          <span><i class="swatch build"></i>Buildings</span>
        </div>
      </aside>

      <section class="management-dock" data-k="management-dock">
        <nav class="dock-nav" aria-label="Management">
          <button type="button" class="active" data-action="jump" data-id="build"><span>⚒</span> Build</button>
          <button type="button" data-action="jump" data-id="people"><svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="7" cy="6" r="3"/><path d="M1 17v-2a6 6 0 0 1 12 0v2M13 3a3 3 0 0 1 0 6M15 12a5 5 0 0 1 4 5"/></svg> Team</button>
          <button type="button" data-action="jump" data-id="caps"><span>⚙</span> Upgrades</button>
          <button type="button" data-action="jump" data-id="finance"><span>▥</span> Finance</button>
          <div class="dock-hint">Drag to pan · Wheel zoom · H home · F find · U research</div>
          <button type="button" class="dock-toggle" data-action="toggle-dock" aria-expanded="true" aria-controls="management-content" title="Collapse management panel">⌄</button>
        </nav>

        <div class="dock-content" id="management-content">
          <aside class="overview-panel staff-overview" aria-label="Staff overview">
            <header class="overview-header"><h2><span>♟</span> Staff</h2><span>Meet your valley crew</span></header>
            <div class="role-gallery">${(['engineer', 'technician', 'cleaner', 'manager'] as StaffMember['role'][]).map(role => `<button type="button" data-action="manage-team" title="Manage your ${ROLE_LABEL[role].toLowerCase()} team">${staffPortrait(role)}<strong>${ROLE_LABEL[role]}</strong><small data-role-count="${role}">0 hired</small></button>`).join('')}</div>
            <div class="crew-summary" data-k="crew-summary"></div>
            <button type="button" class="team-launch" data-action="manage-team">Manage team <span>Hire & train →</span></button>
          </aside>
          <aside class="overview-panel events-overview" aria-label="Events overview">
            <header class="overview-header"><h2><span>⚑</span> Events</h2><span>A living, changing valley</span></header>
            <div class="weather-scene" data-k="weather-scene"></div>
            <div class="weather-report"><strong data-k="weather-report-title"></strong><p data-k="weather-report-body"></p></div>
            <div class="activity-row"><span>◷</span><div><strong>Park update</strong><p data-k="park-update"></p></div></div>
            <button type="button" class="development-launch" data-action="manage-upgrades"><span>⚙</span><div><strong>Company development</strong><small data-k="development-status"></small></div><b>›</b></button>
          </aside>
          <aside class="panel build dock-panel active" data-panel="build">
            <div class="dock-panel-header">
              <div>
                <h2>⚒ Build Menu</h2>
                <span>Plan a brighter valley</span>
              </div>
              <button type="button" class="ghost cancel-build" data-action="cancel-build">Cancel placement</button>
            </div>
            <div class="build-tabs" aria-label="Build categories">
              <button type="button" data-cat="all" class="active">All</button>
              <button type="button" data-cat="generation">Solar</button>
              <button type="button" data-cat="support">Operations</button>
              <button type="button" data-cat="grid">Grid & Utilities</button>
              <button type="button" data-cat="decor">Decorations</button>
            </div>
            <div class="build-grid" data-k="build"></div>
          </aside>

          <aside class="panel people dock-panel" data-panel="people" hidden>
            <div class="dock-panel-header">
              <div><h2>People & Operations</h2><span>Build your O&M team</span></div>
              <div class="hire-actions">
                <button type="button" data-action="hire" data-id="technician">+ Technician · $1,500</button>
                <button type="button" data-action="hire" data-id="cleaner">+ Cleaner · $1,500</button>
                <button type="button" data-action="hire" data-id="engineer">+ Engineer · $1,500</button>
                <button type="button" data-action="hire" data-id="manager">+ Manager · $1,500</button>
              </div>
            </div>
            <div class="roster-grid" data-k="roster"></div>
          </aside>

          <aside class="panel caps dock-panel" data-panel="caps" hidden>
            <div class="dock-panel-header">
              <div><h2>Company Upgrades</h2><span>Move work from manual to automated</span></div>
            </div>
            <ul data-k="caps"><li class="muted">None yet — earn them in play.</li></ul>
            <button type="button" class="research-launch" data-action="open-research">Open tech tree · 9 upgrades</button><small data-k="research-summary">Office research · one project at a time</small>
            <div class="capability-grid" data-k="capability-actions"></div>
          </aside>

          <aside class="panel finance dock-panel" data-panel="finance" hidden>
            <div class="dock-panel-header">
              <div><h2>Finance & Reports</h2><span>Cash flow, output and playtest tools</span></div>
            </div>
            <div class="finance-summary" data-k="finance"></div>
            <small>1★ Complete the core lessons and storm · 2★ 220 kW + Site B + Radio · 3★ 300 kW + prepared hail + Cleaning Kit.</small>
            <details class="playtest-tools">
              <summary>Playtest cheats</summary>
              <button type="button" data-action="cheat-cash" data-amount="25000">+$25,000 cash</button>
              <button type="button" data-action="cheat-cash" data-amount="100000">+$100,000 cash</button>
              <button type="button" data-action="cheat-event">Trigger positive event</button>
              <small>Ctrl+Shift+M = +$25k · Ctrl+Shift+G = positive event.</small>
            </details>
          </aside>
        </div>
      </section>

      <details class="utility-menu">
        <summary title="Game menu">⚙</summary>
        <div class="utility-popover">
          <strong>Game</strong>
          <button type="button" data-action="save">Save</button>
          <button type="button" data-action="load">Load</button>
          <button type="button" data-action="new">New Game</button>
          <button type="button" data-action="export-save">Export save</button>
          <button type="button" data-action="import-save">Import save</button>
          <button type="button" data-action="home-camera">Home view · H</button>
          <button type="button" data-action="focus-selected">Find selected · F</button>
          <button type="button" data-action="open-research">Tech tree · U</button>
          <button type="button" data-action="audio">Sound: off</button>
        </div>
      </details>

      <div class="park-alerts" data-k="park-alerts" aria-label="Park alerts"></div>
      <div class="research-modal" data-k="research-modal" role="dialog" aria-modal="true" aria-labelledby="research-title" hidden>
        <section class="research-board">
          <header><div><span class="research-eyebrow">COMPANY DEVELOPMENT</span><h2 id="research-title">A brighter tomorrow</h2><p>Choose what your park gets better at. Every upgrade below works.</p></div><button type="button" data-action="close-research" aria-label="Close tech tree">×</button></header>
          <div class="research-office"><span data-k="research-office">Office research</span><strong data-k="research-cash"></strong></div>
          <div class="research-columns" data-k="research-tree"></div>
          <footer>One project at a time · Paid when started · Progress uses park hours and pauses with the game<br>Engineers add 10% research speed per skill point, up to +100%. They still service your park.</footer>
        </section>
      </div>
      <div class="toast" data-k="toast" hidden></div>
      <div class="build-banner" data-k="build-banner" hidden>
        <strong data-k="build-banner-label">Placing…</strong>
        <span>Click a valid tile · Shift-click to keep building · Esc to cancel</span>
      </div>


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

    canvas.tabIndex = 0;
    canvas.setAttribute('aria-label', 'Valley map. Click to navigate. Enter returns to the home view.');
    canvas.addEventListener('click', ev => {
      const rect = canvas.getBoundingClientRect();
      this.onCamera({ x: ((ev.clientX - rect.left) * 220 / rect.width - 8) / 4.8, y: ((ev.clientY - rect.top) * 120 / rect.height - 6) / 3.5 });
    }, { signal: this.listeners.signal });
    canvas.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === 'Home') { ev.preventDefault(); this.onCamera(null); } }, { signal: this.listeners.signal });

    const handleUiAction = (ev: Event) => {
      const t = (ev.target as HTMLElement).closest(
        '[data-speed],[data-build],[data-action],[data-cat]',
      ) as HTMLElement | null;
      if (!t || (t as HTMLButtonElement).disabled) return;
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
      if (action === 'close-inspector') this.sim.selectEntity(null);
      if (action === 'toggle-dock') {
        const dock = this.root.querySelector('[data-k="management-dock"]') as HTMLElement;
        const collapsed = dock.classList.toggle('collapsed');
        t.setAttribute('aria-expanded', String(!collapsed));
        t.setAttribute('title', collapsed ? 'Expand management panel' : 'Collapse management panel');
        t.textContent = collapsed ? '⌃' : '⌄';
      }
      if (action === 'jump' || action === 'manage-team' || action === 'manage-upgrades') {
        const id = (action === 'manage-team' ? 'people' : action === 'manage-upgrades' ? 'caps' : t.getAttribute('data-id')) as typeof this.managementView | null;
        if (id && ['build','people','caps','finance'].includes(id)) {
          this.managementView = id;
          const dock = this.root.querySelector('[data-k="management-dock"]') as HTMLElement;
          dock.classList.toggle('expanded-workspace', id !== 'build');
          dock.classList.remove('collapsed');
          const toggle = dock.querySelector('[data-action="toggle-dock"]') as HTMLElement;
          toggle.setAttribute('aria-expanded', 'true');
          toggle.setAttribute('title', 'Collapse management panel');
          toggle.textContent = '⌄';
          // A build ghost should not remain armed while managing people or finance.
          if (id !== 'build') this.sim.setBuildMode(null);
          this.root.querySelectorAll('[data-panel]').forEach((panel) => {
            const active = panel.getAttribute('data-panel') === id;
            (panel as HTMLElement).hidden = !active;
            panel.classList.toggle('active', active);
          });
          this.root.querySelectorAll('.dock-nav [data-action="jump"]').forEach((button) => {
            button.classList.toggle('active', button.getAttribute('data-id') === id);
          });
        }
      }
      if (action === 'open-research') this.openResearch();
      if (action === 'close-research') this.closeResearch();
      if (action === 'research') { this.sim.startResearch(t.getAttribute('data-id') as ResearchId); this.render(this.sim.snapshot()); }
      if (action === 'home-camera' || action === 'map-home') this.onCamera(null);
      if (action === 'focus-selected') this.focusEntity(this.sim.selectedId);
      if (action === 'locate') this.focusEntity(t.getAttribute('data-id'));
      if (action === 'cancel-build') this.sim.setBuildMode(null);
      if (action === 'save') {
        this.sim.message = saveGame(this.sim.serialize()) ? 'Game saved.' : 'Could not save. Use Export save to keep your progress.';
      }
      if (action === 'load') {
        const data = loadGame();
        if (data) {
          this.sim.load(data);
          this.sim.speed = 0;
          this.sim.speedBeforeEvent = 0;
          this.lastEventId = null;
          const win = this.root.querySelector('[data-k="win"]') as HTMLElement;
          win.hidden = true;
          delete win.dataset.shown;
          this.sim.message = 'Game loaded. Press Play when ready.';
          this.render(this.sim.snapshot());
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
      if (action === 'dismiss-staff') this.sim.dismissStaff(t.getAttribute('data-id') ?? '');
      if (action === 'cheat-cash') this.sim.grantPlaytestCash(Number(t.getAttribute('data-amount') ?? 25000));
      if (action === 'cheat-event') this.sim.triggerPlaytestGrant();
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
            this.sim.load(parsed.state);
            this.sim.speed = 0;
            this.sim.speedBeforeEvent = 0;
            this.lastEventId = null;
            const win = this.root.querySelector('[data-k="win"]') as HTMLElement;
            win.hidden = true;
            delete win.dataset.shown;
            this.sim.message = 'Save imported. Press Play when ready.';
            this.render(this.sim.snapshot());
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
        if (id) { this.sim.resolveEventChoice(id); this.render(this.sim.snapshot()); }
      }
      if (action === 'dismiss-win') {
        this.sim.completionAcknowledged = true;
        const win = this.root.querySelector('[data-k="win"]') as HTMLElement;
        win.hidden = true;
      }
    };
    this.root.addEventListener('click', handleUiAction, { signal: this.listeners.signal });

    window.addEventListener('keydown', (ev) => {
      const researchModal = this.root.querySelector('[data-k="research-modal"]') as HTMLElement;
      if (!researchModal.hidden && ev.key === 'Tab') {
        const controls = [...researchModal.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
        const first = controls[0], last = controls[controls.length - 1];
        if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last?.focus(); }
        else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first?.focus(); }
        return;
      }
      if (ev.key === 'Escape' && !researchModal.hidden) { this.closeResearch(); return; }
      if (ev.repeat || (ev.target as HTMLElement)?.closest('input,textarea,select,[contenteditable="true"]')) return;
      if (!ev.ctrlKey && !ev.metaKey && !ev.altKey && !this.sim.activeEvent && researchModal.hidden) {
        if (ev.key.toLowerCase() === 'u') { this.openResearch(); return; }
        if (ev.key.toLowerCase() === 'h') { this.onCamera(null); return; }
        if (ev.key.toLowerCase() === 'f') { this.focusEntity(this.sim.selectedId); return; }
      }
      if (!researchModal.hidden) return;
      if (ev.ctrlKey && ev.shiftKey && ev.key.toLowerCase() === 'm') {
        ev.preventDefault();
        this.sim.grantPlaytestCash(25_000);
        return;
      }
      if (ev.ctrlKey && ev.shiftKey && ev.key.toLowerCase() === 'g') {
        ev.preventDefault();
        this.sim.triggerPlaytestGrant();
        return;
      }
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

  private openResearch(): void {
    if (this.sim.activeEvent) return;
    this.sim.setBuildMode(null);
    this.researchReturnFocus = document.activeElement as HTMLElement | null;
    (this.root.querySelector('[data-k="research-modal"]') as HTMLElement).hidden = false;
    this.render(this.sim.snapshot());
    (this.root.querySelector('[data-action="close-research"]') as HTMLButtonElement).focus();
  }

  private closeResearch(): void {
    (this.root.querySelector('[data-k="research-modal"]') as HTMLElement).hidden = true;
    this.researchReturnFocus?.focus();
  }

  private focusEntity(id: string | null): void {
    const entity = this.sim.equipment.find(e => e.id === id) ?? this.sim.staff.find(s => s.id === id);
    if (!entity) { this.sim.message = 'Select equipment or a person to find them.'; return; }
    this.sim.selectEntity(entity.id);
    this.onCamera(entity.tile);
  }

  private renderResearch(snapshot: GameSnapshot): void {
    const project = snapshot.activeResearch;
    const summary = project ? `${RESEARCH[project.id].name} · ${Math.floor(project.progress * 100)}%` : `${snapshot.researched.length}/9 upgrades researched · Choose your next project`;
    (this.root.querySelector('[data-k="research-summary"]') as HTMLElement).textContent = summary;
    if ((this.root.querySelector('[data-k="research-modal"]') as HTMLElement).hidden) return;
    if (snapshot.activeEvent) { this.closeResearch(); return; }
    (this.root.querySelector('[data-k="research-cash"]') as HTMLElement).textContent = money(snapshot.cash);
    (this.root.querySelector('[data-k="research-office"]') as HTMLElement).textContent = project ? `In progress: ${summary}` : 'Office ready · Research is optional; choose the branch that suits your park.';
    const html = RESEARCH_BRANCHES.map(branch => `<section class="research-branch ${branch.id}"><h3><span>${branch.icon}</span>${branch.name}</h3><p>${branch.subtitle}</p>` + Object.entries(RESEARCH).filter(([,def]) => def.branch === branch.id).map(([key,def]) => {
      const id = key as ResearchId;
      const completed = snapshot.researched.includes(id), active = project?.id === id;
      const reason = this.sim.researchBlockedReason(id);
      return `<article class="research-node ${completed ? 'completed' : active ? 'researching' : reason ? 'locked' : 'available'}" data-research-node="${id}"><div class="research-status">${completed ? '✓ COMPLETE' : active ? 'IN PROGRESS' : reason ? 'LOCKED' : 'AVAILABLE'}</div><h4>${def.name}</h4><p>${def.description}</p><strong>${def.effect}</strong><small>${money(def.cost)} · ${def.hours} park hours${def.prerequisite ? `<br>Requires ${RESEARCH[def.prerequisite].name}` : ''}</small><progress data-research-progress="${id}" value="0" max="1" ${active ? '' : 'hidden'}></progress><button type="button" data-action="research" data-id="${id}" ${reason ? 'disabled' : ''}>${completed ? 'Applied to your park' : active ? 'Researching…' : reason ?? 'Start research'}</button></article>`;
    }).join('<div class="research-link" aria-hidden="true">↓</div>') + '</section>').join('');
    if (html !== this.lastResearchHtml) { this.lastResearchHtml = html; (this.root.querySelector('[data-k="research-tree"]') as HTMLElement).innerHTML = html; }
    if (project) {
      const progress = this.root.querySelector(`[data-research-progress="${project.id}"]`) as HTMLProgressElement;
      progress.value = project.progress;
      progress.setAttribute('aria-label', `${RESEARCH[project.id].name}: ${Math.floor(project.progress * 100)}% complete`);
    }
  }

  private renderAlerts(snapshot: GameSnapshot): void {
    const faults = snapshot.equipment.filter(e => e.faulted);
    const dirty = snapshot.equipment.filter(e => e.kind.includes('pv') && !e.faulted && e.soiling > .35).sort((a,b) => b.soiling - a.soiling);
    const html = (faults.length ? `<button type="button" class="fault" data-action="locate" data-id="${faults[0].id}"><b>! ${faults.length} equipment fault${faults.length === 1 ? '' : 's'}</b><span>Find the first fault →</span></button>` : '')
      + (dirty.length ? `<button type="button" data-action="locate" data-id="${dirty[0].id}"><b>${dirty.length} dusty array${dirty.length === 1 ? '' : 's'}</b><span>Find the dirtiest →</span></button>` : '')
      + (snapshot.clippedKw > .5 ? `<button type="button" data-action="locate" data-id="${snapshot.equipment.find(e => e.kind === 'substation')?.id}"><b>Grid limit: ${Math.round(snapshot.clippedKw)} kW lost</b><span>Add an inverter or research capacity →</span></button>` : '');
    if (html !== this.lastAlertHtml) { this.lastAlertHtml = html; (this.root.querySelector('[data-k="park-alerts"]') as HTMLElement).innerHTML = html; }
  }

  private drawMinimap(snapshot: GameSnapshot): void {
    const ctx = this.minimapCtx;
    if (!ctx) return;
    const w = 220;
    const h = 120;
    const sx = (tx: number) => 8 + tx * 4.8;
    const sy = (ty: number) => 6 + ty * 3.5;
    ctx.setTransform(3,0,0,3,0,0);
    ctx.clearRect(0, 0, w, h);

    const ground = ctx.createLinearGradient(0,0,w,h);ground.addColorStop(0,'#b6d78a');ground.addColorStop(1,'#7faa64');
    ctx.fillStyle=ground;ctx.fillRect(0,0,w,h);
    ctx.beginPath();
    for(let y=0;y<=30;y+=.5){const x=sx(riverCenterX(y));if(y===0)ctx.moveTo(x,sy(y));else ctx.lineTo(x,sy(y));}
    ctx.strokeStyle='#e0d6a8';ctx.lineWidth=14;ctx.stroke();
    ctx.strokeStyle='#61b4d0';ctx.lineWidth=10;ctx.stroke();
    ctx.strokeStyle='#8ed5df';ctx.lineWidth=3;ctx.stroke();
    ctx.fillStyle='#e6d9b1';
    for(const tile of ROAD_TILES)ctx.fillRect(sx(tile.x)-2.8,sy(tile.y)-2.1,5.6,4.2);
    ctx.fillStyle='#8c9d91';
    for(const tile of ROAD_TILES)ctx.fillRect(sx(tile.x)-1.7,sy(tile.y)-1.1,3.4,2.2);
    for(const prop of SCENERY){
      if(prop.kind!=='tree')continue;
      const x=sx(prop.x),y=sy(prop.y),size=3*prop.scale;
      ctx.fillStyle='#426a4333';ctx.beginPath();ctx.ellipse(x+1,y+1,3,1.5,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#426949';ctx.beginPath();ctx.moveTo(x,y-size*1.8);ctx.lineTo(x+size,y);ctx.lineTo(x-size,y);ctx.closePath();ctx.fill();
      ctx.fillStyle='#689149';ctx.beginPath();ctx.moveTo(x,y-size*1.8);ctx.lineTo(x,y);ctx.lineTo(x-size,y);ctx.closePath();ctx.fill();
    }

    // Plots
    for (const plot of snapshot.plots) {
      const px = sx(plot.origin.x);
      const py = sy(plot.origin.y);
      const pw = plot.size.x * 4.8;
      const ph = plot.size.y * 3.5;
      ctx.fillStyle = plot.unlocked ? 'rgba(222,235,146,0.3)' : 'rgba(36,67,47,0.2)';
      ctx.fillRect(px, py, pw, ph);
      ctx.strokeStyle = plot.unlocked ? '#e1e4ba' : '#94ae73';
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
        ctx.fillStyle = '#f8f2d8';ctx.fillRect(px - 1, py - 1, 8, 6);
        ctx.fillStyle = '#397daf';ctx.fillRect(px - 1, py - 2, 8, 3);
      } else if (eq.kind === 'substation') {
        ctx.fillStyle = '#9aa3b0';
        ctx.fillRect(px - 1, py - 1, 5, 5);
      } else if (eq.kind.includes('pv')) {
        ctx.fillStyle = eq.faulted ? '#ff5961' : '#306cb4';ctx.fillRect(px,py,8,6);
        ctx.strokeStyle='#bbd7ed';ctx.lineWidth=.45;ctx.strokeRect(px,py,8,6);
        for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(px+i*2,py);ctx.lineTo(px+i*2,py+6);ctx.stroke();}
        ctx.beginPath();ctx.moveTo(px,py+3);ctx.lineTo(px+8,py+3);ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.fillStyle = '#f5c542';
        ctx.arc(px + 2, py + 2, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      if(eq.id===snapshot.selectedId){ctx.strokeStyle='#fff08a';ctx.lineWidth=1.3;ctx.strokeRect(px-2,py-3,12,11);}
    }
  }

  render(snapshot: GameSnapshot): void {
    this.renderResearch(snapshot);
    this.renderAlerts(snapshot);
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
          .slice(0, 3)
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

    const buildKey = `${snapshot.buildMode ?? ''}|${this.buildCategory}|${snapshot.capabilities.includes('radio_dispatch')}|${BUILD_MENU_ORDER.map(id => snapshot.cash >= EQUIPMENT[id].cost ? 1 : 0).join('')}`;
    if (buildKey !== this.lastBuildKey) {
      this.lastBuildKey = buildKey;
      const build = this.root.querySelector('[data-k="build"]') as HTMLElement;
      const items = BUILD_MENU_ORDER.filter((id) => {
        const def = EQUIPMENT[id];
        if (this.buildCategory === 'all') return true;
        if (this.buildCategory === 'generation') return def.category === 'generation';
        if (this.buildCategory === 'grid') return def.category === 'electrical';
        if (this.buildCategory === 'support') return id === 'workshop';
        if (this.buildCategory === 'decor') return def.category === 'building' && id !== 'workshop';
        return true;
      });
      build.innerHTML = items
        .map((id) => {
          const def = EQUIPMENT[id];
          const active = snapshot.buildMode === id ? 'active' : '';
          const locked=id==='workshop'&&!snapshot.capabilities.includes('radio_dispatch');
          const unaffordable = snapshot.cash < def.cost;
          const tip = locked?'Unlock with your first repair':`${def.name} — ${def.description}${unaffordable ? ' · Not enough cash' : ''}`;
          return `<button type="button" class="build-card ${active} ${locked ? 'locked' : ''}" ${locked || unaffordable ? "disabled" : ""} data-build="${id}" title="${escapeHtml(tip)}" aria-pressed="${snapshot.buildMode === id}">
            <span class="build-icon">${BUILD_ICONS[id] ?? '■'}</span>
            <strong>${BUILD_LABEL[id] ?? def.name}</strong>
            <span class="price">${money(def.cost)}</span><small>${locked ? 'First repair to unlock' : unaffordable ? 'More cash needed' : def.nameplateKw ? def.nameplateKw + " kW · " + Math.round(def.reliability * 100) + "% reliability" : id === 'workshop' ? 'Faster repairs' : 'Landscape & layout'}</small>
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
    }).join('');
    if (this.lastCapabilityHtml !== capHtml) { this.lastCapabilityHtml = capHtml; capActions.innerHTML = capHtml; }
    const roster = this.root.querySelector('[data-k="roster"]') as HTMLElement;
    const rosterHtml = snapshot.staff.map(s => `<div class="staff-card"><div class="staff-art">${staffPortrait(s.role)}</div><div class="staff-details"><strong>${escapeHtml(s.name)}</strong><span class="role-label">${ROLE_LABEL[s.role]} · Skill ${(s.skill ?? 1).toFixed(1)}</span><div class="skill-track"><i style="width:${(s.skill ?? 1) / 5 * 100}%"></i></div><small>${escapeHtml(s.trait ?? 'Panel Whisperer')} · ${s.task.type === 'idle' ? 'Ready for a job' : s.task.type === 'travel' ? 'On the way' : s.task.type === 'repair' ? 'Repairing equipment' : 'Cleaning panels'}</small><div class="staff-actions"><button type="button" data-action="train" data-id="${s.id}" ${(s.skill ?? 1) >= 5 || snapshot.cash < 800 ? 'disabled' : ''}>Train · $800</button><button type="button" class="ghost" data-action="dismiss-staff" data-id="${s.id}" ${snapshot.staff.length <= 1 ? 'disabled title="Keep at least one staff member"' : ''}>Dismiss</button></div></div></div>`).join('');
    if (this.lastRosterHtml !== rosterHtml) { this.lastRosterHtml = rosterHtml; roster.innerHTML = rosterHtml; }
    const overviewKey = snapshot.selectedId + '|' + snapshot.staff.map(s => `${s.id}:${s.name}:${s.role}:${s.skill}:${s.task.type}`).join('|');
    if (overviewKey !== this.lastOverviewHtml) {
      this.lastOverviewHtml = overviewKey;
      for (const role of Object.keys(ROLE_LABEL) as StaffMember['role'][]) {
        const count = snapshot.staff.filter(s => s.role === role).length;
        const label = this.root.querySelector(`[data-role-count="${role}"]`)!;
        label.textContent = `${count} hired`;
        label.parentElement!.classList.toggle('role-hired', count > 0);
      }
      const lead = snapshot.staff.find(s => s.id === snapshot.selectedId) ?? snapshot.staff[0];
      (this.root.querySelector('[data-k="crew-summary"]') as HTMLElement).innerHTML = lead
        ? `<button type="button" class="lead-portrait" data-action="locate" data-id="${lead.id}" title="Find ${escapeHtml(lead.name)}">${staffPortrait(lead.role)}</button><div><strong>${escapeHtml(lead.name)}</strong><small>${ROLE_LABEL[lead.role]} · Skill ${(lead.skill ?? 1).toFixed(1)}</small><div class="skill-track"><i style="width:${(lead.skill ?? 1) / 5 * 100}%"></i></div><span>${lead.task.type === 'idle' ? 'Ready for the next job' : lead.task.type === 'travel' ? 'Heading to a job' : lead.task.type === 'repair' ? 'Repairing equipment' : 'Cleaning solar panels'}</span></div>`
        : '<div><strong>Your crew starts here</strong><small>Hire a specialist to help your park grow.</small></div>';
    }
    const night = snapshot.irradiance < 0.05;
    const sceneKey = `${snapshot.weather}|${night}`;
    if (sceneKey !== this.lastWeatherScene) {
      this.lastWeatherScene = sceneKey;
      this.root.querySelector('[data-k="weather-scene"]')!.innerHTML = weatherLandscape(snapshot.weather, night);
    }
    const stormWatch = this.sim.triggeredEvents.includes('hail_warning') && !this.sim.hailSurvived;
    setText('weather-report-title', stormWatch ? 'Storm watch' : night ? 'A quiet valley night' : snapshot.weather === 'clear' ? 'Sunny skies' : weatherLabel(snapshot.weather));
    setText('weather-report-body', stormWatch ? snapshot.hailPrepared ? 'Your team is prepared for the approaching hail.' : 'Hail is on the way. Check your equipment and repairs.' : night ? 'Solar production rests until sunrise. Your team keeps working.' : `${snapshot.exportedKw.toFixed(1)} kW flowing to the valley grid · ${Math.round(snapshot.irradiance * 100)}% sunlight.`);
    setText('park-update', snapshot.message ?? 'All quiet. Keep building your brighter valley.');
    setText('development-status', snapshot.activeResearch ? `Researching ${RESEARCH[snapshot.activeResearch.id].name}` : `${snapshot.researched.length} / 9 technologies researched`);
    const finance = this.root.querySelector('[data-k="finance"]') as HTMLElement;
    const panels = snapshot.equipment.filter(e => e.kind.includes('pv') && e.commissioned);
    const availability = panels.length ? Math.round(panels.filter(e => !e.faulted).length / panels.length * 100) : 100;
    const cleanliness = panels.length ? Math.round(panels.reduce((sum,e) => sum + 1 - e.soiling,0) / panels.length * 100) : 100;
    const cards = [
      ['Lifetime sales',money(this.sim.lifetimeRevenue)], ['Operating expenses',money(this.sim.totalExpenses)],
      ['Energy exported',`${Math.round(snapshot.totalEnergyKwh).toLocaleString()} kWh`], ['Peak export',`${Math.round(this.sim.peakExportKw)} kW`],
      ['Inverter capacity',`${Math.round(snapshot.inverterCapacityKw)} kW`], ['Clipping now',`${snapshot.clippedKw.toFixed(1)} kW`],
      ['Array availability',`${availability}%`], ['Cleanliness',`${cleanliness}%`],
    ];
    const criteria = snapshot.stars < 1 ? [
      [this.sim.peakExportKw >= STAR_THRESHOLDS.star1PeakKw,`Peak export: ${Math.round(this.sim.peakExportKw)} / ${STAR_THRESHOLDS.star1PeakKw} kW`],
      [this.sim.lifetimeRevenue >= STAR_THRESHOLDS.star1Revenue,`Sales: ${money(this.sim.lifetimeRevenue)} / ${money(STAR_THRESHOLDS.star1Revenue)}`],
      [this.sim.manualRepairs > 0 && this.sim.manualCleans > 0,'Complete a manual repair and clean'],
      [this.sim.hailSurvived,'Resolve the hailstorm'],
      [panels.some(e => e.plotId === 'site_b'),'Commission a solar array on Site B'],
    ] : snapshot.stars < 2 ? [
      [this.sim.peakExportKw >= STAR_THRESHOLDS.star2PeakKw,`Peak export: ${Math.round(this.sim.peakExportKw)} / ${STAR_THRESHOLDS.star2PeakKw} kW`],
      [panels.some(e => e.plotId === 'site_b'),'Commission a solar array on Site B'],
      [snapshot.capabilities.includes('radio_dispatch'),'Unlock Radio Dispatch'],
    ] : [
      [this.sim.peakExportKw >= STAR_THRESHOLDS.star3PeakKw,`Peak export: ${Math.round(this.sim.peakExportKw)} / ${STAR_THRESHOLDS.star3PeakKw} kW`],
      [snapshot.hailPrepared && this.sim.hailSurvived,'Prepare for hail and survive it'],
      [snapshot.capabilities.includes('cleaning_kit'),'Earn the Cleaning Kit'],
    ];
    const financeHtml = '<div class="finance-cards">' + cards.map(([label,value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join('') + '</div>'
      + `<div class="star-checklist"><b>${snapshot.stars === 3 ? '3★ mastery achieved' : `Next award: ${snapshot.stars+1}★`}</b>` + criteria.map(([done,label]) => `<span class="${done ? 'done' : ''}">${done ? '✓' : '○'} ${label}</span>`).join('') + '</div>';
    if (financeHtml !== this.lastFinanceHtml) { this.lastFinanceHtml = financeHtml; finance.innerHTML = financeHtml; }
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
    const selectionPanel = this.root.querySelector('[data-k="selection"]') as HTMLElement;
    selectionPanel.hidden = !selected && !staff;
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
        selBody.innerHTML = `<strong>${staff.name}</strong><div class="sel-grid"><span>Role</span><b>${staff.role}</b><span>Skill</span><b>${(staff.skill ?? 1).toFixed(1)}</b><span>Task</span><b>${staff.task.type}</b><span>Trait</span><b>${staff.trait ?? '—'}</b></div>`;
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
      } else if (staff) {
        selActions.innerHTML =
          '<button type="button" data-action="train" data-id="' + staff.id + '">Train · $800</button>' +
          '<button type="button" class="ghost" data-action="dismiss-staff" data-id="' + staff.id + '">Dismiss</button>';
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
    if (snapshot.scenarioComplete && !snapshot.completionAcknowledged && snapshot.stars >= 1 && !win.dataset.shown) {
      win.hidden = false;
      win.dataset.shown = '1';
    }

    // Alerts and inspection live opposite the objective/map sidebar.
    const dock = this.root.querySelector('[data-k="management-dock"]') as HTMLElement;
    const alertLayoutKey = `${window.innerWidth},${window.innerHeight}|${this.lastSelectionKey}|${this.lastSelectionActionsKey}|${dock.classList.contains('collapsed')}`;
    if (alertLayoutKey !== this.alertLayoutKey) {
      this.alertLayoutKey = alertLayoutKey;
      const alerts = this.root.querySelector('[data-k="park-alerts"]') as HTMLElement;
      const inspector = this.root.querySelector('[data-k="selection"]') as HTMLElement;
      const dockTop = dock.getBoundingClientRect().top;
      const top = inspector.hidden ? 76 : Math.min(inspector.getBoundingClientRect().bottom + 8, dockTop - 60);
      alerts.style.top = `${top}px`;
      alerts.style.bottom = 'auto';
      alerts.style.maxHeight = `${Math.max(48,dockTop - top - 8)}px`;
    }
    this.drawMinimap(snapshot);
  }
}
