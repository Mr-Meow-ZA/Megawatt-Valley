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
    const ok = sim.placeEquipment('bargain_pv', 'site_a', { x: 6, y: 8 });
    expect(ok).toBe(true);
    expect(sim.cash).toBe(50_000 - EQUIPMENT.bargain_pv.cost);
    expect(sim.equipment.some((e) => e.kind === 'bargain_pv')).toBe(true);
  });

  it('rejects placement without funds', () => {
    const sim = new GameSimulation();
    sim.cash = 100;
    const ok = sim.placeEquipment('premium_pv', 'site_a', { x: 6, y: 8 });
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

  it('exports power after commissioning PV at midday clear weather', () => {
    const sim = new GameSimulation();
    sim.placeEquipment('bargain_pv', 'site_a', { x: 6, y: 8 });
    const pv = sim.equipment.find((e) => e.kind === 'bargain_pv')!;
    pv.commissioned = true;
    pv.constructionProgress = 1;
    sim.hour = 12;
    sim.weather = 'clear';
    const { exportedKw } = sim.computePower();
    expect(exportedKw).toBeGreaterThan(20);
  });
});
