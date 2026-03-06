# Log 38
**Date:** 2026-03-06
**Author:** Assistant (for khajjafar)
**Issue:** #31 - Create a way for people to add their graduation requirements

## Actions Taken:
- Created GitHub Issue #31 for adding graduation requirements tracking to the Plans tab.
- Added `GraduationRequirement` interface and updated `Plan` to include `requirements` array in `hooks/usePlans.ts`.
- Implemented `updateRequirements` function in `hooks/usePlanDetails.ts` using optimistic updates and a PATCH request.
- Added a `PATCH` method to `/api/v1/plans/[planId]/route.ts` to allow partial updates of `name` and `requirements`.
- Built `GraduationRequirementsModal` in `components/GraduationRequirementsModal.tsx` allowing users to view, add, and remove class types and required counts.
- Integrated `GraduationRequirementsModal` into `app/plans/[planId]/page.tsx` with a new "Graduation Requirements" button.
- Wrote and passed UI component tests in `components/GraduationRequirementsModal.test.tsx` and hook tests in `hooks/usePlanDetails.test.ts`.

## Next Steps:
- Pull request creation and code review.
