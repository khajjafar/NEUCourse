---
id: 37
date: "2026-03-05T14:41:26-05:00"
type: fix
scope: calendar
description: "Fix Plan-to-Calendar parsing for multiple meeting schedules and TBA fallback"
issue: "7,8"
---

# Changes
- Refactored `lib/parse-meeting-times.ts` to split incoming schedule strings by `;` to natively support processing of multiple subgroups per course (e.g. Lecture and Lab times).
- Updated parsing logic to handle comma-separated days (`M,W,Th`) replacing tight regex loops. Built fallback for traditional tight `MTWRF` spacing patterns.
- Transitioned `parseMeetingTime` to return an array `ParsedMeetingTime[]` instead of a singular object.
- Re-architected `components/AddToCalendarButton.tsx` consumption loop to parse and queue multiple sequential subgroups for `addEvent`.
- Added specific soft-landing logic inside `AddToCalendarButton.tsx` to trap `TBA` strings and throw a cleaner non-parsing "No schedule available" message instead of "Cannot parse schedule".
- Converted `parse-meeting-times.test.ts` and `AddScheduleToCalendarModal.test.tsx` logic to align with component regressions.
