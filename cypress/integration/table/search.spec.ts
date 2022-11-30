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

  it('can be hidden and shown', () => {
    cy.contains(/^Search$/).should('be.visible');

    cy.contains('Hide search').click();

    cy.contains(/^Search$/).should('not.be.visible');

    cy.contains('Show search').click();

    cy.contains(/^Search$/).should('be.visible');
  });

  it('searches with filled inputs', () => {
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
