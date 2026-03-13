# NEUCourse — Complete GitHub Issues
### All Sprints · 24 Total Issues
### Changelog: Issues modified from v1 are marked with `[MODIFIED]`. No new issues were added.

---

## Sprint 1 — Core Foundation & Infrastructure
**Due:** March 2, 2026
**Goal:** Auth, course search, degree plan builder, and all dev infrastructure in place.

---

### Issue #1 · User Registration & Login
> No changes from v1.

**Title:**
```
Implement user registration and login with Firebase Auth
```

**Labels:** `feature`, `priority: high`
**Milestone:** `Sprint 1`
**Board Column:** `Sprint Todo`

**Body:**
```markdown
## User Story
As a student, I want to create an account and log in with email and password so that my data is saved and private to me.

## Acceptance Criteria
- [ ] User can register with a valid email and password
- [ ] User receives an error if the email is already in use
- [ ] User receives an error if the password is under 8 characters
- [ ] User can log in with correct credentials
- [ ] User sees a generic error message on incorrect credentials (no detail about which field is wrong)
- [ ] User session persists across page refreshes
- [ ] User can log out from any page

## Notes
- Use Firebase Authentication (email/password provider)
- Store auth state in React context
- On login, retrieve the Firebase JWT via getIdToken() and store it for use in API calls
- Redirect unauthenticated users away from protected routes
```

---

### Issue #2 · Course Search & Browsing
> No changes from v1.

**Title:**
```
Build course search and browsing page
```

**Labels:** `feature`, `priority: high`
**Milestone:** `Sprint 1`
**Board Column:** `Sprint Todo`

**Body:**
```markdown
## User Story
As a student, I want to search for NEU courses by name, subject, or course number so that I can find the right courses for my degree.

## Acceptance Criteria
- [ ] User can type into a search bar and see matching courses (real time or on submit)
- [ ] Results display: course name, course number, subject, credit hours, and description
- [ ] Results display prerequisite and co-requisite course numbers if they exist
- [ ] User can filter results by subject/department
- [ ] If no results are found, a clear empty state message is shown
- [ ] Course data is sourced from searchneu.com and stored in Firestore
- [ ] Search works without being logged in (public access)

## Notes
- All course data fetching goes through GET /api/v1/courses — no direct Firestore calls from the client
- Scrape course data from searchneu.com and store as a `courses` collection in Firestore
- Do not live-scrape on every search — query via the API instead
- Search should query course name and course number fields at minimum
```

---

### Issue #3 · Course Detail View
> No changes from v1.

**Title:**
```
Build course detail view with prereq and co-req display
```

**Labels:** `feature`, `priority: high`
**Milestone:** `Sprint 1`
**Board Column:** `Sprint Todo`

**Body:**
```markdown
## User Story
As a student, I want to click on a course and see its full details so that I can decide whether to add it to my plan.

## Acceptance Criteria
- [ ] Clicking a course opens a detail view (modal or separate page)
- [ ] Detail view shows: full description, credits, prereqs, co-reqs, and offered semesters (if available)
- [ ] Prereqs and co-reqs are displayed as clickable course links
- [ ] User can close/dismiss the detail view and return to search results

## Notes
- Depends on Issue #2 (course search) being complete first
- Fetch course detail via GET /api/v1/courses/:courseId
- Clickable prereq/co-req links should trigger the same detail view for that course
```

---

### Issue #4 · Degree Plan Builder
> No changes from v1.

**Title:**
```
Implement degree plan creation and semester-based course assignment
```

**Labels:** `feature`, `priority: high`
**Milestone:** `Sprint 1`
**Board Column:** `Sprint Todo`

**Body:**
```markdown
## User Story
As a student, I want to create a named degree plan and assign courses to semesters so that I can map out my path to graduation.

## Acceptance Criteria
- [ ] Logged-in user can create a new degree plan with a custom name
- [ ] Plan is organized by semester (e.g., Fall 2026, Spring 2027)
- [ ] User can add courses to any semester from the course search
- [ ] User can remove a course from a semester
- [ ] Plan is saved automatically or on explicit save action
- [ ] User can create multiple plans under one account

## Notes
- All plan data is read/written via the /api/v1/plans endpoints — no direct Firestore calls from the client
- Pass Firebase JWT as Authorization: Bearer <token> header on all authenticated requests
- Firestore structure (server-side only): users/{userId}/plans/{planId}/semesters/{semesterId}/courses
- Depends on Issue #1 (auth) being complete
```

