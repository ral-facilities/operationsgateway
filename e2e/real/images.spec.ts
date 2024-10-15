import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('from, date-time input').fill('2023-06-05 08:00');
  await page.getByLabel('to, date-time input').fill('2023-06-05 09:00');

  await page.getByRole('button', { name: 'Search', exact: true }).click();

  // add trace channel to the table so we can click on a trace
  await page.getByRole('button', { name: 'Data channels' }).click();

  await page
    .getByRole('combobox', { name: 'Search data channels' })
    .fill('PA1-CAM');

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  for (const row of await page.getByRole('checkbox').all()) await row.check();

  await page.getByRole('button', { name: 'Add Channels' }).click();
});

test.afterEach(async ({ request, context }) => {
  const { apiUrl } = await (
    await request.get('/operationsgateway-settings.json')
  ).json();

  const token = (await context.storageState()).origins[0].localStorage.find(
    (v) => v.name === 'scigateway:token'
  )?.value;
  await request.delete(`${apiUrl}/users/preferences/PREFERRED_COLOUR_MAP`, {
    headers: { Authorization: `Bearer ${token}` },
  });
});

test('user can change the false colour parameters of an image', async ({
  page,
}) => {
  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page
      .getByAltText('D100 pre-amp 1 FF [micro] image', { exact: false })
      .first()
      .click(),
  ]);

  const title = await popup.title();
  const imgAltText = title.split(' - ')[1];

  const image = await popup.getByAltText(imgAltText);
  const oldImageSrc = await image.getAttribute('src');
  const colourbar = await popup.getByAltText('Colour bar');

  await popup.getByLabel('Colour Map').click();

  await popup.getByRole('option', { name: 'cividis' }).click();

  expect(
    await popup.getByRole('checkbox', { name: 'Reverse Colour' })
  ).not.toBeChecked();
  await popup.getByRole('checkbox', { name: 'Reverse Colour' }).click();
  expect(
    await popup.getByRole('checkbox', { name: 'Reverse Colour' })
  ).toBeChecked();

  const slider = await popup.getByRole('slider', {
    name: 'Level Range',
  });

  const SliderRoot = await popup.locator('.MuiSlider-root', {
    has: slider,
  });

  const llSliderThumb = await popup
    .locator('.MuiSlider-thumb', {
      has: slider,
    })
    .nth(0);

  const sliderDims = await SliderRoot.boundingBox();

  await llSliderThumb.dragTo(SliderRoot, {
    targetPosition: {
      // moving the slider to the target value in %
      x: (sliderDims?.width ?? 0) * 0.4,
      y: sliderDims?.height ? sliderDims.height / 2 : 0,
    },
  });

  expect(await slider.nth(0).getAttribute('value')).toBe(`${0.4 * 255}`);

  const ulSliderThumb = await popup
    .locator('.MuiSlider-thumb', {
      has: slider,
    })
    .nth(1);
  await ulSliderThumb.dragTo(SliderRoot, {
    targetPosition: {
      // moving the slider to the target value in %
      x: (sliderDims?.width ?? 0) * 0.8,
      y: sliderDims?.height ? sliderDims.height / 2 : 0,
    },
  });

  expect(await slider.nth(1).getAttribute('value')).toBe(`${0.8 * 255}`);

  // blur to avoid focus tooltip appearing in snapshot
  await slider.nth(0).blur();
  await slider.nth(1).blur();

  // wait for new image to have loaded
  await expect
    .poll(async () => await image.getAttribute('src'))
    .not.toBe(oldImageSrc);
  await image.click();

  expect(
    await image.screenshot({
      type: 'png',
    })
  ).toMatchSnapshot({ maxDiffPixels: 150 });

  expect(
    await colourbar.screenshot({
      type: 'png',
    })
  ).toMatchSnapshot();
});

