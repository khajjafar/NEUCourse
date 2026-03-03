# Log 15 - Fix Scraper Timeout

## 🔧 Modifications
- **Rewrite**: Rewrote `scripts/scrape-courses.ts` to entirely replace the Playwright DOM-scraping logic.
- **API Fetching**: Implemented a direct `fetch()` call against the SearchNEU API endpoint at `/api/search?term=202630`.
- **JSON Parsing**: Added parsing logic to construct `Course` objects directly from the JSON AST provided by the API, correctly extracting subject, number, title, credits, prerequisites, and corequisites.

## 🛠 Impact
- The scraper no longer depends on rendering a browser page headless, thus resolving the Playwright timeout failures (which struggled waiting on the `.group.cursor-pointer` virtualized components).
- Executing the scraper is now instantaneous.
- Populated the Firestore database with over 2785 active courses accurately from SearchNEU, instead of relying on the 7-course fallback dataset.

## ⏱ Timestamp
- **Date**: $(date '+%Y-%m-%d %H:%M:%S')
