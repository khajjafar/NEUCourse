# Development Log - Auth Implementation (Issue #1)
**Date:** 2026-03-02
**Author:** AI Assistant
**Reference:** Issue #1, Issue #11

## Changes Made:
- **Next.js Scaffold:** Initialized a new Next.js 14 project using App Router, TypeScript, and TailwindCSS v4. Removed the default `src/` directory to comply with project structure rules.
- **Firebase Configuration:** Created `.env.example`, `lib/firebase.ts` (Client SDK), and `lib/firebase-admin.ts` (Admin SDK) to prepare for authentication and future API routes.
- **Auth Context:** Scaffolded `hooks/useAuth.tsx` to export an `AuthProvider` managing the `user` state and `loading` state using `onAuthStateChanged`. Linked `firebase/auth` functions.
- **Layout Update:** Wrapped `app/layout.tsx` with the `AuthProvider`.
- **Pages Added:**
  - `app/login/page.tsx`: Built the sign-in form. Enforces generic error messaging on sign-in failures per requirements.
  - `app/register/page.tsx`: Built the sign-up form. Validates passwords (>= 8 chars) and handles "email already in use" gracefully.
  - `app/dashboard/page.tsx`: A stubbed protected route that users land on post-login.
  - `components/AuthGuard.tsx`: A reusable Higher-Order Component wrap ensuring unauthenticated users are redirected from protected routes.
- **Testing (`vitest`):** Configured Vitest and React Testing Library (`vitest.config.ts`, `setupTests.ts`). Wrote unit and integration tests across Auth hooks and forms at ~96% code coverage.
  - Fix: Resolved Node ESM/CJS interop bugs by downgrading JSDOM from `v28` directly to `v22.1.0`.
  - Fix: Implemented `htmlFor` matching `id` tags inside forms to permit React Testing Library standard querying.
