import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');

  // add trace channel to the table so we can click on a trace
  await page.getByRole('button', { name: 'Data channels' }).click();

  await page
    .getByRole('combobox', { name: 'Search data channels' })
    .type('BCDEF');

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await page.getByRole('checkbox', { name: 'Channel_BCDEF' }).click();

  await page.getByRole('button', { name: 'Add Channels' }).click();
});

test('user can zoom and pan the image', async ({ page }) => {
  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByAltText('Channel_BCDEF image', { exact: false }).first().click(),
  ]);

  const canvas = await popup.getByTestId('overlay');

  // test drag to zoom
  await popup.dragAndDrop(
    '[data-testid="overlay"]',
    '[data-testid="overlay"]',
    {
      sourcePosition: {
        x: 62,
        y: 45,
      },
      targetPosition: {
        x: 222,
        y: 174,
      },
    }
  );

  await popup.keyboard.down('Shift');
  await popup.dragAndDrop(
    '[data-testid="overlay"]',
    '[data-testid="overlay"]',
    {
      sourcePosition: {
        x: 488,
        y: 354,
      },
      targetPosition: {
        x: 188,
        y: 144,
      },
    }
  );
  await popup.keyboard.up('Shift');

  expect(
    await canvas.screenshot({
      type: 'png',
    })
  ).toMatchSnapshot();

  await popup.locator('text=Reset View').click();

  expect(
    await canvas.screenshot({
      type: 'png',
    })
  ).toMatchSnapshot();
});