---

### Issue #11 · Repository & Project Setup `[MODIFIED]`
> **Changed:** Vite replaced with Next.js 14 (App Router). Folder structure updated to reflect Next.js conventions and the `/app/api/v1` route layout.

**Title:**
```
Set up project repository, folder structure, and base dependencies
```

**Labels:** `chore`, `priority: high`
**Milestone:** `Sprint 1`
**Board Column:** `Sprint Todo`

**Body:**
```markdown
## Description
Initialize the project with the correct folder structure, dependencies, and base configuration so all future work has a consistent foundation.

## Acceptance Criteria
- [ ] Next.js 14 app initialized using the App Router (`npx create-next-app@latest`)
- [ ] TailwindCSS installed and configured
- [ ] Firebase SDK (client) and Firebase Admin SDK (server) installed and initialized with environment variables via `.env.local`
- [ ] `.env.example` committed (no real secrets committed to the repo)
- [ ] ESLint and Prettier configured with a shared config
- [ ] Folder structure established:
  - `/app/api/v1/...` — API route handlers
  - `/app/(pages)/...` — page components
  - `/components` — shared UI components
  - `/hooks` — custom React hooks
  - `/lib/firebase.ts` — client-side Firebase init
  - `/lib/firebase-admin.ts` — server-side Admin SDK init
  - `/lib/api-helpers.ts` — shared auth verification and error response helpers
  - `/scripts` — one-time utility scripts (scraper)
  - `/docs` — documentation files
- [ ] README.md created with project name, description, and setup instructions

## Notes
- This is the first issue to complete — everything else depends on it
- Use `.gitignore` to exclude `node_modules`, `.env.local`, and build artifacts
- Do NOT use Vite — this project uses Next.js with the App Router
```

---

### Issue #12 · CI/CD Pipeline — Base Setup
> No changes from v1.

**Title:**
```
Set up GitHub Actions CI pipeline with linting and build checks
```

**Labels:** `chore`, `priority: high`
**Milestone:** `Sprint 1`
**Board Column:** `Sprint Todo`

**Body:**
```markdown
## Description
Set up a base GitHub Actions pipeline that runs on every push and pull request. This ensures code quality is enforced from day one.

## Acceptance Criteria
- [ ] GitHub Actions workflow file created at `.github/workflows/ci.yml`
- [ ] Pipeline runs on every push to `main` and on every pull request
- [ ] Pipeline steps include: install dependencies, lint (ESLint), and build
- [ ] Pipeline fails the PR if lint or build fails
- [ ] Branch protection rule set on `main` requiring the CI check to pass before merging

## Notes
- Use `actions/checkout` and `actions/setup-node` (Node 18+)
- Keep this workflow focused on speed — full test coverage reporting added in Sprint 2
```

---

### Issue #13 · Testing Infrastructure Setup
> No changes from v1.

**Title:**
```
Set up unit and integration testing framework (Vitest + React Testing Library)
```

**Labels:** `chore`, `priority: high`
**Milestone:** `Sprint 1`
**Board Column:** `Sprint Todo`

**Body:**
```markdown
## Description
Configure the testing framework so all Sprint 1 and Sprint 2 features can be tested from the start.

## Acceptance Criteria
- [ ] Vitest installed and configured as the test runner
- [ ] React Testing Library installed for component testing
- [ ] A sample passing unit test exists to confirm setup works
- [ ] Coverage reporting configured (`vitest --coverage`)
- [ ] `npm run test` and `npm run coverage` scripts added to `package.json`
- [ ] Coverage threshold set to 80% in vitest config (warns if below)

## Notes
- Vitest is compatible with Next.js projects and is preferred over Jest for this stack
- Do not aim for 80% coverage in Sprint 1 — just get the infrastructure ready so coverage grows naturally
```

