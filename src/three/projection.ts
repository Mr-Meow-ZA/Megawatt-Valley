import { OrthographicCamera, Vector3 } from 'three';
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
