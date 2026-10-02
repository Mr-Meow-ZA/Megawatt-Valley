import { applyLowPolyArt } from './lowPolyArt';
import type Phaser from 'phaser';
export const SITE_ICONS:Record<string,string>={};
type P=[number,number]; type C=CanvasRenderingContext2D;
export const SITE_ART:Record<string,{key:string;originY:number;scale:number}>={
  bargain_pv:{key:'site_pv_basic',originY:100/160,scale:1},
  premium_pv:{key:'site_pv_premium',originY:100/160,scale:1},
  office:{key:'site_office',originY:110/170,scale:1},
  workshop:{key:'site_workshop',originY:110/170,scale:1},
  substation:{key:'site_grid',originY:100/160,scale:1},
  inverter:{key:'site_inverter',originY:60/100,scale:1},
  tree:{key:'site_tree_0',originY:88/110,scale:1},
  sign:{key:'site_sign',originY:42/52,scale:1},
  road:{key:'site_road_0',originY:.5,scale:1},
  fence:{key:'site_fence_5',originY:40/70,scale:1},
  gate:{key:'site_gate',originY:40/70,scale:1},
};
/** Original art uses the same 100x50 ground grid, rendered at native resolution.
 * All sprite manifests include a ground anchor instead of magic screen offsets.
 */
