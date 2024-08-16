import { test, expect } from '@playwright/test';

type CallBackFind<T> = (
  value: T,
  index?: number,
  collection?: T[]
) => Promise<boolean>;

/**
 * Async Find function
 *
 * @export
 * @template T
 * @param {T[]} elements
 * @param {CallBackFind<T>} cb
 * @returns {Promise<T | undefined>}
 */
async function aFind<T>(
  elements: T[],
  cb: CallBackFind<T>
): Promise<T | undefined> {
  for (const [index, element] of elements.entries()) {
    if (await cb(element, index, elements)) {
      return element;
    }
  }

  return undefined;
}

let sessionId: string | undefined;

// ensure the session we created is deleted in case the test fails
test.afterEach(async ({ request, context }) => {
  if (sessionId) {
    const { apiUrl } = await (
      await request.get('/operationsgateway-settings.json')
    ).json();

    const token = (await context.storageState()).origins[0].localStorage.find(
      (v) => v.name === 'scigateway:token'
    )?.value;

    await request.delete(`${apiUrl}/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
});

test('should be able to create a session, reload the session, edit it and delete it', async ({
  page,
}) => {
  // test is slow because have to do full CRUD of session in single test
  test.slow();

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

  for (const row of await page.getByRole('checkbox').all()) await row.check();

  await page.getByRole('button', { name: 'Add Channels' }).click();

  // open multiple windows - check they get re-opened when session restored
  const [imagePopup] = await Promise.all([
    page.waitForEvent('popup'),
    page
      .getByAltText('D100 pre-amp 1 FF [micro] image', { exact: false })
      .first()
      .click(),
  ]);

  await imagePopup.evaluate(() => {
    window.moveTo(100, 100);
  });

  await imagePopup.setViewportSize({ height: 100, width: 100 });

  const [tracePopup] = await Promise.all([
    page.waitForEvent('popup'),
    page
      .getByAltText('D100 pre-amp 1 photodiode trace waveform ', {
        exact: false,
      })
      .first()
      .click(),
  ]);

  await tracePopup.evaluate(() => {
    window.moveTo(200, 200);
  });
  await tracePopup.setViewportSize({ height: 200, width: 200 });

  await page.getByRole('tab', { name: 'Plots' }).click();
  // open up popup
  const [plotPopup] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('button', { name: 'Create a plot' }).click(),
  ]);
  await plotPopup.evaluate(() => {
    window.moveTo(300, 300);
  });
  await plotPopup.setViewportSize({ height: 300, width: 300 });

  await page.getByRole('button', { name: 'Save as' }).click();

  await page.getByRole('textbox', { name: 'Name' }).fill('e2e testing session');
  await page
    .getByRole('textbox', { name: 'Summary' })
    .fill('test session summary');

  // listen for sessions response to get the ID of the session we create
  // so we can ensure it's tidied up later
  const responsePromise = page.waitForResponse('**/sessions?*');

  await page.getByRole('button', { name: 'Save' }).click();

  const response = await responsePromise;
  sessionId = await response.json();

  await expect(
    page.getByRole('dialog', { name: 'Save Session' })
  ).not.toBeVisible();

  // reload page
  await page.reload();

  const popups: (typeof page)[] = [];
  page.on('popup', async (popup) => {
    await popup.waitForLoadState();
    popups.push(popup);
  });

  // load session
  await page
    .getByRole('button', { name: 'e2e testing session', exact: true })
    .click();

  await expect(page.getByRole('progressbar')).toBeVisible();
  await expect(page.getByRole('progressbar')).not.toBeVisible({
    timeout: 10000,
  });

  await expect(popups).toHaveLength(3);

  const newImagePopup = await aFind(popups, async (p) =>
    (await p.title()).includes('Image')
  );

  const imagePopupDims = await newImagePopup?.evaluate(() => {
    return {
      screenX: window.screenX,
      screenY: window.screenY,
      innerHeight: window.innerHeight,
      innerWidth: window.innerWidth,
    };
  });
  expect(imagePopupDims).toEqual({
    screenX: 100,
    screenY: 100,
    innerHeight: 100,
    innerWidth: 100,
  });

  const newTracePopup = await aFind(popups, async (p) =>
    (await p.title()).includes('Trace')
  );

  const tracePopupDims = await newTracePopup?.evaluate(() => {
    return {
      screenX: window.screenX,
      screenY: window.screenY,
      innerHeight: window.innerHeight,
      innerWidth: window.innerWidth,
    };
  });
  expect(tracePopupDims).toEqual({
    screenX: 200,
    screenY: 200,
    innerHeight: 200,
    innerWidth: 200,
  });

  const newPlotPopup = await aFind(popups, async (p) =>
    (await p.title()).includes('Untitled')
  );

  const plotPopupDims = await newPlotPopup?.evaluate(() => {
    return {
      screenX: window.screenX,
      screenY: window.screenY,
      innerHeight: window.innerHeight,
      innerWidth: window.innerWidth,
    };
  });
  expect(plotPopupDims).toEqual({
    screenX: 300,
    screenY: 300,
    innerHeight: 300,
    innerWidth: 300,
  });

  // edit session metadata

  await page
    .getByRole('button', { name: 'edit e2e testing session session' })
    .click();

  await page
    .getByRole('textbox', { name: 'Name' })
    .fill('renamed e2e testing session');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(
    page.getByRole('button', {
      name: 'renamed e2e testing session',
      exact: true,
    })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'e2e testing session', exact: true })
  ).not.toBeVisible();

  // edit session (change rows per page)

  await page
    .getByRole('combobox', {
      name: 'Rows per page',
    })
    .click();

  await page
    .getByRole('option', {
      name: '50',
    })
    .click();

  await page.getByRole('button', { name: 'Save', exact: true }).click();

  await page.reload();

  await page
    .getByRole('button', { name: 'renamed e2e testing session', exact: true })
    .click();

  await expect(
    page.getByRole('combobox', {
      name: 'Rows per page',
    })
  ).toHaveText('50');

  // delete session
  await page
    .getByRole('button', { name: 'delete renamed e2e testing session session' })
    .click();

  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(
    page.getByRole('dialog', { name: 'Delete Session' })
  ).not.toBeVisible();

  await expect(
    page.getByRole('button', {
      name: 'renamed e2e testing session',
      exact: true,
    })
  ).not.toBeVisible();

  // if we get to the end of the test, no need to run our after each code to delete the session
  // (since we just deleted it as part of the test), so reset session id
  sessionId = undefined;
});
