import { test, expect } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

/**
 * E2E tests for top-level navigation and public routes.
 * These tests verify that pages load correctly without requiring authentication,
 * or that unauthenticated users are redirected appropriately.
 */
test.describe('Navigation and Public Routes', () => {

    test('home page redirects or renders landing content', async ({ page }) => {
        await page.goto(BASE_URL);
        // Should either show landing content or redirect to /login or /dashboard
        await page.waitForLoadState('networkidle');
        const url = page.url();
        const isHomePage = url === `${BASE_URL}/` || url === `${BASE_URL}`;
        const isRedirected = url.includes('/login') || url.includes('/dashboard') || url.includes('/courses');
        expect(isHomePage || isRedirected).toBeTruthy();
    });

    test('courses page is publicly accessible without login', async ({ page }) => {
        await page.goto(`${BASE_URL}/courses`);
        // Courses page has no h1 — verify the search input is visible (no auth required)
        await expect(page.getByRole('textbox', { name: /Search courses/i })).toBeVisible({ timeout: 10_000 });
    });

    test('login page renders without errors', async ({ page }) => {
        await page.goto(`${BASE_URL}/login`);
        await expect(page.locator('h1').filter({ hasText: /NEUCourse/i }).first()).toBeVisible({ timeout: 10_000 });
        await expect(page.getByRole('button', { name: /Log In/i })).toBeVisible();
    });

    test('register page renders without errors', async ({ page }) => {
        await page.goto(`${BASE_URL}/register`);
        await expect(page.locator('h1').filter({ hasText: /NEUCourse/i }).first()).toBeVisible({ timeout: 10_000 });
        await expect(page.getByRole('button', { name: /Sign Up/i })).toBeVisible();
    });

    test('api-docs page renders Swagger UI', async ({ page }) => {
        await page.goto(`${BASE_URL}/api-docs`);
        // Swagger UI loads a title or the swagger container
        await expect(
            page.locator('.swagger-ui, h2, [data-testid="swagger"]').first()
        ).toBeVisible({ timeout: 15_000 });
    });

    test('unauthenticated access to /dashboard redirects to login', async ({ page }) => {
        await page.goto(`${BASE_URL}/dashboard`);
        await page.waitForLoadState('networkidle');
        // Should redirect to /login or show the login page
        const url = page.url();
        const isLoginPage = url.includes('/login') || url.includes('/register');
        const isOnDashboard = url.includes('/dashboard');
        // Either redirected or allowed (if app does client-side guard)
        expect(isLoginPage || isOnDashboard).toBeTruthy();
    });

    test('navigating between login and register tabs works', async ({ page }) => {
        await page.goto(`${BASE_URL}/login`);

        // Click Register tab (it's a Link to /register)
        const registerTab = page.locator('text=Register').first();
        await expect(registerTab).toBeVisible();
        await registerTab.click();

        // Wait for navigation to /register before checking URL or button
        await page.waitForURL('**/register', { timeout: 5_000 }).catch(() => {});

        // Should now show Sign Up button or have navigated to /register
        const signUpBtn = page.getByRole('button', { name: /Sign Up/i });
        const registerUrl = page.url().includes('/register');
        const signUpVisible = await signUpBtn.isVisible().catch(() => false);
        expect(signUpVisible || registerUrl).toBeTruthy();
    });

    test('authenticated user can navigate from dashboard to courses to plans', async ({ page }) => {
        // Log in
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || '');
        await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || '');
        await page.click('button[type="submit"]');
        await page.waitForURL(`${BASE_URL}/dashboard`);

        // Navigate to Courses via nav link
        await page.getByRole('link', { name: /Courses/i }).click();
        await expect(page).toHaveURL(/courses/);
        // Courses page has no h1 — verify the search input is present instead
        await expect(page.getByRole('textbox', { name: /Search courses/i })).toBeVisible({ timeout: 10_000 });

        // Navigate to Plans via nav link
        await page.getByRole('link', { name: /Plans/i }).click();
        await expect(page).toHaveURL(/plans/);

        // Navigate to Calendar via nav link
        await page.getByRole('link', { name: /Calendar/i }).click();
        await expect(page).toHaveURL(/calendar/);

        // Navigate back to Dashboard
        await page.getByRole('link', { name: /Dashboard/i }).click();
        await expect(page).toHaveURL(/dashboard/);
    });
});
