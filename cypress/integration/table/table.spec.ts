import {
  getHandleSelector,
  testRecordResponse,
  testRecordCountResponse,
} from '../../support/util';

const verifyColumnOrder = (columns: string[]): void => {
  for (let i = 0; i < columns.length; i++) {
    cy.get('th').eq(i).should('contain', columns[i]);
  }
};

describe('Table Component', () => {
  beforeEach(() => {
    cy.intercept('**/records**', (req) => {
      req.reply({
        statusCode: 200,
        body: testRecordResponse,
      });
    }).as('getRecords');

    cy.intercept('**/records/count', (req) => {
      req.reply({ statusCode: 200, body: testRecordCountResponse });
    }).as('getRecordCount');

    cy.visit('/').wait(['@getRecords', '@getRecordCount']);
  });

  it('initialises with a timestamp column', () => {
    cy.get('[aria-describedby="table-loading-indicator"]').should(
      'have.attr',
      'aria-busy',
      'false'
    );

    verifyColumnOrder(['Timestamp']);
  });

  it('adds columns in the order they are selected', () => {
    cy.get('[aria-describedby="table-loading-indicator"]').should(
      'have.attr',
      'aria-busy',
      'false'
    );

    cy.get('#shotnum').check();

    verifyColumnOrder(['Timestamp', 'Shot Number']);
    cy.get('#activeArea').check();
    verifyColumnOrder(['Timestamp', 'Shot Number', 'Active Area']);
  });

  it('moves a column left', () => {
    cy.get('[aria-describedby="table-loading-indicator"]').should(
      'have.attr',
      'aria-busy',
      'false'
    );

    cy.get('#shotnum').check();
    cy.get('#activeArea').check();

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
    // eslint-disable-next-line testing-library/await-async-utils
    cy.wait(1000);
    verifyColumnOrder(['Timestamp', 'Active Area', 'Shot Number']);
  });

  it('moves a column right', () => {
    cy.get('[aria-describedby="table-loading-indicator"]').should(
      'have.attr',
      'aria-busy',
      'false'
    );

    cy.get('#shotnum').check();
    cy.get('#activeArea').check();

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
    // eslint-disable-next-line testing-library/await-async-utils
    cy.wait(1000);
    verifyColumnOrder(['Timestamp', 'Active Area', 'Shot Number']);
  });

  it('has sticky headers', () => {
    cy.get('[aria-describedby="table-loading-indicator"]').should(
      'have.attr',
      'aria-busy',
      'false'
    );

    cy.get('#shotnum').check();
    cy.get('[role="columnheader"]').should('be.visible');

    cy.get('[role="table-container"]').scrollTo('bottom');
    cy.get('[role="columnheader"]').should('be.visible');
  });

  it('has a sticky timestamp column when scrolling right', () => {
    cy.get('[aria-describedby="table-loading-indicator"]').should(
      'have.attr',
      'aria-busy',
      'false'
    );

    // Add enough columns to require horizontal scroll bar
    for (let i = 0; i < 7; i++) {
      cy.get('[type="checkbox"').eq(i).check();
    }

    cy.get('[role="table-container"]').scrollTo('right');
    cy.get('[role="columnheader"]').first().should('be.visible');
  });

  it('column headers overflow when word wrap is enabled', () => {
    cy.get('[aria-describedby="table-loading-indicator"]').should(
      'have.attr',
      'aria-busy',
      'false'
    );

    cy.get('[id^="CHANNEL_"]').first().as('channelCheckbox');
    cy.get('@channelCheckbox').invoke('attr', 'id').as('channelName');
    cy.get('@channelCheckbox').check();

    cy.get('@channelName').then((channelName) => {
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
  });

  it.skip('should be able to resize a column', () => {
    let columnWidth = 0;

    cy.get('[role="columnheader"]')
      .first()
      .should(($column) => {
        const { width } = $column[0].getBoundingClientRect();
        columnWidth = width;
      });

    cy.get('[role="separator"]')
      .first()
      .trigger('mousedown')
      .trigger('mousemove', { clientX: 200, force: true })
      .trigger('mouseup');

    cy.get('[role="columnheader"]')
      .first()
      .should(($column) => {
        const { width } = $column[0].getBoundingClientRect();
        expect(width).to.be.greaterThan(columnWidth);
      });
  });

  describe('should be able to sort by', () => {
    it('ascending order', () => {
      cy.get('[data-testid="sort timestamp"]').click().wait('@getRecords');
      cy.wait(200);
      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('tbody').within(() => {
        cy.get('tr')
          .first()
          .within(() => {
            cy.get('td').first().contains('2022-01-01 00:00:00');
          });
      });
    });

    it('descending order', () => {
      cy.get('[data-testid="sort timestamp"]').click().wait('@getRecords');
      cy.get('[data-testid="sort timestamp"]').click().wait('@getRecords');
      cy.get('[aria-sort="descending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should('be.visible');
      cy.get('tbody').within(() => {
        cy.get('tr')
          .first()
          .within(() => {
            cy.get('td').first().contains('2022-01-01 00:00:00');
          });
      });
    });

    it('no order', () => {
      cy.get('[data-testid="sort timestamp"]').click().wait('@getRecords');
      cy.wait(200);
      cy.get('[data-testid="sort timestamp"]').click().wait('@getRecords');
      cy.wait(200);
      cy.get('[data-testid="sort timestamp"]').click().wait('@getRecords');
      cy.wait(200);
      cy.get('[aria-sort="ascending"]').should('not.exist');
      cy.get('[aria-sort="descending"]').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should(
        'have.css',
        'opacity',
        '0'
      );
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should('not.exist');
      cy.get('tbody').within(() => {
        cy.get('tr')
          .first()
          .within(() => {
            cy.get('td').first().contains('2022-01-01 00:00:00');
          });
      });
    });

    it('multiple columns', () => {
      cy.get('#shotnum').check();
      cy.get('[data-testid="sort timestamp"]').click().wait('@getRecords');
      cy.wait(200);
      cy.get('[data-testid="sort shotnum"]').click().wait('@getRecords');

      cy.get('tbody').within(() => {
        cy.get('tr')
          .first()
          .within(() => {
            cy.get('td').eq(0).contains('2022-01-01 00:00:00');
            cy.get('td').eq(1).contains('1');
          });
      });
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
});
