import { validateState } from '../persistence/validate';
import { EQUIPMENT } from '../content/equipment';
import { EVENTS } from '../content/events';
import {
  createInitialObjectives,
  createInitialPlots,
  SIM_MINUTES_PER_REAL_SECOND,
  STAR_THRESHOLDS,
  STARTING_CASH,
  TARIFF_PER_KWH,
} from '../content/scenario';
import type {
  ActiveEvent,
  CapabilityId,
  EquipmentKind,
  EventId,
  GameSnapshot,
  PlacedEquipment,
  PlotId,
  SerializedGameState,
  StaffMember,
  Vec2,
  WeatherKind,
} from './types';

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function isPv(kind: EquipmentKind): boolean {
  return kind === 'bargain_pv' || kind === 'premium_pv';
}

export class GameSimulation {
  cash = STARTING_CASH;
  day = 1;
  hour = 8;
  speed: 0 | 1 | 2 | 4 = 1;
  weather: WeatherKind = 'clear';
  weatherTimer = 0;
  tariffPerKwh = TARIFF_PER_KWH;
  plots = createInitialPlots();
  equipment: PlacedEquipment[] = [];
  staff: StaffMember[] = [];
  capabilities: CapabilityId[] = [];
  objectives = createInitialObjectives();
  stars: 0 | 1 | 2 | 3 = 0;
  nextEntityId = 1;
  triggeredEvents: EventId[] = [];
  pendingEventQueue: EventId[] = [];
  activeEvent: ActiveEvent | null = null;
  selectedId: string | null = null;
  buildMode: EquipmentKind | null = null;
  message: string | null = 'Welcome to Site A. Place solar and connect to the valley grid.';
  hailPrepared = false;
  hailSurvived = false;
  totalEnergyKwh = 0;
  lifetimeRevenue = 0;
  peakExportKw = 0;
  faultsRepaired = 0;
  cleansCompleted = 0;
  scenarioComplete = false;
  tickAccumulator = 0;
  nextFaultCheck = 12;
  nextSoilTick = 6;
  revenuePerHour = 0;
  curtailmentFactor = 1;
  curtailmentTimer = 0;
  eventClock = 0;
  scriptedFirstFault = false;
  rngState = 924817;
  totalExpenses = 0;
  manualRepairs = 0;
  manualCleans = 0;
  speedBeforeEvent: 0 | 1 | 2 | 4 = 1;

  private random(): number {
    this.rngState = (Math.imul(this.rngState, 1664525) + 1013904223) >>> 0;
    return this.rngState / 4294967296;
  }

  constructor() {
    this.seedWorld();
  }

  private uid(prefix: string): string {
    const id = `${prefix}_${this.nextEntityId}`;
    this.nextEntityId += 1;
    return id;
  }

  private seedWorld(): void {
    const siteA = this.plots[0];
    this.equipment.push({
      id: this.uid('eq'),
      kind: 'office',
      plotId: 'site_a',
      tile: { x: siteA.origin.x + 1, y: siteA.origin.y + 1 },
      condition: 1,
      soiling: 0,
      faulted: false,
      commissioned: true,
      constructionProgress: 1,
    });
    this.equipment.push({
      id: this.uid('eq'),
      kind: 'substation',
      plotId: 'site_a',
      tile: { x: siteA.origin.x + 10, y: siteA.origin.y + 1 },
      condition: 1,
      soiling: 0,
      faulted: false,
      commissioned: true,
      constructionProgress: 1,
    });
    // Starter fixed-tilt array so the site reads as a real solar campus from minute one.
    this.equipment.push({
      id: this.uid('eq'),
      kind: 'bargain_pv',
      plotId: 'site_a',
      tile: { x: siteA.origin.x + 8, y: siteA.origin.y + 3 },
      condition: 1,
      soiling: 0.05,
      faulted: false,
      commissioned: true,
      constructionProgress: 1,
    });
    this.staff.push({
      id: this.uid('staff'),
      name: 'Tess Volt',
      role: 'technician', skill: 1, salary: 1, trait: 'Panel Whisperer',
      plotId: 'site_a',
      tile: { x: siteA.origin.x + 2, y: siteA.origin.y + 3 },
      task: { type: 'idle' },
    });
  }

  getIrradiance(): number {
    const hourFactor = this.daylightFactor(this.hour);
    const weatherFactor: Record<WeatherKind, number> = {
      clear: 1,
      partly_cloudy: 0.75,
      overcast: 0.45,
      rain: 0.3,
      hail: 0.15,
    };
    return hourFactor * weatherFactor[this.weather] * this.curtailmentFactor;
  }

  private daylightFactor(hour: number): number {
    if (hour < 6 || hour >= 19) return 0;
    if (hour < 8) return 0.35;
    if (hour < 10) return 0.7;
    if (hour < 15) return 1;
    if (hour < 17) return 0.7;
    return 0.35;
  }

