import { roadRoute,roadKey } from './roads';
import { ROAD_TILES,OFFICE_YARD,inRect } from '../content/valleyLayout';
import { CONTRACTS, contractOffer, type ContractId, type ContractProgress, type ContractResult } from '../content/contracts';
import { parkMetrics, nearbyWorkshop, travelHours, workerCanDo } from './operations';
import { RESEARCH, type ResearchId, type ResearchProject } from '../content/research';
import { isMainRoad, isWater, isBank, alongPath } from '../content/valleyLayout';
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
  WorkOrder,
  WorkKind,
  DailyReport,
} from './types';

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function isPv(kind: EquipmentKind): boolean {
  return kind === 'bargain_pv' || kind === 'premium_pv';
}

export class GameSimulation {
  researched: ResearchId[] = [];
  activeResearch: ResearchProject | null = null;
  contract: ContractProgress | null = null;
  contractHistory: ContractResult[] = [];
  contractRenewals = 0;
  contractCooldown = 0;
  contractsCompleted = 0;
  workOrders: WorkOrder[] = [];
  cleaningThreshold = .35;
  preventiveMaintenance = false;
  stabilityHours = 0;
  servicesCompleted = 0;
  dailyReports: DailyReport[] = [];
  currentReport: DailyReport = { day:1, energyKwh:0, revenue:0, expenses:0, bonuses:0, jobs:0 };
  nextNarrativeAt = 0;
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
  completionAcknowledged = false;
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
      task: { type: 'idle' }, energy:1, onBreak:false, workZone:'all', preference:'auto',
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
    return hourFactor * weatherFactor[this.weather];
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
    return (starter + extra) * (this.researched.includes('smart_inverters') ? 1.2 : 1);
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
        def.nameplateKw * def.efficiency * eq.condition * soilPenalty * irradiance * plot.solarResource
        * (this.researched.includes('precision_wiring') ? 1.08 : 1)
        * (eq.kind === 'premium_pv' && this.researched.includes('advanced_cells') ? 1.12 : 1);
    }
    const exportedKw = Math.min(generationKw, this.inverterCapacity()) * this.curtailmentFactor;
    return { generationKw, exportedKw };
  }

  researchBlockedReason(id: ResearchId): string | null {
    if (!Object.prototype.hasOwnProperty.call(RESEARCH,id)) return 'Unknown research';
    const def = RESEARCH[id];
    if (this.researched.includes(id)) return 'Completed';
    if (this.activeResearch?.id === id) return 'Researching';
    if (def.prerequisite && !this.researched.includes(def.prerequisite)) return `Requires ${RESEARCH[def.prerequisite].name}`;
    if (def.gate === 'power' && !this.objectives.some(o => o.id === 'first_power' && o.complete)) return 'Export your first power';
    if (def.gate === 'repair' && !this.capabilities.includes('radio_dispatch')) return 'Complete your first repair';
    if (def.gate === 'clean' && !this.capabilities.includes('cleaning_kit')) return 'Complete your first clean';
    if (def.gate === 'expansion' && !this.plots[1].unlocked) return 'Unlock Site B';
    if (this.activeResearch) return 'Finish the current project';
    if (this.cash < def.cost) return 'Not enough cash';
    return null;
  }

  startResearch(id: ResearchId): boolean {
    const reason = this.researchBlockedReason(id);
    if (reason) { this.message = reason; return false; }
    this.cash -= RESEARCH[id].cost;
    this.activeResearch = { id, progress: 0 };
    this.message = `Research started: ${RESEARCH[id].name}. Keep the park running.`;
    return true;
  }

  private advanceResearch(hours: number): void {
    if (!this.activeResearch) return;
    // Office research has a baseline; available engineers can add assistance.
    const support = Math.min(1, this.staff.filter(s => s.role === 'engineer' && s.task.type === 'idle' && !s.onBreak && !(s.trainingHoursLeft ?? 0)).reduce((n,s) => n + (s.preference === 'research' ? .2 : .1) * (s.skill ?? 1), 0));
    const project = this.activeResearch;
    project.progress = Math.min(1, project.progress + hours * (1 + support) / RESEARCH[project.id].hours);
    if (project.progress >= 1) {
      this.researched.push(project.id);
      this.activeResearch = null;
      this.message = `Research complete: ${RESEARCH[project.id].name}. ${RESEARCH[project.id].effect}`;
    }
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
    if (kind === 'workshop' && !this.capabilities.includes('radio_dispatch')) return 'Unlock workshop with your first repair';
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
    for (let y=tile.y;y<tile.y+def.footprint.y;y++) for(let x=tile.x;x<tile.x+def.footprint.x;x++) {
      if(isMainRoad(x,y)) return 'Keep the access road clear';
      if(isWater(x,y)||isBank(x,y)) return 'River setback: keep infrastructure on dry land';
      if(inRect(x,y,OFFICE_YARD)) return 'Reserved office and parking yard';
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

  roadPlan(path:Vec2[]):{tiles:Vec2[];cost:number;error:string|null}{
    const existing=new Set([...ROAD_TILES,...this.equipment.filter(e=>e.kind==='road').map(e=>e.tile)].map(roadKey));
    const seen=new Set<string>(),tiles:Vec2[]=[];
    for(const tile of path){
      const key=roadKey(tile);if(existing.has(key)||seen.has(key))continue;seen.add(key);
      const plot=this.plotAtTile(tile),error=plot?this.canPlace('road',plot,tile):'Outside unlocked land';
      if(error)return {tiles,cost:tiles.length*100,error};
      tiles.push(tile);
    }
    const cost=tiles.length*100;return {tiles,cost,error:cost>this.cash?'Not enough cash for this road':null};
  }
  placeRoadStroke(path:Vec2[]):boolean{
    const plan=this.roadPlan(path);
    if(plan.error){this.message=plan.error;return false;}
    if(!plan.tiles.length){this.message='This road already exists.';return false;}
    for(const tile of plan.tiles)this.placeEquipment('road',this.plotAtTile(tile)!,tile);
    this.setBuildMode('road');this.message=plan.tiles.length+' road tiles planned · $'+plan.cost+'. Connected roads speed up nearby crew travel.';
    return true;
  }

  private queueWork(targetId: string, kind: WorkKind, manual: boolean): boolean {
    if (this.workOrders.some(o => o.targetId===targetId && o.kind===kind) || this.staff.some(m => m.task.type!=='idle' && m.task.targetId===targetId && (m.task.type===kind || m.task.type==='travel' && m.task.intent===kind))) return false;
    if (this.workOrders.length >= 500) return false;
    this.workOrders.push({targetId,kind,manual});
    this.autoDispatch();
    return true;
  }

  dispatchRepair(equipmentId: string): boolean {
    const eq = this.equipment.find(e => e.id===equipmentId);
    if (!eq?.faulted) { this.message='Nothing to repair there.'; return false; }
    const queued=this.queueWork(equipmentId,'repair',true);
    if(queued) this.message='Repair ordered. The next eligible crew member will respond.';
    return queued;
  }

  dispatchClean(equipmentId: string): boolean {
    const eq = this.equipment.find(e => e.id===equipmentId);
    if(!eq || !isPv(eq.kind) || !eq.commissioned || eq.soiling<.15) { this.message='That array is clean enough.'; return false; }
    const queued=this.queueWork(equipmentId,'clean',true);
    if(queued) { this.activateObjective('first_clean'); this.message='Cleaning ordered. Busy crews keep it in the work queue.'; }
    return queued;
  }

  dispatchService(equipmentId: string): boolean {
    const eq=this.equipment.find(e=>e.id===equipmentId);
    if(!this.capabilities.includes('radio_dispatch') || !eq || !eq.commissioned || !isPv(eq.kind) || eq.faulted || eq.condition>=.95 || this.cash<450) return false;
    const queued=this.queueWork(equipmentId,'service',true);
    if(queued) this.message='Service ordered: $450 is charged when a crew starts. Condition will be restored.';
    return queued;
  }

  setStaffAssignment(id: string, zone: StaffMember['workZone'], preference: StaffMember['preference']): boolean {
    const member=this.staff.find(m=>m.id===id);
    if(!member || member.role==='manager' || !['all','site_a','site_b'].includes(zone ?? '') || !['auto','repair','clean','research'].includes(preference ?? '')) return false;
    if(zone!=='all' && !this.plots.some(p=>p.id===zone && p.unlocked)) return false;
    if(member.role==='cleaner' && preference!=='auto' && preference!=='clean' || preference==='research' && member.role!=='engineer') return false;
    member.workZone=zone; member.preference=preference;
    this.message='Crew assignment updated. Current jobs finish before the new assignment applies.';
    this.autoDispatch(); return true;
  }

  cancelWorkOrder(targetId:string,kind:WorkKind): boolean {
    const index=this.workOrders.findIndex(o=>o.targetId===targetId && o.kind===kind && o.manual);
    if(index<0) return false;
    this.workOrders.splice(index,1); this.message='Queued manual order cancelled. Automatic orders follow their policy.'; return true;
  }

  setCleaningThreshold(value: number): boolean {
    if(!this.capabilities.includes('scheduled_cleaning') || ![.2,.35,.5].includes(value)) return false;
    this.cleaningThreshold=value; this.message='Cleaning policy updated.'; return true;
  }

  setPreventiveMaintenance(enabled: boolean): boolean {
    if(!this.researched.includes('predictive_diagnostics')) return false;
    this.preventiveMaintenance=enabled; this.message=enabled ? 'Preventive service enabled below 85% condition; $450 per job, with a $1,500 reserve.' : 'Preventive service disabled.'; return true;
  }

  contractBlockedReason(id: ContractId): string | null {
    if(!Object.prototype.hasOwnProperty.call(CONTRACTS,id)) return 'Unknown contract';
    if(this.contract) return 'Finish or cancel the current contract';
    if(this.contractCooldown>0) return 'New offers arrive after the renewal break';
    if(!this.objectives.some(o=>o.id==='first_power' && o.complete)) return 'Build and export your first power';
    if(id==='grid' && !this.capabilities.includes('radio_dispatch')) return 'Complete the first repair';
    if(id==='valley' && (!this.equipment.some(e=>e.plotId==='site_b' && isPv(e.kind) && e.commissioned) || !this.researched.length)) return 'Commission Site B solar and finish one research project';
    if(this.cash<CONTRACTS[id].deposit) return 'Not enough cash for the deposit';
    return null;
  }

  acceptContract(id: ContractId): boolean {
    const reason=this.contractBlockedReason(id);
    if(reason) { this.message=reason; return false; }
    const offer=contractOffer(id,this.contractRenewals);
    this.cash-=offer.deposit; this.totalExpenses+=offer.deposit; this.currentReport.expenses+=offer.deposit;
    this.contract={...offer,deliveredKwh:0,elapsedHours:0};
    this.message='Supply contract accepted. Ordinary electricity sales continue; delivery earns an extra bonus.';
    return true;
  }

  cancelContract(): void { if(this.contract) this.finishContract('cancelled'); }

  private finishContract(outcome: ContractResult['outcome']): void {
    const contract=this.contract!;
    const payment=outcome==='completed' ? contract.reward+contract.deposit : 0;
    this.cash+=payment; this.currentReport.bonuses+=payment;
    if(outcome==='completed') { this.contractsCompleted++; this.contractRenewals++; }
    this.contractHistory.push({id:contract.id,title:contract.title,outcome,day:this.day,reward:outcome==='completed'?contract.reward:0});
    this.contractHistory=this.contractHistory.slice(-6);
    this.contractCooldown=12; this.contract=null;
    this.message=outcome==='completed' ? `Contract complete: +$${contract.reward.toLocaleString()} bonus; deposit returned.` : `Contract ${outcome}. No further penalty; the deposit is forfeited. New offers in 12 park hours.`;
  }

  private advanceContract(hours: number, energy: number): void {
    this.contractCooldown=Math.max(0,this.contractCooldown-hours);
    if(!this.contract) return;
    const metrics=parkMetrics(this.equipment), contract=this.contract;
    contract.elapsedHours+=hours;
    if(metrics.availability+1e-8>=contract.minimumAvailability && metrics.condition+1e-8>=contract.minimumCondition) contract.deliveredKwh+=energy;
    if(contract.deliveredKwh+1e-8>=contract.energyKwh) this.finishContract('completed');
    else if(contract.elapsedHours+1e-8>=contract.hours) this.finishContract('expired');
  }

  resolveEventChoice(choiceId: string): void {
    if (!this.activeEvent) return;
    const eventId = this.activeEvent.id;
    if (!this.activeEvent.choices.some((choice) => choice.id === choiceId)) return;
    const costs: Record<string, number> = { community_meeting_sponsor: 2000, grid_curtailment_upgrade_talk: 3000, temp_worker_hire: 4000, insurance_upsell_buy: 6000, hail_warning_prepare: 2500 };
    if (this.cash < (costs[eventId + '_' + choiceId] ?? 0)) {
      this.message = 'Not enough cash for this choice. Choose the free option.';
      return;
    }
    this.activeEvent = null;
    this.nextNarrativeAt = this.eventClock + 8;
    this.speed = this.speedBeforeEvent;

    switch (eventId) {
      case 'green_growth_grant':
        if (choiceId === 'training') {
          this.cash += 4000;
          for (const member of this.staff) member.skill = Math.min(5, (member.skill ?? 1) + 0.5);
          this.message = 'Grant approved: $4,000 plus team training. Even the forms were friendly.';
        } else {
          this.cash += 7500;
          this.message = 'Green Growth Grant received: +$7,500 for expansion.';
        }
        break;
      case 'community_meeting':
        if (choiceId === 'sponsor') {
          this.cash -= 2000;
          this.message = 'Tea secured. Goats remain unimpressed but peaceful.';
        } else {
          this.curtailmentFactor = 0.9; this.curtailmentTimer = 12;
          this.message = 'Public tour arranged: export reduced 10% for 12 hours while the crew hosts.';
        }
        break;
      case 'bargain_batch':
        if (choiceId === 'buy') {
          this.cash += 2500;
          const trial = this.equipment.find((e) => e.kind === 'bargain_pv' && e.commissioned);
          if (trial) trial.condition = Math.max(0.25, trial.condition - 0.08);
          this.message = 'Supplier trial earns $2,500, but the oldest bargain array loses 8% condition.';
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
          this.cash += 2500;
          this.curtailmentFactor = 0.7; this.curtailmentTimer = 8;
          this.message = 'Sponsorship nets $2,500. Drone safety restricts export 30% for 8 hours.';
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
        this.weather = 'hail';
        this.weatherTimer = 0;
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
      const hit = base * (1.15 - reliability) * (this.researched.includes('storm_hardening') ? .75 : 1);
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
    const index=this.pendingEventQueue.findIndex(id => (this.eventDelays[id] ?? 0)<=this.eventClock && (id==='hail_warning' || id==='hail_climax' || this.eventClock>=this.nextNarrativeAt));
    if(index<0) return;
    const [next]=this.pendingEventQueue.splice(index,1);
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
      this.dailyReports.push({...this.currentReport});
      this.dailyReports=this.dailyReports.slice(-5);
      this.currentReport={day:this.day,energyKwh:0,revenue:0,expenses:0,bonuses:0,jobs:0};
    }
    this.eventClock += 1 / 60;
    this.weatherTimer += 1 / 60;
    if (this.curtailmentTimer > 0) {
      this.curtailmentTimer -= 1 / 60;
      if (this.curtailmentTimer <= 0) this.curtailmentFactor = 1;
    }

    this.advanceResearch(1 / 60);
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

  /** Work from the front service edge of the footprint, never hidden under a rack. */
  private workPosition(eq: PlacedEquipment): Vec2 {
    const footprint = EQUIPMENT[eq.kind].footprint;
    return { x:eq.tile.x+(footprint.x-1)/2, y:eq.tile.y+footprint.y-.65 };
  }

  private advanceStaff(hours: number): void {
    for(const member of this.staff) {
      member.energy ??= 1;
      if(member.task.type==='idle') {
        const hub=this.equipment.some(e=>(e.kind==='office' || e.kind==='workshop') && e.commissioned && e.plotId===member.plotId);
        member.energy=clamp(member.energy+hours*(hub?.3:.2),0,1);
        if(member.onBreak && member.energy>=.65) member.onBreak=false;
        if((member.trainingHoursLeft ?? 0)>0) {
          member.trainingHoursLeft=Math.max(0,member.trainingHoursLeft!-hours);
          if(member.trainingHoursLeft<1e-8) { member.trainingHoursLeft=0; member.skill=Math.min(5,(member.skill ?? 1)+1); this.message=member.name+' completed training. Field work is faster.'; }
        }
        continue;
      }
      const task=member.task, target=this.equipment.find(e=>e.id===task.targetId);
      if(!target) { member.task={type:'idle'}; continue; }
      member.energy=clamp(member.energy-hours*(task.type==='travel'?.04:.12),0,1);
      const specialist=task.type==='clean' && member.role==='cleaner' ? 1.4 : (task.type==='repair' || task.type==='service') && member.role==='engineer' ? 1.2 : 1;
      const workRate=(1+((member.skill ?? 1)-1)*.2+(this.staff.some(m=>m.role==='manager')?.2:0))*(this.researched.includes('field_toolkits')?1.2:1)*specialist*(member.energy<.2?.8:1);
      if(task.type==='travel') {
        const tagged=member as StaffMember & {_intent?: WorkKind};
        const intent=task.intent ?? tagged._intent ?? (target.faulted?'repair':'clean');
        task.duration ??= travelHours({...member,tile:task.from},target,this.equipment);
        task.progress+=hours*(this.researched.includes('crew_logistics')?1.25:1)/task.duration;
        member.tile=alongPath(roadRoute(task.from,this.workPosition(target),this.equipment),Math.min(1,task.progress)); member.plotId=target.plotId;
        if(task.progress>=1) {
          member.tile=this.workPosition(target); delete tagged._intent;
          if(intent==='repair' && !target.faulted || intent==='clean' && target.soiling<.15 || intent==='service' && target.condition>=.95) member.task={type:'idle'};
          else member.task={type:intent,targetId:target.id,progress:0};
        }
        continue;
      }
      const duration=task.type==='clean' ? (this.capabilities.includes('cleaning_kit')?.25:.45) : task.type==='service' ? .8 : nearbyWorkshop(this.equipment,target) ? .33 : .5;
      task.progress+=hours*workRate*(task.type==='clean' && member.trait==='Panel Whisperer'?1.15:1)/duration;
      if(task.progress<1) continue;
      this.currentReport.jobs++;
      if(task.type==='repair' && target.faulted) {
        target.faulted=false; target.condition=clamp(target.condition+.15,0,1); this.faultsRepaired++;
        if(!this.capabilities.includes('radio_dispatch')) {
          this.manualRepairs++; this.cash+=2000; this.currentReport.bonuses+=2000;
          this.completeObjective('first_repair'); this.capabilities.push('radio_dispatch'); this.completeObjective('unlock_radio');
          const dusty=this.equipment.find(e=>isPv(e.kind) && e.commissioned && !e.faulted);
          if(dusty) dusty.soiling=Math.max(.22,dusty.soiling);
          this.activateObjective('first_clean'); this.message='Radio Dispatch earned. Dust is now costing power: queue your first clean.';
        }
      } else if(task.type==='clean') {
        target.soiling=0; this.cleansCompleted++;
        if(!this.capabilities.includes('cleaning_kit')) {
          this.manualCleans++; this.cash+=2000; this.currentReport.bonuses+=2000;
          this.completeObjective('first_clean'); this.capabilities.push('cleaning_kit'); this.completeObjective('unlock_cleaning');
          this.message='Cleaning Kit earned: faster cleaning and slower dust. Plan your expansion.';
        }
        if(this.capabilities.includes('cleaning_rig')) for(const nearby of this.equipment) if(isPv(nearby.kind) && nearby.plotId===target.plotId && Math.hypot(nearby.tile.x-target.tile.x,nearby.tile.y-target.tile.y)<=4) nearby.soiling=0;
      } else if(task.type==='service') { target.condition=1; this.servicesCompleted++; this.message='Service complete. Equipment condition restored to 100%.'; }
      member.skill=Math.min(5,(member.skill ?? 1)+.04); member.task={type:'idle'};
      if(member.energy<.2) member.onBreak=true;
    }
  }

  private updateWeather(): void {
    if (this.weather === 'hail') {
      if (this.weatherTimer < 2) return;
      this.weather = 'partly_cloudy'; this.weatherTimer = 0; return;
    }
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
    const opex = this.equipment.filter((e) => isPv(e.kind) && e.commissioned).length * 0.12 * (this.researched.includes('efficient_operations') ? .7 : 1);
    const expense = Math.min(this.cash + revenue, (payroll + opex) * hours);
    this.cash += revenue - expense;
    this.totalExpenses += expense;
    this.currentReport.energyKwh+=energy; this.currentReport.revenue+=revenue; this.currentReport.expenses+=expense;
    this.advanceContract(hours,energy);
    const metrics=parkMetrics(this.equipment);
    if(this.stars>=1 && this.getIrradiance()>0 && metrics.availability>=.9 && metrics.cleanliness>=.75 && this.curtailmentFactor>=.85 && exportedKw>1) this.stabilityHours=Math.min(12,this.stabilityHours+hours);
    else if(this.getIrradiance()>0) this.stabilityHours=0;
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
      const chance = (1 - reliability) * 0.08 * (this.researched.includes('predictive_diagnostics') ? .75 : 1) * (this.capabilities.includes('remote_monitoring') ? 0.5 : 1) * (this.staff.some((s) => s.role === 'engineer') ? 0.7 : 1);
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
    const rate = (kit ? 0.012 : 0.02) * (this.researched.includes('dust_coating') ? .8 : 1);
    for (const eq of this.equipment) {
      if (!isPv(eq.kind) || !eq.commissioned) continue;
      eq.soiling = clamp(eq.soiling + rate * (this.weather === 'rain' ? 0.3 : 1), 0, 1);
      if (eq.soiling > 0.35) this.activateObjective('first_clean');
    }
  }

  private autoDispatch(): void {
    const busy=new Set(this.staff.flatMap(m=>m.task.type==='idle'?[]:[m.task.targetId]));
    const has=(id:string,kind:WorkKind)=>this.workOrders.some(o=>o.targetId===id && o.kind===kind) || this.staff.some(m=>m.task.type!=='idle' && m.task.targetId===id && (m.task.type===kind || m.task.type==='travel' && m.task.intent===kind));
    for(const target of this.equipment) {
      if(!target.commissioned) continue;
      if(target.faulted && this.capabilities.includes('radio_dispatch') && !has(target.id,'repair')) this.workOrders.push({targetId:target.id,kind:'repair',manual:false});
      if(isPv(target.kind) && target.soiling>=this.cleaningThreshold && this.capabilities.includes('scheduled_cleaning') && !has(target.id,'clean')) this.workOrders.push({targetId:target.id,kind:'clean',manual:false});
      if(isPv(target.kind) && !target.faulted && target.condition<.85 && this.preventiveMaintenance && this.researched.includes('predictive_diagnostics') && this.cash>=1950 && !has(target.id,'service')) this.workOrders.push({targetId:target.id,kind:'service',manual:false});
    }
    this.workOrders=this.workOrders.filter(o=>{
      const target=this.equipment.find(e=>e.id===o.targetId);
      return target && target.commissioned && (o.kind==='repair'?target.faulted:o.kind==='clean'?isPv(target.kind) && target.soiling>=.15:target.condition<.95);
    }).slice(0,500);
    for(const member of [...this.staff].sort((a,b)=>(a.role==='cleaner'?-1:0)-(b.role==='cleaner'?-1:0))) {
      if(member.task.type!=='idle' || member.role==='manager') continue;
      if((member.energy ?? 1)<.2) member.onBreak=true;
      const eligible=this.workOrders.filter(o=>{
        const target=this.equipment.find(e=>e.id===o.targetId)!;
        return !busy.has(target.id) && workerCanDo(member,o,target) && (o.kind!=='service' || !target.faulted && this.cash>=(o.manual?450:1950));
      });
      const order=eligible.sort((a,b)=> (a.kind==='repair'?0:a.manual?1:2)-(b.kind==='repair'?0:b.manual?1:2) || travelHours(member,this.equipment.find(e=>e.id===a.targetId)!,this.equipment)-travelHours(member,this.equipment.find(e=>e.id===b.targetId)!,this.equipment))[0];
      if(!order) continue;
      const target=this.equipment.find(e=>e.id===order.targetId)!;
      if(order.kind==='service') { this.cash-=450; this.totalExpenses+=450; this.currentReport.expenses+=450; }
      member.task={type:'travel',targetId:target.id,progress:0,from:{...member.tile},intent:order.kind,duration:travelHours(member,target,this.equipment)};
      this.workOrders.splice(this.workOrders.indexOf(order),1); busy.add(target.id);
    }
  }

  private scheduleNarrativeEvents(): void {
    const pvCount = this.equipment.filter((e) => isPv(e.kind) && e.commissioned).length;
    if (pvCount >= 2 && !this.triggeredEvents.includes('community_meeting')) {
      this.enqueueEvent('community_meeting');
    }
    if (
      this.objectives.find((o) => o.id === 'first_power')?.complete &&
      this.eventClock >= 4 &&
      !this.triggeredEvents.includes('green_growth_grant') &&
      !this.pendingEventQueue.includes('green_growth_grant')
    ) {
      this.enqueueEvent('green_growth_grant');
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
      if (!this.objectives.find((o) => o.id === 'expand_site_b')?.complete) this.cash += 5000;
      this.completeObjective('expand_site_b');
    }

    if (
      this.peakExportKw >= STAR_THRESHOLDS.star1PeakKw &&
      this.lifetimeRevenue >= STAR_THRESHOLDS.star1Revenue &&
      this.hailSurvived && this.manualRepairs > 0 && this.manualCleans > 0 &&
      this.objectives.find((o) => o.id === 'expand_site_b')?.complete
    ) {
      if (this.stars < 1) this.cash += 12000;
      this.completeObjective('star_1');
      this.stars = Math.max(this.stars, 1) as 0 | 1 | 2 | 3;
      this.scenarioComplete = true;
    }

    const siteBPv = this.equipment.some((e) => e.plotId === 'site_b' && isPv(e.kind) && e.commissioned);
    if (
      this.stars >= 1 && siteBPv &&
      this.capabilities.includes('radio_dispatch') && this.stabilityHours+1e-8>=6 &&
      this.peakExportKw >= STAR_THRESHOLDS.star2PeakKw
    ) {
      if (this.stars < 2) this.cash += 12000;
      this.completeObjective('star_2');
      this.stars = Math.max(this.stars, 2) as 0 | 1 | 2 | 3;
    }

    if (
      this.stars >= 2 && this.hailSurvived &&
      parkMetrics(this.equipment).condition>=.85 && this.stabilityHours+1e-8>=12 &&
      this.researched.length>=2 && this.staff.some(m=>(m.skill ?? 1)>=2) &&
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
      trait: traits[role], plotId: 'site_a', tile: { x: 6, y: 7 }, task: { type: 'idle' }, energy:1, onBreak:false, workZone:'all', preference:'auto' });
    this.message = names[role] + ' joined the team.';
    return true;
  }

  dismissStaff(id: string): boolean {
    const member = this.staff.find((s) => s.id === id);
    if (!member) return false;
    if (this.staff.length <= 1 || (member.role==='technician' || member.role==='engineer') && !this.staff.some(m=>m.id!==id && (m.role==='technician' || m.role==='engineer'))) {
      this.message = 'Keep at least one technician or engineer so the company can repair equipment.';
      return false;
    }
    this.staff = this.staff.filter((s) => s.id !== id);
    if (this.selectedId === id) this.selectedId = null;
    this.message = member.name + ' left the company. You can hire a replacement at any time.';
    return true;
  }

  grantPlaytestCash(amount = 25_000): boolean {
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000) return false;
    this.cash += amount;
    this.message = 'Playtest funding: +$' + Math.round(amount).toLocaleString('en-US') + '.';
    return true;
  }

  triggerPlaytestGrant(): boolean {
    if (this.activeEvent) {
      this.message = 'Resolve the current event first.';
      return false;
    }
    if (this.triggeredEvents.includes('green_growth_grant')) {
      this.cash += 7500;
      this.message = 'Playtest repeat grant: +$7,500.';
      return true;
    }
    this.openEvent('green_growth_grant');
    return true;
  }

  trainStaff(id: string): boolean {
    const member = this.staff.find((s) => s.id === id);
    if (!member || (member.skill ?? 1) >= 5 || (member.trainingHoursLeft ?? 0)>0 || this.cash < 800) return false;
    this.cash -= 800; member.trainingHoursLeft=4;
    this.message = member.name + ' booked four park hours of training. Current field work finishes first.';
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
    this.workOrders=this.workOrders.filter(o=>o.targetId!==id);
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
      contract:this.contract ? {...this.contract} : null, contractHistory:this.contractHistory.map(c=>({...c})),
      contractRenewals:this.contractRenewals, contractCooldown:this.contractCooldown, contractsCompleted:this.contractsCompleted,
      workOrders:this.workOrders.map(o=>({...o})), cleaningThreshold:this.cleaningThreshold, preventiveMaintenance:this.preventiveMaintenance,
      stabilityHours:this.stabilityHours, servicesCompleted:this.servicesCompleted,
      dailyReports:this.dailyReports.map(r=>({...r})), currentReport:{...this.currentReport}, nextNarrativeAt:this.nextNarrativeAt,
      researched: [...this.researched],
      activeResearch: this.activeResearch ? { ...this.activeResearch } : null,
      cash: this.cash,
      revenuePerHour: this.revenuePerHour,
      powerKw: generationKw,
      exportedKw,
      peakExportKw:this.peakExportKw, lifetimeRevenue:this.lifetimeRevenue, eventClock:this.eventClock,
      inverterCapacityKw: this.inverterCapacity(),
      clippedKw: Math.max(0, generationKw - this.inverterCapacity()),
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
      completionAcknowledged: this.completionAcknowledged,
    };
  }

  serialize(): SerializedGameState {
    return {
      contract:this.contract ? {...this.contract} : null, contractHistory:this.contractHistory.map(c=>({...c})),
      contractRenewals:this.contractRenewals, contractCooldown:this.contractCooldown, contractsCompleted:this.contractsCompleted,
      workOrders:this.workOrders.map(o=>({...o})), cleaningThreshold:this.cleaningThreshold, preventiveMaintenance:this.preventiveMaintenance,
      stabilityHours:this.stabilityHours, servicesCompleted:this.servicesCompleted,
      dailyReports:this.dailyReports.map(r=>({...r})), currentReport:{...this.currentReport}, nextNarrativeAt:this.nextNarrativeAt,
      researched: [...this.researched],
      activeResearch: this.activeResearch ? { ...this.activeResearch } : null,
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
      completionAcknowledged: this.completionAcknowledged,
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
    this.researched = []; this.activeResearch = null;
    this.contract=null; this.contractHistory=[]; this.contractRenewals=0; this.contractCooldown=0; this.contractsCompleted=0;
    this.workOrders=[]; this.cleaningThreshold=.35; this.preventiveMaintenance=false; this.stabilityHours=0; this.servicesCompleted=0; this.nextNarrativeAt=0;
    this.dailyReports=[]; this.currentReport={day:data.day,energyKwh:0,revenue:0,expenses:0,bonuses:0,jobs:0};
    this.completionAcknowledged = data.scenarioComplete;
    Object.assign(this, copy);
    this.objectives=createInitialObjectives().map(def=>({...def,complete:data.objectives.find(o=>o.id===def.id)?.complete ?? false,active:data.objectives.find(o=>o.id===def.id)?.active ?? false}));
    for(const member of this.staff) { member.energy ??= 1; member.onBreak ??= false; member.workZone ??= 'all'; member.preference ??= 'auto'; }
    // Apply current balance tuning to older playtest saves instead of preserving the slower legacy tariff.
    this.tariffPerKwh = Math.max(this.tariffPerKwh, TARIFF_PER_KWH);
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
