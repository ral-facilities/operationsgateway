import { expect, test } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

test.beforeEach(async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('from, date-time input').fill('2023-06-05 08:00');
  await page.getByLabel('to, date-time input').fill('2023-06-05 09:00');

  await page.getByRole('button', { name: 'Search', exact: true }).click();

  // add trace channel to the table so we can click on a trace
  await page.getByRole('button', { name: 'Data channels' }).click();

  // check that channels have loaded before searching for our channels to add
  await expect(page.getByRole('button', { name: 'system' })).toBeVisible();

  await page
    .getByRole('combobox', { name: 'Search data channels' })
    .fill('PA1-CAM');

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await page.getByRole('button', { name: 'Add this channel' }).click();

  await page.getByRole('combobox', { name: 'Search data channels' }).fill('');
  await page
    .getByRole('combobox', { name: 'Search data channels' })
    .fill('CAM-2');

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await page.getByRole('button', { name: 'Add this channel' }).click();

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
  // assert src has loaded before storing the old image src
  await expect(image).toHaveAttribute('src');
  const oldImageSrc = await image.getAttribute('src');
  const colourbar = await popup.getByAltText('Colour bar');

  await popup.getByLabel('Colour Map').click();

  await popup.getByRole('option', { name: 'cividis' }).click();

  await expect(
    popup.getByRole('checkbox', { name: 'Reverse Colour' })
  ).not.toBeChecked();
  await popup.getByRole('checkbox', { name: 'Reverse Colour' }).click();
  await expect(
    popup.getByRole('checkbox', { name: 'Reverse Colour' })
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

  await expect(slider.nth(0)).toHaveValue(`${0.4 * 255}`);

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

  await expect(slider.nth(1)).toHaveValue(`${0.8 * 255}`);

  // blur to avoid focus tooltip appearing in snapshot
  await slider.nth(0).blur();
  await slider.nth(1).blur();

  // wait for new image to have loaded
  await expect
    .poll(async () => await image.getAttribute('src'))
    .not.toBe(oldImageSrc);
  await image.click();

  await expect(image).toHaveScreenshot({ maxDiffPixels: 150 });

  await expect(colourbar).toHaveScreenshot();
});

test('user can change the false colour parameters of an 12 bit image', async ({
  page,
}) => {
  await page.getByLabel('to, date-time input').fill('2023-06-06 12:10');
  await page.getByLabel('from, date-time input').fill('2023-06-06 12:00');

  await page.getByRole('button', { name: 'Search', exact: true }).click();

  // add image channel to the table so we can click on an image
  await page.getByRole('button', { name: 'Data channels' }).click();

  await page
    .getByRole('combobox', { name: 'Search data channels' })
    .fill('CM-202-CVC-CAM-1');

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await page.getByRole('button', { name: 'Add this channel' }).click();

  await page.getByRole('combobox', { name: 'Search data channels' }).fill('');

  await page
    .getByRole('combobox', { name: 'Search data channels' })
    .fill('PA1-CAM');

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await page.getByRole('button', { name: 'Remove this channel' }).click();

  await page.getByRole('combobox', { name: 'Search data channels' }).fill('');
  await page
    .getByRole('combobox', { name: 'Search data channels' })
    .fill('CAM-2');

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await page.getByRole('button', { name: 'Remove this channel' }).click();

  await page.getByRole('button', { name: 'Add Channels' }).click();

  await page.getByRole('button', { name: 'Search', exact: true }).click();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page
      .getByAltText('Compressor output NF image', { exact: false })
      .first()
      .click(),
  ]);

  const title = await popup.title();
  const imgAltText = title.split(' - ')[1];

  const image = await popup.getByAltText(imgAltText);
  // assert src has loaded before storing the old image src
  await expect(image).toHaveAttribute('src');
  const oldImageSrc = await image.getAttribute('src');
  const colourbar = await popup.getByAltText('Colour bar');

  await popup.getByLabel('Colour Map').click();

  await popup.getByRole('option', { name: 'cividis' }).click();

  await expect(
    popup.getByRole('checkbox', { name: 'Reverse Colour' })
  ).not.toBeChecked();
  await popup.getByRole('checkbox', { name: 'Reverse Colour' }).click();
  await expect(
    popup.getByRole('checkbox', { name: 'Reverse Colour' })
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
      x: (sliderDims?.width ?? 0) * 0.1,
      y: sliderDims?.height ? sliderDims.height / 2 : 0,
    },
  });

  await expect(slider.nth(0)).toHaveValue('397');

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

  await expect(slider.nth(1)).toHaveValue(`3270`);

  // blur to avoid focus tooltip appearing in snapshot
  await slider.nth(0).blur();
  await slider.nth(1).blur();

  // wait for new image to have loaded
  await expect
    .poll(async () => await image.getAttribute('src'))
    .not.toBe(oldImageSrc);
  await image.click();

  await expect(image).toHaveScreenshot({ maxDiffPixels: 150 });

  await expect(colourbar).toHaveScreenshot();
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
  // assert src has loaded before storing the old image src
  await expect(image).toHaveAttribute('src');
  const oldImageSrc = await image.getAttribute('src');

  await expect(
    popup.getByRole('checkbox', { name: 'False colour' })
  ).toBeChecked();
  await popup.getByRole('checkbox', { name: 'False colour' }).click();
  await expect(
    popup.getByRole('checkbox', { name: 'False colour' })
  ).not.toBeChecked();

  // wait for new image to have loaded
  await expect
    .poll(async () => await image.getAttribute('src'))
    .not.toBe(oldImageSrc);

  await image.click();

  await expect(image).toHaveScreenshot({ maxDiffPixels: 150 });
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

  const oldImage = await popup.getByAltText(
    (await popup.title()).split(' - ')[1]
  );
  // assert src has loaded before storing the old image src
  await expect(oldImage).toHaveAttribute('src');
  const oldImageSrc = await oldImage.getAttribute('src');

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

  await expect(canvas).toHaveScreenshot({ maxDiffPixels: 150 });
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

  const defaultColourMapDropdown = await page
    .getByRole('combobox', {
      name: 'Default Colour Map',
      // This is used due to the nested focusTrap error caused by nested menuItems
      includeHidden: true,
    })
    .first();

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
      // This is used due to the nested focusTrap error caused by nested menuItems
      includeHidden: true,
    })
    .click();

  expect(defaultColourMapDropdown).toHaveText('inferno');

  // wait for records response to come back before taking screenshot
  const response = await recordsPromise;

  await expect(tableThumbnail).toBeAttached();
  await expect(tableThumbnail).toHaveScreenshot({
    maxDiffPixels: 150,
  });

  const title = await popup.title();
  const imgAltText = title.split(' - ')[1];

  const image = await popup.getByAltText(imgAltText);
  const colourbar = await popup.getByAltText('Colour bar');

  await image.click();

  await expect(image).toHaveScreenshot({ maxDiffPixels: 150 });

  await expect(colourbar).toHaveScreenshot();
});