  private inverterCapacity(): number {
    const starter = 100;
    const extra = this.equipment
      .filter((e) => e.kind === 'inverter' && e.commissioned && !e.faulted)
      .reduce((sum, e) => sum + EQUIPMENT.inverter.nameplateKw * e.condition, 0);
    return starter + extra;
  }

  computePower(): { generationKw: number; exportedKw: number } {
    let generationKw = 0;
    const irradiance = this.getIrradiance();
    for (const eq of this.equipment) {
      if (!isPv(eq.kind) || !eq.commissioned || eq.faulted) continue;
      const def = EQUIPMENT[eq.kind];
      const plot = this.plots.find((p) => p.id === eq.plotId);
      if (!plot?.unlocked || !plot.gridConnected) continue;
      const soilPenalty = 1 - eq.soiling * 0.45;
      generationKw +=
        def.nameplateKw * def.efficiency * eq.condition * soilPenalty * irradiance * plot.solarResource;
    }
    const exportedKw = Math.min(generationKw, this.inverterCapacity());
    return { generationKw, exportedKw };
  }

  setSpeed(speed: 0 | 1 | 2 | 4): void {
    this.speed = speed;
  }

  setBuildMode(kind: EquipmentKind | null): void {
    this.buildMode = kind;
    if (kind) this.selectedId = null;
  }

  selectEntity(id: string | null): void {
    this.selectedId = id;
    if (id) this.buildMode = null;
  }

  canPlace(kind: EquipmentKind, plotId: PlotId, tile: Vec2): string | null {
    const def = EQUIPMENT[kind];
    if (!def?.buildable) return 'Not buildable';
    if (!Number.isInteger(tile.x) || !Number.isInteger(tile.y)) return 'Choose a whole tile';
    const plot = this.plots.find((p) => p.id === plotId);
    if (!plot?.unlocked) return 'Plot locked';
    if (this.cash < def.cost) return 'Not enough cash';
    if (
      tile.x < plot.origin.x ||
      tile.y < plot.origin.y ||
      tile.x + def.footprint.x > plot.origin.x + plot.size.x ||
      tile.y + def.footprint.y > plot.origin.y + plot.size.y
    ) {
      return 'Outside buildable area';
    }
    for (const other of this.equipment) {
      const odef = EQUIPMENT[other.kind];
      const overlap =
        tile.x < other.tile.x + odef.footprint.x &&
        tile.x + def.footprint.x > other.tile.x &&
        tile.y < other.tile.y + odef.footprint.y &&
        tile.y + def.footprint.y > other.tile.y;
      if (overlap) return 'Blocked';
    }
    return null;
  }

  placeEquipment(kind: EquipmentKind, plotId: PlotId, tile: Vec2): boolean {
    const err = this.canPlace(kind, plotId, tile);
    if (err) {
      this.message = err;
      return false;
    }
    const def = EQUIPMENT[kind];
    this.cash -= def.cost;
    this.equipment.push({
      id: this.uid('eq'),
      kind,
      plotId,
      tile: { ...tile },
      condition: 1,
      soiling: 0,
      faulted: false,
      commissioned: false,
      constructionProgress: 0,
    });
    this.message = `Building ${def.name}…`;
    this.buildMode = null;
    this.activateObjective('choose_equipment');
    return true;
  }

  dispatchRepair(equipmentId: string): boolean {
    if (this.capabilities.includes('radio_dispatch')) {
      this.message = 'Radio Dispatch handles routine faults automatically.';
      return false;
    }
    const eq = this.equipment.find((e) => e.id === equipmentId);
    if (!eq?.faulted) {
      this.message = 'Nothing to repair there.';
      return false;
    }
    const tech = this.staff.find((s) => s.task.type === 'idle' && (s.role === 'technician' || s.role === 'engineer'));
    if (!tech) {
      this.message = 'Technician is busy.';
      return false;
    }
    tech.task = { type: 'travel', targetId: eq.id, progress: 0, from: { ...tech.tile } };
    this.message = `${tech.name} is on the way.`;
    return true;
  }

  dispatchClean(equipmentId: string): boolean {
    const eq = this.equipment.find((e) => e.id === equipmentId);
    if (!eq || !isPv(eq.kind) || eq.soiling < 0.15) {
      this.message = 'That array is clean enough.';
      return false;
    }
    const tech = this.staff.find((s) => s.task.type === 'idle' && s.role !== 'manager');
    if (!tech) {
      this.message = 'Technician is busy.';
      return false;
    }
    tech.task = { type: 'travel', targetId: eq.id, progress: 0, from: { ...tech.tile } };
    // Mark clean intent via soiling threshold; travel then clean.
    (tech as StaffMember & { _intent?: 'clean' | 'repair' })._intent = 'clean';
    this.message = `${tech.name} heading out with a mop.`;
    this.activateObjective('first_clean');
    return true;
  }

