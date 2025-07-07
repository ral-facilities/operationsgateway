import { expect, test } from '@playwright/test';

test('creates a plot, changes its name, and saves the session with the plot', async ({
  page,
  browserName,
}) => {
  await page.goto('/');

  await page.locator('text=Plots').click();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('text=Create a plot').click(),
  ]);

  await popup.locator('label:has-text("Title")').fill('Test time plot');
  await page.locator('text=Data').click();

  await page.getByLabel('from, date-time input').fill('2023-06-04 00:00');
  await page.getByLabel('to, date-time input').fill('2023-06-05 08:00');

  await page.getByRole('radio', { name: 'Unlimited' }).click();

  await page.getByRole('button', { name: 'Search', exact: true }).click();

  await page.getByRole('button', { name: 'Save as' }).click();

  await page
    .getByRole('textbox', { name: 'Name' })
    .fill('e2e session plot save');
  await page
    .getByRole('textbox', { name: 'Summary' })
    .fill('test session summary');

  // listen for sessions response to get the ID of the session we create
  // so we can ensure it's tidied up later
  const responsePromise = page.waitForResponse('**/sessions?*');

  await page.getByRole('button', { name: 'Save' }).click();

  await responsePromise;

  await expect(
    page.getByRole('dialog', { name: 'Save Session' })
  ).not.toBeVisible();

  const getResponsePromise = page.waitForResponse(`**/sessions/5`);

  const getResponse = await getResponsePromise;
  const responseData = await getResponse.json();

  const plotIds = Object.keys(responseData.session.plots);
  expect(plotIds.length).toBe(1);
  const plotId = plotIds[0];
  let screenY = 0;
  let screenX = 0;
  switch (browserName) {
    case 'chromium':
      screenY = 166;
      screenX = 200;
      break;
    case 'firefox':
      screenY = 200;
      screenX = 200;
      break;
    case 'webkit':
      screenY = 0;
      screenX = 0;
      break;
    default:
      screenY = 200;
      screenX = 200;
  }
  expect(responseData).toEqual(
    expect.objectContaining({
      session: expect.objectContaining({
        plots: expect.objectContaining({
          [plotId]: expect.objectContaining({
            title: 'Test time plot',
            innerHeight: 400,
            screenX: screenX,
            screenY: screenY,
            innerWidth: 600,
          }),
        }),
      }),
    })
  );
});

test('creates a plot, resizes the window, changes its name, and saves the session with the plot', async ({
  page,
  browserName,
}) => {
  await page.goto('/');

  await page.locator('text=Plots').click();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('text=Create a plot').click(),
  ]);

  const resizedWidth = 1200;
  const resizedHeight = 800;

  // Resize the popup window
  await popup.setViewportSize({ width: resizedWidth, height: resizedHeight });

  await popup.locator('label:has-text("Title")').fill('Test time plot');
  await page.locator('text=Data').click();

  await page.getByLabel('from, date-time input').fill('2023-06-04 00:00');
  await page.getByLabel('to, date-time input').fill('2023-06-05 08:00');

  await page.getByRole('radio', { name: 'Unlimited' }).click();

  await page.getByRole('button', { name: 'Search', exact: true }).click();

  await page.getByRole('button', { name: 'Save as' }).click();

  await page
    .getByRole('textbox', { name: 'Name' })
    .fill('e2e session plot save');
  await page
    .getByRole('textbox', { name: 'Summary' })
    .fill('test session summary');

  // listen for sessions response to get the ID of the session we create
  // so we can ensure it's tidied up later
  const responsePromise = page.waitForResponse('**/sessions?*');

  await page.getByRole('button', { name: 'Save' }).click();

  await responsePromise;

  await expect(
    page.getByRole('dialog', { name: 'Save Session' })
  ).not.toBeVisible();

  const getResponsePromise = page.waitForResponse(`**/sessions/5`);

  const getResponse = await getResponsePromise;
  const responseData = await getResponse.json();

  const plotIds = Object.keys(responseData.session.plots);
  expect(plotIds.length).toBe(1);
  const plotId = plotIds[0];
  let screenY = 0;
  let screenX = 0;
  switch (browserName) {
    case 'chromium':
      screenY = 166;
      screenX = 200;
      break;
    case 'firefox':
      screenY = 200;
      screenX = 200;
      break;
    case 'webkit':
      screenY = 0;
      screenX = 0;
      break;
    default:
      screenY = 200;
      screenX = 200;
  }
  expect(responseData).toEqual(
    expect.objectContaining({
      session: expect.objectContaining({
        plots: expect.objectContaining({
          [plotId]: expect.objectContaining({
            title: 'Test time plot',
            innerHeight: resizedHeight,
            screenX: screenX,
            screenY: screenY,
            innerWidth: resizedWidth,
          }),
        }),
      }),
    })
  );
});
