import { HttpResponse } from 'msw';
import { addInitialSystemChannels, getHandleSelector } from '../support/util';

const verifyColumnOrder = (columns: string[]): void => {
  // check if the first column contains the checkbox
  cy.get('th')
    .first()
    .should('have.attr', 'aria-label', 'Select all rows')
    .and('have.attr', 'role', 'columnheader');
  // skip the first column as it is the checkbox column
  for (let i = 1; i < columns.length; i++) {
    cy.get('th')
      .eq(i)
      .should('contain', columns[i - 1]);
  }
};

describe('Table Component', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('adds columns in the order they are selected', () => {
    cy.get('[aria-describedby="table-loading-indicator"]').should(
      'have.attr',
      'aria-busy',
      'false'
    );

    // check initialised with time column
    verifyColumnOrder(['Time']);

    addInitialSystemChannels(['Shot Number']);

    verifyColumnOrder(['Time', 'Shot Number']);

    cy.contains('Data Channels').click();

    cy.findByRole('checkbox', { name: 'Active Area' }).check();

    cy.contains('Add Channels').click();

    verifyColumnOrder(['Time', 'Shot Number', 'Active Area']);
  });

  it('moves a column left', () => {
    addInitialSystemChannels(['Shot Number', 'Active Area']);

    cy.get('[aria-describedby="table-loading-indicator"]').should(
      'have.attr',
      'aria-busy',
      'false'
    );

    cy.get(getHandleSelector())
      .first()
      .as('secondColumn')
      .should('contain', 'Shot Number');
    cy.get(getHandleSelector())
      .eq(1)
      .as('thirdColumn')
      .should('contain', 'Active Area');

    cy.dragAndDrop('@thirdColumn', '@secondColumn');

    // Wait for draggable elements to settle before testing the DOM again
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    verifyColumnOrder(['Time', 'Active Area', 'Shot Number']);
  });

  it('moves a column right', () => {
    addInitialSystemChannels(['Shot Number', 'Active Area']);

    cy.get('[aria-describedby="table-loading-indicator"]').should(
      'have.attr',
      'aria-busy',
      'false'
    );

    cy.get(getHandleSelector())
      .first()
      .as('secondColumn')
      .should('contain', 'Shot Number');
    cy.get(getHandleSelector())
      .eq(1)
      .as('thirdColumn')
      .should('contain', 'Active Area');

    cy.dragAndDrop('@secondColumn', '@thirdColumn');

    // Wait for draggable elements to settle before testing the DOM again
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    verifyColumnOrder(['Time', 'Active Area', 'Shot Number']);
  });

  it('can resize columns', () => {
    // wait for loading
    cy.findByRole('progressbar').should('exist');
    cy.findByRole('progressbar').should('not.exist');

    addInitialSystemChannels(['Shot Number']);

    // wait for loading
    cy.findByRole('progressbar').should('exist');
    cy.findByRole('progressbar').should('not.exist');

    cy.get('[role="columnheader"]').eq(1).as('firstColumn');
    cy.get('[role="columnheader"] hr').first().as('firstColumnResizeHandle');
    cy.get('[role="columnheader"] hr').last().as('secondColumnResizeHandle');

    let initialWidth = 0;
    cy.get('@firstColumn').then(($column) => {
      let { width } = $column[0].getBoundingClientRect();
      width = Math.round(width * 100) / 100;
      initialWidth = width;
    });

    cy.dragAndDrop('@firstColumnResizeHandle', '@secondColumnResizeHandle');

    cy.get('@firstColumn').should(($column) => {
      let { width } = $column[0].getBoundingClientRect();
      width = Math.round(width * 100) / 100;
      expect(width).to.be.greaterThan(initialWidth);
    });
  });

  it('has sticky headers', () => {
    cy.get('[aria-describedby="table-loading-indicator"]').should(
      'have.attr',
      'aria-busy',
      'false'
    );

    addInitialSystemChannels(['Shot Number']);
    cy.get('[role="columnheader"]').should('be.visible');

    cy.get('[role="table-container"]').scrollTo('bottom');
    cy.get('[role="columnheader"]').should('be.visible');
  });

  it('has a sticky time column when scrolling right', () => {
    cy.get('[aria-describedby="table-loading-indicator"]').should(
      'have.attr',
      'aria-busy',
      'false'
    );

    // // Add enough columns to require horizontal scroll bar
    cy.contains('Data Channels').click();

    cy.contains('system').click();

    cy.findByRole('checkbox', { name: 'Shot Number' }).check();
    cy.findByRole('checkbox', { name: 'Active Area' }).check();
    cy.findByRole('checkbox', { name: 'Active Experiment' }).check();

    cy.contains('All Channels').click();

    cy.findByLabelText('Search data channels').type(
      'Channel_A{downArrow}{enter}'
    );

    cy.findByRole('checkbox', { name: 'Channel_ABCDE' }).check();
    cy.findByRole('checkbox', { name: 'Channel_BCDEF' }).check();
    cy.findByRole('checkbox', { name: 'Channel_CDEFG' }).check();

    cy.contains('Add Channels').click();

    cy.get('[role="table-container"]').scrollTo('right');
    cy.findByRole('columnheader', { name: 'Time' }).should('be.visible');
    // double check that we have scrolled far enough to test sticky column
    cy.findByRole('columnheader', { name: 'Shot Number' }).should(
      'not.be.visible'
    );
  });

  it('column headers overflow when word wrap is enabled', () => {
    cy.contains('Data Channels').click();
    const channelName = 'CHANNEL_ABCDE';

    cy.findByLabelText('Search data channels').type(
      `${channelName}{downArrow}{enter}`
    );

    cy.findByRole('checkbox', { name: new RegExp(channelName, 'i') }).check();

    cy.contains('Add Channels').click();

    cy.get('[aria-describedby="table-loading-indicator"]').should(
      'have.attr',
      'aria-busy',
      'false'
    );

    cy.get('[data-testid^="sort timestamp"] p')
      .invoke('css', 'height')
      .then((height) => {
        const singleLineHeight = +height.replace('px', '');
        cy.get(`[data-testid^="sort ${channelName}"] p`)
          .invoke('css', 'height')
          .then((height) => +height.replace('px', ''))
          .should('equal', singleLineHeight);

        // can't use cypress to trigger the menu opening, so use native browser
        cy.document().then(($doc) => {
          const clickEvent = new Event('click', { bubbles: true });
          $doc
            .querySelector(`#${channelName}-menu-button`)
            ?.dispatchEvent(clickEvent);
        });
        cy.contains('Turn word wrap on').click();
        cy.get(`[data-testid^="sort ${channelName}"] p`)
          .invoke('css', 'height')
          .then((height) => +height.replace('px', ''))
          .should('be.gt', singleLineHeight);
      });
  });

  describe('should be able to search by', () => {
    it('date from', () => {
      cy.get('input[id="from date-time"]').type('2022-01-01 00:00:00');

      cy.get('tbody').within(() => {
        cy.get('tr')
          .first()
          .within(() => {
            cy.get('td').eq(1).contains('2022-01-01 00:00:00');
          });
      });
    });

    it('date to', () => {
      cy.get('input[id="to date-time"]').type('2022-01-31 00:00:00');

      cy.get('tbody').within(() => {
        cy.get('tr')
          .first()
          .within(() => {
            cy.get('td').eq(1).contains('2022-01-01 00:00:00');
          });
      });
    });

    it('date between', () => {
      cy.get('input[id="from date-time"]').type('2022-01-01 00:00:00');
      cy.get('input[id="to date-time"]').type('2022-01-31 00:00:00');

      cy.get('tbody').within(() => {
        cy.get('tr')
          .first()
          .within(() => {
            cy.get('td').eq(1).contains('2022-01-01 00:00:00');
          });
      });
    });
  });

  describe('can set max shots', () => {
    it('50 shots', () => {
      cy.get('span[aria-label="Select unlimited max shots"]').should('exist');

      cy.window().then((window) => {
        // Reference global instances set in "src/mocks/browser.js".
        const { worker, http } = window.msw;

        worker.use(
          http.get('/records/count', () =>
            HttpResponse.json(50, { status: 200 })
          )
        );
      });

      cy.contains('1–25 of 50');
    });

    it('1000 shots', () => {
      cy.get('span[aria-label="Select unlimited max shots"]').should('exist');

      cy.window().then(async (window) => {
        // Reference global instances set in "src/mocks/browser.js".
        const { worker, http } = window.msw;

        worker.use(
          http.get('/records/count', () =>
            HttpResponse.json(1000, { status: 200 })
          )
        );
      });

      cy.get('span[aria-label="Select 1000 max shots"]').click();
      cy.contains('Search').click();
      cy.contains('1–25 of 1000');
    });

    it('unlimited shots', () => {
      cy.get('span[aria-label="Select unlimited max shots"]').should('exist');

      cy.window().then((window) => {
        // Reference global instances set in "src/mocks/browser.js".
        const { worker, http } = window.msw;

        worker.use(
          http.get('/records/count', () =>
            HttpResponse.json(2500, { status: 200 })
          )
        );
      });

      cy.get('span[aria-label="Select unlimited max shots"]').click();
      cy.contains('Search').click();
      cy.contains('1–25 of 2500');
    });
  });

  describe('should be able to select', () => {
    it('one and multiple rows', () => {
      cy.get('tbody').within(() => {
        cy.get('tr')
          .first()
          .within(() => {
            cy.get('td').first().click();
          });
      });

      cy.get('tbody').within(() => {
        cy.get('tr').first().should('have.attr', 'aria-checked', 'true');
      });

      // rest of the rows should be unchecked
      cy.get('tbody').within(() => {
        cy.get('tr.MuiTableRow-root').each(($tr, index) => {
          if (index !== 0) {
            cy.wrap($tr).should('have.attr', 'aria-checked', 'false');
          }
        });
      });

      // click on all checkboxes
      cy.get('tbody').within(() => {
        cy.get('tr.MuiTableRow-root').each(($tr, index) => {
          cy.wrap($tr).within(() => {
            cy.get('td').first().click();
          });
        });
      });

      // all rows but first should be selected
      cy.get('tbody').within(() => {
        cy.get('tr.MuiTableRow-root').each(($tr, index) => {
          if (index !== 0) {
            cy.wrap($tr).should('have.attr', 'aria-checked', 'true');
          } else {
            cy.wrap($tr).should('have.attr', 'aria-checked', 'false');
          }
        });
      });
    });

    it('all rows on the page', () => {
      cy.get('[aria-describedby="table-loading-indicator"]').should(
        'have.attr',
        'aria-busy',
        'false'
      );

      cy.get('thead').within(() => {
        cy.get('th').first().click();
      });

      // all rows on the page should be selected
      cy.get('tbody').within(() => {
        cy.get('tr.MuiTableRow-root').each(($tr) => {
          cy.wrap($tr).should('have.attr', 'aria-checked', 'true');
        });
      });
    });
  });
});
