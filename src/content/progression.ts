import type { GameSnapshot } from '../simulation/types';
export interface ScenarioBriefing { title:string; body:string; action:string; label:string; target?:string; }
/** The next useful decision follows readiness, rather than a rigid clock. */
export function scenarioBriefing(s:GameSnapshot):ScenarioBriefing {
  const done=(id:string)=>s.objectives.some(o=>o.id===id && o.complete);
  if(!done('first_power')) return {title:'1 · Start generating',body:'Add an array on Sunny Meadow. It commissions automatically. The starter link exports up to 100 kW; more panels eventually need an inverter.',action:'build',label:'Build solar'};
  if(!s.capabilities.includes('radio_dispatch')) {
    const fault=s.equipment.find(e=>e.faulted);
    return fault ? {title:'2 · Learn the repair loop',body:'Select the failed equipment and order a repair. Busy crew will queue the job. Your first repair earns Radio Dispatch and $2,000.',action:'locate',target:fault.id,label:'Find the fault'} : {title:'2 · Grow the first site',body:'Balance cheaper panels against reliability. A school supply contract can earn an extra bonus while your first maintenance lesson arrives.',action:'contracts',label:'View supply offers'};
  }
  if(!s.capabilities.includes('cleaning_kit')) {
    const dirty=s.equipment.find(e=>e.kind.includes('pv') && e.soiling>=.15);
    return {title:'3 · Keep the panels productive',body:'Dust reduces generation. Order your first clean to earn better tools and $2,000. A dedicated cleaner leaves technicians free for repairs.',action:dirty?'locate':'operations',target:dirty?.id,label:dirty?'Find dusty panels':'Review operations'};
  }
  if(!s.plots[1].unlocked) return {title:'4 · Earn the river expansion',body:'Reach 120 kW peak export and retain $5,000. Extra arrays help only when the inverter can carry their power. Research and contracts offer other ways to grow.',action:'build',label:'Plan capacity'};
  if(!done('expand_site_b')) return {title:'5 · Establish River Bench',body:'Commission solar on Site B for a $5,000 grant. Bridge journeys take longer: assign local crew and plan roads or a workshop. Your first expansion upgrade is free.',action:'build',label:'Build on Site B'};
  if(!s.capabilities.some(c=>c==='cleaning_rig'||c==='remote_monitoring')) return {title:'6 · Choose your operating model',body:'Take a free Cleaning Rig or Remote Monitoring upgrade. Cleaning favours grouped layouts; monitoring reduces faults. The other choice remains available for $4,000.',action:'caps',label:'Choose an upgrade'};
  if(!done('survive_hail')) return {title:'7 · Prepare for severe weather',body:'The hail warning gives you time to prepare. Keep repair crew available and hold $2,500 for preparation. Premium equipment and resilience research reduce damage.',action:'operations',label:'Check crew and condition'};
  if(s.stars===0) return {title:'8 · Finish the first award',body:`The park has weathered the storm. Reach $3,500 lifetime electricity sales (${Math.floor(s.lifetimeRevenue).toLocaleString()} so far). Contracts pay separate bonuses; they do not replace this operating target.`,action:'finance',label:'View the award checklist'};
  if(s.stars===1) return {title:'9 · Run a dependable company',body:'For 2★: reach 220 kW peak and hold 90% availability and 75% cleanliness for 6 daylight park hours. Nights pause the stability counter; outages and heavy dust reset it.',action:'operations',label:'Manage reliability'};
  if(s.stars===2) return {title:'10 · Master the valley',body:'For 3★: 300 kW peak, 12 stable daylight hours, 85% condition, two researched technologies and a crew member at skill 2. Service damaged arrays; preparation is helpful but never a permanent lock.',action:'finance',label:'Track mastery'};
  return {title:'Valley Pro · Keep growing',body:'All three awards earned. Renew supply contracts, test new research branches or refine the two-site operation. Your company stays playable; the next campaign map is still in development.',action:'contracts',label:'Choose a new challenge'};
}
