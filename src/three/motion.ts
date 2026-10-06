import { riverCenterX,riverHalfWidth } from '../content/valleyLayout';
/** Presentation-only paths. No economy or save state depends on ambient motion. */
export function trafficPose(seconds:number,lane:number):{x:number;z:number;heading:number}{
  const distance=((seconds*.8+lane*32)%64+64)%64;
  return {x:lane===0?distance-11:53-distance,z:lane===0?.76:1.24,heading:lane===0?Math.PI/2:-Math.PI/2};
}
export function duckPose(seconds:number,index:number):{x:number;z:number;heading:number}{
  const angle=seconds*.075+index*.48,centre=12+index*.18;
  const z=centre+Math.sin(angle)*2.25;
  const offset=Math.cos(angle)*.4+(index-1)*.14;
  const x=riverCenterX(z)+offset;
  const nextZ=centre+Math.sin(angle+.001)*2.25;
  const nextX=riverCenterX(nextZ)+Math.cos(angle+.001)*.4+(index-1)*.14;
  return {x,z,heading:Math.atan2(nextX-x,nextZ-z)};
}
export function reedPosition(z:number,side:number,offset:number):{x:number;z:number}{
  return {x:riverCenterX(z)+side*(riverHalfWidth(z)+.1+offset),z};
}
