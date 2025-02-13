import * as THREE from 'three';

export function clampVector3(vector: THREE.Vector3, range: number): THREE.Vector3 {
  return new THREE.Vector3(
    THREE.MathUtils.clamp(vector.x, -range, range),
    THREE.MathUtils.clamp(vector.y, -range, range),
    THREE.MathUtils.clamp(vector.z, -range, range)
  );
}
