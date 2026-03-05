# Log 24
**Date:** 2026-03-04
**Issue:** #2
**Description:** Refined the Search App logic to handle Level Ranges and exact Prefix Substrings.
- **app/courses/page.tsx**: Replaced the single floor-based select dropdown with independent "Min Level" and "Max Level" range dropdowns.
- **hooks/useCourseSearch.ts**: Migrated `level` string state to `minLevel` and `maxLevel` states, passing these explicit bounds to the search API.
- **app/api/v1/courses/route.ts**: Updated API backend filtering to parse the numerical level ranges. Changed the text querying to utilize a case-insensitive Regex `\b` Word Boundary check to prevent false-positive substring matches ("Cs" matched "Ethics"). Also, removed `data.description` from `searchableString` as requested by the user, ensuring queries are strictly matched against course IDs and names.
