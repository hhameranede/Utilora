import { expect, test } from '@playwright/test';

test('homepage exposes popular tools immediately on a mobile screen', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 720 });
  await page.goto('/en');

  const quickTools = page.locator('#quick-tools');
  await expect(quickTools.getByRole('heading', { level: 2, name: 'Most Popular Utilities' })).toBeVisible();

  const cards = quickTools.locator('a[href*="/en/tools/"]');
  await expect(cards).toHaveCount(6);

  const firstRow = await Promise.all([0, 1].map((index) => cards.nth(index).boundingBox()));
  expect(
    firstRow.every((box) => box !== null && box.y + box.height <= 720),
    'The first two real tool shortcuts should be fully visible without scrolling.',
  ).toBe(true);

  const categoriesHeading = page.getByRole('heading', { level: 2, name: 'Explore By Category' });
  const quickToolsBox = await quickTools.boundingBox();
  const categoriesBox = await categoriesHeading.boundingBox();
  expect(quickToolsBox).not.toBeNull();
  expect(categoriesBox).not.toBeNull();
  expect(categoriesBox!.y).toBeGreaterThan(quickToolsBox!.y);
});

test('tool catalogue presents button-shaped card actions and visibly selectable category filters', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/en/tools');

  const firstToolCard = page.locator('a.group').filter({ hasText: 'Open Tool' }).first();
  await expect(firstToolCard).toBeVisible();

  const action = firstToolCard.locator('span.inline-flex').last();
  await expect(action).toContainText('Open Tool');
  await expect(action).toHaveCSS('background-color', 'rgb(237, 240, 255)');
  await expect(action).toHaveCSS('border-color', 'rgb(217, 223, 255)');

  const pdfFilter = page.getByRole('button', { name: 'PDF Tools' });
  await expect(pdfFilter).toHaveAttribute('aria-pressed', 'false');
  await expect(pdfFilter).toHaveClass(/bg-white/);
  await expect(pdfFilter).toHaveClass(/border-stone-200/);

  await pdfFilter.click();
  await expect(pdfFilter).toHaveAttribute('aria-pressed', 'true');
  await expect(pdfFilter).toHaveCSS('background-color', 'rgb(70, 88, 216)');
  await expect(pdfFilter).toHaveCSS('border-color', 'rgb(70, 88, 216)');
});
