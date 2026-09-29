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
      return 'Clear';
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

function clock(hour: number): string {
  const h = Math.floor(hour) % 24;
  const m = Math.floor((hour % 1) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export class DomHud {
  private root: HTMLElement;
  private lastEventId: string | null = null;
  private lastObjectivesKey = '__uninit__';
  private lastBuildKey = '__uninit__';
  private lastCapsKey = '__uninit__';
  private lastSelectionKey = '__uninit__';
  private lastSelectionActionsKey = '__uninit__';
  private lastMessage: string | null = '__uninit__';

  constructor(
    private readonly sim: GameSimulation,
    private readonly onNewGame: () => void,
  ) {
    const el = document.getElementById('ui-root');
    if (!el) throw new Error('#ui-root missing');
    this.root = el;
    this.root.innerHTML = `
      <header class="hud-top">
        <div class="brand">Megawatt Valley</div>
        <div class="stat" data-k="cash"><span class="label">Cash</span><strong>—</strong></div>
        <div class="stat" data-k="power"><span class="label">Power</span><strong>—</strong></div>
        <div class="stat" data-k="export"><span class="label">Export</span><strong>—</strong></div>
        <div class="stat" data-k="weather"><span class="label">Weather</span><strong>—</strong></div>
        <div class="stat" data-k="time"><span class="label">Day</span><strong>—</strong></div>
        <div class="speed-group">
          <button data-speed="0" type="button">❚❚</button>
          <button data-speed="1" type="button">▶</button>
          <button data-speed="2" type="button">▶▶</button>
          <button data-speed="4" type="button">▶▶▶</button>
        </div>
        <div class="stars" data-k="stars">☆☆☆</div>
      </header>

      <aside class="panel objectives">
        <h2>Objectives</h2>
        <ul data-k="objectives"></ul>
      </aside>

      <aside class="panel build">
        <h2>Build</h2>
        <div class="build-list" data-k="build"></div>
        <button type="button" class="ghost" data-action="cancel-build">Cancel placement</button>
      </aside>

      <aside class="panel selection" data-k="selection">
        <h2>Selection</h2>
        <div data-k="selection-body">Click equipment or staff.</div>
        <div class="row" data-k="selection-actions"></div>
      </aside>

      <aside class="panel caps">
        <h2>Capabilities</h2>
        <ul data-k="caps"><li class="muted">None yet — earn them.</li></ul>
      </aside>

      <div class="toast" data-k="toast" hidden></div>

      <footer class="hud-bottom">
        <button type="button" data-action="save">Save</button>
        <button type="button" data-action="load">Load</button>
        <button type="button" data-action="new">New Game</button>
        <span class="hint">Drag to pan · Wheel zoom · Click to select/place</span>
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

    const handleUiAction = (ev: Event) => {
      const t = (ev.target as HTMLElement).closest('[data-speed],[data-build],[data-action]') as HTMLElement | null;
      if (!t) return;
      ev.preventDefault();
      ev.stopPropagation();
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

  render(snapshot: GameSnapshot): void {
    const set = (k: string, text: string) => {
      const el = this.root.querySelector(`[data-k="${k}"] strong`) as HTMLElement | null;
      if (el && el.textContent !== text) el.textContent = text;
    };
    set('cash', `${money(snapshot.cash)} (${money(snapshot.revenuePerHour || 0)}/h)`);
    set('power', `${snapshot.powerKw.toFixed(0)} kW`);
    set('export', `${snapshot.exportedKw.toFixed(0)} kW`);
    set('weather', `${weatherLabel(snapshot.weather)} · ${Math.round(snapshot.irradiance * 100)}% sun`);
    set('time', `${snapshot.day} · ${clock(snapshot.hour)}`);

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
        .slice(0, 8)
        .map(
          (o) =>
            `<li class="${o.complete ? 'done' : 'active'}"><strong>${o.title}</strong><span>${o.description}</span></li>`,
        )
        .join('');
    }

    const buildKey = `${snapshot.buildMode ?? ''}`;
    if (buildKey !== this.lastBuildKey) {
      this.lastBuildKey = buildKey;
      const build = this.root.querySelector('[data-k="build"]') as HTMLElement;
      build.innerHTML = BUILD_MENU_ORDER.map((id) => {
        const def = EQUIPMENT[id];
        const active = snapshot.buildMode === id ? 'active' : '';
        return `<button type="button" class="build-item ${active}" data-build="${id}">
        <strong>${def.name}</strong>
        <span>${money(def.cost)} · ${def.nameplateKw} kW</span>
        <em>${def.description}</em>
      </button>`;
      }).join('');
    }

    const capsKey = snapshot.capabilities.join(',');
    if (capsKey !== this.lastCapsKey) {
      this.lastCapsKey = capsKey;
      const caps = this.root.querySelector('[data-k="caps"]') as HTMLElement;
      if (snapshot.capabilities.length === 0) {
        caps.innerHTML = `<li class="muted">None yet — earn them.</li>`;
      } else {
        caps.innerHTML = snapshot.capabilities
          .map((c) => `<li><strong>${CAPABILITY_INFO[c].name}</strong><span>${CAPABILITY_INFO[c].description}</span></li>`)
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
        <div>Condition ${(selected.condition * 100).toFixed(0)}%</div>
        <div>Soiling ${(selected.soiling * 100).toFixed(0)}%</div>
        <div>${selected.faulted ? '⚠ FAULTED' : selected.commissioned ? 'Online' : 'Under construction'}</div>
        <div>Plot: ${selected.plotId}</div>`;
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
        (this.root.querySelector('[data-k="modal-title"]') as HTMLElement).textContent = snapshot.activeEvent.title;
        (this.root.querySelector('[data-k="modal-body"]') as HTMLElement).textContent = snapshot.activeEvent.body;
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
    if (snapshot.scenarioComplete && snapshot.stars >= 1) {
      if (!win.dataset.shown) {
        win.hidden = false;
        win.dataset.shown = '1';
      }
    }
  }
}
