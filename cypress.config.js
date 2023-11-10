/* eslint-disable @typescript-eslint/no-var-requires */
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  chromeWebSecurity: false,
  video: false,
  retries: {
    runMode: 3,
    openMode: 0,
  },
  e2e: {
    setupNodeEvents(on) {
      // https://github.com/bahmutov/cypress-failed-log
      require('cypress-failed-log/on')(on);
    },
    baseUrl: 'http://127.0.0.1:3000',
  },
});