test('user can use crosshairs mode and view intensity graphs', async ({
  page,
}) => {
  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page
      .getByAltText('D100 front-end FF image', { exact: false })
      .first()
      .click(),
  ]);

  const title = await popup.title();
  const imgAltText = title.split(' - ')[1];

  const image = await popup.getByAltText(imgAltText);

  // get into cross hairs mode
  await expect(
    popup.getByRole('checkbox', { name: 'Centroid / Cross Hairs' })
  ).not.toBeChecked();
  await popup.getByRole('checkbox', { name: 'Centroid / Cross Hairs' }).click();
  await expect(
    popup.getByRole('checkbox', { name: 'Centroid / Cross Hairs' })
  ).toBeChecked();

  const charts = await popup.locator('.plotly-chart');
  await expect(charts).toHaveCount(2);
  await expect(charts.first()).toBeVisible();
  await expect(charts.last()).toBeVisible();

  const centroidPosition = [734, 516];
  const FWHMs = [214, 201];
  await expect(
    popup.getByText(
      `Position: (${centroidPosition[0]}, ${centroidPosition[1]})`
    )
  ).toBeVisible();
  await expect(popup.getByText(`X FWHM: ${FWHMs[0]}`)).toBeVisible();
  await expect(popup.getByText(`Y FWHM: ${FWHMs[1]}`)).toBeVisible();

  // expect crosshairs to be drawn on image at the centroid & intensity plots to be drawn & positioned correctly
  await expect(await popup.getByTestId('image-panel')).toHaveScreenshot({
    maxDiffPixels: 150,
    stylePath:
      // hide image controls panel & top buttons from the screenshot as it's not important
      path.join(__dirname, '..', 'screenshotIgnoreStyles.css'),
  });

  // check that clicking the image changes the crosshairs position & causes a data fetch
  // for some reason playwright has an off by 1 error in the y-pos in chrome, it works fine when testing manually
  // i.e. clicking top left-most pixel results in (0,0)
  await image.click({
    position: { x: 750, y: 301 },
  });

  await expect(popup.getByText('Position: (750, 300)')).toBeVisible();
  const newFWHMs = [204, 180];
  await expect(popup.getByText(`X FWHM: ${newFWHMs[0]}`)).toBeVisible();
  await expect(popup.getByText(`Y FWHM: ${newFWHMs[1]}`)).toBeVisible();

  await expect(await popup.getByTestId('image-panel')).toHaveScreenshot({
    maxDiffPixels: 150,
    stylePath:
      // hide image controls panel & top buttons from the screenshot as it's not important
      path.join(__dirname, '..', 'screenshotIgnoreStyles.css'),
  });
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

test('user can change the false colour parameters of an float image', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Data channels' }).click();

  await page
    .getByRole('combobox', { name: 'Search data channels' })
    .fill('Compressor output wavefront image');

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await page.getByRole('button', { name: 'Add this channel' }).click();

  await page.getByRole('button', { name: 'Add Channels' }).click();

  await expect(
    page
      .getByAltText('Compressor output wavefront image float_image', {
        exact: false,
      })
      .first()
  ).toBeVisible();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page
      .getByAltText('Compressor output wavefront image float_image', {
        exact: false,
      })
      .first()
      .click(),
  ]);

  const title = await popup.title();
  const imgAltText = title.split(' - ')[1];

  const image = await popup.getByAltText(imgAltText);
  // assert src has loaded before storing the old image src
  await expect(image).toHaveAttribute('src');
  const oldImageSrc = await image.getAttribute('src');

  await popup.getByLabel('Colour Map').click();

  await popup.getByRole('option', { name: 'berlin' }).click();

  // wait for new image to have loaded
  await expect
    .poll(async () => await image.getAttribute('src'))
    .not.toBe(oldImageSrc);

  await image.click();

  await expect(image).toHaveScreenshot({
    maxDiffPixels: 150,
  });
});
