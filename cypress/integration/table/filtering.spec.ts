import { addInitialSystemChannels } from '../../support/util';

describe('Filtering Component', () => {
  beforeEach(() => {
    cy.visit('/');

    cy.findByRole('progressbar').should('be.visible');
    cy.findByRole('progressbar').should('not.exist');
  });

  afterEach(() => {
    cy.clearMocks();
  });

  it('opens dialogue when you click on main filters button and closes when you click close', () => {
    cy.contains('Filter').click();

    cy.get('[role="dialog"]').contains('Filters').should('be.visible');

    cy.get('[role="dialog"]').contains('Close').click();

    cy.get('[role="dialog"]').should('not.exist');
  });

  it('opens dialogue when you click the filters button in a filtered table column', () => {
    cy.contains('Filter').click();

    cy.get('input[role="combobox"]').type(
      'Shot Number{enter}is not null{enter}'
    );
    cy.contains('Apply').click();
    cy.get('[role="dialog"]').should('not.exist');

    addInitialSystemChannels(['Shot Number']);
    cy.findByRole('columnheader', { name: 'Shot Number' }).within(() => {
      cy.get('[aria-label="open filters"]').click();
    });

    cy.get('[role="dialog"]').contains('Filters').should('be.visible');
  });

  it('lets a user create a filter', () => {
    cy.contains('Filter').click();

    cy.get('input[role="combobox"]').type(
      'Shot Number{enter}is not null{enter}'
    );

    cy.get('[data-id="Input"]')
      .contains('[role="button"]', 'Shot Number')
      .should('be.visible');
    cy.get('[data-id="Input"]')
      .contains('[role="button"]', 'is not null')
      .should('be.visible');

    cy.startSnoopingBrowserMockedRequest();

    cy.contains('Apply').should('not.be.disabled');
    cy.contains('Apply').click();

    cy.findByRole('table').should('be.visible');

    cy.findBrowserMockedRequests({ method: 'GET', url: '/records' }).should(
      (patchRequests) => {
        expect(patchRequests.length).equal(1);
        const request = patchRequests[0];

        expect(request.url.toString()).to.contain('conditions=');
        expect(request.url.toString()).to.contain(
          `conditions=${encodeURIComponent(
            '{"$and":[{"metadata.shotnum":{"$ne":null}}]}'
          )}`
        );
      }
    );
  });

  it('stops a user from creating an invalid filter', () => {
    cy.contains('Filter').click();

    cy.get('input[role="combobox"]').type('Shot Number{enter}<{enter}').blur();

    cy.get('[data-id="Input"]')
      .contains('[role="button"]', 'Shot Number')
      .should('be.visible');
    cy.get('[data-id="Input"]')
      .contains('[role="button"]', /^<$/)
      .should('be.visible');

    cy.get('[role="dialog"]').contains('Missing operand').should('be.visible');

    cy.contains('Apply').should('be.disabled');
  });

  it('lets a user edit a filter using arrow keys', () => {
    cy.contains('Filter').click();

    // this is also testing autocomplete suggestions work (i.e. it selects the second channel)
    // as well as inputting numbers and strings
    cy.get('input[role="combobox"]')
      .as('input')
      .type(
        'Channel{downArrow}{enter}!={enter}"1"{enter}and{enter}Shot Numb{enter}>{enter}1{enter}'
      )
      .blur();

    cy.get('[data-id="Input"]')
      .as('autoComplete')
      .contains('[role="button"]', 'Channel_DEFGH')
      .should('be.visible');
    cy.get('@autoComplete')
      .contains('[role="button"]', /^"1"$/)
      .should('be.visible');
    cy.get('@autoComplete')
      .contains('[role="button"]', /^1$/)
      .should('be.visible');

    cy.get('@input')
      .type('{leftArrow}{leftArrow}{leftArrow}{backspace}or{enter}')
      .blur();

    cy.get('@autoComplete')
      .contains('[role="button"]', /^or$/)
      .should('be.visible');

    cy.contains('Apply').should('not.be.disabled');

    cy.get('@input')
      .type('{rightArrow}{rightArrow}{backspace}>={enter}')
      .blur();

    cy.get('@autoComplete')
      .contains('[role="button"]', /^>=$/)
      .should('be.visible');

    // test that arrow keys & backspace only have their "extra" functionality
    // when the input is either empty (backspace) or the cursor in the input is
    // fully at the start (arrow left) or at the end (arrow right)
    cy.get('@input').type('{leftArrow}{leftArrow}'); // set correct cursor position (i.e. after conjunction, before start of second assertion)
    cy.get('@input').type('not{backspace}').blur();

    cy.get('@input').should('have.value', 'no');
    // if backspace deleted the previous item, the expression wouldn't be valid
    cy.contains('Apply').should('not.be.disabled');

    cy.get('@input').type('t');
    cy.get('@input').type('{leftArrow}{rightArrow}{enter}').blur();

    cy.startSnoopingBrowserMockedRequest();

    // not would only be valid in it's current position, so no error means we didn't move
    cy.contains('Apply').should('not.be.disabled');
    cy.contains('Apply').click();

    cy.findByRole('table').should('be.visible');

    cy.findBrowserMockedRequests({ method: 'GET', url: '/records' }).should(
      (patchRequests) => {
        expect(patchRequests.length).equal(1);
        const request = patchRequests[0];

        expect(request.url.toString()).to.contain('conditions=');
        expect(request.url.toString()).to.contain(
          `conditions=${encodeURIComponent(
            '{"$and":[{"$or":[{"channels.CHANNEL_DEFGH.data":{"$ne":"1"}},{"metadata.shotnum":{"$not":{"$gte":1}}}]}]}'
          )}`
        );
      }
    );
  });

  it('lets a user edit a filter using mouse', () => {
    cy.contains('Filter').click();

    cy.get('input[role="combobox"]')
      .as('input')
      .type(
        'Channel{downArrow}{enter}!={enter}"1"{enter}and{enter}not{enter}Shot Numb{enter}>{enter}1{enter}'
      )
      .blur();

    cy.get('[data-id="Input"]')
      .as('autoComplete')
      .contains('[role="button"]', 'not')
      .children()
      .eq(1)
      .click();
    cy.get('@autoComplete')
      .contains('[role="button"]', 'not')
      .should('not.exist');

    cy.contains('Apply').should('not.be.disabled');

    cy.get('@autoComplete').then((el) => {
      const inputPosition = el[0].getBoundingClientRect();
      cy.wrap(el)
        .contains('[role="button"]', /^and$/)
        .then((chipEl) => {
          const chipPosition = chipEl[0].getBoundingClientRect();
          cy.wrap(el).click(
            chipPosition.x - inputPosition.x + chipPosition.width,
            chipPosition.y + chipPosition.height / 2 - inputPosition.y
          );
        });
    });

    cy.get('@input').type('{backspace}or{enter}').blur();

    cy.contains('Apply').should('not.be.disabled');

    cy.get('@autoComplete').then((el) => {
      const inputPosition = el[0].getBoundingClientRect();
      cy.wrap(el)
        .contains('[role="button"]', /^Channel_/)
        .then((chipEl) => {
          const chipPosition = chipEl[0].getBoundingClientRect();
          cy.wrap(el).click(
            chipPosition.x - inputPosition.x + chipPosition.width,
            chipPosition.y + chipPosition.height / 2 - inputPosition.y
          );
        });
    });

    cy.get('@input').type('{backspace}Channel{enter}').blur();

    cy.contains('Apply').should('not.be.disabled');

    cy.get('@autoComplete').then((el) => {
      const inputPosition = el[0].getBoundingClientRect();
      cy.wrap(el)
        .contains('[role="button"]', /^>$/)
        .then((chipEl) => {
          const chipPosition = chipEl[0].getBoundingClientRect();
          cy.wrap(el).click(
            chipPosition.x - inputPosition.x + chipPosition.width,
            chipPosition.y + chipPosition.height / 2 - inputPosition.y
          );
        });
    });

    cy.get('@input').type('{backspace}>={enter}').blur();

    cy.startSnoopingBrowserMockedRequest();

    cy.contains('Apply').should('not.be.disabled');
    cy.contains('Apply').click();

    cy.findByRole('table').should('be.visible');

    cy.findBrowserMockedRequests({ method: 'GET', url: '/records' }).should(
      (patchRequests) => {
        expect(patchRequests.length).equal(1);
        const request = patchRequests[0];

        expect(request.url.toString()).to.contain('conditions=');
        expect(request.url.toString()).to.contain(
          `conditions=${encodeURIComponent(
            '{"$and":[{"$or":[{"channels.CHANNEL_ABCDE.data":{"$ne":"1"}},{"metadata.shotnum":{"$gte":1}}]}]}'
          )}`
        );
      }
    );
  });

  it('stops a user from entering a random string', () => {
    cy.contains('Filter').click();

    cy.get('input[role="combobox"]').type('INVALID{enter}').blur();

    cy.get('.MuiAutocomplete-tag').should('not.exist');

    cy.get('input[role="combobox"]').should('have.value', 'INVALID');
  });

  it('lets a user create multiple filters and delete them', () => {
    cy.contains('Filter').click();

    cy.get('input[role="combobox"]').type(
      'Shot Number{enter}is not null{enter}'
    );

    cy.contains('button', 'Add new filter').click();

    cy.get('input[role="combobox"]')
      .eq(1)
      .type('Channel{enter}is not null{enter}');

    cy.startSnoopingBrowserMockedRequest();

    cy.contains('Apply').should('not.be.disabled');
    cy.contains('Apply').click();

    cy.findByRole('table').should('be.visible');

    cy.findBrowserMockedRequests({ method: 'GET', url: '/records' }).should(
      (patchRequests) => {
        expect(patchRequests.length).equal(1);
        const request = patchRequests[0];

        expect(request.url.toString()).to.contain('conditions=');
        expect(request.url.toString()).to.contain(
          `conditions=${encodeURIComponent(
            '{"$and":[{"metadata.shotnum":{"$ne":null}},{"channels.CHANNEL_ABCDE.data":{"$ne":null}}]}'
          )}`
        );
      }
    );

    cy.clearMocks();

    cy.contains('Filter').click();

    cy.get('button[aria-label="Delete filter 0"]').click();

    cy.contains('Apply').click();

    cy.findByRole('table').should('be.visible');

    cy.findBrowserMockedRequests({ method: 'GET', url: '/records' }).should(
      (patchRequests) => {
        expect(patchRequests.length).equal(1);
        const request = patchRequests[0];

        expect(request.url.toString()).to.contain('conditions=');
        expect(request.url.toString()).to.contain(
          `conditions=${encodeURIComponent(
            '{"$and":[{"channels.CHANNEL_ABCDE.data":{"$ne":null}}]}'
          )}`
        );
      }
    );
  });
});
