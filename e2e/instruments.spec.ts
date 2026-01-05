import { test, expect } from '@playwright/test';

test.describe('Instruments', () => {
    test.beforeEach(async ({ page }) => {
        // Standard login before each test in this describe block
        await page.goto('/login');
        await page.fill('input[name="email"]', 'admin@instrumentcollector.com');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should allow navigating to catalog', async ({ page }) => {
        await page.click('text=Catálogo');
        await expect(page).toHaveURL(/.*instruments/);
        // Check if virtualized grid is present (it might take a moment to load items)
        await expect(page.locator('input[placeholder*="Buscar"]')).toBeVisible();
    });

    test('should open Add Instrument form', async ({ page }) => {
        await page.goto('/instruments');
        // Using a more specific selector for the button
        await page.getByRole('button', { name: /añadir nuevo/i }).click();
        await expect(page).toHaveURL(/.*instruments\/new/);
        await expect(page.locator('h1')).toHaveText(/instrumento/i);
    });
});
