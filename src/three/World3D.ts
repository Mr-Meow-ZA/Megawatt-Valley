import * as T from 'three';
import {fenceConnections} from './connections';
import {SiteOverlay} from './SiteOverlay';
import type {SiteView} from '../ui/tycoon/TycoonHud';
import { ValleyActivity } from './ValleyActivity';
import { constructionSite,workParticles,updateWorkParticles } from './worksite';
import { GameSimulation } from '../simulation/GameSimulation';
import type { GameSnapshot,EquipmentKind,PlacedEquipment,StaffMember,Vec2 } from '../simulation/types';
import { EQUIPMENT } from '../content/equipment';
import { SITE_ICONS } from '../game/siteArt';
import { ModelLibrary,makeStaff,sharedCube,isSharedMaterial } from './models';
import { buildLandscape,type Landscape } from './landscape';
import { frameCamera, HOME, PIXELS_PER_UNIT,anchoredZoom } from './projection';

interface Visual { root:T.Group; model:T.Group; status:HTMLDivElement; kind:string; connections?:number; construction?:T.Group; particles?:T.Points; }
export class World3D {
  readonly scene=new T.Scene();
  readonly camera=new T.OrthographicCamera(-10,10,10,-10,.1,180);
  readonly target=HOME.clone();
  zoom=.62;
  private readonly sun=new T.DirectionalLight(0xffedca,3);
  private readonly sky=new T.HemisphereLight(0xd5edee,0x81915f,2);
  private readonly raycaster=new T.Raycaster();
  private readonly ground=new T.Plane(new T.Vector3(0,1,0),0);
  private readonly entities=new Map<string,Visual>();
  private readonly labelLayer=document.createElement('div');
  private readonly hint=document.createElement('div');
  private readonly selection=new T.Group();
  private readonly preview=new T.Group();
  private ghost:T.Group|null=null;
  private roadPath:Vec2[]|null=null;
  private readonly roadPreview=new T.InstancedMesh(new T.PlaneGeometry(.96,.96),new T.MeshBasicMaterial({transparent:true,opacity:.85,depthWrite:false,side:T.DoubleSide}),160);
  private readonly dataView:SiteOverlay;
  private ghostKey='';
  private readonly landscape:Landscape;
  private readonly activity:ValleyActivity;
  private readonly rain:T.Points;
  private readonly rainPositions=new Float32Array(420*3);
  private readonly labelB:HTMLDivElement;
  private pointer={x:-1,y:-1,inside:false};
  private elapsed=0;
  private lastShadow=0;
  private shadowKey='';
  private width=innerWidth;
  private height=innerHeight;
  private weatherKey='';
  private overlay=false;
  private selectionKey='';
  private readonly selectedMaterial=new T.MeshBasicMaterial({color:0xffe0a1,transparent:true,opacity:.9,depthTest:false});
  private readonly validMaterial=new T.MeshBasicMaterial({color:0x79e3b3,transparent:true,opacity:.27,depthWrite:false,side:T.DoubleSide});
  private readonly invalidMaterial=new T.MeshBasicMaterial({color:0xe77969,transparent:true,opacity:.32,depthWrite:false,side:T.DoubleSide});
  constructor(readonly renderer:T.WebGLRenderer,readonly models:ModelLibrary,private readonly sim:GameSimulation){
    this.scene.background=new T.Color(0xabc8bf);this.scene.fog=new T.Fog(0xabc8bf,82,130);
    this.sun.position.set(-8,28,7);this.sun.target.position.set(18,0,12);this.sun.castShadow=true;
    this.sun.shadow.mapSize.set(2048,2048);Object.assign(this.sun.shadow.camera,{left:-34,right:34,top:34,bottom:-34,near:1,far:80});
    this.sun.shadow.bias=-.0003;this.sun.shadow.normalBias=.025;this.sun.shadow.radius=2;
    this.scene.add(this.sun,this.sun.target,this.sky);
    this.landscape=buildLandscape(this.scene,models);
    this.activity=new ValleyActivity(this.scene);
    this.dataView=new SiteOverlay(this.scene);this.roadPreview.raycast=()=>{};this.roadPreview.frustumCulled=false;this.roadPreview.visible=false;this.scene.add(this.roadPreview);
    this.scene.add(this.selection,this.preview);
    this.labelLayer.className='world-labels';document.getElementById('game-root')!.append(this.labelLayer);
    this.hint.className='placement-label';this.hint.hidden=true;this.labelLayer.append(this.hint);
    this.labelB=this.label('SITE B · FUTURE EXPANSION','plot-label');this.labelB.dataset.site='b';
    this.label('SUNMEADOW · SITE A','plot-label').dataset.site='a';
    for(let i=0;i<this.rainPositions.length;i+=3){this.rainPositions[i]=(i*7.3%44)-1;this.rainPositions[i+1]=(i*.17)%9;this.rainPositions[i+2]=(i*3.1)%31;}
    const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(this.rainPositions,3));
    this.rain=new T.Points(geometry,new T.PointsMaterial({color:0xd8e5df,size:.045,transparent:true,opacity:.7}));this.rain.visible=false;this.scene.add(this.rain);
    this.resize(this.width,this.height);
  }
  resize(width:number,height:number):void {this.width=width;this.height=height;frameCamera(this.camera,width,height,this.zoom,this.target);}
  home():void{this.zoom=.62;this.target.copy(HOME);this.resize(this.width,this.height);}
  focus(tile:Vec2|null):void{if(!tile){this.home();return;}this.target.set(tile.x+1.6,0,tile.y+1.6);this.resize(this.width,this.height);}
  pan(dx:number,dy:number):void{
    const scale=PIXELS_PER_UNIT*this.zoom;
    this.target.x-=dx/(Math.SQRT2*scale)+dy/(.5*Math.SQRT2*scale);
    this.target.z+=dx/(Math.SQRT2*scale)-dy/(.5*Math.SQRT2*scale);
    this.target.x=T.MathUtils.clamp(this.target.x,-8,48);this.target.z=T.MathUtils.clamp(this.target.z,-8,38);
    this.resize(this.width,this.height);
  }
  zoomBy(delta:number,x=this.width/2,y=this.height/2):void{
    this.zoom=T.MathUtils.clamp(this.zoom-delta*.0015,.35,1.8);
    anchoredZoom(this.camera,this.width,this.height,this.target,this.zoom,x,y);
  }
  setViewMode(view:SiteView):void{this.dataView.setView(view);}
  setRoadPreview(path:Vec2[]|null):void{this.roadPath=path;}
  setPointer(x:number,y:number,inside:boolean):void{this.pointer={x,y,inside};}
  private ray(x:number,y:number):void{this.raycaster.setFromCamera(new T.Vector2(x/this.width*2-1,1-y/this.height*2),this.camera);}
  tileAt(x:number,y:number):Vec2|null{
    this.ray(x,y);const p=this.raycaster.ray.intersectPlane(this.ground,new T.Vector3());
    return p?{x:Math.round(p.x),y:Math.round(p.z)}:null;
  }
  pick(x:number,y:number):string|null{
    this.ray(x,y);
    // Staff get a small forgiving hit volume, but are still tested in world space.
    const staff=[...this.entities.values()].filter(e=>e.kind==='staff').map(e=>e.root);
    for(const hit of this.raycaster.intersectObjects(staff,true)){let o:T.Object3D|null=hit.object;while(o){if(o.userData.entityId)return o.userData.entityId as string;o=o.parent;}}
    const roots=[...this.entities.values()].filter(e=>e.kind!=='staff').map(e=>e.root);
    for(const hit of this.raycaster.intersectObjects(roots,true)){let o:T.Object3D|null=hit.object;while(o){if(o.userData.entityId)return o.userData.entityId as string;o=o.parent;}}
    return null;
  }
  inspect(x:number,y:number):string|null{
    this.ray(x,y);if(this.raycaster.intersectObject(this.landscape.picnic,true).length)return this.landscape.picnic.userData.description as string;
    const p=this.raycaster.ray.intersectPlane(this.ground,new T.Vector3());
    if(p&&Math.hypot(p.x-this.landscape.picnic.position.x,p.z-this.landscape.picnic.position.z)<.65)return this.landscape.picnic.userData.description as string;
    return null;
  }
  private label(text:string,className:string):HTMLDivElement{
    const el=document.createElement('div');el.className=className;el.textContent=text;this.labelLayer.append(el);return el;
  }
  private placeLabel(el:HTMLElement,point:T.Vector3):void{
    const p=point.clone().project(this.camera),x=(p.x+1)*this.width/2,y=(1-p.y)*this.height/2;
    el.style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px) translate(-50%,-100%)';
    el.style.visibility=x<0||x>this.width||y<0||y>this.height?'hidden':'visible';
  }
  private footprint(group:T.Group,w:number,d:number,mat:T.Material,filled=false):void{
    for(const child of group.children)if(child instanceof T.Mesh)child.geometry.dispose();
    group.clear();
    if(filled){const mesh=new T.Mesh(new T.PlaneGeometry(w,d),mat);mesh.rotation.x=-Math.PI/2;mesh.position.y=.075;group.add(mesh);return;}
    for(const z of [-d/2,d/2]){const mesh=new T.Mesh(new T.BoxGeometry(w,.018,.025),mat);mesh.position.set(0,.06,z);mesh.renderOrder=10;group.add(mesh);}
    for(const x of [-w/2,w/2]){const mesh=new T.Mesh(new T.BoxGeometry(.025,.018,d),mat);mesh.position.set(x,.06,0);mesh.renderOrder=10;group.add(mesh);}
  }
  private addEquipment(e:PlacedEquipment,connections:number):Visual{
    const root=new T.Group(),model=this.models.equipment(e.kind,connections);root.userData.entityId=e.id;root.add(model);this.scene.add(root);
    const visual={root,model,status:this.label('','equipment-status'),kind:e.kind,connections};this.entities.set(e.id,visual);return visual;
  }
  private addWorker(s:StaffMember):Visual{
    const root=makeStaff(s.role);root.userData.entityId=s.id;this.scene.add(root);
    const hitbox=new T.Mesh(new T.BoxGeometry(.35,.56,.35),new T.MeshBasicMaterial({visible:false}));hitbox.position.y=.28;root.add(hitbox);
    const particles=workParticles();root.add(particles);
    const visual={root,model:root,status:this.label('','equipment-status worker-job'),kind:'staff',particles};this.entities.set(s.id,visual);return visual;
  }
  private updateStaff(s:StaffMember,v:Visual,dt:number):void{
    const moving=s.task.type==='travel',working=['clean','repair','service'].includes(s.task.type);
    const dx=s.tile.x-v.root.position.x,dz=s.tile.y-v.root.position.z;
    if(moving&&Math.hypot(dx,dz)>.001)v.root.rotation.y=Math.atan2(dx,dz);
    v.root.position.set(s.tile.x,0,s.tile.y);
    const phase=this.elapsed*11,walk=moving?Math.sin(phase)*.58:0;
    for(const [name,sign]of [['legL',1],['legR',-1],['armL',-1],['armR',1]] as const){
      const joint=v.root.getObjectByName(name)!;
      joint.rotation.x=walk*sign+(working&&name.startsWith('arm')?-.65+Math.sin(phase*.65)*.32:0);
    }
    const body=v.root.getObjectByName('body')!;body.position.y=moving?Math.abs(Math.sin(phase))*.018:0;
    body.rotation.x=working?.11:0;v.root.getObjectByName('tool')!.visible=s.task.type==='clean';
    if(working&&s.task.type!=='idle'&&s.task.type!=='travel'){const targetId=s.task.targetId;const target=this.sim.equipment.find(e=>e.id===targetId);if(target)v.root.rotation.y=Math.atan2(target.tile.x+.5-s.tile.x,target.tile.y+.5-s.tile.y);}
    v.status.textContent=working?(s.task.type==='clean'?'CLEANING':s.task.type==='service'?'SERVICING':'REPAIRING'):s.trainingHoursLeft?'TRAINING':s.onBreak?'COFFEE BREAK':'';
    v.status.hidden=!v.status.textContent;this.placeLabel(v.status,new T.Vector3(s.tile.x,.73,s.tile.y));
    if(v.particles)updateWorkParticles(v.particles,s.task.type,this.elapsed);
    void dt;
  }
  sync(snapshot:GameSnapshot,delta:number,overlay:boolean):void{
    this.overlay=overlay;this.elapsed+=snapshot.speed&& !snapshot.activeEvent?delta:0;
    const ids=new Set([...snapshot.equipment,...snapshot.staff].map(e=>e.id));
    for(const [id,v]of this.entities)if(!ids.has(id)){this.scene.remove(v.root);this.releaseObject(v.root);v.status.remove();this.entities.delete(id);}
    for(const e of snapshot.equipment){
      const connections=fenceConnections(e.kind,e.tile,snapshot.equipment);
      let v=this.entities.get(e.id);if(v&&(v.kind!==e.kind||v.connections!==connections)){this.scene.remove(v.root);this.releaseObject(v.root);v.status.remove();this.entities.delete(e.id);v=undefined;}
      v??=this.addEquipment(e,connections);const def=EQUIPMENT[e.kind];v.root.position.set(e.tile.x+(def.footprint.x-1)/2,0,e.tile.y+(def.footprint.y-1)/2);
      v.model.scale.y=e.commissioned?1:Math.max(.07,e.constructionProgress);
      if(!e.commissioned&&!v.construction){v.construction=constructionSite(def.footprint.x,def.footprint.y);v.root.add(v.construction);}
      if(e.commissioned&&v.construction){v.root.remove(v.construction);this.releaseObject(v.construction);v.construction=undefined;}
      if(e.kind.includes('pv'))v.model.traverse(o=>{if(o instanceof T.Mesh){for(const m of Array.isArray(o.material)?o.material:[o.material]){
        const mat=m as T.MeshStandardMaterial,base=mat.userData.baseColor as T.Color|undefined;
        if(base)mat.color.copy(base).lerp(new T.Color(0xb8a575),e.soiling*.62).multiplyScalar(e.faulted?.7:1);
      }}});
      v.status.textContent=!e.commissioned?'BUILDING '+Math.round(e.constructionProgress*100)+'%':e.faulted?'⚡ FAULT':e.soiling>.35?'DUSTY':'';
      v.status.classList.toggle('fault',e.faulted);v.status.hidden=!v.status.textContent;
      this.placeLabel(v.status,new T.Vector3(v.root.position.x,.95,v.root.position.z));
    }
    for(const s of snapshot.staff){let v=this.entities.get(s.id);if(v&&v.kind!=='staff'){this.scene.remove(v.root);this.releaseObject(v.root);v.status.remove();this.entities.delete(s.id);v=undefined;}v??=this.addWorker(s);this.updateStaff(s,v,delta);}
    const selected=snapshot.selectedId?this.entities.get(snapshot.selectedId):null;this.selection.visible=!!selected&&!snapshot.buildMode;
    if(selected){
      const eq=snapshot.equipment.find(e=>e.id===snapshot.selectedId),key=snapshot.selectedId+':'+(eq?.kind??'staff');
      if(key!==this.selectionKey){this.selectionKey=key;this.footprint(this.selection,eq?EQUIPMENT[eq.kind].footprint.x:.55,eq?EQUIPMENT[eq.kind].footprint.y:.55,this.selectedMaterial);}
      this.selection.position.copy(selected.root.position);
    }
    const b=snapshot.plots.find(p=>p.id==='site_b')!;
    this.labelB.textContent=b.unlocked?'SUNMEADOW EAST · SITE B':'SITE B · FUTURE EXPANSION';
    this.placeLabel(this.labelB,new T.Vector3(27.5,.06,16.25));
    this.placeLabel(this.labelLayer.querySelector('[data-site="a"]')!,new T.Vector3(11,.06,16.25));
    this.dataView.update(snapshot);this.updateWeather(snapshot,delta);this.updatePreview(snapshot);this.activity.update(this.elapsed,snapshot);
    const shadowKey=snapshot.equipment.map(e=>[e.id,e.kind,e.tile.x,e.tile.y,e.constructionProgress.toFixed(2)].join(':')).join('|')
      +snapshot.staff.map(s=>[s.id,s.tile.x.toFixed(2),s.tile.y.toFixed(2),s.task.type].join(':')).join('|')
      +':activity:'+Math.floor(this.elapsed*5);
    if(shadowKey!==this.shadowKey&&(this.elapsed-this.lastShadow>.12||snapshot.speed===0||!this.shadowKey)){
      this.renderer.shadowMap.needsUpdate=true;this.lastShadow=this.elapsed;this.shadowKey=shadowKey;
    }
    this.scene.updateMatrixWorld(true);
  }
  private updateWeather(s:GameSnapshot,delta:number):void{
    const night=s.hour<6||s.hour>=19,storm=s.weather==='hail',rain=s.weather==='rain'||storm;
    const key=[night,s.weather].join(':');
    if(key!==this.weatherKey){
      this.weatherKey=key;this.sun.intensity=night?.14:storm? .7:s.weather==='overcast'||rain?1.1:2.8;
      this.sky.intensity=night?.32:storm? .9:1.8;
      this.sun.color.set(night?0x91b5d0:0xffedcc);
      const sky=night?0x304951:rain?0x879f9a:0xb9d1c4;
      (this.scene.background as T.Color).set(sky);(this.scene.fog as T.Fog).color.set(sky);
      for(const lamp of this.landscape.lamps)lamp.intensity=night?2.5:0;
      this.renderer.shadowMap.needsUpdate=true;
    }
    this.rain.visible=rain;
    if(rain&&s.speed>0&&!s.activeEvent){
      for(let i=0;i<this.rainPositions.length;i+=3){this.rainPositions[i+1]-=delta*(storm?10:7);if(this.rainPositions[i+1]<0)this.rainPositions[i+1]+=9;}
      this.rain.geometry.getAttribute('position').needsUpdate=true;
    }
    this.landscape.ripples.position.z=Math.sin(this.elapsed*.4)*.08;
    this.landscape.ripples.visible=!night;
  }
  private updatePreview(s:GameSnapshot):void{
    this.roadPreview.visible=!!this.roadPath&&s.buildMode==='road'&&!this.overlay;
    if(this.roadPreview.visible&&this.roadPath?.length){
      this.preview.visible=false;if(this.ghost)this.ghost.visible=false;
      const plan=this.sim.roadPlan(this.roadPath),matrix=new T.Matrix4(),rotation=new T.Quaternion().setFromEuler(new T.Euler(-Math.PI/2,0,0));
      const color=new T.Color(plan.error?0xe67557:0x71d9ed);
      this.roadPath.forEach((tile,i)=>{matrix.compose(new T.Vector3(tile.x,.1,tile.y),rotation,new T.Vector3(1,1,1));this.roadPreview.setMatrixAt(i,matrix);this.roadPreview.setColorAt(i,color);});
      this.roadPreview.count=this.roadPath.length;this.roadPreview.instanceMatrix.needsUpdate=true;if(this.roadPreview.instanceColor)this.roadPreview.instanceColor.needsUpdate=true;
      const end=this.roadPath[this.roadPath.length-1];this.hint.hidden=false;
      this.hint.textContent=plan.error??plan.tiles.length+' road tiles · $'+plan.cost.toLocaleString()+' · release to build';
      this.hint.classList.toggle('invalid',!!plan.error);this.placeLabel(this.hint,new T.Vector3(end.x,1,end.y));return;
    }
    const visible=!!s.buildMode&&this.pointer.inside&&!this.overlay;this.preview.visible=visible;this.hint.hidden=!visible;
    if(this.ghost)this.ghost.visible=visible;if(!visible||!s.buildMode)return;
    const tile=this.tileAt(this.pointer.x,this.pointer.y);if(!tile)return;
    const def=EQUIPMENT[s.buildMode],plot=this.sim.plotAtTile(tile);
    const invalid=plot?this.sim.canPlace(s.buildMode,plot,tile):'Outside buildable land';
    const connections=fenceConnections(s.buildMode,tile,s.equipment),ghostKey=s.buildMode+':'+connections;
    if(this.ghostKey!==ghostKey){
      if(this.ghost){this.scene.remove(this.ghost);this.releaseObject(this.ghost);}
      this.ghost=this.models.equipment(s.buildMode,connections);this.ghostKey=ghostKey;
      this.ghost.traverse(o=>{if(o instanceof T.Mesh){const ghost=(m:T.Material)=>{const n=m.clone();n.transparent=true;n.opacity=.55;n.depthWrite=false;return n;};o.material=Array.isArray(o.material)?o.material.map(ghost):ghost(o.material);o.castShadow=false;}});
      this.scene.add(this.ghost);
    }
    const x=tile.x+(def.footprint.x-1)/2,z=tile.y+(def.footprint.y-1)/2;
    this.ghost!.position.set(x,.015,z);this.ghost!.visible=true;
    // Reuse footprint meshes until size or validity changes.
    const key=s.buildMode+':'+!!invalid;
    if(this.preview.userData.key!==key){this.footprint(this.preview,def.footprint.x,def.footprint.y,invalid?this.invalidMaterial:this.validMaterial,true);this.preview.userData.key=key;}
    this.preview.position.set(x,0,z);
    this.hint.textContent=invalid??def.name+' · $'+def.cost.toLocaleString()+' · click to build';
    this.hint.classList.toggle('invalid',!!invalid);this.placeLabel(this.hint,new T.Vector3(x,1.25,z));
  }
  render():void{this.renderer.render(this.scene,this.camera);}
  stats():Record<string,unknown>{
    let meshes=0,instances=0,triangles=0;
    this.scene.traverse(o=>{if(o instanceof T.Mesh){meshes++;const count=o instanceof T.InstancedMesh?o.count:1;instances+=count;triangles+=(o.geometry.index?.count??o.geometry.getAttribute('position').count)/3*count;}});
    return {renderer:'Three.js WebGL 3D',orthographic:this.camera.isOrthographicCamera,models:this.models.templates.size,meshes,instances,triangles,drawCalls:this.renderer.info.render.calls,shadows:this.renderer.shadowMap.enabled,entities:this.entities.size,activity:this.activity.state(),view:{zoom:this.zoom,target:[this.target.x,this.target.z]},gpuMemory:{geometries:this.renderer.info.memory.geometries,textures:this.renderer.info.memory.textures}};
  }
  private releaseObject(root:T.Object3D):void{
    const sharedGeometries=new Set<T.BufferGeometry>([sharedCube]),sharedMaterials=new Set<T.Material>();
    for(const model of this.models.templates.values())model.traverse(o=>{if(o instanceof T.Mesh){sharedGeometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])sharedMaterials.add(m);}});
    const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();
    root.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Points){
      if(o instanceof T.InstancedMesh)o.dispose();
      if(!sharedGeometries.has(o.geometry))geometries.add(o.geometry);
      for(const m of Array.isArray(o.material)?o.material:[o.material])if(!sharedMaterials.has(m)&&!isSharedMaterial(m))materials.add(m);
    }});
    geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
  }
  destroy():void{
    this.labelLayer.remove();
    this.scene.traverse(o=>{if(o instanceof T.PointLight)o.dispose();});
    this.sun.dispose();
    this.releaseObject(this.scene);
    this.renderer.renderLists.dispose();
  }
}
export function renderCatalogue(renderer:T.WebGLRenderer,models:ModelLibrary):void{
  const scene=new T.Scene(),camera=new T.OrthographicCamera(-1.5,1.5,1.4,-1.15,.1,20);
  scene.add(new T.HemisphereLight(0xffffff,0x7e8e73,2.2));
  const light=new T.DirectionalLight(0xffe8c5,2.8);light.position.set(-3,6,4);scene.add(light);
  camera.position.set(4,3.27,4);camera.lookAt(0,.5,0);renderer.setSize(240,200,false);renderer.setClearColor(0xabc58b,0);
  for(const kind of Object.keys(EQUIPMENT) as EquipmentKind[]){
    const model=models.equipment(kind);scene.add(model);renderer.render(scene,camera);SITE_ICONS[kind]=renderer.domElement.toDataURL('image/png');scene.remove(model);
  }
}
