# Log 29: Kanban Layout & Component Clipping Fixes

**ID:** log-29
**Timestamp:** 2026-03-04T16:05:00Z
**Description:** Addressed UI layout truncation bugs across the Plans and Course Details components.

## Changes Made
- **Kanban Board Padding:** In `app/plans/[planId]/page.tsx`, the horizontal scrolling flex container (`overflow-x-auto`) natively ignored trailing edge padding. Appended an explicit structural right-side spacer (`<div className="w-2 sm:w-4 lg:w-6 shrink-0" aria-hidden="true" />`) stabilizing the gutter offset allowing "Add Semester" components to fully detach from the viewport bounds without cropping.
- **AddToPlan Refactor (Modal Support):** The `component/AddToPlanDropdown.tsx` was deeply nested inside a visually bounded `<table />` parent element imposing `overflow` constraints clipping absolute overlay nodes. Overhauled the component rendering logic entirely to spawn a `fixed z-[100] inset-0` portal-based Modal centered overlay eliminating native context bounds fully while elegantly preserving nested hooks structure (`usePlanDetails`) tracking target configurations cleanly.

Refs: #4
