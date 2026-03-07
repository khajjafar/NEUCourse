# Log 35

**Date:** 2026-03-06
**Author:** keeyon
**Issue:** #10

## Description
Implemented the post-login dashboard showing plans and upcoming calendar events.

## Changes
- `app/dashboard/page.tsx`: Updated the dashboard UI to format the relative "Last modified" times for degree plans and filter the upcoming events strictly to the next 7 days.
- `hooks/usePlans.ts`: Expanded the `Plan` interface to include the `updatedAt` field.
- `app/api/v1/plans/[planId]/semesters/route.ts` & `app/api/v1/plans/[planId]/semesters/[semId]/route.ts`: Updated the POST, DELETE, and PATCH methods on semesters to automatically append `updatedAt: FieldValue.serverTimestamp()` on the parent plan document to keep the dashboard timestamp accurate.
- `app/api/v1/plans/[planId]/semesters/[semId]/courses/route.ts` & `app/api/v1/plans/[planId]/semesters/[semId]/courses/[courseId]/route.ts`: Updated the POST and DELETE methods on courses to do the same cascading timestamp update.
- `app/dashboard/dashboard.test.tsx`: Wrote comprehensive unit and integration tests confirming fallback logic to `createdAt` if `updatedAt` is missing, relative date formatting, and 7-day future event filtering. Mocked Firebase successfully. Tests pass with > 85% line coverage.

Refs #10
