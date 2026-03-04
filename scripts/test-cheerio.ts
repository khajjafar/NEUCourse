import * as cheerio from 'cheerio';

async function testFetch() {
    const res = await fetch('https://searchneu.com/catalog/202630/CS2500');
    const html = await res.text();
    const $ = cheerio.load(html);

    // Find the course description
    const descHeader = $('h3:contains("COURSE DESCRIPTION")');
    if (descHeader.length > 0) {
        const descParagraph = descHeader.next('p');
        // Let's see what the HTML inside is
        console.log("HTML:", descParagraph.html());
        console.log("TEXT:", descParagraph.text());

        // Remove the button if it exists and get text
        descParagraph.find('button').remove();
        console.log("CLEAN TEXT:", descParagraph.text().trim());
    } else {
        console.log("Could not find COURSE DESCRIPTION header.");
    }
}

testFetch();
