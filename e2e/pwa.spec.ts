import { expect, test } from '@playwright/test';

test('PWA manifest exposes a standalone UTILORA install target', async ({ request }) => {
  const response = await request.get('/manifest.webmanifest');
  expect(response.ok()).toBeTruthy();

  const manifest = await response.json();
  expect(manifest.short_name).toBe('UTILORA');
  expect(manifest.start_url).toBe('/en');
  expect(manifest.scope).toBe('/');
  expect(manifest.display).toBe('standalone');
  expect(manifest.theme_color).toBe('#4658D8');
  expect(manifest.icons).toEqual(expect.arrayContaining([
    expect.objectContaining({ src: '/pwa-icon.svg', type: 'image/svg+xml' }),
  ]));

  const icon = await request.get('/pwa-icon.svg');
  expect(icon.ok()).toBeTruthy();
  expect(await icon.text()).toContain('#3444BD');
  expect(await icon.text()).toContain('#AEEBE8');
});

test('service worker keeps a visited tool available offline and shows a fallback for a new route', async ({ page }) => {
  await page.goto('/en');

  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

  await page.goto('/en/tools/json-validator');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('JSON Validator');

  try {
    await page.context().setOffline(true);
    await page.goto('/en/tools/json-validator');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('JSON Validator');

    await page.goto('/bn/a-route-not-visited-before-offline');
    await expect(page.getByRole('heading', { name: "You're offline" })).toBeVisible();
  } finally {
    await page.context().setOffline(false);
  }
});
