describe('Plotting Components', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains('Plots').click();
  });

  // TODO: once data isn't randomly generated, use an image snapshot plugin to
  // assert we're making the correct graphs
  // TODO: how to do this for popups? not possible with cypress apparently
  // see: https://docs.cypress.io/guides/references/trade-offs#Permanent-trade-offs
  it.skip('shows a graph', () => {
    cy.get('canvas').should('be.visible');
  });
});
