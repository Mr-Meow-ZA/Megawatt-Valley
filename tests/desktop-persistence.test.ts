import {describe,it,expect,vi,afterEach} from 'vitest';
import {GameSimulation} from '../src/simulation/GameSimulation';
import {saveGame,loadGame,clearSave} from '../src/persistence/save';
afterEach(()=>vi.unstubAllGlobals());
describe('desktop persistence bridge',()=>{
  it('stores the validated company in the native store',()=>{
    const writeSave=vi.fn((_raw:string)=>true);
    vi.stubGlobal('window',{megawattDesktop:{writeSave}});
    const sim=new GameSimulation();
    expect(saveGame(sim.serialize())).toBe(true);
    const envelope=JSON.parse(writeSave.mock.calls[0][0] as unknown as string);
    expect(envelope.state.cash).toBe(sim.cash);expect(envelope.version).toBe(1);
  });
  it('uses the recovery candidate if the primary envelope is invalid',()=>{
    const sim=new GameSimulation(),valid=JSON.stringify({version:1,state:sim.serialize()});
    vi.stubGlobal('window',{megawattDesktop:{readSaves:()=>['broken',JSON.stringify({version:1,state:{cash:1}}),valid]}});
    const restored=loadGame();expect(restored?.equipment.length).toBe(sim.equipment.length);
    expect(restored?.cash).toBe(sim.cash);
  });
  it('reports native write failures and uses native clearing',()=>{
    const clear=vi.fn(()=>true);
    vi.stubGlobal('window',{megawattDesktop:{writeSave:()=>false,clearSave:clear}});
    expect(saveGame(new GameSimulation().serialize())).toBe(false);
    expect(clearSave()).toBe(true);expect(clear).toHaveBeenCalledTimes(1);
  });
});
