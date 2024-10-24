import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  /* Maximum time one test can run for. */
  timeout: 60 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  // use 0.0.0.0 loopback address when running the tests in a local docker container
  // so that the report URL is accessible via host localhost:9323.
  reporter: [
    [
      'html',
      {
        host: '0.0.0.0',
        port: 9323,
      },
    ],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects:
    process.env.USE_REAL_API === 'true'
      ? [
          {
            name: 'setup',
            testDir: './e2e/real',
            testMatch: /.*\.setup\.ts/,
          },
          // full e2e tests
          {
            name: 'E2E tests',
            use: {
              ...devices['Desktop Chrome'],
              // Use prepared auth state.
              storageState: 'e2e/real/.auth/user.json',
            },
            testDir: './e2e/real',
            testIgnore: /.*sessions.spec.ts/,
            dependencies: ['setup'],
          },
          // sessions test needs to run on firefox to test saving position & size of popups
          {
            name: 'E2E tests - Firefox',
            use: {
              ...devices['Desktop Firefox'],
              launchOptions: {
                // need these to ensure Date picker media queries pass
                // ref: https://mui.com/x/react-date-pickers/base-concepts/#testing-caveats
                firefoxUserPrefs: {
                  'ui.primaryPointerCapabilities': 0x02 | 0x04,
                  'ui.allPointerCapabilities': 0x02 | 0x04,
                },
              },
              // Use prepared auth state.
              storageState: 'e2e/real/.auth/user.json',
            },
            testDir: './e2e/real',
            testMatch: /.*sessions.spec.ts/,
            dependencies: ['setup'],
          },
        ]
      : [
          {
            name: 'chromium',
            use: {
              ...devices['Desktop Chrome'],
            },
            testDir: './e2e/mocked',
          },

          {
            name: 'firefox',
            use: {
              ...devices['Desktop Firefox'],
              launchOptions: {
                // need these to ensure Date picker media queries pass
                // ref: https://mui.com/x/react-date-pickers/base-concepts/#testing-caveats
                firefoxUserPrefs: {
                  'ui.primaryPointerCapabilities': 0x02 | 0x04,
                  'ui.allPointerCapabilities': 0x02 | 0x04,
                },
              },
            },
            testDir: './e2e/mocked',
          },

          {
            name: 'webkit',
            use: {
              ...devices['Desktop Safari'],
            },
            testDir: './e2e/mocked',
          },

          /* Test against mobile viewports. */
          // {
          //   name: 'Mobile Chrome',
          //   use: {
          //     ...devices['Pixel 5'],
          //   },
          // },
          // {
          //   name: 'Mobile Safari',
          //   use: {
          //     ...devices['iPhone 12'],
          //   },
          // },

          /* Test against branded browsers. */
          // {
          //   name: 'Microsoft Edge',
          //   use: {
          //     channel: 'msedge',
          //   },
          // },
          // {
          //   name: 'Google Chrome',
          //   use: {
          //     channel: 'chrome',
          //   },
          // },
        ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  webServer: {
    command:
      process.env.USE_REAL_API === 'true'
        ? 'yarn e2e:serve:api'
        : 'yarn e2e:serve',
    url: 'http://localhost:3000',
    timeout: 180 * 1000,
    stdout: 'pipe',
    // this option means that we can serve our server ourselves and Playwright will reuse it during development
    reuseExistingServer: true,
  },
};

export default config;
