# Fix Firebase Admin Initialization Error During Build

**Date**: 2026-03-04
**Issue**: Build Failure

## Changes Made
- Identified that `next build` was failing because `lib/firebase-admin.ts` was attempting to initialize the Firebase Admin SDK using `process.env.FIREBASE_PRIVATE_KEY` and `process.env.FIREBASE_CLIENT_EMAIL`.
- The actual environment variables in `.env.local` were named `FIREBASE_ADMIN_PRIVATE_KEY` and `FIREBASE_ADMIN_CLIENT_EMAIL`.
- Corrected the variable names in `lib/firebase-admin.ts` to match `.env.local`.
- Successfully ran `npm run build` after the fix.
