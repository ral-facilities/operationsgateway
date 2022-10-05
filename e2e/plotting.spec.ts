import { test, expect } from '@playwright/test';
import recordsJson from './records.json';

export const plotRecordsRoute = (context) =>
  context.route('**/records**', (route) => {
    return route.fulfill({
      body: JSON.stringify(recordsJson),
    });
  });

export const recordCountRoute = (context) =>
  context.route('**/records/count**', (route) => {
    route.fulfill({
      body: JSON.stringify(recordsJson.length),
    });
  });

test('plots a time vs shotnum graph and change the plot colour', async ({
  page,
  context,
  browserName,
}) => {
  await plotRecordsRoute(context);
  await recordCountRoute(context);

  await page.goto('/');

  await page.locator('text=Plots').click();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('text=Create a plot').click(),
  ]);

  await popup.locator('label:has-text("Title")').fill('Test time plot');

  await popup.locator('[aria-label="line chart"]').click();

  await popup.locator('label:has-text("Search")').fill('time');

  await popup.locator('text=timestamp').click();

  await popup.locator('text=Y').click();

  await popup.locator('label:has-text("Search all channels")').fill('shotnu');

  await popup.locator('text=shotnum').click();

  await popup.locator('[aria-label="Pick shotnum colour"]').click();

  await popup.locator('[aria-label="Hue"]').click();
  await popup.locator('[aria-label="Color"]').click();

  await popup.locator('[aria-label="close settings"]').click();

  // wait for open settings button to be visible i.e. menu is fully closed
  await popup.locator('[aria-label="open settings"]').click({ trial: true });

  if (browserName === 'chromium') {
    // need to close main window on chromium for some reason, as otherwise CDN libraries won't load in popup
    await page.close();
    await popup.waitForFunction(() => typeof globalThis.Chart !== undefined);
    // need this to wait for canvas animations to execute
    await popup.waitForTimeout(1000);
  }

  const chart = await popup.locator('#my-chart');
  expect(
    await chart.screenshot({
      type: 'png',
    })
    // 100 pixels would only be very minor changes, so it's safe to ignore
  ).toMatchSnapshot({ maxDiffPixels: 100 });
});

test('plots a shotnum vs channel graph with logarithmic scales', async ({
  page,
  context,
  browserName,
}) => {
  await plotRecordsRoute(context);
  await recordCountRoute(context);

  await page.goto('/');

  await page.locator('text=Plots').click();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('text=Create a plot').click(),
  ]);

  await popup.locator('label:has-text("Search")').fill('shotnu');

  await popup.locator('text=shotnum').click();

  await popup.locator('text=Log').click();

  await popup.locator('text=Y').click();

  await popup.locator('label:has-text("Search all channels")').fill('ABCDE');

  await popup.locator('text=CHANNEL_ABCDE').click();

  await popup.locator('text=Log').click();

  await popup.locator('[aria-label="close settings"]').click();

  // wait for open settings button to be visible i.e. menu is fully closed
  await popup.locator('[aria-label="open settings"]').click({ trial: true });

  if (browserName === 'chromium') {
    // need to close main window on chromium for some reason, as otherwise CDN libraries won't load in popup
    await page.close();
    await popup.waitForFunction(() => typeof globalThis.Chart !== undefined);
    // need this to wait for canvas animations to execute
    await popup.waitForTimeout(1000);
  }

  const chart = await popup.locator('#my-chart');
  expect(
    await chart.screenshot({
      type: 'png',
    })
  ).toMatchSnapshot({ maxDiffPixels: 100 });
});

test('user can zoom and pan the graph', async ({
  page,
  context,
  browserName,
}) => {
  await plotRecordsRoute(context);
  await recordCountRoute(context);

  await page.goto('/');

  await page.locator('text=Plots').click();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('text=Create a plot').click(),
  ]);

  await popup.locator('label:has-text("Search")').fill('time');

  await popup.locator('text=timestamp').click();

  await popup.locator('text=Y').click();

  await popup.locator('label:has-text("Search all channels")').fill('shotnu');

  await popup.locator('text=shotnum').click();

  await popup.locator('[aria-label="close settings"]').click();

  if (browserName === 'chromium') {
    // need to close main window on chromium for some reason, as otherwise CDN libraries won't load in popup
    await page.close();
    await popup.waitForFunction(() => typeof globalThis.Chart !== undefined);
    // need this to wait for canvas animations to execute
    await popup.waitForTimeout(1000);
  }

  const chart = await popup.locator('#my-chart');
  await chart.click();
  await popup.mouse.wheel(10, 0);
  await popup.mouse.wheel(10, 0);
  await popup.mouse.wheel(10, 0);
  await popup.mouse.wheel(10, 0);
  await popup.mouse.wheel(10, 0);

  await popup.dragAndDrop('#my-chart', '#my-chart', {
    sourcePosition: {
      x: 100,
      y: 100,
    },
    targetPosition: {
      x: 25,
      y: 25,
    },
  });

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
  ).toMatchSnapshot({ maxDiffPixels: 100 });

  // test the reset view button resets the zoom & pan
  // can't test reset zoom on chrome with the "have to close main window" workaround
  if (browserName !== 'chromium') {
    await popup.locator('text=Reset View').click({
      // delay helps remove tooltips from the plot
      delay: 1000,
    });
    // need this to wait for canvas animations to execute
    await popup.waitForTimeout(1000);

    // eslint-disable-next-line jest/no-conditional-expect
    expect(
      await chart.screenshot({
        type: 'png',
      })
    ).toMatchSnapshot({ maxDiffPixels: 100 });
  }
});