---

### Issue #14 · Firebase Backend & Firestore Data Model
> No changes from v1.

**Title:**
```
Define and document Firestore data model and Firebase project configuration
```

**Labels:** `chore`, `priority: high`
**Milestone:** `Sprint 1`
**Board Column:** `Sprint Todo`

**Body:**
```markdown
## Description
Set up the Firebase project, configure Firestore, and define the data model that all features will build on.

## Acceptance Criteria
- [ ] Firebase project created and connected to the repo via environment variables
- [ ] Firebase Authentication enabled (email/password provider)
- [ ] Firestore database created with security rules requiring auth for user data
- [ ] Firestore security rules written and tested: users can only read/write their own documents
- [ ] Data model documented in `/docs/firestore-schema.md` covering:
  - `users/{userId}` — profile metadata
  - `users/{userId}/plans/{planId}` — degree plan metadata
  - `users/{userId}/plans/{planId}/semesters/{semesterId}` — semester with course list
  - `users/{userId}/events/{eventId}` — calendar events
  - `courses/{courseId}` — scraped NEU course data
- [ ] Firebase Admin SDK service account key stored as a GitHub Actions secret and in `.env.local`

## Notes
- Security rules are graded — do not leave Firestore open to the public
- The Admin SDK (server-side) bypasses Firestore security rules — only use it inside Next.js API routes, never in client components
- Schema doc will be referenced in the API documentation deliverable
```

---

### Issue #15 · Course Data Scraper
> No changes from v1.

**Title:**
```
Build course data scraper for searchneu.com and populate Firestore courses collection
```

**Labels:** `chore`, `priority: high`
**Milestone:** `Sprint 1`
**Board Column:** `Sprint Todo`

**Body:**
```markdown
## Description
Write a one-time script to scrape NEU course data from searchneu.com and store it in the Firestore `courses` collection.

## Acceptance Criteria
- [ ] Script scrapes course name, course number, subject, credits, description, prerequisites, and co-requisites
- [ ] Scraped data is written to Firestore `courses` collection
- [ ] Script is idempotent — running it twice does not create duplicate documents
- [ ] At least 100 courses are successfully seeded in Firestore
- [ ] Script is documented in `/docs/scraper.md` with instructions to run it

## Notes
- Run as a local Node.js script at `/scripts/scrape-courses.js`, not a cloud function
- Use the course number as the Firestore document ID to ensure idempotency
- Depends on Issue #14 (Firestore setup)
```

---

## Sprint 2 — Scheduling, Validation, API & Deliverables
**Due:** March 9, 2026
**Goal:** Calendar, prereq validation, public API + Swagger UI, 80% test coverage, full CI/CD, and all documentation deliverables.

---

### Issue #5 · Prereq & Co-req Validation
> No changes from v1.

**Title:**
```
Add prerequisite and co-requisite validation warnings to degree planner
```

**Labels:** `feature`, `priority: high`
**Milestone:** `Sprint 2`

**Body:**
```markdown
## User Story
As a student, I want the planner to warn me if I add a course before completing its prerequisites so that I don't create an invalid academic plan.

## Acceptance Criteria
- [ ] When a user adds a course to a semester, the system checks if prereqs appear in earlier semesters
- [ ] If a prereq is missing, a warning is shown (not a hard block — student can override)
- [ ] Co-requisites are flagged if they are not in the same semester
- [ ] Warning messages clearly name the missing prereq or co-req course

## Notes
- Depends on Issue #4 (degree plan builder)
- Prereq data comes from the `courses` Firestore collection seeded in Issue #15
- Soft warning only — students can choose to ignore it
```

---

### Issue #6 · Weekly Calendar View
> No changes from v1.

**Title:**
```
Build weekly calendar view with event creation and editing
```

**Labels:** `feature`, `priority: high`
**Milestone:** `Sprint 2`

