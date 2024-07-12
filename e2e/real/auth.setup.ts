import { test as setup } from '@playwright/test';

const authFile = 'e2e/real/.auth/user.json';

setup('authenticate', async ({ request, page }) => {
  await page.goto('/');
  const { apiUrl } = await (
    await request.get('/operationsgateway-settings.json')
  ).json();

  // Send authentication request. Replace with your own.
  const response = await request.post(`${apiUrl}/login`, {
    data: {
      username: 'frontend',
      password: 'front',
    },
  });
  const token = await response.json();
  await page.evaluate((token) => {
    window.localStorage.setItem('scigateway:token', token);
  }, token);

  // End of authentication steps.

  await page.context().storageState({ path: authFile });
});
