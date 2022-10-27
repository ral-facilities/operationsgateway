describe('Filtering Component', () => {
  beforeEach(() => {
    cy.intercept('**/records**', (req) => {
      req.reply({
        statusCode: 200,
        fixture: 'records.json',
      });
    }).as('getRecords');

    cy.intercept('**/records/count', (req) => {
      req.reply({ statusCode: 200, fixture: 'recordCount.json' });
    }).as('getRecordCount');

    // remove second @getRecords once we query channels properly
    cy.visit('/').wait(['@getRecords', '@getRecords', '@getRecordCount']);
  });

  it('opens dialogue when you click on main filters button and closes when you click close', () => {
    cy.contains('Filter').click();

    cy.get('[role="dialog"]').contains('Filters').should('be.visible');

    cy.get('[role="dialog"]').contains('Close').click();

    cy.get('[role="dialog"]').should('not.exist');
  });

  it('opens dialogue when you click the filters button in a filtered table column', () => {
    cy.contains('Filter').click();

    cy.get('input[role="combobox"]').type('Time{enter}is not null{enter}');
    cy.contains('Apply').click();
    cy.get('[role="dialog"]').should('not.exist');

    cy.wait('@getRecords');
    cy.get('[role="columnheader"]')
      .first() // Time column
      .within(() => {
        cy.get('[aria-label="open filters"]').click();
      });

    cy.get('[role="dialog"]').contains('Filters').should('be.visible');
  });

  it('lets a user create a filter', () => {
    cy.contains('Filter').click();

    cy.get('input[role="combobox"]').type('Time{enter}is not null{enter}');

    cy.get('[role="dialog"]')
      .contains('[role="button"]', 'Time')
      .should('be.visible');
    cy.get('[role="dialog"]')
      .contains('[role="button"]', 'is not null')
      .should('be.visible');

    cy.contains('Apply').should('not.be.disabled');
    cy.contains('Apply').click();

    cy.wait('@getRecords').should(({ request }) => {
      expect(request.url).to.contain('conditions=');
      expect(request.url).to.contain(
        `conditions=${encodeURIComponent(
          '{"metadata.timestamp":{"$ne":null}}'
        )}`
      );
    });
  });

  it('stops a user from creating an invalid filter', () => {
    cy.contains('Filter').click();

    cy.get('input[role="combobox"]').type('Time{enter}<{enter}').blur();

    cy.get('[role="dialog"]')
      .contains('[role="button"]', 'Time')
      .should('be.visible');
    cy.get('[role="dialog"]')
      .contains('[role="button"]', /^<$/)
      .should('be.visible');

    cy.get('[role="dialog"]').contains('Missing operand').should('be.visible');

    cy.contains('Apply').should('be.disabled');
  });

  it('lets a user edit a filter', () => {
    cy.contains('Filter').click();

    // this is also testing autocomplete suggestions work (i.e. it selects the second channel)
    // as well as inputting numbers and strings
    cy.get('input[role="combobox"]')
      .type(
        'Channel{downArrow}{enter}!={enter}"1"{enter}and{enter}not{enter}Shot Numb{enter}>{enter}1{enter}'
      )
      .blur();

    cy.get('[role="dialog"]')
      .contains('[role="button"]', 'CHANNEL_DEFGH')
      .should('be.visible');
    cy.get('[role="dialog"]')
      .contains('[role="button"]', /^"1"$/)
      .should('be.visible');
    cy.get('[role="dialog"]')
      .contains('[role="button"]', /^1$/)
      .should('be.visible');
    cy.get('[role="dialog"]')
      .contains('[role="button"]', 'not')
      .children()
      .eq(1)
      .click();
    cy.get('[role="dialog"]')
      .contains('[role="button"]', 'not')
      .should('not.exist');

    cy.contains('Apply').should('not.be.disabled');

    cy.get('input[role="combobox"]').focus();
    cy.get('input[role="combobox"]').get('button[aria-label="Clear"]').click();
    cy.get('.MuiAutocomplete-tag').should('not.exist');
  });

  it('stops a user from entering a random string', () => {
    cy.contains('Filter').click();

    cy.get('input[role="combobox"]').type('INVALID{enter}').blur();

    cy.get('.MuiAutocomplete-tag').should('not.exist');

    cy.get('input[role="combobox"]').should('have.value', 'INVALID');
  });

  it('lets a user create multiple filters and delete them', () => {
    cy.contains('Filter').click();

    cy.get('input[role="combobox"]').type('Time{enter}is not null{enter}');

    cy.contains('button', 'Add new filter').click();

    cy.get('input[role="combobox"]')
      .eq(1)
      .type('Channel{enter}is not null{enter}');

    cy.contains('Apply').should('not.be.disabled');
    cy.contains('Apply').click();

    cy.wait('@getRecords').should(({ request }) => {
      expect(request.url).to.contain('conditions=');
      expect(request.url).to.contain(
        `conditions=${encodeURIComponent(
          '{"metadata.timestamp":{"$ne":null}}'
        )}&conditions=${encodeURIComponent(
          '{"channels.CHANNEL_ABCDE.data":{"$ne":null}}'
        )}`
      );
    });

    cy.contains('Filter').click();

    cy.get('button[aria-label="Delete filter 0"]').click();

    cy.contains('Apply').click();

    cy.wait('@getRecords').should(({ request }) => {
      expect(request.url).to.contain('conditions=');
      expect(request.url).to.contain(
        `conditions=${encodeURIComponent(
          '{"channels.CHANNEL_ABCDE.data":{"$ne":null}}'
        )}`
      );
    });
  });
});