  private staffIntent(staff: StaffMember): 'clean' | 'repair' {
    const tagged = staff as StaffMember & { _intent?: 'clean' | 'repair' };
    if (tagged._intent) return tagged._intent;
    const target = this.equipment.find((e) => e.id === (staff.task.type === 'travel' || staff.task.type === 'repair' || staff.task.type === 'clean' ? staff.task.targetId : ''));
    if (target?.faulted) return 'repair';
    return 'clean';
  }

  resolveEventChoice(choiceId: string): void {
    if (!this.activeEvent) return;
    const eventId = this.activeEvent.id;
    if (!this.activeEvent.choices.some((choice) => choice.id === choiceId)) return;
    const costs: Record<string, number> = { community_meeting_sponsor: 2000, bargain_batch_buy: 5000, grid_curtailment_upgrade_talk: 3000, temp_worker_hire: 4000, insurance_upsell_buy: 6000, influencer_visit_host: 1500, hail_warning_prepare: 2500 };
    if (this.cash < (costs[eventId + '_' + choiceId] ?? 0)) {
      this.message = 'Not enough cash for this choice. Choose the free option.';
      return;
    }
    this.activeEvent = null;
    this.speed = this.speedBeforeEvent;

    switch (eventId) {
      case 'community_meeting':
        if (choiceId === 'sponsor') {
          this.cash -= 2000;
          this.message = 'Tea secured. Goats remain unimpressed but peaceful.';
        } else {
          this.message = 'Tour promised. Tess will look photogenic later.';
        }
        break;
      case 'bargain_batch':
        if (choiceId === 'buy') {
          this.cash -= 5000;
          this.cash += 7500;
          this.message = 'Batch bought and flipped to a neighbour. Net +$2,500.';
        } else {
          this.message = 'You kept your standards. And your cash.';
        }
        break;
      case 'grid_curtailment':
        if (choiceId === 'accept') {
          this.curtailmentFactor = 0.85;
          this.curtailmentTimer = 36;
          this.message = 'Afternoon export trimmed for a while.';
        } else {
          this.cash -= 3000;
          this.message = 'A friendly DNO chat keeps the wires open.';
        }
        break;
      case 'temp_worker':
        if (choiceId === 'hire') {
          this.cash -= 4000;
          for (const eq of this.equipment) {
            if (eq.faulted) {
              eq.faulted = false;
              eq.condition = Math.min(1, eq.condition + 0.2);
              this.faultsRepaired += 1;
            }
          }
          const dirty = this.equipment.find((e) => isPv(e.kind) && e.soiling > 0.1);
          if (dirty) dirty.soiling = 0;
          this.message = 'Temp tech blitzed the backlog.';
        } else {
          this.message = 'Tess cracks her knuckles. Solo it is.';
        }
        break;
      case 'insurance_upsell':
        if (choiceId === 'buy') {
          this.cash -= 6000;
          this.hailPrepared = true;
          this.message = 'Hail cover purchased. Spreadsheets rejoice.';
        } else {
          this.message = 'Self-insured. Bold. Possibly foolish.';
        }
        break;
      case 'influencer_visit':
        if (choiceId === 'host') {
          this.cash -= 1500;
          this.cash += 4000;
          this.message = 'Sponsorship lands. The valley goes mildly viral.';
        } else {
          this.message = 'You stayed focused on electrons.';
        }
        break;
      case 'hail_warning':
        if (choiceId === 'prepare') {
          this.cash -= 2500;
          this.hailPrepared = true;
          this.message = 'Arrays secured. Fingers crossed.';
        } else {
          this.message = 'You watch the radar and hope.';
        }
        this.enqueueEvent('hail_climax', 8);
        break;
      case 'hail_climax':
        this.applyHailDamage();
        this.hailSurvived = true;
        this.completeObjective('survive_hail');
        this.weather = 'partly_cloudy';
        this.message = this.hailPrepared
          ? 'Hail passes. Prep paid off — damage is limited.'
          : 'Hail smacks the arrays. Repairs ahead.';
        break;
      default:
        break;
    }
  }

  private applyHailDamage(): void {
    for (const eq of this.equipment) {
      if (!isPv(eq.kind) || !eq.commissioned) continue;
      const base = this.hailPrepared ? 0.12 : 0.35;
      const reliability = EQUIPMENT[eq.kind].reliability;
      const hit = base * (1.15 - reliability);
      eq.condition = clamp(eq.condition - hit, 0.2, 1);
      if (!this.hailPrepared && this.random() < 0.45) {
        eq.faulted = true;
      } else if (this.hailPrepared && this.random() < 0.15) {
        eq.faulted = true;
      }
    }
  }