test('plots multiple channels on the y axis and displays correct tooltips', async ({
  page,
  context,
  browserName,
}) => {
  await plotRecordsRoute(context);
  await recordCountRoute(context);

  await page.goto('/');

  await page.locator('text=Plots').click();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('text=Create a plot').click(),
  ]);

  await popup.locator('label:has-text("Search")').fill('time');

  await popup.locator('text=timestamp').click();

  await popup.locator('text=Y').click();

  await popup.locator('label:has-text("Search all channels")').fill('ABCDE');

  await popup.locator('text=CHANNEL_ABCDE').click();

  await popup.locator('label:has-text("Search all channels")').fill('DEFGH');

  await popup.locator('text=CHANNEL_DEFGH').click();

  await popup.locator('label:has-text("Search all channels")').fill('shotnu');

  await popup.locator('text=shotnum').click();

  await popup.locator('[aria-label="Toggle shotnum visibility off"]').click();

  await popup.locator('[aria-label="close settings"]').click();

  if (browserName === 'chromium') {
    // need to close main window on chromium for some reason, as otherwise CDN libraries won't load in popup
    await page.close();
    await popup.waitForFunction(() => typeof globalThis.Chart !== undefined);
    // need this to wait for canvas animations to execute
    await popup.waitForTimeout(1000);
  }

  const chart = await popup.locator('#my-chart');

  // test that tooltips show up & have filtered out the channel which isn't visible
  await chart.hover({
    position: {
      x: 100,
      y: 100,
    },
  });
  // need this to wait for canvas animations to execute
  await popup.waitForTimeout(1000);

  expect(
    await chart.screenshot({
      type: 'png',
    })
  ).toMatchSnapshot({ maxDiffPixels: 100 });
});

test('user can hide gridlines and axes labels', async ({
  page,
  context,
  browserName,
}) => {
  // can't test this on chrome with the "have to close main window" workaround
  if (browserName !== 'chromium') {
    await plotRecordsRoute(context);
    await recordCountRoute(context);

    await page.goto('/');

    await page.locator('text=Plots').click();

    // open up popup
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.locator('text=Create a plot').click(),
    ]);

    await popup.locator('label:has-text("Search")').fill('time');

    await popup.locator('text=timestamp').click();

    await popup.locator('text=Y').click();

    await popup.locator('label:has-text("Search all channels")').fill('shotnu');

    await popup.locator('text=shotnum').click();

    await popup.locator('[aria-label="close settings"]').click();

    const chart = await popup.locator('#my-chart');

    // test the hide gridlines and hide axes labels button
    await popup.locator('text=Hide Grid').click({
      // delay helps remove tooltips from the plot
      delay: 1000,
    });
    // need this to wait for canvas animations to execute
    await popup.waitForTimeout(1000);

    await popup.locator('text=Hide Axes Labels').click({
      // delay helps remove tooltips from the plot
      delay: 1000,
    });
    // need this to wait for canvas animations to execute
    await popup.waitForTimeout(1000);

    // eslint-disable-next-line jest/no-conditional-expect
    expect(
      await chart.screenshot({
        type: 'png',
      })
    ).toMatchSnapshot({ maxDiffPixels: 100 });
  }
});

