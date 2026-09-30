import type { CapabilityId, ObjectiveId, ObjectiveState, PlotState } from '../simulation/types';

export const STARTING_CASH = 50_000;
export const TARIFF_PER_KWH = 0.12;
/** Bump when SerializedGameState shape changes. */
export const SAVE_VERSION = 2;
export const SAVE_KEY = 'megawatt-valley-solar-v1';

/** Simulation minutes per real second at speed 1. */
export const SIM_MINUTES_PER_REAL_SECOND = 12;

export const CAPABILITY_INFO: Record<
  CapabilityId,
  { name: string; description: string }
> = {
  radio_dispatch: {
    name: 'Radio Dispatch',
    description: 'Technicians auto-respond to routine faults.',
  },
  cleaning_kit: {
    name: 'Cleaning Kit',
    description: 'Faster cleaning and slower soiling build-up.',
  },
  remote_monitoring: {
    name: 'Remote Monitoring',
    description: 'Faults are spotted earlier; condition drains slower.',
  },
  cleaning_rig: {
    name: 'Cleaning Rig',
    description: 'Auto-cleans heavily soiled arrays without a tech trip.',
  },
};

export function createInitialPlots(): PlotState[] {
  return [
    {
      id: 'site_a',
      name: 'Site A — Sunny Meadow',
      unlocked: true,
      // Slightly larger than the painted fence so iso pick + 2×2 footprints stay valid.
      origin: { x: 3, y: 3 },
      size: { x: 16, y: 14 },
      solarResource: 1,
      gridConnected: true,
      exportFactor: 1,
    },
    {
      id: 'site_b',
      name: 'Site B — River Bench',
      unlocked: false,
      origin: { x: 21, y: 5 },
      size: { x: 14, y: 12 },
      // Weaker sun + congested spur — Growing Up reward with a real constraint.
      solarResource: 0.88,
      gridConnected: true,
      exportFactor: 0.78,
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
      description: 'Manually dispatch your technician to repair a fault (select array + R, or press R).',
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
      description: 'Clean a soiled PV array (select + C, or press C).',
      rewardText: 'Unlock Cleaning Kit',
    },
    {
      id: 'unlock_cleaning',
      title: 'Cleaning Kit',
      description: 'Capability unlocked after your first clean.',
      rewardText: 'Faster cleaning',
    },
    {
      id: 'choose_improve',
      title: 'Choose What to Improve',
      description: 'Pick a lasting upgrade: Remote Monitoring or Cleaning Rig.',
      rewardText: 'Capability fork',
    },
    {
      id: 'unlock_site_b',
      title: 'Growing Up',
      description: 'Reach 120 kW peak export and hold $25,000 cash.',
      rewardText: 'Unlock Site B (weaker grid)',
    },
    {
      id: 'expand_site_b',
      title: 'Second Plot',
      description: 'Commission any PV array on Site B.',
      rewardText: 'Company expands',
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
      description: 'Export 120 kW peak and earn $12,000 lifetime revenue.',
      rewardText: 'Scenario complete — continue for mastery',
    },
    {
      id: 'star_2',
      title: '2★ Strong Operator',
      description: 'Own Site B PV, Radio Dispatch, and 220 kW peak.',
      rewardText: 'Mastery',
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
  star1Revenue: 12_000,
  star2PeakKw: 220,
  star3PeakKw: 300,
};

export const ONBOARDING_STEPS = [
  {
    title: 'Welcome to Site A',
    body: 'You run a tiny solar company. Cash is limited — every array counts. Pan with drag, zoom with the wheel.',
  },
  {
    title: 'Build your first array',
    body: 'Open Build → Bargain or Premium PV, then click a meadow tile inside the Site A fence. Construction takes a short moment.',
  },
  {
    title: 'Export and earn',
    body: 'At midday, power flows through the grid connection and cash ticks up. Fast-forward with ▶▶ when waiting for sun.',
  },
  {
    title: 'When things break',
    body: 'Faults show a red !. Select the array and Dispatch Repair, or press R. Cleaning uses C when dust builds up.',
  },
];
