import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * @fileoverview Client-side Firebase SDK initialization.
 *
 * Exports the Firebase Auth and Firestore instances for use in client
 * components and custom hooks. Uses a singleton pattern to prevent
 * re-initialization on hot reloads in development.
 *
 * IMPORTANT: This file is browser-only. Never import firebase-admin here.
 * All Firestore reads/writes must go through /app/api/v1/ route handlers,
 * not directly from client components.
 */

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if there are no instantiated apps
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

/** Firebase Authentication instance for client-side auth operations. */
export const auth = getAuth(app);

/** Firestore database instance — used only to pass to hooks; all reads/writes go through API routes. */
export const db = getFirestore(app);
