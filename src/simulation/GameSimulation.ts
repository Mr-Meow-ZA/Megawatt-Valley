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
  message: string | null =
    'Welcome to Site A. Place a PV array from the Build menu to get first power.';
  hailPrepared = false;
  hailSurvived = false;
  hailHoldHours = 0;
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
  /** Sim-hours of successful export before the scripted first fault. */
  firstPowerHoldHours = 0;
  onboardingStep = 0;
  pendingCapabilityChoice = false;
  bargainDiscountCharges = 0;
  playerPlacedPv = false;
  private eventDelays: Partial<Record<EventId, number>> = {};
  private lastCommissionId: string | null = null;
  private lastFaultToastId: string | null = null;
  private lastUnlockToast = '';

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
    // No free starter PV — First Power must be earned by the player.
    this.staff.push({
      id: this.uid('staff'),
      name: 'Tess Volt',
      role: 'technician',
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
      if (!plot?.unlocked) continue;
      const soilPenalty = 1 - eq.soiling * 0.45;
      generationKw +=
        def.nameplateKw *
        def.efficiency *
        eq.condition *
        soilPenalty *
        irradiance *
        plot.solarResource *
        (plot.exportFactor ?? 1);
    }
    // Site export also limited by weakest plot factor on generation already applied per-array.
    const exportedKw = Math.min(generationKw, this.inverterCapacity());
    return { generationKw, exportedKw };
  }

  setSpeed(speed: 0 | 1 | 2 | 4): void {
    this.speed = speed;
  }

  setBuildMode(kind: EquipmentKind | null): void {
    this.buildMode = kind;
    if (kind) {
      this.selectedId = null;
      if (this.onboardingStep === 1) this.onboardingStep = 2;
    }
  }

  selectEntity(id: string | null): void {
    this.selectedId = id;
    if (id) this.buildMode = null;
  }

  advanceOnboarding(): void {
    this.onboardingStep = Math.min(this.onboardingStep + 1, 4);
  }

  dismissOnboarding(): void {
    this.onboardingStep = 4;
  }

  canPlace(kind: EquipmentKind, plotId: PlotId, tile: Vec2): string | null {
    const def = EQUIPMENT[kind];
    if (!def.buildable) return 'Not buildable';
    const plot = this.plots.find((p) => p.id === plotId);
    if (!plot?.unlocked) return 'Plot locked — unlock Site B via Growing Up first';
    let cost = def.cost;
    if (kind === 'bargain_pv' && this.bargainDiscountCharges > 0) {
      cost = Math.max(0, cost - 1500);
    }
    if (this.cash < cost) return 'Not enough cash';
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
    let cost = def.cost;
    if (kind === 'bargain_pv' && this.bargainDiscountCharges > 0) {
      cost = Math.max(0, cost - 1500);
      this.bargainDiscountCharges -= 1;
      this.message = `Building ${def.name} (−$1,500 batch discount)…`;
    } else {
      this.message = `Building ${def.name}…`;
    }
    this.cash -= cost;
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
    if (isPv(kind)) {
      this.playerPlacedPv = true;
      if (this.onboardingStep < 2) this.onboardingStep = 2;
    }
    this.buildMode = null;
    this.activateObjective('choose_equipment');
    return true;
  }

  /** Smart repair: selected fault, else nearest faulted asset. */
  dispatchRepair(equipmentId?: string | null): boolean {
    const targetId =
      equipmentId ??
      this.selectedId ??
      this.equipment.find((e) => e.faulted && e.commissioned)?.id ??
      null;
    if (!targetId) {
      this.message = 'No faults to repair right now.';
      return false;
    }
    const eq = this.equipment.find((e) => e.id === targetId);
    if (!eq?.faulted) {
      this.message = 'Nothing to repair there.';
      return false;
    }
    if (this.capabilities.includes('radio_dispatch')) {
      const idle = this.staff.find((s) => s.task.type === 'idle');
      if (!idle) {
        this.message = 'Radio Dispatch queued — technicians busy.';
        return false;
      }
      idle.task = { type: 'travel', targetId: eq.id, progress: 0, from: { ...idle.tile } };
      idle.intent = 'repair';
      this.message = `Radio Dispatch: ${idle.name} en route.`;
      return true;
    }
    const tech = this.staff.find((s) => s.task.type === 'idle');
    if (!tech) {
      this.message = 'Technician is busy.';
      return false;
    }
    tech.task = { type: 'travel', targetId: eq.id, progress: 0, from: { ...tech.tile } };
    tech.intent = 'repair';
    this.message = `${tech.name} is on the way.`;
    this.activateObjective('first_repair');
    return true;
  }

  /** Smart clean: selected dirty PV, else dirtiest array. */
  dispatchClean(equipmentId?: string | null): boolean {
    let eq = equipmentId ? this.equipment.find((e) => e.id === equipmentId) : null;
    if (!eq && this.selectedId) {
      eq = this.equipment.find((e) => e.id === this.selectedId) ?? null;
    }
    if (!eq || !isPv(eq.kind) || eq.soiling < 0.15) {
      eq =
        this.equipment
          .filter((e) => isPv(e.kind) && e.commissioned && e.soiling >= 0.15)
          .sort((a, b) => b.soiling - a.soiling)[0] ?? null;
    }
    if (!eq) {
      this.message = 'Arrays look clean enough for now.';
      return false;
    }
    const tech = this.staff.find((s) => s.task.type === 'idle');
    if (!tech) {
      this.message = 'Technician is busy.';
      return false;
    }
    tech.task = { type: 'travel', targetId: eq.id, progress: 0, from: { ...tech.tile } };
    tech.intent = 'clean';
    this.message = `${tech.name} heading out with a mop.`;
    this.activateObjective('first_clean');
    return true;
  }

  private staffIntent(staff: StaffMember): 'clean' | 'repair' {
    if (staff.intent) return staff.intent;
    const target = this.equipment.find(
      (e) =>
        e.id ===
        (staff.task.type === 'travel' || staff.task.type === 'repair' || staff.task.type === 'clean'
          ? staff.task.targetId
          : ''),
    );
    if (target?.faulted) return 'repair';
    return 'clean';
  }

  resolveEventChoice(choiceId: string): void {
    if (!this.activeEvent) return;
    const eventId = this.activeEvent.id;
    this.activeEvent = null;
    this.speed = this.speed === 0 ? 1 : this.speed;

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
          this.bargainDiscountCharges += 2;
          this.message = 'Batch secured: next 2 Bargain arrays get −$1,500 each.';
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
      case 'capability_choice':
        this.cash -= 5000;
        if (choiceId === 'monitor') {
          if (!this.capabilities.includes('remote_monitoring')) {
            this.capabilities.push('remote_monitoring');
          }
          this.message = 'Remote Monitoring online — faults hurt less.';
        } else {
          if (!this.capabilities.includes('cleaning_rig')) {
            this.capabilities.push('cleaning_rig');
          }
          this.message = 'Cleaning Rig deployed — dust stands little chance.';
        }
        this.completeObjective('choose_improve');
        this.pendingCapabilityChoice = false;
        break;
      case 'growing_pains':
        if (choiceId === 'hire') {
          this.cash -= 8000;
          this.hireSecondTech();
          this.message = 'Pat Amp joins the crew. Queue pressure eases.';
        } else {
          this.message = 'One tech, two sites. Brace for juggling.';
          // Spike a fault + dirt to make the stretch feel real.
          const pv = this.equipment.find((e) => isPv(e.kind) && e.commissioned && !e.faulted);
          if (pv) {
            pv.faulted = true;
            pv.soiling = Math.max(pv.soiling, 0.4);
          }
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
        this.weather = 'overcast';
        this.enqueueEvent('hail_climax', 6);
        break;
      case 'hail_climax':
        this.weather = 'hail';
        this.hailHoldHours = 2.5;
        this.weatherTimer = 0;
        this.applyHailDamage();
        this.hailSurvived = true;
        this.completeObjective('survive_hail');
        this.message = this.hailPrepared
          ? 'Hail pounds the valley — prep paid off. Damage is limited.'
          : 'Hail smacks the arrays. Repairs ahead.';
        break;
      default:
        break;
    }
  }

  private hireSecondTech(): void {
    if (this.staff.some((s) => s.name === 'Pat Amp')) return;
    const siteB = this.plots.find((p) => p.id === 'site_b');
    const origin = siteB?.unlocked ? siteB.origin : this.plots[0].origin;
    this.staff.push({
      id: this.uid('staff'),
      name: 'Pat Amp',
      role: 'technician',
      plotId: siteB?.unlocked ? 'site_b' : 'site_a',
      tile: { x: origin.x + 2, y: origin.y + 2 },
      task: { type: 'idle' },
    });
  }

  private applyHailDamage(): void {
    for (const eq of this.equipment) {
      if (!isPv(eq.kind) || !eq.commissioned) continue;
      const base = this.hailPrepared ? 0.12 : 0.35;
      const reliability = EQUIPMENT[eq.kind].reliability;
      const hit = base * (1.15 - reliability);
      eq.condition = clamp(eq.condition - hit, 0.2, 1);
      if (!this.hailPrepared && Math.random() < 0.45) {
        eq.faulted = true;
      } else if (this.hailPrepared && Math.random() < 0.15) {
        eq.faulted = true;
      }
    }
  }

  private enqueueEvent(id: EventId, delayHours = 0): void {
    if (this.triggeredEvents.includes(id) || this.pendingEventQueue.includes(id)) return;
    this.pendingEventQueue.push(id);
    if (delayHours > 0) {
      this.eventDelays[id] = this.eventClock + delayHours;
    }
  }

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
    if (!def) return;
    this.triggeredEvents.push(id);
    this.activeEvent = {
      id: def.id,
      title: def.title,
      body: def.body,
      choices: def.choices,
      paused: true,
    };
    this.speed = 0;
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
    // Keep construction advancing while an event modal is open so builds don't soft-lock.
    if (this.activeEvent) {
      this.tickAccumulator += dtSeconds * 1 * SIM_MINUTES_PER_REAL_SECOND;
      while (this.tickAccumulator >= 1) {
        this.tickAccumulator -= 1;
        this.advanceConstruction();
      }
      this.maybeOpenQueuedEvent();
      return;
    }
    if (this.speed === 0) {
      this.maybeOpenQueuedEvent();
      return;
    }

    this.tickAccumulator += dtSeconds * this.speed * SIM_MINUTES_PER_REAL_SECOND;
    while (this.tickAccumulator >= 1) {
      this.tickAccumulator -= 1;
      this.simulateMinute();
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
    if (this.hailHoldHours > 0) {
      this.hailHoldHours -= 1 / 60;
      if (this.hailHoldHours <= 0) {
        this.hailHoldHours = 0;
        this.weather = 'partly_cloudy';
        this.weatherTimer = 0;
      }
    }

    this.advanceConstruction();
    this.advanceStaff(1 / 60);
    this.updateWeather();
    this.updateEconomy(1 / 60);
    this.nextFaultCheck -= 1 / 60;
    this.nextSoilTick -= 1 / 60;
    if (this.nextFaultCheck <= 0) {
      this.nextFaultCheck = 10 + Math.random() * 8;
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
      // ~12 sim-minutes to commission — readable without feeling sticky.
      eq.constructionProgress = clamp(eq.constructionProgress + 0.085, 0, 1);
      if (eq.constructionProgress >= 1) {
        eq.commissioned = true;
        this.lastCommissionId = eq.id;
        this.message = `${EQUIPMENT[eq.kind].name} commissioned.`;
        if (isPv(eq.kind) && this.onboardingStep < 3) this.onboardingStep = 3;
      }
    }
  }

  consumeCommissionFlag(): string | null {
    const id = this.lastCommissionId;
    this.lastCommissionId = null;
    return id;
  }

  consumeFaultToast(): string | null {
    const id = this.lastFaultToastId;
    this.lastFaultToastId = null;
    return id;
  }

  consumeUnlockToast(): string {
    const t = this.lastUnlockToast;
    this.lastUnlockToast = '';
    return t;
  }

  private advanceStaff(hours: number): void {
    for (const tech of this.staff) {
      if (tech.task.type === 'idle') continue;
      const task = tech.task;
      if (task.type === 'travel') {
        task.progress += hours / 0.35;
        const target = this.equipment.find((e) => e.id === task.targetId);
        if (target) {
          const t = Math.min(1, task.progress);
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
          delete tech.intent;
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
        task.progress += hours / 0.5;
        if (task.progress >= 1) {
          const target = this.equipment.find((e) => e.id === task.targetId);
          if (target) {
            target.faulted = false;
            target.condition = clamp(target.condition + 0.15, 0, 1);
            this.faultsRepaired += 1;
            this.completeObjective('first_repair');
            if (!this.capabilities.includes('radio_dispatch')) {
              this.capabilities.push('radio_dispatch');
              this.completeObjective('unlock_radio');
              this.lastUnlockToast = 'radio';
              this.message = 'Radio Dispatch unlocked! Routine faults auto-assign.';
              if (this.onboardingStep < 4) this.onboardingStep = 4;
            }
          }
          tech.task = { type: 'idle' };
        }
      } else if (task.type === 'clean') {
        const kit = this.capabilities.includes('cleaning_kit');
        task.progress += hours / (kit ? 0.25 : 0.45);
        if (task.progress >= 1) {
          const target = this.equipment.find((e) => e.id === task.targetId);
          if (target) {
            target.soiling = 0;
            this.cleansCompleted += 1;
            this.completeObjective('first_clean');
            if (!this.capabilities.includes('cleaning_kit')) {
              this.capabilities.push('cleaning_kit');
              this.completeObjective('unlock_cleaning');
              this.lastUnlockToast = 'cleaning';
              this.message = 'Cleaning Kit unlocked! Faster cleans, slower dust.';
            }
          }
          tech.task = { type: 'idle' };
        }
      }
    }
  }

  private updateWeather(): void {
    if (this.hailHoldHours > 0 || this.weather === 'hail') return;
    if (this.weatherTimer < 4 + (this.day % 3)) return;
    this.weatherTimer = 0;
    const roll = Math.random();
    if (roll < 0.45) this.weather = 'clear';
    else if (roll < 0.7) this.weather = 'partly_cloudy';
    else if (roll < 0.88) this.weather = 'overcast';
    else this.weather = 'rain';
  }

  private updateEconomy(hours: number): void {
    const { exportedKw } = this.computePower();
    this.peakExportKw = Math.max(this.peakExportKw, exportedKw);
    if (exportedKw > 1 && this.objectives.find((o) => o.id === 'first_power')?.complete) {
      this.firstPowerHoldHours += hours;
    }
    const energy = exportedKw * hours;
    this.totalEnergyKwh += energy;
    const revenue = energy * this.tariffPerKwh;
    this.cash += revenue;
    this.lifetimeRevenue += revenue;
    this.revenuePerHour = exportedKw * this.tariffPerKwh;
  }

  private rollFaults(): void {
    const monitor = this.capabilities.includes('remote_monitoring');
    // Let the player enjoy First Power before the scripted fault teaches dispatch.
    if (
      !this.scriptedFirstFault &&
      this.objectives.find((o) => o.id === 'first_power')?.complete &&
      this.firstPowerHoldHours >= 4
    ) {
      const candidate = this.equipment.find((e) => isPv(e.kind) && e.commissioned && !e.faulted);
      if (candidate) {
        candidate.faulted = true;
        candidate.condition = clamp(candidate.condition - (monitor ? 0.05 : 0.1), 0.25, 1);
        this.scriptedFirstFault = true;
        this.lastFaultToastId = candidate.id;
        this.message = `${EQUIPMENT[candidate.kind].name} faulted! Press R or Dispatch Repair.`;
        this.activateObjective('first_repair');
        if (this.onboardingStep < 4) this.onboardingStep = 3;
        return;
      }
    }
    for (const eq of this.equipment) {
      if (!eq.commissioned || eq.faulted) continue;
      if (!isPv(eq.kind) && eq.kind !== 'inverter') continue;
      const reliability = EQUIPMENT[eq.kind].reliability;
      const chance = (1 - reliability) * (monitor ? 0.05 : 0.08);
      if (Math.random() < chance) {
        eq.faulted = true;
        eq.condition = clamp(eq.condition - (monitor ? 0.04 : 0.08), 0.25, 1);
        this.lastFaultToastId = eq.id;
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
      if (this.capabilities.includes('remote_monitoring')) {
        // Slightly slower wear when monitored.
        eq.condition = clamp(eq.condition + 0.0005, 0.2, 1);
      }
      eq.soiling = clamp(eq.soiling + rate * (this.weather === 'rain' ? 0.3 : 1), 0, 1);
      if (eq.soiling > 0.35) this.activateObjective('first_clean');
    }
  }

  private autoDispatch(): void {
    // Cleaning rig: auto-clear heavy soiling without travel.
    if (this.capabilities.includes('cleaning_rig')) {
      for (const eq of this.equipment) {
        if (isPv(eq.kind) && eq.commissioned && eq.soiling > 0.6) {
          eq.soiling = Math.max(0, eq.soiling - 0.35);
          this.cleansCompleted += 1;
        }
      }
    }

    if (!this.capabilities.includes('radio_dispatch')) return;
    const idle = this.staff.find((s) => s.task.type === 'idle');
    if (!idle) return;
    const fault = this.equipment.find((e) => e.faulted && e.commissioned);
    if (fault) {
      idle.task = { type: 'travel', targetId: fault.id, progress: 0, from: { ...idle.tile } };
      idle.intent = 'repair';
      return;
    }
    const dirty = this.equipment
      .filter((e) => isPv(e.kind) && e.soiling > 0.55 && e.commissioned)
      .sort((a, b) => b.soiling - a.soiling)[0];
    if (dirty && !this.capabilities.includes('cleaning_rig')) {
      idle.task = { type: 'travel', targetId: dirty.id, progress: 0, from: { ...idle.tile } };
      idle.intent = 'clean';
    }
  }

  private scheduleNarrativeEvents(): void {
    const pvCount = this.equipment.filter((e) => isPv(e.kind) && e.commissioned).length;
    if (pvCount >= 2 && !this.triggeredEvents.includes('community_meeting')) {
      this.enqueueEvent('community_meeting');
    }
    if (this.day >= 3 && pvCount >= 1 && !this.triggeredEvents.includes('bargain_batch')) {
      this.enqueueEvent('bargain_batch');
    }
    if (
      this.objectives.find((o) => o.id === 'first_repair')?.complete &&
      !this.triggeredEvents.includes('grid_curtailment')
    ) {
      this.enqueueEvent('grid_curtailment');
    }
    if (
      this.capabilities.includes('radio_dispatch') &&
      this.day >= 2 &&
      !this.triggeredEvents.includes('temp_worker')
    ) {
      this.enqueueEvent('temp_worker');
    }
    if (
      this.capabilities.includes('radio_dispatch') &&
      this.capabilities.includes('cleaning_kit') &&
      !this.triggeredEvents.includes('capability_choice') &&
      !this.pendingCapabilityChoice
    ) {
      this.pendingCapabilityChoice = true;
      this.activateObjective('choose_improve');
      this.enqueueEvent('capability_choice', 2);
    }
    if (this.plots.find((p) => p.id === 'site_b')?.unlocked && !this.triggeredEvents.includes('insurance_upsell')) {
      this.enqueueEvent('insurance_upsell');
    }
    if (
      this.equipment.some((e) => e.plotId === 'site_b' && isPv(e.kind) && e.commissioned) &&
      !this.triggeredEvents.includes('growing_pains')
    ) {
      this.enqueueEvent('growing_pains');
    }
    if (this.day >= 3 && this.lifetimeRevenue > 8000 && !this.triggeredEvents.includes('influencer_visit')) {
      this.enqueueEvent('influencer_visit');
    }
    if (
      (this.stars >= 1 || this.peakExportKw >= 120) &&
      !this.triggeredEvents.includes('hail_warning') &&
      !this.pendingEventQueue.includes('hail_warning')
    ) {
      this.enqueueEvent('hail_warning');
      this.weather = 'overcast';
    }
  }

  private updateObjectivesAndStars(): void {
    const { exportedKw } = this.computePower();
    const playerPv = this.equipment.filter((e) => isPv(e.kind) && e.commissioned && this.playerPlacedPv);
    if (exportedKw > 1 && playerPv.length > 0) {
      this.completeObjective('first_power');
      if (this.onboardingStep < 3) this.onboardingStep = 3;
    }

    const bargain = this.equipment.filter((e) => e.kind === 'bargain_pv').length;
    const premium = this.equipment.filter((e) => e.kind === 'premium_pv').length;
    if ((bargain >= 1 && premium >= 1) || bargain >= 3 || premium >= 3) {
      this.completeObjective('choose_equipment');
    }

    if (this.peakExportKw >= 120 && this.cash >= 25_000) {
      this.completeObjective('unlock_site_b');
      const siteB = this.plots.find((p) => p.id === 'site_b');
      if (siteB && !siteB.unlocked) {
        siteB.unlocked = true;
        this.message =
          'Site B unlocked — River Bench has weaker sun and a congested grid spur. Expand carefully!';
        this.activateObjective('expand_site_b');
      }
    }

    if (this.equipment.some((e) => e.plotId === 'site_b' && isPv(e.kind) && e.commissioned)) {
      this.completeObjective('expand_site_b');
    }

    if (
      this.peakExportKw >= STAR_THRESHOLDS.star1PeakKw &&
      this.lifetimeRevenue >= STAR_THRESHOLDS.star1Revenue
    ) {
      this.completeObjective('star_1');
      this.stars = Math.max(this.stars, 1) as 0 | 1 | 2 | 3;
      this.scenarioComplete = true;
    }

    const siteBPv = this.equipment.some((e) => e.plotId === 'site_b' && isPv(e.kind) && e.commissioned);
    if (
      siteBPv &&
      this.capabilities.includes('radio_dispatch') &&
      this.peakExportKw >= STAR_THRESHOLDS.star2PeakKw
    ) {
      this.completeObjective('star_2');
      this.stars = Math.max(this.stars, 2) as 0 | 1 | 2 | 3;
    }

    if (
      this.hailSurvived &&
      this.hailPrepared &&
      this.capabilities.includes('cleaning_kit') &&
      this.peakExportKw >= STAR_THRESHOLDS.star3PeakKw
    ) {
      this.completeObjective('star_3');
      this.stars = Math.max(this.stars, 3) as 0 | 1 | 2 | 3;
    }

    for (const obj of this.objectives) {
      if (!obj.complete) {
        obj.active = true;
        break;
      }
    }
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
      onboardingStep: this.onboardingStep,
      pendingCapabilityChoice: this.pendingCapabilityChoice,
      bargainDiscountCharges: this.bargainDiscountCharges,
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
      eventDelays: { ...this.eventDelays },
      eventClock: this.eventClock,
      activeEvent: this.activeEvent,
      selectedId: this.selectedId,
      buildMode: this.buildMode,
      message: this.message,
      hailPrepared: this.hailPrepared,
      hailSurvived: this.hailSurvived,
      hailHoldHours: this.hailHoldHours,
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
      firstPowerHoldHours: this.firstPowerHoldHours,
      curtailmentFactor: this.curtailmentFactor,
      curtailmentTimer: this.curtailmentTimer,
      onboardingStep: this.onboardingStep,
      pendingCapabilityChoice: this.pendingCapabilityChoice,
      bargainDiscountCharges: this.bargainDiscountCharges,
      playerPlacedPv: this.playerPlacedPv,
    };
  }

  load(data: SerializedGameState): void {
    this.cash = data.cash;
    this.day = data.day;
    this.hour = data.hour;
    this.speed = data.speed;
    this.weather = data.weather;
    this.weatherTimer = data.weatherTimer ?? 0;
    this.tariffPerKwh = data.tariffPerKwh;
    this.plots = (data.plots ?? createInitialPlots()).map((p) => ({
      ...p,
      exportFactor: p.exportFactor ?? (p.id === 'site_b' ? 0.78 : 1),
    }));
    this.equipment = data.equipment ?? [];
    this.staff = (data.staff ?? []).map((s) => ({ ...s, intent: s.intent }));
    this.capabilities = data.capabilities ?? [];
    // Merge objectives so new IDs appear after upgrades.
    const fresh = createInitialObjectives();
    const loaded = data.objectives ?? [];
    this.objectives = fresh.map((f) => {
      const old = loaded.find((o) => o.id === f.id);
      return old ? { ...f, complete: old.complete, active: old.active } : f;
    });
    this.stars = data.stars ?? 0;
    this.nextEntityId = data.nextEntityId ?? 1;
    this.triggeredEvents = data.triggeredEvents ?? [];
    this.pendingEventQueue = data.pendingEventQueue ?? [];
    this.eventDelays = data.eventDelays ?? {};
    this.eventClock = data.eventClock ?? 0;
    this.activeEvent = data.activeEvent ?? null;
    this.selectedId = data.selectedId ?? null;
    this.buildMode = null;
    this.message = data.message ?? 'Game loaded.';
    this.hailPrepared = data.hailPrepared ?? false;
    this.hailSurvived = data.hailSurvived ?? false;
    this.hailHoldHours = data.hailHoldHours ?? 0;
    this.totalEnergyKwh = data.totalEnergyKwh ?? 0;
    this.faultsRepaired = data.faultsRepaired ?? 0;
    this.cleansCompleted = data.cleansCompleted ?? 0;
    this.scenarioComplete = data.scenarioComplete ?? false;
    this.tickAccumulator = data.tickAccumulator ?? 0;
    this.nextFaultCheck = data.nextFaultCheck ?? 8;
    this.nextSoilTick = data.nextSoilTick ?? 5;
    this.revenuePerHour = data.revenuePerHour ?? 0;
    this.lifetimeRevenue = data.lifetimeRevenue ?? 0;
    this.peakExportKw = data.peakExportKw ?? 0;
    this.scriptedFirstFault = data.scriptedFirstFault ?? false;
    this.firstPowerHoldHours = data.firstPowerHoldHours ?? 0;
    this.curtailmentFactor = data.curtailmentFactor ?? 1;
    this.curtailmentTimer = data.curtailmentTimer ?? 0;
    this.onboardingStep = data.onboardingStep ?? 4;
    this.pendingCapabilityChoice = data.pendingCapabilityChoice ?? false;
    this.bargainDiscountCharges = data.bargainDiscountCharges ?? 0;
    this.playerPlacedPv =
      data.playerPlacedPv ?? this.equipment.some((e) => isPv(e.kind));
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