**Body:**
```markdown
## User Story
As a student, I want a weekly calendar where I can add my classes and other events so that I can see my full week at a glance.

## Acceptance Criteria
- [ ] User can view a 7-day weekly calendar with time slots (7am–10pm minimum)
- [ ] User can add an event with: title, day(s), start time, end time, optional location, optional color tag
- [ ] Events are displayed as blocks in the correct time slot
- [ ] User can edit or delete an existing event
- [ ] Events are saved via API call and persist across sessions
- [ ] Overlapping events are visually indicated

## Notes
- All event data is read/written via the /api/v1/events endpoints — no direct Firestore calls from the client
- Consider using `react-big-calendar` (free) or a lightweight custom grid
- Depends on Issue #1 (auth) — events are user-specific
```

---

### Issue #7 · Add Courses to Calendar
> No changes from v1.

**Title:**
```
Allow courses from degree plan to be added directly to the weekly calendar
```

**Labels:** `feature`, `priority: medium`
**Milestone:** `Sprint 2`

**Body:**
```markdown
## User Story
As a student, I want to add a course from my degree plan directly to my weekly calendar so that I don't have to manually re-enter class times.

## Acceptance Criteria
- [ ] User can select a course from their degree plan and add it to the calendar
- [ ] Course meeting times (if available in scraped data) pre-populate the event fields
- [ ] User can edit pre-populated fields before saving
- [ ] Course event appears on the calendar in the correct time slot

## Notes
- Depends on Issue #4 (degree plan) and Issue #6 (calendar)
- Meeting time availability depends on what searchneu.com exposes — pre-population is best-effort
```

---

### Issue #8 · Export Calendar
> No changes from v1.

**Title:**
```
Implement .ics calendar export
```

**Labels:** `feature`, `priority: medium`
**Milestone:** `Sprint 2`

**Body:**
```markdown
## User Story
As a student, I want to export my weekly calendar so that I can import it into Google Calendar or another tool.

## Acceptance Criteria
- [ ] User can export their calendar as an .ics file
- [ ] Exported file includes all saved events with correct times and titles
- [ ] Export is triggered by a visible button in the calendar view
- [ ] Exported .ics is valid and importable into Google Calendar (manually verified in testing)

## Notes
- Use a client-side library such as `ical-generator` or `ics` (both free/open source)
- No server-side logic needed — generate and download entirely in the browser
- Depends on Issue #6 (calendar view)
```

---

### Issue #9 · Manage Multiple Degree Plans
> No changes from v1.

**Title:**
```
Allow users to view, rename, and delete saved degree plans
```

**Labels:** `feature`, `priority: medium`
**Milestone:** `Sprint 2`

**Body:**
```markdown
## User Story
As a student, I want to view, rename, and delete my saved degree plans so that I can keep my planning organized.

## Acceptance Criteria
- [ ] User can see a list of all their saved plans on a dashboard or plans page
- [ ] User can rename any plan
- [ ] User can delete a plan with a confirmation prompt
- [ ] Deleting a plan does not affect other plans or calendar data

## Notes
- Depends on Issue #4 (degree plan builder)
- Confirmation prompt before delete to prevent accidental data loss
```

---

### Issue #10 · Persistent Dashboard
> No changes from v1.

**Title:**
```
Build post-login dashboard showing plans and upcoming calendar events
```

**Labels:** `feature`, `priority: medium`
**Milestone:** `Sprint 2`

**Body:**
```markdown
## User Story
As a student, I want a home screen after logging in that shows my plans and calendar at a glance so that I can quickly get back to where I left off.

## Acceptance Criteria
- [ ] After login, user lands on a dashboard
- [ ] Dashboard shows a list of saved degree plans with last-modified date
- [ ] Dashboard shows upcoming calendar events (next 7 days)
- [ ] User can navigate to any plan or to the full calendar from the dashboard

## Notes
- Landing page after login — keep it simple and fast to load
- Depends on Issue #1 (auth), Issue #4 (plans), and Issue #6 (calendar)
- Last-modified date stored as a Firestore timestamp on each plan document
```

---

### Issue #16 · Public REST API — Next.js Routes + Swagger UI `[MODIFIED]`
> **Changed:** Removed Express.js on Render entirely. API is now implemented as Next.js API routes inside the same repo. Swagger UI added via `next-swagger-doc` + `swagger-ui-react`. Calendar events endpoints added.

