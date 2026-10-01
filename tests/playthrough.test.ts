import { mkdirSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GameSimulation } from '../src/simulation/GameSimulation';
import { STAR_THRESHOLDS } from '../src/content/scenario';

describe('Level 1 with real starting budget and normal time', () => {
  it('can finish through ordinary player actions, including mid-storm save/resume', () => {
    let sim = new GameSimulation();
    const captured = new Set<string>();
    const capture = (name: string) => {
      if (!process.env.CI || captured.has(name)) return;
      captured.add(name); mkdirSync('browser-fixtures',{recursive:true});
      writeFileSync('browser-fixtures/' + name + '.json',JSON.stringify({version:1,state:sim.serialize()}));
    };
    const slots = [{x:6,y:9},{x:8,y:9},{x:10,y:9},{x:6,y:13},{x:8,y:13},{x:10,y:13},{x:14,y:13},{x:16,y:13}];
    let slot = 0, saved = false;
    expect(sim.placeEquipment('premium_pv','site_a',slots[slot++])).toBe(true);
    expect(sim.placeEquipment('bargain_pv','site_a',slots[slot++])).toBe(true);
    expect(sim.placeEquipment('bargain_pv','site_a',slots[slot++])).toBe(true);
    expect(sim.placeEquipment('inverter','site_a',{x:16,y:10})).toBe(true);
    // No direct edits to cash, equipment, weather, hour, unlocks or objectives.
    let seconds = 0;
    for (; seconds < 7200; seconds++) {
      if (sim.activeEvent) {
        const event = sim.activeEvent;
        if(event.id === 'hail_warning') capture('storm');
        const id = event.id === 'hail_warning' && sim.cash >= 2500 ? 'prepare'
          : event.choices.find((c) => ['promise','pass','accept','decline','busy','hope','endure'].includes(c.id))?.id ?? event.choices[0].id;
        sim.resolveEventChoice(id);
        if (event.id === 'hail_warning' && !saved) {
          const data = JSON.parse(JSON.stringify(sim.serialize()));
          sim = new GameSimulation(); sim.load(data); saved = true;
        }
      }
      if (!sim.capabilities.includes('radio_dispatch')) {
        const fault = sim.equipment.find((e) => e.faulted);
        if (fault) { capture('fault'); sim.dispatchRepair(fault.id); }
      }
      const dirty = sim.equipment.filter((e) => e.kind.includes('pv') && e.soiling >= 0.2).sort((a,b)=>b.soiling-a.soiling)[0];
      if (dirty && !sim.capabilities.includes('scheduled_cleaning')) { if(sim.manualCleans === 0) capture('dust'); sim.dispatchClean(dirty.id); }
      if (sim.plots[1].unlocked) {
        sim.buyCapability('cleaning_rig');
        if(sim.manualCleans > 0 && sim.cash >= 5500) sim.buyCapability('scheduled_cleaning');
        if (!sim.equipment.some((e) => e.plotId === 'site_b') && sim.cash >= 10500) sim.placeEquipment('bargain_pv','site_b',{x:24,y:10});
      }
      if (sim.cash >= 16000 && slot < slots.length) sim.placeEquipment('bargain_pv','site_a',slots[slot++]);
      sim.update(1);
      expect(Number.isFinite(sim.cash)).toBe(true); expect(sim.cash).toBeGreaterThanOrEqual(0);
      if (sim.stars >= 1) break;
    }
    console.log('Normal-economy completion at',seconds,'seconds at 1x; sales',sim.lifetimeRevenue);
    capture('one-star');
    expect(sim.manualRepairs).toBeGreaterThan(0);
    expect(sim.manualCleans).toBeGreaterThan(0);
    expect(sim.capabilities).toContain('scheduled_cleaning');
    expect(sim.cleansCompleted).toBeGreaterThan(sim.manualCleans);
    expect(sim.faultsRepaired).toBeGreaterThan(sim.manualRepairs);
    expect(saved).toBe(true);
    expect(sim.hailSurvived).toBe(true);
    expect(sim.lifetimeRevenue).toBeGreaterThanOrEqual(STAR_THRESHOLDS.star1Revenue);
    expect(sim.scenarioComplete).toBe(true);
    expect(sim.stars).toBeGreaterThanOrEqual(1);
    expect(seconds).toBeLessThan(3600);
  });
});
