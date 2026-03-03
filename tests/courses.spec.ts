import { test, expect } from '@playwright/test';

// Define the base URL pointing to the local development environment
const BASE_URL = 'http://localhost:3000';

test.describe('Course Search Page', () => {
    test('should load the courses page and display search elements', async ({ page }) => {
        // Navigate to the courses page
        await page.goto(`${BASE_URL}/courses`);

        // Check if the header exists
        await expect(page.locator('h1', { hasText: 'Browse Courses' })).toBeVisible();

        // Check if the search input and subject dropdown are visible
        const searchInput = page.getByRole('textbox', { name: /Search courses/i });
        const filterSelect = page.getByRole('combobox', { name: /Filter by Subject/i });

        await expect(searchInput).toBeVisible();
        await expect(filterSelect).toBeVisible();
    });

    test('should display foundational courses and update results via filtering', async ({ page }) => {
        // Given the mock dataset we inserted into firebase, we should see Object-Oriented Design in CS
        await page.goto(`${BASE_URL}/courses`);

        // Type "CS" in the global search bar
        const searchInput = page.getByRole('textbox', { name: /Search courses/i });
        await searchInput.fill('Object-Oriented');

        // Due to the 300ms debounce and network request, wait for the network to resolve organically
        // We can look for the title text that indicates it fetched successfully
        await expect(page.locator('text=Object-Oriented Design').first()).toBeVisible({ timeout: 5000 });
        await expect(page.locator('text=CS 3500')).toBeVisible();

        // Clear and switch to a different subject
        await searchInput.clear();
        const filterSelect = page.getByRole('combobox', { name: /Filter by Subject/i });
        await filterSelect.selectOption('MATH');

        await expect(page.locator('text=Calculus 1')).toBeVisible({ timeout: 5000 });

        // Let's force an empty state
        await searchInput.fill('NonExistentStringOfData999');
        await expect(page.locator('text=No courses found.')).toBeVisible({ timeout: 5000 });
    });
});
