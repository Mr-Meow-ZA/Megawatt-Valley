import { OrthographicCamera, Vector3, Plane, Raycaster, Vector2 } from 'three';
/** 2:1 ground projection. One simulation tile is one metre-like world unit. */
export const PIXELS_PER_UNIT = 50 * Math.SQRT2;
export const HOME = new Vector3(16.9, 0, 9.1);
export const CAMERA_OFFSET = new Vector3(1, Math.sqrt(2 / 3), 1).normalize().multiplyScalar(70);
export function frameCamera(camera: OrthographicCamera, width: number, height: number, zoom: number, target: Vector3): void {
  camera.left = -width / (2 * PIXELS_PER_UNIT * zoom);
  camera.right = -camera.left;
  camera.top = height / (2 * PIXELS_PER_UNIT * zoom);
  camera.bottom = -camera.top;
  camera.position.copy(target).add(CAMERA_OFFSET);
  camera.lookAt(target);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
}

/** Keep the ground under the cursor fixed while the orthographic view changes scale. */
export function groundPoint(camera:OrthographicCamera,width:number,height:number,x:number,y:number):Vector3|null{
  const ray=new Raycaster();ray.setFromCamera(new Vector2(x/width*2-1,1-y/height*2),camera);
  return ray.ray.intersectPlane(new Plane(new Vector3(0,1,0),0),new Vector3());
}
export function anchoredZoom(camera:OrthographicCamera,width:number,height:number,target:Vector3,zoom:number,x:number,y:number):void{
  const before=groundPoint(camera,width,height,x,y);
  frameCamera(camera,width,height,zoom,target);
  const after=groundPoint(camera,width,height,x,y);
  if(before&&after){target.add(before.sub(after));frameCamera(camera,width,height,zoom,target);}
}
