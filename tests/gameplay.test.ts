import { describe, expect, it } from 'vitest';
import { GameSimulation } from '../src/simulation/GameSimulation';
import { EVENTS } from '../src/content/events';
import { CONTRACTS } from '../src/content/contracts';
import { parkMetrics, hasServiceAccess, nearbyWorkshop, travelHours } from '../src/simulation/operations';
import { validateState } from '../src/persistence/validate';
import type { PlacedEquipment } from '../src/simulation/types';

function stable() {
  const sim=new GameSimulation();
  sim.triggeredEvents=Object.keys(EVENTS) as (keyof typeof EVENTS)[];
  sim.scriptedFirstFault=true; sim.nextFaultCheck=1e6; sim.nextSoilTick=1e6;
  sim.weatherTimer=-1e6; sim.objectives.find(o=>o.id==='first_power')!.complete=true;
  return sim;
}
function hours(sim:GameSimulation,n:number) { for(let i=0;i<Math.ceil(n*60);i++) sim.update(1/12); }
const panel=(s:GameSimulation)=>s.equipment.find(e=>e.kind==='bargain_pv')!;
function extra(s:GameSimulation,x=8,y=10) { expect(s.placeEquipment('bargain_pv','site_a',{x,y})).toBe(true); const e=s.equipment.at(-1)!;e.commissioned=true;e.constructionProgress=1;return e; }

describe('optional supply contracts',()=>{
  it('gates new challenges and rejects invalid IDs without spending',()=>{
    const s=new GameSimulation(), money=s.cash;
    expect(s.acceptContract('school')).toBe(false);
    expect(s.acceptContract('__proto__' as 'school')).toBe(false);
    expect(s.cash).toBe(money);
    s.objectives.find(o=>o.id==='first_power')!.complete=true;
    expect(s.acceptContract('grid')).toBe(false);
    expect(s.acceptContract('valley')).toBe(false);
    expect(s.acceptContract('school')).toBe(true);
    expect(s.acceptContract('school')).toBe(false);
  });
  it('counts actual exported energy and freezes during pause and events',()=>{
    const s=stable(); s.hour=12; s.acceptContract('school');
    hours(s,1);
    expect(s.contract!.deliveredKwh).toBeCloseTo(s.totalEnergyKwh,8);
    expect(s.contract!.deliveredKwh).toBeLessThan(CONTRACTS.school.energyKwh);
    const before=structuredClone(s.contract);
    s.speed=0;hours(s,3);expect(s.contract).toEqual(before);
    s.speed=1;s.activeEvent={...EVENTS.community_meeting,paused:true};hours(s,3);expect(s.contract).toEqual(before);
    s.activeEvent=null;s.hour=0;hours(s,1);
    expect(s.contract!.elapsedHours).toBeGreaterThan(before!.elapsedHours);
    expect(s.contract!.deliveredKwh).toBe(before!.deliveredKwh);
  });
  it('holds quality deliveries during faults and resumes after real repair',()=>{
    const s=stable();s.capabilities=['radio_dispatch'];s.acceptContract('grid');s.hour=12;
    panel(s).faulted=true;s.staff[0].preference='clean';hours(s,.5);
    expect(s.contract!.deliveredKwh).toBe(0);
    s.setStaffAssignment(s.staff[0].id,'all','repair');hours(s,2);
    expect(panel(s).faulted).toBe(false);
    expect(s.contract!.deliveredKwh).toBeGreaterThan(0);
  });
  it('pays the bonus and returns the deposit exactly once across a save boundary',()=>{
    const s=stable();s.capabilities=['radio_dispatch'];s.acceptContract('grid');
    s.contract!.deliveredKwh=s.contract!.energyKwh-1;s.hour=12;
    const save=structuredClone(s.serialize());save.weatherTimer=0;
    const resumed=new GameSimulation();resumed.load(save);resumed.nextFaultCheck=1e6;
    const before=resumed.cash;hours(resumed,.1);
    expect(resumed.contract).toBeNull();expect(resumed.contractsCompleted).toBe(1);
    expect(resumed.cash-before).toBeGreaterThanOrEqual(CONTRACTS.grid.reward+CONTRACTS.grid.deposit);
    expect(resumed.contractHistory[0].reward).toBe(CONTRACTS.grid.reward);
    const after=resumed.cash;hours(resumed,.1);expect(resumed.cash-after).toBeLessThan(10);
    expect(resumed.acceptContract('school')).toBe(false);
    expect(resumed.contractRenewals).toBe(1);
  });
  it('expires and cancels without extra penalties and leaves a renewal break',()=>{
    const s=stable();s.capabilities=['radio_dispatch'];s.acceptContract('grid');
    const cash=s.cash;s.contract!.elapsedHours=95.99;s.hour=0;hours(s,.02);
    expect(s.contract).toBeNull();expect(s.contractHistory[0].outcome).toBe('expired');
    expect(cash-s.cash).toBeLessThan(1);expect(s.contractCooldown).toBeGreaterThan(11);
    expect(s.contractRenewals).toBe(0);
    s.contractCooldown=0;s.acceptContract('school');const before=s.cash;s.cancelContract();
    expect(s.cash).toBe(before);expect(s.contractHistory.at(-1)!.outcome).toBe('cancelled');
    expect(s.contractRenewals).toBe(0);
  });
});

