import { defineConfig } from 'cypress';
import { removeDirectory } from 'cypress-delete-downloads-folder';

export default defineConfig({
  chromeWebSecurity: false,
  video: false,
  retries: {
    runMode: 3,
    openMode: 0,
  },
  e2e: {
    setupNodeEvents(on) {
      on('task', { removeDirectory });
    },
    baseUrl: 'http://127.0.0.1:3000',
  },
});
