import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const privateKey = process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n');

if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey,
        }),
    });
}
const db = getFirestore();

async function checkDb() {
    console.log("Looking for ACCT 1201...");
    const snapshot = await db.collection('courses').where('subject', '==', 'ACCT').where('number', '==', '1201').get();
    if (!snapshot.empty) {
        snapshot.forEach(doc => {
            console.log(`Course: ${doc.id}`);
            console.log(`Description: ${doc.data().description.substring(0, 150)}...`);
        });
    } else {
        console.log('ACCT 1201 not found');
    }
}

checkDb();
