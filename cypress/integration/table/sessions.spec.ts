function getParamsFromUrl(url: string) {
  const paramsString = url.split('?')[1];
  const paramMap = new Map();
  paramsString.split('&').forEach(function (part) {
    const keyValPair = part.split('=');
    const key = keyValPair[0];
    const val = decodeURIComponent(keyValPair[1]);
    paramMap.set(key, val);
  });
  return paramMap;
}

describe('Sessions', () => {
  beforeEach(() => {
    cy.visit('/');
  });
  afterEach(() => {
    cy.clearMocks();
  });
  it('sends a posts a request when a user session is created', () => {
    cy.findByTestId('AddCircleIcon').click();
    cy.findByLabelText('Name*').type('Session');
    cy.findByLabelText('Summary').type('Summary');

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findBrowserMockedRequests({ method: 'POST', url: '/sessions' }).should(
      (patchRequests) => {
        expect(patchRequests.length).equal(1);
        const request = patchRequests[0];
        expect(request.body.toString()).equal(
          '{"table":{"columnStates":{},"selectedColumnIds":["timestamp"],"page":0,"resultsPerPage":25,"sort":{}},"search":{"searchParams":{"dateRange":{},"shotnumRange":{},"maxShots":50,"experimentID":null}},"plots":{},"filter":{"appliedFilters":[[]]},"windows":{}}'
        );

        expect(request.url.toString()).to.contain('name=');
        expect(request.url.toString()).to.contain('summary=');
        expect(request.url.toString()).to.contain('auto_saved=');

        const paramMap: Map<string, string> = getParamsFromUrl(
          request.url.toString()
        );

        expect(paramMap.get('name')).equal('Session');
        expect(paramMap.get('summary')).equal('Summary');
        expect(paramMap.get('auto_saved')).equal('false');
      }
    );
  });
  it('can load a user session', () => {
    cy.findByText('Session 1').should('exist');
    cy.findByText('Session 2').should('exist');
    cy.findByText('Session 3').should('exist');

    cy.findByText('Session 2').click();
    // wait for search to initiate and finish
    cy.findByRole('progressbar').should('exist');
    cy.findByRole('progressbar').should('not.exist');
    cy.findByLabelText('open experiment search box')
      .contains('ID 19210012')
      .should('exist');
    cy.findByLabelText('from, date-time input').should(($input) => {
      const value = $input.val();
      expect(value).to.equal('2022-01-06 13:00');
    });

    cy.findByLabelText('to, date-time input').should(($input) => {
      const value = $input.val();
      expect(value).to.equal('2022-01-09 12:00');
    });
  });

  it('can clear the search parameters when navigating from one to another session', () => {
    cy.findByText('Session 1').should('exist');
    cy.findByText('Session 2').should('exist');
    cy.findByText('Session 3').should('exist');

    cy.findByText('Session 2').click();
    // wait for search to initiate and finish
    cy.findByRole('progressbar').should('exist');
    cy.findByRole('progressbar').should('not.exist');
    cy.findByLabelText('open experiment search box')
      .contains('ID 19210012')
      .should('exist');
    cy.findByLabelText('from, date-time input').should(($input) => {
      const value = $input.val();
      expect(value).to.equal('2022-01-06 13:00');
    });

    cy.findByLabelText('to, date-time input').should(($input) => {
      const value = $input.val();
      expect(value).to.equal('2022-01-09 12:00');
    });

    cy.findByText('Session 3').click();
    // wait for search to initiate and finish
    cy.findByRole('progressbar').should('exist');
    cy.findByRole('progressbar').should('not.exist');
    cy.findByLabelText('open experiment search box')
      .contains('ID 19210012')
      .should('not.exist');
    cy.findByLabelText('from, date-time input').should(($input) => {
      const value = $input.val();
      expect(value).to.equal('');
    });

    cy.findByLabelText('to, date-time input').should(($input) => {
      const value = $input.val();
      expect(value).to.equal('');
    });
  });

  it('sends a patch request when a user edits a session', () => {
    cy.findAllByTestId('edit-session-button').first().click();
    cy.findByLabelText('Name*').should(($input) => {
      const value = $input.val();
      expect(value).to.equal('Session 1');
    });

    cy.findByLabelText('Summary').should(($input) => {
      const value = $input.val();
      expect(value).to.equal('This is the summary for Session 1');
    });
    cy.findByLabelText('Name*').clear();
    cy.findByLabelText('Summary').clear();

    cy.findByLabelText('Name*').type('Session');
    cy.findByLabelText('Summary').type('Summary');

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findBrowserMockedRequests({
      method: 'PATCH',
      url: '/sessions/:id',
    }).should((patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];

      expect(request.url.toString()).to.contain('1');
      expect(request.url.toString()).to.contain('name=');
      expect(request.url.toString()).to.contain('summary=');
      expect(request.url.toString()).to.contain('auto_saved=');

      const paramMap: Map<string, string> = getParamsFromUrl(
        request.url.toString()
      );

      expect(paramMap.get('name')).equal('Session');
      expect(paramMap.get('summary')).equal('Summary');
      expect(paramMap.get('auto_saved')).equal('false');
    });
  });

  it('sends a patch request when a user saves their current session', () => {
    cy.findByText('Session 2').click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findBrowserMockedRequests({
      method: 'PATCH',
      url: '/sessions/:id',
    }).should((patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];

      expect(request.url.toString()).to.contain('2');
      expect(request.url.toString()).to.contain('auto_saved=');

      const paramMap: Map<string, string> = getParamsFromUrl(
        request.url.toString()
      );

      expect(paramMap.get('auto_saved')).equal('false');
    });
  });

  it('opens the save session dialog if a user session is not selected and user click the save or save as button', () => {
    cy.findByRole('button', { name: 'Save' }).click();
    cy.findByLabelText('Save Session').should('exist');
    cy.findByRole('button', { name: 'Close' }).click();
    cy.findByRole('button', { name: 'Save as' }).click();
    cy.findByLabelText('Save Session').should('exist');
  });

  it('loads in the summary and name (with _copy) when save as is clicked and a user session is selected', () => {
    cy.findByText('Session 2').click();
    cy.findByRole('button', { name: 'Save as' }).click();
    cy.findByLabelText('Save Session').should('exist');

    cy.findByLabelText('Name*').should(($input) => {
      const value = $input.val();
      expect(value).to.equal('Session 2_copy');
    });

    cy.findByLabelText('Summary').should(($input) => {
      const value = $input.val();
      expect(value).to.equal('This is the summary for Session 2');
    });
  });

  it('sends a delete request when a user deletes a session', () => {
    cy.findAllByTestId('delete-session-button').first().click();
    cy.findByText('Delete Session');

    cy.findAllByTestId('delete-session-name').should('have.text', 'Session 1');

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Continue' }).click();

    cy.findBrowserMockedRequests({
      method: 'DELETE',
      url: '/sessions/:id',
    }).should((patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];

      expect(request.url.toString()).to.contain('1');
    });
  });
});
