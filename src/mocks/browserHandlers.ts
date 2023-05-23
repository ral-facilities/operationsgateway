import {
  DefaultBodyType,
  MockedResponse,
  ResponseResolverReturnType,
  rest,
} from 'msw';
import image from './image.png';
import colourbar from './colourbar.png';

export const browserHandlers = [
  rest.get('/images/:recordId/:channelName', async (req, res, ctx) => {
    const imageResponse = await fetch(image);

    const originalImage = req.url.searchParams.get('original_image');
    const colourmap = req.url.searchParams.get('colourmap_name');

    // do some basic canvas manip to emulate original images/different false colour maps
    if (originalImage || colourmap) {
      const imageUrl = window.URL.createObjectURL(await imageResponse.blob());
      const canvas = window.document.createElement('canvas');
      const context = canvas.getContext('2d');

      const result = await new Promise<
        ResponseResolverReturnType<MockedResponse<DefaultBodyType>>
      >((resolve, reject) => {
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
            if (originalImage) context.fillStyle = '#000';
            if (colourmap) {
              switch (colourmap.split('_')[1]) {
                case '1':
                  context.fillStyle = '#f00';
                  break;
                case '2':
                  context.fillStyle = '#0f0';
                  break;
                case '3':
                  context.fillStyle = '#00f';
                  break;
                case '4':
                  context.fillStyle = '#ff0';
                  break;
                case '5':
                  context.fillStyle = '#f0f';
                  break;
                case '6':
                  context.fillStyle = '#0ff';
                  break;
                case '7':
                  context.fillStyle = '#f80';
                  break;
                default:
                  context.fillStyle = '#fff';
                  break;
              }
            }
            context.fillRect(0, 0, canvas.width, canvas.height);

            canvas.toBlob(async (blob) => {
              if (blob) {
                const arrayBuffer = await blob.arrayBuffer();

                resolve(
                  res(
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
                reject(res(ctx.status(500)));
              }
            });
          } else {
            reject(res(ctx.status(500)));
          }
        };
        img.onerror = reject;
        img.src = imageUrl;
      });

      return result;
    } else {
      // Convert png image to "ArrayBuffer".
      const imageBuffer = await imageResponse.arrayBuffer();

      return res(
        ctx.status(200),
        ctx.set('Content-Length', imageBuffer.byteLength.toString()),
        ctx.set('Content-Type', 'image/png'),
        ctx.body(imageBuffer)
      );
    }
  }),
  rest.get('/images/colour_bar', async (req, res, ctx) => {
    const imageResponse = await fetch(colourbar);

    const colourmap = req.url.searchParams.get('colourmap_name');

    if (colourmap) {
      const imageUrl = window.URL.createObjectURL(await imageResponse.blob());
      const canvas = window.document.createElement('canvas');
      const context = canvas.getContext('2d');

      const result = await new Promise<
        ResponseResolverReturnType<MockedResponse<DefaultBodyType>>
      >((resolve, reject) => {
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
            if (colourmap) {
              switch (colourmap.split('_')[1]) {
                case '1':
                  context.fillStyle = '#f00';
                  break;
                case '2':
                  context.fillStyle = '#0f0';
                  break;
                case '3':
                  context.fillStyle = '#00f';
                  break;
                case '4':
                  context.fillStyle = '#ff0';
                  break;
                case '5':
                  context.fillStyle = '#f0f';
                  break;
                case '6':
                  context.fillStyle = '#0ff';
                  break;
                case '7':
                  context.fillStyle = '#f80';
                  break;
                default:
                  context.fillStyle = '#fff';
                  break;
              }
            }
            context.fillRect(0, 0, canvas.width, canvas.height);

            canvas.toBlob(async (blob) => {
              if (blob) {
                const arrayBuffer = await blob.arrayBuffer();

                resolve(
                  res(
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
                reject(res(ctx.status(500)));
              }
            });
          } else {
            reject(res(ctx.status(500)));
          }
        };
        img.onerror = reject;
        img.src = imageUrl;
      });

      return result;
    } else {
      // Convert png image to "ArrayBuffer".
      const imageBuffer = await imageResponse.arrayBuffer();

      return res(
        ctx.status(200),
        ctx.set('Content-Length', imageBuffer.byteLength.toString()),
        ctx.set('Content-Type', 'image/png'),
        ctx.body(imageBuffer)
      );
    }
  }),
];