**Title:**
```
Build and document public REST API using Next.js API routes with Swagger UI
```

**Labels:** `feature`, `chore`, `priority: high`
**Milestone:** `Sprint 2`

**Body:**
```markdown
## Description
Implement a public REST API using Next.js API routes. All frontend data fetching must go through these routes — no direct Firestore calls from client components. Satisfies the Project 2 requirement for a documented public API.

## Endpoints to Implement

### Degree Plans
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/plans` | Get all plans for the authenticated user |
| `GET` | `/api/v1/plans/:planId` | Get a single plan by ID |
| `POST` | `/api/v1/plans` | Create a new degree plan |
| `PUT` | `/api/v1/plans/:planId` | Update a plan |
| `DELETE` | `/api/v1/plans/:planId` | Delete a plan |
| `GET` | `/api/v1/plans/:planId/semesters` | Get all semesters in a plan |
| `POST` | `/api/v1/plans/:planId/semesters/:semesterId/courses` | Add a course to a semester |
| `DELETE` | `/api/v1/plans/:planId/semesters/:semesterId/courses/:courseId` | Remove a course from a semester |

### Calendar Events
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/events` | Get all calendar events for the user |
| `POST` | `/api/v1/events` | Create a calendar event |
| `PUT` | `/api/v1/events/:eventId` | Update a calendar event |
| `DELETE` | `/api/v1/events/:eventId` | Delete a calendar event |

### Courses (public)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/courses` | Search/list courses |
| `GET` | `/api/v1/courses/:courseId` | Get a single course detail |

## Acceptance Criteria
- [ ] All endpoints implemented and return correct HTTP status codes
- [ ] All authenticated endpoints require a valid Firebase JWT (`Authorization: Bearer <token>` header), verified via Firebase Admin SDK
- [ ] Course endpoints are publicly accessible (no auth required)
- [ ] API returns JSON with a consistent error structure: `{ error: { code, message } }`
- [ ] OpenAPI 3.0 spec written in `/docs/openapi.yaml` covering all endpoints
- [ ] Swagger UI live at `/api-docs` using `next-swagger-doc` + `swagger-ui-react`
- [ ] API documentation written in `/docs/api.md` with request/response examples per endpoint

## Notes
- All routes live under `/app/api/v1/` using Next.js App Router route handlers
- Use Firebase Admin SDK in route handlers to verify JWTs and read/write Firestore
- Never import firebase-admin in client components — server only
- No separate Express server or Render deployment needed
```

---

### Issue #17 · E2E Testing with Playwright
> No changes from v1.

**Title:**
```
Write E2E tests for critical user flows using Playwright
```

**Labels:** `chore`, `priority: high`
**Milestone:** `Sprint 2`

**Body:**
```markdown
## Description
Implement end-to-end tests covering the most critical user flows using Playwright.

## Acceptance Criteria
- [ ] Playwright installed and configured
- [ ] E2E tests cover:
  - [ ] User can register and is redirected to dashboard
  - [ ] User can log in and log out
  - [ ] User can search for a course and view its detail
  - [ ] User can create a degree plan, add a course to a semester, and save it
  - [ ] User can add a calendar event and see it appear on the calendar
- [ ] Tests run headlessly in CI
- [ ] `npm run test:e2e` script added to `package.json`

## Notes
- Use a dedicated Firebase test project or emulator suite to avoid polluting production data
- Depends on Sprint 1 features being complete
```

---

### Issue #18 · Unit & Integration Tests — 80% Coverage
> No changes from v1.

**Title:**
```
Write unit and integration tests to reach 80%+ code coverage
```

**Labels:** `chore`, `priority: high`
**Milestone:** `Sprint 2`

**Body:**
```markdown
## Description
Write unit and integration tests for all major components and service functions to hit the required 80%+ coverage threshold.

