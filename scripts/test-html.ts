import * as cheerio from 'cheerio';

async function testFetch() {
    const url = 'https://searchneu.com/catalog/202630/CS%202500';
    console.log(`Fetching ${url}...`);
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    // Are there any script tags with JSON?
    $('script').each((i, el) => {
        const text = $(el).html() || '';
        if (text.includes('description') || text.includes('COURSE DESCRIPTION')) {
            console.log(`Script ${i} contains description text:`);
            console.log(text.substring(0, 500));
        }
    });

    // Let's also just search the raw HTML string
    const idx = html.indexOf('Introduces the fundamental ideas of computing');
    if (idx !== -1) {
        console.log("Found CS 2500 default description text at raw index", idx);
        console.log(html.substring(idx - 100, idx + 200));
    } else {
        console.log("Did not find CS 2500 text in raw HTML.");
    }
}

testFetch();
