import {
  getHandleSelector,
  addInitialSystemChannels,
} from '../../support/util';

const verifyColumnOrder = (columns: string[]): void => {
  for (let i = 0; i < columns.length; i++) {
    cy.get('th').eq(i).should('contain', columns[i]);
  }
};

describe('Table Component', () => {
  beforeEach(() => {
    cy.visit('/', {
      // need these to ensure Date picker media queries pass
      // ref: https://mui.com/x/react-date-pickers/getting-started/#testing-caveats
      onBeforeLoad: (win) => {
        cy.stub(win, 'matchMedia')
          .withArgs('(pointer: fine)')
          .returns({
            matches: true,
            addListener: () => {
              // no-op
            },
            removeListener: () => {
              // no-op
            },
          });
      },
    });
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
    cy.get('[aria-describedby="table-loading-indicator"]').should(
      'have.attr',
      'aria-busy',
      'false'
    );

    addInitialSystemChannels(['Shot Number']);

    cy.get('[role="columnheader"]').first().as('firstColumn');
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
            cy.get('td').first().contains('2022-01-01 00:00:00');
          });
      });
    });

    it('date to', () => {
      cy.get('input[id="to date-time"]').type('2022-01-31 00:00:00');

      cy.get('tbody').within(() => {
        cy.get('tr')
          .first()
          .within(() => {
            cy.get('td').first().contains('2022-01-01 00:00:00');
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
            cy.get('td').first().contains('2022-01-01 00:00:00');
          });
      });
    });
  });

  describe('can set max shots', () => {
    it('50 shots', () => {
      cy.window().then((window) => {
        // Reference global instances set in "src/mocks/browser.js".
        const { worker, rest } = window.msw;

        worker.use(
          rest.get('/records/count', (req, res, ctx) => {
            return res(ctx.status(200), ctx.json(50));
          })
        );
      });

      cy.contains('1–25 of 50');
    });

    it('1000 shots', () => {
      cy.window().then(async (window) => {
        // Reference global instances set in "src/mocks/browser.js".
        const { worker, rest } = window.msw;

        worker.use(
          rest.get('/records/count', (req, res, ctx) => {
            return res(ctx.status(200), ctx.json(1000));
          })
        );
      });

      cy.get('span[aria-label="Select 1000 max shots"]').click();
      cy.contains('Search').click();
      cy.contains('1–25 of 1000');
    });

    it('unlimited shots', () => {
      cy.window().then((window) => {
        // Reference global instances set in "src/mocks/browser.js".
        const { worker, rest } = window.msw;

        worker.use(
          rest.get('/records/count', (req, res, ctx) => {
            return res(ctx.status(200), ctx.json(2500)); //arbirary number greater than 1000
          })
        );
      });

      cy.get('span[aria-label="Select unlimited max shots"]').click();
      cy.contains('Search').click();
      cy.contains('1–25 of 2500');
    });
  });
});