  private enqueueEvent(id: EventId, delayHours = 0): void {
    if (this.triggeredEvents.includes(id) || this.pendingEventQueue.includes(id)) return;
    if (delayHours <= 0) {
      this.pendingEventQueue.push(id);
    } else {
      // Stash with delay using eventClock threshold encoded via repeated checks.
      this.pendingEventQueue.push(id);
      // delay handled by not opening until eventClock advances — store delay on side map
      this.eventDelays[id] = this.eventClock + delayHours;
    }
  }

  private eventDelays: Partial<Record<EventId, number>> = {};

  private maybeOpenQueuedEvent(): void {
    if (this.activeEvent || this.pendingEventQueue.length === 0) return;
    const next = this.pendingEventQueue[0];
    const delayUntil = this.eventDelays[next];
    if (delayUntil !== undefined && this.eventClock < delayUntil) return;
    this.pendingEventQueue.shift();
    delete this.eventDelays[next];
    this.openEvent(next);
  }

  private openEvent(id: EventId): void {
    if (this.triggeredEvents.includes(id)) return;
    const def = EVENTS[id];
    this.triggeredEvents.push(id);
    this.activeEvent = {
      id: def.id,
      title: def.title,
      body: def.body,
      choices: def.choices,
      paused: true,
    };
    this.speedBeforeEvent = this.speed;
    this.speed = 0;
    if (id === 'hail_climax') this.weather = 'hail';
  }

  private activateObjective(id: (typeof this.objectives)[number]['id']): void {
    const obj = this.objectives.find((o) => o.id === id);
    if (obj && !obj.complete) obj.active = true;
  }

  private completeObjective(id: (typeof this.objectives)[number]['id']): void {
    const obj = this.objectives.find((o) => o.id === id);
    if (!obj || obj.complete) return;
    obj.complete = true;
    obj.active = false;
    this.message = `Objective complete: ${obj.title}`;
  }

  update(dtSeconds: number): void {
    if (!Number.isFinite(dtSeconds) || dtSeconds <= 0) return;
    if (this.speed === 0 || this.activeEvent) {
      this.maybeOpenQueuedEvent();
      return;
    }

    this.tickAccumulator += Math.min(dtSeconds, 5) * this.speed * SIM_MINUTES_PER_REAL_SECOND;
    while (this.tickAccumulator >= 1) {
      this.tickAccumulator -= 1;
      this.simulateMinute();
      this.maybeOpenQueuedEvent();
      if (this.activeEvent) break;
    }
    this.maybeOpenQueuedEvent();
  }

  private simulateMinute(): void {
    this.hour += 1 / 60;
    if (this.hour >= 24) {
      this.hour -= 24;
      this.day += 1;
    }
    this.eventClock += 1 / 60;
    this.weatherTimer += 1 / 60;
    if (this.curtailmentTimer > 0) {
      this.curtailmentTimer -= 1 / 60;
      if (this.curtailmentTimer <= 0) this.curtailmentFactor = 1;
    }

    this.advanceConstruction();
    this.advanceStaff(1 / 60);
    this.updateWeather();
    this.updateEconomy(1 / 60);
    this.nextFaultCheck -= 1 / 60;
    this.nextSoilTick -= 1 / 60;
    if (this.nextFaultCheck <= 0) {
      this.nextFaultCheck = 10 + this.random() * 8;
      this.rollFaults();
    }
    if (this.nextSoilTick <= 0) {
      this.nextSoilTick = 5;
      this.accumulateSoiling();
    }
    this.autoDispatch();
    this.updateObjectivesAndStars();
    this.scheduleNarrativeEvents();
  }

  private advanceConstruction(): void {
    for (const eq of this.equipment) {
      if (eq.commissioned) continue;
      eq.constructionProgress = clamp(eq.constructionProgress + 0.04, 0, 1);
      if (eq.constructionProgress >= 1) {
        eq.commissioned = true;
        this.message = `${EQUIPMENT[eq.kind].name} commissioned.`;
      }
    }
  }

