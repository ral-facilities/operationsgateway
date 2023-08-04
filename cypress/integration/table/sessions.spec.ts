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
  afterEach(() => {
    cy.clearMocks();
  });
  it('sends a posts a request when a user session is created', () => {
    cy.visit('/');

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
});
