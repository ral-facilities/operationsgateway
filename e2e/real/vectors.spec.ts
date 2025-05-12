import { expect, test } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

test.beforeEach(async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('from, date-time input').fill('2023-06-01 08:00');
  await page.getByLabel('to, date-time input').fill('2023-06-30 09:00');

  await page.getByRole('button', { name: 'Search', exact: true }).click();

  // add trace channel to the table so we can click on a trace
  await page.getByRole('button', { name: 'Data channels' }).click();

  await page
    .getByRole('combobox', { name: 'Search data channels' })
    .fill('Compressor output wavefront coefficients');

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await page.getByRole('button', { name: 'Add this channel' }).click();

  await page.getByRole('button', { name: 'Add Channels' }).click();
});

test.afterEach(async ({ request, context }) => {
  const { apiUrl } = await (
    await request.get('/operationsgateway-settings.json')
  ).json();

  const token = (await context.storageState()).origins[0].localStorage.find(
    (v) => v.name === 'scigateway:token'
  )?.value;
  await request.delete(`${apiUrl}/users/preferences/VECTOR_SKIP`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  await request.delete(`${apiUrl}/users/preferences/VECTOR_LIMIT`, {
    headers: { Authorization: `Bearer ${token}` },
  });
});

test('user can limit the vector data', async ({ page }) => {
  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page
      .getByAltText('Compressor output wavefront coefficients vector', {
        exact: false,
      })
      .first()
      .click(),
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

test('user can set their default skip and limit', async ({ page }) => {
  const tableThumbnail = await page
    .getByAltText('Compressor output wavefront coefficients vector', {
      exact: false,
    })
    .first();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    tableThumbnail.click(),
  ]);

  // Resize the popup window
  await popup.setViewportSize({ width: 1200, height: 800 });

  const chart = await popup.locator('.plotly-chart');

  // ensure chart is loaded properly by attempting to click on it
  await chart.click({ trial: true });

  // need to trigger a resize as Webkit isn't calcing init size in Playwright correctly
  await popup.locator('text=Reset View').click();
  await popup.waitForTimeout(1000);

  await expect(tableThumbnail).toHaveScreenshot({
    maxDiffPixels: 150,
  });

  await expect(chart).toHaveScreenshot({
    maxDiffPixels: 150,
    stylePath:
      // hide top buttons from the screenshot as it's not important
      path.join(__dirname, '..', 'screenshotIgnoreStyles.css'),
  });

  await page.evaluate(() => {
    const div = document.createElement('div');
    div.id = 'settings';
    const ul = document.createElement('ul');
    div.appendChild(ul);
    document.body.appendChild(div);
  });

  const recordsSkipPromise = page.waitForResponse(
    (response) =>
      response.url().includes('records') &&
      (response.url().match(/projection/g) || []).length > 1
  );
  const vectorSkip = await page.getByRole('textbox', {
    name: 'Lower Bound',
    // This is used due to the nested focusTrap error caused by nested menuItems
    includeHidden: true,
  });

  expect(vectorSkip).toHaveText('');

  await vectorSkip.fill('2');

  // wait for records response to come back before taking screenshot
  await recordsSkipPromise;

  const recordsLimitPromise = page.waitForResponse(
    (response) =>
      response.url().includes('records') &&
      (response.url().match(/projection/g) || []).length > 1
  );

  const vectorLimit = await page.getByRole('textbox', {
    name: 'Upper Bound',
    // This is used due to the nested focusTrap error caused by nested menuItems
    includeHidden: true,
  });
  expect(vectorLimit).toHaveText('');
  await vectorLimit.fill('10');

  // wait for records response to come back before taking screenshot
  await recordsLimitPromise;

  await expect(tableThumbnail).toBeAttached();
  await expect(tableThumbnail).toHaveScreenshot({
    maxDiffPixels: 150,
  });

  await expect(chart).toHaveScreenshot({
    maxDiffPixels: 150,
    stylePath:
      // hide top buttons from the screenshot as it's not important
      path.join(__dirname, '..', 'screenshotIgnoreStyles.css'),
  });
});
