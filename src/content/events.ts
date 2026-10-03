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
        description: 'Pay $2,000 to keep the crew generating without a public tour interruption.',
      },
      {
        id: 'promise',
        label: 'Promise a public tour',
        description: 'Free, but export falls 10% for 12 simulation hours while the crew hosts.',
      },
    ],
  },
  green_growth_grant: {
    id: 'green_growth_grant',
    title: 'Green Growth Grant',
    body: 'A regional clean-energy fund likes what it sees. For once, the paperwork comes with money attached.',
    choices: [
      {
        id: 'cash',
        label: 'Take the growth grant (+$7,500)',
        description: 'Immediate expansion cash. No strings, apart from one very smug press release.',
      },
      {
        id: 'training',
        label: 'Fund the team (+$4,000 + training)',
        description: 'Receive $4,000 and give every current staff member +0.5 skill.',
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
        label: 'Take the supplier rebate (+$2,500 net)',
        description: 'Net +$2,500 now; supplier trial reduces the oldest bargain array condition by 8%.',
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
        description: 'Grid export −15% for 36 simulation hours; sunlight and generation are unchanged.',
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
        label: 'Host the sponsored shoot (+$2,500 net)',
        description: 'Net +$2,500 now; export reduced 30% for 8 simulation hours for drone safety.',
      },
      {
        id: 'busy',
        label: 'Too busy generating megawatts',
        description: 'No change.',
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
