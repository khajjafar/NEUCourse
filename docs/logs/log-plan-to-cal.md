# Log: Add Plan Courses to Calendar

**ID**: 007-plan-to-cal
**Timestamp**: 2026-03-04T17:15:00-08:00
**Author**: Antigravity

## Description
Implemented Issue #7: Allow courses from the degree plan to be added directly to the weekly calendar.

## Changes Made
- Created `lib/parse-meeting-times.ts` to convert string meeting times (e.g. "MWF 10:30am - 11:35am") to structured data (`days`, `startTime`, `endTime`).
- Created tests `lib/parse-meeting-times.test.ts`.
- Created component `components/AddToCalendarButton.tsx` to handle calendar logic, pre-populating an `EventForm` using parsed meeting times.
- Created tests `components/AddToCalendarButton.test.tsx`.
- Created component `components/PlanCourseItem.tsx` to wrap `CourseMiniCard` UI with an expandable section view that renders `AddToCalendarButton`.
- Updated `app/plans/[planId]/page.tsx` to use `PlanCourseItem` instead of `CourseMiniCard`.

## Status
Tested and verified. All Vitest tests passed. Ready for review.
