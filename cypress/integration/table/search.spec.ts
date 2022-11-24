import { format } from 'date-fns';

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
      // Correctly parse plus (+) symbols in URL by replacing them with %2B
      // This ensures an accurate comparison can be made
      const parsedUrl = request.url.replace(new RegExp(/\+/g), '%2B');
      expect(parsedUrl).to.contain(
        `conditions=${encodeURIComponent(
          '{"$and":[{"metadata.timestamp":{"$gte":"2022-01-01+00:00:00","$lte":"2022-01-02+00:00:00"}}]}'
        )}`
      );
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

      cy.contains('Search').click();

      cy.wait('@getRecords').should(({ request }) => {
        expect(request.url).to.contain('conditions=');
        // Correctly parse plus (+) symbols in URL by replacing them with %2B
        // This ensures an accurate comparison can be made
        const parsedUrl = request.url.replace(new RegExp(/\+/g), '%2B');
        expect(parsedUrl).to.contain(
          `conditions=${encodeURIComponent(
            `{"$and":[{"metadata.timestamp":{"$gte":"${format(
              expectedFromDate,
              'yyyy-MM-dd+HH:mm:ss'
            )}","$lte":"${format(expectedToDate, 'yyyy-MM-dd+HH:mm:ss')}"}}]}`
          )}`
        );
      });
    });

    it('last 24 hours', () => {
      cy.get('div[aria-label="open timeframe search box"]').click();
      cy.contains('Last 24 hours').click();

      const expectedToDate = new Date();
      const expectedFromDate = new Date(expectedToDate.toString()).setHours(
        expectedToDate.getHours() - 24
      );

      cy.contains('Search').click();

      cy.wait('@getRecords').should(({ request }) => {
        expect(request.url).to.contain('conditions=');
        // Correctly parse plus (+) symbols in URL by replacing them with %2B
        // This ensures an accurate comparison can be made
        const parsedUrl = request.url.replace(new RegExp(/\+/g), '%2B');
        expect(parsedUrl).to.contain(
          `conditions=${encodeURIComponent(
            `{"$and":[{"metadata.timestamp":{"$gte":"${format(
              expectedFromDate,
              'yyyy-MM-dd+HH:mm:ss'
            )}","$lte":"${format(expectedToDate, 'yyyy-MM-dd+HH:mm:ss')}"}}]}`
          )}`
        );
      });
    });

    it('last 7 days', () => {
      cy.get('div[aria-label="open timeframe search box"]').click();
      cy.contains('Last 7 days').click();

      const expectedToDate = new Date();
      const expectedFromDate = new Date(expectedToDate.toString()).setDate(
        expectedToDate.getDate() - 7
      );

      cy.contains('Search').click();

      cy.wait('@getRecords').should(({ request }) => {
        expect(request.url).to.contain('conditions=');
        // Correctly parse plus (+) symbols in URL by replacing them with %2B
        // This ensures an accurate comparison can be made
        const parsedUrl = request.url.replace(new RegExp(/\+/g), '%2B');
        expect(parsedUrl).to.contain(
          `conditions=${encodeURIComponent(
            `{"$and":[{"metadata.timestamp":{"$gte":"${format(
              expectedFromDate,
              'yyyy-MM-dd+HH:mm:ss'
            )}","$lte":"${format(expectedToDate, 'yyyy-MM-dd+HH:mm:ss')}"}}]}`
          )}`
        );
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

      cy.contains('Search').click();

      cy.wait('@getRecords').should(({ request }) => {
        expect(request.url).to.contain('conditions=');
        // Correctly parse plus (+) symbols in URL by replacing them with %2B
        // This ensures an accurate comparison can be made
        const parsedUrl = request.url.replace(new RegExp(/\+/g), '%2B');
        expect(parsedUrl).to.contain(
          `conditions=${encodeURIComponent(
            `{"$and":[{"metadata.timestamp":{"$gte":"${format(
              expectedFromDate,
              'yyyy-MM-dd+HH:mm:ss'
            )}","$lte":"${format(expectedToDate, 'yyyy-MM-dd+HH:mm:ss')}"}}]}`
          )}`
        );
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

      cy.contains('Search').click();

      cy.wait('@getRecords').should(({ request }) => {
        expect(request.url).to.contain('conditions=');
        // Correctly parse plus (+) symbols in URL by replacing them with %2B
        // This ensures an accurate comparison can be made
        const parsedUrl = request.url.replace(new RegExp(/\+/g), '%2B');
        expect(parsedUrl).to.contain(
          `conditions=${encodeURIComponent(
            `{"$and":[{"metadata.timestamp":{"$gte":"${format(
              expectedFromDate,
              'yyyy-MM-dd+HH:mm:ss'
            )}","$lte":"${format(expectedToDate, 'yyyy-MM-dd+HH:mm:ss')}"}}]}`
          )}`
        );
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

      cy.contains('Search').click();

      cy.wait('@getRecords').should(({ request }) => {
        expect(request.url).to.contain('conditions=');
        // Correctly parse plus (+) symbols in URL by replacing them with %2B
        // This ensures an accurate comparison can be made
        const parsedUrl = request.url.replace(new RegExp(/\+/g), '%2B');
        expect(parsedUrl).to.contain(
          `conditions=${encodeURIComponent(
            `{"$and":[{"metadata.timestamp":{"$gte":"${format(
              expectedFromDate,
              'yyyy-MM-dd+HH:mm:ss'
            )}","$lte":"${format(expectedToDate, 'yyyy-MM-dd+HH:mm:ss')}"}}]}`
          )}`
        );
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
      expect(request.url).to.contain(
        `conditions=${encodeURIComponent(
          '{"$and":[{"metadata.shotnum":{"$gte":1,"$lte":9}}]}'
        )}`
      );
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
      // Correctly parse plus (+) symbols in URL by replacing them with %2B
      // This ensures an accurate comparison can be made
      const parsedUrl = request.url.replace(new RegExp(/\+/g), '%2B');
      expect(parsedUrl).to.contain(
        `conditions=${encodeURIComponent(
          '{"$and":[{"metadata.timestamp":{"$gte":"2022-01-01+00:00:00","$lte":"2022-01-02+00:00:00"}},{"metadata.shotnum":{"$gte":1,"$lte":9}}]}'
        )}`
      );
    });

    cy.wait('@getRecordCount').should(({ request }) => {
      expect(request.url).to.contain('conditions=');
      // Correctly parse plus (+) symbols in URL by replacing them with %2B
      // This ensures an accurate comparison can be made
      const parsedUrl = request.url.replace(new RegExp(/\+/g), '%2B');
      expect(parsedUrl).to.contain(
        `conditions=${encodeURIComponent(
          '{"$and":[{"metadata.timestamp":{"$gte":"2022-01-01+00:00:00","$lte":"2022-01-02+00:00:00"}},{"metadata.shotnum":{"$gte":1,"$lte":9}}]}'
        )}`
      );
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
