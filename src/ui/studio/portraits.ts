import * as T from 'three';
import {makeStaff,sharedCube,isSharedMaterial} from '../../three/models';
import type {StaffMember} from '../../simulation/types';
export const PORTRAITS:Partial<Record<StaffMember['role'],string>>={};
/** Original portrait renders use the same character geometry as the working world. */
export function renderPortraits(renderer:T.WebGLRenderer):void{
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-.23,.23,.29,-.29,.01,10);
 scene.add(new T.HemisphereLight(0xe5f2ff,0x56756a,2));
 const key=new T.DirectionalLight(0xffedce,3);key.position.set(-2,3,4);scene.add(key);
 camera.position.set(.85,.75,2);camera.lookAt(0,.32,0);
 renderer.setSize(360,440,false);renderer.setClearColor(0x19383b,0);
 for(const role of ['technician','cleaner','engineer','manager'] as const){
  const model=makeStaff(role);model.rotation.y=-.12;scene.add(model);renderer.render(scene,camera);
  PORTRAITS[role]=renderer.domElement.toDataURL('image/png');scene.remove(model);
  const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();
  model.traverse(o=>{if(o instanceof T.Mesh){if(o.geometry!==sharedCube)geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])if(!isSharedMaterial(m))materials.add(m);}});
  geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
 }
}