  private advanceStaff(hours: number): void {
    for (const tech of this.staff) {
      if (tech.task.type === 'idle') continue;
      const task = tech.task;
      if (!this.equipment.some((e) => e.id === task.targetId)) { tech.task = { type: 'idle' }; continue; }
      const workRate = 1 + ((tech.skill ?? 1) - 1) * 0.2 + (this.staff.some((s) => s.role === 'manager') ? 0.2 : 0);
      if (task.type === 'travel') {
        task.progress += hours / 0.35;
        const target = this.equipment.find((e) => e.id === task.targetId);
        if (target) {
          const t = Math.min(1, task.progress);
          // Ease across the map so the player can see Tess walking.
          const ease = t * t * (3 - 2 * t);
          tech.tile = {
            x: task.from.x + (target.tile.x - task.from.x) * ease,
            y: task.from.y + (target.tile.y - task.from.y) * ease,
          };
          tech.plotId = target.plotId;
        }
        if (task.progress >= 1 && target) {
          tech.tile = { ...target.tile };
          const intent = this.staffIntent(tech);
          delete (tech as StaffMember & { _intent?: string })._intent;
          if (intent === 'repair' && target.faulted) {
            tech.task = { type: 'repair', targetId: target.id, progress: 0 };
          } else if (intent === 'clean' || target.soiling > 0.1) {
            tech.task = { type: 'clean', targetId: target.id, progress: 0 };
          } else if (target.faulted) {
            tech.task = { type: 'repair', targetId: target.id, progress: 0 };
          } else {
            tech.task = { type: 'idle' };
          }
        }
      } else if (task.type === 'repair') {
        task.progress += hours * workRate / 0.5;
        if (task.progress >= 1) {
          const target = this.equipment.find((e) => e.id === task.targetId);
          if (target) {
            target.faulted = false;
            target.condition = clamp(target.condition + 0.15, 0, 1);
            this.faultsRepaired += 1;
            if (!this.capabilities.includes('radio_dispatch')) { this.manualRepairs += 1; this.cash += 2000; }
            tech.skill = Math.min(5, (tech.skill ?? 1) + 0.04);
            this.completeObjective('first_repair');
            if (!this.capabilities.includes('radio_dispatch')) {
              this.capabilities.push('radio_dispatch');
              this.completeObjective('unlock_radio');
              this.message = 'Radio Dispatch unlocked! Routine faults auto-assign.';
            }
          }
          tech.task = { type: 'idle' };
        }
      } else if (task.type === 'clean') {
        const kit = this.capabilities.includes('cleaning_kit');
        task.progress += hours * workRate / (kit ? 0.25 : 0.45);
        if (task.progress >= 1) {
          const target = this.equipment.find((e) => e.id === task.targetId);
          if (target) {
            target.soiling = 0;
            this.cleansCompleted += 1;
            if (!this.capabilities.includes('cleaning_kit')) { this.manualCleans += 1; this.cash += 2000; }
            tech.skill = Math.min(5, (tech.skill ?? 1) + 0.04);
            if (this.capabilities.includes('cleaning_rig')) for (const nearby of this.equipment) {
              if (isPv(nearby.kind) && nearby.plotId === target.plotId && Math.hypot(nearby.tile.x - target.tile.x, nearby.tile.y - target.tile.y) <= 4) nearby.soiling = 0;
            }
            this.completeObjective('first_clean');
            if (!this.capabilities.includes('cleaning_kit')) {
              this.capabilities.push('cleaning_kit');
              this.completeObjective('unlock_cleaning');
              this.message = 'Cleaning Kit unlocked! Faster cleans, slower dust.';
            }
          }
          tech.task = { type: 'idle' };
        }
      }
    }
  }

  private updateWeather(): void {
    if (this.weather === 'hail') return;
    if (this.weatherTimer < 4 + (this.day % 3)) return;
    this.weatherTimer = 0;
    const roll = this.random();
    if (roll < 0.45) this.weather = 'clear';
    else if (roll < 0.7) this.weather = 'partly_cloudy';
    else if (roll < 0.88) this.weather = 'overcast';
    else this.weather = 'rain';
  }

  private updateEconomy(hours: number): void {
    const { exportedKw } = this.computePower();
    this.peakExportKw = Math.max(this.peakExportKw, exportedKw);
    const energy = exportedKw * hours;
    this.totalEnergyKwh += energy;
    const revenue = energy * this.tariffPerKwh;
    const payroll = this.staff.reduce((sum, member) => sum + (member.salary ?? 1), 0);
    const opex = this.equipment.filter((e) => isPv(e.kind) && e.commissioned).length * 0.12;
    const expense = Math.min(this.cash + revenue, (payroll + opex) * hours);
    this.cash += revenue - expense;
    this.totalExpenses += expense;
    this.lifetimeRevenue += revenue;
    this.revenuePerHour = exportedKw * this.tariffPerKwh - payroll - opex;
  }

  private rollFaults(): void {
    if (!this.scriptedFirstFault && this.objectives.find((o) => o.id === 'first_power')?.complete) {
      const candidate = this.equipment.find((e) => isPv(e.kind) && e.commissioned && !e.faulted);
      if (candidate) {
        candidate.faulted = true;
        candidate.condition = clamp(candidate.condition - 0.1, 0.25, 1);
        this.scriptedFirstFault = true;
        this.message = `${EQUIPMENT[candidate.kind].name} faulted! Select it and dispatch Tess.`;
        this.activateObjective('first_repair');
        return;
      }
    }
    for (const eq of this.equipment) {
      if (!eq.commissioned || eq.faulted) continue;
      if (!isPv(eq.kind) && eq.kind !== 'inverter') continue;
      const reliability = EQUIPMENT[eq.kind].reliability;
      const chance = (1 - reliability) * 0.08 * (this.capabilities.includes('remote_monitoring') ? 0.5 : 1) * (this.staff.some((s) => s.role === 'engineer') ? 0.7 : 1);
      if (this.random() < chance) {
        eq.faulted = true;
        eq.condition = clamp(eq.condition - 0.08, 0.25, 1);
        this.message = `${EQUIPMENT[eq.kind].name} faulted!`;
        this.activateObjective('first_repair');
      }
    }
  }

