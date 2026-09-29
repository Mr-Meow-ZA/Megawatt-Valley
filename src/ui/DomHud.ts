import { BUILD_MENU_ORDER, EQUIPMENT } from '../content/equipment';
import { CAPABILITY_INFO } from '../content/scenario';
import type { GameSimulation } from '../simulation/GameSimulation';
import type { EquipmentKind, GameSnapshot } from '../simulation/types';
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

function weatherIconClass(w: GameSnapshot['weather']): string {
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
  bargain_pv: '<img src="/assets/game/pv_group.png" alt="" width="36" height="36"/>',
  premium_pv: '<img src="/assets/game/pv_portrait.png" alt="" width="36" height="36"/>',
  inverter: '🔌',
  office: '<img src="/assets/game/office_mod2.png" alt="" width="36" height="36"/>',
  substation: '<img src="/assets/game/tank.png" alt="" width="36" height="36"/>',
};

export class DomHud {
  private root: HTMLElement;
  private lastEventId: string | null = null;
  private lastObjectivesKey = '__uninit__';
  private lastBuildKey = '__uninit__';
  private lastCapsKey = '__uninit__';
  private lastSelectionKey = '__uninit__';
  private lastSelectionActionsKey = '__uninit__';
  private lastMessage: string | null = '__uninit__';
  private buildCategory: 'all' | 'generation' | 'grid' | 'support' = 'all';
  private minimapCtx: CanvasRenderingContext2D | null = null;

