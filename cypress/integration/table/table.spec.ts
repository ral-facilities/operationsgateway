import { getHandleSelector } from '../../support/util';

const verifyColumnOrder = (columns: string[]): void => {
  for (let i = 0; i < columns.length; i++) {
    cy.get('th').eq(i).should('contain', columns[i]);
  }
};

describe('Table Component', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('initialises with a timestamp column', () => {
    verifyColumnOrder(['timestamp']);
  });

  it('adds columns in the order they are selected', () => {
    cy.get('#shotNum').check();

    verifyColumnOrder(['timestamp', 'shotNum']);
    cy.get('#activeArea').check();
    verifyColumnOrder(['timestamp', 'shotNum', 'activeArea']);
  });

  it('moves a column left', () => {
    cy.get('#shotNum').check();
    cy.get('#activeArea').check();

    cy.get(getHandleSelector())
      .eq(0)
      .as('secondColumn')
      .should('contain', 'shotNum');
    cy.get(getHandleSelector())
      .eq(1)
      .as('thirdColumn')
      .should('contain', 'activeArea');

    cy.dragAndDrop('@thirdColumn', '@secondColumn');

    // Wait for draggable elements to settle before testing the DOM again
    // eslint-disable-next-line testing-library/await-async-utils
    cy.wait(1000);
    verifyColumnOrder(['timestamp', 'activeArea', 'shotNum']);
  });

  it('moves a column right', () => {
    cy.get('#shotNum').check();
    cy.get('#activeArea').check();

    cy.get(getHandleSelector())
      .eq(0)
      .as('secondColumn')
      .should('contain', 'shotNum');
    cy.get(getHandleSelector())
      .eq(1)
      .as('thirdColumn')
      .should('contain', 'activeArea');

    cy.dragAndDrop('@secondColumn', '@thirdColumn');

    // Wait for draggable elements to settle before testing the DOM again
    // eslint-disable-next-line testing-library/await-async-utils
    cy.wait(1000);
    verifyColumnOrder(['timestamp', 'activeArea', 'shotNum']);
  });

  it('has sticky headers', () => {
    cy.get('#shotNum').check();
    cy.get('[role="columnheader"]').should('be.visible');

    cy.get('[role="table-container"]').scrollTo('bottom');
    cy.get('[role="columnheader"]').should('be.visible');
  });

  it('has a sticky timestamp column when scrolling right', () => {
    // Add enough columns to require horizontal scroll bar
    for (let i = 0; i < 7; i++) {
      cy.get('[type="checkbox"').eq(i).check();
    }

    cy.get('[role="table-container"]').scrollTo('right');
    cy.get('[role="columnheader"]').eq(0).should('be.visible');
  });
});
