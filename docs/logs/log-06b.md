# Log 06b: Fix Plan Display Bugs and TypeScript Violations

**ID:** log-06b
**Date:** 2026-03-05
**Author:** Joythish Sprint 1 Team

## Overview
Fixed display bugs related to `semesterCount` on the dashboard and fixed TypeScript `any` type violations in plan hooks. Also addressed UI not updating correctly after adding a course.

## Changes

1. **Bug 1: Dashboard shows "0 Semesters" for all plans**
   - *File modified:* `app/api/v1/plans/route.ts`
   - *Fix:* Updated the GET route handler to iterate through each plan document from `plansSnapshot`, subquery the `semesters` subcollection for each to retrieve the exact count, and return `semesterCount` in the response payload instead of an empty `semesters` array.
   - *File modified:* `app/dashboard/page.tsx`
   - *Fix:* Updated the rendered metric from `{plan.semesters?.length || 0}` to `{plan.semesterCount || 0}`.
   - *File modified:* `hooks/usePlans.ts`
   - *Fix:* Updated the `Plan` interface payload to use `semesterCount?: number` to safely encompass this change on the frontend.

2. **Bug 2: Adding courses requires page refresh**
   - *File modified:* `hooks/usePlanDetails.ts`
   - *Fix:* In `addCourseToSemester`, after a successful POST request to the API, added an `await fetchPlanDetails()` call so the component cleanly synchronizes with data source changes.

3. **Bug 3: React Hook state duplication in Modals**
   - *File modified:* `app/plans/[planId]/page.tsx`, `components/AddSemesterModal.tsx`, `components/QuickAddModal.tsx`
   - *Fix:* `AddSemesterModal` and `QuickAddModal` previously initialized their own instances of `usePlanDetails(planId)`, separating their internal states from the main `PlanDetailsPage`. Addressed this anti-pattern by destructuring `addSemester` and `addCourseToSemester` in the `PlanDetailsPage` parent component and prop-drilling them down to the Modals so `fetchPlanDetails` syncs correctly with the UI upon mutations.

4. **TypeScript Violation fixes (No `any` types)**
   - *File modified:* `hooks/usePlanDetails.ts`, `hooks/usePlans.ts`
   - *Fix:* Replaced all catch blocks defining `catch (err: any)` to strongly typed error handlers: `catch (err: unknown) { setError(err instanceof Error ? err.message : 'Unknown error'); }`
   - *Fix:* Replaced `createdAt?: any` in the `Plan` interface with strongly typed object literal representing Firestore timestamps, `{ seconds: number; nanoseconds: number } | string`.

## Verification
- Unit tests run with `npm run test` (10 files, 40 tests passed successfully).
- Next.js application built normally with `npm run build`.
- Executed `grep -r ": any"` on `hooks/usePlans.ts` and `hooks/usePlanDetails.ts` providing 0 hits.
- Verified semester counts explicitly render accurately on the Plans dashboard.
- Verified dynamic course addition synchronizes and rerenders upon successful additions without needing to manual refresh.
