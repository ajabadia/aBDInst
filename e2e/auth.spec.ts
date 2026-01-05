import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test('should allow user to login with admin credentials', async ({ page }) => {
        // Go to login page
        await page.goto('/login');

        // Fill credentials
        await page.fill('input[name="email"]', 'admin@instrumentcollector.com');
        await page.fill('input[name="password"]', 'admin');

        // Click submit
        await page.click('button[type="submit"]');

        // Wait for navigation/redirection to dashboard
        await expect(page).toHaveURL(/.*dashboard/);

        // Verify user is logged in (e.g., checking for welcome message or logout button)
        await expect(page.locator('h1')).toContainText('Hola');
    });

    test('should show error for invalid credentials', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', 'wrong@example.com');
        await page.fill('input[name="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');

        // Check for error toast or message
        await expect(page.locator('text=Credenciales incorrectas')).toBeVisible();
    });
});
