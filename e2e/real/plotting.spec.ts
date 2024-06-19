import { test, expect } from '@playwright/test';

test('plots a time vs channel graph', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('from, date-time input').fill('2023-06-04 00:00');
  await page.getByLabel('to, date-time input').fill('2023-06-05 08:00');

  await page.getByRole('button', { name: 'Search', exact: true }).click();

  await page.locator('text=Plots').click();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('text=Create a plot').click(),
  ]);

  await popup.locator('label:has-text("Title")').fill('Test time plot');

  await popup.locator('[aria-label="line chart"]').click();

  await popup.locator('label:has-text("Search all channels")').fill('209');

  await popup
    .getByRole('option', { name: 'Temperature 209:1', exact: true })
    .click();

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

test('plots a channel vs channel graph', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('from, date-time input').fill('2023-06-04 00:00');
  await page.getByLabel('to, date-time input').fill('2023-06-05 08:00');

  await page.getByRole('radio', { name: 'Unlimited' }).click();

  await page.getByRole('button', { name: 'Search', exact: true }).click();

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

  const chart = await popup.locator('#my-chart');
  expect(
    await chart.screenshot({
      type: 'png',
    })
  ).toMatchSnapshot({ maxDiffPixels: 150 });
});
