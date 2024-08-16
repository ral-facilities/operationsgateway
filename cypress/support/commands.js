// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import '@testing-library/cypress/add-commands';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('cypress-delete-downloads-folder').addCustomCommand();

Cypress.Commands.add('dragAndDrop', (subject, target) => {
  Cypress.log({
    name: 'DRAGNDROP',
    message: `Dragging element ${subject} to ${target}`,
    consoleProps: () => {
      return {
        subject: subject,
        target: target,
      };
    },
  });
  const BUTTON_INDEX = 0;
  const SLOPPY_CLICK_THRESHOLD = 10;

  // separate out the two cy.wrap commands as it can trigger element detached from DOM error
  cy.get(subject)
    .first()
    .then((subject) => {
      const coordsDrag = subject[0].getBoundingClientRect();
      cy.wrap(subject).trigger('mousedown', {
        button: BUTTON_INDEX,
        clientX: coordsDrag.x,
        clientY: coordsDrag.y,
        force: true,
      });
    });

  cy.get(target)
    .first()
    .then(($target) => {
      let coordsDrop = $target[0].getBoundingClientRect();
      cy.get(subject)
        .first()
        .then((subject) => {
          const coordsDrag = subject[0].getBoundingClientRect();
          cy.wrap(subject).trigger('mousemove', {
            button: BUTTON_INDEX,
            clientX: coordsDrag.x + SLOPPY_CLICK_THRESHOLD,
            clientY: coordsDrag.y,
            force: true,
          });
          cy.get('body').trigger('mousemove', {
            button: BUTTON_INDEX,
            clientX: coordsDrop.x + SLOPPY_CLICK_THRESHOLD,
            clientY: coordsDrop.y + SLOPPY_CLICK_THRESHOLD,
            force: true,
          });
          cy.get('body').trigger('mouseup');
        });
    });
});

let mockedRequests = [];

Cypress.Commands.add('clearMocks', () => {
  mockedRequests = [];
});

Cypress.Commands.add('startSnoopingBrowserMockedRequest', () => {
  cy.window().then((window) => {
    const worker = window?.msw?.worker;

    // Use start here instead of match as needs to be done before the request is read to
    // avoid errors as an MDN Request's contents can only be read once. We then clone it
    // here to ensure the MSW handlers can call .json() on it, and also any Cypress tests
    // which would otherwise have failed for the same reason as json() can only be called
    // once on the original request.
    worker.events.on('request:start', ({ request }) => {
      mockedRequests.push(request.clone());
    });
  });
});

/**
 * URL is a pattern matching URL that uses the same behavior as handlers URL matching
 * e.g. '* /events/groups/:groupId' without the space
 */
Cypress.Commands.add('findBrowserMockedRequests', ({ method, url }) => {
  return cy.window().then((window) => {
    const msw = window?.msw;
    if (msw) {
      const { matchRequestUrl } = msw;

      return new Cypress.Promise((resolve, reject) => {
        if (
          !method ||
          !url ||
          typeof method !== 'string' ||
          typeof url !== 'string'
        ) {
          return reject(
            `Invalid parameters passed. Method: ${method} Url: ${url}`
          );
        }
        resolve(
          mockedRequests.filter((req) => {
            const matchesMethod =
              req.method && req.method.toLowerCase() === method.toLowerCase();
            const matchesUrl = matchRequestUrl(new URL(req.url), url).matches;
            return matchesMethod && matchesUrl;
          })
        );
      });
    }
  });
});
