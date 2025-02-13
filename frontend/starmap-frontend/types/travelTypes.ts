export interface TravelPlanItem {
  id: string;
  name: string;
  distance: number; // For the first element, this is the distance from Earth.
  coordinates: {
    x: number;
    y: number;
    z: number;
  };
}