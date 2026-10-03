import { describe, expect, it, vi } from 'vitest';
import { GameSimulation } from '../src/simulation/GameSimulation';
import { validateState } from '../src/persistence/validate';
import { loadGame, saveGame } from '../src/persistence/save';
import { EVENTS } from '../src/content/events';

describe('release safety', () => {
  it('lets a cash-strapped company accept net-positive supplier and sponsorship offers', () => {
    const sim = new GameSimulation();
    sim.cash = 0;
    sim.activeEvent = { ...EVENTS.bargain_batch, paused: true };
    sim.resolveEventChoice('buy');
    expect(sim.cash).toBe(2500);
    expect(sim.activeEvent).toBeNull();
    sim.cash = 0;
    sim.activeEvent = { ...EVENTS.influencer_visit, paused: true };
    sim.resolveEventChoice('host');
    expect(sim.cash).toBe(2500);
    expect(sim.curtailmentFactor).toBe(0.7);
    expect(sim.curtailmentTimer).toBe(8);
    expect(sim.activeEvent).toBeNull();
  });
  it('does not complete First Power before the player builds', () => {
    const sim = new GameSimulation(); sim.update(1);
    expect(sim.objectives.find((o) => o.id === 'first_power')?.complete).toBe(false);
  });
  it('rejects overlap, locked plot, fractional and non-finite tiles without spending', () => {
    const sim = new GameSimulation(), cash = sim.cash;
    for (const [plot,tile] of [['site_a',{x:5,y:5}],['site_b',{x:24,y:8}],['site_a',{x:NaN,y:9}],['site_a',{x:9.1,y:9}]] as const) {
      expect(sim.placeEquipment('bargain_pv',plot,tile)).toBe(false);
    }
    expect(sim.cash).toBe(cash);
  });
  it('persists delayed hail, curtailment and random generator state', () => {
    const sim = new GameSimulation();
    const data = sim.serialize();
    data.curtailmentFactor = 0.85; data.curtailmentTimer = 20;
    data.eventClock = 100; data.eventDelays = { hail_climax: 108 };
    data.pendingEventQueue = ['hail_climax']; data.triggeredEvents = ['hail_warning'];
    data.rngState = 123;
    const resumed = new GameSimulation(); resumed.load(data);
    expect(resumed.serialize().eventDelays).toEqual({ hail_climax:108 });
    expect(resumed.curtailmentTimer).toBe(20);
    expect(resumed.rngState).toBe(123);
    resumed.update(1); expect(resumed.activeEvent).toBeNull();
    expect(data.hour).toBe(8); // Loading must not alias the source object.
  });
  it('rejects incomplete, corrupt and injected saves', () => {
    expect(validateState({cash:12})).toBe(false);
    const sim = new GameSimulation();
    expect(validateState(sim.serialize())).toBe(true);
    const data = structuredClone(sim.serialize()); data.cash = NaN;
    expect(validateState(data)).toBe(false);
    expect(() => sim.load(data)).toThrow();
    const unsafe = structuredClone(sim.serialize()); unsafe.staff[0].name = '<img src=x onerror=alert(1)>';
    expect(validateState(unsafe)).toBe(false);
    expect(validateState({...sim.serialize(), update:'not a method'})).toBe(false);
  });
  it('survives unavailable browser storage', () => {
    vi.stubGlobal('localStorage',{setItem(){throw Error('quota');},getItem(){throw Error('blocked');}});
    expect(saveGame(new GameSimulation().serialize())).toBe(false);
    expect(loadGame()).toBeNull(); vi.unstubAllGlobals();
  });
  it('does not award two or three stars before the primary objective', () => {
    const sim = new GameSimulation();
    sim.peakExportKw = 400; sim.hailPrepared = true; sim.hailSurvived = true;
    sim.capabilities = ['cleaning_kit','radio_dispatch'];
    sim.plots[1].unlocked = true; sim.placeEquipment('bargain_pv','site_b',{x:24,y:8});
    for(let i=0;i<10;i++) sim.update(1);
    expect(sim.stars).toBe(0);
  });
  it('checks event choices and affordability without dismissing the event', () => {
    const sim = new GameSimulation();
    sim.activeEvent = {id:'hail_warning',title:'Warning',body:'Storm',paused:true,choices:[{id:'prepare',label:'Prepare',description:'Costs money'},{id:'hope',label:'Hope',description:'Free'}]};
    sim.cash = 0; sim.resolveEventChoice('prepare');
    expect(sim.activeEvent).not.toBeNull(); expect(sim.cash).toBe(0);
    sim.resolveEventChoice('invalid'); expect(sim.activeEvent).not.toBeNull();
    sim.resolveEventChoice('hope'); expect(sim.activeEvent).toBeNull();
  });
  it('unlocks a real capability choice and retains the other option', () => {
    const sim = new GameSimulation(); sim.plots[1].unlocked = true;
    const cash = sim.cash; expect(sim.buyCapability('cleaning_rig')).toBe(true); expect(sim.cash).toBe(cash);
    expect(sim.buyCapability('remote_monitoring')).toBe(true); expect(sim.cash).toBe(cash-4000);
    expect(sim.buyCapability('scheduled_cleaning')).toBe(true);
    const resumed = new GameSimulation(); resumed.load(sim.serialize()); expect(resumed.capabilities).toEqual(sim.capabilities);
  });
  it('supports playtest funding, positive grant and staff dismissal', () => {
    const sim = new GameSimulation();
    const cash = sim.cash;
    expect(sim.tariffPerKwh).toBeGreaterThanOrEqual(0.24);
    expect(sim.grantPlaytestCash(25_000)).toBe(true);
    expect(sim.cash).toBe(cash + 25_000);
    expect(sim.triggerPlaytestGrant()).toBe(true);
    expect(sim.activeEvent?.id).toBe('green_growth_grant');
    const beforeGrant = sim.cash;
    sim.resolveEventChoice('cash');
    expect(sim.cash).toBe(beforeGrant + 7_500);
    expect(sim.hireStaff('cleaner')).toBe(true);
    const cleaner = sim.staff.find((s) => s.role === 'cleaner')!;
    expect(sim.dismissStaff(cleaner.id)).toBe(true);
    expect(sim.staff.some((s) => s.id === cleaner.id)).toBe(false);
    expect(sim.dismissStaff(sim.staff[0].id)).toBe(false);
    expect(validateState(sim.serialize())).toBe(true);
  });
  it('releases staff tasks when selling their target and protects last PV', () => {
    const sim = new GameSimulation(); const starter = sim.equipment.find((e) => e.kind === 'bargain_pv')!;
    expect(sim.demolish(starter.id)).toBe(false);
    sim.placeEquipment('bargain_pv','site_a',{x:8,y:10});
    starter.soiling=0.7; sim.dispatchClean(starter.id);
    expect(sim.demolish(starter.id)).toBe(true); expect(sim.staff[0].task.type).toBe('idle');
  });
});
