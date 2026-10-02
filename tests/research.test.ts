import { describe, expect, it } from 'vitest';
import { GameSimulation } from '../src/simulation/GameSimulation';
import { EVENTS } from '../src/content/events';
import { RESEARCH, type ResearchId } from '../src/content/research';
import { validateState } from '../src/persistence/validate';

function stable(): GameSimulation {
  const sim = new GameSimulation();
  sim.triggeredEvents = Object.keys(EVENTS) as (keyof typeof EVENTS)[];
  sim.scriptedFirstFault = true; sim.nextFaultCheck = 1e6; sim.nextSoilTick = 1e6;
  sim.objectives.find(o => o.id === 'first_power')!.complete = true;
  return sim;
}
function hours(sim: GameSimulation, count: number): void {
  for (let i=0;i<count*60;i++) sim.update(1/12);
}

describe('real research progression', () => {
  it('enforces lessons, prerequisites, affordability and a single paid project', () => {
    const sim = new GameSimulation(), cash = sim.cash;
    expect(sim.startResearch('__proto__' as ResearchId)).toBe(false);
    expect(sim.startResearch('toString' as ResearchId)).toBe(false);
    expect(sim.startResearch('precision_wiring')).toBe(false);
    expect(sim.cash).toBe(cash);
    sim.objectives.find(o => o.id === 'first_power')!.complete = true;
    expect(sim.startResearch('smart_inverters')).toBe(false);
    expect(sim.startResearch('field_toolkits')).toBe(false);
    expect(sim.startResearch('dust_coating')).toBe(false);
    sim.cash = 1999; expect(sim.startResearch('precision_wiring')).toBe(false);
    sim.cash = cash;
    expect(sim.startResearch('precision_wiring')).toBe(true);
    expect(sim.cash).toBe(cash - 2000);
    expect(sim.startResearch('precision_wiring')).toBe(false);
    expect(sim.cash).toBe(cash - 2000);
    expect(sim.startResearch('field_toolkits')).toBe(false);
  });
  it('pauses with the park and events, survives save/resume, and applies exactly once', () => {
    const sim = stable(); sim.startResearch('precision_wiring'); hours(sim,2);
    const saved = structuredClone(sim.serialize());
    const other = stable(); other.load(saved);
    const progress = other.activeResearch!.progress;
    other.speed = 0; hours(other,2); expect(other.activeResearch!.progress).toBe(progress);
    other.speed = 1; other.activeEvent = {...EVENTS.community_meeting,paused:true};
    hours(other,2); expect(other.activeResearch!.progress).toBe(progress);
    other.activeEvent = null; hours(other,4.1);
    expect(other.researched).toEqual(['precision_wiring']); expect(other.activeResearch).toBeNull();
    const cash = other.cash; expect(other.startResearch('precision_wiring')).toBe(false); expect(other.cash).toBe(cash);
  });
  it('lets engineers assist office research while keeping their service role', () => {
    const normal = stable(), engineer = stable();
    engineer.hireStaff('engineer'); engineer.staff.find(s => s.role === 'engineer')!.skill = 5;
    normal.startResearch('precision_wiring'); engineer.startResearch('precision_wiring');
    hours(normal,1); hours(engineer,1);
    expect(engineer.activeResearch!.progress).toBeCloseTo(normal.activeResearch!.progress * 1.5,5);
    expect(engineer.staff.find(s => s.role === 'engineer')!.task.type).toBe('idle');
  });
  it('migrates legacy saves without leaking the previous company’s research', () => {
    const old = stable().serialize(); delete old.researched; delete old.activeResearch;
    const sim = stable(); sim.researched = ['precision_wiring']; sim.startResearch('smart_inverters');
    expect(validateState(old)).toBe(true); sim.load(old);
    expect(sim.researched).toEqual([]); expect(sim.activeResearch).toBeNull();
  });
  it('rejects unknown, duplicate, out-of-order and corrupt research without changing the company', () => {
    const sim = stable();
    for (const patch of [{researched:['made_up']},{researched:['precision_wiring','precision_wiring']},{researched:['smart_inverters']},{activeResearch:{id:'precision_wiring',progress:NaN}},{activeResearch:{id:'smart_inverters',progress:0}},{researched:['precision_wiring'],activeResearch:{id:'precision_wiring',progress:.5}}]) {
      const bad = {...sim.serialize(),...patch}; expect(validateState(bad)).toBe(false);
      expect(() => sim.load(bad as ReturnType<GameSimulation['serialize']>)).toThrow();
      expect(sim.cash).toBe(50000); expect(sim.researched).toEqual([]);
    }
  });
});

