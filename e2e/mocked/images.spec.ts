import { expect, test } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

test.beforeEach(async ({ page }) => {
  await page.goto('/');

  // add trace channel to the table so we can click on a trace
  await page.getByRole('button', { name: 'Data channels' }).click();

  await page
    .getByRole('combobox', { name: 'Search data channels' })
    .type('BCDEF');

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await page
    .getByRole('checkbox', { name: 'Channel_BCDEF', exact: true })
    .click();

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

  await expect(imageDiv).toHaveScreenshot({
    maxDiffPixels: 150,
    // have to reduce threshold when comparing zoomed in images as otherwise similarly
    // coloured pixels are considered ok
    threshold: 0,
  });

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

  await expect(imageDiv).toHaveScreenshot({
    maxDiffPixels: 150,
    // have to reduce threshold when comparing zoomed in images as otherwise similarly
    // coloured pixels are considered ok
    threshold: 0,
  });

  await popup.locator('text=Reset View').click();
  await expect(imageDiv).toHaveScreenshot({
    maxDiffPixels: 150,
  });
});

test('user can change the false colour parameters of an image', async ({
  page,
}) => {
  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByAltText('Channel_BCDEF image', { exact: false }).first().click(),
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

  await expect(slider.nth(0)).toHaveValue('1635');

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

  await expect(slider.nth(1)).toHaveValue('3270');

  // blur to avoid focus tooltip appearing in snapshot
  await slider.nth(0).blur();
  await slider.nth(1).blur();

  // wait for new image to have loaded
  await expect
    .poll(async () => await image.getAttribute('src'))
    .not.toBe(oldImageSrc);
  await image.click();

  await expect(image).toHaveScreenshot({
    maxDiffPixels: 150,
  });

  await expect(colourbar).toHaveScreenshot();
});

test('user can change the false colour to use reverse', async ({ page }) => {
  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByAltText('Channel_BCDEF image', { exact: false }).first().click(),
  ]);

  const title = await popup.title();
  const imgAltText = title.split(' - ')[1];

  const image = await popup.getByAltText(imgAltText);
  // assert src has loaded before storing the old image src
  await expect(image).toHaveAttribute('src');
  let oldImageSrc = await image.getAttribute('src');
  const colourbar = await popup.getByAltText('Colour bar');

  await popup.getByLabel('Colour Map').click();

  await popup.getByRole('option', { name: 'cividis' }).click();

  // wait for new image to have loaded
  await expect
    .poll(async () => await image.getAttribute('src'))
    .not.toBe(oldImageSrc);
  await image.click();
  oldImageSrc = await image.getAttribute('src');

  await expect(
    popup.getByRole('checkbox', { name: 'Reverse Colour' })
  ).not.toBeChecked();
  await popup.getByRole('checkbox', { name: 'Reverse Colour' }).click();
  await expect(
    popup.getByRole('checkbox', { name: 'Reverse Colour' })
  ).toBeChecked();

  // wait for new image to have loaded
  await expect
    .poll(async () => await image.getAttribute('src'))
    .not.toBe(oldImageSrc);
  await image.click();

  await expect(image).toHaveScreenshot({
    maxDiffPixels: 150,
  });

  await expect(colourbar).toHaveScreenshot();
});

test('user can change the false colour to colourmap in extended list', async ({
  page,
}) => {
  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByAltText('Channel_BCDEF image', { exact: false }).first().click(),
  ]);

  const title = await popup.title();
  const imgAltText = title.split(' - ')[1];

  const image = await popup.getByAltText(imgAltText);
  // assert src has loaded before storing the old image src
  await expect(image).toHaveAttribute('src');
  const oldImageSrc = await image.getAttribute('src');

  await popup
    .getByRole('checkbox', { name: 'Show extended colourmap options' })
    .click();

  const colourbar = await popup.getByAltText('Colour bar');

  await popup.getByLabel('Colour Map').click();

  await popup.getByRole('option', { name: 'afmhot' }).click();

  // wait for new image to have loaded
  await expect
    .poll(async () => await image.getAttribute('src'))
    .not.toBe(oldImageSrc);
  await image.click();

  await expect(image).toHaveScreenshot({
    maxDiffPixels: 150,
  });

  await expect(colourbar).toHaveScreenshot();
});

