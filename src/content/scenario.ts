import type { CapabilityId, ObjectiveId, ObjectiveState, PlotState } from '../simulation/types';

export const STARTING_CASH = 50_000;
// Gameplay tariff is intentionally boosted for tycoon pacing.
export const TARIFF_PER_KWH = 0.45;
export const SAVE_VERSION = 1;
export const SAVE_KEY = 'megawatt-valley-solar-v1';

/** Simulation minutes per real second at speed 1. */
export const SIM_MINUTES_PER_REAL_SECOND = 12;

export const CAPABILITY_INFO: Record<
  CapabilityId,
  { name: string; description: string }
> = {
  cleaning_rig: { name: 'Mobile Cleaning Rig', description: 'Group cleaning: also cleans adjacent arrays. First expansion upgrade free; second $4,000.' },
  remote_monitoring: { name: 'Remote Monitoring', description: 'Inspections halve random fault risk. First expansion upgrade free; second $4,000.' },
  scheduled_cleaning: { name: 'Scheduled Cleaning', description: 'Automatically sends staff above 35% soiling. Requires Cleaning Rig; $3,000.' },
  radio_dispatch: {
    name: 'Radio Dispatch',
    description: 'Technicians auto-respond to routine faults.',
  },
  cleaning_kit: {
    name: 'Cleaning Kit',
    description: 'Faster cleaning and slower soiling build-up.',
  },
};

export function createInitialPlots(): PlotState[] {
  return [
    {
      id: 'site_a',
      name: 'Site A — Sunny Meadow',
      unlocked: true,
      origin: { x: 4, y: 4 },
      size: { x: 14, y: 12 },
      solarResource: 1,
      gridConnected: true,
    },
    {
      id: 'site_b',
      name: 'Site B — River Bench',
      unlocked: false,
      origin: { x: 22, y: 6 },
      size: { x: 12, y: 10 },
      solarResource: 0.95,
      gridConnected: true,
    },
  ];
}

export function createInitialObjectives(): ObjectiveState[] {
  const defs: Array<Omit<ObjectiveState, 'complete' | 'active'> & { active?: boolean }> = [
    {
      id: 'first_power',
      title: 'First Power',
      description: 'Place a PV array and export your first electricity.',
      rewardText: 'Prove the site works',
      active: true,
    },
    {
      id: 'choose_equipment',
      title: 'Cheap or Good?',
      description: 'Own at least one Bargain and one Premium array — or commit to a path with 3 of one type.',
      rewardText: 'Learn procurement trade-offs',
    },
    {
      id: 'first_repair',
      title: 'First Failure',
      description: 'Manually dispatch your technician to repair a fault.',
      rewardText: 'Unlock Radio Dispatch',
    },
    {
      id: 'unlock_radio',
      title: 'Radio Dispatch',
      description: 'Capability unlocked after your first manual repair.',
      rewardText: 'Automation: faults',
    },
    {
      id: 'first_clean',
      title: 'Dust Happens',
      description: 'Clean a soiled PV array.',
      rewardText: 'Unlock Cleaning Kit',
    },
    {
      id: 'unlock_cleaning',
      title: 'Cleaning Kit',
      description: 'Capability unlocked after your first clean.',
      rewardText: 'Faster cleaning',
    },
    {
      id: 'unlock_site_b',
      title: 'Growing Up',
      description: 'Reach 120 kW peak export and hold $5,000 cash.',
      rewardText: 'Unlock Site B',
    },
    {
      id: 'expand_site_b',
      title: 'Second Plot',
      description: 'Commission any PV array on Site B.',
      rewardText: 'Company expands · $5,000 organisation grant',
    },
    {
      id: 'survive_hail',
      title: 'Weather the Storm',
      description: 'Survive the Level 1 hail climax.',
      rewardText: 'Scenario climax cleared',
    },
    {
      id: 'star_1',
      title: '1★ Here Comes the Sun',
      description: 'Export 120 kW peak and earn $3,500 lifetime revenue, repair and clean manually, expand Site B, choose an upgrade, and weather the hail.',
      rewardText: 'Scenario 2 unlocked · $12,000 growth investment',
    },
    {
      id: 'star_2',
      title: '2★ Strong Operator',
      description: 'Own Site B PV, Radio Dispatch, and 220 kW peak.',
      rewardText: 'Mastery · $12,000 growth investment',
    },
    {
      id: 'star_3',
      title: '3★ Valley Pro',
      description: 'Survive hail prepared, hold Cleaning Kit, and 300 kW peak.',
      rewardText: 'Full mastery',
    },
  ];

  return defs.map((d, index) => ({
    id: d.id as ObjectiveId,
    title: d.title,
    description: d.description,
    rewardText: d.rewardText,
    complete: false,
    active: d.active ?? index === 0,
  }));
}

export const STAR_THRESHOLDS = {
  star1PeakKw: 120,
  star1Revenue: 3_500,
  star2PeakKw: 220,
  star3PeakKw: 300,
};
