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
      cy.intercept('**/records**', (req) => {
        req.reply({
          statusCode: 200,
          fixture: 'records.json',
        });
      }).as('getRecords');

      cy.intercept('**/records/count**', (req) => {
        req.reply({ statusCode: 200, fixture: 'recordCount.json' });
      }).as('getRecordCount');

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

      // remove second @getRecords once we query channels properly
      cy.visit('/').wait([
        '@getSettings',
        '@getRecords',
        '@getRecords',
        '@getRecordCount',
      ]);
    });

    it('searches by date-time', () => {
      cy.get('input[aria-label="from, date-time input"]').type(
        '2022-01-01 00:00:00'
      );
      cy.get('input[aria-label="to, date-time input"]').type(
        '2022-01-02 00:00:00'
      );

      cy.contains('Search').click();
      cy.wait('@getRecordCount');

      cy.wait('@getRecords').should(({ request }) => {
        expect(request.url).to.contain('conditions=');
        const paramMap: Map<string, string> = getParamsFromUrl(request.url);
        const conditionsMap = getConditionsFromParams(paramMap);
        expect(conditionsMap.length).equal(1);

        const condition = conditionsMap[0];
        const timestampRange = condition['metadata.timestamp'];
        const gte: string = timestampRange['$gte'];
        const lte: string = timestampRange['$lte'];
        expect(gte).equal('2022-01-01T00:00:00');
        expect(lte).equal('2022-01-02T00:00:00');
      });

      cy.wait('@getRecordCount').should(({ request }) => {
        expect(request.url).to.contain('conditions=');
        const paramMap: Map<string, string> = getParamsFromUrl(request.url);
        const conditionsMap = getConditionsFromParams(paramMap);
        expect(conditionsMap.length).equal(1);

        const condition = conditionsMap[0];
        const timestampRange = condition['metadata.timestamp'];
        const gte: string = timestampRange['$gte'];
        const lte: string = timestampRange['$lte'];
        expect(gte).equal('2022-01-01T00:00:00');
        expect(lte).equal('2022-01-02T00:00:00');
      });
    });

    describe('searches by relative timeframe', () => {
      beforeEach(() => {
        cy.clock(new Date('1970-01-08 01:00:00'));
      });

      it('last 10 minutes', () => {
        cy.get('div[aria-label="open timeframe search box"]').click();
        cy.contains('Last 10 mins').click();

        const expectedToDate = new Date('1970-01-08 01:00:00');
        const expectedFromDate = new Date('1970-01-08 00:50:00');
        const expectedToDateString = formatDateTimeForApi(expectedToDate);
        const expectedFromDateString = formatDateTimeForApi(expectedFromDate);

        cy.contains('Search').click();
        cy.wait('@getRecordCount');

        cy.wait('@getRecords').should(({ request }) => {
          expect(request.url).to.contain('conditions=');
          const paramMap: Map<string, string> = getParamsFromUrl(request.url);
          const conditionsMap = getConditionsFromParams(paramMap);
          expect(conditionsMap.length).equal(1);

          const condition = conditionsMap[0];
          const timestampRange = condition['metadata.timestamp'];

          const gte: string = timestampRange['$gte'];
          const lte: string = timestampRange['$lte'];
          expect(gte).equal(expectedFromDateString);
          expect(lte).equal(expectedToDateString);
        });

        cy.wait('@getRecordCount').should(({ request }) => {
          expect(request.url).to.contain('conditions=');
          const paramMap: Map<string, string> = getParamsFromUrl(request.url);
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
        cy.get('div[aria-label="open timeframe search box"]').click();
        cy.contains('Last 24 hours').click();

        const expectedToDate = new Date('1970-01-08 01:00:00');
        const expectedFromDate = new Date('1970-01-07 01:00:00');
        const expectedToDateString = formatDateTimeForApi(expectedToDate);
        const expectedFromDateString = formatDateTimeForApi(expectedFromDate);

        cy.contains('Search').click();
        cy.wait('@getRecordCount');

        cy.wait('@getRecords').should(({ request }) => {
          expect(request.url).to.contain('conditions=');
          const paramMap: Map<string, string> = getParamsFromUrl(request.url);
          const conditionsMap = getConditionsFromParams(paramMap);
          expect(conditionsMap.length).equal(1);

          const condition = conditionsMap[0];
          const timestampRange = condition['metadata.timestamp'];

          const gte: string = timestampRange['$gte'];
          const lte: string = timestampRange['$lte'];
          expect(gte).equal(expectedFromDateString);
          expect(lte).equal(expectedToDateString);
        });

        cy.wait('@getRecordCount').should(({ request }) => {
          expect(request.url).to.contain('conditions=');
          const paramMap: Map<string, string> = getParamsFromUrl(request.url);
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
        cy.get('div[aria-label="open timeframe search box"]').click();
        cy.contains('Last 7 days').click();

        const expectedToDate = new Date('1970-01-08 01:00:00');
        const expectedFromDate = new Date('1970-01-01 01:00:00');
        const expectedToDateString = formatDateTimeForApi(expectedToDate);
        const expectedFromDateString = formatDateTimeForApi(expectedFromDate);

        cy.contains('Search').click();
        cy.wait('@getRecordCount');

        cy.wait('@getRecords').should(({ request }) => {
          expect(request.url).to.contain('conditions=');
          const paramMap: Map<string, string> = getParamsFromUrl(request.url);
          const conditionsMap = getConditionsFromParams(paramMap);
          expect(conditionsMap.length).equal(1);

          const condition = conditionsMap[0];
          const timestampRange = condition['metadata.timestamp'];

          const gte: string = timestampRange['$gte'];
          const lte: string = timestampRange['$lte'];
          expect(gte).equal(expectedFromDateString);
          expect(lte).equal(expectedToDateString);
        });

        cy.wait('@getRecordCount').should(({ request }) => {
          expect(request.url).to.contain('conditions=');
          const paramMap: Map<string, string> = getParamsFromUrl(request.url);
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
        cy.get('div[aria-label="open timeframe search box"]').click();
        cy.contains('Last 10 mins').click();

        const expectedToDate = new Date('1970-01-08 01:00:00');
        const expectedFromDate = new Date('1970-01-08 00:50:00');
        const expectedToDateString = formatDateTimeForApi(expectedToDate);
        const expectedFromDateString = formatDateTimeForApi(expectedFromDate);

        cy.contains('Search').click();

        cy.wait('@getRecords').should(({ request }) => {
          expect(request.url).to.contain('conditions=');
          const paramMap: Map<string, string> = getParamsFromUrl(request.url);
          const conditionsMap = getConditionsFromParams(paramMap);
          expect(conditionsMap.length).equal(1);

          const condition = conditionsMap[0];
          const timestampRange = condition['metadata.timestamp'];

          const gte: string = timestampRange['$gte'];
          const lte: string = timestampRange['$lte'];
          expect(gte).equal(expectedFromDateString);
          expect(lte).equal(expectedToDateString);
        });

        // Advance time forward a minute
        cy.tick(60000);

        cy.get('button[aria-label="Refresh data"]').click();
        const newExpectedToDate = new Date('1970-01-08 01:01:00');
        const newExpectedFromDate = new Date('1970-01-08 00:51:00');
        const newExpectedToDateString = formatDateTimeForApi(newExpectedToDate);
        const newExpectedFromDateString =
          formatDateTimeForApi(newExpectedFromDate);
        cy.wait('@getRecords').should(({ request }) => {
          expect(request.url).to.contain('conditions=');
          const paramMap: Map<string, string> = getParamsFromUrl(request.url);
          const conditionsMap = getConditionsFromParams(paramMap);
          expect(conditionsMap.length).equal(1);

          const condition = conditionsMap[0];
          const timestampRange = condition['metadata.timestamp'];

          const gte: string = timestampRange['$gte'];
          const lte: string = timestampRange['$lte'];

          // Check that the new datetime stamps have each moved forward a minute
          expect(gte).equal(newExpectedFromDateString);
          expect(lte).equal(newExpectedToDateString);
        });
      });
    });

    describe('searches by custom timeframe', () => {
      beforeEach(() => {
        cy.clock(new Date('1970-01-08 01:00:00'));
      });

      it('last 5 minutes', () => {
        cy.get('div[aria-label="open timeframe search box"]').click();
        cy.get('input[name="timeframe"]').type('5');
        cy.contains('Mins').click();

        const expectedToDate = new Date('1970-01-08 01:00:00');
        const expectedFromDate = new Date('1970-01-08 00:55:00');
        const expectedToDateString = formatDateTimeForApi(expectedToDate);
        const expectedFromDateString = formatDateTimeForApi(expectedFromDate);

        cy.contains('Search').click();
        cy.wait('@getRecordCount');

        cy.wait('@getRecords').should(({ request }) => {
          expect(request.url).to.contain('conditions=');
          const paramMap: Map<string, string> = getParamsFromUrl(request.url);
          const conditionsMap = getConditionsFromParams(paramMap);
          expect(conditionsMap.length).equal(1);

          const condition = conditionsMap[0];
          const timestampRange = condition['metadata.timestamp'];

          const gte: string = timestampRange['$gte'];
          const lte: string = timestampRange['$lte'];
          expect(gte).equal(expectedFromDateString);
          expect(lte).equal(expectedToDateString);
        });

        cy.wait('@getRecordCount').should(({ request }) => {
          expect(request.url).to.contain('conditions=');
          const paramMap: Map<string, string> = getParamsFromUrl(request.url);
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
        cy.get('div[aria-label="open timeframe search box"]').click();
        cy.get('input[name="timeframe"]').type('5');
        cy.contains('Hours').click();

        const expectedToDate = new Date('1970-01-08 01:00:00');
        const expectedFromDate = new Date('1970-01-07 20:00:00');
        const expectedToDateString = formatDateTimeForApi(expectedToDate);
        const expectedFromDateString = formatDateTimeForApi(expectedFromDate);

        cy.contains('Search').click();
        cy.wait('@getRecordCount');

        cy.wait('@getRecords').should(({ request }) => {
          expect(request.url).to.contain('conditions=');
          const paramMap: Map<string, string> = getParamsFromUrl(request.url);
          const conditionsMap = getConditionsFromParams(paramMap);
          expect(conditionsMap.length).equal(1);

          const condition = conditionsMap[0];
          const timestampRange = condition['metadata.timestamp'];

          const gte: string = timestampRange['$gte'];
          const lte: string = timestampRange['$lte'];
          expect(gte).equal(expectedFromDateString);
          expect(lte).equal(expectedToDateString);
        });

        cy.wait('@getRecordCount').should(({ request }) => {
          expect(request.url).to.contain('conditions=');
          const paramMap: Map<string, string> = getParamsFromUrl(request.url);
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
        cy.get('div[aria-label="open timeframe search box"]').click();
        cy.get('input[name="timeframe"]').type('5');
        cy.contains('Days').click();

        const expectedToDate = new Date('1970-01-08 01:00:00');
        const expectedFromDate = new Date('1970-01-03 01:00:00');
        const expectedToDateString = formatDateTimeForApi(expectedToDate);
        const expectedFromDateString = formatDateTimeForApi(expectedFromDate);

        cy.contains('Search').click();
        cy.wait('@getRecordCount');

        cy.wait('@getRecords').should(({ request }) => {
          expect(request.url).to.contain('conditions=');
          const paramMap: Map<string, string> = getParamsFromUrl(request.url);
          const conditionsMap = getConditionsFromParams(paramMap);
          expect(conditionsMap.length).equal(1);

          const condition = conditionsMap[0];
          const timestampRange = condition['metadata.timestamp'];

          const gte: string = timestampRange['$gte'];
          const lte: string = timestampRange['$lte'];
          expect(gte).equal(expectedFromDateString);
          expect(lte).equal(expectedToDateString);
        });

        cy.wait('@getRecordCount').should(({ request }) => {
          expect(request.url).to.contain('conditions=');
          const paramMap: Map<string, string> = getParamsFromUrl(request.url);
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
      cy.get('div[aria-label="open shot number search box"]').click();
      cy.get('input[name="shot number min"]').type('1');
      cy.get('input[name="shot number max"]').type('9');

      cy.contains('Search').click();
      cy.wait('@getRecordCount');

      cy.wait('@getRecords').should(({ request }) => {
        expect(request.url).to.contain('conditions=');
        const paramMap: Map<string, string> = getParamsFromUrl(request.url);
        const conditionsMap = getConditionsFromParams(paramMap);
        expect(conditionsMap.length).equal(1);

        const condition = conditionsMap[0];
        const shotnumRange = condition['metadata.shotnum'];
        const gte: string = shotnumRange['$gte'];
        const lte: string = shotnumRange['$lte'];
        expect(gte).equal(1);
        expect(lte).equal(9);
      });

      cy.wait('@getRecordCount').should(({ request }) => {
        expect(request.url).to.contain('conditions=');
        const paramMap: Map<string, string> = getParamsFromUrl(request.url);
        const conditionsMap = getConditionsFromParams(paramMap);
        expect(conditionsMap.length).equal(1);

        const condition = conditionsMap[0];
        const shotnumRange = condition['metadata.shotnum'];
        const gte: string = shotnumRange['$gte'];
        const lte: string = shotnumRange['$lte'];
        expect(gte).equal(1);
        expect(lte).equal(9);
      });
    });

    it('searches by multiple parameters', () => {
      // Date-time fields
      cy.get('input[aria-label="from, date-time input"]').type(
        '2022-01-01 00:00:00'
      );
      cy.get('input[aria-label="to, date-time input"]').type(
        '2022-01-02 00:00:00'
      );

      // Shot number fields
      cy.get('div[aria-label="open shot number search box"]').click();
      cy.get('input[name="shot number min"]').type('1');
      cy.get('input[name="shot number max"]').type('9');

      cy.contains('Search').click();
      cy.wait('@getRecordCount');

      cy.wait('@getRecords').should(({ request }) => {
        expect(request.url).to.contain('conditions=');
        const paramMap: Map<string, string> = getParamsFromUrl(request.url);
        const conditionsMap = getConditionsFromParams(paramMap);
        expect(conditionsMap.length).equal(2);

        const timestampCondition = conditionsMap[0];
        const timestampRange = timestampCondition['metadata.timestamp'];
        const timestampGte: string = timestampRange['$gte'];
        const timestampLte: string = timestampRange['$lte'];
        expect(timestampGte).equal('2022-01-01T00:00:00');
        expect(timestampLte).equal('2022-01-02T00:00:00');

        const shotnumCondition = conditionsMap[1];
        const shotnumRange = shotnumCondition['metadata.shotnum'];
        const shotnumGte: string = shotnumRange['$gte'];
        const shotnumLte: string = shotnumRange['$lte'];
        expect(shotnumGte).equal(1);
        expect(shotnumLte).equal(9);
      });

      cy.wait('@getRecordCount').should(({ request }) => {
        expect(request.url).to.contain('conditions=');
        const paramMap: Map<string, string> = getParamsFromUrl(request.url);
        const conditionsMap = getConditionsFromParams(paramMap);
        expect(conditionsMap.length).equal(2);

        const timestampCondition = conditionsMap[0];
        const timestampRange = timestampCondition['metadata.timestamp'];
        const timestampGte: string = timestampRange['$gte'];
        const timestampLte: string = timestampRange['$lte'];
        expect(timestampGte).equal('2022-01-01T00:00:00');
        expect(timestampLte).equal('2022-01-02T00:00:00');

        const shotnumCondition = conditionsMap[1];
        const shotnumRange = shotnumCondition['metadata.shotnum'];
        const shotnumGte: string = shotnumRange['$gte'];
        const shotnumLte: string = shotnumRange['$lte'];
        expect(shotnumGte).equal(1);
        expect(shotnumLte).equal(9);
      });
    });

    it('should highlight boxes red if error in search params', () => {
      // Date-time box
      cy.get('input[aria-label="from, date-time input"]').type(
        '2022-01-01 00:00:00'
      );
      cy.get('input[aria-label="to, date-time input"]').type(
        '2021-01-01 00:00:00'
      );
      cy.get('div[aria-label="date-time search box"]').should(
        'have.css',
        'border-color',
        'rgb(214, 65, 65)' // shade of red
      );

      // Shot Number box
      cy.get('div[aria-label="open shot number search box"]').click();
      cy.get('input[name="shot number min"]').type('2');
      cy.get('input[name="shot number max"]').type('1');
      cy.get('div[aria-label="close shot number search box"]').click();
      cy.get('div[aria-label="open shot number search box"]').should(
        'have.css',
        'border-color',
        'rgb(214, 65, 65)' // shade of red
      );
    });

    it('can be hidden and shown', () => {
      cy.contains(/^Search$/).should('be.visible');

      cy.contains('Hide search').click();

      cy.contains(/^Search$/).should('not.be.visible');

      cy.contains('Show search').click();

      cy.contains(/^Search$/).should('be.visible');
    });
  });

  describe.only('with record limits', () => {
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
            recordLimitWarning: 1,
          },
        });
      }).as('getSettings');

      // remove second @getRecords once we query channels properly
      cy.visit('/').wait([
        '@getSettings',
        '@getRecords',
        '@getRecords',
        '@getRecordCount',
      ]);
    });

    it('displays appropriate tooltips', () => {
      cy.get('input[aria-label="from, date-time input"]').type(
        '2022-01-01 00:00:00'
      );

      cy.contains('Search').click();
      cy.contains('Search').trigger('mouseover');

      // Tooltip should be present when we first try the search
      cy.contains('Click Search again to continue');
      cy.wait('@getRecordCount');
      cy.contains('Search').click();

      // Network request should have initiated
      cy.wait('@getRecords').should(({ request }) => {
        expect(request.url).to.contain('conditions=');
        const paramMap: Map<string, string> = getParamsFromUrl(request.url);
        const conditionsMap = getConditionsFromParams(paramMap);
        expect(conditionsMap.length).equal(1);

        const condition = conditionsMap[0];
        const timestampRange = condition['metadata.timestamp'];
        const gte: string = timestampRange['$gte'];
        expect(gte).equal('2022-01-01T00:00:00');
      });

      cy.wait('@getRecordCount').should(({ request }) => {
        expect(request.url).to.contain('conditions=');
        const paramMap: Map<string, string> = getParamsFromUrl(request.url);
        const conditionsMap = getConditionsFromParams(paramMap);
        expect(conditionsMap.length).equal(1);

        const condition = conditionsMap[0];
        const timestampRange = condition['metadata.timestamp'];
        const gte: string = timestampRange['$gte'];
        expect(gte).equal('2022-01-01T00:00:00');
      });

      cy.get('input[aria-label="from, date-time input"]').clear();
      cy.get('input[aria-label="from, date-time input"]').type(
        '2022-01-02 00:00:00'
      );

      cy.contains('Search').click();
      cy.contains('Search').trigger('mouseover');
      // Tooltip should be present with this new search
      cy.contains('Click Search again to continue');
      cy.contains('Search').click();

      // Network request should have initiated
      cy.wait('@getRecords').should(({ request }) => {
        expect(request.url).to.contain('conditions=');
        const paramMap: Map<string, string> = getParamsFromUrl(request.url);
        const conditionsMap = getConditionsFromParams(paramMap);
        expect(conditionsMap.length).equal(1);

        const condition = conditionsMap[0];
        const timestampRange = condition['metadata.timestamp'];
        const gte: string = timestampRange['$gte'];
        expect(gte).equal('2022-01-02T00:00:00');
      });

      cy.wait('@getRecordCount').should(({ request }) => {
        expect(request.url).to.contain('conditions=');
        const paramMap: Map<string, string> = getParamsFromUrl(request.url);
        const conditionsMap = getConditionsFromParams(paramMap);
        expect(conditionsMap.length).equal(1);

        const condition = conditionsMap[0];
        const timestampRange = condition['metadata.timestamp'];
        const gte: string = timestampRange['$gte'];
        expect(gte).equal('2022-01-02T00:00:00');
      });

      cy.get('input[aria-label="from, date-time input"]').clear();
      cy.get('input[aria-label="from, date-time input"]').type(
        '2022-01-01 00:00:00'
      );

      cy.contains('Search').click();
      cy.contains('Search').trigger('mouseover');

      // We have attempted the first search again
      // As the user already saw the tooltip for this search, it should not be present this time
      cy.contains('Click Search again to continue').should('not.exist');
    });
  });
});
