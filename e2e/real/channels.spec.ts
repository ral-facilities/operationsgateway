import { test, expect } from '@playwright/test';

test('should be able to view the channel summary', async ({ page }) => {
  test.skip(
    process.env.CI !== 'true',
    'This test will only pass against CI data'
  );

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

  // scalar channel
  await page.getByRole('button', { name: 'D100 pre-amp 1 energy' }).click();

  await expect(page.getByText('Channel type: scalar')).toBeVisible();
  await expect(page.getByText('Units: J')).toBeVisible();
  await expect(
    page.getByText('First data date: 2023-06-05 08:00:00')
  ).toBeVisible();
  await expect(
    page.getByText('Most recent data date: 2023-06-05 16:00:00')
  ).toBeVisible();

  await expect(page.getByText('0.00921039736398388')).toBeVisible();
  await expect(page.getByText('0.009568768723096999')).toBeVisible();

  // image channel
  await page.getByRole('button', { name: 'D100 pre-amp 1 FF [micro]' }).click();

  await expect(page.getByText('Channel type: image')).toBeVisible();
  await expect(
    page.getByText('First data date: 2023-06-05 08:00:00')
  ).toBeVisible();
  await expect(
    page.getByText('Most recent data date: 2023-06-05 16:00:00')
  ).toBeVisible();
  expect(
    await page.getByRole('table', { name: 'recent data' }).screenshot({
      type: 'png',
    })
  ).toMatchSnapshot({
    maxDiffPixels: 150,
  });

  // waveform channel
  await page
    .getByRole('button', { name: 'D100 pre-amp 1 photodiode trace' })
    .click();

  await expect(page.getByText('Channel type: waveform')).toBeVisible();
  await expect(
    page.getByText('First data date: 2023-06-05 08:00:00')
  ).toBeVisible();
  await expect(
    page.getByText('Most recent data date: 2023-06-05 16:00:00')
  ).toBeVisible();
  expect(
    await page.getByRole('table', { name: 'recent data' }).screenshot({
      type: 'png',
    })
  ).toMatchSnapshot({
    maxDiffPixels: 150,
  });
});

// don't need to test selecting channels, as that gets tested in most other tests