test('user can add from and to dates to timestamp on x-axis', async ({
  page,
  context,
  browserName,
}) => {
  // can't test on firefox (date-time pickers aren't editable in headless)
  if (browserName !== 'firefox') {
    await plotRecordsRoute(context);
    await recordCountRoute(context);

    await page.goto('/');

    await page.locator('text=Plots').click();

    // open up popup
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.locator('text=Create a plot').click(),
    ]);

    await popup.locator('label:has-text("Title")').fill('Test time plot');

    await popup.locator('[aria-label="line chart"]').click();

    await popup.locator('label:has-text("Search")').fill('time');

    await popup.locator('text=timestamp').click();

    await popup
      .locator('[aria-label="from, date-time input"]')
      .fill('2022-01-03 00:00:00');
    await popup
      .locator('[aria-label="to, date-time input"]')
      .fill('2022-01-10 00:00:00');

    await popup.locator('text=Y').click();

    await popup.locator('label:has-text("Search all channels")').fill('shotnu');

    await popup.locator('text=shotnum').click();

    await popup.locator('[aria-label="close settings"]').click();

    // wait for open settings button to be visible i.e. menu is fully closed
    await popup.locator('[aria-label="open settings"]').click({ trial: true });

    if (browserName === 'chromium') {
      // need to close main window on chromium for some reason, as otherwise CDN libraries won't load in popup
      await page.close();
      await popup.waitForFunction(() => typeof globalThis.Chart !== undefined);
      // need this to wait for canvas animations to execute
      await popup.waitForTimeout(1000);
    }

    const chart = await popup.locator('#my-chart');

    // eslint-disable-next-line jest/no-conditional-expect
    expect(
      await chart.screenshot({
        type: 'png',
      })
      // 100 pixels would only be very minor changes, so it's safe to ignore
    ).toMatchSnapshot({ maxDiffPixels: 100 });
  }
});

test('user can add min and max limits to x- and y-axis', async ({
  page,
  context,
  browserName,
}) => {
  await plotRecordsRoute(context);
  await recordCountRoute(context);

  await page.goto('/');

  await page.locator('text=Plots').click();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('text=Create a plot').click(),
  ]);

  await popup.locator('label:has-text("Title")').fill('Test shotnum plot');

  await popup.locator('[aria-label="line chart"]').click();

  await popup.locator('label:has-text("Search")').fill('shotnu');

  await popup.locator('text=shotnum').click();

  await popup.locator('label:has-text("Min")').fill('1');
  await popup.locator('label:has-text("Max")').fill('2');

  await popup.locator('text=Y').click();

  await popup.locator('label:has-text("Search all channels")').fill('ABCDE');

  await popup.locator('text=CHANNEL_ABCDE').click();

  await popup.locator('label:has-text("Min")').fill('-1');
  await popup.locator('label:has-text("Max")').fill('5');

  await popup.locator('[aria-label="close settings"]').click();

  // wait for open settings button to be visible i.e. menu is fully closed
  await popup.locator('[aria-label="open settings"]').click({ trial: true });

  if (browserName === 'chromium') {
    // need to close main window on chromium for some reason, as otherwise CDN libraries won't load in popup
    await page.close();
    await popup.waitForFunction(() => typeof globalThis.Chart !== undefined);
    // need this to wait for canvas animations to execute
    await popup.waitForTimeout(1000);
  }

  const chart = await popup.locator('#my-chart');
  expect(
    await chart.screenshot({
      type: 'png',
    })
    // 100 pixels would only be very minor changes, so it's safe to ignore
  ).toMatchSnapshot({ maxDiffPixels: 100 });
});

test('user can change line style of plotted channels', async ({
  page,
  context,
  browserName,
}) => {
  await plotRecordsRoute(context);
  await recordCountRoute(context);

  await page.goto('/');

  await page.locator('text=Plots').click();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('text=Create a plot').click(),
  ]);

  await popup.locator('[aria-label="line chart"]').click();

  await popup.locator('label:has-text("Search")').fill('time');

  await popup.locator('text=timestamp').click();

  await popup.locator('text=Y').click();

  await popup.locator('label:has-text("Search all channels")').fill('ABCDE');

  await popup.locator('text=CHANNEL_ABCDE').click();

  await popup.locator('label:has-text("Search all channels")').fill('DEFGH');

  await popup.locator('text=CHANNEL_DEFGH').click();

  await popup.locator('label:has-text("Search all channels")').fill('shotnu');

  await popup.locator('text=shotnum').click();

  await popup
    .locator('[aria-label="Change CHANNEL_ABCDE line style"]')
    .click({ force: true });
  await popup
    .locator('[aria-label="Change shotnum line style"]')
    .click({ force: true });
  await popup
    .locator('[aria-label="Change shotnum line style"]')
    .click({ force: true });

  await popup.locator('[aria-label="close settings"]').click();

  if (browserName === 'chromium') {
    // need to close main window on chromium for some reason, as otherwise CDN libraries won't load in popup
    await page.close();
    await popup.waitForFunction(() => typeof globalThis.Chart !== undefined);
    // need this to wait for canvas animations to execute
    await popup.waitForTimeout(1000);
  }

  const chart = await popup.locator('#my-chart');

  // test that tooltips show up & have filtered out the channel which isn't visible
  await chart.hover({
    position: {
      x: 100,
      y: 100,
    },
  });
  // need this to wait for canvas animations to execute
  await popup.waitForTimeout(1000);

  expect(
    await chart.screenshot({
      type: 'png',
    })
  ).toMatchSnapshot({ maxDiffPixels: 100 });
});
