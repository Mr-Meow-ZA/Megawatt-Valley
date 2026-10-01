import {describe,it,expect} from 'vitest';
import { ROAD_TILES,FENCE_EDGES,SCENERY,DIRECTIONS,isMainRoad,isWater,clearForScenery,staffRoute,alongPath } from '../src/content/valleyLayout';
import { GameSimulation } from '../src/simulation/GameSimulation';
import { isoToScreen,screenToIso } from '../src/game/iso';
describe('shared valley layout',()=>{
  it('connects every access tile to the public road and both sites',()=>{
    const visited=new Set<string>(),queue=[ROAD_TILES[0]];
    while(queue.length){const p=queue.shift()!,key=p.x+','+p.y;if(visited.has(key))continue;visited.add(key);
      for(const d of DIRECTIONS){const q={x:p.x+d.x,y:p.y+d.y};if(isMainRoad(q.x,q.y)&&!visited.has(q.x+','+q.y))queue.push(q);}}
    expect(visited.size).toBe(ROAD_TILES.length);expect(visited.has('22,14')).toBe(true);expect(visited.has('4,14')).toBe(true);
  });
  it('leaves gates open where roads cross the plot boundaries',()=>{
    for(const gate of [{x:4,y:3.5},{x:22,y:5.5}]){
      expect(FENCE_EDGES.some(e=>e.a.y===gate.y&&e.b.y===gate.y&&e.a.x<gate.x&&e.b.x>gate.x)).toBe(false);
    }
    for(const e of FENCE_EDGES)expect(Math.abs(e.a.x-e.b.x)+Math.abs(e.a.y-e.b.y)).toBe(1);
  });
  it('reserves access routes and parks scenery outside building land',()=>{
    const sim=new GameSimulation(),cash=sim.cash;
    expect(sim.placeEquipment('bargain_pv','site_a',{x:4,y:10})).toBe(false);
    expect(sim.placeEquipment('bargain_pv','site_a',{x:7,y:7})).toBe(false);
    expect(sim.cash).toBe(cash);
    for(const p of SCENERY)expect(clearForScenery(p.x,p.y)).toBe(true);
  });
  it('uses the same tile-centre convention for picking and projecting',()=>{
    for(const p of [{x:4,y:4},{x:17,y:15},{x:24,y:10}]) {
      const s=isoToScreen(p.x,p.y),q=screenToIso(s.x,s.y);
      expect({x:Math.floor(q.x+.5),y:Math.floor(q.y+.5)}).toEqual(p);
    }
  });
  it('routes cross-river staff through the bridge rather than through water',()=>{
    for(const route of [staffRoute({x:7,y:12},{x:25,y:12}),staffRoute({x:25,y:12},{x:7,y:12})]){
      for(let t=0;t<=1;t+=.005){const p=alongPath(route,t);if(isWater(p.x,p.y))expect(p.y).toBe(3);}
      expect(alongPath(route,0)).toEqual(route[0]);expect(alongPath(route,1)).toEqual(route[route.length-1]);
    }
  });
});
