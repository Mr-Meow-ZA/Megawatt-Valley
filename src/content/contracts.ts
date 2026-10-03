export type ContractId = 'school' | 'grid' | 'valley';
export interface SupplyContract {
  id: ContractId;
  title: string;
  description: string;
  energyKwh: number;
  hours: number;
  reward: number;
  deposit: number;
  minimumAvailability: number;
  minimumCondition: number;
}
export interface ContractProgress extends SupplyContract {
  deliveredKwh: number;
  elapsedHours: number;
}
export interface ContractResult {
  id: ContractId;
  title: string;
  outcome: 'completed' | 'expired' | 'cancelled';
  day: number;
  reward: number;
}
export const CONTRACTS: Record<ContractId, SupplyContract> = {
  school: { id:'school', title:'School roof, valley power', description:'Deliver clean energy to the local school. A forgiving first supply challenge.', energyKwh:1600, hours:96, reward:1200, deposit:0, minimumAvailability:0, minimumCondition:0 },
  grid: { id:'grid', title:'Reliable grid partner', description:'Only exports made with at least 90% of solar capacity available count. Maintain the fleet while you deliver.', energyKwh:3200, hours:96, reward:3200, deposit:500, minimumAvailability:.9, minimumCondition:0 },
  valley: { id:'valley', title:'Valley growth partnership', description:'An expanded two-site company must deliver with at least 90% availability and 85% average equipment condition.', energyKwh:6000, hours:120, reward:7200, deposit:1500, minimumAvailability:.9, minimumCondition:.85 },
};

/** Every renewal grows a little with the company; terms are frozen on acceptance. */
export function contractOffer(id: ContractId, renewals: number): SupplyContract {
  const scale = 1 + Math.min(4, renewals) * .15;
  const base = CONTRACTS[id];
  return { ...base, energyKwh:Math.round(base.energyKwh * scale), reward:Math.round(base.reward * scale) };
}
