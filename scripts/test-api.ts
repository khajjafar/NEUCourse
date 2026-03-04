async function testApi() {
    console.log("Fetching search API...");
    const res = await fetch('https://searchneu.com/api/search?term=202630');
    if (!res.ok) {
        console.error("API Error", res.status);
        return;
    }
    const data = await res.json();
    console.log(`Found ${data.length} items.`);
    if (data.length > 0) {
        // Find CS 2500
        const cs2500 = data.find((c: any) => c.subject === 'CS' && c.courseNumber === '2500');
        if (cs2500) {
            console.log("CS 2500 details:", JSON.stringify(cs2500, null, 2));
        } else {
            console.log("First item details:", JSON.stringify(data[0], null, 2));
        }
    }
}

testApi();
