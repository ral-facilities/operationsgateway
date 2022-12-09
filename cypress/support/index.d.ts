declare namespace Cypress {
  interface Chainable {
    dragAndDrop(
      subject: string,
      target: string
    ): Cypress.Chainable<Cypress.Response>;
  }
}
