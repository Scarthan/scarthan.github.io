const { test, expect } = require('@playwright/test');

async function openMobileMenuIfNeeded(page) {
  const menu = page.getByRole('button', { name: 'Toggle navigation' });
  if (await menu.isVisible()) await menu.click();
}

test('search resolves a query entered while the index is loading', async ({ page }) => {
  let releaseSearch;
  const searchDelay = new Promise(resolve => { releaseSearch = resolve; });
  await page.route('**/search.json', async route => {
    await searchDelay;
    await route.continue();
  });

  await page.goto('/');
  const input = page.getByRole('searchbox', { name: 'Search posts' });
  await input.fill('PowerShell');
  await expect(page.locator('#search-status')).toHaveText('Loading search results');
  await expect(page.locator('#results-container')).toBeHidden();

  releaseSearch();
  await expect(page.locator('#results-container')).toContainText('PowerShell on Android');

  await input.press('ArrowDown');
  const firstResult = page.locator('#results-container a').first();
  await expect(firstResult).toBeFocused();
  await firstResult.press('Escape');
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('');
  await expect(page.locator('#results-container')).toBeHidden();
});

test('theme follows the system preference and persists an override', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await openMobileMenuIfNeeded(page);
  await page.getByRole('button', { name: 'Use light mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('theme toggle works when local storage is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() { throw new DOMException('Storage blocked', 'SecurityError'); }
    });
  });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await openMobileMenuIfNeeded(page);
  await page.getByRole('button', { name: 'Use light mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('mobile navigation opens and closes with the keyboard', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile');
  await page.goto('/');

  const menu = page.getByRole('button', { name: 'Toggle navigation' });
  const links = page.locator('#nav-links');
  await expect(links).toBeHidden();
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(links).toBeVisible();
  await links.getByRole('link', { name: 'Tags' }).focus();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await expect(links).toBeHidden();
});

test('Titan article uses its illustration for sharing and page content', async ({ page }) => {
  await page.goto('/titan-of-enceladus/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/assets\/titan-web\.jpg$/);
  const image = page.getByRole('img', { name: 'The Titan of Enceladus' });
  await expect(image).toHaveAttribute('width', '1024');
  await expect(image).toHaveAttribute('height', '1024');
  await expect(image).toHaveJSProperty('naturalWidth', 1024);
});
