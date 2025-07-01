import { expect, test } from '@playwright/test';

test('plots a time vs shotnum graph and change the plot colour and saves the session with the plot', async ({
  page,
  browserName,
}) => {
  await page.goto('/');

  await page.locator('text=Plots').click();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('text=Create a plot').click(),
  ]);

  await popup.locator('label:has-text("Title")').fill('Test time plot');

  await popup.locator('[aria-label="Line Chart"]').click();

  await popup.locator('label:has-text("Search all channels")').fill('Shot Num');

  await popup.getByRole('option', { name: 'Shot Number', exact: true }).click();

  // scroll down to get options button in full view
  await popup.mouse.wheel(0, 200);

  await popup.locator('[aria-label="More options for Shot Number"]').click();
  await popup.locator('[aria-label="Pick Shot Number colour"]').click();
  await popup.locator('[aria-label="Hue"]').click();
  await popup.locator('[aria-label="Color"]').click();

  await popup.locator('[aria-label="close settings"]').click();

  // wait for open settings button to be visible i.e. menu is fully closed
  await popup.locator('[aria-label="open settings"]').click({ trial: true });

  const chart = await popup.locator('.plotly-chart');

  await page.locator('text=Data').click();

  await page.getByLabel('from, date-time input').fill('2023-06-04 00:00');
  await page.getByLabel('to, date-time input').fill('2023-06-05 08:00');

  await page.getByRole('radio', { name: 'Unlimited' }).click();

  await page.getByRole('button', { name: 'Search', exact: true }).click();

  await page.getByRole('button', { name: 'Save as' }).click();

  await page
    .getByRole('textbox', { name: 'Name' })
    .fill('e2e session plot save');
  await page
    .getByRole('textbox', { name: 'Summary' })
    .fill('test session summary');

  // listen for sessions response to get the ID of the session we create
  // so we can ensure it's tidied up later
  const responsePromise = page.waitForResponse('**/sessions?*');

  await page.getByRole('button', { name: 'Save' }).click();

  await responsePromise;

  await expect(
    page.getByRole('dialog', { name: 'Save Session' })
  ).not.toBeVisible();

  const getResponsePromise = page.waitForResponse(`**/sessions/5`);

  const getResponse = await getResponsePromise;
  const responseData = await getResponse.json();

  const plotIds = Object.keys(responseData.session.plots);
  expect(plotIds.length).toBe(1); // ensure only one plot
  const plotId = plotIds[0];
  let screenY = 0;
  let screenX = 0; // default screenX for all browsers
  let colour = '';
  switch (browserName) {
    case 'chromium':
      screenY = 166;
      screenX = 200;
      colour = '#41817f';
      break;
    case 'firefox':
      screenY = 200;
      screenX = 200;
      colour = '#41817f';
      break;
    case 'webkit':
      screenY = 0;
      screenX = 0;
      colour = '#40807e';
      break;
    default:
      screenY = 200;
      screenX = 200;
      colour = '#41817f';
  }
  expect(responseData).toEqual({
    _id: '5',
    auto_saved: false,
    name: 'e2e session plot save',
    session: {
      filter: { appliedFilters: [[]] },
      functions: { appliedFunctions: [] },
      plots: {
        [plotId]: {
          XAxis: 'timestamp',
          XAxisScale: 'date',
          axesLabelsVisible: true,
          gridVisible: true,
          id: plotId,
          innerHeight: 400,
          innerWidth: 600,
          leftYAxisScale: 'linear',
          open: true,
          plotType: 'line',
          remainingColours: [
            '#0000ff',
            '#ff00ff',
            '#00ffff',
            '#008080',
            '#800000',
            '#00ff00',
            '#000080',
            '#7f8000',
            '#80007f',
          ],
          rightYAxisScale: 'linear',
          screenX: screenX,
          screenY: screenY,
          selectedColours: ['#008000'],
          selectedPlotChannels: [
            {
              displayName: 'Shot Number',
              name: 'shotnum',
              options: {
                colour: colour,
                lineStyle: 'solid',
                visible: true,
                yAxis: 'left',
              },
              units: '',
            },
          ],
          skipNonBusinessHours: false,
          title: 'Test time plot',
        },
      },
      search: {
        searchParams: {
          dateRange: {
            fromDate: '2023-06-04T00:00:00',
            toDate: '2023-06-05T08:00:59',
          },
          experimentID: null,
          maxShots: null,
          shotnumRange: {},
        },
      },
      selection: { selectedRows: [] },
      table: {
        columnStates: {},
        page: 0,
        resultsPerPage: 25,
        selectedColumnIds: ['timestamp'],
        sort: {},
      },
      windows: {},
    },
    summary: 'test e2e session',
    timestamp: '2023-06-29T10:30:00',
  });
});
