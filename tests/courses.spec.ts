import { test, expect } from '@playwright/test';

// Define the base URL pointing to the local development environment
const BASE_URL = 'http://localhost:3000';

test.describe('Course Search Page & Detail Modal', () => {
    test('should load the courses page and display search elements', async ({ page }) => {
        // Navigate to the courses page
        await page.goto(`${BASE_URL}/courses`);

        // Check if the header exists
        await expect(page.locator('h1', { hasText: 'Browse Courses' })).toBeVisible({ timeout: 10000 });

        // Check if the search input and subject dropdown are visible
        const searchInput = page.getByRole('textbox', { name: /Search courses/i });
        const filterSelect = page.getByRole('combobox', { name: /Filter by Subject/i });

        await expect(searchInput).toBeVisible();
        await expect(filterSelect).toBeVisible();
    });

    test('should open the course detail modal when clicking a course card', async ({ page }) => {
        // Go to the search page and make sure data loads
        await page.goto(`${BASE_URL}/courses`);

        const searchInput = page.getByRole('textbox', { name: /Search courses/i });
        await searchInput.fill('Object-Oriented');

        // Wait for results
        await expect(page.locator('text=CS 3500').first()).toBeVisible({ timeout: 10000 });

        // Click the resulting course card
        await page.locator('text=CS 3500').first().click();

        // Wait for the Intercepting Route Modal to animate in and execute the GET `/api` query natively
        // We can verify this worked if the modal's specific heading styles or description load
        await expect(page.locator('h1', { hasText: 'Object-Oriented Design' })).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=4 Credits').first()).toBeVisible();

        // We should see the Prerequisite section loaded on the modal
        await expect(page.getByRole('link', { name: 'CS2510', exact: true })).toBeVisible();

        // Ensure the URL updated gracefully in the browser address bar while the modal stayed open
        expect(page.url()).toContain('/courses/CS3500');

        // Click the back button on the modal header (only visible on non-mobile by default, but we can hit escape)
        await page.keyboard.press('Escape');

        // Modal should disappear, original URL should be restored
        await expect(page.locator('h1', { hasText: 'Object-Oriented Design' })).toBeHidden();
        expect(page.url()).toContain('/courses');
    });
});
