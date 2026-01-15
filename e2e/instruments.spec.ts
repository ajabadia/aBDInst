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

    test('should allow creating a new instrument', async ({ page }) => {
        const testInstrument = {
            brand: 'Test Brand ' + Date.now(),
            model: 'E2E Model',
            type: 'Synthesizer'
        };

        await page.goto('/instruments/new');

        // Fill basic info
        await page.fill('input[name="brand"]', testInstrument.brand);
        await page.fill('input[name="model"]', testInstrument.model);
        await page.fill('input[name="type"]', testInstrument.type);

        // Submit form
        await page.click('button[type="submit"]');

        // Expect redirect to catalog or detail
        // Wait for URL to change (either to /instruments/ID or /instruments)
        await page.waitForURL(/\/instruments(\/.*)?/);

        // Allow some time for the list to refresh/server action to complete revalidation
        await page.goto('/instruments');

        // Verify item exists in list
        // We search for it to filter the grid
        const searchInput = page.locator('input[placeholder*="Buscar"]');
        await searchInput.fill(testInstrument.brand);

        // Wait for debounce/filter
        await page.waitForTimeout(1000);

        await expect(page.locator('body')).toContainText(testInstrument.brand);
    });
});
