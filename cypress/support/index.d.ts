declare namespace Cypress {
  interface Chainable {
    login(credentials?: {
      username: string;
      password: string;
    }): Cypress.Chainable<Cypress.Response>;
    dragAndDrop(
      subject: string,
      target: string
    ): Cypress.Chainable<Cypress.Response>;
  }
}
