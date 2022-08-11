describe('Plotting Components', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains('Plots').click();
  });

  // TODO: once data isn't randomly generated, use an image snapshot plugin to
  // assert we're making the correct graphs
  it('shows a graph', () => {
    cy.get('canvas').should('be.visible');
  });
});