test('user can disable false colour', async ({ page }) => {
  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByAltText('Channel_BCDEF image', { exact: false }).first().click(),
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

  await expect(image).toHaveScreenshot({
    maxDiffPixels: 150,
  });
});

test('user can change image via clicking on a thumbnail', async ({ page }) => {
  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByAltText('Channel_BCDEF image', { exact: false }).first().click(),
  ]);

  // create modified image to be queried when different thumbnail is selected
  await page.evaluate(async () => {
    const { msw } = window;

    const response = await fetch('/images/1/1');
    const responseBlob = await response.blob();
    const url = window.URL.createObjectURL(responseBlob);

    msw.worker.use(
      msw.http.get('/images/:recordId/:channelName', async () => {
        const canvas = window.document.createElement('canvas');
        const context = canvas.getContext('2d');

        const result = await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;

            if (context) {
              // draw image
              context.drawImage(img, 0, 0, canvas.width, canvas.height);

              // set composite mode
              context.globalCompositeOperation = 'color';

              // draw color
              context.fillStyle = '#f00';
              context.fillRect(0, 0, canvas.width, canvas.height);

              canvas.toBlob(async (blob) => {
                if (blob) {
                  const arrayBuffer = await blob.arrayBuffer();

                  resolve(
                    new msw.HttpResponse(arrayBuffer, {
                      headers: {
                        'Content-Length': arrayBuffer.byteLength.toString(),
                        'Content-Type': 'image/png',
                      },
                      status: 200,
                    })
                  );
                } else {
                  reject();
                }
              });
            } else {
              reject();
            }
          };
          img.onerror = reject;
          img.src = url;
        });

        return result;
      })
    );
  });

  const canvas = await popup.getByTestId('overlay');

  const oldImage = await popup.getByAltText(
    (await popup.title()).split(' - ')[1]
  );
  // assert src has loaded before storing the old image src
  await expect(oldImage).toHaveAttribute('src');
  const oldImageSrc = await oldImage.getAttribute('src');

  await expect(popup.getByText('4095').first()).toBeVisible();

  await popup
    .getByAltText('Channel_BCDEF image', { exact: false })
    .last()
    .click();

  // wait until the new image loads i.e. url changes, backdrop disappears & thus image is interactive
  const image = await popup.getByAltText((await popup.title()).split(' - ')[1]);

  await expect
    .poll(async () => await image.getAttribute('src'))
    .not.toBe(oldImageSrc);

  await image.click();
  await expect(popup.getByText('255').first()).toBeVisible();
  await expect(canvas).toHaveScreenshot({
    maxDiffPixels: 150,
  });
});

test('user can set their default colourmap', async ({ page }) => {
  await page.evaluate(() => {
    const div = document.createElement('div');
    div.id = 'settings';
    const ul = document.createElement('ul');
    div.appendChild(ul);
    document.body.appendChild(div);
  });

  await page
    .getByRole('combobox', {
      name: 'Default Colour Map',
      // This is used due to the nested focusTrap error caused by nested menuItems
      includeHidden: true,
    })
    .first()
    .click();
  await page
    .getByRole('option', {
      name: 'inferno',
      // This is used due to the nested focusTrap error caused by nested menuItems
      includeHidden: true,
    })
    .click();

  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByAltText('Channel_BCDEF image', { exact: false }).first().click(),
  ]);

  const title = await popup.title();
  const imgAltText = title.split(' - ')[1];

  const image = await popup.getByAltText(imgAltText);
  const colourbar = await popup.getByAltText('Colour bar');

  await image.click();

  await expect(image).toHaveScreenshot({
    maxDiffPixels: 150,
  });

  await expect(colourbar).toHaveScreenshot();
});

