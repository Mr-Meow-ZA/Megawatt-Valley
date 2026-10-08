
import * as T from 'three';
export type PortraitIdentity='tess'|'amir'|'nia'|'morgan'|'sam';
/** Original detailed portrait busts; the field models remain a separate low-detail representation. */
export function makePortrait(identity:PortraitIdentity):T.Group{
 const root=new T.Group(),materials=new Map<number,T.MeshStandardMaterial>();
 const mat=(color:number)=>{let m=materials.get(color);if(!m){m=new T.MeshStandardMaterial({color,roughness:.78});materials.set(color,m);}return m;};
 const skin=identity==='nia'?0x955d3f:identity==='amir'?0xb78059:identity==='morgan'?0xd3a477:0xe5b08a;
 const vest=identity==='nia'?0x429fa7:identity==='morgan'?0x607fa7:identity==='sam'?0x657f64:0xe2a137;
 const hair=identity==='tess'?0x49322d:identity==='nia'?0x302828:identity==='amir'?0x302d2b:identity==='sam'?0x8b7966:0x624a3a;
 const add=(geometry:T.BufferGeometry,color:number,x:number,y:number,z:number,scale?:[number,number,number])=>{const o=new T.Mesh(geometry,mat(color));o.position.set(x,y,z);if(scale)o.scale.set(...scale);root.add(o);return o;};
 const oval=(color:number,x:number,y:number,z:number,sx:number,sy:number,sz:number)=>add(new T.SphereGeometry(1,24,16),color,x,y,z,[sx,sy,sz]);
 const slab=(color:number,x:number,y:number,z:number,w:number,h:number,d:number)=>add(new T.BoxGeometry(w,h,d),color,x,y,z);
 const limb=(color:number,a:[number,number,number],b:[number,number,number],r:number)=>{const av=new T.Vector3(...a),bv=new T.Vector3(...b),delta=bv.clone().sub(av);const o=add(new T.CapsuleGeometry(r,Math.max(.01,delta.length()-2*r),5,14),color,0,0,0);o.position.copy(av.add(bv).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return o;};
 oval(0x263f53,0,.57,-.02,.43,.67,.28);oval(vest,0,.9,0,.5,.57,.3);
 slab(0x263f53,0,.95,.299,.075,.9,.025);
 for(const side of [-1,1]){
  const collar=slab(0x38586b,side*.09,1.32,.25,.13,.22,.025);collar.rotation.z=side*.3;
  slab(0xecebd3,side*.29,.95,.25,.08,.71,.022);slab(0xc0cdc5,side*.29,.95,.268,.025,.71,.018);
  slab(0xecebd3,side*.2,.72,.284,.3,.09,.019);
  slab(vest,side*.2,.97,.305,.18,.16,.025);
 }
 slab(0xe6eae2,-.2,1.09,.318,.16,.06,.014);slab(0x34506a,-.2,1.09,.328,.105,.014,.005);
 limb(0x344f61,[-.43,1.17,0],[-.57,.8,.08],.17);limb(0x344f61,[.43,1.17,0],[.55,.8,.08],.17);
 limb(skin,[-.55,.82,.12],[.23,.66,.39],.105);limb(skin,[.53,.8,.12],[-.23,.77,.47],.107);
 oval(skin,-.27,.77,.46,.15,.085,.095);oval(skin,.24,.66,.4,.14,.08,.09);
 for(let i=0;i<3;i++)limb(skin,[-.37+i*.04,.73,.51],[-.34+i*.04,.8,.52],.019);
 oval(skin,0,1.39,.01,.15,.24,.14);oval(hair,0,1.79,-.09,.41,.45,.33);
 oval(skin,0,1.75,.05,identity==='sam'?.38:.36,.415,.325);
 oval(skin,-.365,1.74,.025,.078,.115,.066);oval(skin,.365,1.74,.025,.078,.115,.066);
 oval(0xc78c6b,-.382,1.74,.067,.034,.067,.017);oval(0xc78c6b,.382,1.74,.067,.034,.067,.017);
 for(const side of [-1,1]){
  oval(0xfff4df,side*.125,1.80,.338,.078,.052,.026);
  oval(identity==='nia'?0x573e30:0x446662,side*.125+.012,1.8,.36,.031,.039,.012);
  oval(0x243432,side*.125+.014,1.803,.37,.015,.024,.006);
  oval(0xfff9df,side*.125+.022,1.816,.377,.007,.01,.003);
  limb(hair,[side*.18,1.91,.309],[side*.07,1.917,.336],.018);
  oval(skin,side*.16,1.65,.296,.12,.09,.049);
 }
 oval(skin,0,1.704,.367,.071,.094,.09);
 const smile=new T.CatmullRomCurve3([new T.Vector3(-.115,1.596,.317),new T.Vector3(0,1.562,.353),new T.Vector3(.115,1.605,.317)]);
 add(new T.TubeGeometry(smile,20,.012,6,false),0x915c47,0,0,0);
 if(identity==='amir'){oval(hair,0,1.498,.175,.255,.1,.195);oval(hair,-.21,1.57,.221,.038,.117,.069);oval(hair,.21,1.57,.221,.038,.117,.069);}
 if(identity==='tess'||identity==='nia'){const side=identity==='tess'?-1:1;oval(hair,side*.31,1.45,-.15,.14,.3,.15);for(let i=0;i<4;i++)oval(hair,side*(.34+i*.025),1.5-i*.1,-.11,.085-i*.006,.08,.077);oval(vest,side*.415,1.14,-.11,.047,.025,.048);}
 const hat=identity==='morgan'||identity==='sam'?0xf0eee3:0xe8be43;
 add(new T.SphereGeometry(1,28,14,0,Math.PI*2,0,Math.PI/2),hat,0,2.014,-.015,[.46,.28,.4]);
 add(new T.CylinderGeometry(.48,.50,.04,28),hat,0,2.02,.015,[1,1,.85]);
 slab(hat,0,2.187,-.03,.06,.19,.37);slab(0xe9ede2,0,2.103,.372,.11,.08,.016);slab(0x488665,0,2.103,.384,.06,.043,.008);
 if(identity==='morgan'){for(const side of [-1,1]){const frame=add(new T.TorusGeometry(.077,.009,6,24),0x3c5263,side*.125,1.8,.378);frame.scale.y=.78;}limb(0x3c5263,[-.048,1.81,.378],[.048,1.81,.378],.007);}
 root.rotation.y=-.12;return root;
}
