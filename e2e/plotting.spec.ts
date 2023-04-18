import { expect, test } from '@playwright/test';

test('plots a time vs shotnum graph and change the plot colour', async ({
  page,
}) => {
  await page.goto('/');

  await page.locator('text=Plots').click();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('text=Create a plot').click(),
  ]);

  await popup.locator('label:has-text("Title")').fill('Test time plot');

  await popup.locator('[aria-label="line chart"]').click();

  await popup.locator('label:has-text("Search all channels")').fill('Shot Num');

  await popup.getByRole('option', { name: 'Shot Number', exact: true }).click();

  // scroll down to get options button in full view
  await popup.mouse.wheel(0, 200);

  await popup.locator('[aria-label="More options for Shot Number"]').click();
  await popup.locator('[aria-label="Pick Shot Number colour"]').click();
  await popup.locator('[aria-label="Hue"]').click();
  await popup.locator('[aria-label="Color"]').click();

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

test('plots a shotnum vs channel graph with logarithmic scales', async ({
  page,
}) => {
  await page.goto('/');

  await page.locator('text=Plots').click();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('text=Create a plot').click(),
  ]);

  await popup.getByRole('button', { name: 'XY' }).click();

  await popup.locator('label:has-text("Search")').fill('Shot Num');

  await popup.getByRole('option', { name: 'Shot Number', exact: true }).click();

  await popup.locator('text=Log').click();

  await popup.getByRole('tab', { name: 'Y' }).click();

  await popup.locator('label:has-text("Search all channels")').fill('ABCDE');

  await popup.locator('text=Channel_ABCDE').click();

  await popup.locator('text=Log').click();

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

test('user can zoom and pan the graph', async ({ page }) => {
  await page.goto('/');

  await page.locator('text=Plots').click();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('text=Create a plot').click(),
  ]);

  await popup.locator('label:has-text("Search all channels")').fill('Shot Num');

  await popup.getByRole('option', { name: 'Shot Number', exact: true }).click();

  await popup.locator('[aria-label="close settings"]').click();

  const chart = await popup.locator('#my-chart');
  await chart.click();

  // test drag to zoom
  await popup.dragAndDrop('#my-chart', '#my-chart', {
    sourcePosition: {
      x: 250,
      y: 120,
    },
    targetPosition: {
      x: 450,
      y: 180,
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

test('plots multiple channels on the y axis', async ({ page }) => {
  await page.goto('/');

  await page.locator('text=Plots').click();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('text=Create a plot').click(),
  ]);

  await popup.locator('label:has-text("Search all channels")').fill('ABCDE');

  await popup.locator('text=Channel_ABCDE').click();

  await popup.locator('label:has-text("Search all channels")').fill('DEFGH');

  await popup.locator('text=Channel_DEFGH').click();

  await popup.locator('label:has-text("Search all channels")').fill('Shot Num');

  await popup.getByRole('option', { name: 'Shot Number', exact: true }).click();

  await popup.locator('[aria-label="More options for Shot Number"]').click();
  await popup
    .locator('[aria-label="toggle Shot Number visibility off"]')
    .click();

  // add to the right Y axis as when we hide the channel the right Y axis shouldn't be visible
  await popup.getByRole('button', { name: 'Right' }).click();

  await popup.locator('label:has-text("Search all channels")').fill('GHIJK');

  await popup.locator('text=Channel_GHIJK').click();

  await popup.locator('[aria-label="More options for Channel_GHIJK"]').click();
  await popup
    .locator('[aria-label="toggle Channel_GHIJK visibility off"]')
    .click();

  await popup.locator('[aria-label="close settings"]').click();

  const chart = await popup.locator('#my-chart');

  // need this to wait for canvas animations to execute
  await popup.waitForTimeout(1000);

  expect(
    await chart.screenshot({
      type: 'png',
    })
  ).toMatchSnapshot({ maxDiffPixels: 150 });
});

test('user can hide gridlines and axes labels', async ({ page }) => {
  await page.goto('/');

  await page.locator('text=Plots').click();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('text=Create a plot').click(),
  ]);

  await popup.locator('label:has-text("Search all channels")').fill('Shot Num');

  await popup.getByRole('option', { name: 'Shot Number', exact: true }).click();

  await popup.locator('[aria-label="close settings"]').click();

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

  const chart = await popup.locator('#my-chart');

  expect(
    await chart.screenshot({
      type: 'png',
    })
  ).toMatchSnapshot({ maxDiffPixels: 150 });
});

