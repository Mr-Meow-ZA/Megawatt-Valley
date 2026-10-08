
import * as T from 'three';
import {makePortrait,type PortraitIdentity} from './portraitModels';
import type {StaffMember} from '../../simulation/types';
export const PORTRAITS:Partial<Record<StaffMember['role'],string>>={};
const identities:Partial<Record<PortraitIdentity,string>>={};
export function portraitFor(m:StaffMember):string{return m.name==='Tess Volt'?identities.tess??'':PORTRAITS[m.role]??'';}
/** Pre-render once at startup, without touching the world renderer during play. */
export function renderPortraits(renderer:T.WebGLRenderer):void{
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-.85,.85,1.04,-1.04,.01,10);
 scene.add(new T.HemisphereLight(0xe8f4ff,0x698783,2));
 const key=new T.DirectionalLight(0xffeddd,2.5);key.position.set(-2,4,5);scene.add(key);
 const fill=new T.DirectionalLight(0xd0e7ff,.7);fill.position.set(3,2,-2);scene.add(fill);
 camera.position.set(.75,1.7,4);camera.lookAt(0,1.27,0);
 renderer.setSize(420,520,false);renderer.setClearColor(0x19383b,0);
 for(const identity of ['tess','amir','nia','morgan','sam'] as const){
  const model=makePortrait(identity);scene.add(model);renderer.render(scene,camera);
  identities[identity]=renderer.domElement.toDataURL('image/png');scene.remove(model);
  const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();
  model.traverse(o=>{if(o instanceof T.Mesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});
  geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
 }
 PORTRAITS.technician=identities.amir;PORTRAITS.cleaner=identities.nia;PORTRAITS.engineer=identities.morgan;PORTRAITS.manager=identities.sam;
}
