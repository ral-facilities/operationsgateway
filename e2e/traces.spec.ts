import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');

  // add trace channel to the table so we can click on a trace
  await page.getByRole('button', { name: 'Data channels' }).click();

  await page
    .getByRole('combobox', { name: 'Search data channels' })
    .type('CDEFG');

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await page.getByRole('checkbox', { name: 'Channel_CDEFG' }).click();

  await page.getByRole('button', { name: 'Add Channels' }).click();
});

test('user can show points for the trace', async ({ page }) => {
  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page
      .getByAltText('Channel_CDEFG waveform', { exact: false })
      .first()
      .click(),
  ]);

  await popup.getByRole('button', { name: 'Show points' }).click();

  const chart = await popup.locator('#my-chart');
  // need this to wait for canvas animations to execute
  await popup.waitForTimeout(1000);

  expect(
    await chart.screenshot({
      type: 'png',
    })
  ).toMatchSnapshot({ maxDiffPixels: 150 });
});

test('user can zoom and pan the trace', async ({ page }) => {
  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page
      .getByAltText('Channel_CDEFG waveform', { exact: false })
      .first()
      .click(),
  ]);

  const chart = await popup.locator('#my-chart');
  await chart.click();

  // test drag to zoom
  await popup.dragAndDrop('#my-chart', '#my-chart', {
    sourcePosition: {
      x: 300,
      y: 190,
    },
    targetPosition: {
      x: 525,
      y: 270,
    },
  });

  await popup.mouse.wheel(-10, 0);
  await popup.mouse.wheel(-10, 0);
  await popup.mouse.wheel(-10, 0);
  await popup.mouse.wheel(-10, 0);
  await popup.mouse.wheel(-10, 0);

  await popup.keyboard.down('Shift');
  await popup.dragAndDrop('#my-chart', '#my-chart', {
    sourcePosition: {
      x: 150,
      y: 150,
    },
    targetPosition: {
      x: 50,
      y: 50,
    },
  });
  await popup.keyboard.up('Shift');

  // click far side of chart to remove any tooltips
  await chart.click({
    position: {
      x: 500,
      y: 200,
    },
    delay: 1000,
  });
  // need this to wait for canvas animations to execute
  await popup.waitForTimeout(1000);

  expect(
    await chart.screenshot({
      type: 'png',
    })
  ).toMatchSnapshot({ maxDiffPixels: 150 });

  await popup.locator('text=Reset View').click({
    // delay helps remove tooltips from the plot
    delay: 1000,
  });
  // need this to wait for canvas animations to execute
  await popup.waitForTimeout(1000);

  expect(
    await chart.screenshot({
      type: 'png',
    })
  ).toMatchSnapshot({ maxDiffPixels: 150 });
});
