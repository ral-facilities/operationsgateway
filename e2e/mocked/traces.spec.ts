import { expect, test } from '@playwright/test';
import { triggerAsyncId } from 'async_hooks';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

test.beforeEach(async ({ page }) => {
  await page.goto('/');

  // add trace channel to the table so we can click on a trace
  await page.getByRole('button', { name: 'Data channels' }).click();

  await page
    .getByRole('combobox', { name: 'Search data channels' })
    .type('CDEFG');

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await page.getByRole('checkbox', { name: 'Channel_CDEFG' }).click();

  await page.getByRole('button', { name: 'Add Channels' }).click();
});

test('user can show points for the trace', async ({ page }) => {
  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page
      .getByAltText('Channel_CDEFG waveform', { exact: false })
      .first()
      .click(),
  ]);

  const chart = await popup.locator('.plotly-chart');
  // ensure chart is loaded properly by attempting to click on it
  await chart.click({ trial: true });

  // need to trigger a resize as Webkit isn't calcing init size in Playwright correctly
  await popup.locator('text=Reset View').click();

  await popup.getByRole('button', { name: 'Show points' }).click();

  await expect(chart).toHaveScreenshot({
    maxDiffPixels: 150,
    stylePath:
      // hide image controls panel & top buttons from the screenshot as it's not important
      path.join(__dirname, 'screenshotIgnoreStyles.css'),
  });
});

test('user can zoom and pan the trace', async ({ page }) => {
  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page
      .getByAltText('Channel_CDEFG waveform', { exact: false })
      .first()
      .click(),
  ]);

  const chart = await popup.locator('.plotly-chart');
  // ensure chart is loaded properly by attempting to click on it
  await chart.click({ trial: true });

  // need to trigger a resize as Webkit isn't calcing init size in Playwright correctly
  await popup.locator('text=Reset View').click();
  await popup.waitForTimeout(1000);

  // test drag to zoom
  await chart.dragTo(chart, {
    force: true, // need to force: true here because of .dragcover element covers the plot
    sourcePosition: {
      x: 150,
      y: 130,
    },
    targetPosition: {
      x: 385,
      y: 320,
    },
  });

  await chart.hover(); // hover chart to move mouse to center of chart to make the scroll in consistent
  await popup.mouse.wheel(0, -20);

  await popup.keyboard.down('Shift');
  await chart.dragTo(chart, {
    force: true, // need to force: true here because of .dragcover element covers the plot
    sourcePosition: {
      x: 150,
      y: 150,
    },
    targetPosition: {
      x: 130,
      y: 80,
    },
  });
  await popup.keyboard.up('Shift');

  await popup.mouse.move(0, 0); // move mouse out of way to remove any tooltips

  await expect(chart).toHaveScreenshot({
    maxDiffPixels: 150,
    stylePath:
      // hide image controls panel & top buttons from the screenshot as it's not important
      path.join(__dirname, 'screenshotIgnoreStyles.css'),
  });

  await popup.locator('text=Reset View').click();

  await expect(chart).toHaveScreenshot({
    maxDiffPixels: 150,
    stylePath:
      // hide image controls panel & top buttons from the screenshot as it's not important
      path.join(__dirname, 'screenshotIgnoreStyles.css'),
  });
});

test('user can change trace via clicking on a thumbnail', async ({ page }) => {
  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page
      .getByAltText('Channel_CDEFG waveform', { exact: false })
      .first()
      .click(),
  ]);

  const chart = await popup.locator('.plotly-chart');

  // wait for first chart to load before loading new chart
  await chart.click();

  // create modified trace to be queried when different thumbnail is selected
  await page.evaluate(async () => {
    const { msw } = window;

    msw.worker.use(
      msw.http.get(
        '/waveforms/:recordId/:channelName',
        async () =>
          msw.HttpResponse.json(
            {
              _id: '2',
              x: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
              y: [8, 1, 10, 9, 4, 3, 5, 6, 2, 7],
            },
            { status: 200 }
          ),
        { once: true }
      )
    );
  });

  await popup
    .getByAltText('Channel_CDEFG waveform', { exact: false })
    .last()
    .click();

  await expect(chart).toHaveScreenshot({
    maxDiffPixels: 150,
    stylePath:
      // hide image controls panel & top buttons from the screenshot as it's not important
      path.join(__dirname, 'screenshotIgnoreStyles.css'),
  });
});
