import { test, expect } from '@playwright/test';

test('home loads and shows hero', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('fiahab.com')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explore Flights' })).toBeVisible();
});


