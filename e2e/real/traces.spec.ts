import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('from, date-time input').fill('2023-06-05 08:00');
  await page.getByLabel('to, date-time input').fill('2023-06-05 09:00');

  await page.getByRole('button', { name: 'Search', exact: true }).click();

  // add trace channel to the table so we can click on a trace
  await page.getByRole('button', { name: 'Data channels' }).click();

  await page
    .getByRole('combobox', { name: 'Search data channels' })
    .fill('NSO-P4-SP');

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await page.getByRole('button', { name: 'Add this channel' }).click();

  await page.getByRole('button', { name: 'Add Channels' }).click();
});

test('user can view traces and change trace via clicking on a thumbnail', async ({
  page,
}) => {
  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page
      .getByAltText('ns OPCPA pass 4 spectrum waveform', { exact: false })
      .first()
      .click(),
  ]);

  const chart = await popup.locator('#my-chart');

  // wait for first chart to load
  await expect(popup.getByRole('progressbar')).toBeVisible();
  await expect(popup.getByRole('progressbar')).not.toBeVisible();

  // wait for canvas animations to execute
  await popup.waitForTimeout(1000);

  expect(
    await chart.screenshot({
      type: 'png',
    })
  ).toMatchSnapshot({ maxDiffPixels: 150 });

  await popup
    .getByAltText('NSO-P4-SP waveform', { exact: false })
    .last()
    .click();

  // wait for new chart to load
  await expect(popup.getByRole('progressbar')).toBeVisible();
  await expect(popup.getByRole('progressbar')).not.toBeVisible();

  // wait for canvas animations to execute
  await popup.waitForTimeout(1000);

  expect(
    await chart.screenshot({
      type: 'png',
    })
  ).toMatchSnapshot({ maxDiffPixels: 150 });
});

test('user can export trace image and data', async ({ page }) => {
  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page
      .getByAltText('ns OPCPA pass 4 spectrum waveform', { exact: false })
      .first()
      .click(),
  ]);

  await popup.locator('#my-chart');

  const title = await popup.title();
  const traceName = title.split(' - ')[1];

  const downloadImagePromise = page.waitForEvent('download');
  await popup.getByRole('button', { name: 'Export Plot', exact: true }).click();

  const downloadedImage = await downloadImagePromise;
  expect(downloadedImage.suggestedFilename()).toBe(`${traceName}.png`);

  const downloadCSVPromise = page.waitForEvent('download');
  await popup.getByRole('button', { name: 'Export Plot Data' }).click();

  const downloadedCSV = await downloadCSVPromise;
  expect(downloadedCSV.suggestedFilename()).toBe(`${traceName}.csv`);
});
