## Issue #19: Scrape Detailed Class Sections from SearchNEU

### Date
March 3, 2026

### Changes Made
1. **Scraping Strategy Overhaul:**
   - Modified `scripts/scrape-courses.ts` to implement a batched HTML parser using `cheerio`.
   - The script now queries `https://searchneu.com/catalog/...` for each course to extract the raw HTML table for its sections.
   - It captures: CRN, Meeting Times, Seats, Professor, and Location.
   - Merged these fixes robustly with the search query enhancements from Issue 18, resolving all Git conflicts cleanly.

2. **Database Data Model Update:**
   - Appended a `sections` array field to each Course object uploaded to Firestore containing the scraped arrays.
   - Added `sections: []` support for all mock and test data structures across the application.

3. **User Interface Enhancement:**
   - Updated `components/CourseDetailClient.tsx` to display an elegantly formatted Class Sections table right below course requisites.
   - Integrated semantic Tailwind CSS colors to automatically label sections with Green ("available") or Red ("full" / "0 seats") based on parsed textual conditions.
   - Adjusted `CourseData` in `hooks/useCourseSearch.ts` to inherit the optional `ClassSection[]` type.

### Tests Run
- Full compilation via `npm run build` and UI snapshot verification successful via playwright.
- Execution block passed with 0 bugs across Next.js and Tailwind processing.

### Developer Note
The application provides class meeting times strictly pulled during runtime extraction from the SearchNEU course directory index, giving students access to crucial scheduling elements missing in prior releases.
