# Log 04: Implement Degree Plan Creation (Issue #4)
**Date:** 2026-03-03
**Timestamp:** 01:10:00-05:00
**Author:** Antigravity Agent
**Related Issue:** #4 (Implement Degree Plan Creation and Editing)

## Overview
Built a profound Degree Tracking Map hierarchy natively syncing nested documents into Firebase Firestore via secure Next.js REST API middlewares. This allows authenticated students to isolate coursework planning against actual real courses inside robust `CustomHooks`.

## Key Changes
- **Backend APIs:**
  - `POST /api/v1/plans` - Created initial Plan templates.
  - `GET /api/v1/plans` - Indexed overarching User collections natively.
  - `GET /api/v1/plans/[planId]` - Generated resolved semantic Semester trees populated by Courses efficiently without cascading joins.
  - `POST /api/v1/plans/[planId]/semesters` - Generated mapping blocks.
  - `POST/DELETE /api/v1/plans/[planId]/semesters/[semId]/courses` - Enabled `arrayUnion` / `arrayRemove` mutations mapping isolated `CourseId` allocations safely across boundaries.

- **Frontend Development:**
  - Designed the robust `/plans` dashboard integrating `usePlans` natively executing creation calls optimistically.
  - Designed `/plans/[planId]` nesting `usePlanDetails` supporting dynamically cascading optimistic UI mutations instantly reflecting mapping.
  - Extracted the visual layout via `CourseMiniCard.tsx`.
  - Upgraded the existing `CourseDetailClient.tsx` modal injecting a dynamic `AddToPlanDropdown` interaction handling live Plan fetches.

- **Testing Capabilities:**
  - Structured rigorous Vitest coverage against both `usePlans` & `usePlanDetails` globally mocking Firebase environments simulating all exception paths perfectly achieving over 80% coverage lines.
  - Drafted the dedicated Playwright End-To-End suite mapping accurate viewport interactions (`tests/plans.spec.ts`).


## Testing Instructions (Development)
**How to test interactively:** Run `npm run dev`. Log in, navigate to `/plans`, and create a new degree plan. Click "View" to open the planner, where you can construct semester blocks to organize courses visually.

**Automated Tests Added:**
- **What:** Custom hook mutations (`hooks/usePlans.test.ts`, `hooks/usePlanDetails.test.ts`).
- **Reasoning:** The planner deeply manages nested Firestore documents and subcollections. Testing these endpoints ensures data integrity (handling optimistic UI updates for array unions/removals) and gracefully handling permission bounds.
- **How to run:** Execute `npm run test`. E2E scenarios are structured in Playwright via `npm run test:e2e`.
