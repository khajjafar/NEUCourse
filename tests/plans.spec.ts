import { test, expect } from '@playwright/test';

// Define the base URL pointing to the local development environment
const BASE_URL = 'http://localhost:3000';

test.describe('Degree Plan Builder Flow', () => {

    // NOTE: This test requires a valid authenticated Firebase session.
    // In CI environments, configure a dedicated test user. 
    // We are skipping by default to prevent pipeline failures on unseeded environments.
    test.skip('should create a plan, add a semester, and assign a course', async ({ page }) => {
        // 1. Authenticate (Assumes test user exists)
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || 'test@neucourse.local');
        await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || 'password123');
        await page.click('button[type="submit"]');

        // Wait for redirect to plans dashboard
        await expect(page).toHaveURL(`${BASE_URL}/plans`);

        // 2. Create a Plan
        const planName = 'E2E Testing Plan';
        await page.fill('input[name="planName"]', planName);
        await page.click('button:has-text("Create Plan")');

        // Verify the plan is in the list
        const planLink = page.locator('a', { hasText: planName }).first();
        await expect(planLink).toBeVisible();

        // 3. Navigate into the Plan Details
        await planLink.click();
        await expect(page.locator('h2', { hasText: planName })).toBeVisible();

        // 4. Create a Semester
        const semesterName = 'Fall 2026';
        await page.fill('input[name="semesterName"]', semesterName);
        await page.click('button:has-text("Add Semester")');

        // Verify semester appears
        await expect(page.locator('h3', { hasText: semesterName })).toBeVisible();

        // 5. Navigate to Courses and Assign
        await page.goto(`${BASE_URL}/courses`);
        await page.fill('input[name="search"]', 'Object-Oriented');
        await page.locator('text=CS 3500').first().click();

        // Wait for modal to load course details
        await expect(page.locator('h1', { hasText: 'Object-Oriented Design' })).toBeVisible();

        // Click Add to Plan dropdown
        const addToPlanBtn = page.locator('button', { hasText: 'Add to Plan' });
        await addToPlanBtn.click();

        // Select the Plan then Semester
        await page.locator('button', { hasText: planName }).click();
        await page.locator('button', { hasText: semesterName }).click();

        // Ensure success state
        await expect(page.locator('text=Added to Fall 2026')).toBeVisible();

        // 6. Verify assignment on Dashboard
        await page.goto(`${BASE_URL}/plans`);
        await page.locator('a', { hasText: planName }).first().click();

        // Ensure CourseMiniCard rendered inside semester container
        await expect(page.locator('text=CS 3500')).toBeVisible();
    });
});