  private accumulateSoiling(): void {
    const kit = this.capabilities.includes('cleaning_kit');
    const rate = kit ? 0.012 : 0.02;
    for (const eq of this.equipment) {
      if (!isPv(eq.kind) || !eq.commissioned) continue;
      eq.soiling = clamp(eq.soiling + rate * (this.weather === 'rain' ? 0.3 : 1), 0, 1);
      if (eq.soiling > 0.35) this.activateObjective('first_clean');
    }
  }

  private autoDispatch(): void {
    const assigned = new Set(this.staff.flatMap((s) => s.task.type === 'idle' ? [] : [s.task.targetId]));
    for (const member of this.staff) {
      if (member.task.type !== 'idle' || member.role === 'manager') continue;
      const fault = this.capabilities.includes('radio_dispatch') && member.role !== 'cleaner'
        ? this.equipment.find((e) => e.faulted && e.commissioned && !assigned.has(e.id)) : undefined;
      const dirty = this.capabilities.includes('scheduled_cleaning')
        ? this.equipment.filter((e) => isPv(e.kind) && e.soiling > 0.35 && e.commissioned && !assigned.has(e.id)).sort((a, b) => b.soiling - a.soiling)[0] : undefined;
      const target = fault ?? dirty;
      if (!target) continue;
      member.task = { type: 'travel', targetId: target.id, progress: 0, from: { ...member.tile } };
      (member as StaffMember & { _intent?: string })._intent = fault ? 'repair' : 'clean';
      assigned.add(target.id);
    }
  }

  private scheduleNarrativeEvents(): void {
    const pvCount = this.equipment.filter((e) => isPv(e.kind) && e.commissioned).length;
    if (pvCount >= 2 && !this.triggeredEvents.includes('community_meeting')) {
      this.enqueueEvent('community_meeting');
    }
    /* Delay bargain_batch until day 3 so early fault loop can be practiced. */
    if (this.day >= 3 && pvCount >= 1 && !this.triggeredEvents.includes('bargain_batch')) {
      this.enqueueEvent('bargain_batch');
    }
    if (this.objectives.find((o) => o.id === 'first_repair')?.complete && !this.triggeredEvents.includes('grid_curtailment')) {
      this.enqueueEvent('grid_curtailment');
    }
    if (this.capabilities.includes('radio_dispatch') && this.day >= 2 && !this.triggeredEvents.includes('temp_worker')) {
      this.enqueueEvent('temp_worker');
    }
    if (this.plots.find((p) => p.id === 'site_b')?.unlocked && !this.triggeredEvents.includes('insurance_upsell')) {
      this.enqueueEvent('insurance_upsell');
    }
    if (this.day >= 3 && this.lifetimeRevenue > 8000 && !this.triggeredEvents.includes('influencer_visit')) {
      this.enqueueEvent('influencer_visit');
    }
    if (
      this.objectives.find((o) => o.id === 'expand_site_b')?.complete &&
      this.capabilities.some((c) => c === 'cleaning_rig' || c === 'remote_monitoring') &&
      this.manualRepairs > 0 && this.manualCleans > 0 &&
      !this.triggeredEvents.includes('hail_warning') &&
      !this.pendingEventQueue.includes('hail_warning')
    ) {
      this.enqueueEvent('hail_warning');
      this.weather = 'overcast';
    }
  }

