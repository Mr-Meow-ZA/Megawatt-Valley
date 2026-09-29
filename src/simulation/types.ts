/** Shared simulation types for Megawatt Valley: Solar Level 1. */

export type EquipmentKind = 'bargain_pv' | 'premium_pv' | 'inverter' | 'office' | 'substation';

export type PlotId = 'site_a' | 'site_b';

export type WeatherKind = 'clear' | 'partly_cloudy' | 'overcast' | 'rain' | 'hail';

export type StaffTask =
  | { type: 'idle' }
  | { type: 'travel'; targetId: string; progress: number }
  | { type: 'repair'; targetId: string; progress: number }
  | { type: 'clean'; targetId: string; progress: number };

export type CapabilityId = 'radio_dispatch' | 'cleaning_kit';

export type ObjectiveId =
  | 'first_power'
  | 'choose_equipment'
  | 'first_repair'
  | 'unlock_radio'
  | 'first_clean'
  | 'unlock_cleaning'
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
  revenueLifetimeHour: number;
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
  activeEvent: ActiveEvent | null;
  selectedId: string | null;
  buildMode: EquipmentKind | null;
  message: string | null;
  hailPrepared: boolean;
  hailSurvived: boolean;
  totalEnergyKwh: number;
  faultsRepaired: number;
  cleansCompleted: number;
  scenarioComplete: boolean;
  tickAccumulator: number;
  nextFaultCheck: number;
  nextSoilTick: number;
  revenuePerHour: number;
}
