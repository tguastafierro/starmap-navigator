import * as THREE from 'three';

interface AnimateParams {
  camera: THREE.PerspectiveCamera;
  controls: any;
  composer: any;
  targetCameraPosRef: React.RefObject<THREE.Vector3 | null>;
  keysPressedRef: React.RefObject<{ [key: string]: boolean }>;
  pitchRef: React.RefObject<number>;
  yawRef: React.RefObject<number>;
  mouseRightPressedRef: React.RefObject<boolean>;
}

export function animateScene(params: AnimateParams) {
  const {
    camera,
    controls,
    composer,
    targetCameraPosRef,
    keysPressedRef,
    pitchRef,
    yawRef,
    mouseRightPressedRef,
  } = params;

  const clock = new THREE.Clock();

  const animate = () => {
    requestAnimationFrame(animate);

    // Update controls.
    controls.update();

    if (keysPressedRef.current['q'] || keysPressedRef.current['e']) {
      targetCameraPosRef.current = null;
    }

    // Also, if the right mouse button is pressed (or any other override), cancel zoom
    if (mouseRightPressedRef.current) {
      targetCameraPosRef.current = null;
    }

    // Smoothly move the camera to a target position if needed
    if (targetCameraPosRef.current) {
      camera.position.lerp(targetCameraPosRef.current, 0.02);
      if (camera.position.distanceTo(targetCameraPosRef.current) < 0.5) {
        targetCameraPosRef.current = null;
      }
    }

    const dt = clock.getDelta(); // seconds
    const translationSpeed = 50; // units per second
    const rotationSpeed = THREE.MathUtils.degToRad(30); // radians per second
    const maxPitch = THREE.MathUtils.degToRad(80);

    // Update rotation based on key inputs
    if (keysPressedRef.current['w']) {
      pitchRef.current = Math.min(pitchRef.current + rotationSpeed * dt, maxPitch);
    }
    if (keysPressedRef.current['s']) {
      pitchRef.current = Math.max(pitchRef.current - rotationSpeed * dt, -maxPitch);
    }
    if (keysPressedRef.current['a']) {
      yawRef.current += rotationSpeed * dt;
    }
    if (keysPressedRef.current['d']) {
      yawRef.current -= rotationSpeed * dt;
    }

    camera.rotation.set(pitchRef.current, yawRef.current, 0, 'YXZ');
    const newForward = new THREE.Vector3();
    camera.getWorldDirection(newForward);
    controls.target.copy(camera.position).add(newForward);

    // Lateral translation (e.g., 'q' and 'e' keys)
    if (keysPressedRef.current['q'] || keysPressedRef.current['e']) {
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward).normalize();
      const right = new THREE.Vector3();
      right.crossVectors(camera.up, forward).normalize();
      const scalar = translationSpeed * dt * (keysPressedRef.current['q'] ? -1 : 1);
      const translation = right.multiplyScalar(scalar);
      camera.position.add(translation);
      controls.target.add(translation);
    }

    // Thrust forward if right mouse button is pressed
    if (mouseRightPressedRef.current) {
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward).normalize();
      const translation = forward.multiplyScalar(translationSpeed * dt);
      camera.position.add(translation);
      controls.target.add(translation);
    }

    // Optionally clamp camera positions here if needed
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -1000, 1000);
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, -1000, 1000);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -1000, 1000);
    controls.target.x = THREE.MathUtils.clamp(controls.target.x, -1000, 1000);
    controls.target.y = THREE.MathUtils.clamp(controls.target.y, -1000, 1000);
    controls.target.z = THREE.MathUtils.clamp(controls.target.z, -1000, 1000);

    // Render via composer
    composer.render();
  };

  animate();
}
