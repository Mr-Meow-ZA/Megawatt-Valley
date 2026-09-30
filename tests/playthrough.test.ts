import { describe, expect, it } from 'vitest';
import { GameSimulation } from '../src/simulation/GameSimulation';

describe('Level 1 playthrough smoke', () => {
  it('can reach 1★ with automated build/operate loop', () => {
    const sim = new GameSimulation();
    sim.cash = 200_000;
    sim.dismissOnboarding();

    const tiles = [
      { x: 6, y: 9 },
      { x: 8, y: 9 },
      { x: 10, y: 9 },
      { x: 6, y: 11 },
      { x: 8, y: 11 },
      { x: 10, y: 11 },
      { x: 6, y: 13 },
      { x: 8, y: 13 },
    ];
    for (let i = 0; i < tiles.length; i++) {
      const kind = i % 2 === 0 ? 'bargain_pv' : 'premium_pv';
      expect(sim.placeEquipment(kind, 'site_a', tiles[i])).toBe(true);
    }
    expect(sim.placeEquipment('inverter', 'site_a', { x: 13, y: 10 })).toBe(true);
    expect(sim.placeEquipment('inverter', 'site_a', { x: 14, y: 10 })).toBe(true);

    for (const eq of sim.equipment) {
      if (eq.kind === 'bargain_pv' || eq.kind === 'premium_pv' || eq.kind === 'inverter') {
        eq.commissioned = true;
        eq.constructionProgress = 1;
      }
    }

    sim.hour = 12;
    sim.weather = 'clear';
    sim.setSpeed(4);
    expect(sim.computePower().exportedKw).toBeGreaterThan(120);
    expect(sim.playerPlacedPv).toBe(true);

    for (let i = 0; i < 40_000; i++) {
      if (sim.activeEvent) {
        const preferred =
          sim.activeEvent.choices.find(
            (c) =>
              c.id === 'prepare' ||
              c.id === 'buy' ||
              c.id === 'sponsor' ||
              c.id === 'monitor' ||
              c.id === 'hire' ||
              c.id === 'endure',
          )?.id ?? sim.activeEvent.choices[0]?.id;
        if (preferred) sim.resolveEventChoice(preferred);
      }

      if (!sim.capabilities.includes('radio_dispatch')) {
        const fault = sim.equipment.find((e) => e.faulted);
        if (fault) sim.dispatchRepair(fault.id);
      } else {
        sim.dispatchRepair();
      }

      const dirty = sim.equipment.find(
        (e) => (e.kind === 'bargain_pv' || e.kind === 'premium_pv') && e.soiling > 0.2,
      );
      if (dirty && sim.staff.some((s) => s.task.type === 'idle')) {
        sim.dispatchClean(dirty.id);
      }

      const siteB = sim.plots.find((p) => p.id === 'site_b');
      if (siteB?.unlocked && !sim.equipment.some((e) => e.plotId === 'site_b' && e.kind.includes('pv'))) {
        sim.cash = Math.max(sim.cash, 20_000);
        expect(sim.placeEquipment('premium_pv', 'site_b', { x: 24, y: 8 })).toBe(true);
        const newest = sim.equipment[sim.equipment.length - 1];
        newest.commissioned = true;
        newest.constructionProgress = 1;
      }

      if (sim.hour < 10 || sim.hour > 15) sim.hour = 12;
      if (
        sim.hailHoldHours <= 0 &&
        !sim.triggeredEvents.includes('hail_warning') &&
        !sim.triggeredEvents.includes('hail_climax')
      ) {
        sim.weather = 'clear';
      }

      sim.update(0.5);
      if (sim.stars >= 1 && sim.scenarioComplete) break;
    }

    expect(sim.peakExportKw).toBeGreaterThanOrEqual(120);
    expect(sim.lifetimeRevenue).toBeGreaterThanOrEqual(12_000);
    expect(sim.stars).toBeGreaterThanOrEqual(1);
    expect(sim.scenarioComplete).toBe(true);
  });

  it('save round-trip preserves event clock and curtailment', () => {
    const sim = new GameSimulation();
    sim.dismissOnboarding();
    expect(sim.placeEquipment('bargain_pv', 'site_a', { x: 6, y: 9 })).toBe(true);
    sim.equipment[sim.equipment.length - 1].commissioned = true;
    sim.equipment[sim.equipment.length - 1].constructionProgress = 1;
    sim.eventClock = 12.5;
    sim.curtailmentFactor = 0.85;
    sim.curtailmentTimer = 10;
    sim.bargainDiscountCharges = 2;
    const data = sim.serialize();
    const loaded = new GameSimulation();
    loaded.load(data);
    expect(loaded.eventClock).toBe(12.5);
    expect(loaded.curtailmentFactor).toBe(0.85);
    expect(loaded.bargainDiscountCharges).toBe(2);
    expect(loaded.playerPlacedPv).toBe(true);
  });

  it('hail climax sets hail weather', () => {
    const sim = new GameSimulation();
    sim.dismissOnboarding();
    sim.activeEvent = {
      id: 'hail_climax',
      title: 'Hail',
      body: 'test',
      choices: [{ id: 'endure', label: 'Go', description: '' }],
      paused: true,
    };
    sim.resolveEventChoice('endure');
    expect(sim.weather).toBe('hail');
    expect(sim.hailSurvived).toBe(true);
    expect(sim.hailHoldHours).toBeGreaterThan(0);
  });

  it('R dispatches without selection when a fault exists', () => {
    const sim = new GameSimulation();
    sim.dismissOnboarding();
    expect(sim.placeEquipment('bargain_pv', 'site_a', { x: 6, y: 9 })).toBe(true);
    const eq = sim.equipment[sim.equipment.length - 1];
    eq.commissioned = true;
    eq.constructionProgress = 1;
    eq.faulted = true;
    expect(sim.dispatchRepair()).toBe(true);
    expect(sim.staff[0].task.type).toBe('travel');
  });
});
