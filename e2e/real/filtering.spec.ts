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

test('CRU favourite filter', async ({ page }) => {
  await page.getByRole('button', { name: 'Filters' }).click();
  await page.getByText('Favourite filters').click();

  await page.getByRole('button', { name: 'Add new favourite filter' }).click();

  const firstFilterInput = page
    .getByRole('combobox', {
      name: 'Filter',
      exact: true,
    })
    .first();

  const nameFields = await page.locator('label:has-text("Name")');

  await nameFields.last().fill('test');

  await firstFilterInput.pressSequentially('Relative humidity 209 < 42 ');

  // unfocus so combobox menu is not blocking add new filter button
  await firstFilterInput.blur();

  await page.getByRole('button', { name: 'Save' }).click();

  // Assert that the input with the value 'test' exists after saving
  const savedTextField = page.locator('input[value="test"]');
  await expect(savedTextField).toHaveValue('test');

  await page
    .getByRole('button', { name: 'Edit test favourite filter' })
    .click();

  // Append ' 1' to the name field
  await nameFields.last().fill('test 1');

  // Edit the filter by replacing 42 with 40
  await firstFilterInput.click(); // Focus on the filter input
  await firstFilterInput.press('ArrowRight'); // Navigate to the end of the input
  await firstFilterInput.press('ArrowRight'); // Navigate to the end of the input
  await firstFilterInput.press('ArrowRight'); // Navigate to the end of the input
  await firstFilterInput.press('Backspace'); // Remove '42'
  await firstFilterInput.pressSequentially('40'); // Type '4'
  await firstFilterInput.press('Enter'); // Confirm the new filter value

  // Unfocus again to ensure the combobox doesn't interfere with actions
  await firstFilterInput.blur();

  // Save the edited favourite filter
  await page.getByRole('button', { name: 'Save' }).click();

  // Assert the changes were successful (checking 'test 1' and updated filter value)
  const updatedTextField = page.locator('input[value="test 1"]');
  await expect(updatedTextField).toHaveValue('test 1');
});
