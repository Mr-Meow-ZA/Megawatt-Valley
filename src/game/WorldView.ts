import { ValleyLife } from './ValleyLife';
import Phaser from 'phaser';
import { EQUIPMENT } from '../content/equipment';
import { WORLD_W,WORLD_H,ACCESS_Y,ROAD_TILES,FENCE_EDGES,SCENERY,connectionMask,isMainRoad,riverCenterX,riverHalfWidth,alongPath } from '../content/valleyLayout';
import type { GameSimulation } from '../simulation/GameSimulation';
import type { EquipmentKind,GameSnapshot,Vec2 } from '../simulation/types';
import { depthFor,isoToScreen,screenToIso,TILE_H } from './iso';
import { generateSiteArt,SITE_ART } from './siteArt';
type P={x:number;y:number};
type Entity={dust:Phaser.GameObjects.Image;sprite:Phaser.GameObjects.Image;status:Phaser.GameObjects.Text;shadow:Phaser.GameObjects.Ellipse};
const pv=(kind:string)=>kind==='bargain_pv'||kind==='premium_pv';
export class WorldView {
  private life!:ValleyLife;
  private placementHint!:Phaser.GameObjects.Text;
  private completionBursts:Array<{x:number;y:number;born:number}>=[];
  private commissioned=new Map<string,boolean>();
  private entities=new Map<string,Entity>();
  private preview!:Phaser.GameObjects.Graphics;
  private ghost!:Phaser.GameObjects.Image;
  private selection!:Phaser.GameObjects.Graphics;
  private taskGraphics!:Phaser.GameObjects.Graphics;
  private plotGraphics!:Phaser.GameObjects.Graphics;
  private weatherGraphics!:Phaser.GameObjects.Graphics;
  private veil!:Phaser.GameObjects.Rectangle;
  private hoverTile:Vec2|null=null;
  private pointerInWorld=true;
  private labels:Phaser.GameObjects.Text[]=[];
  private siteBLabel!:Phaser.GameObjects.Text;
  private van!:Phaser.GameObjects.Image;
  private lastEquipmentKey='';
  private staticRoadSprites=new Map<string,Phaser.GameObjects.Image>();
  private startedAt=0;
  constructor(private readonly scene:Phaser.Scene,private readonly sim:GameSimulation){
    generateSiteArt(scene);
    scene.cameras.main.setBackgroundColor(0x789473);
    this.buildLandscape();
    this.life=new ValleyLife(scene);
    this.preview=scene.add.graphics().setDepth(790);
    this.selection=scene.add.graphics().setDepth(780);
    this.taskGraphics=scene.add.graphics().setDepth(795);
    this.placementHint=scene.add.text(0,0,'',{fontFamily:'system-ui,sans-serif',fontSize:'12px',resolution:2,color:'#f1e9cd',backgroundColor:'#294c3f',padding:{x:10,y:7}}).setOrigin(.5,1).setDepth(810).setVisible(false);
    this.ghost=scene.add.image(0,0,'site_pv_basic').setDepth(800).setVisible(false);
    this.weatherGraphics=scene.add.graphics().setDepth(900).setScrollFactor(0);
    this.veil=scene.add.rectangle(0,0,1,1,0x182d3d,0).setOrigin(0).setDepth(890).setScrollFactor(0);
    const cam=scene.cameras.main;
    cam.setBounds(-1800,-500,4300,2800);
    cam.setZoom(.62);cam.centerOn(390,650);
    this.startedAt=scene.time.now;
  }
  private polygon(g:Phaser.GameObjects.Graphics,points:P[],colour:number,alpha=1){
    g.fillStyle(colour,alpha);g.beginPath();points.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();g.fillPath();
  }
  private area(g:Phaser.GameObjects.Graphics,x:number,y:number,w:number,h:number,colour:number,alpha=1){
    this.polygon(g,[isoToScreen(x,y),isoToScreen(x+w,y),isoToScreen(x+w,y+h),isoToScreen(x,y+h)],colour,alpha);
  }
  private line(g:Phaser.GameObjects.Graphics,a:P,b:P,colour:number,width=1,alpha=1,z=0){
    const p=isoToScreen(a.x,a.y),q=isoToScreen(b.x,b.y);
    g.lineStyle(width,colour,alpha);g.lineBetween(p.x,p.y-z,q.x,q.y-z);
  }
  private label(text:string,x:number,y:number,size=14){
    const p=isoToScreen(x,y);
    const label=this.scene.add.text(p.x,p.y,text,{fontFamily:'system-ui, sans-serif',fontSize:size+'px',resolution:2,color:'#e5ead2',
      backgroundColor:'#385b49',padding:{x:10,y:5}}).setOrigin(.5).setDepth(770).setAlpha(.88);
    this.labels.push(label);return label;
  }
  private fence(a:P,b:P){
    const g=this.scene.add.graphics().setDepth(depthFor((a.x+b.x)/2,(a.y+b.y)/2,7));
    this.line(g,a,b,0x687b5e,3,.2,0);
    for(const z of [6,13])this.line(g,a,b,0xc0c5a2,1.7,.9,z);
    for(const p of [a,b]){
      const s=isoToScreen(p.x,p.y);g.lineStyle(3,0x697a58,1);g.lineBetween(s.x,s.y,s.x,s.y-17);
      g.fillStyle(0xd0ccb0,1);g.fillRect(s.x-2,s.y-18,4,3);
    }
  }
  private buildLandscape(){
    const g=this.scene.add.graphics().setDepth(-1000);
    this.area(g,-.5,-.5,WORLD_W,WORLD_H,0x91ad70);
    this.area(g,3.5,3.5,14,12,0xa4b680,.48);
    this.area(g,21.5,5.5,12,10,0xa4b680,.4);
    const ribbon=(margin:number,colour:number)=>{
      const left:P[]=[],right:P[]=[];
      for(let y=-.5;y<=WORLD_H-.5;y+=.25){const half=riverHalfWidth(y)+margin;left.push(isoToScreen(riverCenterX(y)-half,y));right.push(isoToScreen(riverCenterX(y)+half,y));}
      this.polygon(g,[...left,...right.reverse()],colour);
    };
    ribbon(.5,0xc4c29a);ribbon(.18,0x88b2a5);ribbon(0,0x5d9f9e);
    for(let y=0;y<WORLD_H;y+=1.6){
      const x=riverCenterX(y)+(Math.sin(y*2)*.65);
      this.line(g,{x:x-.15,y},{x:x+.24,y:y+.1},0xc0d8bf,1,.55);
    }
    // A small useful yard, at the office, rather than unrelated parked props.
    this.area(g,4.5,4.5,3.3,3.6,0xb9b69b);
    for(const tile of ROAD_TILES){
      const p=isoToScreen(tile.x,tile.y),mask=connectionMask(tile.x,tile.y,isMainRoad);
      const s=this.scene.add.image(p.x,p.y,'site_road_'+mask).setDepth(-950);
      this.staticRoadSprites.set(tile.x+','+tile.y,s);
    }
    // Deck spans BOTH banks and exactly follows the access-road axis.
    const deck=this.scene.add.graphics().setDepth(-940);
    this.area(deck,17.45,ACCESS_Y-.42,4.7,.84,0x9caa99);
    for(let x=17.5;x<22.2;x+=.2)this.line(deck,{x,y:ACCESS_Y-.4},{x,y:ACCESS_Y+.4},0x798e82,1,.65);
    for(let x=17.5;x<22;x+=.5)for(const y of [ACCESS_Y-.45,ACCESS_Y+.45])this.fence({x,y},{x:x+.5,y});
    for(const edge of FENCE_EDGES)this.fence(edge.a,edge.b);
    for(const prop of SCENERY){
      const p=isoToScreen(prop.x,prop.y);
      const key=prop.kind==='tree'?'site_tree_'+prop.variant:'site_'+prop.kind;
      const origin=prop.kind==='tree'?88/110:32/40;
      this.scene.add.image(p.x,p.y,key).setOrigin(.5,origin).setScale(prop.scale).setDepth(depthFor(prop.x,prop.y,5));
    }
    const park=isoToScreen(7,7.4);
    this.van=this.scene.add.image(park.x,park.y,'site_van').setOrigin(.5,55/90).setDepth(depthFor(7,7.4,5));
    const mark=this.scene.add.graphics().setDepth(-930);
    for(const x of [6.5,7.5])this.line(mark,{x,y:7},{x,y:8},0xd9d8b9,1.5,.8);
    this.line(mark,{x:6.5,y:8},{x:7.5,y:8},0xd9d8b9,1.5,.8);
    for(const [x,y]of [[4.8,3.8],[22.8,5.8]]){
      const s=isoToScreen(x,y);this.scene.add.image(s.x,s.y,'site_sign').setOrigin(.5,42/52).setScale(.65).setDepth(depthFor(x,y,8));
    }
    // One local distribution line connects the grid yard to the public road.
    const wire=this.scene.add.graphics().setDepth(190);
    const poleTiles=[{x:14.5,y:2},{x:24,y:2},{x:35,y:2}];
    for(const p of poleTiles){
      const s=isoToScreen(p.x,p.y);const pole=this.scene.add.graphics().setDepth(depthFor(p.x,p.y,10));
      pole.lineStyle(4,0x7a785b,1);pole.lineBetween(s.x,s.y,s.x,s.y-68);
      pole.lineStyle(3,0xc8c3a2,1);pole.lineBetween(s.x-14,s.y-63,s.x+14,s.y-63);
    }
    for(let i=0;i<poleTiles.length-1;i++){
      const a=isoToScreen(poleTiles[i].x,poleTiles[i].y),b=isoToScreen(poleTiles[i+1].x,poleTiles[i+1].y);
      for(const off of [-8,8]){wire.lineStyle(1,0x556b5b,.7);wire.beginPath();wire.moveTo(a.x+off,a.y-63);wire.lineTo((a.x+b.x)/2+off,(a.y+b.y)/2-50);wire.lineTo(b.x+off,b.y-63);wire.strokePath();}
    }
    const feederA=isoToScreen(14.5,2),feederB=isoToScreen(13.8,4.8);
    wire.lineStyle(1,0x556b5b,.8);
    for(const off of [-5,5]){wire.beginPath();wire.moveTo(feederA.x+off,feederA.y-63);wire.lineTo((feederA.x+feederB.x)/2+off,(feederA.y+feederB.y)/2-50);wire.lineTo(feederB.x+off,feederB.y-64);wire.strokePath();}
    this.label('SUNNY MEADOW',10.5,15,12);
    this.siteBLabel=this.label('RIVER BENCH · FUTURE EXPANSION',28,14.8,12);
    this.plotGraphics=this.scene.add.graphics().setDepth(-920);
  }
  refreshLockedTiles():void{}
  setPointerInWorld(inside:boolean){this.pointerInWorld=inside;if(!inside){this.hoverTile=null;this.preview.clear();}}
  private getTile(p:P):P {const iso=screenToIso(p.x,p.y);return{x:Math.floor(iso.x+.5),y:Math.floor(iso.y+.5)};}
  private anchor(tile:P,kind:EquipmentKind){const f=EQUIPMENT[kind].footprint;return{x:tile.x+(f.x-1)/2,y:tile.y+(f.y-1)/2};}
  private texture(kind:EquipmentKind,tile:P,snapshot:GameSnapshot):string{
    if(kind==='road'||kind==='fence'){
      const has=(x:number,y:number)=>kind==='road'&&isMainRoad(x,y)||snapshot.equipment.some(e=>e.kind===kind&&e.tile.x===x&&e.tile.y===y);
      let mask=connectionMask(tile.x,tile.y,has);if(kind==='fence'&&mask===0)mask=5;
      return 'site_'+kind+'_'+mask;
    }
    return SITE_ART[kind].key;
  }
  private entity(id:string,key:string):Entity{
    let e=this.entities.get(id);
    if(!e){
      e={dust:this.scene.add.image(0,0,'site_dust').setOrigin(.5,100/160).setVisible(false),sprite:this.scene.add.image(0,0,key),shadow:this.scene.add.ellipse(0,0,18,7,0x263d30,.18),
        status:this.scene.add.text(0,0,'',{fontFamily:'system-ui,sans-serif',fontSize:'14px',fontStyle:'bold',color:'#ffe4a1',backgroundColor:'#3d5144',padding:{x:3,y:1}}).setOrigin(.5,1)};
      this.entities.set(id,e);
    }return e;
  }
  sync(snapshot:GameSnapshot){
    this.life.update(snapshot);
    const seen=new Set<string>();
    const equipKey=snapshot.equipment.map(e=>e.id+':'+e.kind+':'+e.tile.x+','+e.tile.y).join('|');
    if(equipKey!==this.lastEquipmentKey){
      for(const t of ROAD_TILES){const has=(x:number,y:number)=>isMainRoad(x,y)||snapshot.equipment.some(e=>e.kind==='road'&&e.tile.x===x&&e.tile.y===y);
        this.staticRoadSprites.get(t.x+','+t.y)?.setTexture('site_road_'+connectionMask(t.x,t.y,has));}
      this.lastEquipmentKey=equipKey;
    }
    this.selection.clear();this.taskGraphics.clear();
    for(const eq of snapshot.equipment){
      seen.add(eq.id);const a=this.anchor(eq.tile,eq.kind),p=isoToScreen(a.x,a.y),def=EQUIPMENT[eq.kind],art=SITE_ART[eq.kind];
      const e=this.entity(eq.id,art.key);
      e.sprite.setTexture(this.texture(eq.kind,eq.tile,snapshot)).setOrigin(.5,art.originY).setPosition(p.x,p.y).setScale(art.scale)
        .setDepth(eq.kind==='road'?-949:depthFor(a.x,a.y,6)).setAlpha(eq.commissioned?1:.4+.6*eq.constructionProgress);
      const source=e.sprite.texture.getSourceImage();
      if(!eq.commissioned){const top=Math.floor((1-eq.constructionProgress)*source.height);e.sprite.setCrop(0,top,source.width,source.height-top);}
      else e.sprite.setCrop();
      const wasReady=this.commissioned.get(eq.id);
      if(wasReady===false&&eq.commissioned)this.completionBursts.push({x:p.x,y:p.y,born:this.scene.time.now});
      this.commissioned.set(eq.id,eq.commissioned);
      e.dust.setPosition(p.x,p.y).setDepth(e.sprite.depth+.1).setAlpha(Math.min(.8,eq.soiling)).setVisible(pv(eq.kind)&&eq.commissioned&&eq.soiling>.18);
      e.sprite.clearTint();if(eq.faulted)e.sprite.setTint(0xe5a398);else if(pv(eq.kind)&&eq.soiling>.35)e.sprite.setTint(0xd1c49c);
      e.shadow.setVisible(false);
      const badge=eq.faulted?'! FAULT':!eq.commissioned?'BUILD '+Math.floor(eq.constructionProgress*100)+'%':pv(eq.kind)&&eq.soiling>.35?'DUST':'';
      e.status.setText(badge).setPosition(p.x,p.y-48).setDepth(805).setVisible(!!badge);
      if(eq.id===snapshot.selectedId){
        this.outline(this.selection,eq.tile,def.footprint,0xf3d48b);
      }
      if(!eq.commissioned){
        this.outline(this.taskGraphics,eq.tile,def.footprint,0xd2b57d);
        const c=this.scene.time.now/650,puffX=p.x+Math.sin(c)*20;
        this.taskGraphics.fillStyle(0xd9cc9d,.6);this.taskGraphics.fillRect(puffX,p.y-15-(c%1)*16,4,4);
      }
    }
    for(const s of snapshot.staff){
      seen.add(s.id);const traveling=s.task.type==='travel',busy=s.task.type!=='idle';
      const p=isoToScreen(s.tile.x,s.tile.y),e=this.entity(s.id,'tech');
      const key=traveling?'tech_walk_'+Math.floor(this.scene.time.now/150)%2:'tech';
      e.sprite.setTexture(key).setOrigin(.5,.93).setPosition(p.x,p.y-(traveling?Math.sin(this.scene.time.now/90):0)).setScale(.38).setDepth(depthFor(s.tile.x,s.tile.y,10));
      e.sprite.clearTint();if(s.role==='cleaner')e.sprite.setTint(0xa5dabf);
      e.shadow.setPosition(p.x,p.y+1).setDepth(depthFor(s.tile.x,s.tile.y,8)).setVisible(true);
      const task=s.task.type==='repair'?'REPAIR':s.task.type==='clean'?'CLEAN':s.id===snapshot.selectedId?s.name:'';
      e.status.setText(task).setFontSize(10).setPosition(p.x,p.y-25).setDepth(804).setVisible(!!task);
      if(busy&&s.task.type!=='travel'){
        for(let i=0;i<3;i++){const t=(this.scene.time.now/400+i*.33)%1;this.taskGraphics.fillStyle(s.task.type==='clean'?0xa5dae0:0xf2cd71,1-t);this.taskGraphics.fillRect(p.x+8+i*3-t*14,p.y-12-t*12,2,2);}
      }
    }
    for(const [id,e]of this.entities)if(!seen.has(id)){e.sprite.destroy();e.dust.destroy();e.shadow.destroy();e.status.destroy();this.entities.delete(id);this.commissioned.delete(id);}
    this.completionBursts=this.completionBursts.filter(b=>this.scene.time.now-b.born<950);
    for(const b of this.completionBursts){
      const t=(this.scene.time.now-b.born)/950;
      for(let i=0;i<12;i++){const a=i/12*Math.PI*2,r=12+t*34;this.taskGraphics.fillStyle(i%2?0xe6c579:0xc9deb3,1-t);this.taskGraphics.fillRect(b.x+Math.cos(a)*r,b.y+Math.sin(a)*r*.45-t*20,3,3);}
    }
    const expanded=!!snapshot.plots.find(p=>p.id==='site_b')?.unlocked;
    this.siteBLabel.setText(expanded?'RIVER BENCH · SITE B':'RIVER BENCH · FUTURE EXPANSION');
    // A closed service route includes the yard exit, avoiding jumps between parked and driving.
    const phase=((this.scene.time.now-this.startedAt)/1000)%80;
    for(const label of this.labels)label.setScale(1/this.scene.cameras.main.zoom);
    const path=[{x:7,y:7.4},{x:4,y:7.4},{x:4,y:ACCESS_Y},{x:15.5,y:ACCESS_Y},{x:4,y:ACCESS_Y},{x:4,y:7.4},{x:7,y:7.4}];
    const v=phase<40?path[0]:alongPath(path,(phase-40)/40);
    const vp=isoToScreen(v.x,v.y);this.van.setPosition(vp.x,vp.y).setDepth(depthFor(v.x,v.y,10)).setFlipX(phase>=60);
    this.plotGraphics.clear();
    if(snapshot.buildMode)this.outline(this.plotGraphics,{x:4,y:4},{x:14,y:12},0xc4d7a5);
    if(snapshot.buildMode&&expanded)this.outline(this.plotGraphics,{x:22,y:6},{x:12,y:10},0xc4d7a5);
    this.weather(snapshot);
  }
  private weather(snapshot:GameSnapshot){
    const cam=this.scene.cameras.main;
    const hour=snapshot.hour;
    const night=hour<5.5||hour>20.5?.43:hour<7?(7-hour)/1.5*.43:hour>18?(hour-18)/2.5*.43:0;
    const wet=snapshot.weather==='rain'||snapshot.weather==='hail';
    const dim=night+(wet?.15:snapshot.weather==='overcast'?.1:0);
    this.veil.setOrigin(.5).setPosition(cam.width/2,cam.height/2).setSize(cam.width/cam.zoom,cam.height/cam.zoom).setAlpha(dim);
    this.weatherGraphics.setScale(1/cam.zoom).setPosition(cam.width/2*(1-1/cam.zoom),cam.height/2*(1-1/cam.zoom));
    this.weatherGraphics.clear();
    if(wet)for(let i=0;i<70;i++){
      const x=(i*197+(this.scene.time.now/20))%cam.width;
      const y=(i*113+this.scene.time.now/6)%cam.height;
      this.weatherGraphics.lineStyle(snapshot.weather==='hail'?3:1,0xdbebdc,.65);
      this.weatherGraphics.lineBetween(x,y,x-3,y+(snapshot.weather==='hail'?3:12));
    }
  }
  private outline(g:Phaser.GameObjects.Graphics,tile:P,footprint:P,colour:number){
    const pts=[isoToScreen(tile.x-.5,tile.y-.5),isoToScreen(tile.x+footprint.x-.5,tile.y-.5),isoToScreen(tile.x+footprint.x-.5,tile.y+footprint.y-.5),isoToScreen(tile.x-.5,tile.y+footprint.y-.5)];
    g.lineStyle(2,colour,.85);g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();g.strokePath();
  }
  updateHoverTile(snapshot:GameSnapshot,pointerWorld:P){
    if(snapshot.buildMode||!this.pointerInWorld)return;
    this.hoverTile=this.getTile(pointerWorld);
  }
  updateGhost(snapshot:GameSnapshot,pointerWorld:P){
    this.preview.clear();this.ghost.setVisible(false);this.placementHint.setVisible(false);
    if(!snapshot.buildMode||!this.pointerInWorld)return;
    const tile=this.getTile(pointerWorld);this.hoverTile=tile;
    const kind=snapshot.buildMode,plot=this.sim.plotAtTile(tile);
    const reason=plot?this.sim.canPlace(kind,plot,tile):'Choose a buildable plot';
    const ok=reason===null;
    const def=EQUIPMENT[kind],a=this.anchor(tile,kind),p=isoToScreen(a.x,a.y),art=SITE_ART[kind];
    const colour=ok?0x82deaa:0xeb8172;
    this.area(this.preview,tile.x-.5,tile.y-.5,def.footprint.x,def.footprint.y,colour,.25);
    this.outline(this.preview,tile,def.footprint,colour);
    this.placementHint.setText(ok?'$'+def.cost.toLocaleString('en-US')+' · Click to build':reason??'Cannot build here')
      .setPosition(p.x,p.y-76).setScale(1/this.scene.cameras.main.zoom).setBackgroundColor(ok?'#294c3f':'#704b40').setVisible(true);
    this.ghost.setTexture(this.texture(kind,tile,snapshot)).setOrigin(.5,art.originY).setPosition(p.x,p.y).setScale(art.scale).setAlpha(.72).setTint(colour).setVisible(true);
  }
  inspectScenery(x:number,y:number):string|null{return this.life.inspect(x,y);}
  getHoverTile():Vec2|null{return this.hoverTile;}
  pickEntity(snapshot:GameSnapshot,worldX:number,worldY:number):string|null{
    // A person at the service edge should remain selectable in front of their array.
    for(const staff of snapshot.staff){const p=isoToScreen(staff.tile.x,staff.tile.y);if(Math.hypot(worldX-p.x,worldY-p.y+11)<12)return staff.id;}
    // Hit visible opaque sprite pixels before falling back to ground footprints.
    // Isometric roofs and racks extend above their ground cells.
    const visible=[...snapshot.equipment].sort((a,b)=>(this.entities.get(b.id)?.sprite.depth??0)-(this.entities.get(a.id)?.sprite.depth??0));
    for(const eq of visible){
      const sprite=this.entities.get(eq.id)?.sprite;if(!sprite)continue;
      const source=sprite.texture.getSourceImage() as HTMLCanvasElement;
      const px=Math.floor((worldX-sprite.x)/sprite.scaleX+sprite.displayOriginX);
      const py=Math.floor((worldY-sprite.y)/sprite.scaleY+sprite.displayOriginY);
      if(px>=0&&py>=0&&px<source.width&&py<source.height&&source.getContext?.('2d')?.getImageData(px,py,1,1).data[3])return eq.id;
    }
    const tile=this.getTile({x:worldX,y:worldY});
    // Footprint picking uses precisely the same cell convention as drawing/building.
    for(const eq of [...snapshot.equipment].reverse()){
      const fp=EQUIPMENT[eq.kind].footprint;
      if(tile.x>=eq.tile.x&&tile.x<eq.tile.x+fp.x&&tile.y>=eq.tile.y&&tile.y<eq.tile.y+fp.y)return eq.id;
    }
    for(const s of snapshot.staff){const p=isoToScreen(s.tile.x,s.tile.y);if(Math.hypot(worldX-p.x,worldY-p.y+10)<18)return s.id;}
    return null;
  }
}
export {WORLD_W,WORLD_H,TILE_H};