  private updateObjectivesAndStars(): void {
    const { exportedKw } = this.computePower();
    const pvCount = this.equipment.filter((e) => isPv(e.kind) && e.commissioned).length;
    if (exportedKw > 1 && pvCount > 1) this.completeObjective('first_power');

    const bargain = this.equipment.filter((e) => e.kind === 'bargain_pv').length;
    const premium = this.equipment.filter((e) => e.kind === 'premium_pv').length;
    if ((bargain >= 1 && premium >= 1) || bargain >= 3 || premium >= 3) {
      this.completeObjective('choose_equipment');
    }

    if (this.peakExportKw >= 120 && this.cash >= 5_000) {
      this.completeObjective('unlock_site_b');
      const siteB = this.plots.find((p) => p.id === 'site_b');
      if (siteB && !siteB.unlocked) {
        siteB.unlocked = true;
        this.message = 'Site B unlocked along the river bench!';
        this.activateObjective('expand_site_b');
      }
    }

    if (this.equipment.some((e) => e.plotId === 'site_b' && isPv(e.kind) && e.commissioned)) {
      this.completeObjective('expand_site_b');
    }

    if (
      this.peakExportKw >= STAR_THRESHOLDS.star1PeakKw &&
      this.lifetimeRevenue >= STAR_THRESHOLDS.star1Revenue &&
      this.hailSurvived && this.manualRepairs > 0 && this.manualCleans > 0 &&
      this.objectives.find((o) => o.id === 'expand_site_b')?.complete
    ) {
      this.completeObjective('star_1');
      this.stars = Math.max(this.stars, 1) as 0 | 1 | 2 | 3;
      this.scenarioComplete = true;
    }

    const siteBPv = this.equipment.some((e) => e.plotId === 'site_b' && isPv(e.kind) && e.commissioned);
    if (
      this.stars >= 1 && siteBPv &&
      this.capabilities.includes('radio_dispatch') &&
      this.peakExportKw >= STAR_THRESHOLDS.star2PeakKw
    ) {
      this.completeObjective('star_2');
      this.stars = Math.max(this.stars, 2) as 0 | 1 | 2 | 3;
    }

    if (
      this.stars >= 2 && this.hailSurvived &&
      this.hailPrepared &&
      this.capabilities.includes('cleaning_kit') &&
      this.peakExportKw >= STAR_THRESHOLDS.star3PeakKw
    ) {
      this.completeObjective('star_3');
      this.stars = Math.max(this.stars, 3) as 0 | 1 | 2 | 3;
    }

    // Keep next incomplete objective active
    for (const obj of this.objectives) {
      if (!obj.complete) {
        obj.active = true;
        break;
      }
    }
  }


  buyCapability(id: CapabilityId): boolean {
    if (this.capabilities.includes(id)) return false;
    const expanded = this.plots.some((p) => p.id === 'site_b' && p.unlocked);
    const choice = id === 'cleaning_rig' || id === 'remote_monitoring';
    if (!expanded || (!choice && id !== 'scheduled_cleaning')) return false;
    if (id === 'scheduled_cleaning' && !this.capabilities.includes('cleaning_rig')) return false;
    const cost = choice && !this.capabilities.some((c) => c === 'cleaning_rig' || c === 'remote_monitoring') ? 0 : id === 'scheduled_cleaning' ? 3000 : 4000;
    if (this.cash < cost) { this.message = 'Not enough cash for this capability.'; return false; }
    this.cash -= cost; this.capabilities.push(id);
    this.message = 'Company capability unlocked! Your team has new tools.';
    return true;
  }

  hireStaff(role: StaffMember['role']): boolean {
    if (!['technician', 'cleaner', 'engineer', 'manager'].includes(role) || this.staff.length >= 5 || this.cash < 1500) return false;
    this.cash -= 1500;
    const names = { technician: 'Amir Watts', cleaner: 'Nia Shine', engineer: 'Morgan Ohm', manager: 'Sam Ledger' };
    const traits = { technician: 'Safety First-ish', cleaner: 'Panel Whisperer', engineer: 'Weather Worrier', manager: 'Spreadsheet Enthusiast' };
    this.staff.push({ id: this.uid('staff'), name: names[role], role, skill: 1, salary: role === 'engineer' ? 2 : 1,
      trait: traits[role], plotId: 'site_a', tile: { x: 6, y: 7 }, task: { type: 'idle' } });
    this.message = names[role] + ' joined the team.';
    return true;
  }

  trainStaff(id: string): boolean {
    const member = this.staff.find((s) => s.id === id);
    if (!member || (member.skill ?? 1) >= 5 || this.cash < 800) return false;
    this.cash -= 800; member.skill = Math.min(5, (member.skill ?? 1) + 1);
    this.message = member.name + ' completed training. Faster field work unlocked.';
    return true;
  }

  demolish(id: string): boolean {
    const eq = this.equipment.find((e) => e.id === id);
    if (!eq || !EQUIPMENT[eq.kind].buildable) return false;
    if (isPv(eq.kind) && this.equipment.filter((e) => isPv(e.kind)).length <= 1) {
      this.message = 'Keep one solar array so the company can recover.'; return false;
    }
    this.cash += Math.floor(EQUIPMENT[eq.kind].cost * 0.6 * eq.condition);
    this.equipment = this.equipment.filter((e) => e.id !== id);
    for (const member of this.staff) if (member.task.type !== 'idle' && member.task.targetId === id) member.task = { type: 'idle' };
    this.selectedId = null; this.message = 'Equipment removed; 60% condition-adjusted resale returned.';
    return true;
  }

  plotAtTile(tile: Vec2): PlotId | null {
    for (const plot of this.plots) {
      if (!plot.unlocked) continue;
      if (
        tile.x >= plot.origin.x &&
        tile.y >= plot.origin.y &&
        tile.x < plot.origin.x + plot.size.x &&
        tile.y < plot.origin.y + plot.size.y
      ) {
        return plot.id;
      }
    }
    return null;
  }

