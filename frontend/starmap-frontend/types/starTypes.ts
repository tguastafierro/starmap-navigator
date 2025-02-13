  export interface StarSystem {
    id: string;
    name: string;
    starType: string;
    distance: number;
    habitability: boolean;
    resources: string[];
    coordinates: {
      x: number;
      y: number;
      z: number;
    };
    age: number;              // in billion years
    rotationSpeed: number;    // in km/s
    magneticField: number;    // in Gauss
    luminosity: number;       // in solar luminosities
    temperature: number;      // in Kelvin
    mass: number;             // in solar masses
  }

export interface SelectedStarData {
  star: StarSystem;
}

export interface ScreenPos {
  x: number;
  y: number;
}
