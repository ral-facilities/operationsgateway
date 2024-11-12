describe('Users', () => {
  it('should users table correctly', () => {
    cy.visit('/admin/users');
    cy.findByText('user1').should('exist');
    cy.findAllByText('FedID').should('have.length', 5);
    cy.findAllByText('/users POST').should('have.length', 3);
  });
});
