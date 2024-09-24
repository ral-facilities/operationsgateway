import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('from, date-time input').fill('2023-06-04 00:00');
  await page.getByLabel('to, date-time input').fill('2023-06-05 08:00');

  await page.getByRole('radio', { name: 'Unlimited' }).click();

  await page.getByRole('button', { name: 'Search', exact: true }).click();

  // add 2 scalar channels to the table so we can do some filtering
  await page.getByRole('button', { name: 'Data channels' }).click();

  await page
    .getByRole('combobox', { name: 'Search data channels' })
    .fill('209');

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await page.getByRole('checkbox', { name: 'Temperature' }).click();
  await page.getByRole('checkbox', { name: 'Relative humidity' }).click();

  await page.getByRole('button', { name: 'Add Channels' }).click();
});

test('should be able to add a single filter with a complex filter', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Filters' }).click();

  await expect(page.getByText('Enter filter')).toBeVisible();

  const filterInput = page.getByRole('combobox', {
    name: 'Filter',
    exact: true,
  });

  await filterInput.fill('not');
  await filterInput.press('Enter');
  await filterInput.fill('(');
  await filterInput.press('Enter');
  await filterInput.pressSequentially('Relative humidity 209 > 55 ');
  await filterInput.fill('or');
  await filterInput.press('Enter');
  await filterInput.pressSequentially('not Relative humidity 209 > 53 ');
  await filterInput.fill(')');
  await filterInput.press('Enter');
  await filterInput.fill('and');
  await filterInput.press('Enter');
  await filterInput.pressSequentially('Temperature 209 > 21 ');
  await filterInput.fill('or');
  await filterInput.press('Enter');
  await filterInput.pressSequentially('Temperature 209 > 21.95 ');

  await page.getByRole('button', { name: 'Apply' }).click();

  await expect(page.getByText('Enter filter')).not.toBeVisible();

  await expect(page.getByText('1–19 of 19')).toBeVisible();
});

test('should be able to add a multiple filters', async ({ page }) => {
  await page.getByRole('button', { name: 'Filters' }).click();

  await expect(page.getByText('Enter filter')).toBeVisible();

  const firstFilterInput = page
    .getByRole('combobox', {
      name: 'Filter',
      exact: true,
    })
    .first();

  await firstFilterInput.pressSequentially('Relative humidity 209 < 42 ');

  // unfocus so combobox menu is not blocking add new filtr button
  await firstFilterInput.blur();

  await page.getByRole('button', { name: 'Add new filter' }).click();

  const secondFilterInput = page
    .getByRole('combobox', {
      name: 'Filter',
      exact: true,
    })
    .nth(1);

  await secondFilterInput.pressSequentially('Temperature 209 > 21.5 ');

  await page.getByRole('button', { name: 'Apply' }).click();

  await expect(page.getByText('Enter filter')).not.toBeVisible();

  await expect(page.getByText('1–7 of 7')).toBeVisible();
});
