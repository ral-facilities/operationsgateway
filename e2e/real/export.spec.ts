import { test, expect } from '@playwright/test';

test('should be able to export a CSV of scalar info', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('from, date-time input').fill('2023-06-04 00:00');
  await page.getByLabel('to, date-time input').fill('2023-06-05 08:00');

  await page.getByRole('radio', { name: 'Unlimited' }).click();

  await page.getByRole('button', { name: 'Search', exact: true }).click();

  // add channels
  await page.getByRole('button', { name: 'Data channels' }).click();

  await page
    .getByRole('combobox', { name: 'Search data channels' })
    .fill('209');

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await page.getByRole('checkbox', { name: 'Temperature' }).click();
  await page.getByRole('checkbox', { name: 'Relative humidity' }).click();

  await page.getByRole('button', { name: 'Add Channels' }).click();

  // export

  await page.getByRole('button', { name: 'Export' }).click();

  await expect(page.getByRole('dialog', { name: 'Export Data' })).toBeVisible();

  const downloadPromise = page.waitForEvent('download');

  await page.getByRole('button', { name: 'Export' }).click();

  const downloadedCSV = await downloadPromise;
  expect(downloadedCSV.suggestedFilename()).toBe(
    '20230604000000_to_20230605080000.csv'
  );
});

test('should be able to export a CSV of all info for selected rows', async ({
  page,
}) => {
  await page.goto('/');

  await page.getByLabel('from, date-time input').fill('2023-06-05 08:00');
  await page.getByLabel('to, date-time input').fill('2023-06-05 09:00');

  await page.getByRole('button', { name: 'Search', exact: true }).click();

  // add channels
  await page.getByRole('button', { name: 'Data channels' }).click();

  await page
    .getByRole('combobox', { name: 'Search data channels' })
    .fill('PA1-CAM');

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  for (const row of await page.getByRole('checkbox').all()) await row.check();

  await page.getByRole('button', { name: 'Add Channels' }).click();

  // select rows

  await page
    .getByRole('row')
    .filter({ has: page.getByText('2023-06-05 08:00:00') })
    .getByRole('checkbox', { name: 'select row' })
    .check();

  await page
    .getByRole('row')
    .filter({ has: page.getByText('2023-06-05 09:00:00') })
    .getByRole('checkbox', { name: 'select row' })
    .check();

  // export

  await page.getByRole('button', { name: 'Export' }).click();

  await expect(page.getByRole('dialog', { name: 'Export Data' })).toBeVisible();

  await page.getByRole('radio', { name: 'Selected Rows' }).check();

  await page.getByRole('checkbox', { name: 'Images', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Waveform CSVs' }).check();
  await page.getByRole('checkbox', { name: 'Waveform Images' }).check();

  const downloadPromise = page.waitForEvent('download');

  await page.getByRole('button', { name: 'Export' }).click();

  await expect(page.getByText('Generating export data...')).toBeVisible();

  const downloadedCSV = await downloadPromise;
  expect(downloadedCSV.suggestedFilename()).toBe(
    '20230605080000_to_20230605090000.zip'
  );

  await expect(page.getByText('Generating export data...')).not.toBeVisible();
});
