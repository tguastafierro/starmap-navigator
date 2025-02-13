import * as THREE from 'three';

export function setupRaycaster(
  rendererDom: HTMLElement,
  camera: THREE.Camera,
  clickableStars: THREE.Object3D[],
  onStarHover: (hovered: boolean) => void,
  onStarClick: (starId: string) => void,
  getStarDataFromObject: (object: THREE.Object3D) => any
) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const onPointerMove = (event: PointerEvent) => {
    const rect = rendererDom.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableStars, true);
    onStarHover(intersects.length > 0);
  };

  const onClick = (event: MouseEvent) => {
    const rect = rendererDom.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableStars, true);
    if (intersects.length > 0) {
      let clickedObject = intersects[0].object;
      if (clickedObject instanceof THREE.Sprite && clickedObject.parent) {
        clickedObject = clickedObject.parent;
      }
      const starData = getStarDataFromObject(clickedObject);
      if (!starData) return;
      onStarClick(starData.id);
    }
  };

  rendererDom.addEventListener('pointermove', onPointerMove, false);
  rendererDom.addEventListener('click', onClick, false);

  // Return a cleanup function to remove event listeners when needed
  return () => {
    rendererDom.removeEventListener('pointermove', onPointerMove, false);
    rendererDom.removeEventListener('click', onClick, false);
  };
}
