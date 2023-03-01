import { rest } from 'msw';
import * as path from 'path';
import * as fs from 'fs';

export const serverHandlers = [
  rest.get('/images/:recordId/:channelName', async (req, res, ctx) => {
    // Read the image from the file system using the "fs" module.
    const imageBuffer = fs.readFileSync(path.resolve(__dirname, './image.png'));
    console.log('imageBuffer', imageBuffer);

    return res(
      ctx.status(200),
      ctx.set('Content-Length', imageBuffer.byteLength.toString()),
      ctx.set('Content-Type', 'image/png'),
      ctx.body(imageBuffer)
    );
  }),
];
