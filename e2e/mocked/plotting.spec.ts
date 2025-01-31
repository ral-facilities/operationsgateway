import { expect, test } from '@playwright/test';
import type { PlotlyHTMLElement } from 'plotly.js';

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

  const chart = await popup.locator('.plotly-chart');
  await expect(chart).toHaveScreenshot({ maxDiffPixels: 150 });
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

  const chart = await popup.locator('.plotly-chart');
  await expect(chart).toHaveScreenshot({ maxDiffPixels: 150 });
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
  // wait for open settings button to be visible i.e. menu is fully closed
  await popup.locator('[aria-label="open settings"]').click({ trial: true });

  const chart = await popup.locator('.plotly-chart');

  // test drag to zoom
  await chart.dragTo(chart, {
    force: true, // need to force: true here because of .dragcover element covers the plot
    sourcePosition: {
      x: 200,
      y: 70,
    },
    targetPosition: {
      x: 500,
      y: 170,
    },
  });

  // setup so we wait for mouse wheel zoom out to happen before panning
  chart.evaluate((chart: PlotlyHTMLElement) => {
    window['plotly_redraws'] = 0;
    chart.on('plotly_relayout', () => {
      window['plotly_redraws'] += 1;
      chart.removeAllListeners('plotly_relayout');
    });
  });

  const watchDog = popup.waitForFunction(() => window['plotly_redraws'] > 0);

  await chart.hover(); // hover chart to move mouse to center of chart to make the scroll out consistent
  await popup.mouse.wheel(0, 20);

  await watchDog;

  await popup.keyboard.down('Shift');
  await chart.dragTo(chart, {
    force: true,
    sourcePosition: {
      x: 150,
      y: 150,
    },
    targetPosition: {
      x: 90,
      y: 80,
    },
  });
  await popup.keyboard.up('Shift');

  await popup.mouse.move(0, 0); // move mouse out of way to remove any tooltips
  await expect(chart).toHaveScreenshot({ maxDiffPixels: 150 });

  await popup.locator('text=Reset View').click();

  await expect(chart).toHaveScreenshot({ maxDiffPixels: 150 });
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

  // wait for open settings button to be visible i.e. menu is fully closed
  await popup.locator('[aria-label="open settings"]').click({ trial: true });

  const chart = await popup.locator('.plotly-chart');

  await expect(chart).toHaveScreenshot({ maxDiffPixels: 150 });
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
  await popup.locator('text=Hide Grid').click();

  await popup.locator('text=Hide Axes Labels').click();

  const chart = await popup.locator('.plotly-chart');

  await expect(chart).toHaveScreenshot({ maxDiffPixels: 150 });
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

  await popup.locator('label:has-text("Search all channels")').fill('Shot Num');

  await popup.getByRole('option', { name: 'Shot Number', exact: true }).click();

  await popup
    .locator('[aria-label="from, date-time input"]')
    .fill('2022-01-03 00:00');

  await popup
    .locator('[aria-label="to, date-time input"]')
    .fill('2022-01-10 00:00');

  await popup.locator('[aria-label="close settings"]').click();

  // wait for open settings button to be visible i.e. menu is fully closed
  await popup.locator('[aria-label="open settings"]').click({ trial: true });

  const chart = await popup.locator('.plotly-chart');

  await expect(chart).toHaveScreenshot({ maxDiffPixels: 150 });
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

  const chart = await popup.locator('.plotly-chart');
  await expect(chart).toHaveScreenshot({ maxDiffPixels: 150 });
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
    .selectOption('dash');

  await popup.locator('[aria-label="More options for Shot Number"]').click();
  await popup
    .locator('[aria-label="change Shot Number line style"]')
    .selectOption('dot');

  await popup.locator('[aria-label="close settings"]').click();

  // wait for open settings button to be visible i.e. menu is fully closed
  await popup.locator('[aria-label="open settings"]').click({ trial: true });

  const chart = await popup.locator('.plotly-chart');

  await expect(chart).toHaveScreenshot({ maxDiffPixels: 150 });
});

