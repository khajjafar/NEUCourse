# Log 20: Issue 1 - Login UI and Persistent Auth

**Date:** 2026-03-03
**Author:** AI Pair Programmer
**Related Issue:** #1

## Changes Made
1. **UI Redesign**:
   - Re-styled `/app/login/page.tsx` and `/app/register/page.tsx` to exactly match the wireframe `Screen1_LoginRegister.png` using strictly Tailwind CSS utilities.
   - Brought in consistent styling for typography (bolding `NEU` in red, `Course` in black), inputs with `rounded-xl`, focus rings, shadows, and interactive tabs corresponding to `/login` and `/register`.

2. **Authentication Persistence Fix**:
   - Modified `/hooks/useAuth.tsx` to explicitly invoke `setPersistence(auth, browserLocalPersistence)` before initializing the `onAuthStateChanged` listener. This resolves the persistent log-in issue across multiple windows and tabs by instructing Firebase to use resilient local storage mechanisms natively instead of an implied default.

3. **Testing Strategies**:
   - Expanded unit tests in `hooks/useAuth.test.tsx` to verify `setPersistence` is reliably called during initialization.
   - Overhauled testing queries in `app/login/login.test.tsx` and `app/register/register.test.tsx` to assert existence and operations on proper text nodes and placeholder properties of the redesigned UI.
   - Introduced an End-to-End Test suite at `tests/auth.spec.ts` using Playwright to ensure the basic UI structure of the authentication pages conforms correctly.

## Motivation
This guarantees a robust and correctly themed entrypoint for returning users (auto-login works consistently) and addresses layout parity with the approved wireframes.