test('user can add from and to dates to timestamp on x-axis', async ({
  page,
}) => {
  await page.goto('/');

  await page.locator('text=Plots').click();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('text=Create a plot').click(),
  ]);

  await popup.locator('label:has-text("Title")').fill('Test time plot');

  await popup.locator('[aria-label="line chart"]').click();

  await popup
    .locator('[aria-label="from, date-time input"]')
    .fill('2022-01-03 00:00:00');
  await popup
    .locator('[aria-label="to, date-time input"]')
    .fill('2022-01-10 00:00:00');

  await popup.locator('label:has-text("Search all channels")').fill('Shot Num');

  await popup.getByRole('option', { name: 'Shot Number', exact: true }).click();

  await popup.locator('[aria-label="close settings"]').click();

  // wait for open settings button to be visible i.e. menu is fully closed
  await popup.locator('[aria-label="open settings"]').click({ trial: true });

  const chart = await popup.locator('#my-chart');

  // eslint-disable-next-line jest/no-conditional-expect
  expect(
    await chart.screenshot({
      type: 'png',
    })
    // 150 pixels would only be very minor changes, so it's safe to ignore
  ).toMatchSnapshot({ maxDiffPixels: 150 });
});

test('user can add min and max limits to x- and y-axis', async ({ page }) => {
  await page.goto('/');

  await page.locator('text=Plots').click();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('text=Create a plot').click(),
  ]);

  await popup.getByRole('button', { name: 'XY' }).click();

  await popup.locator('label:has-text("Title")').fill('Test Shot Number plot');

  await popup.locator('label:has-text("Search")').fill('Shot Num');

  await popup.getByRole('option', { name: 'Shot Number', exact: true }).click();

  await popup.locator('label:has-text("Min")').fill('1');
  await popup.locator('label:has-text("Max")').fill('2');

  await popup.getByRole('tab', { name: 'Y' }).click();

  await popup.locator('label:has-text("Search all channels")').fill('ABCDE');

  await popup.locator('text=Channel_ABCDE').click();

  await popup.locator('label:has-text("Min")').fill('-1');
  await popup.locator('label:has-text("Max")').fill('5');

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

test('user can change line style of plotted channels', async ({ page }) => {
  await page.goto('/');

  await page.locator('text=Plots').click();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('text=Create a plot').click(),
  ]);

  await popup.locator('[aria-label="line chart"]').click();

  await popup.locator('label:has-text("Search all channels")').fill('ABCDE');

  await popup.locator('text=Channel_ABCDE').click();

  await popup.locator('label:has-text("Search all channels")').fill('DEFGH');

  await popup.locator('text=Channel_DEFGH').click();

  await popup.locator('label:has-text("Search all channels")').fill('Shot Num');

  await popup.getByRole('option', { name: 'Shot Number', exact: true }).click();

  await popup.locator('[aria-label="More options for Channel_DEFGH"]').click();
  await popup
    .locator('[aria-label="change Channel_DEFGH line style"]')
    .selectOption('dashed');

  await popup.locator('[aria-label="More options for Shot Number"]').click();
  await popup
    .locator('[aria-label="change Shot Number line style"]')
    .selectOption('dotted');

  await popup.locator('[aria-label="close settings"]').click();

  const chart = await popup.locator('#my-chart');

  // need this to wait for canvas animations to execute
  await popup.waitForTimeout(1000);

  expect(
    await chart.screenshot({
      type: 'png',
    })
  ).toMatchSnapshot({ maxDiffPixels: 150 });
});