test('user can change the marker style and size of plotted channels', async ({
  page,
}) => {
  await page.goto('/');

  await page.locator('text=Plots').click();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('text=Create a plot').click(),
  ]);

  await popup.locator('[aria-label="line chart"]').click();

  await popup.locator('label:has-text("Search all channels")').fill('Shot Num');

  await popup.getByRole('option', { name: 'Shot Number', exact: true }).click();

  await popup.locator('label:has-text("Search all channels")').fill('ABCDE');

  await popup.locator('text=Channel_ABCDE').click();

  await popup.locator('[aria-label="More options for Channel_ABCDE"]').click();

  await popup.getByLabel('change Channel_ABCDE marker size').fill('2');

  await popup.locator('label:has-text("Search all channels")').fill('DEFGH');

  await popup.locator('text=Channel_DEFGH').click();

  await popup.locator('[aria-label="More options for Channel_DEFGH"]').click();
  await popup
    .locator('[aria-label="change Channel_DEFGH marker style"]')
    .selectOption({ label: 'Diamond' });

  await popup.getByLabel('change Channel_DEFGH marker size').fill('10');

  await popup.locator('[aria-label="More options for Shot Number"]').click();
  await popup
    .locator('[aria-label="change Shot Number marker style"]')
    .selectOption({ label: 'Triangle' });

  await popup.getByLabel('change Shot Number marker size').fill('15');

  await popup.locator('[aria-label="close settings"]').click();

  // wait for open settings button to be visible i.e. menu is fully closed
  await popup.locator('[aria-label="open settings"]').click({ trial: true });

  const chart = await popup.locator('.plotly-chart');

  await expect(chart).toHaveScreenshot({ maxDiffPixels: 150 });
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

  const chart = await popup.locator('.plotly-chart');
  await expect(chart).toHaveScreenshot({ maxDiffPixels: 150 });
});

test('user can change the line width of plotted channels', async ({ page }) => {
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
  await popup.getByLabel('change Channel_DEFGH line width').fill('7');

  await popup.locator('[aria-label="More options for Shot Number"]').click();
  await popup.getByLabel('change Shot Number line width').fill('2');

  await popup.locator('[aria-label="close settings"]').click();

  // wait for open settings button to be visible i.e. menu is fully closed
  await popup.locator('[aria-label="open settings"]').click({ trial: true });

  const chart = await popup.locator('.plotly-chart');

  await expect(chart).toHaveScreenshot({ maxDiffPixels: 150 });
});

test('user can plot channels on the right y axis', async ({ page }) => {
  await page.goto('/');

  // MSW wont start immediately here, so wait for page to load first
  await expect(page.locator('text=Plots')).toBeVisible();

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
      msw.http.get('/records', async () =>
        msw.HttpResponse.json(modifiedRecordsJson, { status: 200 })
      )
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

  const channel_ABCDE = await popup.getByRole('option', {
    name: 'Channel_ABCDE',
  });
  await channel_ABCDE.click();

  await popup.locator('label:has-text("Search all channels")').fill('DEFGH');

  await popup
    .getByRole('option', {
      name: 'Channel_DEFGH',
    })
    .click();

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

  // wait for open settings button to be visible i.e. menu is fully closed
  await popup.locator('[aria-label="open settings"]').click({ trial: true });

  const chart = await popup.locator('.plotly-chart');

  await expect(chart).toHaveScreenshot({ maxDiffPixels: 150 });
});

test('user can customize left y axis label', async ({ page }) => {
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

  const chart = await popup.locator('.plotly-chart');

  await expect(chart).toHaveScreenshot({ maxDiffPixels: 150 });
});

test('user can customize right y axis label', async ({ page }) => {
  await page.goto('/');

  await page.locator('text=Plots').click();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('text=Create a plot').click(),
  ]);

  await popup.getByRole('button', { name: 'Right' }).click();
  await popup.locator('label:has-text("Search")').fill('Shot Num');
  await popup.getByRole('option', { name: 'Shot Number', exact: true }).click();
  await popup.getByRole('textbox', { name: 'Label' }).type('right y axis');

  const chart = await popup.locator('.plotly-chart');

  await expect(chart).toHaveScreenshot({ maxDiffPixels: 150 });
});

test('user can customize both left and right y axis labels', async ({
  page,
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
  await popup.locator('label:has-text("Search")').fill('DEFGH');
  await popup
    .getByRole('option', { name: 'Channel_DEFGH', exact: true })
    .click();
  await popup.getByRole('textbox', { name: 'Label' }).type('right y axis');

  const chart = await popup.locator('.plotly-chart');

  await expect(chart).toHaveScreenshot({ maxDiffPixels: 150 });
});

test('scalar functions can be plotted', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Functions' }).click();

  // Locate the "Name" input field and type 'b'
  await page.getByLabel('Name', { exact: true }).fill('a');

  const expressionFields = await page.locator('label:has-text("Expression")');

  // Locate the "Expression" input field and type 'CHANNEL_EFGHI'
  await expressionFields.first().fill('1');
  await expressionFields.first().press('Enter');

  // Click on the apply button
  await page.getByRole('button', { name: 'Apply' }).click();

  // Check if the column header with name 'b' exists
  await expect(
    page.getByRole('columnheader', { name: 'a a menu' })
  ).toBeVisible();

  await page.locator('text=Plots').click();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('text=Create a plot').click(),
  ]);

  await popup.locator('label:has-text("Search")').fill('a');
  await popup.getByRole('option', { name: 'a', exact: true });
});
