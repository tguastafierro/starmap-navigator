import React from 'react';
import { Provider } from 'react-redux';
import { mount } from '@cypress/react';
import TravelPlan from '../../components/TravelPlan';
import store from '../../redux/store';
import * as THREE from 'three';

const scene = new THREE.Scene();
const clickableStarsRef = React.createRef<THREE.Object3D[]>();
clickableStarsRef.current = []; 

describe('TravelPlan Component', () => {
  it('renders travel plan items and calculates total distance', () => {
    store.dispatch({
      type: 'travel/addTravelPlanItem',
      payload: { id: 'star1', name: 'Star One', distance: 10, coordinates: { x: 0, y: 0, z: 0 } },
    });
    store.dispatch({
      type: 'travel/addTravelPlanItem',
      payload: { id: 'star2', name: 'Star Two', distance: 15, coordinates: { x: 10, y: 10, z: 10 } },
    });

    mount(
      <Provider store={store}>
        <TravelPlan scene={scene} clickableStarsRef={clickableStarsRef} />
      </Provider>
    );

    cy.get('div').contains('Travel Plan');
    cy.get('div').contains('Star One');
    cy.get('div').contains('Star Two');
    cy.get('div').contains(/Total distance from planet Earth:/);
  });
});
