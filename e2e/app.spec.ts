import { expect, test } from '@playwright/test';

const blogs = [
  {
    id: 101,
    title: 'Testing in der Praxis',
    contentPreview: 'Unit Tests sichern die Logik, E2E Tests pruefen den ganzen Flow.',
    content: 'Unit Tests sichern die Logik, E2E Tests pruefen den ganzen Flow.',
    author: 'student@hftm.ch',
    likes: 5,
    comments: 2,
    likedByMe: false,
    createdByMe: false,
    createdAt: '2026-09-24T10:00:00.000Z',
    updatedAt: '2026-09-24T10:00:00.000Z',
  },
  {
    id: 102,
    title: 'Responsive Blog Layout',
    contentPreview: 'Die Blog-Liste bleibt auf Desktop und Mobile gut lesbar.',
    content: 'Die Blog-Liste bleibt auf Desktop und Mobile gut lesbar.',
    author: 'student@hftm.ch',
    likes: 3,
    comments: 1,
    likedByMe: true,
    createdByMe: false,
    createdAt: '2026-09-24T11:00:00.000Z',
    updatedAt: '2026-09-24T11:00:00.000Z',
  },
];

test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ authenticated: false, roles: [] }),
    });
  });

  await page.route(/\/entries$/, async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        data: blogs,
        pageIndex: 0,
        pageSize: blogs.length,
        totalCount: blogs.length,
        maxPageSize: 100,
      }),
    });
  });
});

test('should display the blog overview page with entries', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('mat-toolbar')).toContainText('HFTM Web Applications');
  await expect(page.locator('.blog-count')).toContainText('2 Blog-Posts');
  await expect(page.locator('app-blog-card')).toHaveCount(2);
  await expect(page.getByText('Testing in der Praxis')).toBeVisible();
  await expect(
    page.getByText('Unit Tests sichern die Logik, E2E Tests pruefen den ganzen Flow.'),
  ).toBeVisible();
});
