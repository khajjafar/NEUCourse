import { adminDb } from '../lib/firebase-admin';

async function verify() {
    const cs = await adminDb.collection("courses").doc("CS2500").get();
    console.log("CS2500:", cs.exists);
    const acc = await adminDb.collection("courses").doc("ACC2100").get();
    console.log("ACC2100:", acc.exists);
    const accSpace = await adminDb.collection("courses").doc("ACC 2100").get();
    console.log("ACC 2100:", accSpace.exists);
}

verify();
