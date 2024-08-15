import { expect, test } from '@playwright/test';

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

test('user can zoom and pan the image', async ({ page, browserName }) => {
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

  // TODO: Remove webkit check when reset view works correctly again in Playwright.
  //       Currently there's an issue on WebKit where upon resetting the view the image disappears, causing snapshots to fail
  if (browserName !== 'webkit') {
    await popup.locator('text=Reset View').click();
    // eslint-disable-next-line jest/no-conditional-expect
    expect(
      await imageDiv.screenshot({
        type: 'png',
      })
    ).toMatchSnapshot({ maxDiffPixels: 150 });
  }
});

test('user can change the false colour parameters of an image', async ({
  page,
  browserName,
}) => {
  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByAltText('Channel_BCDEF image', { exact: false }).first().click(),
  ]);

  const title = await popup.title();
  const imgAltText = title.split(' - ')[1];

  const image = await popup.getByAltText(imgAltText);
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

  if (browserName !== 'webkit') {
    await llSliderThumb.dragTo(SliderRoot, {
      targetPosition: {
        // moving the slider to the target value in %
        x: (sliderDims?.width ?? 0) * 0.4,
        y: sliderDims?.height ? sliderDims.height / 2 : 0,
      },
    });

    // eslint-disable-next-line jest/no-conditional-expect
    expect(await slider.nth(0).getAttribute('value')).toBe(`${0.4 * 255}`);
  }

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

test('user can change the false colour to use reverse', async ({ page }) => {
  // open up popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByAltText('Channel_BCDEF image', { exact: false }).first().click(),
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
    page.getByAltText('Channel_BCDEF image', { exact: false }).first().click(),
  ]);

  // create modified image to be queried when different thumbnail is selected
  await page.evaluate(async () => {
    const { msw } = window;

    const response = await fetch('/images/1/1');
    const responseBlob = await response.blob();
    const url = window.URL.createObjectURL(responseBlob);

    msw.worker.use(
      msw.http.get(
        '/images/:recordId/:channelName',
        async () => {
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
        },
        { once: true }
      )
    );
  });

  const canvas = await popup.getByTestId('overlay');

  const oldImageSrc = await popup
    .getByAltText((await popup.title()).split(' - ')[1])
    .getAttribute('src');

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

  expect(
    await canvas.screenshot({
      type: 'png',
    })
  ).toMatchSnapshot({ maxDiffPixels: 150 });
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
    })
    .click();
  await page
    .getByRole('option', {
      name: 'inferno',
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
