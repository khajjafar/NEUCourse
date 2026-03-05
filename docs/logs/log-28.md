# Feature Log 28: Typography Truncation Fixes

**Date:** 2026-03-04
**Issue ID:** #5
**Associated Component:** Cross-Platform Styling (Dashboard, Plans, Courses, Calendar)

## Description
Removed CSS bounding classes globally limiting dynamic heading structures bounding font heights inside strict `28px` limits (`leading-7`) combined with hard `overflow:hidden` constraints `sm:truncate`. This resolves characters displaying with cut descenders natively restoring normal baseline alignment organically.
- Adjusted `/app/plans` My Degree Plans title text overflow.
- Adjusted `/app/plans/[planId]` Dynamic Plan names text overflow.
- Adjusted `/app/calendar` My Weekly Schedule title text overflow.
