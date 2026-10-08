import {describe,it,expect} from 'vitest';
import {GameSimulation} from '../src/simulation/GameSimulation';
import {solarEstimate,researchSupport,remainingResearch,capabilityOffer} from '../src/ui/studio/data';
describe('Concept v1 information contracts',()=>{
 it('compares real solar output with the simulation, including completed research',()=>{
  for(const kind of ['bargain_pv','premium_pv'] as const){
   const sim=new GameSimulation();sim.hour=12;sim.weather='clear';sim.researched=['precision_wiring','advanced_cells'];
   const array=sim.equipment.find(e=>e.kind.includes('pv'))!;array.kind=kind;array.soiling=0;array.condition=1;
   const estimate=solarEstimate(kind,sim.snapshot());
   expect(estimate.peak).toBeCloseTo(sim.computePower().generationKw);
   sim.hour=23;expect(solarEstimate(kind,sim.snapshot()).potential).toBe(0);
  }
 });
 it('shows export consequences and the actual relative routine-fault pressure',()=>{
  const sim=new GameSimulation();sim.hour=12;
  expect(solarEstimate('premium_pv',sim.snapshot()).faultPressure).toBeCloseTo(.25);
  for(let i=0;i<5;i++)sim.equipment.push({...sim.equipment[2],id:'extra'+i,kind:'premium_pv',soiling:0});
  expect(solarEstimate('premium_pv',sim.snapshot()).headroom).toBe(0);
  expect(solarEstimate('premium_pv',sim.snapshot()).clipped).toBeGreaterThan(0);
 });
 it('research estimates include only currently available engineer assistance',()=>{
  const sim=new GameSimulation();sim.hireStaff('engineer');const m=sim.staff[1];m.preference='research';m.skill=2;
  sim.activeResearch={id:'precision_wiring',progress:.5};
  expect(researchSupport(sim.snapshot())).toBeCloseTo(.4);
  expect(remainingResearch(sim.snapshot())).toBeCloseTo(3/1.4);
  m.onBreak=true;expect(researchSupport(sim.snapshot())).toBe(0);expect(remainingResearch(sim.snapshot())).toBe(3);
 });
 it('capability prices match the real first choice and later purchases',()=>{
  const sim=new GameSimulation();expect(capabilityOffer('cleaning_rig',sim.snapshot()).reason).toBe('Open Site B first');
  sim.plots[1].unlocked=true;
  expect(capabilityOffer('cleaning_rig',sim.snapshot())).toEqual({cost:0,reason:null});
  const before=sim.cash;expect(sim.buyCapability('cleaning_rig')).toBe(true);expect(sim.cash).toBe(before);
  expect(capabilityOffer('remote_monitoring',sim.snapshot()).cost).toBe(4000);
  expect(capabilityOffer('scheduled_cleaning',sim.snapshot()).cost).toBe(3000);
 });
});
