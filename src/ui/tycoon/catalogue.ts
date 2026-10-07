import type {EquipmentKind} from '../../simulation/types';
export const CATALOGUE:Record<EquipmentKind,{name:string;group:string;purpose:string;tradeoff:string}>={
  bargain_pv:{name:'Bargain solar',group:'power',purpose:'Generate 40 kW of nameplate capacity.',tradeoff:'Lower price. More faults and lower efficiency.'},
  premium_pv:{name:'Premium solar',group:'power',purpose:'Generate 50 kW with higher efficiency.',tradeoff:'Higher cost. Better reliability and hail resistance.'},
  inverter:{name:'Inverter station',group:'power',purpose:'Add 200 kW of export headroom.',tradeoff:'Buy when the grid limit clips your generation.'},
  workshop:{name:'Maintenance workshop',group:'service',purpose:'Repairs finish one third sooner within 8 tiles.',tradeoff:'Also improves crew recovery on this site.'},
  road:{name:'Service road',group:'service',purpose:'Connected roads cut nearby crew travel time by 25%.',tradeoff:'Drag to plan. Connect to the access road; isolated tiles give no bonus.'},
  tree:{name:'Valley tree',group:'landscape',purpose:'Landscaping. Make the site your own.',tradeoff:'Decorative only; no hidden productivity bonus.'},
  fence:{name:'Fence',group:'landscape',purpose:'Mark out yards. Nearby fence tiles join into straight runs and corners.',tradeoff:'Decorative only in this scenario; does not provide security.'},
  gate:{name:'Gate',group:'landscape',purpose:'An open entrance that aligns with neighbouring fence tiles.',tradeoff:'Decorative only. Leave staff routes open.'},
  sign:{name:'Safety-ish sign',group:'landscape',purpose:'A little company personality.',tradeoff:'Decorative only. Coffee remains compulsory.'},
  office:{name:'Operations office',group:'service',purpose:'Your company headquarters and crew base.',tradeoff:'Permanent starter building.'},
  substation:{name:'Grid connection',group:'power',purpose:'Exports the electricity your arrays generate.',tradeoff:'The starter link has 100 kW headroom; add inverters to expand.'},
};
