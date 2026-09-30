import type { EventId } from '../simulation/types';

export interface EventDef {
  id: EventId;
  title: string;
  body: string;
  choices: Array<{ id: string; label: string; description: string }>;
}

export const EVENTS: Record<EventId, EventDef> = {
  community_meeting: {
    id: 'community_meeting',
    title: 'Village Hall Meeting',
    body: 'Locals want reassurance that your shiny rectangles will not scare the goats. How do you handle it?',
    choices: [
      {
        id: 'sponsor',
        label: 'Sponsor tea & biscuits (−$2,000)',
        description: 'Lasting goodwill: +$0.01/kWh tariff for the run.',
      },
      {
        id: 'promise',
        label: 'Promise a public tour',
        description: 'No cash cost, but Tess is busy ~18h (manual dispatch delayed).',
      },
    ],
  },
  bargain_batch: {
    id: 'bargain_batch',
    title: 'Bargain Batch Alert',
    body: 'A pallet of suspiciously shiny panels is going cheap. Your accountant is making eyes at you.',
    choices: [
      {
        id: 'buy',
        label: 'Buy the batch (−$5,000, +cash cushion later)',
        description: 'Immediate discount voucher equivalent.',
      },
      {
        id: 'pass',
        label: 'Pass politely',
        description: 'Keep standards high. No change.',
      },
    ],
  },
  grid_curtailment: {
    id: 'grid_curtailment',
    title: 'Grid Congestion Notice',
    body: 'The DNO hints at afternoon curtailment unless you look cooperative.',
    choices: [
      {
        id: 'accept',
        label: 'Accept temporary curtailment',
        description: 'Irradiance effective −15% for a while.',
      },
      {
        id: 'upgrade_talk',
        label: 'Pay for a chat (−$3,000)',
        description: 'Keep full export, lighter wallet.',
      },
    ],
  },
  temp_worker: {
    id: 'temp_worker',
    title: 'Temp Technician Offer',
    body: 'A cheerful contractor offers a short stint of help. Your permanent tech looks sceptical.',
    choices: [
      {
        id: 'hire',
        label: 'Hire them (−$4,000)',
        description: 'Instantly repair any current fault and clean one array.',
      },
      {
        id: 'decline',
        label: 'We have this',
        description: 'Keep the payroll lean.',
      },
    ],
  },
  insurance_upsell: {
    id: 'insurance_upsell',
    title: 'Hail Insurance Pitch',
    body: 'An agent arrives with charts, a smile, and weather radar anxiety.',
    choices: [
      {
        id: 'buy',
        label: 'Buy cover (−$6,000)',
        description: 'Marks the site as hail-prepared.',
      },
      {
        id: 'decline',
        label: 'Self-insure',
        description: 'Save cash. Hope the sky stays polite.',
      },
    ],
  },
  influencer_visit: {
    id: 'influencer_visit',
    title: 'Sunny Influencer Visit',
    body: 'A renewable-energy creator wants drone footage. Fame is almost free.',
    choices: [
      {
        id: 'host',
        label: 'Host the shoot (−$1,500)',
        description: '+$4,000 sponsorship lands after the edit.',
      },
      {
        id: 'busy',
        label: 'Too busy generating megawatts',
        description: 'No change.',
      },
    ],
  },
  capability_choice: {
    id: 'capability_choice',
    title: 'Choose What to Improve',
    body: 'The ops budget covers one lasting upgrade. Monitoring spots faults earlier; a cleaning rig eats dust for breakfast.',
    choices: [
      {
        id: 'monitor',
        label: 'Remote Monitoring (−$5,000)',
        description: 'Faults hurt less; condition drains slower.',
      },
      {
        id: 'rig',
        label: 'Cleaning Rig (−$5,000)',
        description: 'Auto-cleans heavily soiled arrays.',
      },
    ],
  },
  growing_pains: {
    id: 'growing_pains',
    title: 'Growing Pains',
    body: 'Site B is online and the work queue is stacking. Tess cannot be everywhere.',
    choices: [
      {
        id: 'hire',
        label: 'Hire Pat Amp (−$8,000)',
        description: 'Add a second technician permanently.',
      },
      {
        id: 'stretch',
        label: 'Stretch the roster',
        description: 'Keep one tech. Expect longer queues.',
      },
    ],
  },
  ops_surge: {
    id: 'ops_surge',
    title: 'Ops Surge',
    body: 'Automation is humming — then two sites cough at once. Radio queues only go so far.',
    choices: [
      {
        id: 'prioritise',
        label: 'Prioritise exports',
        description: 'Clear one Site A fault now; Site B waits (extra dirt builds).',
      },
      {
        id: 'split',
        label: 'Split the crew thin',
        description: 'Both sites get attention slowly; staff busy ~10h.',
      },
    ],
  },
  hail_warning: {
    id: 'hail_warning',
    title: 'Severe Weather Warning',
    body: 'Met office: hail cells inbound. Secure loose gear and brace the arrays.',
    choices: [
      {
        id: 'prepare',
        label: 'Prepare the site (−$2,500)',
        description: 'Reduce hail damage if the storm hits.',
      },
      {
        id: 'hope',
        label: 'Ride it out',
        description: 'Save cash. Accept higher risk.',
      },
    ],
  },
  hail_climax: {
    id: 'hail_climax',
    title: 'Hailstorm!',
    body: 'Ice pellets drum the valley. Your earlier choices decide how bruised the farm looks.',
    choices: [
      {
        id: 'endure',
        label: 'Hold the line',
        description: 'Resolve the climax and assess damage.',
      },
    ],
  },
};
