declare namespace Cypress {
  interface Chainable {
    dragAndDrop(
      subject: string,
      target: string
    ): Cypress.Chainable<Cypress.Response>;
    clearMocks(): Cypress.Chainable<Cypress.Response>;
    startSnoopingBrowserMockedRequest(): Cypress.Chainable<Cypress.Response>;
    findBrowserMockedRequests({
      method: string,
      url: string,
    }): Cypress.Chainable<Cypress.Response>;
  }
}
