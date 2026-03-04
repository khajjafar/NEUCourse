import { test, expect } from '@playwright/test';

test.describe('Authentication Elements', () => {
    test('Login page UI matches required elements', async ({ page }) => {
        await page.goto('http://localhost:3000/login');

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

        // Check guest access
        const guestLink = page.locator('text=View courses as a guest');
        await expect(guestLink).toBeVisible();
        await expect(guestLink).toHaveAttribute('href', '/courses');
    });

    test('Register page UI matches required elements', async ({ page }) => {
        await page.goto('http://localhost:3000/register');

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

        // Check guest access
        const guestLink = page.locator('text=View courses as a guest');
        await expect(guestLink).toBeVisible();
        await expect(guestLink).toHaveAttribute('href', '/courses');
    });
});
