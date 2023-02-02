describe('Data Channels Component', () => {
  beforeEach(() => {
    cy.intercept('**/records**', (req) => {
      req.reply({
        statusCode: 200,
        fixture: 'records.json',
      });
    }).as('getRecords');

    cy.intercept('**/records/count**', (req) => {
      req.reply({ statusCode: 200, fixture: 'recordCount.json' });
    }).as('getRecordCount');

    cy.intercept('**/channels', (req) => {
      req.reply({ statusCode: 200, fixture: 'channels.json' });
    }).as('getChannels');

    cy.visit('/').wait(['@getRecords', '@getChannels', '@getRecordCount']);
  });

  it('opens dialogue when you click on main data channels button and closes when you click close', () => {
    cy.contains('Data Channels').click();

    cy.get('[role="dialog"]').contains('Data Channels').should('be.visible');

    cy.get('[role="dialog"]').contains('Close').click();

    cy.get('[role="dialog"]').should('not.exist');
  });

  it('lets a user add new channels', () => {
    cy.contains('Data Channels').click();

    cy.contains('system').click();

    cy.findByRole('checkbox', { name: 'Shot Number' }).check();

    cy.contains('Add Channels').click();

    cy.findByRole('columnheader', { name: 'Shot Number' }).should('be.visible');
  });

  it('lets a user remove channels', () => {
    cy.contains('Data Channels').click();

    cy.contains('system').click();

    cy.findByRole('checkbox', { name: 'Shot Number' }).check();

    cy.contains('Add Channels').click();

    cy.findByRole('columnheader', { name: 'Shot Number' }).should('be.visible');

    cy.contains('Data Channels').click();

    cy.findByRole('checkbox', { name: 'Shot Number' }).uncheck();

    cy.findByRole('checkbox', { name: 'Active Area' }).check();

    cy.contains('Add Channels').click();

    cy.findByRole('columnheader', { name: 'Shot Number' }).should('not.exist');
    cy.findByRole('columnheader', { name: 'Active Area' }).should('be.visible');
  });

  it('lets a user navigate the channel tree', () => {
    cy.contains('Data Channels').click();

    cy.contains('system').click();

    cy.contains('Shot Number').should('be.visible');

    cy.contains('All Channels').click();

    cy.findByRole('button', { name: 'Channels' }).click();

    cy.findByRole('button', { name: '1' }).should('be.visible');

    cy.findByRole('button', { name: '1' }).click();

    cy.contains('Channel_ABCDE').should('be.visible');

    cy.findByRole('link', { name: 'Channels' }).click();

    cy.findByRole('button', { name: '1' }).should('be.visible');

    cy.findByRole('button', { name: '2' }).click();

    cy.contains('Channel_DEFGH').should('be.visible');

    cy.contains('All Channels').click();

    cy.contains('system').should('be.visible');
  });
});
