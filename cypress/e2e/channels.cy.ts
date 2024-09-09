describe('Data Channels Component', () => {
  beforeEach(() => {
    cy.visit('/');
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
    cy.findByRole('checkbox', { name: 'Active Area' }).check();
    cy.findByRole('checkbox', { name: 'Active Experiment' }).check();

    cy.contains('Add Channels').click();

    cy.findByRole('columnheader', { name: 'Shot Number' }).should('be.visible');
    cy.findByRole('columnheader', { name: 'Active Area' }).should('be.visible');
    cy.findByRole('columnheader', { name: 'Active Experiment' }).should(
      'be.visible'
    );

    cy.contains('Data Channels').click();
    cy.contains('All Channels').click();
    cy.findByRole('checkbox', { name: 'system' }).should('be.checked');
    cy.contains('system').click();

    cy.findByRole('checkbox', { name: 'Shot Number' }).uncheck();

    cy.contains('Add Channels').click();

    cy.findByRole('columnheader', { name: 'Shot Number' }).should('not.exist');
  });

  it('lets a user navigate the channel tree', () => {
    cy.contains('Data Channels').click();

    cy.findByRole('checkbox', { name: 'system' }).should(
      'have.prop',
      'indeterminate'
    );

    cy.contains('system').click();

    cy.contains('Shot Number').should('be.visible');

    cy.contains('All Channels').click();

    cy.findByRole('button', { name: 'Channels' }).click();

    cy.findByRole('button', { name: '1' }).should('be.visible');
    cy.findByRole('checkbox', { name: '1' }).should('not.be.checked');

    cy.findByRole('button', { name: '1' }).click();

    cy.contains('Channel_ABCDE').should('be.visible');
    cy.findByRole('checkbox', { name: 'Channel_ABCDE' }).check();

    cy.findByRole('link', { name: 'Channels' }).click();

    cy.findByRole('button', { name: '1' }).should('be.visible');
    cy.findByRole('checkbox', { name: '1' }).should(
      'have.prop',
      'indeterminate'
    );

    cy.findByRole('button', { name: '2' }).click();

    cy.contains('Channel_DEFGH').should('be.visible');

    cy.contains('All Channels').click();

    cy.contains('system').should('be.visible');
    cy.findByRole('checkbox', { name: 'Channels' }).should(
      'have.prop',
      'indeterminate'
    );
  });

  it('displays channel metadata when user clicks on a channel', () => {
    cy.contains('Data Channels').click();

    cy.findByRole('button', { name: 'Channels' }).click();

    cy.findByRole('button', { name: '1' }).click();

    cy.findByRole('button', { name: 'Channel_BCDEF' }).click();

    cy.findByAltText('Channel_BCDEF image at 2022-01-31 00:00:00')
      .should('be.visible')
      .should(($imgs) =>
        // natural width means the img is a real image
        $imgs.map((_i, img) =>
          expect((img as HTMLImageElement).naturalWidth).to.be.greaterThan(0)
        )
      );

    cy.findByRole('button', { name: 'Channel_ABCDE' }).click();

    cy.findByRole('cell', { name: '6' }).should('be.visible');
  });

  it('displays channel metadata when user searches for a channel', () => {
    cy.contains('Data Channels').click();

    cy.findByLabelText('Search data channels').type('shot{downArrow}{enter}');

    cy.findByText('System name: shotnum').should('be.visible');

    cy.findByRole('checkbox', { name: 'Shot Number' }).should('exist');
  });

  it('displays a button in channel metadata panel that adds or removes the displayed channel', () => {
    cy.contains('Data Channels').click();
    cy.contains('system').click();
    cy.findByRole('button', { name: 'Shot Number' }).click();

    cy.findByRole('button', { name: 'Add this channel' }).click();

    cy.findByRole('checkbox', { name: 'Shot Number' }).should('be.checked');
    cy.findByRole('button', { name: 'Add this channel' }).should('not.exist');
    cy.findByRole('button', { name: 'Remove this channel' }).should('exist');

    cy.findByRole('button', { name: 'Add Channels' }).click();
    cy.findByRole('columnheader', { name: 'Shot Number' }).should('be.visible');

    // reopen data channel dialog
    cy.contains('Data Channels').click();
    cy.contains('system').click();
    cy.findByRole('button', { name: 'Shot Number' }).click();

    cy.findByRole('button', { name: 'Remove this channel' }).click();

    cy.findByRole('checkbox', { name: 'Shot Number' }).should('not.be.checked');
    cy.findByRole('button', { name: 'Remove this channel' }).should(
      'not.exist'
    );
    cy.findByRole('button', { name: 'Add this channel' }).should('exist');

    cy.findByRole('button', { name: 'Add Channels' }).click();
    cy.findByRole('columnheader', { name: 'Shot Number' }).should('not.exist');
  });
});
