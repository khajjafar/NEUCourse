import { chromium } from 'playwright';

async function testPlaywright() {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    console.log("Navigating to CS 2500...");
    await page.goto('https://searchneu.com/catalog/202630/CS%202500', { waitUntil: 'networkidle' });

    console.log("Waiting for COURSE DESCRIPTION header...");
    try {
        await page.waitForSelector('h3:has-text("COURSE DESCRIPTION")', { timeout: 10000 });
        const header = page.locator('h3:has-text("COURSE DESCRIPTION")');

        if (await header.count() > 0) {
            // The description is the next <p> sibling. In the provided snippet, it's inside a div.
            // Let's just find the <p> following this <h3> or within the same parent
            const pLocator = header.locator('xpath=./following-sibling::p');

            if (await pLocator.count() > 0) {
                // Check if there's a button
                const btn = pLocator.locator('button');
                if (await btn.count() > 0) {
                    console.log("Clicking see more button...");
                    await btn.click({ timeout: 2000 }).catch(() => { });
                }

                // Get inner text and scrub the "see more" or "see less" text 
                const text = await pLocator.innerText();
                const cleanedText = text.replace(/see more/i, '').replace(/see less/i, '').trim();
                console.log("FINAL TEXT:", cleanedText);
            } else {
                console.log("Could not find paragraph sibling.");
                // fallback to parent's p
                const parentP = header.locator('xpath=..//p');
                if (await parentP.count() > 0) {
                    const btn = parentP.locator('button');
                    if (await btn.count() > 0) {
                        console.log("Clicking see more button...");
                        await btn.click({ timeout: 2000 }).catch(() => { });
                    }
                    const text = await parentP.innerText();
                    const cleanedText = text.replace(/see more/i, '').replace(/see less/i, '').trim();
                    console.log("FINAL TEXT (parent sibling):", cleanedText);
                } else {
                    console.log("No <p> found next to header.");
                }
            }
        }
    } catch (e) {
        console.error("Timeout or error waiting for selector", e);
    }

    await browser.close();
}

testPlaywright();
