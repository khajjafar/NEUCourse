import { chromium } from 'playwright';

async function diagnose() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    // First course in DB was AACE 6000
    const url = 'https://searchneu.com/catalog/202630/AACE%206000';
    console.log(`Navigating to ${url}...`);

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    console.log("Looking for COURSE DESCRIPTION header...");
    try {
        const header = page.locator('h3:has-text("COURSE DESCRIPTION")');
        // Let's just wait for 5 seconds to see if it shows up
        await header.waitFor({ timeout: 5000 });
        console.log("Header found.");

        const parentDiv = header.locator('..');
        const descParagraph = parentDiv.locator('p');
        console.log("Description Text:", await descParagraph.innerText());
    } catch (e) {
        console.log("Timeout waiting for COURSE DESCRIPTION. Let's dump the page body text to see what rendered:");
        // Dump the text of the main content area to see what Playwright sees
        const bodyText = await page.locator('body').innerText();
        console.log(bodyText.substring(0, 1000));
    }

    await browser.close();
}

diagnose();