export function generateSiteArt(scene:Phaser.Scene):void {
  function make(key:string,w:number,h:number,draw:(c:C)=>void){
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
    const c=canvas.getContext('2d')!;draw(c);
    const full=document.createElement('canvas');full.width=w;full.height=h;
    const f=full.getContext('2d')!;f.imageSmoothingEnabled=false;f.drawImage(canvas,0,0,w,h);
    if(scene.textures.exists(key))scene.textures.remove(key);scene.textures.addCanvas(key,full);
  }
  const poly=(c:C,p:P[],colour:string)=>{c.fillStyle=colour;c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();};
  const line=(c:C,a:P,b:P,col:string,width=2)=>{c.strokeStyle=col;c.lineWidth=width;c.beginPath();c.moveTo(...a);c.lineTo(...b);c.stroke();};
  const iso=(x:number,y:number,z=0,cx=100,cy=100):P=>[cx+(x-y)*50,cy+(x+y)*25-z];
  const rect=(c:C,x:number,y:number,w:number,d:number,z:number,col:string,cx=100,cy=100)=>poly(c,[iso(x,y,z,cx,cy),iso(x+w,y,z,cx,cy),iso(x+w,y+d,z,cx,cy),iso(x,y+d,z,cx,cy)],col);
  const box=(c:C,x:number,y:number,w:number,d:number,z:number,height:number,top:string,left:string,right:string,cx=100,cy=100)=>{
    poly(c,[iso(x,y+d,z,cx,cy),iso(x+w,y+d,z,cx,cy),iso(x+w,y+d,z+height,cx,cy),iso(x,y+d,z+height,cx,cy)],left);
    poly(c,[iso(x+w,y,z,cx,cy),iso(x+w,y+d,z,cx,cy),iso(x+w,y+d,z+height,cx,cy),iso(x+w,y,z+height,cx,cy)],right);
    rect(c,x,y,w,d,z+height,top,cx,cy);
  };
  for(const premium of [false,true])make(premium?'site_pv_premium':'site_pv_basic',200,160,c=>{
    rect(c,-.92,-.92,1.84,1.84,0,'#b9c393');
    for(let row=0;row<3;row++){
      const y=-.73+row*.52;
      // Small ground shadow, galvanized supports, and a continuous tilted rack.
      rect(c,-.76,y+.04,1.56,.34,0,'#78816c');
      for(const x of [-.64,.64])line(c,iso(x,y+.27),iso(x,y+.27,13),'#707f7b',3);
      const plane=(x:number,t:number)=>iso(x,y+t,21-t*22);
      poly(c,[plane(-.78,0),plane(.78,0),plane(.78,.34),plane(-.78,.34)],'#abbfc1');
      poly(c,[plane(-.75,.025),plane(.75,.025),plane(.75,.31),plane(-.75,.31)],premium?'#245992':'#356ea9');
      for(let cell=1;cell<8;cell++)line(c,plane(-.75+cell*1.5/8,.025),plane(-.75+cell*1.5/8,.31),premium?'#6fb3d5':'#8bb6d8',1);
      line(c,plane(-.75,.17),plane(.75,.17),'#567e94',1);
      line(c,plane(-.78,0),plane(.78,0),'#e6eeee',2);
      poly(c,[plane(-.68,.03),plane(-.25,.03),plane(.12,.30),plane(-.32,.30)],'#b5d8ed25');
    }
  });
  for(const workshop of [false,true])make(workshop?'site_workshop':'site_office',200,170,c=>{
    const cy=110;
    rect(c,-.94,-.94,1.88,1.88,0,'#b9b49e',100,cy);
    box(c,-.66,-.55,1.30,1.12,0,35,'#e6e5c8','#f3e5bc','#c4cba9',100,cy);
    box(c,-.76,-.65,1.5,1.32,35,6,'#577eb1','#3e6597','#2c4b7b',100,cy);
    // Ribbed roof, a vent, doorstep and flower box give this tiny office a lived-in scale.
    if(!workshop){
      box(c,-.49,.61,.76,.15,6,7,'#9a7950','#816644','#68573f',100,cy);
      for(let i=0;i<5;i++){const p=iso(-.41+i*.13,.66,16,100,cy);c.fillStyle=i%2?'#e4c679':'#afbe77';c.fillRect(p[0],p[1],4,4);}
      box(c,.76,.27,.22,.25,0,4,'#dfd4ad','#b4b096','#9ca78c',100,cy);
    }
    for(let i=1;i<6;i++)line(c,iso(-.76+i*.25,-.65,42,100,cy),iso(-.76+i*.25,.67,42,100,cy),'#7d9ec4',2);
    box(c,-.48,-.38,.22,.23,42,8,'#b9bfa5','#929f87','#6c8270',100,cy);

    if(workshop){
      poly(c,[iso(-.42,.58,3,100,cy),iso(.46,.58,3,100,cy),iso(.46,.58,27,100,cy),iso(-.42,.58,27,100,cy)],'#71877d');
      for(let z=6;z<26;z+=5)line(c,iso(-.42,.59,z,100,cy),iso(.46,.59,z,100,cy),'#a5b3a2',1);
    }else{
      for(const x of [-.46,.08])poly(c,[iso(x,.58,15,100,cy),iso(x+.3,.58,15,100,cy),iso(x+.3,.58,27,100,cy),iso(x,.58,27,100,cy)],'#567f8c');
      poly(c,[iso(.65,-.26,0,100,cy),iso(.65,.06,0,100,cy),iso(.65,.06,27,100,cy),iso(.65,-.26,27,100,cy)],'#435c54');
      rect(c,.64,-.34,.23,.49,0,'#e0d8b6',100,cy);
    }
  });
  make('site_grid',200,160,c=>{
    rect(c,-.92,-.92,1.84,1.84,0,'#b2b5a1');
    box(c,-.55,-.25,.78,.62,0,26,'#90a6a0','#738b85','#536f69');
    for(let n=0;n<6;n++)line(c,iso(-.5+n*.12,.38,4),iso(-.5+n*.12,.38,22),'#485f5a',2);
    for(const x of [-.4,0,.4]){box(c,x,-.42,.08,.08,25,12,'#d1c4a1','#9f967e','#736e5e');line(c,iso(x,-.38,40),iso(x,.22,40),'#535e5b',2);}
    box(c,.35,.23,.29,.34,0,22,'#d5d6bd','#b0bba5','#8b9d8a');
    const p=iso(.53,.59,15);c.fillStyle='#e0ba5f';c.fillRect(p[0]-3,p[1]-2,6,5);
    line(c,iso(-.7,-.7),iso(-.7,-.7,64),'#818b7a',5);
    line(c,iso(-.7,-.7,64),iso(.65,-.7,64),'#9eab99',4);
    line(c,iso(.65,-.7),iso(.65,-.7,64),'#677767',5);
  });
  make('site_inverter',100,100,c=>{
    rect(c,-.32,-.28,.64,.56,0,'#b4b8a1',50,60);
    box(c,-.21,-.17,.42,.34,0,28,'#d9ddc6','#b4c1af','#839d90',50,60);
    for(let z=9;z<23;z+=4)line(c,iso(-.14,.18,z,50,60),iso(.14,.18,z,50,60),'#637e76',2);
    const p=iso(.1,.19,5,50,60);c.fillStyle='#83b970';c.fillRect(...p,3,3);
  });
  for(let variant=0;variant<3;variant++)make('site_tree_'+variant,80,110,c=>{
    // One broadleaf family with variations in crown colour and height.
    c.fillStyle='#40533a55';c.beginPath();c.ellipse(45,90,25,10,0,0,Math.PI*2);c.fill();
    c.fillStyle='#756a49';c.fillRect(36,57,8,33);c.fillStyle='#ad9465';c.fillRect(36,59,3,30);
    const leaf=[['#3e744c','#62934c','#9db765'],['#347758','#5d9966','#9bc77b'],['#507e42','#81a551','#b3c977']][variant];
    poly(c,[[7,48],[12,30],[24,28],[25,15],[40,8],[55,18],[57,27],[69,33],[74,51],[62,66],[47,72],[27,67],[12,62]],leaf[0]);
    poly(c,[[10,43],[18,28],[29,28],[31,16],[42,12],[54,21],[53,34],[64,36],[67,48],[52,54],[38,63],[22,56]],leaf[1]);
    poly(c,[[19,35],[29,31],[33,20],[42,17],[50,23],[47,34],[37,40],[27,42]],leaf[2]);
    for(const [x,y]of [[18,43],[30,49],[50,40],[45,54]]){c.fillStyle=leaf[2];c.fillRect(x,y,5,3);}
  });
  make('site_shrub',50,40,c=>{
    poly(c,[[4,27],[9,16],[19,14],[25,8],[39,14],[46,27],[34,33],[18,33]],'#638156');
    poly(c,[[9,21],[19,17],[26,11],[36,16],[35,24],[21,26]],'#94a769');
  });
  make('site_rock',50,40,c=>{
    poly(c,[[3,28],[12,12],[29,8],[44,23],[38,32],[18,35]],'#7c8679');
    poly(c,[[3,28],[12,12],[29,8],[32,19],[19,27]],'#a7aa91');
    poly(c,[[32,19],[44,23],[38,32],[18,35],[19,27]],'#647267');
  });
  make('site_van',100,90,c=>{
    box(c,-.37,-.22,.73,.44,5,19,'#d8d8b9','#b5c3ab','#8ca699',50,55);
    box(c,.15,-.22,.25,.44,5,13,'#d5d9bf','#8fa8a0','#6b8e8a',50,55);
    for(const x of [-.22,.26]){const p=iso(x,.25,4,50,55);c.fillStyle='#354940';c.fillRect(p[0]-4,p[1]-4,7,9);}
    line(c,iso(-.28,.23,15,50,55),iso(.1,.23,15,50,55),'#b8924e',3);
  });
  make('site_sign',60,52,c=>{
    c.fillStyle='#796f50';c.fillRect(28,17,4,25);
    c.fillStyle='#e4d6a6';c.fillRect(6,3,48,22);c.fillStyle='#526957';c.fillRect(10,8,40,3);c.fillRect(14,15,32,2);
  });
  // 16 neighbour masks: edges meet at exactly the same world-space coordinates.
  for(let mask=0;mask<16;mask++)make('site_road_'+mask,100,50,c=>{
    const r=(x:number,y:number,w:number,h:number,col:string)=>rect(c,x,y,w,h,0,col,50,25);
    r(-.35,-.35,.7,.7,'#b3b098');
    for(const [bit,x,y,w,h]of [[1,0,-.35,.5,.7],[2,-.35,0,.7,.5],[4,-.5,-.35,.5,.7],[8,-.35,-.5,.7,.5]])if(mask&bit)r(x,y,w,h,'#b3b098');
    r(-.28,-.28,.56,.56,'#858e80');
    for(const [bit,x,y,w,h]of [[1,0,-.28,.5,.56],[2,-.28,0,.56,.5],[4,-.5,-.28,.5,.56],[8,-.28,-.5,.56,.5]])if(mask&bit)r(x,y,w,h,'#858e80');
  });
  for(let mask=0;mask<16;mask++)make('site_fence_'+mask,100,70,c=>{
    const p=(x:number,y:number,z:number)=>iso(x,y,z,50,40);
    for(const [bit,x,y]of [[1,.5,0],[2,0,.5],[4,-.5,0],[8,0,-.5]])if(mask&bit)for(const z of [5,12])line(c,p(0,0,z),p(x,y,z),'#a5ad91',2);
    line(c,p(0,0,0),p(0,0,16),'#65775d',3);
  });
  make('site_gate',100,70,c=>{
    const p=(x:number,z:number)=>iso(x,0,z,50,40);
    for(const x of [-.48,.48])line(c,p(x,0),p(x,19),'#67765e',4);
    for(const z of [6,14])line(c,p(-.48,z),p(.12,z),'#bac1a5',2);
    line(c,p(.12,6),p(.12,14),'#bac1a5',2);
  });

  make('site_reeds',48,60,c=>{
    for(const [x,y,h]of [[10,49,23],[19,51,33],[28,47,28],[36,51,19]]){
      line(c,[x,y],[x+2,y-h],'#65805a',2);
      line(c,[x,y-5],[x-5,y-14],'#8d9f63',2);
      line(c,[x,y-9],[x+6,y-18],'#7c985f',2);
      c.fillStyle='#9b754c';c.fillRect(x,y-h-7,4,10);
    }
  });
  for(let v=0;v<3;v++)make('site_flowers_'+v,40,34,c=>{
    for(const [x,y]of [[8,25],[18,29],[27,21],[31,30]]){
      c.fillStyle='#66864e';c.fillRect(x,y-8,2,10);
      const col=['#e6cb7e','#e7e0b8','#b9acc1'][v];
      c.fillStyle=col;c.fillRect(x-2,y-9,6,3);c.fillRect(x,y-11,2,7);
      c.fillStyle='#b88c4f';c.fillRect(x,y-9,2,2);
    }
  });
  for(let v=0;v<2;v++)make('site_duck_'+v,38,26,c=>{
    c.fillStyle='#437f7955';c.fillRect(5,18,25,3);
    poly(c,[[5,12],[11,9],[23,10],[29,14],[24,18],[11,18]],'#d9d1a0');
    c.fillStyle='#6b8a65';c.fillRect(23,5,8,9);c.fillStyle='#d7aa56';c.fillRect(30,10,6,3);
    c.fillStyle='#293f3c';c.fillRect(28,6,2,2);c.fillStyle='#ad9470';c.fillRect(10,12,11,3);
    if(v){line(c,[2,20],[10,20],'#bdd5b7',2);line(c,[22,21],[32,21],'#bdd5b7',2);}
  });
  make('site_picnic',100,90,c=>{
    const cx=50,cy=60;
    for(const x of [-.28,.28])box(c,x,-.17,.08,.38,0,14,'#a99365','#806b4d','#655d44',cx,cy);
    for(const y of [-.19,-.04,.11])rect(c,-.43,y,.86,.12,17,'#bca471',cx,cy);
    for(const y of [-.36,.33]){rect(c,-.48,y,.96,.12,9,'#af9564',cx,cy);for(const x of [-.3,.3])line(c,iso(x,y+.06,0,cx,cy),iso(x,y+.06,9,cx,cy),'#716548',3);}
    for(const x of [-.17,.2])box(c,x,-.03,.06,.06,18,5,'#eee4bd','#d2bf8e','#af9565',cx,cy);
    rect(c,-.05,-.15,.17,.1,18,'#557d71',cx,cy);
  });
  make('site_supplies',100,100,c=>{
    const cx=50,cy=65;
    for(let y=-.27;y<.28;y+=.12)rect(c,-.44,y,.87,.08,2,'#9b8458',cx,cy);
    box(c,-.35,-.17,.38,.37,4,16,'#baa775','#968053','#786c49',cx,cy);
    for(const x of [-.28,-.11])line(c,iso(x,.21,5,cx,cy),iso(x,.21,18,cx,cy),'#ccbb88',2);
    box(c,.1,-.2,.23,.28,3,22,'#91ac9b','#648979','#4b7065',cx,cy);
    rect(c,.15,-.16,.1,.13,27,'#cfce9d',cx,cy);
    line(c,iso(.33,.24,1,cx,cy),iso(.3,.22,37,cx,cy),'#b19a6c',3);
    line(c,iso(.24,.17,2,cx,cy),iso(.46,.17,2,cx,cy),'#637f6d',4);
  });
  make('site_lamp',42,90,c=>{
    c.fillStyle='#526e60';c.fillRect(19,20,4,56);c.fillStyle='#a4b49b';c.fillRect(19,17,15,3);
    c.fillStyle='#d0c392';c.fillRect(29,19,9,4);c.fillStyle='#ece0a6';c.fillRect(30,23,7,3);
    c.fillStyle='#758975';c.fillRect(15,74,12,3);
  });
  make('site_light',100,64,c=>{
    const glow=c.createRadialGradient(50,32,0,50,32,45);glow.addColorStop(0,'#f5d98b80');glow.addColorStop(.4,'#ebc77830');glow.addColorStop(1,'#ebc77800');
    c.fillStyle=glow;c.fillRect(0,0,100,64);
  });
  make('site_dust',200,160,c=>{
    for(let row=0;row<3;row++)for(let i=0;i<24;i++){
      const x=-.72+((i*17)%29)/29*1.44,y=-.7+row*.52+((i*11)%23)/23*.24;
      const p=iso(x,y,19);c.fillStyle=i%3?'#c5b07c88':'#e1cca177';c.fillRect(p[0],p[1],4+(i%3)*2,2);
    }
  });

  // Four readable uniforms, two walking poses. Original pixel characters share a ground anchor.
  for(const [role,shirt,hat,skin]of [
    ['technician','#e4a046','#f2cf62','#c38e67'],
    ['cleaner','#64ad9c','#e4efdb','#9d6953'],
    ['engineer','#668fbc','#f6edce','#d5a27c'],
    ['manager','#826a9b','#735b4b','#bd845f'],
  ]) for(let frame=0;frame<2;frame++) make('staff_'+role+'_'+frame,32,48,c=>{
    const fill=(x:number,y:number,w:number,h:number,col:string)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
    fill(10,30,6,12,'#34526d');fill(18,30,6,12,'#294056');
    fill(8,40+frame*2,9,4,'#384747');fill(18,42-frame*2,9,4,'#384747');
    fill(8,18,18,16,shirt);fill(8,29,18,3,'#eff0ca');
    fill(5,20+frame*2,5,12,shirt);fill(24,20-frame*2,5,12,shirt);
    fill(5,30+frame*2,5,4,skin);fill(24,30-frame*2,5,4,skin);
    fill(11,8,13,13,skin);fill(11,16,3,5,'#926348');
    fill(10,5,16,6,hat);fill(8,10,20,3,hat);
    fill(13,4,10,2,role==='manager'?'#5e4b40':'#fff0b4');
    fill(21,13,2,2,'#35424a');
    if(role==='engineer'||role==='manager'){fill(24,25,6,9,'#dbe6cf');fill(25,27,3,2,'#7b9c9f');}
    else {fill(26,30,4,8,role==='cleaner'?'#7ab5c6':'#b4babc');}
  });
  for(const role of ['technician','cleaner','engineer','manager']) SITE_ICONS['staff_'+role]=(scene.textures.get('staff_'+role+'_0').getSourceImage() as HTMLCanvasElement).toDataURL();

  applyLowPolyArt(scene);
  for(const [kind,art]of Object.entries(SITE_ART)){
    // Crop transparent sprite margins for catalogue previews; world ground anchors stay intact.
    const source=scene.textures.get(art.key).getSourceImage() as HTMLCanvasElement;
    const pixels=source.getContext('2d')!.getImageData(0,0,source.width,source.height).data;
    let left=source.width,top=source.height,right=0,bottom=0;
    for(let y=0;y<source.height;y++)for(let x=0;x<source.width;x++)if(pixels[(y*source.width+x)*4+3]>12){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
    const preview=document.createElement('canvas');preview.width=right-left+9;preview.height=bottom-top+9;
    preview.getContext('2d')!.drawImage(source,left,top,right-left+1,bottom-top+1,4,4,right-left+1,bottom-top+1);
    SITE_ICONS[kind]=preview.toDataURL();
  }
}
