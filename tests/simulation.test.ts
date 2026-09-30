import { describe, expect, it } from 'vitest';
import { EQUIPMENT } from '../src/content/equipment';
import { GameSimulation, generationKwForArray, revenueFor } from '../src/simulation/GameSimulation';

describe('energy math', () => {
  it('applies soiling and irradiance to generation', () => {
    const full = generationKwForArray({
      nameplateKw: 50,
      efficiency: 1,
      condition: 1,
      soiling: 0,
      irradiance: 1,
      solarResource: 1,
    });
    const dirty = generationKwForArray({
      nameplateKw: 50,
      efficiency: 1,
      condition: 1,
      soiling: 1,
      irradiance: 1,
      solarResource: 1,
    });
    expect(full).toBe(50);
    expect(dirty).toBeCloseTo(50 * 0.55, 5);
  });

  it('computes revenue from energy and tariff', () => {
    expect(revenueFor(100, 0.12)).toBeCloseTo(12, 5);
  });
});

describe('GameSimulation', () => {
  it('starts with cash, office, substation and one technician', () => {
    const sim = new GameSimulation();
    const snap = sim.snapshot();
    expect(snap.cash).toBe(50_000);
    expect(snap.equipment.some((e) => e.kind === 'office')).toBe(true);
    expect(snap.equipment.some((e) => e.kind === 'substation')).toBe(true);
    expect(snap.staff).toHaveLength(1);
  });

  it('places bargain PV and spends cash', () => {
    const sim = new GameSimulation();
    const before = sim.cash;
    const ok = sim.placeEquipment('bargain_pv', 'site_a', { x: 10, y: 10 });
    expect(ok).toBe(true);
    expect(sim.cash).toBe(before - EQUIPMENT.bargain_pv.cost);
    expect(sim.equipment.filter((e) => e.kind === 'bargain_pv')).toHaveLength(1);
    expect(sim.playerPlacedPv).toBe(true);
  });

  it('rejects placement without funds', () => {
    const sim = new GameSimulation();
    sim.cash = 100;
    const ok = sim.placeEquipment('premium_pv', 'site_a', { x: 10, y: 10 });
    expect(ok).toBe(false);
  });

  it('serializes and restores cash', () => {
    const sim = new GameSimulation();
    sim.cash = 42_000;
    const data = sim.serialize();
    const other = new GameSimulation();
    other.load(data);
    expect(other.cash).toBe(42_000);
  });

  it('exports power after commissioning player-placed PV at midday', () => {
    const sim = new GameSimulation();
    expect(sim.placeEquipment('bargain_pv', 'site_a', { x: 10, y: 10 })).toBe(true);
    const eq = sim.equipment[sim.equipment.length - 1];
    eq.commissioned = true;
    eq.constructionProgress = 1;
    sim.hour = 12;
    sim.weather = 'clear';
    const { exportedKw } = sim.computePower();
    expect(exportedKw).toBeGreaterThan(20);
  });

  it('starts with no free PV so First Power is earned', () => {
    const sim = new GameSimulation();
    expect(sim.equipment.some((e) => e.kind === 'bargain_pv' || e.kind === 'premium_pv')).toBe(false);
    expect(sim.computePower().exportedKw).toBe(0);
  });

  it('quickPlace puts a PV on Site A', () => {
    const sim = new GameSimulation();
    sim.dismissOnboarding();
    expect(sim.quickPlace('bargain_pv', 'site_a')).toBe(true);
    expect(sim.equipment.some((e) => e.kind === 'bargain_pv')).toBe(true);
  });

  it('commissions placed PV via update and then exports', () => {
    const sim = new GameSimulation();
    sim.dismissOnboarding();
    expect(sim.placeEquipment('bargain_pv', 'site_a', { x: 10, y: 10 })).toBe(true);
    const eq = sim.equipment[sim.equipment.length - 1];
    expect(eq.commissioned).toBe(false);
    sim.setSpeed(4);
    for (let i = 0; i < 200; i++) {
      sim.hour = 12;
      sim.weather = 'clear';
      if (sim.activeEvent) {
        sim.resolveEventChoice(sim.activeEvent.choices[0].id);
      }
      sim.update(0.5);
    }
    expect(eq.commissioned).toBe(true);
    eq.faulted = false;
    sim.hour = 12;
    sim.weather = 'clear';
    expect(sim.computePower().exportedKw).toBeGreaterThan(20);
  });

  it('keeps export online for first hours without random faults', () => {
    const sim = new GameSimulation();
    sim.dismissOnboarding();
    expect(sim.quickPlace('bargain_pv', 'site_a')).toBe(true);
    sim.setSpeed(4);
    // ~15 updates × 12 sim-minutes ≈ 3h — before the 4h scripted-fault gate.
    for (let i = 0; i < 15; i++) {
      sim.hour = 12;
      sim.weather = 'clear';
      if (sim.activeEvent) sim.resolveEventChoice(sim.activeEvent.choices[0].id);
      sim.update(0.25);
    }
    sim.hour = 12;
    sim.weather = 'clear';
    const eq = sim.equipment.find((e) => e.kind === 'bargain_pv')!;
    expect(eq.commissioned).toBe(true);
    expect(eq.faulted).toBe(false);
    expect(sim.computePower().exportedKw).toBeGreaterThan(20);
    expect(sim.objectives.find((o) => o.id === 'first_power')?.complete).toBe(true);
  });
});
