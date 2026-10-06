import {it,expect} from 'vitest';
import {Raycaster,Vector3} from 'three';
import {workParticles,updateWorkParticles} from '../src/three/worksite';
it('work effects show only for active jobs and never intercept world selection',()=>{
  const effects=workParticles();
  updateWorkParticles(effects,'clean',2);expect(effects.visible).toBe(true);
  effects.updateMatrixWorld();
  const ray=new Raycaster(new Vector3(.12,.32,3),new Vector3(0,0,-1));
  expect(ray.intersectObject(effects)).toHaveLength(0);
  updateWorkParticles(effects,'idle',3);expect(effects.visible).toBe(false);
  effects.geometry.dispose();
});
