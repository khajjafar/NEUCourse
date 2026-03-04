async function runApiTests() {
    const baseUrl = 'http://localhost:3000/api/v1/courses';

    console.log("TEST 1: Word Boundary Regex for 'Cs'");
    let res = await fetch(`${baseUrl}?q=Cs`);
    let json = await res.json();
    let courses = json.data || [];
    console.log(`Matched ${courses.length} courses for 'Cs'`);

    const csFailures = courses.filter((c: any) => {
        const searchableText = `${c.subject} ${c.number} ${c.name} ${c.description}`.toLowerCase();
        return !/\bcs\b/i.test(searchableText) && !searchableText.startsWith('cs');
    });
    console.log(`CS Failures (false positives): ${csFailures.length}`);
    if (csFailures.length > 0) {
        csFailures.forEach((c: any) => {
            console.log("---");
            console.log("Name:", c.name);
            console.log("Subject+Num:", c.subject, c.number);
            const searchableText = `${c.subject} ${c.number} ${c.name} ${c.description}`.toLowerCase();
            // Show us where "cs" was matched in the string
            const matchIdx = searchableText.match(/\bcs/i)?.index;
            if (matchIdx !== undefined && matchIdx > -1) {
                console.log("MATCH SNIPPET:", searchableText.substring(Math.max(0, matchIdx - 20), matchIdx + 20));
            } else {
                console.log("No \\bcs match found locally??");
            }
        });
    }

    console.log("\nTEST 2: Min/Max Level Range (2000 - 3000)");
    res = await fetch(`${baseUrl}?minLevel=2000&maxLevel=3000`);
    json = await res.json();
    courses = json.data || [];
    console.log(`Matched ${courses.length} courses for Level 2000-3000`);

    const levelFailures = courses.filter((c: any) => parseInt(c.number, 10) < 2000 || parseInt(c.number, 10) > 3000);
    console.log(`Level Failures: ${levelFailures.length}`);
    if (levelFailures.length > 0) {
        console.log("Sample failure:", levelFailures[0].number);
    }
}

runApiTests();
