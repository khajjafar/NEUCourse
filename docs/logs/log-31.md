---
id: 31
date: "2026-03-04T21:45:00Z"
type: feature
scope: kanban
description: "Implement drag and drop, quick add, and semester deletion"
issue: 6
---

# Changes
- Installed `@hello-pangea/dnd` and integrated it into `/plans/[planId]/page.tsx` for reordering semesters and moving courses.
- Extracted inline "Add Semester" column to a discrete `AddSemesterModal` popup.
- Created `QuickAddModal` containing a standalone course search flow that maps CRNs cleanly into the board in fewer steps.
- Set up local states in `usePlanDetails` to securely execute optimistic list reordering mutations against Firestore via `/api/v1/plans/...` routes.
- Adjusted horizontal scrollbar styling globally in `globals.css` ensuring visibility across platforms.
- Added deletion logic and Trash action bounds allowing the removal of entire semesters.
