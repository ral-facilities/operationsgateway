import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('from, date-time input').fill('2023-06-04 00:00');
  await page.getByLabel('to, date-time input').fill('2023-06-05 08:00');

  await page.getByRole('radio', { name: 'Unlimited' }).click();

  await page.getByRole('button', { name: 'Search', exact: true }).click();

  // add trace channel to the table so we can click on a trace
  await page.getByRole('button', { name: 'Data channels' }).click();

  await page
    .getByRole('combobox', { name: 'Search data channels' })
    .fill('Temperature 209');

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await page.getByRole('button', { name: 'Add this channel' }).click();

  await page.getByRole('button', { name: 'Add Channels' }).click();
});

test('should be able to paginate the table', async ({ page }) => {
  const rowsPerPageDropdown = page.getByRole('combobox', {
    name: 'Rows per page',
  });

  expect(rowsPerPageDropdown).toHaveText('25');

  // have to ignore header rowgroup
  const rows = page.getByRole('rowgroup').last().getByRole('row');
  // have to add 1 to expected column count to account for select column
  const tempCellInFirstRow = rows.first().getByRole('cell').nth(2);

  await expect(rows).toHaveCount(25);

  await expect(tempCellInFirstRow).toHaveText('20.115581761611374');

  await rowsPerPageDropdown.click();
  await page
    .getByRole('option', {
      name: '100',
    })
    .click();

  await expect(rows).toHaveCount(100);

  await page.getByRole('button', { name: 'Go to next page' }).click();

  await expect(tempCellInFirstRow).toHaveText('20.266815385403625');

  await page.getByRole('button', { name: 'Go to next page' }).click();
  await page.getByRole('button', { name: 'Go to next page' }).click();

  await expect(rows).toHaveCount(21);
  await expect(tempCellInFirstRow).toHaveText('21.89684196711124');

  await page.getByRole('button', { name: 'Go to previous page' }).click();

  await expect(tempCellInFirstRow).toHaveText('20.310703280127576');
});

test('should be able to sort the table', async ({ page }) => {
  // have to ignore header rowgroup
  const rows = page.getByRole('rowgroup').last().getByRole('row');
  // have to add 1 to expected column count to account for select column
  const timeCellInFirstRow = rows.first().getByRole('cell').nth(1);
  // have to add 1 to expected column count to account for select column
  const tempCellInFirstRow = rows.first().getByRole('cell').nth(2);

  // should be sorted by time asc by default
  await expect(timeCellInFirstRow).toHaveText('2023-06-04 00:00:00');
  await expect(tempCellInFirstRow).toHaveText('20.115581761611374');

  await page.getByRole('columnheader', { name: 'Temperature 209' }).click();
  await expect(timeCellInFirstRow).toHaveText('2023-06-04 15:48:00');
  await expect(tempCellInFirstRow).toHaveText('20.001186732803603');

  await page.getByRole('columnheader', { name: 'Temperature 209' }).click();
  await expect(timeCellInFirstRow).toHaveText('2023-06-05 02:36:00');
  await expect(tempCellInFirstRow).toHaveText('21.98233518946611');
});
