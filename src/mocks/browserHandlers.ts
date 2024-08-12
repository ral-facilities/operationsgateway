import { HttpResponse, http } from 'msw';
import colourbar from './colourbar.png';
import colourbar_reverse from './colourbar_reverse.png';
import { preferredColourMap } from './handlers';
import image from './image.png';
import image_reverse from './image_reverse.png';

const setFillStyleFromColourMap = (
  context: CanvasRenderingContext2D,
  colourmap: string
): void => {
  switch (colourmap.includes('_') ? colourmap.split('_')[1] : colourmap) {
    case 'hsv':
      context.fillStyle = '#f00';
      break;
    case 'twilight':
      context.fillStyle = '#0f0';
      break;
    case 'BrBG':
      context.fillStyle = '#00f';
      break;
    case 'bwr':
      context.fillStyle = '#ff0';
      break;
    case 'brg':
      context.fillStyle = '#f0f';
      break;
    case 'CMRmap':
      context.fillStyle = '#0ff';
      break;
    case 'cividis':
      context.fillStyle = '#f80';
      break;
    case 'inferno':
      context.fillStyle = '#f50';
      break;
    case 'Accent':
      context.fillStyle = '#a0f';
      break;
    case 'Dark2':
      context.fillStyle = '#4f6';
      break;
    case 'Blues':
      context.fillStyle = '#e80';
      break;
    case 'BuGn':
      context.fillStyle = '#0af';
      break;
    case 'afmhot':
      context.fillStyle = '#e80';
      break;
    case 'autumn':
      context.fillStyle = '#0af';
      break;
    default:
      context.fillStyle = '#fff';
      break;
  }
};

export const browserHandlers = [
  http.get('/images/:recordId/:channelName', async ({ request }) => {
    const url = new URL(request.url);
    const originalImage = url.searchParams.get('original_image');
    const colourmap = url.searchParams.get('colourmap_name');
    const useInverseImage = colourmap?.endsWith('_r');
    const imageToFetch = useInverseImage ? image_reverse : image;
    const imageResponse = await fetch(imageToFetch);

    // do some basic canvas manip to emulate original images/different false colour maps
    if (originalImage || colourmap || preferredColourMap) {
      const imageUrl = window.URL.createObjectURL(await imageResponse.blob());
      const canvas = window.document.createElement('canvas');
      const context = canvas.getContext('2d');

      const result = await new Promise<HttpResponse>((resolve, reject) => {
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
            else if (colourmap) {
              setFillStyleFromColourMap(context, colourmap);
            } else if (preferredColourMap) {
              setFillStyleFromColourMap(context, preferredColourMap);
            }
            context.fillRect(0, 0, canvas.width, canvas.height);

            canvas.toBlob(async (blob) => {
              if (blob) {
                const arrayBuffer = await blob.arrayBuffer();

                resolve(
                  new HttpResponse(arrayBuffer, {
                    headers: {
                      'Content-Length': arrayBuffer.byteLength.toString(),
                      'Content-Type': 'image/png',
                    },
                    status: 200,
                  })
                );
              } else {
                reject(new HttpResponse(null, { status: 500 }));
              }
            });
          } else {
            reject(new HttpResponse(null, { status: 500 }));
          }
        };
        img.onerror = reject;
        img.src = imageUrl;
      });

      return result;
    } else {
      // Convert png image to "ArrayBuffer".
      const imageBuffer = await imageResponse.arrayBuffer();

      return new HttpResponse(imageBuffer, {
        headers: {
          'Content-Length': imageBuffer.byteLength.toString(),
          'Content-Type': 'image/png',
        },
        status: 200,
      });
    }
  }),
  http.get('/images/colour_bar', async ({ request }) => {
    const url = new URL(request.url);
    const colourmap = url.searchParams.get('colourmap_name');
    const useInverseImage = colourmap?.endsWith('_r');
    const imageToFetch = useInverseImage ? colourbar_reverse : colourbar;
    const imageResponse = await fetch(imageToFetch);

    if (colourmap || preferredColourMap) {
      const imageUrl = window.URL.createObjectURL(await imageResponse.blob());
      const canvas = window.document.createElement('canvas');
      const context = canvas.getContext('2d');

      const result = await new Promise<HttpResponse>((resolve, reject) => {
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
              setFillStyleFromColourMap(context, colourmap);
            } else if (preferredColourMap) {
              setFillStyleFromColourMap(context, preferredColourMap);
            }
            context.fillRect(0, 0, canvas.width, canvas.height);

            canvas.toBlob(async (blob) => {
              if (blob) {
                const arrayBuffer = await blob.arrayBuffer();

                resolve(
                  new HttpResponse(arrayBuffer, {
                    headers: {
                      'Content-Length': arrayBuffer.byteLength.toString(),
                      'Content-Type': 'image/png',
                    },
                    status: 200,
                  })
                );
              } else {
                reject(new HttpResponse(null, { status: 500 }));
              }
            });
          } else {
            reject(new HttpResponse(null, { status: 500 }));
          }
        };
        img.onerror = reject;
        img.src = imageUrl;
      });

      return result;
    } else {
      // Convert png image to "ArrayBuffer".
      const imageBuffer = await imageResponse.arrayBuffer();

      return new HttpResponse(imageBuffer, {
        headers: {
          'Content-Length': imageBuffer.byteLength.toString(),
          'Content-Type': 'image/png',
        },
        status: 200,
      });
    }
  }),
];
