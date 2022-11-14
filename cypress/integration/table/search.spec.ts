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
    cy.get('input[name="shot number max"]').type(
      '{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}'
    );

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
});