  snapshot(): GameSnapshot {
    const { generationKw, exportedKw } = this.computePower();
    return {
      cash: this.cash,
      revenuePerHour: this.revenuePerHour,
      powerKw: generationKw,
      exportedKw,
      day: this.day,
      hour: this.hour,
      speed: this.speed,
      weather: this.weather,
      irradiance: this.getIrradiance(),
      tariffPerKwh: this.tariffPerKwh,
      plots: this.plots.map((p) => ({ ...p, origin: { ...p.origin }, size: { ...p.size } })),
      equipment: this.equipment.map((e) => ({ ...e, tile: { ...e.tile } })),
      staff: this.staff.map((s) => ({
        ...s,
        tile: { ...s.tile },
        task: { ...s.task },
      })),
      capabilities: [...this.capabilities],
      objectives: this.objectives.map((o) => ({ ...o })),
      stars: this.stars,
      activeEvent: this.activeEvent
        ? { ...this.activeEvent, choices: this.activeEvent.choices.map((c) => ({ ...c })) }
        : null,
      selectedId: this.selectedId,
      buildMode: this.buildMode,
      message: this.message,
      hailPrepared: this.hailPrepared,
      totalEnergyKwh: this.totalEnergyKwh,
      faultsRepaired: this.faultsRepaired,
      cleansCompleted: this.cleansCompleted,
      scenarioComplete: this.scenarioComplete,
    };
  }

  serialize(): SerializedGameState {
    return {
      cash: this.cash,
      day: this.day,
      hour: this.hour,
      speed: this.speed,
      weather: this.weather,
      weatherTimer: this.weatherTimer,
      tariffPerKwh: this.tariffPerKwh,
      plots: this.plots,
      equipment: this.equipment,
      staff: this.staff,
      capabilities: this.capabilities,
      objectives: this.objectives,
      stars: this.stars,
      nextEntityId: this.nextEntityId,
      triggeredEvents: this.triggeredEvents,
      pendingEventQueue: this.pendingEventQueue,
      activeEvent: this.activeEvent,
      selectedId: this.selectedId,
      buildMode: this.buildMode,
      message: this.message,
      hailPrepared: this.hailPrepared,
      hailSurvived: this.hailSurvived,
      totalEnergyKwh: this.totalEnergyKwh,
      faultsRepaired: this.faultsRepaired,
      cleansCompleted: this.cleansCompleted,
      scenarioComplete: this.scenarioComplete,
      tickAccumulator: this.tickAccumulator,
      nextFaultCheck: this.nextFaultCheck,
      nextSoilTick: this.nextSoilTick,
      revenuePerHour: this.revenuePerHour,
      lifetimeRevenue: this.lifetimeRevenue,
      peakExportKw: this.peakExportKw,
      scriptedFirstFault: this.scriptedFirstFault,
      curtailmentFactor: this.curtailmentFactor, curtailmentTimer: this.curtailmentTimer,
      eventClock: this.eventClock, eventDelays: { ...this.eventDelays }, rngState: this.rngState,
      totalExpenses: this.totalExpenses, manualRepairs: this.manualRepairs, manualCleans: this.manualCleans,
      speedBeforeEvent: this.speedBeforeEvent,
    };
  }

  load(data: SerializedGameState): void {
    if (!validateState(data)) throw new Error('Invalid save data');
    const copy = structuredClone(data);
    // Reset optional fields when loading older saves into an existing session.
    this.curtailmentFactor = 1; this.curtailmentTimer = 0; this.eventClock = 0;
    this.eventDelays = {}; this.rngState = 924817; this.totalExpenses = 0;
    this.manualRepairs = data.capabilities.includes('radio_dispatch') ? 1 : 0;
    this.manualCleans = data.capabilities.includes('cleaning_kit') ? 1 : 0;
    this.speedBeforeEvent = 1;
    Object.assign(this, copy);
    this.lifetimeRevenue = data.lifetimeRevenue ?? this.lifetimeRevenue;
    this.peakExportKw = data.peakExportKw ?? this.peakExportKw;
    this.scriptedFirstFault = data.scriptedFirstFault ?? false;
  }
}

/** Pure helpers for unit tests. */
export function generationKwForArray(args: {
  nameplateKw: number;
  efficiency: number;
  condition: number;
  soiling: number;
  irradiance: number;
  solarResource: number;
}): number {
  const soilPenalty = 1 - args.soiling * 0.45;
  return (
    args.nameplateKw *
    args.efficiency *
    args.condition *
    soilPenalty *
    args.irradiance *
    args.solarResource
  );
}

export function revenueFor(energyKwh: number, tariff: number): number {
  return energyKwh * tariff;
}
