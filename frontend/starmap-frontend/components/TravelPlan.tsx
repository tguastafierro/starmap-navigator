import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { removeTravelPlanItem } from '../redux/travelSlice';
import { TravelPlanItem } from '../types/travelTypes';
import { createSpiralGroup } from '../hooks/useThreeScene';
import { updateSpiralThreads } from '../utils/threeUtils';

interface TravelPlanProps {
  // The Three.js scene to which the spiral group will be added
  scene: THREE.Scene;
  // A ref to the array of clickable star objects in the scene
  clickableStarsRef: React.RefObject<THREE.Object3D[] | null>;
}

const TravelPlan: React.FC<TravelPlanProps> = ({ scene, clickableStarsRef }) => {
  const travelPlan = useSelector((state: RootState) => state.travel.travelPlan);
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);

  // Create a ref for the spiral group.
  const spiralGroupRef = useRef<THREE.Group | null>(null);

  // On mount, create and add the spiral group to the scene
  useEffect(() => {
    if (!spiralGroupRef.current) {
      spiralGroupRef.current = createSpiralGroup();
      scene.add(spiralGroupRef.current);
    }
  }, [scene]);

  // Update the UI and spiral threads whenever the travel plan changes
  useEffect(() => {
    console.log("TravelPlan updated, length:", travelPlan.length);
    // Show the panel if there is at least one star in the travel plan
    setVisible(travelPlan.length > 0);
    if (spiralGroupRef.current && clickableStarsRef.current) {
      updateSpiralThreads(travelPlan, clickableStarsRef.current, spiralGroupRef.current);
    }
  }, [travelPlan, clickableStarsRef]);

  // Calculate total distance
  const calculateTotalDistance = (plan: TravelPlanItem[]): number => {
    if (plan.length === 0) return 0;
    let total = plan[0].distance;
    for (let i = 1; i < plan.length; i++) {
      const prev = plan[i - 1].coordinates;
      const cur = plan[i].coordinates;
      const segmentDistance = Math.sqrt(
        (cur.x - prev.x) ** 2 +
        (cur.y - prev.y) ** 2 +
        (cur.z - prev.z) ** 2
      );
      total += segmentDistance;
    }
    return total;
  };

  const totalDistance = calculateTotalDistance(travelPlan).toFixed(2);

  return (
    <div
      className={`
        fixed top-0 left-0 
        w-[450px] h-[800px]
        bg-[url('/travelplanpanel.png')] bg-cover bg-no-repeat bg-center
        transition-transform duration-500 ease-in-out
        z-[1000] overflow-y-auto p-[85px] box-border
        ${visible ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="relative text-white">
        <h4 className="mb-[10px]">Travel Plan</h4>
        {travelPlan.map((item, idx) => (
          <div data-cy="travel-plan-item" key={item.id} className="flex justify-between items-center mb-[5px]">
            <span>
              {idx + 1}. {item.name}
            </span>
            <button
              onClick={() => dispatch(removeTravelPlanItem(item.id))}
              className="bg-transparent border-0 text-[#FFD700] cursor-pointer font-bold text-[16px]"
            >
              x
            </button>
          </div>
        ))}
        <div className="border-t border-t-[#FFD700] pt-[5px] mt-[10px]">
          Total distance from planet Earth: {totalDistance} ly
        </div>
      </div>
    </div>
  );
};

export default TravelPlan;
