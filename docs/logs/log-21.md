# Log 21: Index Redirection and Guest Access Link

**Date:** 2026-03-03
**Author:** AI Pair Programmer
**Related Issue:** #1

## Changes Made
1. **Index Page Redirection**:
   - `app/page.tsx` was fully refactored to replace its previous landing content with an immediate redirect to `/login`. This honors the new requirement that sets the login view as the default starting experience for application domains.

2. **Guest Login Provision**:
   - Modified `/app/login/page.tsx` and `/app/register/page.tsx` to include an anchored link directly beneath the respective major-action form buttons.
   - Designed to read "view courses as guest" and point immediately toward `/courses` using `text-sm`, `text-gray-500`, and standardized `hover` transition utility classes. 
   - Resolves issues concerning immediate un-authenticated exploration prior to permanent commitment. 

3. **Testing Pipeline Adjustments**:
   - Upgraded Playwright coverage in `tests/auth.spec.ts` guaranteeing visibility hooks and property attributes for the newly established "view courses as guest".

## Motivation
Simplifies user routing semantics and encourages exploratory retention by accommodating an intuitive guest experience directly coupled to the unified authentication portal flow.
