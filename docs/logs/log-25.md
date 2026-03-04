# Log 25
## Record of Changes: Issue 3 Course Details Adjustments

### Date
2026-03-04

### ID
log-25.md

### Description
Implemented the user's requested formatting adjustments for the Course Details view (Issue #3) to ensure readable meeting times and functional prerequisite links. This work was done on the `feature/3-course-details-adjustments` branch off `keeyon`.

### Modifications
- **Frontend Adjustments (`components/CourseDetailClient.tsx`)**:
  - Implemented a `formatMeetingTime` helper function employing a Regex (`/^([A-Za-z]+)(\d)/`) string replacement to safely detach and inject a space natively into the days-time sequence string (e.g. `MTWTF6:00pm` -> `MTWTF 6:00pm`). This ensures readability and prepares the string structure for programmatic calendar parsing.
  - Implemented a `formatCourseId` helper function utilizing an equivalent Regex replacement strategy to safely separate the alphabetical subject letters from numerical codes (e.g. `ACC2100` -> `ACC 2100`) directly on the Frontend render.
  - Replaced the compact string identifiers with the mapped `formatCourseId` variables within the Prerequisite and Co-requisite mapped structural loops. This successfully allows navigation routing to `[courseId]` endpoints as it will correctly URL encode as `ACC%202100` instead of a flattened block.
- **Backend Investigation**:
  - Investigated the Database routing behaviors via node scripts demonstrating why exact matching was forcing 404 blockages. Discovered and finalized frontend-side encoding to be optimal rather than a 2800 doc migration.

### Next Steps 
- Merge `feature/3-course-details-adjustments` into `keeyon`.
- Update issue board.
