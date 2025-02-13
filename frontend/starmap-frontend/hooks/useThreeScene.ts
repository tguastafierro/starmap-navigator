import { createSkyBackground } from '../utils/threeUtils';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';

export function createScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000010);
  scene.add(createSkyBackground());
  return scene;
}

export function createCamera(width: number, height: number): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
  camera.position.set(0, 50, 300);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  return camera;
}

export function createRenderer(width: number, height: number): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  return renderer;
}

export function addOrbitControls(camera: THREE.PerspectiveCamera, domElement: HTMLElement): OrbitControls {
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  return controls;
}

export function setupComposer(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera): EffectComposer {
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  return composer;
}

export function createSpiralGroup(): THREE.Group {
  const spiralGroup = new THREE.Group();
  spiralGroup.name = 'SpiralGroup';
  return spiralGroup;
}