describe('crew, queues and useful park layouts',()=>{
  it('queues busy work, rejects duplicates, and allows cancelling unstarted manual work',()=>{
    const s=stable(), second=extra(s);panel(s).soiling=.8;second.soiling=.8;
    expect(s.dispatchClean(panel(s).id)).toBe(true);
    expect(s.dispatchClean(second.id)).toBe(true);
    expect(s.dispatchClean(second.id)).toBe(false);
    expect(s.workOrders).toHaveLength(1);
    expect(s.cancelWorkOrder(second.id,'clean')).toBe(true);expect(s.workOrders).toHaveLength(0);
    s.dispatchClean(second.id);hours(s,3);
    expect(panel(s).soiling).toBe(0);expect(second.soiling).toBe(0);
    expect(s.cleansCompleted).toBe(2);
  });
  it('makes site and duty assignments meaningful and preserves current work',()=>{
    const s=stable();s.plots[1].unlocked=true;
    s.setStaffAssignment(s.staff[0].id,'site_b','repair');panel(s).soiling=.8;
    s.dispatchClean(panel(s).id);expect(s.staff[0].task.type).toBe('idle');expect(s.workOrders).toHaveLength(1);
    s.setStaffAssignment(s.staff[0].id,'all','clean');expect(s.staff[0].task.type).toBe('travel');
    s.setStaffAssignment(s.staff[0].id,'site_b','repair');expect(s.staff[0].task.type).toBe('travel');
    hours(s,2);expect(panel(s).soiling).toBe(0);
    s.hireStaff('cleaner');const cleaner=s.staff.find(m=>m.role==='cleaner')!;
    expect(s.setStaffAssignment(cleaner.id,'all','repair')).toBe(false);
    expect(s.setStaffAssignment(s.staff[0].id,'all','research')).toBe(false);
  });
  it('protects the final repair specialist rather than merely the final employee',()=>{
    const s=stable();s.hireStaff('cleaner');
    expect(s.dismissStaff(s.staff[0].id)).toBe(false);
    s.hireStaff('engineer');expect(s.dismissStaff(s.staff[0].id)).toBe(true);
  });
  it('charges service only when work starts and restores condition without claiming a repaired fault',()=>{
    const s=stable(), damaged=extra(s);s.capabilities=['radio_dispatch'];panel(s).soiling=.8;damaged.condition=.6;
    s.dispatchClean(panel(s).id);const money=s.cash;
    s.dispatchService(damaged.id);expect(s.cash).toBe(money);expect(s.workOrders[0].kind).toBe('service');
    hours(s,4);expect(damaged.condition).toBe(1);expect(s.servicesCompleted).toBe(1);expect(s.faultsRepaired).toBe(0);
    expect(s.totalExpenses).toBeGreaterThanOrEqual(450);
    expect(s.dispatchService(damaged.id)).toBe(false);
  });
  it('uses distance and the actual bridge route, and rewards nearby service roads',()=>{
    const s=stable(), source=panel(s), remote={...source,plotId:'site_b',tile:{x:30,y:12}} as PlacedEquipment;
    expect(travelHours(s.staff[0],remote,s.equipment)).toBeGreaterThan(travelHours(s.staff[0],source,s.equipment)*2);
    expect(hasServiceAccess(s.equipment,source)).toBe(false);
    const road={...source,id:'eq_999',kind:'road',tile:{x:12,y:10}} as PlacedEquipment;
    expect(travelHours(s.staff[0],source,[...s.equipment,road])).toBeCloseTo(travelHours(s.staff[0],source,s.equipment)*.75);
    const hub={...source,id:'eq_998',kind:'workshop',tile:{x:8,y:11}} as PlacedEquipment;
    expect(nearbyWorkshop([...s.equipment,hub],source)).toBe(true);
    expect(nearbyWorkshop([...s.equipment,hub],remote)).toBe(false);
  });
  it('rests fatigued crew and returns them to queued duties after recovery',()=>{
    const s=stable();panel(s).soiling=.8;s.staff[0].energy=.1;
    s.dispatchClean(panel(s).id);expect(s.staff[0].onBreak).toBe(true);expect(s.workOrders).toHaveLength(1);
    hours(s,1);expect(s.staff[0].task.type).toBe('idle');
    hours(s,3);expect(s.staff[0].onBreak).toBe(false);expect(panel(s).soiling).toBe(0);
  });
  it('books four hours of training, completes current work first and pauses correctly',()=>{
    const s=stable();panel(s).soiling=.8;s.dispatchClean(panel(s).id);
    const money=s.cash,skill=s.staff[0].skill!;
    expect(s.trainStaff(s.staff[0].id)).toBe(true);expect(s.cash).toBe(money-800);
    expect(s.trainStaff(s.staff[0].id)).toBe(false);hours(s,.2);
    expect(s.staff[0].trainingHoursLeft).toBe(4);
    hours(s,1);expect(s.staff[0].skill).toBeCloseTo(skill+.04);
    const left=s.staff[0].trainingHoursLeft;s.speed=0;hours(s,2);expect(s.staff[0].trainingHoursLeft).toBe(left);
    s.speed=1;hours(s,4);expect(s.staff[0].trainingHoursLeft).toBe(0);expect(s.staff[0].skill).toBeCloseTo(skill+1.04);
  });
  it('turns policies into a trade-off and reserves cash for preventive work',()=>{
    const eager=stable(), lean=stable();
    for(const s of [eager,lean]) {s.capabilities=['radio_dispatch','cleaning_kit','cleaning_rig','scheduled_cleaning'];panel(s).soiling=.3;}
    eager.setCleaningThreshold(.2);lean.setCleaningThreshold(.5);hours(eager,.02);hours(lean,.02);
    expect(eager.staff[0].task.type).toBe('travel');expect(lean.staff[0].task.type).toBe('idle');
    const s=stable();expect(s.setPreventiveMaintenance(true)).toBe(false);
    s.researched=['dust_coating','predictive_diagnostics'];s.capabilities=['radio_dispatch'];s.setPreventiveMaintenance(true);
    panel(s).condition=.7;s.cash=1900;hours(s,.02);expect(s.servicesCompleted).toBe(0);expect(s.workOrders).toHaveLength(0);
    s.cash=2050;hours(s,2);expect(s.servicesCompleted).toBe(1);expect(s.cash).toBeGreaterThan(1500);
  });
});

