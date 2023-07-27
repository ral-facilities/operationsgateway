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
  ).toMatchSnapshot({ maxDiffPixels: 150 });

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
  ).toMatchSnapshot({ maxDiffPixels: 150 });

  await popup.locator('text=Reset View').click();

  expect(
    await imageDiv.screenshot({
      type: 'png',
    })
  ).toMatchSnapshot({ maxDiffPixels: 150 });
});
test('user can change the false colour parameters of an image', async ({
  browserName,
  page,
}) => {
  if (browserName !== 'webkit') {
    // open up popup
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page
        .getByAltText('Channel_BCDEF image', { exact: false })
        .first()
        .click(),
    ]);

    const title = await popup.title();
    const imgAltText = title.split(' - ')[1];

    const image = await popup.getByAltText(imgAltText);
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

    // eslint-disable-next-line jest/no-conditional-expect
    expect(await slider.nth(0).getAttribute('value')).toBe(`${0.4 * 255}`);

    const ulSliderThumb = await popup
      .locator('.MuiSlider-thumb', {
        has: slider,
      })
      .nth(1);
    await ulSliderThumb.dragTo(SliderRoot, {
      targetPosition: {
        // moving the slider to the target value in %
        x: (sliderDims?.width ?? 0) * 0.6,
        y: sliderDims?.height ? sliderDims.height / 2 : 0,
      },
    });

    // eslint-disable-next-line jest/no-conditional-expect
    expect(await slider.nth(1).getAttribute('value')).toBe('152');

    // blur to avoid focus tooltip appearing in snapshot
    await slider.nth(0).blur();
    await slider.nth(1).blur();

    // wait for new image to have loaded
    await image.click();

    // eslint-disable-next-line jest/no-conditional-expect
    expect(
      await image.screenshot({
        type: 'png',
      })
    ).toMatchSnapshot({ maxDiffPixels: 150 });

    // eslint-disable-next-line jest/no-conditional-expect
    expect(
      await colourbar.screenshot({
        type: 'png',
      })
    ).toMatchSnapshot();
  }
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
  const colourbar = await popup.getByAltText('Colour bar');

  await popup.getByLabel('Colour Map').click();

  await popup.getByRole('option', { name: 'cividis' }).click();

  await popup.getByRole('checkbox', { name: 'Reverse Colour' }).click();
  // wait for new image to have loaded
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

  await popup
    .getByRole('checkbox', { name: 'Show extended colourmap options' })
    .click();
  const colourbar = await popup.getByAltText('Colour bar');

  await popup.getByLabel('Colour Map').click();

  await popup.getByRole('option', { name: 'afmhot' }).click();

  // wait for new image to have loaded
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
    page.getByAltText('Channel_BCDEF image', { exact: false }).first().click(),
  ]);

  const title = await popup.title();
  const imgAltText = title.split(' - ')[1];

  const image = await popup.getByAltText(imgAltText);

  await popup.getByRole('checkbox', { name: 'False colour' }).click();

  // wait for new image to have loaded
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
    page.getByAltText('Channel_BCDEF image', { exact: false }).first().click(),
  ]);

  // create modified image to be queried when different thumbnail is selected
  await page.evaluate(async () => {
    const { msw } = window;

    const response = await fetch('/images/1/1');
    const responseBlob = await response.blob();
    const url = window.URL.createObjectURL(responseBlob);

    msw.worker.use(
      msw.rest.get('/images/:recordId/:channelName', async (req, res, ctx) => {
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
                    res.once(
                      ctx.status(200),
                      ctx.set(
                        'Content-Length',
                        arrayBuffer.byteLength.toString()
                      ),
                      ctx.set('Content-Type', 'image/png'),
                      ctx.body(arrayBuffer)
                    )
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

  await popup
    .getByAltText('Channel_BCDEF image', { exact: false })
    .last()
    .click();

  // wait until the new image loads i.e. backdrop disappears & thus image is interactive
  const title = await popup.title();
  const imgAltText = title.split(' - ')[1];

  await popup.getByAltText(imgAltText).click();

  expect(
    await canvas.screenshot({
      type: 'png',
    })
  ).toMatchSnapshot();
});
