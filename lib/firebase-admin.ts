import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;
        if (privateKey && privateKey.includes('PRIVATE KEY')) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: privateKey.replace(/\\n/g, '\n'),
                }),
            });
        } else {
            admin.initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project' });
        }
        console.log('Firebase admin initialized.');
    } catch (error) {
        console.error('Firebase admin initialization error:', error);
        if (!admin.apps.length) admin.initializeApp({ projectId: 'demo-project' });
    }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
