import { expect, test } from '@playwright/test';
test('scalar functions can be plotted', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Functions' }).click();

  await page.getByLabel('Name').fill('a');

  const expressionFields = await page.locator('label:has-text("Expression")');

  await expressionFields.first().fill('1');
  await expressionFields.first().press('Enter');

  await page.getByRole('button', { name: 'Apply' }).click();

  const rowsPerPageDropdown = page.getByRole('combobox', {
    name: 'Rows per page',
  });

  expect(rowsPerPageDropdown).toHaveText('25');

  const rows = page.getByRole('rowgroup').last().getByRole('row');
  // have to add 1 to expected column count to account for select column
  const tempCellInFirstRow = rows.first().getByRole('cell').nth(2);

  await expect(rows).toHaveCount(25);

  await expect(tempCellInFirstRow).toHaveText('1', {
    timeout: 40000,
  });

  await page.locator('text=Plots').click();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('text=Create a plot').click(),
  ]);

  await popup.locator('label:has-text("Search")').fill('a');
  await popup.getByRole('option', { name: 'a', exact: true }).click();

  await popup.locator('[aria-label="close settings"]').click();

  // wait for open settings button to be visible i.e. menu is fully closed
  await popup.locator('[aria-label="open settings"]').click({ trial: true });

  const chart = await popup.locator('#my-chart');
  expect(
    await chart.screenshot({
      type: 'png',
    })
    // 150 pixels would only be very minor changes, so it's safe to ignore
  ).toMatchSnapshot({ maxDiffPixels: 150 });
});

test('creates multiple complex functions', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Functions' }).click();

  const nameFields = await page.locator('label:has-text("Name")');
  const expressionFields = await page.locator('label:has-text("Expression")');

  await nameFields.first().fill('test');
  await expressionFields.first().fill('centre');
  await expressionFields.first().press('Enter');
  await expressionFields.first().fill('(');
  await expressionFields.first().press('Enter');
  await expressionFields.first().fill('D100 HJ photodiode trace');
  await expressionFields.first().press('Enter');
  await expressionFields.first().fill(')');
  await expressionFields.first().press('Enter');

  await page.getByRole('button', { name: 'Add new function' }).click();

  await nameFields.last().fill('test_2');

  await expressionFields.last().fill('test');
  await expressionFields.last().press('Enter');
  await expressionFields.last().fill('+');
  await expressionFields.last().press('Enter');
  await expressionFields.last().fill('Mean');
  await expressionFields.last().press('Enter');
  await expressionFields.last().fill('(');
  await expressionFields.last().press('Enter');
  await expressionFields.last().fill('D100 HJ photodiode trace');
  await expressionFields.last().press('Enter');
  await expressionFields.last().fill(')');
  await expressionFields.last().press('Enter');

  // Click on the apply button
  await page.getByRole('button', { name: 'Apply' }).click();

  await expect(page.getByText('1.3971397139713973e-8')).toBeVisible({
    timeout: 40000,
  });
});
