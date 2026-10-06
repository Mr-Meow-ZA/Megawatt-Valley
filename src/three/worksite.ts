import * as T from 'three';
import { box,material,batchStatic } from './models';
/** Construction props occupy the purchased footprint and disappear at commissioning. */
export function constructionSite(width:number,depth:number):T.Group{
  const root=new T.Group();
  box(root,0,.015,0,width*.94,.03,depth*.94,0xb5aa8a);
  for(const x of [-width*.4,width*.4])for(const z of [-depth*.4,depth*.4]){
    box(root,x,.035,z,.16,.025,.16,0x5d6554);
    const cone=new T.Mesh(new T.CylinderGeometry(.018,.065,.18,5),material(0xd7994d));cone.position.set(x,.135,z);cone.castShadow=true;root.add(cone);
    box(root,x,.14,z,.069,.03,.069,0xebdeba);
  }
  for(let i=0;i<3;i++)box(root,-width*.2,.08+i*.026,depth*.3,width*.35,.02,.16,0x9ba99b);
  return batchStatic(root);
}
export function workParticles():T.Points{
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(new Float32Array(18*3),3));
  const points=new T.Points(geometry,new T.PointsMaterial({color:0xbbe7e6,size:.035,transparent:true,opacity:.8,depthWrite:false}));
  points.visible=false;points.raycast=()=>{};return points;
}
export function updateWorkParticles(points:T.Points,kind:string,time:number):void{
  points.visible=['clean','repair','service'].includes(kind);if(!points.visible)return;
  const positions=points.geometry.getAttribute('position') as T.BufferAttribute;
  const clean=kind==='clean',mat=points.material as T.PointsMaterial;
  mat.color.set(clean?0xb8e1da:0xe4bf73);mat.size=clean?.025:.02;
  for(let i=0;i<positions.count;i++){
    const phase=(time*(clean?1.8:2.5)+i/positions.count)%1;
    const spread=Math.sin(i*3.7)*phase;
    positions.setXYZ(i,.12+spread*.14,.32+Math.sin(phase*Math.PI)*.18-phase*.25,.13+phase*.24);
  }
  positions.needsUpdate=true;
}
