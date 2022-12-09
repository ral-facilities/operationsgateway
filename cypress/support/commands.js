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

const parseJwt = (token) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const payload = decodeURIComponent(
    window.atob(base64).replace(/(.)/g, function (m, p) {
      const code = p.charCodeAt(0).toString(16).toUpperCase();
      return '%' + ('00' + code).slice(-2);
    })
  );
  return payload;
};

export const readSciGatewayToken = () => {
  const token = localStorage.getItem('scigateway:token');
  if (token) {
    const parsedToken = JSON.parse(parseJwt(token));
    if (parsedToken.username) {
      return token;
    }
  }
  return null;
};

Cypress.Commands.add('login', (credentials) => {
  return cy.request('operationsgateway-settings.json').then((response) => {
    const settings = response.body;
    let body = {
      username: 'frontend',
      password: 'front',
    };
    if (credentials) {
      body = credentials;
    }
    cy.request('POST', `${settings.apiUrl}/login`, body).then((response) => {
      window.localStorage.setItem('scigateway:token', response.data);
    });
  });
});

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
  const SLOPPY_CLICK_THRESHOLD = 45;
  cy.get(target)
    .first()
    .then(($target) => {
      let coordsDrop = $target[0].getBoundingClientRect();
      cy.get(subject)
        .first()
        .then((subject) => {
          const coordsDrag = subject[0].getBoundingClientRect();
          cy.wrap(subject)
            .trigger('mousedown', {
              button: BUTTON_INDEX,
              clientX: coordsDrag.x,
              clientY: coordsDrag.y,
              force: true,
            })
            .trigger('mousemove', {
              button: BUTTON_INDEX,
              clientX: coordsDrag.x + SLOPPY_CLICK_THRESHOLD,
              clientY: coordsDrag.y,
              force: true,
            });
          cy.get('body')
            .trigger('mousemove', {
              button: BUTTON_INDEX,
              clientX: coordsDrop.x + SLOPPY_CLICK_THRESHOLD,
              clientY: coordsDrop.y + SLOPPY_CLICK_THRESHOLD,
              force: true,
            })
            .trigger('mouseup');
        });
    });
});
