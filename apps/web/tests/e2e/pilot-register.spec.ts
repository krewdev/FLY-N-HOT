import { test, expect } from '@playwright/test';

test('pilot register page renders fields', async ({ page }) => {
  await page.goto('/pilot/register');
  await expect(page.getByPlaceholder('First name')).toBeVisible();
  await expect(page.getByPlaceholder('Last name')).toBeVisible();
  await expect(page.getByPlaceholder('Email')).toBeVisible();
  await expect(page.getByPlaceholder('Phone number')).toBeVisible();
  await expect(page.getByPlaceholder('Pilot license number')).toBeVisible();
});


