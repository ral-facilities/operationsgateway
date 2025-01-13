describe('Users', () => {
  it('should users table correctly', () => {
    cy.visit('/admin/users');
    cy.findByText('user1').should('exist');
    cy.findAllByText('FedID').should('have.length', 5);
    cy.findAllByText('/users POST').should('have.length', 3);
  });

  it('should load 404 page correctly', () => {
    cy.visit('/admin/invalid');

    cy.findByText(
      `We're sorry, the page you requested was not found on the server. If you entered the URL manually please check your spelling and try again. Otherwise, return to the`,
      { exact: false }
    ).should('exist');

    cy.findByRole('link', { name: 'home page' }).should('exist');
  });
});
