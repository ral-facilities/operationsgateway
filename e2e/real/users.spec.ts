import dotenvx from '@dotenvx/dotenvx';
import { test as base, BrowserContext, expect, Page } from '@playwright/test';

dotenvx.config({
  convention: 'nextjs',
  quiet: true,
});

const adminAuthFile = 'e2e/real/.auth/admin.json';

let token: string = '';

// Extend base test to authenticate only for this suite
const test = base.extend<{ adminPage: Page }>({
  adminPage: async ({ browser, request }, provide) => {
    const context: BrowserContext = await browser.newContext();
    const page: Page = await context.newPage();

    await page.goto('/');
    const response = await request.get('/operationsgateway-settings.json');
    const { apiUrl } = await response.json();

    // Perform login as admin
    const loginResponse = await request.post(`${apiUrl}/login`, {
      data: {
        username: process.env.VITE_OG_API_ADMIN_USERNAME,
        password: process.env.VITE_OG_API_ADMIN_PASSWORD,
      },
    });

    token = await loginResponse.json();

    await page.evaluate((token) => {
      window.localStorage.setItem('scigateway:token', token);
    }, token);

    // Save the admin storage state
    await context.storageState({ path: adminAuthFile });
    await context.close();

    // Use the authenticated session
    const adminContext: BrowserContext = await browser.newContext({
      storageState: adminAuthFile,
    });
    const adminPage: Page = await adminContext.newPage();

    await provide(adminPage);
  },
});

const user1 = 'frontend_e2e_local';
test.afterEach(async ({ request }) => {
  const { apiUrl } = await (
    await request.get('/operationsgateway-settings.json')
  ).json();

  await request.delete(`${apiUrl}/users/${user1}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
});

test('should be able to create a user, read it, edit it and delete it', async ({
  adminPage,
}) => {
  test.slow(); // Since it does full CRUD
  await adminPage.goto('/admin/users');

  // Add a local user

  await adminPage.getByRole('button', { name: 'Add User' }).click();

  await adminPage
    .getByLabel('Username *', { exact: true })
    .fill('frontend_e2e_local');

  await adminPage
    .getByLabel('Password *', { exact: true })
    .fill('frontend_e2e_local_password');

  await adminPage.getByLabel('Authorised Routes', { exact: true }).click();

  await adminPage.getByRole('option', { name: '/users GET' }).click();

  await adminPage.getByRole('button', { name: 'Submit' }).click();

  // filter for frontend_e2e

  await adminPage
    .getByLabel('Filter by Username', { exact: true })
    .fill('frontend_e2e');

  // check the routes have been set

  await expect(
    adminPage.getByText('frontend_e2e_local', { exact: true })
  ).toHaveCount(1);

  // change password for a local user

  await expect(
    adminPage.getByLabel('Row Actions', { exact: true })
  ).toHaveCount(1);

  await adminPage.getByLabel('Row Actions', { exact: true }).first().click();

  await adminPage.getByText('Change Password', { exact: true }).click();

  await adminPage
    .getByLabel('Password *', { exact: true })
    .fill('frontend_e2e_local_password_2');

  await adminPage.getByRole('button', { name: 'Submit' }).click();

  // modify the routes for a fed id user

  await adminPage.getByLabel('Row Actions', { exact: true }).click();

  await adminPage
    .getByText('Modify Authorised Routes', { exact: true })
    .click();

  await adminPage.getByLabel('Authorised Routes', { exact: true }).click();

  await adminPage.getByRole('option', { name: '/users GET' }).click();

  await adminPage.getByLabel('Authorised Routes', { exact: true }).click();

  await adminPage.getByRole('option', { name: '/maintenance PUT' }).click();

  await adminPage.getByRole('button', { name: 'Submit' }).click();

  // check the routes have been set

  await expect(adminPage.getByText('/users GET', { exact: true })).toHaveCount(
    1
  );

  await expect(
    adminPage.getByText('/maintenance PUT', { exact: true })
  ).toHaveCount(1);

  // delete user

  await adminPage.getByLabel('Row Actions', { exact: true }).click();
  await adminPage.getByText('Delete', { exact: true }).click();
  await adminPage.getByRole('button', { name: 'Continue' }).click();

  await expect(
    adminPage.getByLabel('Row Actions', { exact: true })
  ).toHaveCount(0);
});
