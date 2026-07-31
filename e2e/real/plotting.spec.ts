import { expect, test } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

test('plots a time vs channel graph', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('from, date-time input').fill('2023-06-04 00:00');
  await page.getByLabel('to, date-time input').fill('2023-06-05 08:00');

  await page.getByRole('button', { name: 'Search', exact: true }).click();
  // wait for data to load before switching tabs
  await page.getByRole('progressbar').waitFor({ state: 'hidden' });

  await page.locator('text=Plots').click();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('text=Create a plot').click(),
  ]);

  await popup.locator('label:has-text("Title")').fill('Test time plot');

  await popup.locator('[aria-label="Line Chart"]').click();

  await popup.locator('label:has-text("Search all channels")').fill('209');

  await popup
    .getByRole('option', { name: 'Temperature 209:1', exact: true })
    .click();

  await popup.locator('[aria-label="close settings"]').click();

  // wait for open settings button to be visible i.e. menu is fully closed
  await popup.locator('[aria-label="open settings"]').click({ trial: true });

  const chart = await popup.locator('.plotly-chart');

  await expect(chart).toHaveScreenshot({
    // 150 pixels would only be very minor changes, so it's safe to ignore
    maxDiffPixels: 150,
    stylePath:
      // hide plot buttons from the screenshot as it's not important & can mess up diffs
      path.join(__dirname, '..', 'screenshotIgnoreStyles.css'),
  });
});

test('plots a channel vs channel graph', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('from, date-time input').fill('2023-06-04 00:00');
  await page.getByLabel('to, date-time input').fill('2023-06-05 08:00');

  await page.getByRole('radio', { name: 'Unlimited' }).click();

  await page.getByRole('button', { name: 'Search', exact: true }).click();
  // wait for data to load before switching tabs
  await page.getByRole('progressbar').waitFor({ state: 'hidden' });

  await page.locator('text=Plots').click();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('text=Create a plot').click(),
  ]);

  await popup.getByRole('button', { name: 'XY' }).click();

  await popup.locator('label:has-text("Search")').fill('209');

  await popup
    .getByRole('option', { name: 'Temperature 209:1', exact: true })
    .click();

  await popup.getByRole('tab', { name: 'Y' }).click();

  await popup.locator('label:has-text("Search all channels")').fill('209');

  await popup
    .getByRole('option', { name: 'Relative humidity 209:1', exact: true })
    .click();

  await popup.locator('[aria-label="close settings"]').click();

  // wait for open settings button to be visible i.e. menu is fully closed
  await popup.locator('[aria-label="open settings"]').click({ trial: true });

  const chart = await popup.locator('.plotly-chart');

  await expect(chart).toHaveScreenshot({
    maxDiffPixels: 150,
    stylePath:
      // hide plot buttons from the screenshot as it's not important & can mess up diffs
      path.join(__dirname, '..', 'screenshotIgnoreStyles.css'),
  });
});

test('user can export plot image and data', async ({ page }) => {
  await page.goto('/');

  await page.locator('text=Plots').click();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('text=Create a plot').click(),
  ]);

  await popup.locator('.plotly-chart');

  const plotName = 'Test plot';

  await popup.locator('label:has-text("Title")').fill(plotName);

  await popup.locator('label:has-text("Search all channels")').fill('Shot');

  await popup.getByRole('option', { name: 'Shot Number', exact: true }).click();

  const downloadImagePromise = popup.waitForEvent('download');
  await popup.getByRole('button', { name: 'Export Plot', exact: true }).click();

  const downloadedImage = await downloadImagePromise;
  expect(downloadedImage.suggestedFilename()).toBe(`${plotName}.png`);

  const downloadCSVPromise = page.waitForEvent('download');
  await popup.getByRole('button', { name: 'Export Plot Data' }).click();

  const downloadedCSV = await downloadCSVPromise;
  expect(downloadedCSV.suggestedFilename()).toBe(`${plotName}.csv`);
});
