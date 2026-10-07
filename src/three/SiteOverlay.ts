import * as T from 'three';
import {connectedRoads} from '../simulation/roads';
import {EQUIPMENT} from '../content/equipment';
import type {GameSnapshot,Vec2} from '../simulation/types';
import type {SiteView} from '../ui/tycoon/TycoonHud';
/** Instanced ground information: original data colours, no selection hit targets. */
export class SiteOverlay {
 readonly mesh=new T.InstancedMesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({transparent:true,opacity:.46,depthWrite:false,side:T.DoubleSide}),1024);
 private view:SiteView='normal';
 private key='';
 constructor(scene:T.Scene){this.mesh.count=0;this.mesh.frustumCulled=false;this.mesh.raycast=()=>{};scene.add(this.mesh);}
 setView(view:SiteView):void{this.view=view;this.key='';}
 update(s:GameSnapshot):void{
  this.mesh.visible=this.view!=='normal';if(!this.mesh.visible)return;
  const key=this.view+JSON.stringify(s.equipment.map(e=>[e.id,e.tile.x,e.tile.y,e.commissioned,e.faulted,Math.round(e.condition*100),Math.round(e.soiling*100)]))+s.plots[1].unlocked;
  if(this.key===key)return;this.key=key;
  const matrix=new T.Matrix4(),rotation=new T.Quaternion().setFromEuler(new T.Euler(-Math.PI/2,0,0)),color=new T.Color();let count=0;
  const add=(x:number,y:number,w:number,d:number,value:number)=>{
   matrix.compose(new T.Vector3(x,.08,y),rotation,new T.Vector3(w,d,1));this.mesh.setMatrixAt(count,matrix);
   color.set(value);this.mesh.setColorAt(count++,color);
  };
  if(this.view==='access'){
   const road=[...connectedRoads(s.equipment).values()],served=(p:Vec2)=>road.some(r=>Math.hypot(r.x-p.x,r.y-p.y)<=2.5);
   for(const plot of s.plots)if(plot.unlocked)for(let x=plot.origin.x;x<plot.origin.x+plot.size.x;x++)for(let y=plot.origin.y;y<plot.origin.y+plot.size.y;y++)add(x,y,.92,.92,served({x,y})?0x72b872:0xe1aa51);
  }else for(const e of s.equipment)if(e.kind.includes('pv')||e.kind==='inverter'){
   const def=EQUIPMENT[e.kind],value=this.view==='condition'?(e.faulted?0:e.condition):this.view==='dust'?1-e.soiling:e.commissioned&&!e.faulted?1:0;
   const shade=value>.75?0x75ba72:value>.4?0xe7b852:0xcf6652;
   add(e.tile.x+(def.footprint.x-1)/2,e.tile.y+(def.footprint.y-1)/2,def.footprint.x+.2,def.footprint.y+.2,shade);
  }
  this.mesh.count=count;this.mesh.instanceMatrix.needsUpdate=true;if(this.mesh.instanceColor)this.mesh.instanceColor.needsUpdate=true;
 }
}
