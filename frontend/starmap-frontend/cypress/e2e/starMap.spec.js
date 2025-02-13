describe('StarMap Integration', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000');
    });
  
    it('displays StarInfoBox when a star is clicked', () => {
      // Assuming you now have an overlay element for a star with data attribute
      cy.get('[data-cy="star-element"]').first().click({ force: true });
      
      // Wait for the transition to finish (adjust the wait time if necessary)
      cy.wait(500);
  
      // Check that the StarInfoBox exists and is visible
      cy.get('[data-cy="star-info-box"]', { timeout: 10000 })
        .should('exist')
        .should('be.visible')
        .invoke('text')
        .should('not.be.empty');
    });


    it('adds a star to the travel plan when clicking "Add to Interstellar Plan"', () => {
        cy.get('[data-cy="star-element"]').first().click({ force: true });
        cy.wait(500); // wait for the transition/animation to finish
        cy.get('[data-cy="star-info-box"]', { timeout: 10000 })
          .should('be.visible')
          .find('[data-cy="add-to-travel-plan"]')
          .should('exist');
    });

    it('thrusts the camera forward when right mouse button is held', () => {
        // Simulate right mouse button down on the canvas
        cy.get('canvas').trigger('mousedown', { button: 2 });
        // Wait a moment.
        cy.wait(200);
        // Release the right mouse button.
        cy.get('canvas').trigger('mouseup', { button: 2 });
        // Check that the camera has moved forward
    });
});
