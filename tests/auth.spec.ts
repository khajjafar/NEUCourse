import { test, expect } from '@playwright/test';

test.describe('Authentication Elements', () => {
    test('Login page UI matches required elements', async ({ page }) => {
        await page.goto('/login');

        // Check main title styling
        const heading = page.locator('h1:has-text("NEUCourse")');
        await expect(heading).toBeVisible();

        // Check tabs
        const loginTab = page.locator('text=Log In').first();
        const registerTab = page.locator('text=Register').first();
        await expect(loginTab).toBeVisible();
        await expect(registerTab).toBeVisible();

        // Check form inputs
        await expect(page.locator('label', { hasText: 'Email' })).toBeVisible();
        await expect(page.locator('label', { hasText: 'Password' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Log In' })).toBeVisible();
    });

    test('Register page UI matches required elements', async ({ page }) => {
        await page.goto('/register');

        // Check main title styling
        const heading = page.locator('h1:has-text("NEUCourse")');
        await expect(heading).toBeVisible();

        // Check tabs
        const loginTab = page.locator('text=Log In').first();
        const registerTab = page.locator('text=Register').first();
        await expect(loginTab).toBeVisible();
        await expect(registerTab).toBeVisible();

        // Check form inputs
        await expect(page.locator('label', { hasText: 'Email' })).toBeVisible();
        await expect(page.locator('label', { hasText: 'Password' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
    });
});
