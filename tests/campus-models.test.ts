import {describe,it,expect} from 'vitest';
import {Box3,Mesh,MeshStandardMaterial} from 'three';
import {ModelLibrary} from '../src/three/models';
import {EQUIPMENT} from '../src/content/equipment';
import type {EquipmentKind} from '../src/simulation/types';

describe('campus asset integration',()=>{
 const library=new ModelLibrary();
 it.each<EquipmentKind>(['office','workshop','substation','inverter','bargain_pv','premium_pv'])('%s remains inside its placement footprint and on the ground',kind=>{
  const model=library.equipment(kind),bounds=new Box3().setFromObject(model),size=EQUIPMENT[kind].footprint;
  expect(bounds.min.x).toBeGreaterThanOrEqual(-size.x/2-.001);
  expect(bounds.max.x).toBeLessThanOrEqual(size.x/2+.001);
  expect(bounds.min.z).toBeGreaterThanOrEqual(-size.y/2-.001);
  expect(bounds.max.z).toBeLessThanOrEqual(size.y/2+.001);
  expect(bounds.min.y).toBeGreaterThanOrEqual(-.001);
  expect(bounds.max.y).toBeGreaterThan(.5);
 });
 it('array soiling materials are independent and do not dirty structural materials',()=>{
  const surfaces=(kind:EquipmentKind)=>{
   const out:MeshStandardMaterial[]=[];
   library.equipment(kind).traverse(o=>{if(o instanceof Mesh)for(const material of Array.isArray(o.material)?o.material:[o.material]){
    const m=material as MeshStandardMaterial;if(m.userData.baseColor)out.push(m);
   }});return out;
  };
  const a=surfaces('bargain_pv'),b=surfaces('bargain_pv'),premium=surfaces('premium_pv');
  expect(a.length).toBeGreaterThan(0);expect(b.length).toBe(a.length);
  const clean=b[0].color.getHex();a[0].color.setHex(0x998877);
  expect(b[0].color.getHex()).toBe(clean);
  expect(premium.every(m=>!a.includes(m)&&!b.includes(m))).toBe(true);
 });
});
