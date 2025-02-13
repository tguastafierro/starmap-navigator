import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import StarInfoBox from './StarInfoBox';
import TravelPlan from './TravelPlan';

import { SelectedStarData, StarSystem } from '@/types/starTypes';
import { getStarDataFromObject } from '@/utils/threeUtils';
import {
  addOrbitControls,
  createCamera,
  createRenderer,
  createScene,
  setupComposer,
} from '@/hooks/useThreeScene';
import { loadStarModels } from '@/utils/loadStarModels';
import { setupRaycaster } from '@/utils/setupRaycaster';
import { animateScene } from '@/utils/animateScene';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import {
  setSelectedStarData,
  clearSelectedStarData,
} from '@/redux/starSlice';

interface StarMapProps {
  starSystems: StarSystem[];
}

const StarMap: React.FC<StarMapProps> = ({ starSystems }) => {
  // This ref points to the div where the Three.js scene will be rendered
  const mountRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  // The local state is replaced with values from the Redux store
  const selectedStarData = useSelector(
    (state: RootState) => state.star.selectedStarData
  );
  const travelPlan = useSelector(
    (state: RootState) => state.star.travelPlan
  );

  // References for the main Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const clickableStarsRef = useRef<THREE.Object3D[]>([]);
  const targetCameraPosRef = useRef<THREE.Vector3 | null>(null);
  const mouseRightPressedRef = useRef<boolean>(false);

  // References for tracking keyboard input and camera rotation
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});
  const pitchRef = useRef<number>(0);
  const yawRef = useRef<number>(0);

  // Listen to keyboard events and update the key-tracking object
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      keysPressedRef.current[event.key.toLowerCase()] = true;
    };
    const onKeyUp = (event: KeyboardEvent) => {
      keysPressedRef.current[event.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // A helper function to extract star data from a Three.js object
  const getStarDataFromObjectLocal = useCallback(
    (object: THREE.Object3D): StarSystem | null => {
      return getStarDataFromObject(object);
    },
    []
  );

  // Use a ref to always have the latest selected star data available in callbacks
  const selectedStarDataRef = useRef(selectedStarData);
  useEffect(() => {
    selectedStarDataRef.current = selectedStarData;
  }, [selectedStarData]);

  // Handle what happens when a star is clicked
  const handleStarClick = useCallback(
    (starId: string) => {
      // Find the Three.js object representing the star
      const obj = clickableStarsRef.current.find(
        (o) => getStarDataFromObjectLocal(o)?.id === starId
      );
      if (!obj || !cameraRef.current || !controlsRef.current) return;
      const starData = getStarDataFromObjectLocal(obj);
      if (!starData) return;

      // If the star is already selected, unselect it
      if (selectedStarDataRef.current && selectedStarDataRef.current.star.id === starData.id) {
        dispatch(clearSelectedStarData());
        targetCameraPosRef.current = null;
      } else {
        // Otherwise, update the Redux store with the new selection
        const newData: SelectedStarData = { star: starData };
        dispatch(setSelectedStarData(newData));

        // Retrieve the star's world position
        const starWorldPos = obj.getWorldPosition(new THREE.Vector3());
        // Determine the direction from the star to the camera
        const direction = cameraRef.current.position.clone().sub(starWorldPos).normalize();
        // Set the desired zoom distance
        const zoomDistance = 20;
        const targetPos = starWorldPos.clone().add(direction.multiplyScalar(zoomDistance));
        
        // Clamp the new camera position within defined limits
        targetPos.x = THREE.MathUtils.clamp(targetPos.x, -1000, 1000);
        targetPos.y = THREE.MathUtils.clamp(targetPos.y, -1000, 1000);
        targetPos.z = THREE.MathUtils.clamp(targetPos.z, -1000, 1000);
        targetCameraPosRef.current = targetPos;

        // Update the controls to focus on the star
        controlsRef.current.target.copy(starWorldPos);
      }
    },
    [getStarDataFromObjectLocal, dispatch] // selectedStarData is not included here intentionally
  );

  // Set up the Three.js scene, camera, renderer, and additional functionality
  useEffect(() => {
    if (!mountRef.current) return;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Create the scene, camera, and renderer
    const scene = createScene();
    sceneRef.current = scene;
    const camera = createCamera(width, height);
    cameraRef.current = camera;
    const renderer = createRenderer(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // Add orbit controls to allow user interaction
    const controls = addOrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;

    // Set up the post-processing composer.
    const composer = setupComposer(renderer, scene, camera);

    // Disable the default context menu and track right mouse button presses
    renderer.domElement.addEventListener('mousedown', (event) => {
      if (event.button === 2) { // Right mouse button
        mouseRightPressedRef.current = true;
        event.preventDefault();
      }
    });
    renderer.domElement.addEventListener('mouseup', (event) => {
      if (event.button === 2) {
        mouseRightPressedRef.current = false;
        event.preventDefault();
      }
    });
    renderer.domElement.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });

    // Load star models into the scene
    loadStarModels(scene, starSystems, clickableStarsRef.current, cameraRef.current);

    // Set up the raycaster to detect mouse interactions with stars
    const cleanupRaycaster = setupRaycaster(
      renderer.domElement,
      camera,
      clickableStarsRef.current,
      (hovered) => {
        // Change the cursor when hovering over a star
        renderer.domElement.style.cursor = hovered ? 'pointer' : 'auto';
      },
      (starId: string) => handleStarClick(starId),
      getStarDataFromObject
    );

    // Handle window resizing so that the scene always fits the screen
    const onResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    // Start the animation loop that updates the scene
    animateScene({
      camera,
      controls,
      composer,
      targetCameraPosRef,
      keysPressedRef,
      pitchRef,
      yawRef,
      mouseRightPressedRef, // Pass the state of the right mouse button
    });

    // Clean up resources when the component is unmounted
    return () => {
      cleanupRaycaster();
      window.removeEventListener('resize', onResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [starSystems, handleStarClick, getStarDataFromObject]);

  // Listen for a custom event that signals a star was clicked via an overlay
  useEffect(() => {
    const onStarOverlayClick = (e: CustomEvent) => {
      // The event detail contains the ID of the clicked star
      const starId = e.detail;
      handleStarClick(starId);
    };

    window.addEventListener('starOverlayClick', onStarOverlayClick as EventListener);
    return () => {
      window.removeEventListener('starOverlayClick', onStarOverlayClick as EventListener);
    };
  }, [handleStarClick]);

  return (
    <>
      {sceneRef.current && (
        // If the scene is ready, render the travel plan overlay
        <TravelPlan scene={sceneRef.current} clickableStarsRef={clickableStarsRef} />
      )}
      {/* This div is where the Three.js canvas is attached */}
      <div ref={mountRef} className="fixed top-0 left-0 w-screen h-screen" />
      {selectedStarData && (
        // Render star details if a star is selected
        <StarInfoBox />
      )}
      {/* Render a cockpit overlay image on top of the scene */}
      <img
        src="/cockpit.webp"
        alt="Cockpit Overlay"
        className="fixed top-0 left-0 w-screen h-screen z-[2000] pointer-events-none"
      />
    </>
  );
};

export default StarMap;
