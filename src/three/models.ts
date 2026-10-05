import * as T from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { EquipmentKind } from '../simulation/types';
declare global { interface Window { __MW_MODELS__?: Record<string,string>; } }
const industrial = '/assets/sourced/kenney-city-kit-industrial/Models/GLB format/';
const nature = '/assets/sourced/kenney-nature-kit/Models/GLTF format/';
export const MODEL_FILES: Record<string,string> = {
  solar: industrial+'solar-panel-landscape-group.glb',
  office: industrial+'building-p.glb', workshop: industrial+'building-i.glb',
  oak: nature+'tree_oak.glb', pine: nature+'tree_pineRoundA.glb', alder: nature+'tree_oak_dark.glb',
  shrub: nature+'plant_bush.glb', rock: nature+'stone_largeA.glb',
};
export const sharedCube = new T.BoxGeometry(1,1,1);
const materials = new Map<number,T.MeshStandardMaterial>();
export function isSharedMaterial(m:T.Material):boolean{return [...materials.values()].includes(m as T.MeshStandardMaterial);}
export function material(color:number):T.MeshStandardMaterial {
  let m=materials.get(color); if(!m){m=new T.MeshStandardMaterial({color,roughness:.86});materials.set(color,m);}return m;
}
export function box(parent:T.Object3D,x:number,y:number,z:number,w:number,h:number,d:number,color:number):T.Mesh {
  const mesh=new T.Mesh(sharedCube,material(color)); mesh.position.set(x,y,z);mesh.scale.set(w,h,d);
  mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
export function beam(parent:T.Object3D,a:T.Vector3,b:T.Vector3,width:number,color:number):T.Mesh {
  const delta=b.clone().sub(a),mesh=box(parent,0,0,0,width,delta.length(),width,color);
  mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return mesh;
}
export function fence(parent:T.Object3D,x0:number,z0:number,x1:number,z1:number,height=.36):void {
  for(const [x,z] of [[x0,z0],[x1,z1]])box(parent,x,height/2,z,.045,height,.045,0x72836d);
  for(const y of [height*.4,height*.86])beam(parent,new T.Vector3(x0,y,z0),new T.Vector3(x1,y,z1),.018,0xc7ccab);
}
export class ModelLibrary {
  readonly templates=new Map<string,T.Group>();
  async load():Promise<void> {
    const loader=new GLTFLoader();
    await Promise.all(Object.entries(MODEL_FILES).map(async([key,url])=>{
      let model;
      const data=window.__MW_MODELS__?.[key];
      if(data){const bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0));model=await loader.parseAsync(bytes.buffer,'');}
      else model=await loader.loadAsync(url);
      const group=model.scene;
      group.traverse(o=>{if(o instanceof T.Mesh){o.castShadow=true;o.receiveShadow=true;
        for(const m of Array.isArray(o.material)?o.material:[o.material]){
          if(m instanceof T.MeshStandardMaterial){m.metalness=0;m.roughness=.86;}
        }}});
      this.templates.set(key,group);
    }));
  }
  model(key:string,width:number,depth?:number,height?:number):T.Group {
    const source=this.templates.get(key);if(!source)throw new Error('Missing 3D model: '+key);
    const root=new T.Group(),inner=source.clone(true),bounds=new T.Box3().setFromObject(inner),size=bounds.getSize(new T.Vector3());
    const scale=height?height/size.y:width/Math.max(size.x,size.z);
    inner.scale.setScalar(scale);
    if(depth)inner.scale.set(width/size.x,scale,depth/size.z);
    inner.position.set(-(bounds.min.x+size.x/2)*inner.scale.x,-bounds.min.y*inner.scale.y,-(bounds.min.z+size.z/2)*inner.scale.z);
    root.add(inner);return root;
  }
  equipment(kind:EquipmentKind):T.Group {
    if(kind==='office'||kind==='workshop')return this.model(kind,1.82,1.72);
    if(kind==='tree')return this.model('oak',1.2,undefined,1.9);
    const root=new T.Group();
    if(kind==='bargain_pv'||kind==='premium_pv'){
      const pv=this.model('solar',1.78,1.7);
      // Clone materials per array so grime and premium tint cannot affect neighbours.
      pv.traverse(o=>{if(o instanceof T.Mesh){
        const convert=(m:T.Material)=>{const copy=m.clone() as T.MeshStandardMaterial;copy.roughness=.5;copy.userData.baseColor=copy.color.clone();return copy;};
        o.material=Array.isArray(o.material)?o.material.map(convert):convert(o.material);
      }});
      root.add(pv);
      if(kind==='premium_pv')for(const x of [-.91,.91])box(root,x,.08,0,.045,.07,1.76,0xd3d9cd);
    }else if(kind==='inverter'||kind==='substation'){
      box(root,0,.04,0,kind==='substation'?1.7:.8,.08,kind==='substation'?1.7:.8,0xb8baa9);
      for(const x of kind==='substation'?[-.42,.42]:[0]){
        box(root,x,.38,0,.48,.66,.45,0xc9d0c1);box(root,x,.74,0,.53,.05,.49,0x667a76);
        box(root,x,.42,.232,.36,.42,.015,0xa9b7ac);
        box(root,x+.13,.52,.247,.035,.045,.01,0x94c85f);
        for(let i=0;i<5;i++)box(root,x-.13+i*.065,.22,.249,.026,.08,.01,0x597075);
        if(kind==='substation')for(const z of [-.12,.12]){box(root,x,.86,z,.045,.22,.045,0x667675);for(const y of [.8,.85,.9])box(root,x,y,z,.085,.025,.085,0xb7bba5);}
      }
    }else if(kind==='road'){box(root,0,.025,0,1,.05,1,0xbbad88);}
    else if(kind==='fence')fence(root,-.5,0,.5,0);
    else if(kind==='gate'){fence(root,-.5,0,-.5,.55);fence(root,.5,0,.5,.55);box(root,0,.34,.53,1,.025,.025,0xd2c493);}
    else if(kind==='sign'){
      box(root,0,.24,0,.035,.48,.035,0x7a6650);box(root,0,.43,0,.42,.22,.045,0xead7a7);
      box(root,0,.44,.026,.28,.024,.008,0x617663);box(root,0,.38,.026,.2,.018,.008,0x617663);
    }
    return root;
  }
}
export function makeStaff(role:string):T.Group {
  const root=new T.Group(),body=new T.Group();root.add(body);body.name='body';
  const color=role==='cleaner'?0x51a6aa:role==='engineer'?0x738aaf:role==='manager'?0x799267:0xe5a146;
  box(body,0,.27,0,.16,.2,.11,color);box(body,0,.3,.061,.17,.025,.012,0xe6dfb5);
  box(body,0,.425,0,.125,.12,.12,0xd4a67b);
  box(body,0,.494,0,.15,.055,.15,role==='engineer'?0xebeee0:0xf3d068);
  box(body,0,.474,.043,.17,.018,.16,0xf1d177);
  box(body,.035,.438,.062,.023,.017,.009,0x344c4a);box(body,-.035,.438,.062,.023,.017,.009,0x344c4a);
  for(const side of [-1,1]){
    const leg=new T.Group();leg.name=side===-1?'legL':'legR';leg.position.set(side*.047,.18,0);body.add(leg);
    box(leg,0,-.07,0,.064,.14,.075,0x3e5663);box(leg,0,-.15,.019,.073,.045,.12,0x344a48);
    const arm=new T.Group();arm.name=side===-1?'armL':'armR';arm.position.set(side*.107,.35,0);body.add(arm);
    box(arm,0,-.07,0,.051,.14,.06,color);box(arm,0,-.151,0,.046,.04,.05,0xd4a67b);
  }
  box(body,.13,.135,.01,.12,.095,.08,role==='cleaner'?0x67b0b4:0xab6946);
  const tool=new T.Group();tool.name='tool';tool.visible=false;root.add(tool);
  box(tool,.18,.24,.14,.026,.43,.026,0xb4bfb1);box(tool,.18,.04,.14,.26,.03,.095,0x4d9496);
  return root;
}
export function makeVan():T.Group{
  const root=new T.Group();box(root,0,.26,0,.47,.38,.86,0xe6e5cf);
  box(root,0,.47,.22,.45,.11,.4,0xd9dfcc);box(root,0,.42,.44,.37,.17,.016,0x4e797c);
  box(root,.245,.29,0,.012,.14,.43,0x74a195);
  for(const x of [-.25,.25])for(const z of [-.28,.28]){const wheel=new T.Mesh(new T.CylinderGeometry(.105,.105,.05,10),material(0x384c46));wheel.rotation.z=Math.PI/2;wheel.position.set(x,.13,z);root.add(wheel);}
  for(const x of [-.16,.16])box(root,x,.26,.441,.095,.055,.015,0xffe3a3);
  return root;
}
/** Static meshes are grouped into instanced draws, with real geometry and shadows. */
export function batchStatic(source:T.Group):T.Group {
  source.updateMatrixWorld(true);const batches=new Map<string,{geometry:T.BufferGeometry;material:T.Material|T.Material[];matrices:T.Matrix4[]}>();
  source.traverse(o=>{if(!(o instanceof T.Mesh))return;
    const key=o.geometry.uuid+':'+(Array.isArray(o.material)?o.material.map(m=>m.uuid).join(','):o.material.uuid);
    let group=batches.get(key);if(!group){group={geometry:o.geometry,material:o.material,matrices:[]};batches.set(key,group);}group.matrices.push(o.matrixWorld.clone());
  });
  const result=new T.Group();for(const b of batches.values()){const mesh=new T.InstancedMesh(b.geometry,b.material,b.matrices.length);b.matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=true;mesh.receiveShadow=true;mesh.computeBoundingSphere();result.add(mesh);}return result;
}
