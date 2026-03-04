async function queryACC() {
    const res = await fetch(`http://localhost:3000/api/v1/courses?q=Financial%20Accounting`);
    const json = await res.json();
    console.log("ACC results:");
    if (json.data) {
        json.data.forEach((c: any) => console.log(`ID: "${c.id}", Name: "${c.name}"`));
    }
}
queryACC();
