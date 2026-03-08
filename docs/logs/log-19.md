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


## Testing Instructions (Development)
**How to test interactively:** Launch `npm run dev` and click into a Course Detail view (e.g., ACCT 1209). Ensure that the newly built "Class Sections" table renders underneath prerequisites. Verify that rows feature color-coded "Seats" indicators depending on availability.

**Automated Tests Added:**
- **What:** Updates to `CourseDetailClient.test.tsx` mocking undefined vs. populated `sections: []`.
- **Reasoning:** Prevents application crashes if the scraped class lacks explicit schedule boundaries, validating strict default fallbacks.
- **How to run:** Execute `npm run test`.

---

## Issue #19 (Sprint 2): Expand CI/CD Pipeline — Coverage, Audit, Vercel Deploy

### Date
March 7, 2026

### Changes Made

#### 1. Coverage thresholds (`vitest.config.ts`)
Added `thresholds` to the coverage config:
- statements: 80%, functions: 80%, lines: 80%, branches: 60%
- branches set to 60% (current ~64%) instead of 80% to avoid immediately breaking CI

#### 2. CI workflow (`.github/workflows/ci.yml`)
- Moved shared Firebase env vars to a top-level `env:` block
- Replaced `npm run test` with `npm run coverage` — thresholds enforced on every run
- Added **Upload coverage report** step (`actions/upload-artifact@v4`, 14-day retention, runs on failure too)
- Added **Security audit** step: `npm audit --audit-level=high`
- Added **`deploy-preview`** job — runs on PRs, posts Vercel preview URL as PR comment
- Added **`deploy-production`** job — runs on push to `main`, deploys `--prod`

### Required GitHub Secrets (Settings → Secrets → Actions)

| Secret | Source |
|--------|--------|
| `VERCEL_TOKEN` | Vercel dashboard → Account Settings → Tokens |
| `VERCEL_ORG_ID` | `orgId` in `.vercel/project.json` (after `vercel link`) |
| `VERCEL_PROJECT_ID` | `projectId` in `.vercel/project.json` (after `vercel link`) |

### How to verify
1. Open a PR → CI runs coverage+thresholds, audit, build, then posts a preview URL comment
2. Merge to `main` → CI passes, production deploy fires
3. Coverage HTML report appears in GitHub Actions Artifacts
