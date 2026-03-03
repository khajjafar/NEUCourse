const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Listen to network requests
    page.on('response', resp => {
        if (resp.url().includes('api')) {
            console.log('API URL:', resp.url());
        }
        if (resp.url().includes('graphql')) {
            console.log('GraphQL URL:', resp.url());
        }
    });

    await page.goto('https://searchneu.com/catalog/202630/ACCT%201201');
    await page.waitForTimeout(3000);

    await browser.close();
})();
