# Log 12: GitHub Actions CI Pipeline

- **Date:** 2026-03-07
- **Issue:** #12
- **Developer:** Joythish

## Changes Made

1. **CI Workflow (`.github/workflows/ci.yml`)**: Created GitHub Actions workflow that runs on every push to `main` and every pull request. Pipeline steps: checkout → setup Node 20 → `npm ci` → ESLint → unit tests → production build. Dummy Firebase env vars provided so `firebase-admin` falls back to demo-project mode during CI without hitting real credentials.

2. **ESLint Config (`eslint.config.mjs`)**: Added ignore rules for non-production files (`scripts/**`, `interceptor.js`, `old-scrape-courses.ts`, `test-cheerio.js`). Added rule override to disable `no-explicit-any` in test files, which is standard practice for Vitest mocking patterns.

3. **Pre-existing lint fixes across app code** — required to make the CI pipeline actually pass on first run:
   - Replaced all `catch (err: any)` with `catch (err: unknown)` and proper narrowing in API routes and hooks (`courses/route.ts`, `courses/[courseId]/route.ts`, `semesters/[semId]/route.ts`, `semesters/[semId]/courses/route.ts`, `semesters/[semId]/courses/[courseId]/route.ts`, `profile/route.ts`, `useCourseSearch.ts`, `useSingleCourse.ts`, `AddToPlanDropdown.tsx`, `QuickAddModal.tsx`).
   - Replaced `any[]` cache type in `courses/route.ts` with a proper `CourseData` interface.
   - Replaced `updateData: any` with `Record<string, unknown>` in `profile/route.ts` and `semesters/[semId]/route.ts`.
   - Replaced `courseItem: any` filter param with a typed union in `courses/[courseId]/route.ts`.
   - Fixed `getTimestampDate` function signature in `dashboard/page.tsx` to use a proper union type with correct narrowing order.
   - Fixed unescaped entities (`'` → `&apos;`) in `plans/page.tsx` and `CourseDetailClient.tsx`.
   - Added `eslint-disable` comments for legitimate `setState`-in-effect patterns (SSR hydration in `plans/[planId]/page.tsx`, modal init in `GraduationRequirementsModal.tsx` and `QuickAddModal.tsx`).
   - Fixed `sec.location` → `sec.rooms` and `sec.seatsAvailable`/`sec.seatsCapacity` → `sec.seats` in `QuickAddModal.tsx` to match the `ClassSection` interface.

4. **Bug fix (`CourseDetailClient.tsx`)**: Decoded and formatted the `courseId` URL param before display so course badges show `CS 5150` instead of `CS%205150`.

## Technical Details

- CI uses `npm ci` (not `npm install`) for reproducible installs from `package-lock.json`.
- Node version pinned to 20 with npm cache enabled for faster runs.
- Unit tests (Vitest) are separated from E2E tests (Playwright) — CI runs unit tests only; E2E requires a running server and is out of scope for this issue.
- All 82 unit tests pass. Lint exits with 0 errors (28 warnings only).
- Build compiles successfully with TypeScript strict mode.