describe('stable mastery and persistent operating state',()=>{
  it('measures availability by solar capacity and pauses night stability while faults reset daylight progress',()=>{
    const s=stable();const premium={...panel(s),id:'eq_99',kind:'premium_pv'} as PlacedEquipment;s.equipment.push(premium);
    panel(s).faulted=true;expect(parkMetrics(s.equipment).availability).toBeCloseTo(50/90);
    panel(s).faulted=false;s.stars=1;s.hour=10;hours(s,2);expect(s.stabilityHours).toBeCloseTo(2);
    s.hour=0;hours(s,1);expect(s.stabilityHours).toBeCloseTo(2);
    s.hour=12;panel(s).faulted=true;s.staff[0].preference='clean';hours(s,.02);expect(s.stabilityHours).toBe(0);
  });
  it('rolls an operating report at midnight without mixing days',()=>{
    const s=stable();s.hour=23.99;hours(s,.04);
    expect(s.day).toBe(2);expect(s.dailyReports).toHaveLength(1);expect(s.dailyReports[0].day).toBe(1);
    expect(s.currentReport.day).toBe(2);expect(s.currentReport.expenses).toBeGreaterThan(0);
  });
  it('round-trips contracts, queues, policies, reports, crew assignments and training, and migrates older saves',()=>{
    const s=stable();s.weatherTimer=0;s.capabilities=['radio_dispatch','cleaning_kit','cleaning_rig','scheduled_cleaning'];
    s.acceptContract('school');s.setCleaningThreshold(.5);s.staff[0].workZone='site_a';s.staff[0].preference='repair';s.trainStaff(s.staff[0].id);
    panel(s).soiling=.8;s.dispatchClean(panel(s).id);
    const saved=structuredClone(s.serialize());expect(validateState(saved)).toBe(true);
    const next=new GameSimulation();next.load(saved);
    expect(next.contract).toEqual(s.contract);expect(next.workOrders).toEqual(s.workOrders);expect(next.staff).toEqual(s.staff);
    expect(next.cleaningThreshold).toBe(.5);expect(next.currentReport).toEqual(s.currentReport);
    const old=structuredClone(new GameSimulation().serialize());
    for(const key of ['contract','contractHistory','contractRenewals','contractCooldown','contractsCompleted','workOrders','cleaningThreshold','preventiveMaintenance','stabilityHours','servicesCompleted','dailyReports','currentReport','nextNarrativeAt'] as const) delete old[key];
    delete old.staff[0].energy;delete old.staff[0].preference;delete old.staff[0].workZone;
    next.load(old);expect(next.contract).toBeNull();expect(next.workOrders).toEqual([]);expect(next.staff[0].energy).toBe(1);expect(next.cleaningThreshold).toBe(.35);
  });
  it('rejects forged contract terms, invalid assignments and corrupt queues without mutating the company',()=>{
    const s=stable();s.weatherTimer=0;s.acceptContract('school');
    const patches=[{contract:{...s.contract,reward:1e9}},{cleaningThreshold:.001},{workOrders:[{targetId:'missing',kind:'repair',manual:true}]},{currentReport:{...s.currentReport,day:999}}];
    for(const patch of patches) {const bad={...s.serialize(),...patch};expect(validateState(bad)).toBe(false);expect(()=>s.load(bad as ReturnType<GameSimulation['serialize']>)).toThrow();}
    expect(s.contract!.reward).toBe(CONTRACTS.school.reward);
  });
  it('leaves a narrative breathing gap while the hail warning bypasses it',()=>{
    const s=new GameSimulation();s.pendingEventQueue=['community_meeting','green_growth_grant'];s.update(.01);
    expect(s.activeEvent?.id).toBe('community_meeting');s.resolveEventChoice('promise');s.update(.01);expect(s.activeEvent).toBeNull();
    s.pendingEventQueue.push('hail_warning');s.update(.01);expect(s.activeEvent?.id).toBe('hail_warning');
  });
});