test('user can use crosshairs mode and view intensity graphs', async ({
  page,
  browserName,
}) => {
  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByAltText('Channel_BCDEF image', { exact: false }).first().click(),
  ]);

  // if this test is run in parallel on firefox the screenshot renders differently
  // so adjust the size of the page to ensure consistent rendering
  if (browserName === 'firefox')
    await popup.setViewportSize({ width: 600, height: 800 });

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

  // see msw mock imageCrosshair.json
  const centroidPosition = [226, 187];
  const FWHMs = [61, 56];
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
    position: { x: 100, y: browserName === 'chromium' ? 301 : 300 },
  });

  await expect(popup.getByText('Position: (100, 300)')).toBeVisible();

  await expect(await popup.getByTestId('image-panel')).toHaveScreenshot({
    maxDiffPixels: 150,
    stylePath:
      // hide image controls panel & top buttons from the screenshot as it's not important
      path.join(__dirname, '..', 'screenshotIgnoreStyles.css'),
  });

  // check reset view goes back to the centroid
  await popup.locator('text=Reset View').click();

  await expect(
    popup.getByText(
      `Position: (${centroidPosition[0]}, ${centroidPosition[1]})`
    )
  ).toBeVisible();

  await expect(await popup.getByTestId('image-panel')).toHaveScreenshot({
    maxDiffPixels: 150,
    stylePath:
      // hide image controls panel & top buttons from the screenshot as it's not important
      path.join(__dirname, '..', 'screenshotIgnoreStyles.css'),
  });

  // can switch out of crosshairs mode and crosshair disappears
  await popup.getByRole('checkbox', { name: 'Centroid / Cross Hairs' }).click();
  await expect(
    popup.getByRole('checkbox', { name: 'Centroid / Cross Hairs' })
  ).not.toBeChecked();

  await expect(imageDiv).toHaveScreenshot({
    maxDiffPixels: 150,
  });

  await expect(charts.first()).not.toBeVisible();
  await expect(charts.last()).not.toBeVisible();
});

