import {describe,it,expect} from 'vitest';
import {trafficPose,duckPose,reedPosition} from '../src/three/motion';
import {riverCenterX,riverHalfWidth,inRect,SITE_A,SITE_B} from '../src/content/valleyLayout';
describe('ambient routes protect the working valley',()=>{
  it('keeps opposing traffic in separate lanes on the public road',()=>{
    for(let time=0;time<240;time+=.7){
      const a=trafficPose(time,0),b=trafficPose(time,1);
      expect(a.z).toBe(.76);expect(b.z).toBe(1.24);
      for(const p of [a,b]){expect(p.x).toBeGreaterThanOrEqual(-11);expect(p.x).toBeLessThanOrEqual(53);expect(inRect(p.x,p.z,SITE_A)||inRect(p.x,p.z,SITE_B)).toBe(false);}
    }
  });
  it('keeps the duck group inside water, away from the bridge',()=>{
    for(let time=0;time<200;time+=.5)for(let i=0;i<3;i++){
      const p=duckPose(time,i);expect(Math.abs(p.x-riverCenterX(p.z))+.2).toBeLessThan(riverHalfWidth(p.z));
      expect(p.z).toBeGreaterThan(3);expect(Number.isFinite(p.heading)).toBe(true);
    }
  });
  it('places reed pockets on the banks without entering build plots',()=>{
    for(const z of [8.5,9,9.5,18.3,19.3,25,26])for(const side of [-1,1]){
      const p=reedPosition(z,side,.12);expect(Math.abs(p.x-riverCenterX(z))).toBeGreaterThan(riverHalfWidth(z));
      expect(inRect(p.x,p.z,SITE_A)||inRect(p.x,p.z,SITE_B)).toBe(false);
    }
  });
});