test('changes to and from dateTimes to use 0 seconds and 59 seconds respectively', async ({
  page,
}) => {
  await page.goto('/');

  await page.locator('text=Plots').click();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('text=Create a plot').click(),
  ]);

  await popup.locator('label:has-text("Title")').fill('Test time plot');

  await popup.locator('[aria-label="line chart"]').click();

  await popup.locator('label:has-text("Search all channels")').fill('Shot Num');

  await popup.getByRole('option', { name: 'Shot Number', exact: true }).click();

  await popup
    .locator('[aria-label="from, date-time input"]')
    .fill('2022-01-10 23:57');
  await popup
    .locator('[aria-label="to, date-time input"]')
    .fill('2022-01-11 00:03');

  // scroll down to get options button in full view
  await popup.mouse.wheel(0, 200);

  await popup.locator('[aria-label="More options for Shot Number"]').click();
  await popup.locator('[aria-label="Pick Shot Number colour"]').click();
  await popup.locator('[aria-label="Hue"]').click();
  await popup.locator('[aria-label="Color"]').click();

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

test('user can plot channels on the right y axis', async ({ page }) => {
  await page.goto('/');

  await page.evaluate(async () => {
    const { msw } = window;

    const response = await fetch('/records');
    const responseBody = await response.json();

    const modifiedRecordsJson = responseBody.map((record) => {
      const newRecord = JSON.parse(JSON.stringify(record));
      if (newRecord.channels.CHANNEL_DEFGH) {
        newRecord.channels.CHANNEL_DEFGH.data =
          newRecord.channels.CHANNEL_DEFGH.data * 100000;
      }
      return newRecord;
    });

    msw.worker.use(
      msw.rest.get('/records', async (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(modifiedRecordsJson));
      })
    );
  });

  await page.locator('text=Plots').click();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('text=Create a plot').click(),
  ]);

  await popup.locator('[aria-label="line chart"]').click();

  // users can add channels to the right y axis directly when "right" is selected as the axis
  await popup.locator('text=Right').click();

  await popup.locator('label:has-text("Search all channels")').fill('ABCDE');

  const channel_ABCDE = await popup.locator('text=Channel_ABCDE');
  await channel_ABCDE.click();

  await popup.locator('label:has-text("Search all channels")').fill('DEFGH');

  await popup.locator('text=Channel_DEFGH').click();

  await popup.locator('[aria-label="More options for Channel_ABCDE"]').click();

  // move ABCDE over to left axis - tests that users can move channels between left & right
  await popup
    .getByRole('radiogroup', { name: 'Y Axis' })
    .getByRole('radio', { name: 'Left' })
    .click();

  // should not exist anymore as it's moved over to the left "tab"
  await expect(channel_ABCDE).toHaveCount(0);

  // test that scale & min/max controls work for right y axis
  await popup.locator('text=Log').click();

  await popup.locator('label:has-text("Min")').fill('900000');
  await popup.locator('label:has-text("Max")').fill('1500000');

  await popup.locator('[aria-label="close settings"]').click();

  const chart = await popup.locator('#my-chart');

  // need this to wait for canvas animations to execute
  await popup.waitForTimeout(1000);

  expect(
    await chart.screenshot({
      type: 'png',
    })
  ).toMatchSnapshot({ maxDiffPixels: 150 });
});

test('user can customize y axis labels', async ({
  page,
  context,
  browserName,
}) => {
  await page.goto('/');

  await page.locator('text=Plots').click();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('text=Create a plot').click(),
  ]);

  await popup.locator('label:has-text("Search")').fill('Shot Num');

  await popup.getByRole('option', { name: 'Shot Number', exact: true }).click();
  await popup.getByRole('textbox', { name: 'Label' }).type('left y axis');
  await popup.getByRole('button', { name: 'Right' }).click();
  await popup.getByRole('textbox', { name: 'Label' }).type('right y axis');

  const chart = await popup.locator('#my-chart');

  expect(
    await chart.screenshot({
      type: 'png',
    })
  ).toMatchSnapshot({ maxDiffPixels: 150 });
});
