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
    cy.findByRole('checkbox', { name: 'Images' }).should('not.be.checked');
    cy.findByRole('checkbox', { name: 'Waveform CSVs' }).should(
      'not.be.checked'
    );
    cy.findByRole('checkbox', { name: 'Waveform Images' }).should(
      'not.be.checked'
    );
    cy.findByRole('checkbox', { name: 'Images' }).click();
    cy.findByRole('checkbox', { name: 'Images' }).should('be.checked');
    cy.findByRole('checkbox', { name: 'Scalars' }).should('be.checked');
  });

  it('should remember options when closed', () => {
    cy.findByRole('button', { name: 'Export' }).click();
    cy.findByRole('radio', { name: 'Visible Rows' }).click();
    cy.findByRole('checkbox', { name: 'Images' }).click();
    cy.findByRole('button', { name: 'Cancel' }).click();
    cy.findByRole('button', { name: 'Export' }).click();
    cy.findByRole('radio', { name: 'Visible Rows' }).should('be.checked');
    cy.findByRole('checkbox', { name: 'Images' }).should('be.checked');
  });

  it('should be able to export all rows', () => {
    cy.findByRole('button', { name: 'Export' }).click();
    cy.findByRole('radio', { name: 'All Rows' }).click();

    cy.findByRole('checkbox', { name: 'Images' }).click();

    cy.findByRole('button', { name: 'Export' }).click();

    cy.readFile('./cypress/downloads/scimdownload.csv').should('exist');
  });

  it('should be able to export visible rows', () => {
    cy.findByRole('button', { name: 'Export' }).click();
    cy.findByRole('radio', { name: 'Visible Rows' }).click();

    cy.findByRole('checkbox', { name: 'Scalars' }).click();
    cy.findByRole('checkbox', { name: 'Waveform CSVs' }).click();
    cy.findByRole('checkbox', { name: 'Waveform Images' }).click();

    cy.findByRole('button', { name: 'Export' }).click();

    cy.readFile('./cypress/downloads/wcwidownload.csv').should('exist');
  });

  it('should be able to export selected rows', () => {
    cy.findByRole('button', { name: 'Export' }).click();
    cy.findByRole('radio', { name: 'Selected Rows' }).click();
    cy.findByRole('button', { name: 'Export' }).click();

    cy.readFile('./cypress/downloads/scdownload.csv').should('exist');
  });
});
