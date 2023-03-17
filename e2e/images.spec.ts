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

  const title = await popup.title();
  const imgAltText = title.split(' - ')[1];

  const image = await popup.getByAltText(imgAltText);
  // use image parent div as this is what crops the image to the correct size
  const imageDiv = await popup
    .locator('div', {
      has: image,
    })
    // last is to get the most specific div i.e. direct parent
    .last();

  // test drag to zoom
  await imageDiv.dragTo(imageDiv, {
    sourcePosition: {
      x: 62,
      y: 45,
    },
    targetPosition: {
      x: 222,
      y: 174,
    },
  });

  await popup.keyboard.down('Shift');
  await imageDiv.dragTo(imageDiv, {
    sourcePosition: {
      x: 488,
      y: 354,
    },
    targetPosition: {
      x: 188,
      y: 144,
    },
  });
  await popup.keyboard.up('Shift');

  expect(
    await imageDiv.screenshot({
      type: 'png',
    })
  ).toMatchSnapshot();

  // test that multiple zoom levels work
  await imageDiv.dragTo(imageDiv, {
    sourcePosition: {
      x: 150,
      y: 330,
    },
    targetPosition: {
      x: 350,
      y: 430,
    },
  });

  expect(
    await imageDiv.screenshot({
      type: 'png',
    })
  ).toMatchSnapshot();

  await popup.locator('text=Reset View').click();

  expect(
    await imageDiv.screenshot({
      type: 'png',
    })
  ).toMatchSnapshot();
});
