---
id: log-05
timestamp: 2026-03-05T08:23:00-08:00
description: "feat(plans): show specific missing course IDs in prereq/coreq warnings"
issue: "#5"
---

# Change Log

## Modified
* `components/CourseMiniCard.tsx`
  * Replaced boolean flags for missing prereqs and coreqs with arrays of missing course IDs.
  * Updated warning badges to display the specific missing course IDs (e.g., "Prereq needed: CS1800, CS2500") instead of a generic "Missing Prereq" message.
  * Added `aria-label` for screen readers (e.g., "Missing prerequisites: CS1800, CS2500").
  * Added `title` attribute for native tooltips.
  * Preserved existing orange/blue styling for soft warnings.

## Added
* `components/CourseMiniCard.test.tsx`
  * Added test file for `CourseMiniCard.tsx`.
  * Covered 6 scenarios:
    1. One prereq missing.
    2. Multiple prereqs missing.
    3. All prereqs satisfied.
    4. Missing coreq.
    5. No prereqs/coreqs required.
    6. Verify correct aria-label.
  * Used `vi.mock` for `useSingleCourse` and `@/lib/firebase`.

## Notes
Improves accessibility and UX by helping students know exactly which courses they need to add to their degree plan to fix warnings. Does not block students from progressing (soft warnings only).
