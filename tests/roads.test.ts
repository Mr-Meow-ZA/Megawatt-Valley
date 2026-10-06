import {describe,it,expect} from 'vitest';
import {GameSimulation} from '../src/simulation/GameSimulation';
import {roadStroke,connectedRoads,roadKey,roadRoute} from '../src/simulation/roads';
describe('connected service roads and continuous construction',()=>{
 it('creates cardinal strokes with either bend and no duplicate tiles',()=>{
  for(const swap of [false,true]){
   const path=roadStroke({x:5,y:10},{x:9,y:13},swap);
   expect(path).toHaveLength(8);expect(new Set(path.map(roadKey)).size).toBe(8);
   for(let i=1;i<path.length;i++)expect(Math.abs(path[i].x-path[i-1].x)+Math.abs(path[i].y-path[i-1].y)).toBe(1);
  }
  expect(roadStroke({x:5,y:10},{x:9,y:13})).not.toEqual(roadStroke({x:5,y:10},{x:9,y:13},true));
 });
 it('charges once for a whole stroke and skips existing road',()=>{
  const s=new GameSimulation(),before=s.cash,path=roadStroke({x:4,y:10},{x:8,y:10});
  expect(s.roadPlan(path).cost).toBe(400);expect(s.placeRoadStroke(path)).toBe(true);
  expect(s.cash).toBe(before-400);expect(s.equipment.filter(e=>e.kind==='road')).toHaveLength(4);
  expect(s.placeRoadStroke(path)).toBe(false);expect(s.cash).toBe(before-400);
 });
 it('rejects collisions and unaffordable plans without partial construction',()=>{
  const s=new GameSimulation(),count=s.equipment.length,before=s.cash;
  expect(s.placeRoadStroke([{x:8,y:10},{x:5,y:5}])).toBe(false);
  expect(s.equipment).toHaveLength(count);expect(s.cash).toBe(before);
  s.cash=250;expect(s.placeRoadStroke(roadStroke({x:4,y:10},{x:8,y:10}))).toBe(false);
  expect(s.cash).toBe(250);expect(s.equipment).toHaveLength(count);
 });
 it('requires commissioning and connection; demolition removes downstream coverage',()=>{
  const s=new GameSimulation();s.placeRoadStroke(roadStroke({x:4,y:10},{x:8,y:10}));
  expect(connectedRoads(s.equipment).has('8,10')).toBe(false);
  for(const e of s.equipment)if(e.kind==='road'){e.commissioned=true;e.constructionProgress=1;}
  expect(connectedRoads(s.equipment).has('8,10')).toBe(true);
  s.demolish(s.equipment.find(e=>e.kind==='road'&&e.tile.x===6)!.id);
  expect(connectedRoads(s.equipment).has('8,10')).toBe(false);
 });
 it('routes service traffic across the bridge',()=>{
  const path=roadRoute({x:5,y:6},{x:24,y:7},new GameSimulation().equipment);
  expect(path.some(p=>p.x===20&&p.y===1)).toBe(true);
 });
});
