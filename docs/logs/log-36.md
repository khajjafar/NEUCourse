---
id: 36
date: "2026-03-05T13:48:00-05:00"
type: fix
scope: scraper
description: "Fix scraper logic to correctly extract active days from text-neu9 class"
issue: ""
---

# Changes
- Modified `scripts/scrape-courses.ts` meeting extraction to evaluate the DOM structure.
- Instead of relying on raw text, the script now iterates over the target day spans and strictly looks for `text-neu9` (bold text) to map the active days.
- Added mapped conversion to accurately extract Tuesday (`T`) and Thursday (`Th`).
- Added multi-meeting time support within a single cell, grouping days and times correctly per section (preventing mashed text such as `Th 2:50pm — 4:30pmMTWTF11:45am — 1:25pm`).
