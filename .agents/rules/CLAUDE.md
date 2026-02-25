---
trigger: always_on
---

# NEUCourse — Claude Code Instructions
# Northeastern University degree planning + scheduling web app
# Repo: https://github.com/khajjafar/NEUCourse.git

---

## PROJECT SUMMARY

NEUCourse is a Next.js 14 (App Router) + TypeScript + TailwindCSS + Firebase web application
for Northeastern University students. It provides:

1. **Course Search** — Browse/search NEU courses scraped from searchneu.com, stored in Firestore
2. **Degree Planner** — Multi-semester degree plans with soft prereq/co-req validation warnings
3. **Weekly Calendar** — Event management (classes, clubs, office hours) with overlap detection
4. **Calendar Export** — .ics export for Google Calendar compatibility

Two engineers. Free-tier stack. Deployed on Vercel.

---

## STACK & VERSIONS

| Concern | Tool |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | TailwindCSS (utilities only) |
| Auth | Firebase Authentication (email/password) |
| Database | Cloud Firestore |
| Server SDK | Firebase Admin SDK (server-side only) |
| API Docs | next-swagger-doc + swagger-ui-react |
| Calendar Export | ics (browser-only) |
| Unit/Integration Tests | Vitest + React Testing Library |
| E2E Tests | Playwright |
| Hosting | Vercel |
| Runtime | Node.js LTS |

---

## CRITICAL ARCHITECTURE RULES

These are non-negotiable. Follow them on every file you create or modify.

### Rule 1 — No Firestore from the client
Client components and pages NEVER call Firestore directly.
All reads and writes go through Next.js API route handlers under `/app/api/v1/`.

### Rule 2 — firebase-admin is server-only
Never import `firebase-admin` in a client component, page, or hook.
It belongs only in `/lib/firebase-admin.ts` and `/app/api/v1/**` route handlers.
Use the `server-only` package to enforce this if needed.

### Rule 3 — Every authenticated route verifies the JWT first
Call `verifyAuth(request)` from `/lib/api-helpers.ts` at the top of every
authenticated route handler before any Firestore operation.

### Rule 4 — JWT stays in React context
The Firebase JWT retrieved via `getIdToken()` is stored in React context only.
Never put it in localStorage, sessionStorage, or cookies.

### Rule 5 — App Router only
All pages and routes use the Next.js App Router (`/app` directory).
Never create files under `/pages`.

### Rule 6 — `'use client'` only when necessary
Default to Server Components. Only add `'use client'` when the component
genuinely requires hooks, event handlers, or browser APIs.

---

## FOLDER STRUCTURE

```
/app
  /api/v1
    /plans/route.ts                                            GET, POST
    /plans/[planId]/route.ts                                   GET, PUT, DELETE
    /plans/[planId]/semesters/route.ts                         GET
    /plans/[planId]/semesters/[semId]/courses/route.ts         POST
    /plans/[planId]/semesters/[semId]/courses/[courseId]/route.ts  DELETE
    /events/route.ts                                           GET, POST
    /events/[eventId]/route.ts                                 PUT, DELETE
    /courses/route.ts                                          GET (public, no auth)
    /courses/[courseId]/route.ts                               GET (public, no auth)
  /dashboard/page.tsx
  /courses/page.tsx
  /plans/[planId]/page.tsx
  /calendar/page.tsx
  /api-docs/page.tsx
  layout.tsx
  page.tsx

/components       — flat file structure
  CourseCard.tsx
  WeeklyCalendar.tsx
  DegreePlanBuilder.tsx
  PrereqWarning.tsx
  EventBlock.tsx
  ... etc

/hooks
  useAuth.ts
  usePlans.ts
  useCourseSearch.ts
  useCalendarEvents.ts

/lib
  firebase.ts           — client-side Firebase SDK init (browser only)
  firebase-admin.ts     — server-side Admin SDK init
  api-helpers.ts        — verifyAuth(), errorResponse(), successResponse()

/scripts
  scrape-courses.js     — one-time local script, not a cloud function

/docs
  neucourse-prd.md
  openapi.yaml
  firestore-schema.md
  api.md
  scraper.md
  ai-usage.md
  /sprints/
    sprint1-planning.md
    sprint1-retro.md
    sprint2-planning.md
    sprint2-retro.md
```

---

## NAMING CONVENTIONS

- **React components:** PascalCase flat files — `CourseCard.tsx`, `WeeklyCalendar.tsx`
- **Hooks:** camelCase with `use` prefix — `useAuth.ts`, `usePlans.ts`
- **Lib utilities:** kebab-case — `api-helpers.ts`, `firebase-admin.ts`
- **Variables & functions:** camelCase
- **Constants:** UPPER_SNAKE_CASE
- **TypeScript interfaces/types:** PascalCase
- **Test files:** co-located, `.test.ts` or `.test.tsx` — `CourseCard.test.tsx`
- **API routes:** always `route.ts` per Next.js App Router convention
- **Git branches:** `feature/<issue-number>-short-description`

---

## API DESIGN RULES

All endpoints follow REST conventions and are versioned at `/api/v1/`.

**Success response shape:**
```json
{ "data": { ... } }
```

**Error response shape (use this exact shape everywhere):**
```json
{ "error": { "code": "ERROR_CODE", "message": "Human-readable message" } }
```

**HTTP status codes to use:**
- 200 OK — successful read or update
- 201 Created — successful creation
- 400 Bad Request — validation failure
- 401 Unauthorized — missing or invalid JWT
- 404 Not Found — resource does not exist
- 500 Internal Server Error — unexpected server failure

**Auth header on all protected requests:**
```
Authorization: Bearer <firebase-jwt>
```

