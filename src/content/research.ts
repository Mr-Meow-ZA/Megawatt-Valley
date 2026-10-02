/** Every node in this tree has a working simulation effect. Durations use park hours. */
export const RESEARCH = {
  precision_wiring: { name: 'Precision wiring', branch: 'generation', cost: 2000, hours: 6, prerequisite: null, gate: 'power', effect: '+8% output from every solar array.', description: 'Reduce avoidable losses between the cells and the grid.' },
  smart_inverters: { name: 'Smart inverters', branch: 'generation', cost: 3500, hours: 10, prerequisite: 'precision_wiring', gate: 'power', effect: '+20% inverter capacity, including the starter connection.', description: 'Use spare electrical headroom before buying another inverter.' },
  advanced_cells: { name: 'Advanced cells', branch: 'generation', cost: 6000, hours: 18, prerequisite: 'smart_inverters', gate: 'expansion', effect: '+12% premium array output, on top of precision wiring.', description: 'Make high-efficiency equipment a stronger investment.' },
  field_toolkits: { name: 'Field toolkits', branch: 'operations', cost: 1800, hours: 6, prerequisite: null, gate: 'repair', effect: '+20% repair and cleaning work speed.', description: 'A well-packed tool bag saves a surprising number of trips.' },
  crew_logistics: { name: 'Crew logistics', branch: 'operations', cost: 3000, hours: 10, prerequisite: 'field_toolkits', gate: 'repair', effect: '+25% staff travel speed.', description: 'Plan service routes and get people to the work sooner.' },
  efficient_operations: { name: 'Lean operations', branch: 'operations', cost: 4500, hours: 16, prerequisite: 'crew_logistics', gate: 'expansion', effect: '−30% solar equipment operating costs. Salaries stay the same.', description: 'Standardise spares and reduce wasted supplies.' },
  dust_coating: { name: 'Dust-resistant coating', branch: 'resilience', cost: 1800, hours: 6, prerequisite: null, gate: 'clean', effect: '−20% dust accumulation.', description: 'Keep more sunlight reaching the cells between cleaning visits.' },
  predictive_diagnostics: { name: 'Predictive diagnostics', branch: 'resilience', cost: 3500, hours: 12, prerequisite: 'dust_coating', gate: 'clean', effect: '−25% routine fault probability.', description: 'Catch emerging problems. The first repair lesson still happens.' },
  storm_hardening: { name: 'Storm hardening', branch: 'resilience', cost: 4500, hours: 16, prerequisite: 'predictive_diagnostics', gate: 'expansion', effect: '−25% hail condition damage. Storm preparation still matters.', description: 'Reinforce mounts and protect exposed components.' },
} as const;

export type ResearchId = keyof typeof RESEARCH;
export interface ResearchProject { id: ResearchId; progress: number }
export const RESEARCH_BRANCHES = [
  { id: 'generation', name: 'Generation', subtitle: 'Make every ray count', icon: '☀' },
  { id: 'operations', name: 'Operations', subtitle: 'Give your team better tools', icon: '⚒' },
  { id: 'resilience', name: 'Resilience', subtitle: 'Build a park that lasts', icon: '◆' },
] as const;
