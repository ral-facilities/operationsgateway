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
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          // Set pointer type to fine so that date inputs work properly
          // ref: https://mui.com/x/react-date-pickers/base-concepts/#testing-caveats
          launchOptions.args.push('--blink-settings=primaryPointerType=4');
        }

        if (browser.family === 'firefox') {
          // Set pointer type to fine so that date inputs work properly
          // ref: https://mui.com/x/react-date-pickers/base-concepts/#testing-caveats
          launchOptions.preferences['ui.primaryPointerCapabilities'] = 4;
        }

        // whatever you return here becomes the launchOptions
        return launchOptions;
      });
    },
    baseUrl: 'http://127.0.0.1:3000',
  },
});
