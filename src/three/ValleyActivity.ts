import * as T from 'three';
import { box,makeVan,material } from './models';
import { trafficPose,duckPose } from './motion';
import type { GameSnapshot } from '../simulation/types';

/** Small ambient actors remain on the public road or inside the river. */
export class ValleyActivity {
  readonly root=new T.Group();
  private readonly traffic:T.Group[]=[];
  private readonly ducks:T.Group[]=[];
  private readonly wakes:T.Mesh[]=[];
  constructor(scene:T.Scene){
    this.root.name='Valley traffic and wildlife';scene.add(this.root);
    for(let i=0;i<2;i++){
      const van=makeVan();van.name='Public road courier';van.scale.setScalar(.8);this.root.add(van);this.traffic.push(van);
    }
    const bodyGeometry=new T.SphereGeometry(1,8,5);
    for(let i=0;i<3;i++){
      const duck=new T.Group();duck.name='River duck';this.root.add(duck);this.ducks.push(duck);
      const body=new T.Mesh(bodyGeometry,material(i===0?0xb4a486:0x937c57));body.scale.set(.095,.075,.17);body.position.y=.065;body.castShadow=true;duck.add(body);
      box(duck,0,.13,.115,.074,.12,.075,i===0?0x4f7660:0x8f8060);
      box(duck,0,.154,.175,.055,.023,.09,0xd8a45e);
      box(duck,.039,.177,.132,.009,.013,.018,0x263d35);
      box(duck,-.039,.177,.132,.009,.013,.018,0x263d35);
      const wake=new T.Mesh(new T.RingGeometry(.16,.17,24),new T.MeshBasicMaterial({color:0xd2e0c9,transparent:true,opacity:.35,depthWrite:false,side:T.DoubleSide}));
      wake.rotation.x=-Math.PI/2;wake.scale.set(.8,1.4,1);this.root.add(wake);this.wakes.push(wake);
    }
  }
  update(seconds:number,s:GameSnapshot):void{
    for(let i=0;i<this.traffic.length;i++){
      const pose=trafficPose(seconds,i),van=this.traffic[i];
      const ramp=Math.max(0,Math.min(1,(pose.x-17)/.45,(22.6-pose.x)/.45));
      van.position.set(pose.x,.014+ramp*.036,pose.z);van.rotation.y=pose.heading;
    }
    for(let i=0;i<this.ducks.length;i++){
      const pose=duckPose(seconds,i),duck=this.ducks[i];
      duck.position.set(pose.x,-.145+Math.sin(seconds*2+i)*.008,pose.z);duck.rotation.y=pose.heading;
      const wake=this.wakes[i];wake.position.set(pose.x,-.145,pose.z);wake.rotation.z=-pose.heading;
      const severe=s.weather==='hail';duck.visible=!severe;wake.visible=!severe&&s.hour>=6&&s.hour<19;
    }
  }
  state():Record<string,unknown>{
    return {traffic:this.traffic.map(o=>[o.position.x,o.position.z]),ducks:this.ducks.map(o=>[o.position.x,o.position.z]),ducksVisible:this.ducks[0].visible};
  }
}
