import { formatDateTimeForApi } from '../../support/util';

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

function getConditionsFromParams(params: Map<string, string>) {
  const conditionsString = params.get('conditions');
  if (!conditionsString) return [];

  // Conditions are unified under one $and element in an array
  const conditionsMap = JSON.parse(conditionsString).$and;
  return conditionsMap;
}

describe('Search', () => {
  describe('no record limits', () => {
    beforeEach(() => {
      // We need no limit set on the records to ensure we don't get warning tooltips for these tests to pass
      let settings = Object.create(null);
      cy.request('operationsgateway-settings.json').then((response) => {
        settings = response.body;
      });
      cy.intercept('operationsgateway-settings.json', (req) => {
        req.reply({
          statusCode: 200,
          body: {
            ...settings,
            recordLimitWarning: -1,
          },
        });
      }).as('getSettings');

      cy.visit('/').wait(['@getSettings']);

      cy.findByRole('progressbar').should('be.visible');
      cy.findByRole('progressbar').should('not.exist');
    });

    afterEach(() => {
      cy.clearMocks();
    });

    it('searches by date-time', () => {
      cy.findByLabelText('from, date-time input').type('2022-01-01 00:00');
      cy.findByLabelText('to, date-time input').type('2022-01-02 00:00');

      cy.startSnoopingBrowserMockedRequest();

      cy.contains('Search').click();

      // wait for search to initiate and finish
      cy.findByRole('progressbar').should('be.visible');
      cy.findByRole('progressbar').should('not.exist');

      cy.findBrowserMockedRequests({ method: 'GET', url: '/records' }).should(
        (patchRequests) => {
          expect(patchRequests.length).equal(1);
          const request = patchRequests[0];

          expect(request.url.toString()).to.contain('conditions=');
          const paramMap: Map<string, string> = getParamsFromUrl(
            request.url.toString()
          );
          const conditionsMap = getConditionsFromParams(paramMap);
          expect(conditionsMap.length).equal(1);

          const timestampCondition = conditionsMap[0];
          const timestampRange = timestampCondition['metadata.timestamp'];
          const timestampGte: string = timestampRange['$gte'];
          const timestampLte: string = timestampRange['$lte'];
          expect(timestampGte).equal('2022-01-01T00:00:00');
          expect(timestampLte).equal('2022-01-02T00:00:59');
        }
      );

      cy.findBrowserMockedRequests({
        method: 'GET',
        url: '/records/count',
      }).should((patchRequests) => {
        expect(patchRequests.length).equal(1);
        const request = patchRequests[0];

        expect(request.url.toString()).to.contain('conditions=');
        const paramMap: Map<string, string> = getParamsFromUrl(
          request.url.toString()
        );
        const conditionsMap = getConditionsFromParams(paramMap);
        expect(conditionsMap.length).equal(1);

        const timestampCondition = conditionsMap[0];
        const timestampRange = timestampCondition['metadata.timestamp'];
        const timestampGte: string = timestampRange['$gte'];
        const timestampLte: string = timestampRange['$lte'];
        expect(timestampGte).equal('2022-01-01T00:00:00');
        expect(timestampLte).equal('2022-01-02T00:00:59');
      });
    });

    describe('searches by relative timeframe', () => {
      beforeEach(() => {
        cy.clock(new Date('1970-01-08 01:00'), ['Date']);
      });

      it('last 10 minutes', () => {
        cy.findByLabelText('open timeframe search box').click();
        cy.contains('Last 10 mins').click();

        const expectedToDate = new Date('1970-01-08 01:00:59');
        const expectedFromDate = new Date('1970-01-08 00:50:00');
        const expectedToDateString = formatDateTimeForApi(expectedToDate);
        const expectedFromDateString = formatDateTimeForApi(expectedFromDate);

        cy.startSnoopingBrowserMockedRequest();

        cy.contains('Search').click();

        // wait for search to initiate and finish
        cy.findByRole('progressbar').should('be.visible');
        cy.findByRole('progressbar').should('not.exist');

        cy.findBrowserMockedRequests({ method: 'GET', url: '/records' }).should(
          (patchRequests) => {
            expect(patchRequests.length).equal(1);
            const request = patchRequests[0];

            expect(request.url.toString()).to.contain('conditions=');
            const paramMap: Map<string, string> = getParamsFromUrl(
              request.url.toString()
            );
            const conditionsMap = getConditionsFromParams(paramMap);
            expect(conditionsMap.length).equal(1);

            const condition = conditionsMap[0];
            const timestampRange = condition['metadata.timestamp'];

            const gte: string = timestampRange['$gte'];
            const lte: string = timestampRange['$lte'];
            expect(gte).equal(expectedFromDateString);
            expect(lte).equal(expectedToDateString);
          }
        );

        cy.findBrowserMockedRequests({
          method: 'GET',
          url: '/records/count',
        }).should((patchRequests) => {
          expect(patchRequests.length).equal(1);
          const request = patchRequests[0];

          expect(request.url.toString()).to.contain('conditions=');
          const paramMap: Map<string, string> = getParamsFromUrl(
            request.url.toString()
          );
          const conditionsMap = getConditionsFromParams(paramMap);
          expect(conditionsMap.length).equal(1);

          const condition = conditionsMap[0];
          const timestampRange = condition['metadata.timestamp'];

          const gte: string = timestampRange['$gte'];
          const lte: string = timestampRange['$lte'];
          expect(gte).equal(expectedFromDateString);
          expect(lte).equal(expectedToDateString);
        });
      });

      it('last 24 hours', () => {
        cy.findByLabelText('open timeframe search box').click();
        cy.contains('Last 24 hours').click();

        const expectedToDate = new Date('1970-01-08 01:00:59');
        const expectedFromDate = new Date('1970-01-07 01:00:00');
        const expectedToDateString = formatDateTimeForApi(expectedToDate);
        const expectedFromDateString = formatDateTimeForApi(expectedFromDate);

        cy.startSnoopingBrowserMockedRequest();

        cy.contains('Search').click();

        // wait for search to initiate and finish
        cy.findByRole('progressbar').should('be.visible');
        cy.findByRole('progressbar').should('not.exist');

        cy.findBrowserMockedRequests({ method: 'GET', url: '/records' }).should(
          (patchRequests) => {
            expect(patchRequests.length).equal(1);
            const request = patchRequests[0];

            expect(request.url.toString()).to.contain('conditions=');
            const paramMap: Map<string, string> = getParamsFromUrl(
              request.url.toString()
            );
            const conditionsMap = getConditionsFromParams(paramMap);
            expect(conditionsMap.length).equal(1);

            const condition = conditionsMap[0];
            const timestampRange = condition['metadata.timestamp'];

            const gte: string = timestampRange['$gte'];
            const lte: string = timestampRange['$lte'];
            expect(gte).equal(expectedFromDateString);
            expect(lte).equal(expectedToDateString);
          }
        );

        cy.findBrowserMockedRequests({
          method: 'GET',
          url: '/records/count',
        }).should((patchRequests) => {
          expect(patchRequests.length).equal(1);
          const request = patchRequests[0];

          expect(request.url.toString()).to.contain('conditions=');
          const paramMap: Map<string, string> = getParamsFromUrl(
            request.url.toString()
          );
          const conditionsMap = getConditionsFromParams(paramMap);
          expect(conditionsMap.length).equal(1);

          const condition = conditionsMap[0];
          const timestampRange = condition['metadata.timestamp'];

          const gte: string = timestampRange['$gte'];
          const lte: string = timestampRange['$lte'];
          expect(gte).equal(expectedFromDateString);
          expect(lte).equal(expectedToDateString);
        });
      });

      it('last 7 days', () => {
        cy.findByLabelText('open timeframe search box').click();
        cy.contains('Last 7 days').click();

        const expectedToDate = new Date('1970-01-08 01:00:59');
        const expectedFromDate = new Date('1970-01-01 01:00:00');
        const expectedToDateString = formatDateTimeForApi(expectedToDate);
        const expectedFromDateString = formatDateTimeForApi(expectedFromDate);

        cy.startSnoopingBrowserMockedRequest();

        cy.contains('Search').click();

        // wait for search to initiate and finish
        cy.findByRole('progressbar').should('be.visible');
        cy.findByRole('progressbar').should('not.exist');

        cy.findBrowserMockedRequests({ method: 'GET', url: '/records' }).should(
          (patchRequests) => {
            expect(patchRequests.length).equal(1);
            const request = patchRequests[0];

            expect(request.url.toString()).to.contain('conditions=');
            const paramMap: Map<string, string> = getParamsFromUrl(
              request.url.toString()
            );
            const conditionsMap = getConditionsFromParams(paramMap);
            expect(conditionsMap.length).equal(1);

            const condition = conditionsMap[0];
            const timestampRange = condition['metadata.timestamp'];

            const gte: string = timestampRange['$gte'];
            const lte: string = timestampRange['$lte'];
            expect(gte).equal(expectedFromDateString);
            expect(lte).equal(expectedToDateString);
          }
        );

        cy.findBrowserMockedRequests({
          method: 'GET',
          url: '/records/count',
        }).should((patchRequests) => {
          expect(patchRequests.length).equal(1);
          const request = patchRequests[0];

          expect(request.url.toString()).to.contain('conditions=');
          const paramMap: Map<string, string> = getParamsFromUrl(
            request.url.toString()
          );
          const conditionsMap = getConditionsFromParams(paramMap);
          expect(conditionsMap.length).equal(1);

          const condition = conditionsMap[0];
          const timestampRange = condition['metadata.timestamp'];

          const gte: string = timestampRange['$gte'];
          const lte: string = timestampRange['$lte'];
          expect(gte).equal(expectedFromDateString);
          expect(lte).equal(expectedToDateString);
        });
      });

      it('refreshes datetime stamps and launches search if timeframe is set and refresh button clicked', () => {
        // Set a relative timestamp and verify the initial seach is correct
        cy.findByLabelText('open timeframe search box').click();
        cy.contains('Last 10 mins').click();

        const expectedToDate = new Date('1970-01-08 01:00:59');
        const expectedFromDate = new Date('1970-01-08 00:50:00');
        const expectedToDateString = formatDateTimeForApi(expectedToDate);
        const expectedFromDateString = formatDateTimeForApi(expectedFromDate);

        cy.startSnoopingBrowserMockedRequest();

        cy.contains('Search').click();

        // wait for search to initiate and finish
        cy.findByRole('progressbar').should('be.visible');
        cy.findByRole('progressbar').should('not.exist');

        cy.findBrowserMockedRequests({ method: 'GET', url: '/records' }).should(
          (patchRequests) => {
            expect(patchRequests.length).equal(1);
            const request = patchRequests[0];

            expect(request.url.toString()).to.contain('conditions=');
            const paramMap: Map<string, string> = getParamsFromUrl(
              request.url.toString()
            );
            const conditionsMap = getConditionsFromParams(paramMap);
            expect(conditionsMap.length).equal(1);

            const condition = conditionsMap[0];
            const timestampRange = condition['metadata.timestamp'];

            const gte: string = timestampRange['$gte'];
            const lte: string = timestampRange['$lte'];
            expect(gte).equal(expectedFromDateString);
            expect(lte).equal(expectedToDateString);
          }
        );

        cy.clearMocks();

        // Advance time forward a minute
        cy.tick(60000);

        cy.findByLabelText('Refresh data').click();

        // wait for search to initiate and finish
        cy.findByRole('progressbar').should('be.visible');
        cy.findByRole('progressbar').should('not.exist');

        const newExpectedToDate = new Date('1970-01-08 01:01:59');
        const newExpectedFromDate = new Date('1970-01-08 00:51:00');
        const newExpectedToDateString = formatDateTimeForApi(newExpectedToDate);
        const newExpectedFromDateString =
          formatDateTimeForApi(newExpectedFromDate);
        cy.findBrowserMockedRequests({ method: 'GET', url: '/records' }).should(
          (patchRequests) => {
            expect(patchRequests.length).equal(1);
            const request = patchRequests[0];

            expect(request.url.toString()).to.contain('conditions=');
            const paramMap: Map<string, string> = getParamsFromUrl(
              request.url.toString()
            );
            const conditionsMap = getConditionsFromParams(paramMap);
            expect(conditionsMap.length).equal(1);

            const condition = conditionsMap[0];
            const timestampRange = condition['metadata.timestamp'];

            const gte: string = timestampRange['$gte'];
            const lte: string = timestampRange['$lte'];

            // Check that the new datetime stamps have each moved forward a minute
            expect(gte).equal(newExpectedFromDateString);
            expect(lte).equal(newExpectedToDateString);
          }
        );
      });
    });

    describe('searches by custom timeframe', () => {
      beforeEach(() => {
        cy.clock(new Date('1970-01-08 01:00'), ['Date']);
      });

      it('last 5 minutes', () => {
        cy.findByLabelText('open timeframe search box').click();
        cy.findByRole('spinbutton', { name: 'Timeframe' }).type('5');
        cy.contains('Mins').click();

        const expectedToDate = new Date('1970-01-08 01:00:59');
        const expectedFromDate = new Date('1970-01-08 00:55:00');
        const expectedToDateString = formatDateTimeForApi(expectedToDate);
        const expectedFromDateString = formatDateTimeForApi(expectedFromDate);

        cy.startSnoopingBrowserMockedRequest();

        cy.contains('Search').click();

        // wait for search to initiate and finish
        cy.findByRole('progressbar').should('be.visible');
        cy.findByRole('progressbar').should('not.exist');

        cy.findBrowserMockedRequests({ method: 'GET', url: '/records' }).should(
          (patchRequests) => {
            expect(patchRequests.length).equal(1);
            const request = patchRequests[0];

            expect(request.url.toString()).to.contain('conditions=');
            const paramMap: Map<string, string> = getParamsFromUrl(
              request.url.toString()
            );
            const conditionsMap = getConditionsFromParams(paramMap);
            expect(conditionsMap.length).equal(1);

            const condition = conditionsMap[0];
            const timestampRange = condition['metadata.timestamp'];

            const gte: string = timestampRange['$gte'];
            const lte: string = timestampRange['$lte'];
            expect(gte).equal(expectedFromDateString);
            expect(lte).equal(expectedToDateString);
          }
        );

        cy.findBrowserMockedRequests({
          method: 'GET',
          url: '/records/count',
        }).should((patchRequests) => {
          expect(patchRequests.length).equal(1);
          const request = patchRequests[0];

          expect(request.url.toString()).to.contain('conditions=');
          const paramMap: Map<string, string> = getParamsFromUrl(
            request.url.toString()
          );
          const conditionsMap = getConditionsFromParams(paramMap);
          expect(conditionsMap.length).equal(1);

          const condition = conditionsMap[0];
          const timestampRange = condition['metadata.timestamp'];

          const gte: string = timestampRange['$gte'];
          const lte: string = timestampRange['$lte'];
          expect(gte).equal(expectedFromDateString);
          expect(lte).equal(expectedToDateString);
        });
      });

      it('last 5 hours', () => {
        cy.findByLabelText('open timeframe search box').click();
        cy.findByRole('spinbutton', { name: 'Timeframe' }).type('5');
        cy.contains('Hours').click();

        const expectedToDate = new Date('1970-01-08 01:00:59');
        const expectedFromDate = new Date('1970-01-07 20:00:00');
        const expectedToDateString = formatDateTimeForApi(expectedToDate);
        const expectedFromDateString = formatDateTimeForApi(expectedFromDate);

        cy.startSnoopingBrowserMockedRequest();

        cy.contains('Search').click();

        // wait for search to initiate and finish
        cy.findByRole('progressbar').should('be.visible');
        cy.findByRole('progressbar').should('not.exist');

        cy.findBrowserMockedRequests({ method: 'GET', url: '/records' }).should(
          (patchRequests) => {
            expect(patchRequests.length).equal(1);
            const request = patchRequests[0];

            expect(request.url.toString()).to.contain('conditions=');
            const paramMap: Map<string, string> = getParamsFromUrl(
              request.url.toString()
            );
            const conditionsMap = getConditionsFromParams(paramMap);
            expect(conditionsMap.length).equal(1);

            const condition = conditionsMap[0];
            const timestampRange = condition['metadata.timestamp'];

            const gte: string = timestampRange['$gte'];
            const lte: string = timestampRange['$lte'];
            expect(gte).equal(expectedFromDateString);
            expect(lte).equal(expectedToDateString);
          }
        );

        cy.findBrowserMockedRequests({
          method: 'GET',
          url: '/records/count',
        }).should((patchRequests) => {
          expect(patchRequests.length).equal(1);
          const request = patchRequests[0];

          expect(request.url.toString()).to.contain('conditions=');
          const paramMap: Map<string, string> = getParamsFromUrl(
            request.url.toString()
          );
          const conditionsMap = getConditionsFromParams(paramMap);
          expect(conditionsMap.length).equal(1);

          const condition = conditionsMap[0];
          const timestampRange = condition['metadata.timestamp'];

          const gte: string = timestampRange['$gte'];
          const lte: string = timestampRange['$lte'];
          expect(gte).equal(expectedFromDateString);
          expect(lte).equal(expectedToDateString);
        });
      });

      it('last 5 days', () => {
        cy.findByLabelText('open timeframe search box').click();
        cy.findByRole('spinbutton', { name: 'Timeframe' }).type('5');
        cy.contains('Days').click();

        const expectedToDate = new Date('1970-01-08 01:00:59');
        const expectedFromDate = new Date('1970-01-03 01:00:00');
        const expectedToDateString = formatDateTimeForApi(expectedToDate);
        const expectedFromDateString = formatDateTimeForApi(expectedFromDate);

        cy.startSnoopingBrowserMockedRequest();

        cy.contains('Search').click();

        // wait for search to initiate and finish
        cy.findByRole('progressbar').should('be.visible');
        cy.findByRole('progressbar').should('not.exist');

        cy.findBrowserMockedRequests({ method: 'GET', url: '/records' }).should(
          (patchRequests) => {
            expect(patchRequests.length).equal(1);
            const request = patchRequests[0];

            expect(request.url.toString()).to.contain('conditions=');
            const paramMap: Map<string, string> = getParamsFromUrl(
              request.url.toString()
            );
            const conditionsMap = getConditionsFromParams(paramMap);
            expect(conditionsMap.length).equal(1);

            const condition = conditionsMap[0];
            const timestampRange = condition['metadata.timestamp'];

            const gte: string = timestampRange['$gte'];
            const lte: string = timestampRange['$lte'];
            expect(gte).equal(expectedFromDateString);
            expect(lte).equal(expectedToDateString);
          }
        );

        cy.findBrowserMockedRequests({
          method: 'GET',
          url: '/records/count',
        }).should((patchRequests) => {
          expect(patchRequests.length).equal(1);
          const request = patchRequests[0];

          expect(request.url.toString()).to.contain('conditions=');
          const paramMap: Map<string, string> = getParamsFromUrl(
            request.url.toString()
          );
          const conditionsMap = getConditionsFromParams(paramMap);
          expect(conditionsMap.length).equal(1);

          const condition = conditionsMap[0];
          const timestampRange = condition['metadata.timestamp'];

          const gte: string = timestampRange['$gte'];
          const lte: string = timestampRange['$lte'];
          expect(gte).equal(expectedFromDateString);
          expect(lte).equal(expectedToDateString);
        });
      });
    });

    it('searches by shot number range', () => {
      cy.findByLabelText('open shot number search box').click();
      cy.findByRole('spinbutton', { name: 'Min' }).type('1');
      cy.findByRole('spinbutton', { name: 'Max' }).type('9');

      cy.startSnoopingBrowserMockedRequest();

      cy.contains('Search').click();

      // wait for search to initiate and finish
      cy.findByRole('progressbar').should('be.visible');
      cy.findByRole('progressbar').should('not.exist');

      cy.findBrowserMockedRequests({ method: 'GET', url: '/records' }).should(
        (patchRequests) => {
          expect(patchRequests.length).equal(1);
          const request = patchRequests[0];

          expect(request.url.toString()).to.contain('conditions=');
          const paramMap: Map<string, string> = getParamsFromUrl(
            request.url.toString()
          );
          const conditionsMap = getConditionsFromParams(paramMap);
          expect(conditionsMap.length).equal(1);

          const timestampCondition = conditionsMap[0];
          const timestampRange = timestampCondition['metadata.timestamp'];
          const timestampGte: string = timestampRange['$gte'];
          const timestampLte: string = timestampRange['$lte'];
          expect(timestampGte).equal('2022-01-01T00:00:00');
          expect(timestampLte).equal('2022-01-09T00:00:59');
        }
      );

      cy.findBrowserMockedRequests({
        method: 'GET',
        url: '/records/count',
      }).should((patchRequests) => {
        expect(patchRequests.length).equal(1);
        const request = patchRequests[0];

        expect(request.url.toString()).to.contain('conditions=');
        const paramMap: Map<string, string> = getParamsFromUrl(
          request.url.toString()
        );
        const conditionsMap = getConditionsFromParams(paramMap);
        expect(conditionsMap.length).equal(1);

        const timestampCondition = conditionsMap[0];
        const timestampRange = timestampCondition['metadata.timestamp'];
        const timestampGte: string = timestampRange['$gte'];
        const timestampLte: string = timestampRange['$lte'];
        expect(timestampGte).equal('2022-01-01T00:00:00');
        expect(timestampLte).equal('2022-01-09T00:00:59');
      });
    });

    it('should highlight boxes red if error in search params', () => {
      // Date-time box

      // From Date is above the To Date

      cy.findByLabelText('from, date-time input').type('2022-01-01_00:00');
      cy.findByLabelText('to, date-time input').type('2021-01-01_00:00');

      cy.findByLabelText('date-time search box').should(
        'have.css',
        'border-color',
        'rgb(214, 65, 65)' // shade of red
      );
      cy.findByRole('button', { name: 'Search' }).should(
        'have.attr',
        'disabled'
      );

      // Only the From date is defined

      cy.findByLabelText('from, date-time input').clear();
      cy.findByLabelText('to, date-time input').clear();

      cy.findByLabelText('from, date-time input').type('2022-01-01_00:00');

      cy.findByLabelText('date-time search box').should(
        'have.css',
        'border-color',
        'rgb(214, 65, 65)' // shade of red
      );
      cy.findByRole('button', { name: 'Search' }).should(
        'have.attr',
        'disabled'
      );

      // Only the To date is defined

      cy.findByLabelText('from, date-time input').clear();
      cy.findByLabelText('to, date-time input').clear();

      cy.findByLabelText('to, date-time input').type('2022-01-01_00:00');

      cy.findByLabelText('date-time search box').should(
        'have.css',
        'border-color',
        'rgb(214, 65, 65)' // shade of red
      );
      cy.findByRole('button', { name: 'Search' }).should(
        'have.attr',
        'disabled'
      );

      // Shot number box
      // Minimum shot number is above Max shot number
      cy.findByLabelText('open shot number search box').click();
      cy.findByRole('spinbutton', { name: 'Min' }).type('2');
      cy.findByRole('spinbutton', { name: 'Max' }).type('1');
      cy.findByLabelText('close shot number search box').click();
      cy.findByLabelText('open shot number search box').should(
        'have.css',
        'border-color',
        'rgb(214, 65, 65)' // shade of red
      );
      cy.findByRole('button', { name: 'Search' }).should(
        'have.attr',
        'disabled'
      );

      // only the minimum shot number is defined

      cy.findByLabelText('open shot number search box').click();
      cy.findByRole('spinbutton', { name: 'Min' }).clear();
      cy.findByRole('spinbutton', { name: 'Max' }).clear();
      cy.findByRole('spinbutton', { name: 'Min' }).type('2');
      cy.findByLabelText('close shot number search box').click();
      cy.findByLabelText('open shot number search box').should(
        'have.css',
        'border-color',
        'rgb(214, 65, 65)' // shade of red
      );
      cy.findByRole('button', { name: 'Search' }).should(
        'have.attr',
        'disabled'
      );

      // only the maximum shot number is defined

      cy.findByLabelText('open shot number search box').click();
      cy.findByRole('spinbutton', { name: 'Min' }).clear();
      cy.findByRole('spinbutton', { name: 'Max' }).clear();
      cy.findByRole('spinbutton', { name: 'Max' }).type('2');
      cy.findByLabelText('close shot number search box').click();
      cy.findByLabelText('open shot number search box').should(
        'have.css',
        'border-color',
        'rgb(214, 65, 65)' // shade of red
      );
      cy.findByRole('button', { name: 'Search' }).should(
        'have.attr',
        'disabled'
      );
    });

    it('select a experiment Id and it appears in the experiment box', () => {
      const expectedExperiment = {
        _id: '22110007-1',
        end_date: '2022-01-15T12:00:59',
        experiment_id: '22110007',
        part: 1,
        start_date: '2022-01-12T13:00:00',
      };

      // Shot number fields

      cy.findByLabelText('open shot number search box').click();
      cy.findByRole('spinbutton', { name: 'Min' }).type('1');
      cy.findByRole('spinbutton', { name: 'Max' }).type('9');
      cy.findByLabelText('close shot number search box').click();
      cy.findByLabelText('open shot number search box')
        .contains('1 to 9')
        .should('exist');

      // timeframe

      cy.findByLabelText('open timeframe search box').click();
      cy.findByRole('spinbutton', { name: 'Timeframe' }).type('5');
      cy.contains('Days').click();
      cy.findByLabelText('close timeframe search box').click();

      cy.findByLabelText('open timeframe search box')
        .contains('5 days')
        .should('exist');

      // experiment box
      cy.findByLabelText('open experiment search box')
        .contains('ID 22110007')
        .should('not.exist');

      // Checks that when a experiment id is selected it updates
      // the shot number, timeframe and experiment id

      cy.findByLabelText('open experiment search box').click();
      cy.findByRole('combobox').type('221');
      cy.findByRole('combobox').type('{downArrow}{enter}');
      cy.findByLabelText('close experiment search box').click();
      cy.findByLabelText('open experiment search box')
        .contains('ID 22110007')
        .should('exist');

      cy.findByLabelText('open shot number search box')
        .contains('1 to 9')
        .should('not.exist');

      cy.findByLabelText('open timeframe search box')
        .contains('5 days')
        .should('not.exist');

      cy.startSnoopingBrowserMockedRequest();

      cy.contains('Search').click();

      // wait for search to initiate and finish
      cy.findByRole('progressbar').should('be.visible');
      cy.findByRole('progressbar').should('not.exist');

      cy.findBrowserMockedRequests({ method: 'GET', url: '/records' }).should(
        (patchRequests) => {
          expect(patchRequests.length).equal(1);
          const request = patchRequests[0];

          expect(request.url.toString()).to.contain('conditions=');
          const paramMap: Map<string, string> = getParamsFromUrl(
            request.url.toString()
          );
          const conditionsMap = getConditionsFromParams(paramMap);
          expect(conditionsMap.length).equal(1);

          const timestampCondition = conditionsMap[0];

          const timestampRange = timestampCondition['metadata.timestamp'];
          const timestampGte: string = timestampRange['$gte'];
          const timestampLte: string = timestampRange['$lte'];
          expect(timestampGte).equal(expectedExperiment.start_date);
          expect(timestampLte).equal(expectedExperiment.end_date);
        }
      );

      cy.findBrowserMockedRequests({
        method: 'GET',
        url: '/records/count',
      }).should((patchRequests) => {
        expect(patchRequests.length).equal(1);
        const request = patchRequests[0];

        expect(request.url.toString()).to.contain('conditions=');
        const paramMap: Map<string, string> = getParamsFromUrl(
          request.url.toString()
        );
        const conditionsMap = getConditionsFromParams(paramMap);
        expect(conditionsMap.length).equal(1);

        const timestampCondition = conditionsMap[0];

        const timestampRange = timestampCondition['metadata.timestamp'];
        const timestampGte: string = timestampRange['$gte'];
        const timestampLte: string = timestampRange['$lte'];
        expect(timestampGte).equal(expectedExperiment.start_date);
        expect(timestampLte).equal(expectedExperiment.end_date);
      });
    });

    it('changes to and from dateTimes to use 0 seconds and 59 seconds respectively', () => {
      cy.findByLabelText('from, date-time input').type('2022-01-01_00:00');
      cy.findByLabelText('to, date-time input').type('2022-01-02_00:00');

      const expectedToDate = new Date('2022-01-02 00:00:59');
      const expectedFromDate = new Date('2022-01-01 00:00:00');
      const expectedToDateString = formatDateTimeForApi(expectedToDate);
      const expectedFromDateString = formatDateTimeForApi(expectedFromDate);

      cy.startSnoopingBrowserMockedRequest();

      cy.contains('Search').click();

      // wait for search to initiate and finish
      cy.findByRole('progressbar').should('be.visible');
      cy.findByRole('progressbar').should('not.exist');
      cy.findBrowserMockedRequests({ method: 'GET', url: '/records' }).should(
        (patchRequests) => {
          expect(patchRequests.length).equal(1);
          const request = patchRequests[0];

          expect(request.url.toString()).to.contain('conditions=');
          const paramMap: Map<string, string> = getParamsFromUrl(
            request.url.toString()
          );
          const conditionsMap = getConditionsFromParams(paramMap);
          expect(conditionsMap.length).equal(1);

          const condition = conditionsMap[0];
          const timestampRange = condition['metadata.timestamp'];
          const gte: string = timestampRange['$gte'];
          const lte: string = timestampRange['$lte'];
          expect(gte).equal(expectedFromDateString);
          expect(lte).equal(expectedToDateString);
        }
      );

      cy.findBrowserMockedRequests({
        method: 'GET',
        url: '/records/count',
      }).should((patchRequests) => {
        expect(patchRequests.length).equal(1);
        const request = patchRequests[0];

        expect(request.url.toString()).to.contain('conditions=');
        const paramMap: Map<string, string> = getParamsFromUrl(
          request.url.toString()
        );
        const conditionsMap = getConditionsFromParams(paramMap);
        expect(conditionsMap.length).equal(1);

        const condition = conditionsMap[0];
        const timestampRange = condition['metadata.timestamp'];
        const gte: string = timestampRange['$gte'];
        const lte: string = timestampRange['$lte'];
        expect(gte).equal(expectedFromDateString);
        expect(lte).equal(expectedToDateString);
      });
    });

    it('searches within an experiment timeframe without the experiment id clearing', () => {
      cy.findByLabelText('open experiment search box').click();
      cy.findByRole('combobox').type('221');
      cy.findByRole('combobox').type('{downArrow}{enter}');
      cy.findByLabelText('close experiment search box').click();
      cy.findByLabelText('open experiment search box')
        .contains('ID 22110007')
        .should('exist');

      cy.findByLabelText('from, date-time picker').click();
      cy.findByRole('dialog').contains(13).click();
      cy.findByLabelText('from, date-time picker').click();
      cy.findByLabelText('open experiment search box')
        .contains('ID 22110007')
        .should('exist');

      cy.findByLabelText('to, date-time picker').click();
      cy.findByRole('dialog').contains(14).click();
      cy.findByLabelText('to, date-time picker').click();
      cy.findByLabelText('open experiment search box')
        .contains('ID 22110007')
        .should('exist');
    });

    it('clears experiment id when it searches outside the given experiment id experiment timeframe', () => {
      cy.findByLabelText('open experiment search box').click();
      cy.findByRole('combobox').type('221');
      cy.findByRole('combobox').type('{downArrow}{enter}');
      cy.findByLabelText('close experiment search box').click();
      cy.findByLabelText('open experiment search box')
        .contains('ID 22110007')
        .should('exist');

      cy.findByLabelText('from, date-time picker').click();
      cy.findByRole('dialog').contains(11).click();
      cy.findByLabelText('from, date-time picker').click();

      cy.findByLabelText('open experiment search box')
        .contains('ID 22110007')
        .should('not.exist');

      cy.findByLabelText('open experiment search box').click();
      cy.findByRole('combobox').type('221');
      cy.findByRole('combobox').type('{downArrow}{enter}');
      cy.findByLabelText('close experiment search box').click();
      cy.findByLabelText('open experiment search box')
        .contains('ID 22110007')
        .should('exist');

      cy.findByLabelText('to, date-time picker').click();
      cy.findByRole('dialog').contains(16).click();
      cy.findByLabelText('to, date-time picker').click();

      cy.findByLabelText('open experiment search box')
        .contains('ID 22110007')
        .should('not.exist');
    });

    it('searches within an experiment shot number range without the experiment id clearing', () => {
      cy.findByLabelText('open experiment search box').click();
      cy.findByRole('combobox').type('221');
      cy.findByRole('combobox').type('{downArrow}{enter}');
      cy.findByLabelText('close experiment search box').click();
      cy.findByLabelText('open experiment search box')
        .contains('ID 22110007')
        .should('exist');

      cy.findByLabelText('open shot number search box').click();
      cy.findByRole('dialog')
        .findByRole('spinbutton', {
          name: 'Min',
        })
        .clear();
      cy.findByRole('dialog')
        .findByRole('spinbutton', {
          name: 'Min',
        })
        .type(14);
      cy.findByLabelText('close shot number search box').click();

      cy.findByLabelText('open experiment search box')
        .contains('ID 22110007')
        .should('exist');

      cy.findByLabelText('open shot number search box').click();
      cy.findByRole('dialog')
        .findByRole('spinbutton', {
          name: 'Max',
        })
        .clear();
      cy.findByRole('dialog')
        .findByRole('spinbutton', {
          name: 'Max',
        })
        .type(14);
      cy.findByLabelText('close shot number search box').click();

      cy.findByLabelText('open experiment search box')
        .contains('ID 22110007')
        .should('exist');
    });

    it('clears experiment id when it searches outside the given experiment id shot number range', () => {
      cy.findByLabelText('open experiment search box').click();
      cy.findByRole('combobox').type('221');
      cy.findByRole('combobox').type('{downArrow}{enter}');
      cy.findByLabelText('close experiment search box').click();
      cy.findByLabelText('open experiment search box')
        .contains('ID 22110007')
        .should('exist');

      cy.findByLabelText('open shot number search box').click();
      cy.findByRole('dialog')
        .findByRole('spinbutton', {
          name: 'Min',
        })
        .clear();
      cy.findByRole('dialog')
        .findByRole('spinbutton', {
          name: 'Min',
        })
        .type(12);
      cy.findByLabelText('close shot number search box').click();

      cy.findByLabelText('open experiment search box')
        .contains('ID 22110007')
        .should('not.exist');

      cy.findByLabelText('open experiment search box').click();
      cy.findByRole('combobox').type('221');
      cy.findByRole('combobox').type('{downArrow}{enter}');
      cy.findByLabelText('close experiment search box').click();
      cy.findByLabelText('open experiment search box')
        .contains('ID 22110007')
        .should('exist');

      cy.findByLabelText('open shot number search box').click();
      cy.findByRole('dialog')
        .findByRole('spinbutton', {
          name: 'Max',
        })
        .clear();
      cy.findByRole('dialog')
        .findByRole('spinbutton', {
          name: 'Max',
        })
        .type(16);
      cy.findByLabelText('close shot number search box').click();

      cy.findByLabelText('open experiment search box')
        .contains('ID 22110007')
        .should('not.exist');
    });

    it('can be hidden and shown', () => {
      cy.contains(/^Search$/).should('be.visible');

      cy.contains('Hide search').click();

      cy.contains(/^Search$/).should('not.be.visible');

      cy.contains('Show search').click();

      cy.contains(/^Search$/).should('be.visible');
    });
  });

  describe('with record limits', () => {
    beforeEach(() => {
      // We need a limit set on the records to ensure we get warning tooltips for these tests to pass
      let settings = Object.create(null);
      cy.request('operationsgateway-settings.json').then((response) => {
        settings = response.body;
      });
      cy.intercept('operationsgateway-settings.json', (req) => {
        req.reply({
          statusCode: 200,
          body: {
            ...settings,
            recordLimitWarning: 10,
          },
        });
      }).as('getSettings');

      cy.visit('/', {
        // need these to ensure Date picker media queries pass
        // ref: https://mui.com/x/react-date-pickers/getting-started/#testing-caveats
        onBeforeLoad: (win) => {
          cy.stub(win, 'matchMedia')
            .withArgs('(pointer: fine)')
            .returns({
              matches: true,
              addListener: () => {
                // no-op
              },
              removeListener: () => {
                // no-op
              },
            });
        },
      }).wait(['@getSettings']);
    });

    it('displays appropriate tooltips', () => {
      cy.findByLabelText('from, date-time input').type('2022-01-01_00:00');
      cy.findByLabelText('to, date-time input').type('2023-01-01_00:00');

      cy.startSnoopingBrowserMockedRequest();

      cy.contains('Search').click();
      // small wait for UI to be stable after count request is resolved
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(100);
      cy.contains('Search').trigger('mouseover');

      // Tooltip should be present when we first try the search
      cy.contains('Click Search again to continue');
      cy.contains('Search').click();

      // wait for search to initiate and finish
      cy.findByRole('progressbar').should('exist');
      cy.findByRole('progressbar').should('not.exist');

      cy.findBrowserMockedRequests({ method: 'GET', url: '/records' }).should(
        (patchRequests) => {
          expect(patchRequests.length).equal(1);
          const request = patchRequests[0];

          expect(request.url.toString()).to.contain('conditions=');
          const paramMap: Map<string, string> = getParamsFromUrl(
            request.url.toString()
          );
          const conditionsMap = getConditionsFromParams(paramMap);
          expect(conditionsMap.length).equal(1);

          const condition = conditionsMap[0];
          const timestampRange = condition['metadata.timestamp'];
          const gte: string = timestampRange['$gte'];
          expect(gte).equal('2022-01-01T00:00:00');
        }
      );

      cy.findBrowserMockedRequests({
        method: 'GET',
        url: '/records/count',
      }).should((patchRequests) => {
        expect(patchRequests.length).equal(1);
        const request = patchRequests[0];

        expect(request.url.toString()).to.contain('conditions=');
        const paramMap: Map<string, string> = getParamsFromUrl(
          request.url.toString()
        );
        const conditionsMap = getConditionsFromParams(paramMap);
        expect(conditionsMap.length).equal(1);

        const condition = conditionsMap[0];
        const timestampRange = condition['metadata.timestamp'];
        const gte: string = timestampRange['$gte'];
        expect(gte).equal('2022-01-01T00:00:00');
      });

      cy.clearMocks();

      // check that if a search drops below the limit the tooltip no longer displays
      cy.window().then((window) => {
        // Reference global instances set in "src/mocks/browser.js".
        const { worker, rest } = window.msw;

        worker.use(
          rest.get('/records/count', (req, res, ctx) => {
            return res.once(ctx.status(200), ctx.json(8)); //arbitrary number less than 10
          })
        );
      });

      // .clear doesn't work with datepickers in v6
      // cy.findByLabelText('from, date-time input').clear();
      cy.findByLabelText('from, date-time input').type('{ctrl+a}{backspace}');
      cy.findByLabelText('from, date-time input').type('2022-01-11_00:00');

      cy.contains('Search').click();
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(100);
      cy.contains('Search').trigger('mouseover');
      // Tooltip should not be present with this new search
      cy.contains('Click Search again to continue').should('not.exist');

      cy.clearMocks();

      // .clear doesn't work with datepickers in v6
      // cy.findByLabelText('from, date-time input').clear();
      cy.findByLabelText('from, date-time input').type('{ctrl+a}{backspace}');
      cy.findByLabelText('from, date-time input').type('2022-01-02_00:00');

      cy.contains('Search').click();
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(100);
      cy.contains('Search').trigger('mouseover');
      // Tooltip should be present with this new search
      cy.contains('Click Search again to continue');
      cy.contains('Search').click();

      // wait for search to initiate and finish
      cy.findByRole('progressbar').should('exist');
      cy.findByRole('progressbar').should('not.exist');

      cy.findBrowserMockedRequests({ method: 'GET', url: '/records' }).should(
        (patchRequests) => {
          expect(patchRequests.length).equal(1);
          const request = patchRequests[0];

          expect(request.url.toString()).to.contain('conditions=');
          const paramMap: Map<string, string> = getParamsFromUrl(
            request.url.toString()
          );
          const conditionsMap = getConditionsFromParams(paramMap);
          expect(conditionsMap.length).equal(1);

          const condition = conditionsMap[0];
          const timestampRange = condition['metadata.timestamp'];
          const gte: string = timestampRange['$gte'];
          expect(gte).equal('2022-01-02T00:00:00');
        }
      );

      cy.findBrowserMockedRequests({
        method: 'GET',
        url: '/records/count',
      }).should((patchRequests) => {
        expect(patchRequests.length).equal(1);
        const request = patchRequests[0];

        expect(request.url.toString()).to.contain('conditions=');
        const paramMap: Map<string, string> = getParamsFromUrl(
          request.url.toString()
        );
        const conditionsMap = getConditionsFromParams(paramMap);
        expect(conditionsMap.length).equal(1);

        const condition = conditionsMap[0];
        const timestampRange = condition['metadata.timestamp'];
        const gte: string = timestampRange['$gte'];
        expect(gte).equal('2022-01-02T00:00:00');
      });

      // .clear doesn't work with datepickers in v6
      // cy.findByLabelText('from, date-time input').clear();
      cy.findByLabelText('from, date-time input').type('{ctrl+a}{backspace}');
      cy.findByLabelText('from, date-time input').type('2022-01-01_00:00');

      cy.contains('Search').click();
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(100);
      cy.contains('Search').trigger('mouseover');

      // We have attempted the first search again
      // As the user already saw the tooltip for this search, it should not be present this time
      cy.contains('Click Search again to continue').should('not.exist');
    });
  });
});
