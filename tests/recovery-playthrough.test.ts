import { expect, it } from 'vitest';
import { GameSimulation } from '../src/simulation/GameSimulation';

it('recovers an unprepared, frugal park to three stars with earned cash and optional contracts', () => {
  let sim=new GameSimulation();
  const slots=[{x:6,y:9},{x:8,y:9},{x:10,y:9},{x:6,y:13},{x:8,y:13},{x:10,y:13},{x:14,y:13},{x:16,y:13}];
  let slot=0, resumed=false, seconds=0;
  for(let i=0;i<3;i++) expect(sim.placeEquipment('bargain_pv','site_a',slots[slot++])).toBe(true);
  expect(sim.placeEquipment('inverter','site_a',{x:16,y:10})).toBe(true);
  // Every change comes from a player action. No cash, weather, timer or unlock overrides.
  for(;seconds<7200 && sim.stars<3;seconds++) {
    if(sim.activeEvent) {
      const event=sim.activeEvent;
      const choice=event.choices.find(c=>['promise','pass','cash','accept','decline','busy','hope','endure'].includes(c.id)) ?? event.choices[0];
      sim.resolveEventChoice(choice.id);
      if(event.id==='hail_climax' && !resumed) {
        const save=JSON.parse(JSON.stringify(sim.serialize()));sim=new GameSimulation();sim.load(save);resumed=true;
      }
    }
    for(const eq of sim.equipment) {
      if(eq.faulted) sim.dispatchRepair(eq.id);
      if(eq.kind.includes('pv') && eq.soiling>=.2 && !sim.capabilities.includes('scheduled_cleaning')) sim.dispatchClean(eq.id);
      if(eq.kind.includes('pv') && eq.condition<.85 && !eq.faulted && sim.cash>=2500) sim.dispatchService(eq.id);
    }
    if(!sim.contract && sim.contractCooldown===0) sim.acceptContract('school');
    if(sim.plots[1].unlocked) {
      sim.buyCapability('cleaning_rig');
      if(sim.manualCleans>0 && sim.cash>=5500) sim.buyCapability('scheduled_cleaning');
      if(!sim.equipment.some(e=>e.plotId==='site_b') && sim.cash>=10500) sim.placeEquipment('bargain_pv','site_b',{x:24,y:10});
    }
    if(sim.cash>=14000 && slot<slots.length) sim.placeEquipment('bargain_pv','site_a',slots[slot++]);
    if(sim.cash>=6000 && !sim.activeResearch) {
      if(!sim.researched.includes('precision_wiring')) sim.startResearch('precision_wiring');
      else if(!sim.researched.includes('field_toolkits')) sim.startResearch('field_toolkits');
    }
    if((sim.staff[0].skill ?? 1)<2 && sim.cash>=6000) sim.trainStaff(sim.staff[0].id);
    sim.update(1);
    expect(sim.cash).toBeGreaterThanOrEqual(0);
  }
  console.log('Frugal/unprepared mastery:',seconds,'seconds at 1x;',sim.contractsCompleted,'contracts;',sim.servicesCompleted,'services; cash',Math.round(sim.cash));
  expect(resumed).toBe(true);expect(sim.hailPrepared).toBe(false);expect(sim.hailSurvived).toBe(true);
  expect(sim.servicesCompleted).toBeGreaterThan(0);expect(sim.contractsCompleted).toBeGreaterThan(0);
  expect(sim.stars).toBe(3);expect(seconds).toBeLessThan(7200);
});
