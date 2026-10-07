import {it,expect} from 'vitest';
import {fenceConnections} from '../src/three/connections';
import {ModelLibrary} from '../src/three/models';
import {Vector3} from 'three';
import type {PlacedEquipment} from '../src/simulation/types';
const piece=(x:number,y:number,kind:'fence'|'gate'='fence'):PlacedEquipment=>({id:x+','+y,kind,tile:{x,y},plotId:'site_a',commissioned:true,constructionProgress:1,condition:1,soiling:0,faulted:false});
it('turns perpendicular neighbours into an L and reconnects after removal',()=>{
 const pieces=[piece(8,8),piece(9,8),piece(9,9)];
 expect(fenceConnections('fence',pieces[1].tile,pieces)).toBe(6);
 expect(fenceConnections('fence',pieces[0].tile,pieces)).toBe(1);
 expect(fenceConnections('fence',pieces[2].tile,pieces)).toBe(8);
 expect(fenceConnections('fence',pieces[1].tile,pieces.slice(0,2))).toBe(4);
 expect(fenceConnections('fence',{x:12,y:12},pieces)).toBe(5);
});
it('gates join vertical fences and orient their opening along that run',()=>{
 const pieces=[piece(8,8),piece(8,9,'gate'),piece(8,10)];
 const mask=fenceConnections('gate',pieces[1].tile,pieces);
 expect(mask).toBe(10);
 const gate=new ModelLibrary().equipment('gate',mask);gate.updateMatrixWorld(true);
 const axis=new Vector3(1,0,0).applyQuaternion(gate.quaternion);
 expect(Math.abs(axis.z)).toBeCloseTo(1);expect(axis.x).toBeCloseTo(0);
 expect(fenceConnections('fence',pieces[0].tile,pieces)).toBe(2);
});