describe('research changes park performance', () => {
  it('raises output, treats premium cells separately and raises inverter headroom', () => {
    const sim = stable(); sim.hour = 12; sim.weather = 'clear';
    sim.placeEquipment('premium_pv','site_a',{x:8,y:10});
    sim.equipment.forEach(e => {e.commissioned=true;e.constructionProgress=1;e.soiling=0;});
    const baseline = sim.computePower().generationKw;
    sim.researched = ['precision_wiring'];
    expect(sim.computePower().generationKw).toBeCloseTo(baseline*1.08);
    sim.researched = ['precision_wiring','smart_inverters','advanced_cells'];
    expect(sim.computePower().generationKw).toBeCloseTo((34+50*1.12)*1.08);
    for (let i=0;i<3;i++) sim.equipment.push({...sim.equipment.find(e => e.kind === 'premium_pv')!,id:`eq_${100+i}`});
    expect(sim.snapshot().inverterCapacityKw).toBe(120);
    expect(sim.computePower().exportedKw).toBe(120);
    expect(sim.snapshot().clippedKw).toBeGreaterThan(0);
  });
  it('makes crews travel and work faster without automatically completing the lesson', () => {
    const a = stable(), b = stable();
    b.researched = ['field_toolkits','crew_logistics'];
    for (const sim of [a,b]) {
      const panel = sim.equipment.find(e => e.kind === 'bargain_pv')!;
      panel.soiling = .8; sim.dispatchClean(panel.id); hours(sim,.25);
    }
    expect(a.staff[0].task.type).toBe('travel'); expect(b.staff[0].task.type).toBe('travel');
    if (a.staff[0].task.type === 'travel' && b.staff[0].task.type === 'travel') expect(b.staff[0].task.progress).toBeCloseTo(a.staff[0].task.progress*1.25);
    hours(a,.4); hours(b,.4);
    expect(b.cleansCompleted).toBe(1); expect(a.cleansCompleted).toBe(0);
    expect(b.manualCleans).toBe(1);
  });
  it('reduces equipment costs while preserving payroll, and reduces dust accumulation', () => {
    const a = stable(), b = stable(); b.researched = ['field_toolkits','crew_logistics','efficient_operations','dust_coating'];
    for (const sim of [a,b]) { sim.hour=0; sim.nextSoilTick=0; hours(sim,1); }
    expect(a.totalExpenses).toBeCloseTo(1.12); expect(b.totalExpenses).toBeCloseTo(1.084);
    const soil = (sim: GameSimulation) => sim.equipment.find(e => e.kind==='bargain_pv')!.soiling;
    expect(soil(b)-.05).toBeCloseTo((soil(a)-.05)*.8);
  });
  it('reduces routine faults across the same deterministic exposure', () => {
    const count = (research: ResearchId[]) => {
      const sim = stable(); sim.researched = research;
      let faults = 0;
      for(let i=0;i<2000;i++) {
        sim.nextFaultCheck = 0; sim.update(1/12);
        for (const e of sim.equipment) { if(e.faulted) faults++; e.faulted=false; e.condition=1; }
      }
      return faults;
    };
    const ordinary = count([]), researched = count(['dust_coating','predictive_diagnostics']);
    expect(ordinary).toBeGreaterThan(20); expect(researched).toBeLessThan(ordinary);
  });
  it('reduces storm condition damage while keeping preparation valuable', () => {
    const damage = (prepared: boolean, research: boolean) => {
      const sim = stable(); sim.hailPrepared = prepared;
      if(research) sim.researched=['dust_coating','predictive_diagnostics','storm_hardening'];
      sim.activeEvent = {...EVENTS.hail_climax,paused:true}; sim.resolveEventChoice('endure');
      return 1-sim.equipment.find(e => e.kind==='bargain_pv')!.condition;
    };
    expect(damage(false,true)).toBeCloseTo(damage(false,false)*.75);
    expect(damage(true,true)).toBeLessThan(damage(false,true));
    expect(Object.keys(RESEARCH)).toHaveLength(9);
  });
});
