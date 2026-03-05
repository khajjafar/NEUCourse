---
id: log-26
date: 2026-03-04
feature: Global Header & Class Section Support
issue: #4
---

### Added
- Created a `Header` component inside `components/Header.tsx` displaying the global tracking user navigation menu universally accessible throughout the entire dashboard.
- Wrapped `<AuthProvider>` using the layout component implicitly preventing Auth fragmentation.
- Migrated legacy nested strings locally inside `courses` schema natively accepting objects composed of `{courseId, crn}` allowing users to correctly select explicitly identical course instances structurally matching `crn` identifiers.

### Changed
- Refactored `app/api/v1/plans/[planId]/semesters/[semId]/courses/route.ts` parsing CRN object constructs securely via `arrayUnion`.
- Refactored `/api/v1/plans/.../[courseId]/route.ts` DELETE parameter strictly parsing over the combined structural mapping strings checking legacy format backward compatibility successfully.
- Modified `CourseDetailClient.tsx` embedding `AddToPlanDropdown` properly aligning interactive table class sections dynamically allocating unique ID tracking visually.
- Updated `CourseMiniCard` mapping internal `.crn` metrics inside a blue-pill badge alongside existing tags correctly matching UX pipelines organically.

### Removed
- Removed legacy hardcoded `<header>` declarations inside `<CoursesPage />` and `<DashboardPage />` removing duplication natively.

### Security & DX
- Migrated 4 broken Vitest UI expectations reflecting new global `Header` DOM layouts and `minLevel` search API behaviors structurally preventing CI failure flags on merge seamlessly.
