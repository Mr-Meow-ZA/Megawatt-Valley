/** Shared world-space layout. Tile integers are cell CENTRES, edges are n +/- .5.
 * Roads are a connected graph; fences live on edges; scenery never occupies a lot.
 * Rendering, placement validation and minimap all consume this module.
 */
export const WORLD_W = 42, WORLD_H = 30;
export const ACCESS_Y = 1;
export const SITE_A = { x0:4, x1:18, y0:4, y1:16 };
export const OFFICE_YARD = { x0:5, x1:8, y0:5, y1:9 };
export const PICNIC_POINT = { x:7, y:5.3 };
export const SITE_B = { x0:22, x1:34, y0:6, y1:16 };
export type Point = { x:number; y:number };
export type Boundary = { a:Point; b:Point };
export function inRect(x:number,y:number,r:typeof SITE_A):boolean { return x>=r.x0-.5 && x<r.x1-.5 && y>=r.y0-.5 && y<r.y1-.5; }
export function riverCenterX(y:number):number { return 19.7 + Math.sin(y*.2)*.28 + (y>17?Math.sin((y-17)*.25)*1.3:0); }
export function riverHalfWidth(y:number):number { return 1.15+(y>17?Math.sin((y-17)*.2)*.3:Math.sin(y*.7)*.06); }
export function isWater(x:number,y:number):boolean { return Math.abs(x-riverCenterX(y)) < riverHalfWidth(y); }
export function isBank(x:number,y:number):boolean { const d=Math.abs(x-riverCenterX(y)); return d>=riverHalfWidth(y) && d<riverHalfWidth(y)+.5; }
export const ROAD_TILES:Point[] = [];
const roadSet=new Set<string>();
function road(x:number,y:number) { const key=x+','+y;if(!roadSet.has(key)){roadSet.add(key);ROAD_TILES.push({x,y});} }
for(let x=0;x<WORLD_W;x++) road(x,ACCESS_Y);
for(let y=ACCESS_Y;y<=14;y++) road(4,y);
for(let x=4;x<=16;x++) road(x,4);
for(let y=ACCESS_Y;y<=14;y++) road(22,y);
for(let x=22;x<=31;x++) road(x,6);
export function isMainRoad(x:number,y:number):boolean {return roadSet.has(Math.round(x)+','+Math.round(y));}
export const DIRECTIONS = [{x:1,y:0,bit:1},{x:0,y:1,bit:2},{x:-1,y:0,bit:4},{x:0,y:-1,bit:8}];
export function connectionMask(x:number,y:number,has:(x:number,y:number)=>boolean):number {
  return DIRECTIONS.reduce((mask,d)=>mask|(has(x+d.x,y+d.y)?d.bit:0),0);
}
/** A gate opening is a missing edge, never a fence painted across an access road. */
export const FENCE_EDGES:Boundary[] = [];
function boundary(x0:number,y0:number,x1:number,y1:number,gateX:number) {
  for(let x=x0;x<x1;x++){if(x!==gateX)FENCE_EDGES.push({a:{x:x-.5,y:y0-.5},b:{x:x+.5,y:y0-.5}});
    FENCE_EDGES.push({a:{x:x-.5,y:y1-.5},b:{x:x+.5,y:y1-.5}});}
  for(let y=y0;y<y1;y++)for(const x of [x0-.5,x1-.5])FENCE_EDGES.push({a:{x,y:y-.5},b:{x,y:y+.5}});
}
boundary(4,4,18,16,4); boundary(22,6,34,16,22);
export type Scenery = { kind:'tree'|'shrub'|'rock';x:number;y:number;variant:number;scale:number };
export const SCENERY:Scenery[] = [];
const groves = [
  {x:6,y:0,r:3.4}, {x:13,y:0,r:2.6}, {x:29,y:0,r:4.2},
  {x:1,y:10,r:3}, {x:3,y:21,r:4}, {x:12,y:22,r:3.1},
  {x:30,y:23,r:3.8}, {x:38,y:12,r:4}, {x:39,y:25,r:4.4},
];
function random(seed:number){const n=Math.sin(seed*127.1+311.7)*43758.5453;return n-Math.floor(n);}
export function clearForScenery(x:number,y:number):boolean {
  if(x<.3||y<.3||x>WORLD_W-1.3||y>WORLD_H-1.3)return false;
  if(inRect(x,y,{x0:3,x1:19,y0:3,y1:17})||inRect(x,y,{x0:21,x1:35,y0:5,y1:17}))return false;
  if(Math.abs(x-riverCenterX(y))<riverHalfWidth(y)+.75)return false;
  return !ROAD_TILES.some(p=>Math.hypot(p.x-x,p.y-y)<1.25);
}
for(let g=0;g<groves.length;g++){
  const grove=groves[g];
  for(let i=0;i<34;i++){
    const angle=random(g*100+i)*Math.PI*2,r=Math.sqrt(random(g*100+i+51))*grove.r;
    const x=grove.x+Math.cos(angle)*r,y=grove.y+Math.sin(angle)*r;
    if(!clearForScenery(x,y)||SCENERY.some(p=>Math.hypot(p.x-x,p.y-y)<.78))continue;
    SCENERY.push({kind:i%9===0?'rock':i%5===0?'shrub':'tree',x,y,variant:i%3,scale:.8+random(i+g*5)*.35});
  }
}
// Only a few deliberate riparian clusters, leaving most banks open.
for(const y of [10,18,25])for(const side of [-1,1]){
  const x=riverCenterX(y)+side*1.95;
  if(clearForScenery(x,y))SCENERY.push({kind:'rock',x,y,variant:0,scale:.8});
  if(clearForScenery(x+side*.35,y+.6))SCENERY.push({kind:'shrub',x:x+side*.35,y:y+.6,variant:1,scale:.8});
}

export function alongPath(points:Point[],fraction:number):Point {
  const lengths=points.slice(1).map((p,i)=>Math.hypot(p.x-points[i].x,p.y-points[i].y));
  let remaining=Math.max(0,Math.min(1,fraction))*lengths.reduce((a,b)=>a+b,0);
  for(let i=0;i<lengths.length;i++){if(remaining<=lengths[i]){const t=lengths[i]?remaining/lengths[i]:0;return{x:points[i].x+(points[i+1].x-points[i].x)*t,y:points[i].y+(points[i+1].y-points[i].y)*t};}remaining-=lengths[i];}
  return {...points[points.length-1]};
}
export function staffRoute(from:Point,to:Point):Point[]{
  if((from.x<19)===(to.x<19))return[from,to];
  const firstGate=from.x<19?4:22,secondGate=to.x<19?4:22;
  return[from,{x:firstGate,y:from.y},{x:firstGate,y:ACCESS_Y},{x:secondGate,y:ACCESS_Y},{x:secondGate,y:to.y},to];
}
