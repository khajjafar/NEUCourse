---
id: 33
date: "2026-03-04T21:58:00Z"
type: feature
scope: kanban
description: "Replace semester course count with dynamic total credits pill"
issue: 6
---

# Changes
- Created a singleton memory cache interceptor `fetchCourseCached` inside `hooks/useSingleCourse.ts` managing `inFlightPromises` natively resolving redundant `/api/v1/courses/[id]` fetching collisions safely caching resolved CourseData payload mappings optimally.
- Replaced the simple `{semester.courses.length}` count in Kanban board column headers with an explicit `<SemesterCreditPill />` inner boundary structurally triggering parallel Promise resolutions fetching identical metrics correctly outputting formatted totals (e.g., `9 credits`).
