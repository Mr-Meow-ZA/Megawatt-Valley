import * as T from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DIRECTIONS } from '../content/valleyLayout';
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

/** Original campus assets share the same proportions and palette as the valley.
 * Geometry stays within the purchased footprint; static detail is instanced.
 */
function planter(root:T.Group,x:number,z:number,w=.3):void{
  box(root,x,.085,z,w,.17,.23,0xb4aa89);
  box(root,x,.179,z,w-.035,.022,.19,0x685d49);
  for(let i=0;i<3;i++){
    box(root,x+(i-1)*w*.24,.24+(i%2)*.04,z,w*.3,.14,.15,0x729366);
    box(root,x+(i-1)*w*.24,.315+(i%2)*.04,z,.045,.032,.045,i%2?0xe1b56b:0xe3d9ab);
  }
}
function windowPanel(root:T.Group,x:number,y:number,z:number,w:number,h:number):void{
  box(root,x,y,z,w+.04,h+.045,.025,0x496b68);
  box(root,x,y,z+.017,w,h,.018,0x8cb8b4);
  box(root,x,y+h*.2,z+.029,w-.035,.025,.008,0xcce0cc);
  box(root,x,y,z+.036,.025,h,.01,0xf0ebd9);
  box(root,x,y-h*.5-.025,z+.035,w+.07,.035,.07,0xe0d8c0);
}
function campusBuilding(kind:'office'|'workshop'):T.Group{
  const root=new T.Group(),work=kind==='workshop';
  box(root,0,.028,0,1.94,.056,1.94,0xc3bca5);
  box(root,0,.075,-.13,1.79,.095,1.54,0x7a8980);
  if(!work){
    box(root,0,.55,-.23,1.7,.9,1.26,0xe4ddc7);
    box(root,0,.17,-.23,1.74,.11,1.29,0x8b9a87);
    // Warm cladding, generous glazing and a recessed front entrance.
    for(const x of [-.53,-.05])windowPanel(root,x,.6,.411,.37,.46);
    box(root,.52,.47,.407,.35,.7,.027,0x466964);
    box(root,.52,.55,.427,.27,.45,.018,0x93b8b0);
    box(root,.63,.44,.445,.022,.11,.02,0xe5d8ae);
    box(root,.52,.105,.62,.5,.06,.42,0xd8d1b9);
    box(root,.52,.06,.87,.6,.045,.16,0xb2b7a1);
    for(const x of [-.8,.8])box(root,x,.54,.435,.085,.9,.055,0x9b9475);
    const side=new T.Group();side.rotation.y=Math.PI/2;side.position.set(.856,0,-.22);root.add(side);
    windowPanel(side,0,.6,0,.8,.46);
    box(root,0,1.035,-.2,1.87,.105,1.43,0x4e7369);
    box(root,0,1.103,-.2,1.64,.035,1.2,0x849386);
    // Raised roof edges, HVAC and paired rooftop modules.
    for(const x of [-.9,.9])box(root,x,1.13,-.2,.055,.1,1.4,0x4e7369);
    box(root,0,1.13,-.88,1.82,.1,.055,0x4e7369);
    box(root,.53,1.18,-.53,.35,.13,.3,0xc8cbbb);
    for(let i=0;i<5;i++)box(root,.53,1.252,-.63+i*.047,.25,.01,.012,0x738a81);
    for(const x of [-.52,-.12]){
      const panel=box(root,x,1.17,-.38,.33,.035,.57,0x38657b);panel.rotation.x=.14;
      for(let i=0;i<3;i++)box(root,x,1.19,-.56+i*.17,.3,.008,.009,0x83a6b0);
    }
    // Entrance branding and a shaded bench, all inside the lot.
    box(root,0,.94,.51,1.82,.12,.17,0x376f5b);
    for(let i=0;i<6;i++)box(root,-.5+i*.11,.95,.601,.065,.025,.009,0xe7e5c6);
    box(root,-.42,.26,.69,.65,.055,.2,0xb8986b);
    for(const x of [-.65,-.19])box(root,x,.16,.69,.045,.2,.17,0x55756b);
    planter(root,-.76,.8,.23);
  }else{
    // Open maintenance bay: actual depth, front piers, rear wall and equipment.
    box(root,0,.57,-.79,1.76,.97,.12,0xd8d2b8);
    for(const x of [-.83,.83])box(root,x,.57,-.16,.12,.97,1.35,0xd8d2b8);
    box(root,.5,.57,.45,.5,.97,.11,0xd8d2b8);
    box(root,-.12,.98,.49,1.34,.12,.12,0x547268);
    box(root,0,1.035,-.18,1.85,.11,1.48,0x5a756d);
    for(let i=0;i<9;i++)box(root,0,1.102,-.79+i*.15,1.8,.02,.022,0x718980);
    for(const x of [-.74,.25])box(root,x,.53,.53,.09,.87,.085,0xcf975b);
    box(root,-.24,.94,.59,1.13,.14,.09,0xcf975b);
    box(root,-.23,.16,.71,1.05,.05,.43,0x959e8b);
    // Tool bench and pegboard are visible through the bay.
    box(root,-.35,.43,-.61,.75,.065,.26,0xc6ad79);
    box(root,-.35,.59,-.714,.73,.24,.025,0x647f71);
    for(let i=0;i<5;i++)box(root,-.64+i*.14,.59,-.69,.025,.13,.025,0xc9cdb9);
    for(const x of [-.64,-.07])box(root,x,.25,-.61,.045,.35,.19,0x5d7168);
    box(root,-.52,.25,.18,.31,.35,.28,0xb76746);
    for(let i=0;i<3;i++)box(root,-.52,.18+i*.08,.327,.24,.014,.014,0xe3ca9e);
    box(root,-.05,.26,-.22,.28,.27,.38,0x688b79);
    box(root,-.05,.42,-.22,.32,.06,.4,0xc7cbb7);
    box(root,.52,.51,.517,.25,.5,.018,0x47716a);
    box(root,.52,.62,.533,.19,.18,.012,0x9bbdb0);
    box(root,.53,1.19,-.57,.28,.26,.24,0x9ca99a);
    for(let i=0;i<4;i++)box(root,.53,1.21+i*.035,-.44,.22,.012,.01,0x556c64);
    for(const x of [-.69,.16]){
      box(root,x,.14,.86,.07,.22,.07,0xe4c472);
      box(root,x,.21,.86,.074,.055,.074,0x4b665d);
    }
    planter(root,.68,.78,.33);
  }
  const result=batchStatic(root);result.name=work?'Open maintenance workshop':'Sunny Meadow operations office';return result;
}
function solarRack(premium:boolean):T.Group{
  const root=new T.Group();
  const blue=premium?0x24495f:0x335c77;
  for(const z of [-.57,0,.57]){
    for(const x of [-.64,.64]){
      box(root,x,.035,z,.15,.07,.23,0xc1bea8);
      beam(root,new T.Vector3(x,.05,z-.15),new T.Vector3(x,.44,z-.15),.034,0x8e9f9a);
      beam(root,new T.Vector3(x,.05,z+.15),new T.Vector3(x,.3,z+.15),.034,0x8e9f9a);
    }
    box(root,0,.31,z+.15,1.68,.035,.04,0x839b96);
    const row=new T.Group();row.position.set(0,.38,z);row.rotation.x=.42;root.add(row);
    for(let i=0;i<4;i++){
      const x=-.645+i*.43;
      box(row,x,0,0,.414,.045,.5,premium?0xbdc9c4:0x8faaa9);
      box(row,x,.032,0,.38,.016,.466,blue);
      for(let cell=0;cell<3;cell++)box(row,x-.127+cell*.127,.045,0,.006,.003,.46,0x7da0b2);
      for(let cell=0;cell<5;cell++)box(row,x,.045,-.185+cell*.093,.376,.003,.005,0x7da0b2);
    }
  }
  box(root,.83,.15,.75,.17,.24,.12,0xb5c3b5);
  const result=batchStatic(root);result.name=premium?'HelioSure reinforced solar racks':'Sun-ish fixed tilt solar racks';
  result.traverse(o=>{if(o instanceof T.Mesh){
    const convert=(m:T.Material)=>{const mat=m as T.MeshStandardMaterial;
      if(mat.color.getHex()!==blue&&mat.color.getHex()!==0x7da0b2)return m;
      const copy=mat.clone();copy.roughness=.88;copy.userData.baseColor=copy.color.clone();return copy;};
    o.material=Array.isArray(o.material)?o.material.map(convert):convert(o.material);
  }});
  return result;
}
function gridEquipment(substation:boolean):T.Group{
  const root=new T.Group();
  box(root,0,.04,0,substation?1.88:.84,.08,substation?1.88:.84,0xc5c3b0);
  for(const x of substation?[-.39,.39]:[0]){
    box(root,x,.15,-.15,.57,.14,.6,0x819286);
    box(root,x,.43,-.15,.45,.46,.43,0xb8c5b5);
    box(root,x,.69,-.15,.52,.07,.49,0x657f75);
    for(let i=0;i<7;i++)box(root,x-.225+i*.075,.41,.1,.024,.37,.075,0x869e92);
    box(root,x,.41,.147,.19,.2,.018,0xcbd1ba);
    box(root,x+.055,.47,.16,.04,.025,.009,0x8abc72);
    if(substation){
      for(const z of [-.29,-.02]){
        box(root,x,.85,z,.045,.28,.045,0x667d73);
        for(const y of [.77,.83,.89])box(root,x,y,z,.09,.023,.09,0xd6cbae);
      }
      box(root,x,.99,-.15,.045,.025,.3,0x708b80);
    }
  }
  if(substation){
    fence(root,-.9,-.9,.9,-.9,.48);
    fence(root,-.9,-.9,-.9,.9,.48);fence(root,.9,-.9,.9,.9,.48);
    fence(root,-.9,.9,-.38,.9,.48);fence(root,.38,.9,.9,.9,.48);
    // Open pedestrian gate and buried cable trench through the compound.
    box(root,0,.087,.58,.25,.014,.65,0xa2ac98);
    for(let i=0;i<5;i++)box(root,0,.096,.32+i*.12,.2,.008,.015,0x657d72);
    box(root,.63,.32,.904,.19,.13,.02,0xe0be70);
  }
  const result=batchStatic(root);result.name=substation?'Fenced grid connection':'Vented string inverter';return result;
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
          if(m instanceof T.MeshStandardMaterial){
            m.metalness=0;m.roughness=.86;
            const name=m.name.toLowerCase();
            if(['oak','pine','alder','shrub'].includes(key)){
              if(name.includes('leaf')||name.includes('grass'))m.color.set(key==='pine'?0x568358:key==='alder'?0x8b9b50:0x71964c);
              else if(name.includes('wood'))m.color.set(0x806347);
            }
          }
        }}});
      this.templates.set(key,group);
    }));
  }
  model(key:string,width:number,depth?:number,height?:number):T.Group {
    const source=this.templates.get(key);if(!source)throw new Error('Missing 3D model: '+key);
    const root=new T.Group(),inner=source.clone(true);
    // Source facades and tilted module faces point away from the default camera.
    if(['solar','office','workshop'].includes(key))inner.rotation.y+=Math.PI;
    const bounds=new T.Box3().setFromObject(inner),size=bounds.getSize(new T.Vector3());
    const scale=height?height/size.y:width/Math.max(size.x,size.z);
    inner.scale.setScalar(scale);
    if(depth)inner.scale.set(width/size.x,scale,depth/size.z);
    inner.position.set(-(bounds.min.x+size.x/2)*inner.scale.x,-bounds.min.y*inner.scale.y,-(bounds.min.z+size.z/2)*inner.scale.z);
    root.add(inner);return root;
  }
  equipment(kind:EquipmentKind,connections=5):T.Group {
    if(kind==='office'||kind==='workshop')return campusBuilding(kind);
    if(kind==='tree')return this.model('oak',1.2,undefined,1.9);
    if(kind==='bargain_pv'||kind==='premium_pv')return solarRack(kind==='premium_pv');
    if(kind==='inverter'||kind==='substation')return gridEquipment(kind==='substation');
    const root=new T.Group();
    if(kind==='road'){box(root,0,.025,0,1,.05,1,0xb8ab88);}
    else if(kind==='fence'){
      for(const d of DIRECTIONS)if(connections&d.bit)fence(root,0,0,d.x*.5,d.y*.5);
    }
    else if(kind==='gate'){
      fence(root,-.5,0,-.32,.38,.42);fence(root,.5,0,.32,.38,.42);
      for(const x of [-.5,.5])box(root,x,.445,0,.065,.035,.065,0xdcc69b);
      if(!(connections&5))root.rotation.y=Math.PI/2;
    }
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
  const torso=new T.Mesh(new T.CapsuleGeometry(.065,.085,3,8),material(color));
  torso.position.y=.275;torso.scale.set(1.18,1,.88);torso.castShadow=true;body.add(torso);
  box(body,0,.3,.059,.16,.023,.014,0xe6dfb5);
  for(const x of [-.045,.045])box(body,x,.32,.06,.018,.11,.014,0xe6dfb5);
  const head=new T.Mesh(new T.SphereGeometry(1,10,7),material(0xd4a67b));
  head.position.y=.425;head.scale.set(.067,.073,.061);head.castShadow=true;body.add(head);
  const helmet=new T.Mesh(new T.SphereGeometry(1,10,5),material(role==='engineer'?0xebeee0:0xf3d068));
  helmet.position.y=.488;helmet.scale.set(.081,.043,.08);helmet.castShadow=true;body.add(helmet);
  const brim=new T.Mesh(new T.CylinderGeometry(.088,.088,.016,12),material(0xe8bf5e));
  brim.position.set(0,.475,.011);brim.castShadow=true;body.add(brim);
  box(body,0,.524,0,.022,.025,.105,0xf5d777);
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
  for(const x of [-.24,.24]){
    box(root,x,.29,-.12,.015,.13,.46,0x74a195);
    box(root,x,.43,.24,.016,.16,.25,0x608b8b);
    box(root,x,.295,.22,.02,.022,.085,0x526e63);
    box(root,x,.315,-.2,.02,.023,.07,0x526e63);
    box(root,x*1.13,.38,.34,.055,.065,.07,0x6c8478);
  }
  box(root,0,.14,.435,.43,.065,.045,0x667d70);
  box(root,0,.16,-.435,.43,.065,.035,0x667d70);
  box(root,0,.23,.46,.13,.04,.012,0xd9d8b8);
  for(const z of [-.33,-.13,.07])box(root,0,.474,z,.37,.035,.026,0x839889);
  for(const x of [-.17,.17])box(root,x,.5,-.13,.02,.035,.49,0xc0c9b6);
  for(const x of [-.25,.25])for(const z of [-.28,.28]){const wheel=new T.Mesh(new T.CylinderGeometry(.105,.105,.05,10),material(0x384c46));wheel.rotation.z=Math.PI/2;wheel.position.set(x,.13,z);wheel.castShadow=true;root.add(wheel);}
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