**Public endpoints (no auth required):**
- `GET /api/v1/courses`
- `GET /api/v1/courses/:courseId`

---

## FIRESTORE DATA MODEL

```
users/{userId}                                     — profile metadata
users/{userId}/plans/{planId}                      — plan metadata + timestamps
users/{userId}/plans/{planId}/semesters/{semId}    — semester with course list
users/{userId}/events/{eventId}                    — calendar events
courses/{courseId}                                 — scraped NEU course data (read-only)
```

- Always use `serverTimestamp()` for timestamps. Never `new Date()`.
- The `courses` collection is **read-only at runtime**. Only the scraper writes to it.
- Firestore security rules enforce: users can only access their own documents.
- The `courses` collection is readable by all authenticated users, not writable.

---

## TESTING RULES

- **Unit/Integration:** Vitest + React Testing Library
- **E2E:** Playwright against Firebase emulator or dedicated test project
- **Coverage target:** 80%+ (statements, branches, functions, lines)
- **Never hit real Firestore in unit tests.** Use `vi.mock()` to mock firebase and firebase-admin.
- Test user-visible behavior, not internal implementation details.
- Test files are co-located with source files.
- Scripts: `npm run test`, `npm run coverage`, `npm run test:e2e`

### Priority files to test:
1. All functions in `/lib/api-helpers.ts`
2. All API route handlers under `/app/api/v1/`
3. All custom hooks in `/hooks/`
4. Login, register, course search, plan builder, calendar event creation forms

---

## GIT & SCRUM WORKFLOW

### Branch naming
```
feature/<issue-number>-short-description
fix/<issue-number>-short-description
chore/<issue-number>-short-description
docs/<issue-number>-short-description
```

### Commit format
```
<type>(<scope>): <short description>

Refs #<issue-number>
```
Types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`
Examples:
- `feat(auth): implement Firebase email/password login — Refs #1`
- `chore(setup): initialize Next.js 14 App Router — Refs #11`
- `test(plans): add API route handler unit tests — Refs #18`

### PR format
- Title: `[#<issue-number>] Description` — e.g. `[#1] Implement user registration and login`
- Body: what changed, how to test it, checklist of acceptance criteria from the issue
- Include `Closes #<issue-number>` to auto-close the issue on merge
- CI must pass before merging. Self-merge is allowed.

### Referencing issues in code
```typescript
// TODO(#5): add co-req same-semester validation
```

---

## DO'S

- Use Server Components by default. Only add `'use client'` when required.
- Validate all request bodies in API routes before touching Firestore.
- Use `date-fns` for date/time operations.
- Use native `fetch` — no axios.
- Use `serverTimestamp()` for all Firestore writes.
- Add JSDoc comments to all API route handlers.
- Write `.env.example` with placeholder keys — never commit `.env.local`.
- Add Swagger JSDoc annotations to all API routes so `/api-docs` stays up to date.
- Show soft prereq warnings (amber/yellow inline text) — never hard-block the student.
- Keep components under ~150 lines. Split if larger.

## DON'TS

- **Never** import `firebase-admin` in a client component or page.
- **Never** call Firestore directly from client components.
- **Never** store the JWT in localStorage or sessionStorage.
- **Never** use the `/pages` directory.
- **Never** use `any` in TypeScript.
- **Never** write custom CSS files or inline styles — Tailwind utilities only.
- **Never** live-scrape searchneu.com on user requests — query pre-scraped Firestore data.
- **Never** deploy to Firebase Hosting — the project uses Vercel.
- **Never** use `useEffect` for data fetching — use Server Components or SWR-style hooks.
- **Never** commit secrets, `.env.local`, or Firebase service account keys.
- **Never** hard-block students on prereq violations — soft-warn only, student can override.

---

## PREFERRED LIBRARIES

| Purpose | Library | Notes |
|---|---|---|
| Auth | firebase (client) | Already in stack |
| Server auth | firebase-admin | Server-side only |
| API docs | next-swagger-doc + swagger-ui-react | At /api-docs |
| Calendar export | ics | Client-side only |
| Unit tests | vitest + @testing-library/react | — |
| E2E tests | playwright | — |
| Date/time | date-fns | Lightweight, tree-shakeable |
| HTTP | Native fetch | No axios needed |
| State | React context + useState | No Redux |

---

## SECURITY REQUIREMENTS

- Verify Firebase JWT on every authenticated API route before any Firestore operation.
- Firestore security rules: users read/write their own documents only.
- `courses` collection: read-only for all runtime clients.
- Never log JWTs, emails, or PII.
- Generic auth error messages — never reveal which field was wrong (email vs. password).
- Input validation on all API request bodies before Firestore writes.
- `npm audit` runs in CI — high-severity vulnerabilities fail the build.
- All secrets via environment variables only.

## ACCESSIBILITY REQUIREMENTS

- Semantic HTML: use `<nav>`, `<main>`, `<section>`, `<button>`, not `<div>` for everything.
- All interactive elements must be keyboard navigable.
- All images and icons must have `alt` text or `aria-label`.
- Color alone must not convey meaning — prereq warnings must include text, not just color.
- Minimum contrast: 4.5:1 for normal text (WCAG AA).

---

## SPRINT TIMELINE

| Sprint | Due | Goal |
|---|---|---|
| Sprint 1 | March 2, 2026 | Auth, course search, course detail, degree plan builder, all infra |
| Sprint 2 | March 9, 2026 | Calendar, prereq validation, export, dashboard, API docs, tests, CI/CD |

GitHub Issues: https://github.com/khajjafar/NEUCourse/issues
PRD: `/docs/neucourse-prd.md`