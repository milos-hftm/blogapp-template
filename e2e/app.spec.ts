import { expect, test } from '@playwright/test';

test('should display the blog overview page', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('mat-toolbar')).toContainText('HFTM Web Applications');
  await expect(page.locator('.blog-count')).toContainText('Blog-Posts');
  await expect(
    page
      .locator('app-blog-card')
      .first()
      .or(page.getByText('Blog-Daten konnten nicht geladen werden.')),
  ).toBeVisible({ timeout: 15000 });
});
