import { http, HttpResponse } from 'msw';
import * as path from 'path';
import * as fs from 'fs';

export const serverHandlers = [
  http.get('/images/:recordId/:channelName', async () => {
    // Read the image from the file system using the "fs" module.
    const imageBuffer = fs.readFileSync(path.resolve(__dirname, './image.png'));
    return HttpResponse.json(imageBuffer, { status: 200 });
  }),
  http.get('/images/colour_bar', async () => {
    // Read the image from the file system using the "fs" module.
    const imageBuffer = fs.readFileSync(
      path.resolve(__dirname, './colourbar.png')
    );

    return HttpResponse.json(imageBuffer, { status: 200 });
  }),
];
