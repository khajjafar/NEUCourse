import { adminDb } from '../lib/firebase-admin';

async function checkIds() {
    console.log("Fetching snapshot...");
    const snapshot = await adminDb.collection('courses').limit(5).get();
    snapshot.forEach(doc => {
        console.log("Course ID (document ID):", doc.id);
        console.log("Course name:", doc.data().name);
    });

    // specifically check ACC 2100
    const accDoc = await adminDb.collection('courses').doc('ACC2100').get();
    console.log("ACC2100 exists?", accDoc.exists);
    const accDoc2 = await adminDb.collection('courses').doc('ACC 2100').get();
    console.log("ACC 2100 exists?", accDoc2.exists);
}

checkIds();
