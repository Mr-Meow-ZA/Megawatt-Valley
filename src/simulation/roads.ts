import { ROAD_TILES,staffRoute } from '../content/valleyLayout';
import type {PlacedEquipment,Vec2} from './types';
export const roadKey=(p:Vec2)=>p.x+','+p.y;
const steps=[{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];
/** Only roads joined to the permanent access network provide service access. */
export function connectedRoads(equipment:PlacedEquipment[]):Map<string,Vec2>{
  const all=new Map(ROAD_TILES.map(p=>[roadKey(p),p]));
  for(const e of equipment)if(e.kind==='road'&&e.commissioned)all.set(roadKey(e.tile),e.tile);
  const found=new Map(ROAD_TILES.map(p=>[roadKey(p),p])),queue=[...ROAD_TILES];
  for(let i=0;i<queue.length;i++)for(const d of steps){
    const p={x:queue[i].x+d.x,y:queue[i].y+d.y},key=roadKey(p);
    if(all.has(key)&&!found.has(key)){found.set(key,p);queue.push(p);}
  }
  return found;
}
export function roadRoute(from:Vec2,to:Vec2,equipment:PlacedEquipment[]):Vec2[]{
  const network=connectedRoads(equipment),points=[...network.values()];
  const nearest=(p:Vec2)=>points.reduce((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)<Math.hypot(b.x-p.x,b.y-p.y)?a:b);
  const start=nearest(from),end=nearest(to);
  if(Math.hypot(end.x-to.x,end.y-to.y)>2.5)return staffRoute(from,to);
  const queue=[start],parents=new Map<string,string|null>([[roadKey(start),null]]);
  for(let i=0;i<queue.length&&!parents.has(roadKey(end));i++)for(const d of steps){
    const p={x:queue[i].x+d.x,y:queue[i].y+d.y},key=roadKey(p);
    if(network.has(key)&&!parents.has(key)){parents.set(key,roadKey(queue[i]));queue.push(p);}
  }
  if(!parents.has(roadKey(end)))return staffRoute(from,to);
  const path:Vec2[]=[];let key:string|null=roadKey(end);
  while(key!==null){path.unshift(network.get(key)!);key=parents.get(key)??null;}
  return [from,...path,to];
}
/** Cardinal L-strokes have no diagonal gaps; Shift swaps the bend. */
export function roadStroke(a:Vec2,b:Vec2,swap=false):Vec2[]{
  const out=[{...a}],vertical=Math.abs(b.y-a.y)>Math.abs(b.x-a.x);
  const walk=(axis:'x'|'y')=>{let p=out[out.length-1];while(p[axis]!==b[axis]&&out.length<160){p={...p,[axis]:p[axis]+Math.sign(b[axis]-p[axis])};out.push(p);}};
  if(vertical!==swap){walk('y');walk('x');}else{walk('x');walk('y');}return out;
}
