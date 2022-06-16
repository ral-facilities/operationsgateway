import { getHandleSelector } from '../../support/util';

const verifyColumnOrder = (columns: string[]): void => {
  // Wait for draggable elements to settle before testing the DOM again
  // eslint-disable-next-line testing-library/await-async-utils
  cy.wait(1000);

  for (let i = 0; i < columns.length; i++) {
    cy.get('th').eq(i).should('contain', columns[i]);
  }
};

describe('Table Component', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('moves a column left', () => {
    cy.get('#id').check();
    cy.get('#shotNum').check();
    cy.get('#timestamp').check();

    cy.get(getHandleSelector()).eq(0).as('first').should('contain', 'id');
    cy.get(getHandleSelector()).eq(1).as('second').should('contain', 'shotNum');

    cy.dragAndDrop('@second', '@first');

    verifyColumnOrder(['shotNum', 'id', 'timestamp']);
  });

  it('moves a column right', () => {
    cy.get('#id').check();
    cy.get('#shotNum').check();
    cy.get('#timestamp').check();

    cy.get(getHandleSelector()).eq(0).as('first').should('contain', 'id');
    cy.get(getHandleSelector())
      .eq(2)
      .as('third')
      .should('contain', 'timestamp');

    cy.dragAndDrop('@first', '@third');

    verifyColumnOrder(['shotNum', 'timestamp', 'id']);
  });
});
