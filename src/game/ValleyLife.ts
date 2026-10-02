import Phaser from 'phaser';
import type { GameSnapshot } from '../simulation/types';
import { WORLD_W,WORLD_H,SITE_A,SITE_B,SCENERY,ROAD_TILES,inRect,isWater,isBank,riverCenterX,riverHalfWidth,clearForScenery } from '../content/valleyLayout';
import { isoToScreen,depthFor } from './iso';

type Spot={x:number;y:number;message:string};
const seeded=(n:number)=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
/** Decorative layers only: no fake equipment, workers or production.
 * Every fixed detail has a habitat or a purpose and avoids the access network.
 */
export class ValleyLife {
  private water:Phaser.GameObjects.Graphics;
  private air:Phaser.GameObjects.Graphics;
  private windows:Phaser.GameObjects.Graphics;
  private ducks:Phaser.GameObjects.Image[]=[];
  private lights:Phaser.GameObjects.Image[]=[];
  private reeds:Array<{image:Phaser.GameObjects.Image;x:number}>=[];
  private spots:Spot[]=[];
  private reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  constructor(private scene:Phaser.Scene){
    this.ground();
    this.details();
    this.water=scene.add.graphics().setDepth(-960);
    this.air=scene.add.graphics().setDepth(760);
    this.windows=scene.add.graphics().setDepth(893);
    for(let i=0;i<2;i++)this.ducks.push(scene.add.image(0,0,'site_duck_0').setOrigin(.5,.7).setScale(.65).setDepth(-955));
  }
  private ground(){
    const g=this.scene.add.graphics().setDepth(-990);
    // Forest-floor colour follows the existing groves, not random dots across the site.
    for(const p of SCENERY){
      if(p.kind!=='tree')continue;
      const s=isoToScreen(p.x,p.y);
      g.fillStyle(0x59794e,.11);g.fillEllipse(s.x+4,s.y,100*p.scale,44*p.scale);
      g.fillStyle(0xc0b578,.07);g.fillEllipse(s.x-15,s.y-2,66*p.scale,24*p.scale);
    }
    // Quiet mowing bands distinguish working land from the rough surrounding meadow.
    for(const plot of [SITE_A,SITE_B])for(let y=plot.y0;y<plot.y1;y+=2){
      const p=[isoToScreen(plot.x0-.5,y-.5),isoToScreen(plot.x1-.5,y-.5),isoToScreen(plot.x1-.5,y+.5),isoToScreen(plot.x0-.5,y+.5)];
      g.fillStyle(0xc2cc87,.075);g.beginPath();p.forEach((s,i)=>i?g.lineTo(s.x,s.y):g.moveTo(s.x,s.y));g.closePath();g.fillPath();
    }
    // Clustered blades: fewer, quieter marks on mown ground and none in roads/water.
    for(let i=0;i<6000;i++){
      const x=seeded(i)*WORLD_W-.5,y=seeded(i+8071)*WORLD_H-.5;
      if(isWater(x,y)||isBank(x,y)||ROAD_TILES.some(p=>Math.hypot(x-p.x,y-p.y)<.52))continue;
      if(x>4.45&&x<7.9&&y>4.4&&y<8.2)continue;
      const field=inRect(x,y,SITE_A)||inRect(x,y,SITE_B);
      const clump=Math.sin(x*.7+y*.42)+Math.cos(y*.83-x*.19);
      if(field&&i%5!==0||!field&&clump<-.4)continue;
      const s=isoToScreen(x,y),colour=field?0x8c9d60:clump>1?0xb7bd75:0x698b52;
      g.fillStyle(colour,field?.2:.48);
      for(let blade=0;blade<(field?2:3);blade++)g.fillRect(Math.round(s.x)+blade*3,Math.round(s.y)-blade%2*2,2,field?1:3);
      if(!field&&i%17===0){g.fillStyle(0xd4c286,.7);g.fillRect(s.x+3,s.y-3,2,2);}
    }
  }
  private add(key:string,x:number,y:number,origin=.8,scale=1){
    const p=isoToScreen(x,y);
    return this.scene.add.image(p.x,p.y,key).setOrigin(.5,origin).setScale(scale).setDepth(depthFor(x,y,5));
  }
  private details(){
    this.add('site_picnic',7.35,5.25,60/90,.85);
    this.add('site_supplies',7.2,6.3,65/100,.78);
    this.spots.push({x:7.35,y:5.25,message:'Company headquarters: one picnic table, two mugs, unlimited ambition.'});
    this.spots.push({x:7.2,y:6.3,message:'Spare parts. Labelled “probably useful”. Tess insists this is a system.'});
    // Flowers grow in small drifts at meadow edges, not in the panel footprint.
    for(const [cx,cy]of [[2,17.9],[9,19],[14,20.3],[29,19.2],[36,9],[34.8,22.5]]){
      for(let i=0;i<10;i++){
        const x=cx+(seeded(i+cx)*2-1)*1.1,y=cy+(seeded(i+cy+31)*2-1)*.75;
        if(!clearForScenery(x,y))continue;
        this.add('site_flowers_'+(i%3),x,y,29/34,.7+seeded(i+99)*.4);
      }
    }
    for(const y of [5.5,10,17,22,27])for(const side of [-1,1]){
      if(Math.abs(y-1)<1)continue;
      for(let i=0;i<3;i++){
        const ry=y+i*.28,x=riverCenterX(ry)+side*(riverHalfWidth(ry)+.3+i*.05);
        const image=this.add('site_reeds',x,ry,51/60,.68+(i%2)*.13);
        this.reeds.push({image,x:image.x});
      }
    }
    for(const p of [{x:4.6,y:3.55},{x:22.6,y:5.55}]){
      this.add('site_lamp',p.x,p.y,76/90,.75);
      const s=isoToScreen(p.x,p.y);
      this.lights.push(this.scene.add.image(s.x+9,s.y-40,'site_light').setDepth(892).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0));
    }
    this.add('site_picnic',10,2.6,60/90,.75);
    this.spots.push({x:10,y:2.6,message:'Break area. The view is free. The coffee is a recurring operating expense.'});
  }
  update(snapshot:GameSnapshot){
    const time=this.reducedMotion?0:this.scene.time.now/1000;
    const night=snapshot.hour<6||snapshot.hour>19?1:0;
    const wet=snapshot.weather==='rain'||snapshot.weather==='hail';
    this.water.clear();this.air.clear();this.windows.clear();
    for(let i=0;i<40;i++){
      const y=(i*.73+time*.06)%WORLD_H;
      if(Math.abs(y-1)<.55)continue;
      const x=riverCenterX(y)+(seeded(i+14)-.5)*riverHalfWidth(y)*1.4;
      const s=isoToScreen(x,y),length=6+seeded(i+72)*15;
      this.water.lineStyle(1,0xc8ddc0,(night?.07:.16)+Math.sin(time+i)*.04);
      this.water.lineBetween(s.x-length/2,s.y,s.x+length/2,s.y);
      if(wet&&i%2===0){this.water.lineStyle(1,0xb9d2c1,.23);this.water.strokeEllipse(s.x,s.y,4+(time+i)%1*10,2+(time+i)%1*4);}
    }
    for(let i=0;i<this.ducks.length;i++){
      const y=20+Math.sin(time*.08)*1.4+i*.36,x=riverCenterX(y)+.15+Math.sin(time*.1+i)*.27;
      const p=isoToScreen(x,y);this.ducks[i].setPosition(p.x,p.y).setTexture('site_duck_'+(Math.floor(time*2+i)%2)).setFlipX(Math.cos(time*.08)<0);
    }
    for(let i=0;i<this.reeds.length;i++)this.reeds[i].image.x=this.reeds[i].x+Math.round(Math.sin(time*1.3+i)*.7);
    // A few butterflies stay in the flower meadows; birds occasionally cross high overhead.
    if(!wet&&!night){
      for(let i=0;i<5;i++){
        const p=isoToScreen(7+i*5+Math.sin(time*.2+i)*.5,18+Math.cos(time*.3+i)*.45);
        const flap=Math.sin(time*8+i)>0?3:1;
        this.air.fillStyle(i%2?0xe3c77c:0xe7debd,.85);this.air.fillRect(p.x-flap,p.y-14,flap,2);this.air.fillRect(p.x+1,p.y-16,flap,2);
      }
      const flight=time%65;
      if(flight<18)for(let i=0;i<3;i++){
        const p=isoToScreen(3+flight*1.6-i*.5,14+Math.sin(flight*.13+i)*.5);
        this.air.lineStyle(2,0x415d4e,.65);this.air.lineBetween(p.x-4,p.y-80+Math.sin(time*7+i)*2,p.x,p.y-78);this.air.lineBetween(p.x,p.y-78,p.x+4,p.y-80+Math.sin(time*7+i)*2);
      }
    }
    for(const light of this.lights)light.setAlpha(night?.72:0);
    if(night)for(const eq of snapshot.equipment){
      if(eq.kind!=='office'||!eq.commissioned)continue;
      for(const x of [-.46,.08]){
        const a=isoToScreen(eq.tile.x+.5+x,eq.tile.y+.5+.58),b=isoToScreen(eq.tile.x+.5+x+.3,eq.tile.y+.5+.58);
        this.windows.fillStyle(0xf2d384,.8);this.windows.beginPath();this.windows.moveTo(a.x,a.y-15);this.windows.lineTo(b.x,b.y-15);this.windows.lineTo(b.x,b.y-27);this.windows.lineTo(a.x,a.y-27);this.windows.closePath();this.windows.fillPath();
      }
    }
  }
  inspect(worldX:number,worldY:number):string|null{
    for(const duck of this.ducks)if(Math.hypot(worldX-duck.x,worldY-duck.y)<18)return 'The river inspectors have arrived. Their fee is one breadcrumb. Please do not feed the auditors.';
    for(const spot of this.spots){const p=isoToScreen(spot.x,spot.y);if(Math.hypot(worldX-p.x,worldY-p.y+10)<24)return spot.message;}
    return null;
  }
}
