const cheerio = require('cheerio');
const fs = require('fs');

const html = fs.readFileSync('test-acct1209.html', 'utf8');
const $ = cheerio.load(html);

const classes = [];
$('table tbody tr').each((_, row) => {
    const tds = $(row).find('td');
    if (tds.length >= 7) {
        const crn = $(tds[1]).text().trim();
        const seatsMatch = $(tds[2]).text().match(/(\d+)\s*\/\s*(\d+)/);
        const seats = seatsMatch ? `${seatsMatch[1]}/${seatsMatch[2]}` : $(tds[2]).text().trim();

        // Complex meeting times need better extraction
        // Let's just grab the days and times
        const timeText = $(tds[3]).text().trim();
        const rooms = $(tds[4]).text().trim();
        const professor = $(tds[5]).text().trim();
        const campus = $(tds[6]).text().trim();

        classes.push({ crn, seats, meetingTimes: timeText, rooms, professor, campus });
    }
});
console.log(classes);
