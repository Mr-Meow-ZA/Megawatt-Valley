import {EQUIPMENT} from '../../content/equipment';
import {RESEARCH} from '../../content/research';
import type {GameSnapshot,EquipmentKind,StaffMember,CapabilityId} from '../../simulation/types';
export type Page='build'|'people'|'research'|'operations'|'company'|'objectives'|'views'|null;
export type SiteView='normal'|'access'|'condition'|'dust'|'power';
export const ROLES={
 technician:{name:'Technician',specialty:'Fault response & field care',description:'Repairs, services and cleans. Your first line of defence against an unhappy inverter.'},
 cleaner:{name:'Cleaner',specialty:'Panel care',description:'Dedicated cleaning keeps light reaching cells and frees repair crews for faults.'},
 engineer:{name:'Engineer',specialty:'Research & reliability',description:'Supports research while idle, reduces routine faults and can work in the field.'},
 manager:{name:'Site manager',specialty:'Team coordination',description:'Improves field productivity. Manages the operation rather than taking repair orders.'}
};
export const PRODUCT:Record<EquipmentKind,{short:string;group:string;tag:string;reason:string;tradeoff:string;fact:string}>={
 bargain_pv:{short:'Sun-ish',group:'solar',tag:'BUDGET FIXED-TILT',reason:'More panels for your first investment.',tradeoff:'Lower output per plot and more routine faults. Best when cash is tight and a technician can keep up.',fact:'A panel’s nameplate rating is measured under standard conditions. Heat, dust and available sunlight change what reaches the grid.'},
 premium_pv:{short:'HelioSure',group:'solar',tag:'PREMIUM FIXED-TILT',reason:'More energy from the same space.',tradeoff:'Costs more upfront. Higher modeled output, fewer routine faults and less hail condition damage.',fact:'Better modules do not remove the need for maintenance. Keeping cells clean and equipment healthy still protects production.'},
 inverter:{short:'String inverter',group:'grid',tag:'GRID CAPACITY',reason:'Give the next solar row room to export.',tradeoff:'Adds 200 kW of headroom; it does not generate electricity. Purchase when export capacity limits your plant.',fact:'Solar produces direct current. Inverters convert it into grid-compatible alternating current.'},
 workshop:{short:'Maintenance workshop',group:'facilities',tag:'OPERATIONS',reason:'Get your team back to work sooner.',tradeoff:'Repairs are one third shorter within eight tiles on the same site. Improves crew recovery on that site.',fact:'A prepared workshop turns a missing spanner into a short walk instead of an expedition.'},
 road:{short:'Service road',group:'facilities',tag:'ACCESS',reason:'Connect the work to your people.',tradeoff:'Connected roads near equipment cut crew travel time by 25%. Isolated roads give no bonus.',fact:'Drag a route, review the full price, then release. Right-click cancels the whole plan.'},
 fence:{short:'Site fence',group:'landscape',tag:'LANDSCAPING',reason:'Give the site a clear boundary.',tradeoff:'Automatically joins neighbouring fence tiles and corners. Decorative; no security bonus.',fact:'Keep space around equipment for the people who will eventually have to fix it.'},
 gate:{short:'Open gate',group:'landscape',tag:'LANDSCAPING',reason:'Mark a welcoming entrance.',tradeoff:'Aligns with neighbouring fences. Decorative; does not alter access or security.',fact:'A gate without a road is an unusually ambitious ornament.'},
 tree:{short:'Valley tree',group:'landscape',tag:'LANDSCAPING',reason:'A little shade, a little character.',tradeoff:'Decorative. Leave your future array footprints free.',fact:'Thoughtful planting belongs around the operation, with room for access and maintenance.'},
 sign:{short:'Safety-ish sign',group:'landscape',tag:'LANDSCAPING',reason:'DAYS SINCE LAST COFFEE: 0.',tradeoff:'A company landmark. Decorative, with no hidden productivity bonus.',fact:'The safety committee recommends reading the sign before leaning on it.'},
 office:{short:'Operations office',group:'facilities',tag:'HEADQUARTERS',reason:'Every big company starts somewhere.',tradeoff:'Permanent crew base and company headquarters.',fact:'One office. Several mugs. A spreadsheet with considerable ambitions.'},
 substation:{short:'Grid connection',group:'grid',tag:'EXPORT',reason:'The valley’s connection to the wider world.',tradeoff:'Starter export headroom is 100 kW. Additional inverters expand it.',fact:'Generating electricity and exporting it are different jobs. Watch both numbers.'}
};
export function solarEstimate(kind:EquipmentKind,s:GameSnapshot){
 const d=EQUIPMENT[kind],peak=d.nameplateKw*d.efficiency*(s.researched.includes('precision_wiring')?1.08:1)*(kind==='premium_pv'&&s.researched.includes('advanced_cells')?1.12:1);
 const potential=peak*s.irradiance,headroom=Math.max(0,s.inverterCapacityKw-s.powerKw);
 return {peak,potential,headroom,clipped:Math.max(0,potential-headroom),after:s.cash-d.cost,runningCost:.12*(s.researched.includes('efficient_operations')?.7:1),faultPressure:(1-d.reliability)/(1-EQUIPMENT.bargain_pv.reliability)};
}
export function researchSupport(s:GameSnapshot):number{
 return Math.min(1,s.staff.filter(m=>m.role==='engineer'&&m.task.type==='idle'&&!m.onBreak&&!(m.trainingHoursLeft??0)).reduce((n,m)=>n+(m.preference==='research'?.2:.1)*(m.skill??1),0));
}
export function remainingResearch(s:GameSnapshot):number{return s.activeResearch?RESEARCH[s.activeResearch.id].hours*(1-s.activeResearch.progress)/(1+researchSupport(s)):0;}
export function capabilityOffer(id:CapabilityId,s:GameSnapshot):{cost:number;reason:string|null}{
 const done=s.capabilities.includes(id),earned=id==='radio_dispatch'||id==='cleaning_kit';
 const choice=s.capabilities.some(c=>c==='cleaning_rig'||c==='remote_monitoring');
 const cost=id==='scheduled_cleaning'?3000:choice?4000:0;
 return {cost,reason:done?'Unlocked':earned?(id==='radio_dispatch'?'Complete your first manual repair':'Complete your first manual clean'):!s.plots.some(p=>p.id==='site_b'&&p.unlocked)?'Open Site B first':id==='scheduled_cleaning'&&!s.capabilities.includes('cleaning_rig')?'Requires Mobile Cleaning Rig':s.cash<cost?'Not enough cash':null};
}
export function staffDestination(m:StaffMember,s:GameSnapshot):string{
 if(m.task.type==='idle')return (m.trainingHoursLeft??0)>0?'Training at the office':m.onBreak?'Taking a well-earned break':m.preference==='research'?'Supporting the engineering programme':'Available for suitable work';
 const target=s.equipment.find(e=>e.id===(m.task.type!=='idle'?m.task.targetId:''));
 return target?PRODUCT[target.kind].short+' · '+(target.plotId==='site_a'?'Sunny Meadow':'River Bench')+' ('+target.tile.x+', '+target.tile.y+')':'Returning to the team';
}
export function traitText(m:StaffMember):string{
 if(m.trait==='Panel Whisperer')return '15% faster cleaning. Apparently the panels respond to encouragement.';
 if(m.trait==='Weather Worrier')return 'Checks the forecast before the kettle. Personality trait.';
 if(m.trait==='Spreadsheet Enthusiast')return 'Has a spreadsheet for the spreadsheets. Personality trait.';
 return 'Carries the toolbox with quiet confidence. Personality trait.';
}
