import * as admin from 'firebase-admin';

/**
 * @fileoverview Server-side Firebase Admin SDK initialization.
 *
 * Exports the Admin Firestore and Admin Auth instances for use exclusively
 * in Next.js API route handlers (/app/api/v1/**). Never import this file
 * from client components, pages, or hooks — it will cause a build error.
 *
 * Initialization falls back to a demo project ID when service account
 * credentials are absent (e.g. in CI or local development without .env.local).
 */

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

/** Admin Firestore instance for server-side database operations. */
export const adminDb = admin.firestore();

/** Admin Auth instance for server-side JWT verification. */
export const adminAuth = admin.auth();
