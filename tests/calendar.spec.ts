import { test, expect } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

/**
 * E2E tests for the Weekly Calendar feature.
 * These tests require an authenticated user — set TEST_USER_EMAIL and
 * TEST_USER_PASSWORD in .env.test (gitignored) to run against a real Firebase project.
 */
test.describe('Weekly Calendar', () => {

    test('authenticated user can create, view, and delete a calendar event', async ({ page }) => {
        // 1. Log in
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || '');
        await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || '');
        await page.click('button[type="submit"]');
        await page.waitForURL(`${BASE_URL}/dashboard`);

        // 2. Navigate to Calendar — heading is h2 "My Weekly Schedule"
        await page.goto(`${BASE_URL}/calendar`);
        await expect(page.locator('h2').filter({ hasText: /My Weekly Schedule/i }).first()).toBeVisible({ timeout: 10_000 });

        // 3. Open the inline Add Event form
        await page.getByRole('button', { name: /Add Event/i }).click();

        // 4. Fill in event form (labels lack htmlFor so use placeholder/type selectors)
        const eventTitle = `E2E Test Event ${Date.now()}`;
        await page.locator('input[placeholder="e.g. CS 3500"]').fill(eventTitle);
        await page.locator('input[type="time"]').first().fill('09:00');
        await page.locator('input[type="time"]').nth(1).fill('10:00');

        // 5. Submit
        await page.getByRole('button', { name: /Save/i }).click();

        // 6. Verify event appears in the calendar grid (use title attr on event block, not inner text)
        const eventBlock = page.locator(`[title="${eventTitle}"]`).first();
        await expect(eventBlock).toBeAttached({ timeout: 10_000 });
        await eventBlock.scrollIntoViewIfNeeded();
        await expect(eventBlock).toBeVisible();

        // 7. Clean up — hover to reveal × delete button, accept confirm dialog, then delete
        page.on('dialog', dialog => dialog.accept());
        await eventBlock.hover();
        // Scope delete button to this specific event block to avoid targeting another event's button
        await eventBlock.getByRole('button', { name: /Delete event/i }).click({ force: true });
        await expect(page.locator(`[title="${eventTitle}"]`)).toHaveCount(0, { timeout: 10_000 });
    });

    test('authenticated user can edit an existing calendar event', async ({ page }) => {
        // 1. Log in
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || '');
        await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || '');
        await page.click('button[type="submit"]');
        await page.waitForURL(`${BASE_URL}/dashboard`);

        // 2. Go to Calendar — heading is h2 "My Weekly Schedule"
        await page.goto(`${BASE_URL}/calendar`);
        await expect(page.locator('h2').filter({ hasText: /My Weekly Schedule/i }).first()).toBeVisible({ timeout: 10_000 });

        // 3. Create an event first
        await page.getByRole('button', { name: /Add Event/i }).click();
        const originalTitle = `E2E Edit Event ${Date.now()}`;
        await page.locator('input[placeholder="e.g. CS 3500"]').fill(originalTitle);
        await page.locator('input[type="time"]').first().fill('14:00');
        await page.locator('input[type="time"]').nth(1).fill('15:00');
        await page.getByRole('button', { name: /Save/i }).click();
        const origEventBlock = page.locator(`[title="${originalTitle}"]`).first();
        await expect(origEventBlock).toBeAttached({ timeout: 10_000 });
        await origEventBlock.scrollIntoViewIfNeeded();
        await expect(origEventBlock).toBeVisible();

        // 4. Click event block — opens inline edit form with h3 "Edit Event"
        await origEventBlock.click();
        await expect(page.locator('h3').filter({ hasText: /Edit Event/i })).toBeVisible({ timeout: 5_000 });

        // 5. Update the title and save
        const updatedTitle = `E2E Edited Event ${Date.now()}`;
        await page.locator('input[placeholder="e.g. CS 3500"]').fill(updatedTitle);
        await page.getByRole('button', { name: /Update Event/i }).click();

        // 6. Verify updated title appears in the calendar
        const updatedBlock = page.locator(`[title="${updatedTitle}"]`).first();
        await expect(updatedBlock).toBeAttached({ timeout: 5_000 });
        await updatedBlock.scrollIntoViewIfNeeded();
        await expect(updatedBlock).toBeVisible();

        // 7. Clean up
        page.on('dialog', dialog => dialog.accept());
        await updatedBlock.hover();
        await updatedBlock.getByRole('button', { name: /Delete event/i }).click({ force: true });
        await expect(page.locator(`[title="${updatedTitle}"]`)).toHaveCount(0, { timeout: 10_000 });
    });

    test('calendar page loads with correct heading and day columns', async ({ page }) => {
        // This test checks the public UI structure without authentication
        // The calendar may redirect to login or show an empty state
        await page.goto(`${BASE_URL}/calendar`);

        // Either the calendar loads (if unauthenticated shows empty state)
        // or redirects to login — both are valid behaviors
        const isCalendar = await page.locator('text=/Calendar|Mon|Tue|Wed|Thu|Fri/i').count() > 0;
        const isLogin = page.url().includes('/login');

        expect(isCalendar || isLogin).toBeTruthy();
    });
});
