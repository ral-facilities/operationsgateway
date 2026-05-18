describe('Export', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.intercept('**/export?*').as('export');
  });
  afterEach(() => {
    cy.clearMocks();
    cy.deleteDownloadsFolder();
  });

  it('can open and close the dialog', () => {
    cy.findByRole('button', { name: 'Export' }).click();
    cy.findByRole('dialog').should('exist');

    cy.findByRole('button', { name: 'Export' }).click();
    cy.findByRole('dialog').should('exist');
    cy.findByRole('button', { name: 'Cancel' }).click();
    cy.findByRole('dialog').should('not.exist');
  });

  it('can select export type', () => {
    cy.findByRole('button', { name: 'Export' }).click();
    cy.findByRole('radio', { name: 'All Rows' }).should('be.checked');
    cy.findByRole('radio', { name: 'Visible Rows' }).should('not.be.checked');
    cy.findByRole('radio', { name: 'Visible Rows' }).click();
    cy.findByRole('radio', { name: 'Visible Rows' }).should('be.checked');
    cy.findByRole('radio', { name: 'All Rows' }).should('not.be.checked');
  });

  it('can select export content', () => {
    cy.findByRole('button', { name: 'Export' }).click();
    cy.findByRole('checkbox', { name: 'Scalars' }).should('be.checked');
    cy.findByRole('checkbox', { name: 'Strings' }).should('be.checked');
    cy.findByRole('checkbox', { name: 'Images' }).should('not.be.checked');
    cy.findByRole('checkbox', { name: 'Float Images' }).should(
      'not.be.checked'
    );
    cy.findByRole('checkbox', { name: 'Waveform CSVs' }).should(
      'not.be.checked'
    );
    cy.findByRole('checkbox', { name: 'Waveform Images' }).should(
      'not.be.checked'
    );
    cy.findByRole('checkbox', { name: 'Vector CSVs' }).should('not.be.checked');
    cy.findByRole('checkbox', { name: 'Vector Images' }).should(
      'not.be.checked'
    );
    cy.findByRole('checkbox', { name: 'Images' }).click();
    cy.findByRole('checkbox', { name: 'Images' }).should('be.checked');
    cy.findByRole('checkbox', { name: 'Scalars' }).should('be.checked');
    cy.findByRole('checkbox', { name: 'Strings' }).should('be.checked');
  });

  it('should remember options when closed', () => {
    cy.findByRole('button', { name: 'Export' }).click();
    cy.findByRole('dialog', { name: 'Export Data' }).should('exist');
    cy.findByRole('radio', { name: 'Visible Rows' }).click();
    cy.findByRole('checkbox', { name: 'Images' }).click();
    cy.findByRole('button', { name: 'Cancel' }).click();
    cy.findByRole('dialog', { name: 'Export Data' }).should('not.exist');
    cy.findByRole('button', { name: 'Export' }).click();
    cy.findByRole('dialog', { name: 'Export Data' }).should('exist');
    cy.findByRole('radio', { name: 'Visible Rows' }).should('be.checked');
    cy.findByRole('checkbox', { name: 'Images' }).should('be.checked');
  });

  it('should be able to export all rows', () => {
    cy.findByRole('button', { name: 'Export' }).click();
    cy.findByRole('radio', { name: 'All Rows' }).click();

    cy.findByRole('checkbox', { name: 'Images' }).click();

    cy.findByRole('button', { name: 'Export' }).click();

    cy.readFile('./cypress/downloads/scstimdownload.csv').should('exist');
  });

  it('should be able to export visible rows', () => {
    cy.findByRole('button', { name: 'Export' }).click();
    cy.findByRole('radio', { name: 'Visible Rows' }).click();

    cy.findByRole('checkbox', { name: 'Scalars' }).click();
    cy.findByRole('checkbox', { name: 'Strings' }).click();
    cy.findByRole('checkbox', { name: 'Waveform CSVs' }).click();
    cy.findByRole('checkbox', { name: 'Waveform Images' }).click();

    cy.findByRole('button', { name: 'Export' }).click();

    cy.readFile('./cypress/downloads/wcwidownload.csv').should('exist');
  });

  it('should be able to export selected rows', () => {
    cy.findByRole('button', { name: 'Export' }).click();
    cy.findByRole('radio', { name: 'Selected Rows' }).click();

    cy.findByRole('checkbox', { name: 'Float Images' }).click();
    cy.findByRole('checkbox', { name: 'Vector CSVs' }).click();
    cy.findByRole('checkbox', { name: 'Vector Images' }).click();

    cy.findByRole('button', { name: 'Export' }).click();

    cy.readFile('./cypress/downloads/scstflvcvidownload.csv').should('exist');
  });

  it('should be able to export a image channel', () => {
    cy.contains('Data Channels').click();

    cy.findByRole('button', { name: 'Channels' }).click();
    cy.findByRole('button', { name: '1' }).click();
    cy.findByRole('button', { name: 'Channel_BCDEF' }).click();
    cy.findByRole('button', { name: 'Add this channel' }).click();

    cy.findByRole('button', { name: 'Add Channels' }).click();

    cy.findByText('2022-01-04 00:00:00').should('exist');

    cy.findByRole('button', { name: 'CHANNEL_BCDEF menu' }).click();
    cy.findByRole('menu').should('exist');
    cy.findByRole('menuitem', { name: 'Export' }).click();
    cy.findByRole('dialog', { name: 'Export Channel' }).should('exist');
    cy.findByRole('button', { name: 'Export' }).click();
    cy.findByRole('dialog', { name: 'Export Channel' }).should('not.exist');

    cy.readFile('./cypress/downloads/imdownload.csv').should('exist');
  });

  it('should be able to export a float image channel', () => {
    cy.contains('Data Channels').click();

    cy.findByRole('button', { name: 'Channels' }).click();
    cy.findByRole('button', { name: '1' }).click();
    cy.findByRole('button', { name: 'Channel_BCDEFX' }).click();
    cy.findByRole('button', { name: 'Add this channel' }).click();

    cy.findByRole('button', { name: 'Add Channels' }).click();

    cy.findByText('2022-01-04 00:00:00').should('exist');

    cy.findByRole('button', { name: 'CHANNEL_BCDEFX menu' }).click();
    cy.findByRole('menu').should('exist');
    cy.findByRole('menuitem', { name: 'Export' }).click();
    cy.findByRole('dialog', { name: 'Export Channel' }).should('exist');
    cy.findByRole('button', { name: 'Export' }).click();
    cy.findByRole('dialog', { name: 'Export Channel' }).should('not.exist');

    cy.readFile('./cypress/downloads/fldownload.csv').should('exist');
  });

  it('should be able to export a waveform channel', () => {
    cy.contains('Data Channels').click();

    cy.findByRole('button', { name: 'Channels' }).click();
    cy.findByRole('button', { name: '1' }).click();
    cy.findByRole('button', { name: 'Channel_CDEFG' }).click();
    cy.findByRole('button', { name: 'Add this channel' }).click();

    cy.findByRole('button', { name: 'Add Channels' }).click();

    cy.findByText('2022-01-04 00:00:00').should('exist');

    cy.findByRole('button', { name: 'CHANNEL_CDEFG menu' }).click();
    cy.findByRole('menuitem', { name: 'Export' }).click();
    cy.findByRole('dialog', { name: 'Export Channel' }).should('exist');
    cy.findByRole('button', { name: 'Export' }).click();
    cy.findByRole('dialog', { name: 'Export Channel' }).should('not.exist');

    cy.readFile('./cypress/downloads/wcdownload.csv').should('exist');
  });

  it('should be able to export a Vector channel', () => {
    cy.contains('Data Channels').click();

    cy.findByRole('button', { name: 'Channels' }).click();
    cy.findByRole('button', { name: '1' }).click();
    cy.findByRole('button', { name: 'Channel_CDEFGX' }).click();
    cy.findByRole('button', { name: 'Add this channel' }).click();

    cy.findByRole('button', { name: 'Add Channels' }).click();

    cy.findByText('2022-01-04 00:00:00').should('exist');

    cy.findByRole('button', { name: 'CHANNEL_CDEFGX menu' }).click();
    cy.findByRole('menuitem', { name: 'Export' }).click();
    cy.findByRole('dialog', { name: 'Export Channel' }).should('exist');
    cy.findByRole('button', { name: 'Export' }).click();
    cy.findByRole('dialog', { name: 'Export Channel' }).should('not.exist');

    cy.readFile('./cypress/downloads/vcdownload.csv').should('exist');
  });

  it('should not be able to export a scalar channel', () => {
    cy.contains('Data Channels').click();

    cy.findByRole('button', { name: 'Channels' }).click();
    cy.findByRole('button', { name: '1' }).click();
    cy.findByRole('button', { name: 'Channel_ABCDE' }).click();
    cy.findByRole('button', { name: 'Add this channel' }).click();

    cy.findByRole('button', { name: 'Add Channels' }).click();

    cy.findByRole('button', { name: 'CHANNEL_ABCDE menu' }).click();
    cy.findByRole('menuitem', { name: 'Export' }).should('not.exist');
  });

  it('should not be able to export a string channel', () => {
    cy.contains('Data Channels').click();

    cy.findByRole('button', { name: 'Channels' }).click();
    cy.findByRole('button', { name: '1' }).click();
    cy.findByRole('button', { name: 'Channel_ABCDEX' }).click();
    cy.findByRole('button', { name: 'Add this channel' }).click();

    cy.findByRole('button', { name: 'Add Channels' }).click();

    cy.findByRole('button', { name: 'CHANNEL_ABCDEX menu' }).click();
    cy.findByRole('menuitem', { name: 'Export' }).should('not.exist');
  });
});
