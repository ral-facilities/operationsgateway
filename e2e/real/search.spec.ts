import { expect, test } from '@playwright/test';

test('should be able to search via shot number', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('open shot number search box').click();
  await page.getByRole('spinbutton', { name: 'Min' }).fill('423647999999');
  await page.getByRole('spinbutton', { name: 'Max' }).fill('423648000001');

  await expect(page.getByLabel('from, date-time input')).toHaveValue(
    '2023-06-05 08:00'
  );
  await expect(page.getByLabel('to, date-time input')).toHaveValue(
    '2023-06-05 08:00'
  );

  await page.getByRole('button', { name: 'Search', exact: true }).click();

  await expect(page.getByRole('rowgroup').last().getByRole('row')).toHaveCount(
    1
  );

  await expect(page.getByText('2023-06-05 08:00:00')).toBeVisible();
});

test('should be able to search experiment id', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('open experiment search box').click();

  await page
    .getByRole('combobox', { name: 'Select your experiment' })
    .fill('51982713');

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await expect(page.getByLabel('from, date-time input')).toHaveValue(
    '2023-06-05 00:00'
  );
  await expect(page.getByLabel('to, date-time input')).toHaveValue(
    '2023-06-21 23:59'
  );

  await page.getByRole('button', { name: 'Search', exact: true }).click();

  await expect(page.getByRole('rowgroup').last().getByRole('row')).toHaveCount(
    25
  );

  await expect(page.getByText('2023-06-05 00:00:00')).toBeVisible();
  await expect(page.getByText('1–25 of 50')).toBeVisible();
});

test('should be able to search via data type', async ({ page }) => {
  await page.route('/operationsgateway-settings.json', async (route) => {
    const response = await route.fetch();
    const json = await response.json();
    json.dataTypes = ['ea1', 'las'];
    // Fulfill using the original response, while patching the response body
    // with the given JSON object.
    await route.fulfill({ response, json });
  });

  await page.goto('/');

  // test searching across multiple data types
  await page.getByLabel('from, date-time input').fill('2023-06-05 09:55');
  await page.getByLabel('to, date-time input').fill('2023-06-05 10:05');

  await page.getByRole('button', { name: 'Search', exact: true }).click();

  await page.getByRole('button', { name: 'Data channels' }).click();

  await page
    .getByRole('combobox', { name: 'Search data channels' })
    .fill('Data Type');

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await page.getByRole('button', { name: 'Add this channel' }).click();

  await page.getByRole('button', { name: 'Add Channels' }).click();

  await expect(page.getByRole('rowgroup').last().getByRole('row')).toHaveCount(
    7
  );
  await expect(page.getByRole('cell', { name: 'ea1' }).first()).toBeVisible();
  await expect(page.getByRole('cell', { name: 'las' }).first()).toBeVisible();

  // test searching by a specific data type
  await page.getByRole('checkbox', { name: 'las' }).uncheck();

  await page.getByRole('button', { name: 'Search', exact: true }).click();

  await expect(page.getByRole('rowgroup').last().getByRole('row')).toHaveCount(
    5
  );
  await expect(page.getByRole('cell', { name: 'ea1' }).first()).toBeVisible();
  await expect(page.getByRole('cell', { name: 'las' })).not.toBeVisible();
});

// skip testing timeframes as 1) it would be complicated and
// 2) all it does in our code is convert it to timestamps so no need to test against real API
