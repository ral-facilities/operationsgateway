import { format } from 'date-fns';

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

    // remove second @getRecords once we query channels properly
    cy.visit('/').wait(['@getRecords', '@getRecords', '@getRecordCount']);
  });

  it('searches by date-time', () => {
    cy.get('input[aria-label="from, date-time input"]').type(
      '2022-01-01 00:00:00'
    );
    cy.get('input[aria-label="to, date-time input"]').type(
      '2022-01-02 00:00:00'
    );

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
      expect(gte).equal('2022-01-01+00:00:00');
      expect(lte).equal('2022-01-02+00:00:00');
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
      expect(gte).equal('2022-01-01+00:00:00');
      expect(lte).equal('2022-01-02+00:00:00');
    });
  });

  describe('searches by relative timeframe', () => {
    it('last 10 minutes', () => {
      cy.get('div[aria-label="open timeframe search box"]').click();
      cy.contains('Last 10 mins').click();

      const expectedToDate = new Date();
      const expectedFromDate = new Date(expectedToDate.toString()).setMinutes(
        expectedToDate.getMinutes() - 10
      );
      const expectedToDateString = format(expectedToDate, 'yyyy-MM-dd+HH:mm');
      const expectedFromDateString = format(
        expectedFromDate,
        'yyyy-MM-dd+HH:mm'
      );

      cy.contains('Search').click();

      cy.wait('@getRecords').should(({ request }) => {
        expect(request.url).to.contain('conditions=');
        const paramMap: Map<string, string> = getParamsFromUrl(request.url);
        const conditionsMap = getConditionsFromParams(paramMap);
        expect(conditionsMap.length).equal(1);

        const condition = conditionsMap[0];
        const timestampRange = condition['metadata.timestamp'];

        // Sometimes the expected and actual date are received one second apart from each other
        // To account for this, we'll just check it's close enough by verifying as far as the minute
        // So we cut off the seconds from the value
        // Could still technically fail but the chance is now much lower
        const gte: string = timestampRange['$gte'].slice(0, -3);
        const lte: string = timestampRange['$lte'].slice(0, -3);
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

        // Remove seconds from timestamps
        const gte: string = timestampRange['$gte'].slice(0, -3);
        const lte: string = timestampRange['$lte'].slice(0, -3);
        expect(gte).equal(expectedFromDateString);
        expect(lte).equal(expectedToDateString);
      });
    });

    it('last 24 hours', () => {
      cy.get('div[aria-label="open timeframe search box"]').click();
      cy.contains('Last 24 hours').click();

      const expectedToDate = new Date();
      const expectedFromDate = new Date(expectedToDate.toString()).setHours(
        expectedToDate.getHours() - 24
      );
      const expectedToDateString = format(expectedToDate, 'yyyy-MM-dd+HH:mm');
      const expectedFromDateString = format(
        expectedFromDate,
        'yyyy-MM-dd+HH:mm'
      );

      cy.contains('Search').click();

      cy.wait('@getRecords').should(({ request }) => {
        expect(request.url).to.contain('conditions=');
        const paramMap: Map<string, string> = getParamsFromUrl(request.url);
        const conditionsMap = getConditionsFromParams(paramMap);
        expect(conditionsMap.length).equal(1);

        const condition = conditionsMap[0];
        const timestampRange = condition['metadata.timestamp'];

        // Remove seconds from timestamps
        const gte: string = timestampRange['$gte'].slice(0, -3);
        const lte: string = timestampRange['$lte'].slice(0, -3);
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

        // Remove seconds from timestamps
        const gte: string = timestampRange['$gte'].slice(0, -3);
        const lte: string = timestampRange['$lte'].slice(0, -3);
        expect(gte).equal(expectedFromDateString);
        expect(lte).equal(expectedToDateString);
      });
    });

    it('last 7 days', () => {
      cy.get('div[aria-label="open timeframe search box"]').click();
      cy.contains('Last 7 days').click();

      const expectedToDate = new Date();
      const expectedFromDate = new Date(expectedToDate.toString()).setDate(
        expectedToDate.getDate() - 7
      );
      const expectedToDateString = format(expectedToDate, 'yyyy-MM-dd+HH:mm');
      const expectedFromDateString = format(
        expectedFromDate,
        'yyyy-MM-dd+HH:mm'
      );

      cy.contains('Search').click();

      cy.wait('@getRecords').should(({ request }) => {
        expect(request.url).to.contain('conditions=');
        const paramMap: Map<string, string> = getParamsFromUrl(request.url);
        const conditionsMap = getConditionsFromParams(paramMap);
        expect(conditionsMap.length).equal(1);

        const condition = conditionsMap[0];
        const timestampRange = condition['metadata.timestamp'];

        // Remove seconds from timestamps
        const gte: string = timestampRange['$gte'].slice(0, -3);
        const lte: string = timestampRange['$lte'].slice(0, -3);
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

        // Remove seconds from timestamps
        const gte: string = timestampRange['$gte'].slice(0, -3);
        const lte: string = timestampRange['$lte'].slice(0, -3);
        expect(gte).equal(expectedFromDateString);
        expect(lte).equal(expectedToDateString);
      });
    });
  });

  describe('searches by custom timeframe', () => {
    it('last 5 minutes', () => {
      cy.get('div[aria-label="open timeframe search box"]').click();
      cy.get('input[name="timeframe"]').type('5');
      cy.contains('Mins').click();

      const expectedToDate = new Date();
      const expectedFromDate = new Date(expectedToDate.toString()).setMinutes(
        expectedToDate.getMinutes() - 5
      );
      const expectedToDateString = format(expectedToDate, 'yyyy-MM-dd+HH:mm');
      const expectedFromDateString = format(
        expectedFromDate,
        'yyyy-MM-dd+HH:mm'
      );

      cy.contains('Search').click();

      cy.wait('@getRecords').should(({ request }) => {
        expect(request.url).to.contain('conditions=');
        const paramMap: Map<string, string> = getParamsFromUrl(request.url);
        const conditionsMap = getConditionsFromParams(paramMap);
        expect(conditionsMap.length).equal(1);

        const condition = conditionsMap[0];
        const timestampRange = condition['metadata.timestamp'];

        // Remove seconds from timestamps
        const gte: string = timestampRange['$gte'].slice(0, -3);
        const lte: string = timestampRange['$lte'].slice(0, -3);
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

        // Remove seconds from timestamps
        const gte: string = timestampRange['$gte'].slice(0, -3);
        const lte: string = timestampRange['$lte'].slice(0, -3);
        expect(gte).equal(expectedFromDateString);
        expect(lte).equal(expectedToDateString);
      });
    });

    it('last 5 hours', () => {
      cy.get('div[aria-label="open timeframe search box"]').click();
      cy.get('input[name="timeframe"]').type('5');
      cy.contains('Hours').click();

      const expectedToDate = new Date();
      const expectedFromDate = new Date(expectedToDate.toString()).setHours(
        expectedToDate.getHours() - 5
      );
      const expectedToDateString = format(expectedToDate, 'yyyy-MM-dd+HH:mm');
      const expectedFromDateString = format(
        expectedFromDate,
        'yyyy-MM-dd+HH:mm'
      );

      cy.contains('Search').click();

      cy.wait('@getRecords').should(({ request }) => {
        expect(request.url).to.contain('conditions=');
        const paramMap: Map<string, string> = getParamsFromUrl(request.url);
        const conditionsMap = getConditionsFromParams(paramMap);
        expect(conditionsMap.length).equal(1);

        const condition = conditionsMap[0];
        const timestampRange = condition['metadata.timestamp'];

        // Remove seconds from timestamps
        const gte: string = timestampRange['$gte'].slice(0, -3);
        const lte: string = timestampRange['$lte'].slice(0, -3);
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

        // Remove seconds from timestamps
        const gte: string = timestampRange['$gte'].slice(0, -3);
        const lte: string = timestampRange['$lte'].slice(0, -3);
        expect(gte).equal(expectedFromDateString);
        expect(lte).equal(expectedToDateString);
      });
    });

    it('last 5 days', () => {
      cy.get('div[aria-label="open timeframe search box"]').click();
      cy.get('input[name="timeframe"]').type('5');
      cy.contains('Days').click();

      const expectedToDate = new Date();
      const expectedFromDate = new Date(expectedToDate.toString()).setDate(
        expectedToDate.getDate() - 5
      );
      const expectedToDateString = format(expectedToDate, 'yyyy-MM-dd+HH:mm');
      const expectedFromDateString = format(
        expectedFromDate,
        'yyyy-MM-dd+HH:mm'
      );

      cy.contains('Search').click();

      cy.wait('@getRecords').should(({ request }) => {
        expect(request.url).to.contain('conditions=');
        const paramMap: Map<string, string> = getParamsFromUrl(request.url);
        const conditionsMap = getConditionsFromParams(paramMap);
        expect(conditionsMap.length).equal(1);

        const condition = conditionsMap[0];
        const timestampRange = condition['metadata.timestamp'];

        // Remove seconds from timestamps
        const gte: string = timestampRange['$gte'].slice(0, -3);
        const lte: string = timestampRange['$lte'].slice(0, -3);
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

        // Remove seconds from timestamps
        const gte: string = timestampRange['$gte'].slice(0, -3);
        const lte: string = timestampRange['$lte'].slice(0, -3);
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

    cy.wait('@getRecords').should(({ request }) => {
      expect(request.url).to.contain('conditions=');
      const paramMap: Map<string, string> = getParamsFromUrl(request.url);
      const conditionsMap = getConditionsFromParams(paramMap);
      expect(conditionsMap.length).equal(2);

      const timestampCondition = conditionsMap[0];
      const timestampRange = timestampCondition['metadata.timestamp'];
      const timestampGte: string = timestampRange['$gte'];
      const timestampLte: string = timestampRange['$lte'];
      expect(timestampGte).equal('2022-01-01+00:00:00');
      expect(timestampLte).equal('2022-01-02+00:00:00');

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
      expect(timestampGte).equal('2022-01-01+00:00:00');
      expect(timestampLte).equal('2022-01-02+00:00:00');

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
});
