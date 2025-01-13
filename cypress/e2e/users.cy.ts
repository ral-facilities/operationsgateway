describe('Users', () => {
  it('should users table correctly', () => {
    cy.visit('/admin/users');
    cy.findByText('user1').should('exist');
    cy.findAllByText('FedID').should('have.length', 5);
    cy.findAllByText('/users POST').should('have.length', 3);
  });

  it('should load 404 page correctly', () => {
    cy.visit('/admin/invalid');

    cy.findByText(
      `We're sorry, the page you requested was not found on the server. If you entered the URL manually please check your spelling and try again. Otherwise, return to the`,
      { exact: false }
    ).should('exist');

    cy.findByRole('link', { name: 'home page' }).should('exist');
  });

  describe('add dialog', () => {
    beforeEach(() => {
      cy.visit('/admin/users');
      cy.findByRole('button', { name: 'Add User' }).click();
    });

    afterEach(() => {
      cy.clearMocks();
    });

    it('displays required error when username is empty', () => {
      cy.findByRole('button', { name: 'Submit' }).click();
      cy.findByText('Username is required.').should('exist');
    });

    it('displays password field only when auth_type is "local"', () => {
      cy.findByLabelText('Username').type('new_user');
      cy.findByLabelText('Password').should('exist');
    });

    it('dose not displays password field only when auth_type is "FedID"', () => {
      cy.findAllByRole('combobox').first().click();
      cy.findByRole('option', { name: 'FedID' }).click();

      cy.findByLabelText('Username').type('new_user');
      cy.findByLabelText('Password').should('not.exist');
    });

    it('adds user successfully (local)', () => {
      cy.findByLabelText('Username').type('new_user');
      cy.findByLabelText('Password').type('secure_password');

      cy.findAllByRole('combobox').last().click();
      cy.findByRole('option', { name: '/submit/hdf POST' }).click();
      cy.findAllByRole('combobox').last().click();
      cy.findByRole('option', { name: '/users PATCH' }).click();

      cy.startSnoopingBrowserMockedRequest();

      cy.findByRole('button', { name: 'Submit' }).click();

      cy.findBrowserMockedRequests({ method: 'POST', url: '/users' }).should(
        async (postRequests) => {
          expect(postRequests.length).equal(1);
          const request = postRequests[0];
          expect(JSON.stringify(await request.json())).equal(
            JSON.stringify({
              _id: 'new_user',
              sha256_password: 'secure_password',
              auth_type: 'local',
              authorised_routes: ['/submit/hdf POST', '/users PATCH'],
            })
          );
        }
      );
    });

    it('adds user successfully (fedId)', () => {
      cy.findByLabelText('Username').type('new_user');

      cy.findAllByRole('combobox').first().click();
      cy.findByRole('option', { name: 'FedID' }).click();

      cy.startSnoopingBrowserMockedRequest();

      cy.findByRole('button', { name: 'Submit' }).click();

      cy.findBrowserMockedRequests({ method: 'POST', url: '/users' }).should(
        async (postRequests) => {
          expect(postRequests.length).equal(1);
          const request = postRequests[0];
          expect(JSON.stringify(await request.json())).equal(
            JSON.stringify({
              _id: 'new_user',
              auth_type: 'FedID',
            })
          );
        }
      );
    });

    it('displays error when adding a user without a password for "local" auth_type', () => {
      cy.findByLabelText('Username').type('local_user');
      cy.findByRole('button', { name: 'Submit' }).click();
      cy.findByText(
        'for the auth_type you put (local), a password is required. Please add this field'
      ).should('exist');
    });

    it('displays error for duplicate username', () => {
      cy.findByLabelText('Username').type('test_dup');
      cy.findByLabelText('Password').type('secure_password');
      cy.findByRole('button', { name: 'Submit' }).click();
      cy.findByText(
        'username field must not be the same as a pre existing user. You put: test_dup'
      ).should('exist');
    });

    it('displays general error for unknown issues', () => {
      cy.findByLabelText('Username').type('error');
      cy.findByLabelText('Password').type('secure_password');
      cy.findByRole('button', { name: 'Submit' }).click();
      cy.findByText(
        'An unexpected error occurred. Please try again later.'
      ).should('exist');
    });

    it('should show and hide password when clicking the visibility toggle', () => {
      cy.findByLabelText('Username').type('testuser');
      cy.findByLabelText('Password').type('secure_password');

      cy.findByLabelText('Password').should('have.attr', 'type', 'password');

      cy.findByLabelText('Show password').click();

      cy.findByLabelText('Password').should('have.attr', 'type', 'text');

      cy.findByLabelText('Hide password').click();

      cy.findByLabelText('Password').should('have.attr', 'type', 'password');
    });
  });
});
