import { test as setup } from '@playwright/test';
import dotenvx from '@dotenvx/dotenvx';

dotenvx.config({
  convention: 'nextjs',
  quiet: true,
});

const authFile = 'e2e/real/.auth/user.json';

setup('authenticate', async ({ request, page }) => {
  await page.goto('/');
  const { apiUrl } = await (
    await request.get('/operationsgateway-settings.json')
  ).json();

  // Send authentication request. Replace with your own.
  const response = await request.post(`${apiUrl}/login`, {
    data: {
      username: process.env.VITE_OG_API_USERNAME,
      password: process.env.VITE_OG_API_PASSWORD,
    },
  });
  const token = await response.json();
  await page.evaluate((token) => {
    window.localStorage.setItem('scigateway:token', token);
  }, token);

  // End of authentication steps.

  await page.context().storageState({ path: authFile });
});
