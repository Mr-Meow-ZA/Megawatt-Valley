import * as T from 'three';
import { ROAD_TILES,FENCE_EDGES,SCENERY,riverCenterX,riverHalfWidth, inRect,SITE_A,SITE_B,isMainRoad } from '../content/valleyLayout';
import { ModelLibrary,box,beam,fence,batchStatic,makeVan } from './models';
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
export function groundHeight(x:number,z:number):number{
  const river=Math.abs(x-riverCenterX(z)),water=riverHalfWidth(z);
  if(river<water+.4)return -.32+.32*clamp((river-water+.15)/.55);
  if(x>=-.5&&x<=41.5&&z>=-.5&&z<=29.5){
    if(inRect(x,z,{x0:2,x1:19,y0:2,y1:18})||inRect(x,z,{x0:21,x1:35,y0:4,y1:18})||Math.abs(z-1)<1||isMainRoad(x,z))return 0;
    return .22*Math.pow(Math.sin(x*.23)*Math.sin(z*.26),2);
  }
  const distance=Math.max(0,-x,x-41,-z,z-29);
  return Math.min(9,distance*.29)*( .72+.23*Math.sin(x*.15+z*.11) )+Math.sin(x*.18)*Math.sin(z*.17)*.25;
}
function random(n:number):number{const v=Math.sin(n*127.1+19.7)*43758.5453;return v-Math.floor(v);}
function terrain():T.Mesh{
  const geometry=new T.PlaneGeometry(102,102,153,153);geometry.rotateX(-Math.PI/2);geometry.translate(19,0,13);
  const positions=geometry.getAttribute('position'),colors=new Float32Array(positions.count*3);
  const base=new T.Color(),green=new T.Color('#91ae68'),deep=new T.Color('#638c62'),sand=new T.Color('#c1ba88'),rock=new T.Color('#8d9884');
  for(let i=0;i<positions.count;i++){
    const x=positions.getX(i),z=positions.getZ(i),height=groundHeight(x,z);positions.setY(i,height);
    const river=Math.abs(x-riverCenterX(z)),bank=river<riverHalfWidth(z)+.5;
    base.copy(green).lerp(deep,clamp(height*.08+Math.sin(x*.31+z*.12)*.12+.15));
    if(bank)base.copy(sand);
    if(height>4)base.lerp(rock,clamp((height-4)*.3));
    if(inRect(x,z,SITE_A)||inRect(x,z,SITE_B))base.lerp(new T.Color('#b0b77a'),.3);
    base.multiplyScalar(.98+random(Math.floor(x*2)+Math.floor(z*2)*333)*.04);
    colors.set([base.r,base.g,base.b],i*3);
  }
  geometry.setAttribute('color',new T.BufferAttribute(colors,3));geometry.computeVertexNormals();
  const mesh=new T.Mesh(geometry,new T.MeshStandardMaterial({vertexColors:true,roughness:1}));mesh.receiveShadow=true;mesh.name='Continuous sculpted terrain';return mesh;
}
export interface Landscape {water:T.Mesh;van:T.Group;staticGroup:T.Group;lamps:T.PointLight[];ripples:T.Group;picnic:T.Group;}
export function buildLandscape(scene:T.Scene,models:ModelLibrary):Landscape {
  scene.add(terrain());const staticObjects=new T.Group();
  const positions:number[]=[],indices:number[]=[];
  for(let i=0;i<=408;i++){
    const z=-38+i*.25,w=riverHalfWidth(z);
    positions.push(riverCenterX(z)-w,-.16,z,riverCenterX(z)+w,-.16,z);
    if(i<408){const n=i*2;indices.push(n,n+2,n+1,n+1,n+2,n+3);}
  }
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();
  const water=new T.Mesh(geo,new T.MeshStandardMaterial({color:0x67b2bb,roughness:.32,metalness:.18}));water.receiveShadow=true;water.name='River below real banks';scene.add(water);
  const ripples=new T.Group();scene.add(ripples);
  for(let i=0;i<54;i++){const z=-10+i*.85,x=riverCenterX(z)+(random(i)-.5)*1.4;box(ripples,x,-.151,z,.12+random(i+20)*.3,.005,.016,0xb4d3c5);}
  for(const p of ROAD_TILES)box(staticObjects,p.x,.018,p.y,1,.035,1,0xb8ab88);
  // One unbroken bridge deck follows the public road. Its guardrails meet dry land.
  box(staticObjects,19.8,.014,1,4.7,.09,.95,0x9aa99b);
  for(let x=17.45;x<22.15;x+=.25)box(staticObjects,x,.066,1,.012,.008,.94,0x81988e);
  for(const z of [.48,1.52])for(let x=17.45;x<22.1;x+=.5)fence(staticObjects,x,z,x+.5,z,.3);
  for(const {a,b} of FENCE_EDGES)fence(staticObjects,a.x,a.y,b.x,b.y);
  box(staticObjects,6.15,.015,6.3,3.3,.03,3.6,0xbab79a);
  for(const x of [6.5,7.5])box(staticObjects,x,.035,7.5,.018,.006,1,0xe4dfba);
  box(staticObjects,7,.035,8,1,.006,.018,0xe4dfba);
  for(const p of SCENERY){
    const object=models.model(p.kind==='tree'?['oak','pine','alder'][p.variant]:p.kind,p.kind==='tree'?1.05:.6,undefined,p.kind==='tree'?1.65*p.scale:undefined);
    if(p.kind!=='tree')object.scale.multiplyScalar(p.scale);
    object.position.set(p.x,groundHeight(p.x,p.y),p.y);object.rotation.y=random(p.x+p.y)*6.28;staticObjects.add(object);
  }
  // Distant groves follow the slope and stop at road/river/working-site setbacks.
  for(let i=0;i<210;i++){
    const x=-19+random(i+801)*77,z=-22+random(i+1651)*67;
    if(x>-.5&&x<42&&z>-.5&&z<30||Math.abs(x-riverCenterX(z))<2.1||Math.abs(z-1)<1.3)continue;
    const tree=models.model(i%4===0?'pine':'oak',1,undefined,1.3+random(i+72)*1.3);tree.position.set(x,groundHeight(x,z),z);tree.rotation.y=i;staticObjects.add(tree);
  }
  // Power line leads from the public connection into the grid yard.
  const poles=[[14.5,2],[24,2],[35,2]];
  for(const [x,z] of poles){
    box(staticObjects,x,.93,z,.07,1.86,.07,0x8b7960);box(staticObjects,x,1.72,z,.68,.05,.05,0x7a7564);
    for(const offset of [-.27,.27])box(staticObjects,x+offset,1.8,z,.045,.13,.045,0xb2bcaf);
  }
  for(let i=1;i<poles.length;i++)for(const offset of [-.27,.27]){
    const a=poles[i-1],b=poles[i];for(let j=0;j<12;j++){
      const point=(t:number)=>new T.Vector3(a[0]+(b[0]-a[0])*t+offset,1.86-Math.sin(t*Math.PI)*.28,2);
      beam(staticObjects,point(j/12),point((j+1)/12),.012,0x5f6b60);
    }
  }
  const picnic=new T.Group();picnic.position.set(7.35,0,5.25);picnic.userData.description='Company headquarters: one picnic table, three mugs, and an ambitious spreadsheet.';
  box(picnic,0,.27,0,.63,.055,.34,0xc69c6a);
  for(const x of [-.22,.22])box(picnic,x,.12,0,.045,.25,.24,0x697c69);
  for(const z of [-.29,.29])box(picnic,0,.16,z,.66,.045,.13,0xc69c6a);
  box(picnic,.17,.34,0,.05,.075,.05,0xf0e0be);box(picnic,-.12,.33,.04,.11,.025,.09,0x789ba1);scene.add(picnic);
  for(const [x,z]of [[4.8,3.8],[22.8,5.8]]){const sign=models.equipment('sign');sign.position.set(x,0,z);staticObjects.add(sign);}
  const van=makeVan();van.position.set(7,.025,7.4);scene.add(van);
  const lamps:T.PointLight[]=[];
  for(const [x,z]of [[4.7,5],[14.8,5.5],[22.7,6.8]]){
    box(staticObjects,x,.58,z,.025,1.16,.025,0x748077);box(staticObjects,x,1.18,z,.15,.075,.1,0xf3ddab);
    const light=new T.PointLight(0xffce83,0,3,2);light.position.set(x,1.12,z);scene.add(light);lamps.push(light);
  }
  // Low tufts and wildflowers grow in groups outside production footprints.
  for(let i=0;i<550;i++){
    const x=random(i+333)*42,z=random(i+998)*30;
    if(inRect(x,z,{x0:3,x1:19,y0:3,y1:17})||inRect(x,z,{x0:21,x1:35,y0:5,y1:17})||isMainRoad(x,z)||Math.abs(x-riverCenterX(z))<riverHalfWidth(z)+.55)continue;
    const y=groundHeight(x,z);box(staticObjects,x,y+.045,z,.025,.09,.022,i%8===0?0xddc884:0x76925b);
    if(i%8===0)box(staticObjects,x,y+.1,z,.065,.025,.06,0xead9a1);
  }
  const staticGroup=batchStatic(staticObjects);scene.add(staticGroup);
  return {water,van,staticGroup,lamps,ripples,picnic};
}