test('user can switch images via thumbnails whilst in crosshairs mode', async ({
  page,
  browserName,
}) => {
  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByAltText('Channel_BCDEF image', { exact: false }).first().click(),
  ]);

  // if this test is run in parallel on firefox the screenshot renders differently
  // so adjust the size of the page to ensure consistent rendering
  if (browserName === 'firefox')
    await popup.setViewportSize({ width: 600, height: 800 });

  const title = await popup.title();
  const imgAltText = title.split(' - ')[1];

  const oldImage = await popup.getByAltText(imgAltText);

  // get into cross hairs mode
  await expect(
    popup.getByRole('checkbox', { name: 'Centroid / Cross Hairs' })
  ).not.toBeChecked();
  await popup.getByRole('checkbox', { name: 'Centroid / Cross Hairs' }).click();
  await expect(
    popup.getByRole('checkbox', { name: 'Centroid / Cross Hairs' })
  ).toBeChecked();

  // expect intensity plots to be drawn
  const charts = await popup.locator('.plotly-chart');
  await expect(charts).toHaveCount(2);
  await expect(charts.first()).toBeVisible();
  await expect(charts.last()).toBeVisible();

  // expect crosshairs to be drawn on image at the centroid

  let centroidPosition = [226, 187];
  await expect(
    popup.getByText(
      `Position: (${centroidPosition[0]}, ${centroidPosition[1]})`
    )
  ).toBeVisible();

  await expect(await popup.getByTestId('image-panel')).toHaveScreenshot({
    maxDiffPixels: 150,
    stylePath:
      // hide image controls panel & top buttons from the screenshot as it's not important
      path.join(__dirname, '..', 'screenshotIgnoreStyles.css'),
  });

  // click to move the crosshair so we check when switching images it resets to the new image's centroid
  // for some reason playwright has an off by 1 error in the y-pos in chrome, it works fine when testing manually
  // i.e. clicking top left-most pixel results in (0,0)
  await oldImage.click({
    position: { x: 200, y: browserName === 'chromium' ? 201 : 200 },
  });
  await expect(popup.getByText('Position: (200, 200)')).toBeVisible();

  await page.evaluate(async () => {
    // from: https://stackoverflow.com/a/49434653 - generate "random" bell curve
    function create_intensity_plot(min: number, max: number) {
      // from https://stackoverflow.com/a/19303725 - basic seeded "random" number generator
      let seed = 1;
      function random() {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
      }

      const n = 10000;
      const step = 1;
      const data: Record<number, number> = {};

      const randn_bm = (min, max, skew) => {
        let u = 0,
          v = 0;
        while (u === 0) u = random(); //Converting [0,1) to (0,1)
        while (v === 0) v = random();
        let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

        num = num / 10.0 + 0.5; // Translate to 0 -> 1
        if (num > 1 || num < 0) num = randn_bm(min, max, skew); // resample between 0 and 1 if out of range
        num = Math.pow(num, skew); // Skew
        num *= max - min; // Stretch to fill range
        num += min; // offset to min
        return num;
      };

      const round_to_precision = (x, precision) => {
        const y = +x + (precision === undefined ? 0.5 : precision / 2);
        return y - (y % (precision === undefined ? 1 : +precision));
      };

      // Seed data with a bunch of 0s
      for (let j = min; j < max; j += step) {
        data[j] = 0;
      }

      // Create n samples between min and max
      for (let i = 0; i < n; i += step) {
        const rand_num = randn_bm(min, max, 1);
        const rounded = round_to_precision(rand_num, step);
        data[rounded] += 1;
      }

      // Count number of samples at each increment
      let points: { x: number; y: number }[] = [];
      for (const [key, val] of Object.entries(data)) {
        points.push({
          x: parseFloat(key),
          y: val / n <= 20 / n ? random() * (1 / n) * 20 : val / n, // make the tail a bit "wiggly"
        });
      }

      // Sort
      points = points.sort(function (a, b) {
        if (a.x < b.x) return -1;
        if (a.x > b.x) return 1;
        return 0;
      });

      const unnormalised_y = points.map((v) => v.y);

      const y_min = Math.min(...unnormalised_y);
      const y_max = Math.max(...unnormalised_y);

      const normalised_y = unnormalised_y.map((n) =>
        Math.round(((n - y_min) / (y_max - y_min)) * 255)
      );

      const intensity_data: { x: number[]; y: number[] } = {
        x: points.map((v) => v.x),
        y: normalised_y,
      };

      return intensity_data;
    }

    const { msw } = window;

    msw.worker.use(
      msw.http.get('/images/:recordId/:channelName/crosshair', async () => {
        const responseJson = {
          row: {
            position: 250,
            intensity: create_intensity_plot(0, 656), // 656 = height of image
            fwhm: 79,
          },
          column: {
            position: 320,
            intensity: create_intensity_plot(0, 494), // 494 = width of image
            fwhm: 22,
          },
        };
        return msw.HttpResponse.json(responseJson, { status: 200 });
      })
    );
  });

  await popup
    .getByAltText('Channel_BCDEF image', { exact: false })
    .last()
    .click();

  centroidPosition = [320, 250];
  const FWHMs = [22, 79];
  await expect(
    popup.getByText(
      `Position: (${centroidPosition[0]}, ${centroidPosition[1]})`
    )
  ).toBeVisible();
  await expect(popup.getByText(`X FWHM: ${FWHMs[0]}`)).toBeVisible();
  await expect(popup.getByText(`Y FWHM: ${FWHMs[1]}`)).toBeVisible();

  await expect(charts.first()).toBeVisible();
  await expect(charts.last()).toBeVisible();

  // check that crosshair is repositioned and new intensity plots load & are positioned correctly
  await expect(await popup.getByTestId('image-panel')).toHaveScreenshot({
    maxDiffPixels: 150,
    stylePath:
      // hide image controls panel & top buttons from the screenshot as it's not important
      path.join(__dirname, '..', 'screenshotIgnoreStyles.css'),
  });
});

test('user can change the false colour parameters of an float image', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Data channels' }).click();

  await page
    .getByRole('combobox', { name: 'Search data channels' })
    .type('BCDEF');

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await page
    .getByRole('checkbox', { name: 'Channel_BCDEF', exact: true })
    .click();
  await page
    .getByRole('checkbox', { name: 'Channel_BCDEFX', exact: true })
    .click();

  await page.getByRole('button', { name: 'Add Channels' }).click();
  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page
      .getByAltText('Channel_BCDEFX float_image', { exact: false })
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

  await popup.getByRole('option', { name: 'bwr' }).click();

  // wait for new image to have loaded
  await expect
    .poll(async () => await image.getAttribute('src'))
    .not.toBe(oldImageSrc);

  await image.click();

  await expect(image).toHaveScreenshot({
    maxDiffPixels: 150,
  });
});