test('user can disable false colour', async ({ page }) => {
  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page
      .getByAltText('D100 pre-amp 1 FF [micro] image', { exact: false })
      .first()
      .click(),
  ]);

  const title = await popup.title();
  const imgAltText = title.split(' - ')[1];

  const image = await popup.getByAltText(imgAltText);
  const oldImageSrc = await image.getAttribute('src');

  expect(
    await popup.getByRole('checkbox', { name: 'False colour' })
  ).toBeChecked();
  await popup.getByRole('checkbox', { name: 'False colour' }).click();
  expect(
    await popup.getByRole('checkbox', { name: 'False colour' })
  ).not.toBeChecked();

  // wait for new image to have loaded
  await expect
    .poll(async () => await image.getAttribute('src'))
    .not.toBe(oldImageSrc);

  await image.click();

  expect(
    await image.screenshot({
      type: 'png',
    })
  ).toMatchSnapshot({ maxDiffPixels: 150 });
});

test('user can change image via clicking on a thumbnail', async ({ page }) => {
  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page
      .getByAltText('D100 pre-amp 1 FF [micro] image', { exact: false })
      .first()
      .click(),
  ]);

  const canvas = await popup.getByTestId('overlay');

  const oldImageSrc = await popup
    .getByAltText((await popup.title()).split(' - ')[1])
    .getAttribute('src');

  await popup
    .getByAltText('PM-201-PA1-CAM-2 image', { exact: false })
    .last()
    .click();

  // wait until the new image loads i.e. url changes, backdrop disappears & thus image is interactive
  const image = await popup.getByAltText((await popup.title()).split(' - ')[1]);

  await expect
    .poll(async () => await image.getAttribute('src'))
    .not.toBe(oldImageSrc);

  await image.click();

  expect(
    await canvas.screenshot({
      type: 'png',
    })
  ).toMatchSnapshot({ maxDiffPixels: 150 });
});

test('user can set their default colourmap', async ({ page }) => {
  const tableThumbnail = await page
    .getByAltText('D100 pre-amp 1 FF [micro] image', { exact: false })
    .first();

  // open up popup before changing default colourmap to test query invalidation
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    tableThumbnail.click(),
  ]);

  await page.evaluate(() => {
    const div = document.createElement('div');
    div.id = 'settings';
    const ul = document.createElement('ul');
    div.appendChild(ul);
    document.body.appendChild(div);
  });

  const defaultColourMapDropdown = await page.getByRole('combobox', {
    name: 'Default Colour Map',
  });

  expect(defaultColourMapDropdown).toHaveText('');

  await defaultColourMapDropdown.click();

  // Start waiting for record request triggered  by changing colourmap
  // need to wait for responses with more than 2 projection parameters to select
  // the table query and not the image window thumbnail picker query
  const recordsPromise = page.waitForResponse(
    (response) =>
      response.url().includes('records') &&
      (response.url().match(/projection/g) || []).length > 2
  );

  await page
    .getByRole('option', {
      name: 'inferno',
    })
    .click();

  expect(defaultColourMapDropdown).toHaveText('inferno');

  // wait for records response to come back before taking screenshot
  const response = await recordsPromise;

  await expect(tableThumbnail).toBeAttached();
  expect(
    await tableThumbnail.screenshot({
      type: 'png',
    })
  ).toMatchSnapshot({
    maxDiffPixels: 150,
  });

  const title = await popup.title();
  const imgAltText = title.split(' - ')[1];

  const image = await popup.getByAltText(imgAltText);
  const colourbar = await popup.getByAltText('Colour bar');

  await image.click();

  expect(
    await image.screenshot({
      type: 'png',
    })
  ).toMatchSnapshot({ maxDiffPixels: 150 });

  expect(
    await colourbar.screenshot({
      type: 'png',
    })
  ).toMatchSnapshot();
});

test('user can export image', async ({ page }) => {
  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page
      .getByAltText('D100 pre-amp 1 FF [micro] image', { exact: false })
      .first()
      .click(),
  ]);

  await popup.getByTestId('overlay');

  const title = await popup.title();
  const imageName = title.split(' - ')[1];

  const downloadImagePromise = page.waitForEvent('download');
  await popup
    .getByRole('button', { name: 'Export Image', exact: true })
    .click();

  const downloadedImage = await downloadImagePromise;
  expect(downloadedImage.suggestedFilename()).toBe(`${imageName}.png`);
});
