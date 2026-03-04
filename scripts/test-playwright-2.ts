import { chromium } from 'playwright';

async function testPlaywright() {
    const browser = await chromium.launch({ headless: true });
    // Use a user-agent to avoid basic bot blocks
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    const url = 'https://searchneu.com/catalog/202630/CS%202500';
    console.log(`Navigating to ${url}...`);

    // domcontentloaded is safer than networkidle
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    console.log("Waiting for COURSE DESCRIPTION...");
    try {
        const header = page.locator('h3:text-is("COURSE DESCRIPTION")');
        await header.waitFor({ timeout: 15000 });

        console.log("Header found. Finding description text...");
        // Search for the paragraph containing the "see more" button or the text itself
        // In the user snippet:
        // <div class="flex flex-col items-start gap-2 self-stretch">
        //   <h3 ...>COURSE DESCRIPTION</h3>
        //   <p class="text-neu8 self-stretch text-base">...</p>
        // </div>

        const parentDiv = header.locator('..');
        const descParagraph = parentDiv.locator('p');
        await descParagraph.waitFor({ state: 'attached' });

        const seeMoreBtn = descParagraph.locator('button', { hasText: /see more/i });
        if (await seeMoreBtn.isVisible()) {
            console.log("Clicking 'see more'...");
            await seeMoreBtn.click();
        }

        const fullText = await descParagraph.innerText();

        // Remove button texts 'see more' or 'see less' from the final string
        const cleanedText = fullText.replace(/see more/i, '').replace(/see less/i, '').trim();
        console.log("SUCCESS! Description:", cleanedText);

    } catch (e) {
        console.error("Failed", e);
    }

    await browser.close();
}

testPlaywright();
