describe('Functions', () => {
  beforeEach(() => {
    cy.visit('/');
  });
  afterEach(() => {
    cy.clearMocks();
  });

  it('creates one scalar function', () => {
    cy.findByRole('button', { name: 'Functions' }).click();
    cy.findByLabelText('Name').type('a');
    cy.findByLabelText('Expression').type('1 ');
    cy.findByRole('button', { name: 'Apply' }).click();
    cy.findByRole('columnheader', {
      name: 'a',
    }).should('exist');
  });

  it('creates multiple scalar functions', () => {
    cy.findByRole('button', { name: 'Functions' }).click();
    cy.findByLabelText('Name').type('a');
    cy.findByLabelText('Expression').type('1 ');

    cy.findByRole('button', { name: 'Add new function' }).click();

    cy.findAllByLabelText('Name').last().type('b');
    cy.findAllByLabelText('Expression').last().type('a{enter}+{enter}1{enter}');

    cy.findByRole('button', { name: 'Apply' }).click();
    cy.findByRole('columnheader', {
      name: 'a',
    }).should('exist');
    cy.findByRole('columnheader', {
      name: 'b',
    }).should('exist');
  });

  it('creates multiple functions (waveform and image)', () => {
    cy.findByRole('button', { name: 'Functions' }).click();
    cy.findByLabelText('Name').type('b');
    cy.findByLabelText('Expression').type('CHANNEL_EFGHI ');

    cy.findByRole('button', { name: 'Add new function' }).click();

    cy.findAllByLabelText('Name').last().type('c');
    cy.findAllByLabelText('Expression').last().type('CHANNEL_FGHIJ ');

    cy.findByRole('button', { name: 'Apply' }).click();
    cy.findByRole('columnheader', {
      name: 'b',
    }).should('exist');
    cy.findByRole('columnheader', {
      name: 'c',
    }).should('exist');
  });

  it('displays error message when name and expression fields are empty and clears them when values are entered', () => {
    cy.findByRole('button', { name: 'Functions' }).click();

    cy.findByRole('button', { name: 'Add new function' }).click();

    cy.findByRole('button', { name: 'Apply' }).click();
    cy.findAllByText('String should have at least 1 character').should(
      'have.length',
      4
    );

    cy.findAllByLabelText('Name').first().type('a');
    cy.findAllByLabelText('Expression').first().type('1 ');

    cy.findAllByLabelText('Name').last().type('b');
    cy.findAllByLabelText('Expression').last().type('a{enter}+{enter}1{enter}');

    cy.findByText('String should have at least 1 character').should(
      'not.exist'
    );
  });

  it('displays error message when the expression field is invalid', () => {
    cy.findByRole('button', { name: 'Functions' }).click();

    cy.findByLabelText('Name').type('a');
    cy.findByLabelText('Expression').type('( ');

    cy.findByRole('button', { name: 'Apply' }).click();
    cy.findByText(
      "expression '(' has unexpected end-of-input, check all brackets are closed"
    ).should('exist');
  });

  it('displays error message when the name field is invalid', () => {
    cy.findByRole('button', { name: 'Functions' }).click();

    cy.findByLabelText('Name').type('b@d_n@m3');
    cy.findByLabelText('Expression').type('1 ');

    cy.findByRole('button', { name: 'Apply' }).click();
    cy.findByText(
      "name 'b@d_n@m3' must start with a letter, and can only contain letters, digits, '-' or '_' characters"
    ).should('exist');
  });
});
