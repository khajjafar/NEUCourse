async function checkApi() {
    const idsToTest = ['CS2500', 'CS 2500', 'CS%202500', 'ACC2100', 'ACC 2100', 'ACC%202100'];
    console.log("Testing API route /api/v1/courses/[id]...");
    for (const id of idsToTest) {
        const res = await fetch(`http://localhost:3000/api/v1/courses/${id}`);
        const text = await res.text();
        console.log(`Path: /courses/${id} -> Status: ${res.status}`);
        if (res.status === 200) {
            console.log(`  Name: ${JSON.parse(text).data.name}`);
        } else {
            console.log(`  Error: ${text}`);
        }
    }
}
checkApi();
