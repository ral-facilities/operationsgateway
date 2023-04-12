import { rest } from 'msw';
import image from './image.png';

export const browserHandlers = [
  rest.get('/images/:recordId/:channelName', async (req, res, ctx) => {
    // Convert png image to "ArrayBuffer".
    const imageBuffer = await fetch(image).then((res) => res.arrayBuffer());

    return res(
      ctx.status(200),
      ctx.set('Content-Length', imageBuffer.byteLength.toString()),
      ctx.set('Content-Type', 'image/png'),
      ctx.body(imageBuffer)
    );
  }),
];