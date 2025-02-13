import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { getStarColor } from './threeUtils';
import { StarSystem } from '../types/starTypes';
import store from '../redux/store';

export function loadStarModels(
  scene: THREE.Scene,
  starSystems: StarSystem[],
  clickableStars: THREE.Object3D[],
  camera?: THREE.PerspectiveCamera 
): void {
  const loader = new GLTFLoader();
  loader.load(
    '/stranger_star.glb',
    (gltf) => {
      const starModel = gltf.scene;
      starSystems.forEach((system) => {
        const modelClone = starModel.clone(true);
        modelClone.scale.set(0.5, 0.5, 0.5);
        modelClone.position.set(
          system.coordinates.x,
          system.coordinates.y,
          system.coordinates.z
        );
        // Store the star data in userData
        modelClone.userData.starSystem = system;

        // Add a colored halo
        const starColor = getStarColor(system.starType);
        const box = new THREE.Box3().setFromObject(modelClone);
        const sizeVec = new THREE.Vector3();
        box.getSize(sizeVec);
        const avgSize = (sizeVec.x + sizeVec.y + sizeVec.z) / 3;
        const haloGeometry = new THREE.SphereGeometry(avgSize * 0.6, 32, 32);
        const haloMaterial = new THREE.MeshBasicMaterial({
          color: starColor,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const halo = new THREE.Mesh(haloGeometry, haloMaterial);
        const baseHaloScale = 1.75;
        halo.scale.set(baseHaloScale, baseHaloScale, baseHaloScale);
        modelClone.add(halo);
        // Store the halo in userData for later access
        modelClone.userData.halo = halo;

        halo.onBeforeRender = function (
          renderer,
          scene,
          camera,
          geometry,
          material,
          group
        ) {
          const state = store.getState();
          // Check if this star (by its id) is in the travel plan
          const inTravelPlan = state.travel.travelPlan.some(
            (item) => item.id === system.id
          );
          if (inTravelPlan) {
            // Apply pulsation when the star is in the travel plan
            const time = performance.now() / 1000;
            const amplitude = 0.5; // Pulsation amplitude
            // Compute a pulsation factor that oscillates between 1 and 1 + amplitude
            const pulsateScale = 1 + amplitude * ((Math.sin(time * 2.0) + 1) / 2);
            // Set the halo's scale based on the base scale and the pulsation factor
            halo.scale.set(
              pulsateScale * baseHaloScale,
              pulsateScale * baseHaloScale,
              pulsateScale * baseHaloScale
            );
            // Optionally, pulsate the opacity between 0.9 and 1.0
            const opacityAmplitude = 0.1;
            const pulsateOpacity = 0.9 + opacityAmplitude * ((Math.sin(time * 2.0) + 1) / 2);
            material.opacity = pulsateOpacity;
          } else {
            // Not in travel plan: keep halo at default scale and opacity
            halo.scale.set(baseHaloScale, baseHaloScale, baseHaloScale);
            material.opacity = 0.9;
          }
        };

        clickableStars.push(modelClone);
        scene.add(modelClone);

        // Create a DOM overlay for testing 
        // Only create overlays if a camera is provided
        if (camera) {
          // Get the star's world position.
          const pos = new THREE.Vector3();
          modelClone.getWorldPosition(pos);
          // Project the 3D position to normalized device coordinates (NDC)
          pos.project(camera);
          // Convert NDC to screen coordinates.
          const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
          const y = (-pos.y * 0.5 + 0.5) * window.innerHeight;
  
          const starOverlay = document.createElement('div');
          starOverlay.setAttribute('data-star-id', system.id);
          starOverlay.setAttribute('data-cy', 'star-element');
          // Style the overlay for testing (adjust size and color as needed)
          starOverlay.style.position = 'absolute';
          starOverlay.style.left = `${x}px`;
          starOverlay.style.top = `${y}px`;
          starOverlay.style.width = '12px';
          starOverlay.style.height = '12px';
          starOverlay.style.border = '2px';
          starOverlay.style.borderRadius = '50%';
          starOverlay.style.pointerEvents = 'none';
          starOverlay.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('starOverlayClick', { detail: system.id }));
          });
          // Append the overlay to a container (or directly to the body)
          document.body.appendChild(starOverlay);
        }
      });
    },
    undefined,
    (error) => console.error('Error loading stranger_star.glb:', error)
  );
}
