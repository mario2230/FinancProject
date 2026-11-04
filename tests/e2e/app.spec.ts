import { expect, test } from '@playwright/test';

test('redirects an unauthenticated user to login', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator('ion-content')).toContainText('Entrar');
});
