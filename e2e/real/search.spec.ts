import { test, expect } from '@playwright/test';

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

// skip testing explicitly setting the date time, as we do that in a lot of other tests
// also skip testing timeframes as 1) it would be complicated and
// 2) all it does in our code is convert it to timestamps so no need to test against real API
