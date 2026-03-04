import * as cheerio from 'cheerio';

async function testFetch() {
    const url = 'https://searchneu.com/catalog/202630/CS%202500';
    console.log(`Fetching ${url}...`);
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    const nextData = $('#__NEXT_DATA__').html();
    if (nextData) {
        try {
            const data = JSON.parse(nextData);
            console.log("Found __NEXT_DATA__!");
            // Search for "description" anywhere in the JSON
            const jsonStr = JSON.stringify(data);
            const descIndex = jsonStr.indexOf('description');
            if (descIndex !== -1) {
                console.log("Snippet:", jsonStr.substring(descIndex, descIndex + 200));
            } else {
                console.log("No description found in __NEXT_DATA__.");
            }
        } catch (e) {
            console.error("Error parsing __NEXT_DATA__", e);
        }
    } else {
        console.log("No __NEXT_DATA__ tag found.");
    }
}

testFetch();