  constructor(
    private readonly sim: GameSimulation,
    private readonly onNewGame: () => void,
  ) {
    const el = document.getElementById('ui-root');
    if (!el) throw new Error('#ui-root missing');
    this.root = el;
    this.root.innerHTML = `
      <header class="hud-top">
        <div class="brand-block">
          <div class="brand">Megawatt Valley</div>
          <div class="brand-sub">Solar · Here Comes the Sun</div>
        </div>

        <div class="chip cash" data-k="cash-chip">
          <span class="chip-icon"><img src="/assets/game/icon_dollar.png" alt="" width="22" height="22"/></span>
          <div>
            <span class="chip-label">Cash</span>
            <strong data-k="cash-val">—</strong>
            <em data-k="cash-rate">—</em>
          </div>
        </div>

        <div class="chip power" data-k="power-chip">
          <span class="chip-icon"><img src="/assets/game/icon_power.png" alt="" width="22" height="22" style="filter:invert(1) sepia(1) saturate(5) hue-rotate(80deg)"/></span>
          <div class="chip-power">
            <span class="chip-label">Power output</span>
            <strong data-k="power-val">—</strong>
            <div class="bar"><i data-k="power-bar"></i></div>
          </div>
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
          <span>Terrain</span><span>Solar</span><span>Grid</span><span>Buildings</span>
        </div>
      </aside>

      <aside class="panel build">
        <h2>Build</h2>
        <div class="build-tabs">
          <button type="button" data-cat="all" class="active">All</button>
          <button type="button" data-cat="generation">Generation</button>
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
      </aside>

      <div class="toast" data-k="toast" hidden></div>

      <footer class="hud-bottom">
        <button type="button" data-action="save">Save</button>
        <button type="button" data-action="load">Load</button>
        <button type="button" data-action="new">New Game</button>
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
        saveGame(this.sim.serialize());
        this.sim.message = 'Game saved.';
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
        clearSave();
        this.onNewGame();
      }
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
    this.root.addEventListener('pointerdown', handleUiAction);
    this.root.addEventListener('click', handleUiAction);

    window.addEventListener('keydown', (ev) => {
      if (!this.sim.activeEvent) return;
      if (ev.key === '1' || ev.key === '2' || ev.key === '3') {
        const idx = Number(ev.key) - 1;
        const choice = this.sim.activeEvent.choices[idx];
        if (choice) this.sim.resolveEventChoice(choice.id);
      }
    });
  }

  private drawMinimap(snapshot: GameSnapshot): void {
    const ctx = this.minimapCtx;
    if (!ctx) return;
    const w = 220;
    const h = 120;
    ctx.clearRect(0, 0, w, h);
    // valley backdrop
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#6db8e8');
    grad.addColorStop(0.35, '#5aae3a');
    grad.addColorStop(1, '#3f8a28');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    // river
    ctx.fillStyle = '#3f9ad4';
    ctx.fillRect(w * 0.48, 0, w * 0.08, h);
    // plots
    for (const plot of snapshot.plots) {
      const px = 10 + plot.origin.x * 4.2;
      const py = 8 + plot.origin.y * 3.2;
      ctx.fillStyle = plot.unlocked ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.28)';
      ctx.fillRect(px, py, plot.size.x * 4.2, plot.size.y * 3.2);
      ctx.strokeStyle = plot.unlocked ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.15)';
      ctx.strokeRect(px, py, plot.size.x * 4.2, plot.size.y * 3.2);
    }
    // equipment dots
    for (const eq of snapshot.equipment) {
      const px = 10 + eq.tile.x * 4.2;
      const py = 8 + eq.tile.y * 3.2;
      if (eq.kind === 'office') ctx.fillStyle = '#f4f7fb';
      else if (eq.kind === 'substation') ctx.fillStyle = '#9aa3b0';
      else if (eq.kind.includes('pv')) ctx.fillStyle = eq.faulted ? '#ff4455' : '#2f6fd4';
      else ctx.fillStyle = '#f5c542';
      ctx.fillRect(px, py, 5, 5);
    }
  }

  render(snapshot: GameSnapshot): void {
    const setText = (k: string, text: string) => {
      const el = this.root.querySelector(`[data-k="${k}"]`) as HTMLElement | null;
      if (el && el.textContent !== text) el.textContent = text;
    };

    setText('cash-val', money(snapshot.cash));
    setText('cash-rate', `+${money(snapshot.revenuePerHour || 0)}/h`);
    setText('power-val', `${snapshot.exportedKw.toFixed(1)} kW export`);
    const capacity = Math.max(100, snapshot.powerKw * 1.15, snapshot.exportedKw);
    const pct = Math.min(100, (snapshot.exportedKw / capacity) * 100);
    const bar = this.root.querySelector('[data-k="power-bar"]') as HTMLElement;
    bar.style.width = `${pct}%`;

    const weatherEl = this.root.querySelector('[data-k="weather-icon"]') as HTMLElement;
    weatherEl.className = `chip-icon ${weatherIconClass(snapshot.weather)}`;
    setText('weather-val', weatherLabel(snapshot.weather));
    const mod = Math.round((snapshot.irradiance - 1) * 100);
    setText(
      'weather-mod',
      snapshot.irradiance >= 0.95
        ? `+${Math.round(snapshot.irradiance * 18)}% output`
        : `${mod >= 0 ? '+' : ''}${mod}% sun`,
    );

    setText('time-val', `Day ${snapshot.day}, ${seasonForDay(snapshot.day)}, Year 1`);
    setText('time-clock', clock(snapshot.hour));

    const stars = this.root.querySelector('[data-k="stars"]') as HTMLElement;
    const starText = `${'★'.repeat(snapshot.stars)}${'☆'.repeat(3 - snapshot.stars)}`;
    if (stars.textContent !== starText) stars.textContent = starText;

    this.root.querySelectorAll('[data-speed]').forEach((btn) => {
      const b = btn as HTMLElement;
      b.classList.toggle('active', Number(b.getAttribute('data-speed')) === snapshot.speed);
    });

    const objectivesKey = snapshot.objectives.map((o) => `${o.id}:${o.complete}:${o.active}`).join('|');
    if (objectivesKey !== this.lastObjectivesKey) {
      this.lastObjectivesKey = objectivesKey;
      const objList = this.root.querySelector('[data-k="objectives"]') as HTMLElement;
      objList.innerHTML = snapshot.objectives
        .filter((o) => o.active || o.complete)
        .slice(0, 6)
        .map((o) => {
          const mark = o.complete ? '✓' : '○';
          return `<li class="${o.complete ? 'done' : 'active'}">
            <span class="check">${mark}</span>
            <div><strong>${o.title}</strong><span>${o.description}</span></div>
          </li>`;
        })
        .join('');
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
          return `<button type="button" class="build-card ${active}" data-build="${id}">
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
