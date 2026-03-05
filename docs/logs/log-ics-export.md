# Feature: Calendar ics Export

**ID:** LOG-ICS-EXPORT
**Date:** 2026-03-04
**Author:** Joythish

## Description
Implemented `.ics` calendar export feature for users to export their weekly calendar events. Users can click the "Export Calendar" button in the calendar page, specify their desired semester start date and export duration (weeks), and generate a fully-compatible `.ics` format file with their class schedule repeating weekly. Handled directly via the `ics` NPM package.

## Changes Made
- Installed `ics` package.
- Created `lib/ics-export.ts` with utilities for processing `CalendarEvent` mappings to `ics` event creation, computing week dates based on semester start offset.
- Added comprehensive unit tests in `lib/ics-export.test.ts`.
- Created interactive component `components/ExportCalendarButton.tsx` complete with configuration dialog.
- Added corresponding tests in `components/ExportCalendarButton.test.tsx`.
- Integrated `ExportCalendarButton` into `app/calendar/page.tsx` right next to the "Add Event" button.

## Related Issues
Closes Issue #8
