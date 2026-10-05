import {describe,it,expect} from 'vitest';
import {OrthographicCamera,Vector3} from 'three';
import {frameCamera,HOME} from '../src/three/projection';
import {groundHeight} from '../src/three/landscape';
describe('3D coordinate contract',()=>{
  it('preserves the existing tile centre projection and ground picking at every zoom',()=>{
    for(const zoom of [.35,.62,1.8]){
      const camera=new OrthographicCamera(-1,1,1,-1,.1,180);frameCamera(camera,1440,900,zoom,HOME);
      for(const [x,z]of [[4,4],[12,7],[22,6],[33,15]]){
        const p=new Vector3(x,0,z).project(camera);
        expect((p.x+1)*720).toBeCloseTo(720+((x-z)*50-390)*zoom,5);
        expect((1-p.y)*450).toBeCloseTo(450+((x+z)*25-650)*zoom,5);
      }
    }
  });
  it('keeps buildable land level and the river below its banks',()=>{
    for(let x=4;x<18;x++)for(let z=4;z<16;z++)expect(groundHeight(x,z)).toBe(0);
    expect(groundHeight(19.7,8)).toBeLessThan(-.2);
    expect(groundHeight(-12,-15)).toBeGreaterThan(1);
  });
});
