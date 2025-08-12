import { test, expect } from '@playwright/test';

test('notify signup form is present', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Get notified about new flights')).toBeVisible();
});


