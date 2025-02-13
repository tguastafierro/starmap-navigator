import { TravelPlanItem } from '../types/travelTypes';
import * as THREE from 'three';


 // Creates a stellar background (a point cloud with randomly placed stars).

export const createSkyBackground = (): THREE.Points => {
    const starsCount = 10000;
    const positions = new Float32Array(starsCount * 3);

    // Set a fixed radius for the background stars.
    // All stars will be placed on (or nearly on) a sphere of this radius.
    const radius = 1500;

    for (let i = 0; i < starsCount; i++) {
        // Generate spherical coordinates.
        const theta = Math.random() * 2 * Math.PI; // Azimuth angle (0 to 2π)
        const phi = Math.acos(2 * Math.random() - 1); // Polar angle (0 to π)

        // Optionally, add a little randomness to the radius so stars aren't perfectly uniform:
        const r = radius * (0.95 + 0.1 * Math.random());

        // Convert spherical coordinates to Cartesian coordinates.
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Create a circular star texture.
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, size, size);
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, false);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    const material = new THREE.PointsMaterial({
        map: texture,
        alphaTest: 0.5,
        transparent: true,
        color: 0xffffff,
        size: 2,
        sizeAttenuation: true,
    });

    return new THREE.Points(geometry, material);
};



// Traverses the object hierarchy to find a StarSystem in userData.

export const getStarDataFromObject = (object: THREE.Object3D): any => {
    let current: THREE.Object3D | null = object;
    while (current) {
        if (current.userData.starSystem) return current.userData.starSystem;
        current = current.parent;
    }
    return null;
};


// Returns a color corresponding to the star type.

export const getStarColor = (starType: string): THREE.Color => {
    const type = starType.split('+')[0].trim().toUpperCase();
    if (type.startsWith('G')) {
        return new THREE.Color("#fff5e1"); // Sun-like: white-yellow.
    } else if (type.startsWith('K')) {
        return new THREE.Color("#ffd2a1"); // K-type: soft orange.
    } else if (type.startsWith('M')) {
        return new THREE.Color("#ff7f7f"); // M-type: reddish.
    } else if (type.startsWith('F')) {
        return new THREE.Color("#d0e0ff"); // F-type: blue-white.
    } else {
        return new THREE.Color("#ffffff"); // Default white.
    }
};

// Custom spiral curve to generate the connecting spiral thread.
export class SpiralCurve extends THREE.Curve<THREE.Vector3> {
  start: THREE.Vector3;
  end: THREE.Vector3;
  turns: number;
  radius: number;
  constructor(start: THREE.Vector3, end: THREE.Vector3, turns: number, radius: number) {
    super();
    this.start = start;
    this.end = end;
    this.turns = turns;
    this.radius = radius;
  }
  getPoint(t: number): THREE.Vector3 {
    // Linear interpolation between start and end
    const base = new THREE.Vector3().lerpVectors(this.start, this.end, t);
    // Direction from start to end.
    const dir = new THREE.Vector3().subVectors(this.end, this.start).normalize();
    // Pick an arbitrary perpendicular vector
    let arbitrary = new THREE.Vector3(0, 1, 0);
    if (Math.abs(dir.dot(arbitrary)) > 0.99) {
      arbitrary.set(1, 0, 0);
    }
    const v = new THREE.Vector3().crossVectors(dir, arbitrary).normalize();
    const w = new THREE.Vector3().crossVectors(dir, v).normalize();
    // Calculate angle based on number of turns
    const angle = t * this.turns * Math.PI * 2;
    const offset = new THREE.Vector3()
      .addScaledVector(v, Math.cos(angle) * this.radius)
      .addScaledVector(w, Math.sin(angle) * this.radius);
    return base.add(offset);
  }
}

 // Updates the spiral threads connecting consecutive stars in the travel plan

export function updateSpiralThreads(
  travelPlan: TravelPlanItem[],
  clickableStars: THREE.Object3D[],
  spiralGroup: THREE.Group
) {
  console.log("updateSpiralThreads called, travelPlan length:", travelPlan.length);
  // Clear any existing spiral threads
  while (spiralGroup.children.length > 0) {
    const child = spiralGroup.children[0];
    spiralGroup.remove(child);
  }

  if (travelPlan.length < 2) return;

  // Fixed pitch: distance between consecutive turns
  const pitch = 10; // in world units

  // Create a spiral thread for each consecutive pair of stars
  for (let i = 1; i < travelPlan.length; i++) {
    const starItemA = travelPlan[i - 1];
    const starItemB = travelPlan[i];
    // Find corresponding star models
    const starObjA = clickableStars.find(
      (obj) => obj.userData.starSystem.id === starItemA.id
    );
    const starObjB = clickableStars.find(
      (obj) => obj.userData.starSystem.id === starItemB.id
    );
    if (!starObjA || !starObjB) continue;

    const posA = new THREE.Vector3();
    starObjA.getWorldPosition(posA);
    const posB = new THREE.Vector3();
    starObjB.getWorldPosition(posB);

    console.log('Spiral Thread:', posA, posB, 'Distance:', posA.distanceTo(posB));

    // Calculate the distance between the stars
    const distance = posA.distanceTo(posB);
    // Determine the number of turns so that each turn is approximately `pitch` units apart
    const turns = Math.max(1, distance / pitch);
    // Set a small, fixed spiral radius.
    const spiralRadius = 1.5; // adjust as needed

    // Create the spiral curve
    const spiralCurve = new SpiralCurve(posA, posB, turns, spiralRadius);
    // Set the tube thickness proportional to the spiral radius
    const tubeRadius = spiralRadius * 0.1;
    // Dynamically set tubular segments: e.g., 64 segments per turn
    const tubularSegments = Math.floor(turns * 64);
    // Increase radial segments for a smoother cross-section
    const radialSegments = 32;
    const tubeGeometry = new THREE.TubeGeometry(spiralCurve, tubularSegments, tubeRadius, radialSegments, false);

    // Create a material similar to the halo: white, glowing, with additive blending
    const tubeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
    });

    const spiralMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
    
    // Simulating a glowing effect without altering the geometry
    spiralMesh.onBeforeRender = function (
      renderer,
      scene,
      camera,
      geometry,
      material,
      group
    ) {
      const time = performance.now() / 1000;
      // Oscillate opacity between 0.8 and 1.0.
      const pulsateOpacity = 0.8 + 0.2 * ((Math.sin(time * 2.0) + 1) / 2);
      material.opacity = pulsateOpacity;
    };

    spiralGroup.add(spiralMesh);
  }
}