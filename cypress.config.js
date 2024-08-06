/* eslint-disable @typescript-eslint/no-var-requires */
const { defineConfig } = require('cypress');
const { removeDirectory } = require('cypress-delete-downloads-folder');

module.exports = defineConfig({
  chromeWebSecurity: false,
  video: false,
  retries: {
    runMode: 3,
    openMode: 0,
  },
  e2e: {
    setupNodeEvents(on) {
      on('task', { removeDirectory });
      // https://github.com/bahmutov/cypress-failed-log
      require('cypress-failed-log/on')(on);

      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          // Set pointer type to fine so that date inputs work properly
          launchOptions.args.push('--blink-settings=primaryPointerType=4');
        }

        if (browser.family === 'firefox') {
          // Set pointer type to fine so that date inputs work properly
          launchOptions.preferences['ui.primaryPointerCapabilities'] = 4;
        }

        // whatever you return here becomes the launchOptions
        return launchOptions;
      });
    },
    baseUrl: 'http://127.0.0.1:3000',
  },
});