## Acceptance Criteria
- [ ] Unit tests written for all utility functions in `/lib`
- [ ] Unit tests written for all custom hooks in `/hooks`
- [ ] Integration tests written for: login form, registration form, course search, degree plan builder, calendar event creation
- [ ] Tests written for API route handlers (mocking Firebase Admin SDK calls)
- [ ] `npm run coverage` reports 80%+ across statements, branches, functions, and lines
- [ ] All tests pass in CI without manual intervention

## Notes
- Mock Firebase calls in unit tests — do not hit real Firestore
- Use `vi.mock()` (Vitest) to mock Firebase and Firebase Admin modules
- Focus on logic-heavy files first (API route handlers, hooks) to get coverage up efficiently
```

---

### Issue #19 · CI/CD Pipeline — Full Coverage & Deploy `[MODIFIED]`
> **Changed:** Firebase Hosting replaced with Vercel. Deploy previews now use Vercel preview deployments on PRs instead of Firebase Hosting preview channels.

**Title:**
```
Expand CI/CD pipeline with coverage reporting, security scanning, and Vercel deployment
```

**Labels:** `chore`, `priority: high`
**Milestone:** `Sprint 2`

**Body:**
```markdown
## Description
Expand the base CI pipeline (Issue #12) into a full multi-stage pipeline with coverage reporting, security scanning, and automated deployment to Vercel.

## Acceptance Criteria
- [ ] Pipeline has distinct stages: `lint` → `test` → `coverage` → `security` → `deploy`
- [ ] Coverage report generated and uploaded as a GitHub Actions artifact on every run
- [ ] Pipeline fails if coverage drops below 80%
- [ ] Security scanning added via `npm audit`
- [ ] Vercel preview deployment generated automatically for every pull request
- [ ] Production deployment to Vercel triggered automatically on merge to `main`
- [ ] Pipeline status badge added to README

## Notes
- Connect the GitHub repo to Vercel — preview deployments are automatic and free
- Set Firebase environment variables as Vercel environment variables (not committed to the repo)
- `npm audit` is zero-cost and built into npm — good baseline for security scanning
- Depends on Issue #12 (base CI) and Issue #18 (tests)
```

---

### Issue #20 · Sprint Documentation & Retrospectives
> No changes from v1.

**Title:**
```
Document sprint planning and write sprint retrospectives for Sprint 1 and Sprint 2
```

**Labels:** `docs`, `priority: medium`
**Milestone:** `Sprint 2`

**Body:**
```markdown
## Description
Produce sprint planning and retrospective documentation required by the Agile Process rubric (20 pts).

## Acceptance Criteria
- [ ] Sprint 1 planning document written before Sprint 1 begins
- [ ] Sprint 1 retrospective written at end of Sprint 1 (around March 2)
- [ ] Sprint 2 planning document written before Sprint 2 begins
- [ ] Sprint 2 retrospective written at project completion (around March 9)
- [ ] All four documents stored in `/docs/sprints/`
- [ ] Documents referenced in the README

## File Structure
/docs/sprints/
  sprint1-planning.md
  sprint1-retro.md
  sprint2-planning.md
  sprint2-retro.md

## Notes
- Sprint 1 planning should be written today — before any code is written
- Keep each doc concise: goals, assignments, and honest reflection
```

---

### Issue #21 · AI Modality Documentation
> No changes from v1.

**Title:**
```
Document use of all 3 AI modalities throughout the project
```

**Labels:** `docs`, `priority: medium`
**Milestone:** `Sprint 2`

**Body:**
```markdown
## Description
Document demonstrated use of all 3 AI modalities as required by the AI Mastery rubric (30 pts).

## The 3 Modalities
1. **Chat / ideation** — Claude Web (PRD, Mom Test simulations, planning, rules file)
2. **IDE-integrated AI** — Antigravity (in-editor code generation and debugging)
3. **Agentic / multi-step** — AI-assisted test generation, code review, or automated refactoring

## Acceptance Criteria
- [ ] `/docs/ai-usage.md` created and maintained throughout the project
- [ ] For each modality: tool used, task performed, and why that modality was the right choice
- [ ] At least 3 concrete examples per modality
- [ ] Document referenced in the technical blog post and final submission

## Example Entries
- **Chat:** "Used Claude Web to generate the PRD, simulate Mom Test interviews, revise the tech stack, and draft the Firestore schema"
- **IDE AI:** "Used Antigravity to scaffold Next.js API route handlers and generate Firebase Admin SDK auth middleware"
- **Agentic:** "Used AI to generate the full Playwright E2E test suite from acceptance criteria"

## Notes
- Start this doc in Sprint 1 and update continuously — do not leave it to the last day
```

---

### Issue #22 · README & API Documentation
> No changes from v1.

**Title:**
```
Write comprehensive README and API documentation
```

**Labels:** `docs`, `priority: medium`
**Milestone:** `Sprint 2`

**Body:**
```markdown
## Description
Write the final README and complete API documentation required by the Documentation rubric (15 pts).

## Acceptance Criteria

### README (`/README.md`)
- [ ] Project name, description, and screenshots or demo GIF
- [ ] Tech stack listed with versions
- [ ] Local setup instructions (clone, install, env vars, run)
- [ ] Link to deployed production URL (Vercel)
- [ ] Link to demo video
- [ ] Link to technical blog post
- [ ] CI/CD status badge
- [ ] Link to live Swagger UI at `/api-docs`

### API Documentation (`/docs/api.md`)
- [ ] Overview of authentication (how to obtain a Firebase JWT and pass it as a Bearer token)
- [ ] All endpoints from Issue #16 documented with: method, URL, headers, request body, example response, and status codes

## Notes
- README is the first thing graders see — make it polished
- Depends on Issue #16 (API) being complete
- Swagger UI at `/api-docs` satisfies the interactive docs requirement — link to it from the README
```

---

### Issue #23 · Technical Blog Post
> No changes from v1.

**Title:**
```
Write 1500-word technical blog post about NEUCourse
```

**Labels:** `docs`, `priority: medium`
**Milestone:** `Sprint 2`

**Body:**
```markdown
## Description
Write the 1500-word technical blog post required as a project deliverable.

## Acceptance Criteria
- [ ] Post is at least 1500 words
- [ ] Covers: problem statement, technical decisions, AI modality usage, challenges, and lessons learned
- [ ] Published publicly on Dev.to, Medium, or Hashnode (all free)
- [ ] Link added to README
- [ ] References the Mom Test customer discovery simulations as product rationale

## Suggested Outline
1. The Problem — Why NEUCourse exists (draw from Mom Test interviews)
2. Tech Stack Decisions — Why Next.js + Firebase + Vercel
3. Architecture Overview — Firestore schema, auth flow, API design, Swagger UI
4. How We Used AI — All 3 modalities with specific examples
5. Biggest Challenges — What broke, what surprised us
6. Lessons Learned — What we'd do differently

## Notes
- Write near end of Sprint 2 when the full project is built
- Dev.to is recommended — free, developer audience, markdown support
```

---

### Issue #24 · Demo Video
> No changes from v1.

**Title:**
```
Record 10-minute project demo video
```

**Labels:** `docs`, `priority: medium`
**Milestone:** `Sprint 2`

**Body:**
```markdown
## Description
Record and publish the 10-minute demo video required as a project deliverable.

## Acceptance Criteria
- [ ] Video is 8–12 minutes (target 10)
- [ ] Demonstrates all major features: auth, course search, degree planner, calendar, export
- [ ] Briefly covers the tech stack, architecture, and CI/CD pipeline
- [ ] Mentions AI modality usage with at least one example shown on screen
- [ ] Uploaded to YouTube (unlisted is fine) or Loom
- [ ] Link added to README

## Suggested Structure (10 min)
- 0:00–1:00 — Problem intro and app overview
- 1:00–3:00 — Auth flow + dashboard walkthrough
- 3:00–5:00 — Course search and degree planner demo
- 5:00–7:00 — Calendar and export demo
- 7:00–9:00 — Code walkthrough: architecture, CI/CD, test coverage
- 9:00–10:00 — AI modality usage examples + Swagger UI demo

## Notes
- Record last — after everything else is built and polished
- Loom free tier is sufficient
- Good audio matters more than good video
```

---

## Changelog Summary

| Issue | Status | What Changed |
|---|---|---|
| #1 | No change | — |
| #2 | No change | — |
| #3 | No change | — |
| #4 | No change | — |
| #5 | No change | — |
| #6 | No change | — |
| #7 | No change | — |
| #8 | No change | — |
| #9 | No change | — |
| #10 | No change | — |
| **#11** | **Modified** | Vite → Next.js 14 App Router; folder structure updated to reflect `/app/api/v1/` layout and `/lib/firebase-admin.ts` |
| #12 | No change | — |
| #13 | No change | — |
| #14 | No change | — |
| #15 | No change | — |
| **#16** | **Modified** | Express on Render → Next.js API routes in same repo; Swagger UI added; calendar events endpoints added; public course endpoints added |
| #17 | No change | — |
| #18 | No change | — |
| **#19** | **Modified** | Firebase Hosting → Vercel; PR deploy previews now use Vercel preview deployments |
| #20 | No change | — |
| #21 | No change | — |
| #22 | No change | — |
| #23 | No change | — |
| #24 | No change | — |

---

## Master Issue Table

| # | Title | Sprint | Labels | Priority |
|---|---|---|---|---|
| #1 | User Registration & Login | Sprint 1 | `feature` | High |
| #2 | Course Search & Browsing | Sprint 1 | `feature` | High |
| #3 | Course Detail View | Sprint 1 | `feature` | High |
| #4 | Degree Plan Builder | Sprint 1 | `feature` | High |
| #11 | Repository & Project Setup | Sprint 1 | `chore` | High |
| #12 | CI/CD Pipeline — Base Setup | Sprint 1 | `chore` | High |
| #13 | Testing Infrastructure Setup | Sprint 1 | `chore` | High |
| #14 | Firebase Backend & Firestore Data Model | Sprint 1 | `chore` | High |
| #15 | Course Data Scraper | Sprint 1 | `chore` | High |
| #5 | Prereq & Co-req Validation | Sprint 2 | `feature` | High |
| #6 | Weekly Calendar View | Sprint 2 | `feature` | High |
| #7 | Add Courses to Calendar | Sprint 2 | `feature` | Medium |
| #8 | Export Calendar | Sprint 2 | `feature` | Medium |
| #9 | Manage Multiple Degree Plans | Sprint 2 | `feature` | Medium |
| #10 | Persistent Dashboard | Sprint 2 | `feature` | Medium |
| #16 | Public REST API — Next.js Routes + Swagger UI | Sprint 2 | `feature`, `chore` | High |
| #17 | E2E Testing with Playwright | Sprint 2 | `chore` | High |
| #18 | Unit & Integration Tests — 80% Coverage | Sprint 2 | `chore` | High |
| #19 | CI/CD Pipeline — Full Coverage & Vercel Deploy | Sprint 2 | `chore` | High |
| #20 | Sprint Documentation & Retrospectives | Sprint 2 | `docs` | Medium |
| #21 | AI Modality Documentation | Sprint 2 | `docs` | Medium |
| #22 | README & API Documentation | Sprint 2 | `docs` | Medium |
| #23 | Technical Blog Post | Sprint 2 | `docs` | Medium |
| #24 | Demo Video | Sprint 2 | `docs` | Medium |

---

## Board Assignment Summary

### Sprint Todo — Add these to the board now (Sprint 1)
- [ ] #11 · Repository & Project Setup ← **do this first**
- [ ] #12 · CI/CD Pipeline — Base Setup
- [ ] #13 · Testing Infrastructure Setup
- [ ] #14 · Firebase Backend & Firestore Data Model
- [ ] #15 · Course Data Scraper
- [ ] #1 · User Registration & Login
- [ ] #2 · Course Search & Browsing
- [ ] #3 · Course Detail View
- [ ] #4 · Degree Plan Builder

### Backlog — Leave here until Sprint 2 begins
- [ ] #5 through #10 · Remaining feature issues
- [ ] #16 through #24 · API, testing, CI/CD, and documentation issues
