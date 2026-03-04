# Add prerequisite and co-requisite validation warnings to degree planner

**Date**: 2026-03-04
**Issue**: #5

## Changes Made
- Created `components/PrereqWarning.tsx` to display soft validation warnings for missing prerequisites and co-requisites.
- Added comprehensive test coverage in `components/PrereqWarning.test.tsx` verifying all edge cases.
- Integrated `PrereqWarning` into the `app/plans/[planId]/page.tsx` degree planner view, directly below each scheduled course.
- Ensured warnings are non-blocking and clearly identify the specific missing courses.
- Leveraged existing `useSingleCourse` hook to fetch detailed course data when evaluating prerequisites.
