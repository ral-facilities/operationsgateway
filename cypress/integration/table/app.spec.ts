describe('App', () => {
  beforeEach(() => {
    cy.login();
  });

  it('should load correctly', () => {
    cy.visit('/');
    cy.title().should('equal', 'OperationsGateway');

    cy.get('#operationsgateway').should('be.visible');
  });
});
