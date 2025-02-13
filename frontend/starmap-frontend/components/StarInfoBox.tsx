import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { clearSelectedStarData } from '../redux/starSlice';
import { addTravelPlanItem } from '../redux/travelSlice';

const StarInfoBox: React.FC = () => {
  const dispatch = useDispatch();
  // Get the selected star from the star slice
  const selectedStarData = useSelector(
    (state: RootState) => state.star.selectedStarData
  );
  // Get the current travel plan from the travel slice
  const travelPlan = useSelector(
    (state: RootState) => state.travel.travelPlan
  );
  const star = selectedStarData?.star;

  // Local state for slide-in animation
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // When closing, slide out then clear the selected star
  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      dispatch(clearSelectedStarData());
    }, 500);
  };

  // Handle adding the star to the travel plan
  const handleAddToTravelPlan = () => {
    if (!star) return;
    dispatch(
      addTravelPlanItem({
        id: star.id,
        name: star.name,
        distance: star.distance,
        coordinates: star.coordinates,
      })
    );
  };

  // Check if the current star is already in the travel plan
  const isInTravelPlan = star ? travelPlan.some(item => item.id === star.id) : false;

  // If no star is selected, don't render anything
  if (!star) return null;

  return (
    <div
      className={`
        fixed top-0 right-0
        w-[450px] h-[800px]
        bg-[url('/panel.png')] bg-cover bg-no-repeat bg-center
        transition-transform duration-500 ease-in-out
        z-[1000] overflow-y-auto p-[85px] box-border
        ${visible ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      <button
        onClick={handleClose}
        className="absolute top-[50px] right-[40px] text-black text-[30px] cursor-pointer"
      >
        ✖
      </button>
      <div
  data-cy="star-info-box" // For testing
  className="text-white mt-[50px]"
>
  <h2 className="mb-5">
    <strong>{star.name}</strong>
  </h2>
  <p className="my-[10px]">
    <strong>Type:</strong> {star.starType}
  </p>
  <p className="my-[10px]">
    <strong>Distance from planet Earth:</strong> {star.distance} ly
  </p>
  <p className="my-[10px]">
    <strong>Habitability:</strong> {star.habitability ? 'Yes' : 'No'}
  </p>
  <p className="my-[10px]">
    <strong>Coordinates:</strong> (x: {star.coordinates.x}, y: {star.coordinates.y}, z: {star.coordinates.z})
  </p>
  <p className="my-[10px]">
    <strong>Age:</strong> {star.age} billion years
  </p>
  <p className="my-[10px]">
    <strong>Rotation Speed:</strong> {star.rotationSpeed} km/s
  </p>
  <p className="my-[10px]">
    <strong>Magnetic Field:</strong> {star.magneticField} Gauss
  </p>
  <p className="my-[10px]">
    <strong>Luminosity:</strong> {star.luminosity} L☉
  </p>
  <p className="my-[10px]">
    <strong>Temperature:</strong> {star.temperature} K
  </p>
  <p className="my-[10px]">
    <strong>Mass:</strong> {star.mass} M☉
  </p>
  <p className="my-[10px]">
    <strong>Resources:</strong> {star.resources.join(', ')}
  </p>
  <button
    data-cy="add-to-travel-plan" // For testing
    onClick={handleAddToTravelPlan}
    disabled={isInTravelPlan}
    className={`
      mt-5 py-[10px] px-[15px] border-none bg-[#FFD700] text-black rounded w-full text-[16px] cursor-pointer
      ${isInTravelPlan ? 'opacity-50 cursor-not-allowed' : ''}
    `}
  >
    Add to Interstellar Plan
  </button>
</div>
    </div>
  );
};

export default StarInfoBox;
