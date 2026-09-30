/** Shared simulation types for Megawatt Valley: Solar Level 1. */

export type EquipmentKind = 'bargain_pv' | 'premium_pv' | 'inverter' | 'office' | 'substation';

export type PlotId = 'site_a' | 'site_b';

export type WeatherKind = 'clear' | 'partly_cloudy' | 'overcast' | 'rain' | 'hail';

export type StaffTask =
  | { type: 'idle' }
  | { type: 'travel'; targetId: string; progress: number; from: Vec2 }
  | { type: 'repair'; targetId: string; progress: number }
  | { type: 'clean'; targetId: string; progress: number };

export type CapabilityId =
  | 'radio_dispatch'
  | 'cleaning_kit'
  | 'remote_monitoring'
  | 'cleaning_rig';

export type ObjectiveId =
  | 'first_power'
  | 'choose_equipment'
  | 'first_repair'
  | 'unlock_radio'
  | 'first_clean'
  | 'unlock_cleaning'
  | 'choose_improve'
  | 'unlock_site_b'
  | 'expand_site_b'
  | 'survive_hail'
  | 'star_1'
  | 'star_2'
  | 'star_3';

export type EventId =
  | 'community_meeting'
  | 'bargain_batch'
  | 'grid_curtailment'
  | 'temp_worker'
  | 'insurance_upsell'
  | 'influencer_visit'
  | 'capability_choice'
  | 'growing_pains'
  | 'hail_warning'
  | 'hail_climax';

export interface Vec2 {
  x: number;
  y: number;
}

export interface EquipmentDef {
  id: EquipmentKind;
  name: string;
  description: string;
  cost: number;
  footprint: Vec2;
  /** Nameplate kW for PV; capacity for inverter. */
  nameplateKw: number;
  reliability: number;
  efficiency: number;
  buildable: boolean;
  category: 'generation' | 'electrical' | 'building';
}

export interface PlacedEquipment {
  id: string;
  kind: EquipmentKind;
  plotId: PlotId;
  tile: Vec2;
  /** 0..1 health. */
  condition: number;
  /** 0..1 soiling on PV. */
  soiling: number;
  faulted: boolean;
  commissioned: boolean;
  constructionProgress: number;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'technician';
  plotId: PlotId;
  tile: Vec2;
  task: StaffTask;
  /** Transient travel intent — also persisted for save safety. */
  intent?: 'clean' | 'repair';
}

export interface PlotState {
  id: PlotId;
  name: string;
  unlocked: boolean;
  origin: Vec2;
  size: Vec2;
  /** Irradiance multiplier. */
  solarResource: number;
  gridConnected: boolean;
  /** Export capacity multiplier (Site B weaker grid). */
  exportFactor: number;
}

export interface ObjectiveState {
  id: ObjectiveId;
  title: string;
  description: string;
  complete: boolean;
  active: boolean;
  rewardText?: string;
}

export interface EventChoice {
  id: string;
  label: string;
  description: string;
}

export interface ActiveEvent {
  id: EventId;
  title: string;
  body: string;
  choices: EventChoice[];
  paused: boolean;
}

export interface GameSnapshot {
  cash: number;
  revenuePerHour: number;
  powerKw: number;
  exportedKw: number;
  day: number;
  hour: number;
  speed: 0 | 1 | 2 | 4;
  weather: WeatherKind;
  irradiance: number;
  tariffPerKwh: number;
  plots: PlotState[];
  equipment: PlacedEquipment[];
  staff: StaffMember[];
  capabilities: CapabilityId[];
  objectives: ObjectiveState[];
  stars: 0 | 1 | 2 | 3;
  activeEvent: ActiveEvent | null;
  selectedId: string | null;
  buildMode: EquipmentKind | null;
  message: string | null;
  hailPrepared: boolean;
  totalEnergyKwh: number;
  faultsRepaired: number;
  cleansCompleted: number;
  scenarioComplete: boolean;
  onboardingStep: number;
  pendingCapabilityChoice: boolean;
  bargainDiscountCharges: number;
}

export interface SaveData {
  version: number;
  savedAt: string;
  state: SerializedGameState;
}

export interface SerializedGameState {
  cash: number;
  day: number;
  hour: number;
  speed: 0 | 1 | 2 | 4;
  weather: WeatherKind;
  weatherTimer: number;
  tariffPerKwh: number;
  plots: PlotState[];
  equipment: PlacedEquipment[];
  staff: StaffMember[];
  capabilities: CapabilityId[];
  objectives: ObjectiveState[];
  stars: 0 | 1 | 2 | 3;
  nextEntityId: number;
  triggeredEvents: EventId[];
  pendingEventQueue: EventId[];
  eventDelays: Partial<Record<EventId, number>>;
  eventClock: number;
  activeEvent: ActiveEvent | null;
  selectedId: string | null;
  buildMode: EquipmentKind | null;
  message: string | null;
  hailPrepared: boolean;
  hailSurvived: boolean;
  hailHoldHours: number;
  totalEnergyKwh: number;
  faultsRepaired: number;
  cleansCompleted: number;
  scenarioComplete: boolean;
  tickAccumulator: number;
  nextFaultCheck: number;
  nextSoilTick: number;
  revenuePerHour: number;
  lifetimeRevenue: number;
  peakExportKw: number;
  scriptedFirstFault: boolean;
  firstPowerHoldHours: number;
  curtailmentFactor: number;
  curtailmentTimer: number;
  onboardingStep: number;
  pendingCapabilityChoice: boolean;
  bargainDiscountCharges: number;
  playerPlacedPv: boolean;
  staffBusyHours: number;
  tariffBonus: number;
}
