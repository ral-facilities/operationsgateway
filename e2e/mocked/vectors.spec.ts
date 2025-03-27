import { expect, test } from '@playwright/test';
import path from 'path';
import type { PlotlyHTMLElement } from 'plotly.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

test.beforeEach(async ({ page }) => {
  await page.goto('/');

  // add trace channel to the table so we can click on a trace
  await page.getByRole('button', { name: 'Data channels' }).click();

  await page
    .getByRole('combobox', { name: 'Search data channels' })
    .type('CDEFGX');

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await page.getByRole('checkbox', { name: 'Channel_CDEFGX', exact: true  }).click();

  await page.getByRole('button', { name: 'Add Channels' }).click();
});

test('user can zoom and pan the vector', async ({ page }) => {
  // Open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByAltText('Channel_CDEFGX vector', { exact: false }).first().click(),
  ]);

  // Resize the popup window
  await popup.setViewportSize({ width: 1200, height: 800 });

  const chart = await popup.locator('.plotly-chart');

  // Ensure chart is loaded properly by attempting to click on it
  await chart.click({ trial: true });

  // Need to trigger a resize as Webkit isn't calculating init size in Playwright correctly
  await popup.locator('text=Reset View').click();
  await popup.waitForTimeout(1000);

  // **Modify drag-to-zoom to only select half of the plot**
  const box = await chart.boundingBox();
  if (!box) throw new Error("Chart bounding box not found");

  await chart.dragTo(chart, {
    force: true, // Required due to overlay elements
    sourcePosition: {
      x: box.width * 0.25, // Start from 25% width
      y: box.height * 0.25, // Start from 25% height
    },
    targetPosition: {
      x: box.width * 0.75, // End at 75% width
      y: box.height * 0.75, // End at 75% height
    },
  });

  // Setup so we wait for mouse wheel zoom out before panning
  chart.evaluate((chart: PlotlyHTMLElement) => {
    window['plotly_redraws'] = 0;
    chart.on('plotly_relayout', () => {
      window['plotly_redraws'] += 1;
      chart.removeAllListeners('plotly_relayout');
    });
  });

  const watchDog = popup.waitForFunction(() => window['plotly_redraws'] > 0);

  await chart.hover(); // Move mouse to center of chart to ensure consistent scrolling
  await popup.mouse.wheel(0, -20);

  await watchDog;

  // **Panning test**
  await popup.keyboard.down('Shift');
  await chart.dragTo(chart, {
    force: true,
    sourcePosition: {
      x: box.width * 0.3,
      y: box.height * 0.3,
    },
    targetPosition: {
      x: box.width * 0.6,
      y: box.height * 0.6,
    },
  });
  await popup.keyboard.up('Shift');

  await popup.mouse.move(0, 0); // Move mouse away to remove tooltips

  await expect(chart).toHaveScreenshot({
    maxDiffPixels: 150,
    stylePath: path.join(__dirname, '..', 'screenshotIgnoreStyles.css'),
  });

  await popup.locator('text=Reset View').click();

  await expect(chart).toHaveScreenshot({
    maxDiffPixels: 150,
    stylePath: path.join(__dirname, '..', 'screenshotIgnoreStyles.css'),
  });
});


test('user can limit the vector data', async ({ page }) => {
  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByAltText('Channel_CDEFGX vector', { exact: false }).first().click(),
  ]);

  // Resize the popup window
  await popup.setViewportSize({ width: 1200, height: 800 });

  const chart = await popup.locator('.plotly-chart');
  // ensure chart is loaded properly by attempting to click on it
  await chart.click({ trial: true });

  // need to trigger a resize as Webkit isn't calcing init size in Playwright correctly
  await popup.locator('text=Reset View').click();
  await popup.waitForTimeout(1000);



  const slider = await popup.getByRole('slider');

  const SliderRoot = await popup.locator('.MuiSlider-root', {
    has: slider,
  });

  const llSliderThumb = await popup
    .locator('.MuiSlider-thumb', {
      has: slider,
    })
    .nth(0);

  const sliderDims = await SliderRoot.boundingBox();

  await llSliderThumb.dragTo(SliderRoot, {
    targetPosition: {
      // moving the slider to the target value in %
      x: (sliderDims?.width ?? 0) * 0.4,
      y: sliderDims?.height ? sliderDims.height / 2 : 0,
    },
  });

  await expect(slider.nth(0)).toHaveValue('8');

  const ulSliderThumb = await popup
    .locator('.MuiSlider-thumb', {
      has: slider,
    })
    .nth(1);
  await ulSliderThumb.dragTo(SliderRoot, {
    targetPosition: {
      // moving the slider to the target value in %
      x: (sliderDims?.width ?? 0) * 0.8,
      y: sliderDims?.height ? sliderDims.height / 2 : 0,
    },
  });

  await expect(slider.nth(1)).toHaveValue('16');

  // blur to avoid focus tooltip appearing in snapshot
  await slider.nth(0).blur();
  await slider.nth(1).blur();


  await expect(chart).toHaveScreenshot({
    maxDiffPixels: 150,
    stylePath:
      // hide top buttons from the screenshot as it's not important
      path.join(__dirname, '..', 'screenshotIgnoreStyles.css'),
  });

  await popup.locator('text=Reset View').click();

  await expect(chart).toHaveScreenshot({
    maxDiffPixels: 150,
    stylePath:
      // hide top buttons from the screenshot as it's not important
      path.join(__dirname, '..', 'screenshotIgnoreStyles.css'),
  });
});

test('user can change vector via clicking on a thumbnail', async ({ page }) => {
  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page
      .getByAltText('Channel_CDEFGX vector', { exact: false })
      .first()
      .click(),
  ]);

  // Resize the popup window
  await popup.setViewportSize({ width: 1200, height: 800 });

  const chart = await popup.locator('.plotly-chart');

  // wait for first chart to load before loading new chart
  await chart.click();

  // create modified trace to be queried when different thumbnail is selected
  await page.evaluate(async () => {
    const { msw } = window;

    msw.worker.use(
      msw.http.get(
        '/vectors/:recordId/:channelName',
        async () =>
          msw.HttpResponse.json(
            {
              data: [
                5.639372695195284, 5.587336765253104, 1.826101240997037,
                2.521215679028282, -2.980784658113992, -2.279530101757219,
                0.8275213451146765, -0.2507684324157028, -1.3952389582428177,
                -0.925578472683586, 0.5665629489813115, 0.6252987786682547,
                0.16671172514266414, 0.0724989856677573, 0.18313006266485013,
                0.26288446058591775, -0.03412582732888118, 0.1467799869560521,
                0.16014661721357387, 0.10650232684232015,
              ].reverse(),
            },
            { status: 200 }
          ),
        { once: true }
      )
    );
  });

  await popup
    .getByAltText('Channel_CDEFGX vector', { exact: false })
    .last()
    .click();

  await expect(chart).toHaveScreenshot({
    maxDiffPixels: 150,
    stylePath:
      // hide top buttons from the screenshot as it's not important
      path.join(__dirname, '..', 'screenshotIgnoreStyles.css'),
  });
});



