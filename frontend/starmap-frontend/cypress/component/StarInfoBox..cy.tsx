/// <reference types="cypress" />
import React from 'react';
import { Provider } from 'react-redux';
import { mount } from '@cypress/react';
import StarInfoBox from '../../components/StarInfoBox';
import store from '../../redux/store';

const selectedStar = {
  id: 'star1',
  name: 'Star One',
  starType: 'A',
  distance: 10,
  habitability: false,
  resources: ['Water'],
  coordinates: { x: 0, y: 0, z: 0 },
};

store.dispatch({
  type: 'star/setSelectedStarData',
  payload: { star: selectedStar },
});

describe('StarInfoBox Component', () => {
  it('renders with star details and a disabled add button if already in travel plan', () => {
    // For testing, dispatch a travel plan item so that the add button is disabled
    store.dispatch({
      type: 'travel/addTravelPlanItem',
      payload: { id: 'star1', name: 'Star One', distance: 10, coordinates: { x: 0, y: 0, z: 0 } },
    });

    mount(
      <Provider store={store}>
        <StarInfoBox />
      </Provider>
    );

    cy.get('[data-cy=star-info-box]').should('contain', 'Star One');
    cy.get('[data-cy=add-to-travel-plan]').should('be.disabled');
  });
});
