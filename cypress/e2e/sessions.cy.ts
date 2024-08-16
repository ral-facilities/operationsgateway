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
    // mock date to ensure stability in auto-set from and to date
    cy.clock(new Date('2024-08-02 14:00'), ['Date']);

    cy.visit('/');

    cy.findByRole('tabpanel', { name: 'Data' }).should('be.visible');
    cy.findByRole('progressbar').should('not.exist');
  });
  afterEach(() => {
    cy.clearMocks();
  });
  it('sends a posts a request when a user session is created', () => {
    cy.findByTestId('AddCircleIcon').should('exist');
    cy.window().then((window) => {
      // Reference global instances set in "src/mocks/browser.js".
      const { worker, rest } = window.msw;

      worker.use(
        rest.post('/sessions', async (req, res, ctx) => {
          // return a session without popups
          const sessionID = '2';
          return res(ctx.status(200), ctx.json(sessionID));
        })
      );
    });

    cy.findByTestId('AddCircleIcon').click();
    cy.findByLabelText('Name *').type('Session');
    cy.findByLabelText('Summary').type('Summary');

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findBrowserMockedRequests({ method: 'POST', url: '/sessions' }).should(
      (patchRequests) => {
        expect(patchRequests.length).equal(1);
        const request = patchRequests[0];
        expect(JSON.stringify(request.body)).equal(
          '{"table":{"columnStates":{},"selectedColumnIds":["timestamp"],"page":0,"resultsPerPage":25,"sort":{}},"search":{"searchParams":{"dateRange":{"toDate":"2024-08-02T14:00:59","fromDate":"2024-08-01T14:00:00"},"shotnumRange":{},"maxShots":50,"experimentID":null}},"plots":{},"filter":{"appliedFilters":[[]]},"windows":{},"selection":{"selectedRows":[]}}'
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

    cy.findByTestId('session-save-buttons-timestamp').should(
      'have.text',
      'Session last saved: 29 Jun 2023 14:45'
    );

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

    cy.findByTestId('session-save-buttons-timestamp').should(
      'have.text',
      'Session last autosaved: 30 Jun 2023 09:15'
    );
  });

  it('sends a patch request when a user edits a session', () => {
    cy.findByRole('button', { name: 'edit Session 1 session' }).click();
    cy.findByLabelText('Name *').should(($input) => {
      const value = $input.val();
      expect(value).to.equal('Session 1');
    });

    cy.findByLabelText('Summary').should(($input) => {
      const value = $input.val();
      expect(value).to.equal('This is the summary for Session 1');
    });
    cy.findByLabelText('Name *').clear();
    cy.findByLabelText('Summary').clear();

    cy.findByLabelText('Name *').type('Session');
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

    // wait for session to load
    cy.findByRole('progressbar').should('exist');
    cy.findByRole('progressbar').should('not.exist');

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findBrowserMockedRequests({
      method: 'PATCH',
      url: '/sessions/:id',
    }).should((patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(JSON.stringify(request.body)).equal(
        JSON.stringify({
          table: {
            columnStates: {},
            selectedColumnIds: [
              'timestamp',
              'CHANNEL_EFGHI',
              'CHANNEL_FGHIJ',
              'shotnum',
            ],
            page: 0,
            resultsPerPage: 25,
            sort: {},
          },
          search: {
            searchParams: {
              dateRange: {
                fromDate: '2022-01-06T13:00:00',
                toDate: '2022-01-09T12:00:59',
              },
              shotnumRange: { min: 7, max: 9 },
              maxShots: 50,
              experimentID: {
                _id: '19210012-1',
                end_date: '2022-01-09T12:00:00',
                experiment_id: '19210012',
                part: 1,
                start_date: '2022-01-06T13:00:00',
              },
            },
          },
          plots: {},
          filter: {
            appliedFilters: [
              [
                { type: 'channel', value: 'shotnum', label: 'Shot Number' },
                { type: 'compop', value: '>', label: '>' },
                { type: 'number', value: '7', label: '7' },
              ],
            ],
          },
          functions: { appliedFunctions: [] },
          windows: {},
          selection: { selectedRows: [] },
        })
      );
      expect(request.url.toString()).to.contain('2');
      expect(request.url.toString()).to.contain('name=');
      expect(request.url.toString()).to.contain('summary=');
      expect(request.url.toString()).to.contain('auto_saved=');

      const paramMap: Map<string, string> = getParamsFromUrl(
        request.url.toString()
      );

      expect(paramMap.get('name')).equal('Session+2');
      expect(paramMap.get('summary')).equal(
        'This+is+the+summary+for+Session+2'
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

    // wait for session to load
    cy.findByRole('progressbar').should('exist');
    cy.findByRole('progressbar').should('not.exist');

    cy.findByRole('button', { name: 'Save as' }).click();
    cy.findByLabelText('Save Session').should('exist');

    cy.findByLabelText('Name *').should(($input) => {
      const value = $input.val();
      expect(value).to.equal('Session 2_copy');
    });

    cy.findByLabelText('Summary').should(($input) => {
      const value = $input.val();
      expect(value).to.equal('This is the summary for Session 2');
    });
  });

  it('sends a delete request when a user deletes a session', () => {
    cy.findByRole('button', { name: 'delete Session 1 session' }).click();
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
