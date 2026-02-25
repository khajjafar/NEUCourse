---
trigger: always_on
---

# NEUCourse — AGENTS.md
# Instructions for any AI agent, model, or automated tool working on this codebase.
# Repo: https://github.com/khajjafar/NEUCourse.git

---

## WHAT THIS PROJECT IS

NEUCourse is a web application for Northeastern University students to plan their degree and
manage their weekly schedule. Stack: Next.js 14 (App Router) + TypeScript + TailwindCSS +
Firebase (Auth + Firestore) + Vercel. Two engineers. All free-tier tooling.

If you are an AI agent reading this file: follow every instruction here precisely.
Do not invent patterns, introduce new dependencies, or deviate from the architecture described
below without explicit human instruction.

---

## ABSOLUTE CONSTRAINTS
# READ THESE FIRST. THEY OVERRIDE EVERYTHING ELSE.

1. **NEVER import `firebase-admin` outside of `/lib/firebase-admin.ts` and `/app/api/v1/**`.**
   It is a server-only module. Importing it in a client component will crash the build.

2. **NEVER call Firestore directly from a client component or page.**
   All data fetching and mutation goes through Next.js API route handlers at `/app/api/v1/`.

3. **NEVER use the `/pages` directory.** This project uses the Next.js App Router exclusively.

4. **NEVER use `any` in TypeScript.** Use `unknown` and narrow with type guards.

5. **NEVER store the Firebase JWT in localStorage or sessionStorage.**
   Keep it in React context memory only.

6. **NEVER hard-block a student from adding a course due to a missing prerequisite.**
   Show a soft amber warning. The student must be able to override it.

7. **NEVER commit secrets, `.env.local`, or Firebase service account keys.**

8. **NEVER write custom CSS or inline styles.** Use Tailwind utility classes exclusively.

9. **NEVER deploy to Firebase Hosting.** The project deploys to Vercel.

10. **NEVER live-scrape searchneu.com during a user request.**
    Course data is pre-scraped and stored in the Firestore `courses` collection.

---

## PROJECT STRUCTURE

```
/app
  /api/v1/**         — All API route handlers. Each file is named route.ts.
  /dashboard/        — Post-login dashboard page
  /courses/          — Course search page
  /plans/[planId]/   — Degree plan builder page
  /calendar/         — Weekly calendar page
  /api-docs/         — Swagger UI page

/components          — Flat file React components (PascalCase). e.g. CourseCard.tsx
/hooks               — Custom hooks (camelCase, use prefix). e.g. useAuth.ts
/lib
  firebase.ts        — Client-side Firebase SDK init only
  firebase-admin.ts  — Server-side Admin SDK. Never imported client-side.
  api-helpers.ts     — verifyAuth(), errorResponse(), successResponse()

/scripts
  scrape-courses.js  — One-time local script. Not a cloud function. Not a route.

/docs                — All documentation files
/tests               — Playwright E2E test files (unit tests co-located with source)
```

---

## AUTHENTICATION PATTERN

Every authenticated API route MUST follow this exact pattern:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  const { uid, error } = await verifyAuth(request);
  if (error) return error; // returns a 401 NextResponse

  // ... Firestore operations using uid
}
```

`verifyAuth()` lives in `/lib/api-helpers.ts`. It reads the `Authorization: Bearer <token>`
header, verifies it with Firebase Admin SDK, and returns the decoded `uid`.

Public routes (course search and detail) skip `verifyAuth()` entirely.

---

## API RESPONSE FORMAT

All API routes must return responses in these exact shapes.

**Success:**
```json
{ "data": { ... } }
```

**Error:**
```json
{ "error": { "code": "ERROR_CODE", "message": "Human-readable message" } }
```

Use these HTTP status codes:
- 200 — successful read or update
- 201 — successful creation
- 400 — validation failure
- 401 — missing or invalid JWT
- 404 — resource not found
- 500 — unexpected server error

---

## FIRESTORE DATA MODEL

```
users/{userId}                                   profile metadata
users/{userId}/plans/{planId}                    degree plan metadata + timestamps
users/{userId}/plans/{planId}/semesters/{semId}  semester with array of course IDs
users/{userId}/events/{eventId}                  calendar events
courses/{courseId}                               NEU course data — READ ONLY at runtime
```

Rules:
- Always use `serverTimestamp()` for timestamps — never `new Date()` or `Date.now()`.
- The `courses` collection is written only by the scraper script. All runtime code reads only.
- Firestore security rules enforce per-user data isolation. Never bypass this.

---

## COMPONENT RULES

- Flat file structure: `components/CourseCard.tsx`, not `components/CourseCard/index.tsx`.
- Default to React Server Components. Only add `'use client'` when the component genuinely
  uses hooks, event handlers, or browser APIs.
- Components over ~150 lines should be split into smaller focused components.
- All styling via Tailwind utility classes. Never write CSS modules, styled-components, or
  inline style objects.

---

## NAMING RULES

| Thing | Convention | Example |
|---|---|---|
| React component files | PascalCase | `CourseCard.tsx` |
| Hook files | camelCase + `use` prefix | `useAuth.ts` |
| Lib files | kebab-case | `api-helpers.ts` |
| Variables & functions | camelCase | `planId`, `fetchPlans` |
| Constants | UPPER_SNAKE_CASE | `MAX_SEMESTERS` |
| TypeScript types/interfaces | PascalCase | `DegreePlan`, `CourseEvent` |
| API route files | always `route.ts` | `/app/api/v1/plans/route.ts` |
| Test files | co-located, `.test.ts(x)` | `CourseCard.test.tsx` |

---

## TESTING RULES

- **Unit/Integration:** Vitest + React Testing Library
- **E2E:** Playwright
- **Coverage goal:** 80%+ across statements, branches, functions, and lines
- Mock all Firebase and Firebase Admin calls in unit tests using `vi.mock()`.
  Never make real network calls in unit or integration tests.
- Test user-facing behavior, not implementation internals.
- E2E tests must use the Firebase emulator or a dedicated test Firebase project.
  Never run E2E tests against production Firestore.

Test scripts:
```
npm run test         — Vitest unit + integration
npm run coverage     — Vitest with coverage report
npm run test:e2e     — Playwright E2E
```

---

## GIT WORKFLOW

### Branch naming
```
feature/<issue-number>-short-description
fix/<issue-number>-short-description
chore/<issue-number>-short-description
docs/<issue-number>-short-description
```

### Commit format
```
<type>(<scope>): <description> — Refs #<issue-number>
```

Types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `style`

Examples:
```
feat(auth): implement Firebase email login — Refs #1
chore(setup): initialize Next.js 14 App Router — Refs #11
test(api): add unit tests for plans route handler — Refs #18
```

### PR format
- Title: `[#<issue-number>] Short description`
- Body must include: what changed, how to test, and `Closes #<issue-number>`
- CI must pass before merging

---

## SWAGGER / API DOCS

All API route handlers must include OpenAPI JSDoc annotations so the spec stays current.

Example annotation for a route handler:
```typescript
/**
 * @swagger
 * /api/v1/plans:
 *   get:
 *     summary: Get all degree plans for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of plans
 *       401:
 *         description: Unauthorized
 */
```

Swagger UI is live at `/api-docs` using `next-swagger-doc` + `swagger-ui-react`.

---

## ENVIRONMENT VARIABLES

Required in `.env.local` (never committed):
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

`NEXT_PUBLIC_` variables are safe for the browser.
`FIREBASE_ADMIN_*` variables are server-only. Never reference them in client components.

Committed to repo: `.env.example` with placeholder values only.

---

## SECURITY CHECKLIST (run mentally before generating any code)

- [ ] Does this route call `verifyAuth()` before accessing Firestore?
- [ ] Is `firebase-admin` only imported server-side?
- [ ] Am I validating the request body before writing to Firestore?
- [ ] Am I returning a generic error message on auth failure (not field-specific)?
- [ ] Am I using `serverTimestamp()` for any timestamp fields?
- [ ] Am I avoiding logging any JWT, email, or PII?

---

## ACCESSIBILITY CHECKLIST (run before generating any UI code)

- [ ] Are interactive elements keyboard navigable?
- [ ] Do all images and icons have `alt` or `aria-label`?
- [ ] Am I using semantic HTML elements (`<button>`, `<nav>`, `<main>`, `<section>`)?
- [ ] Does the UI convey meaning through text, not color alone?
- [ ] Is contrast at least 4.5:1 for normal text?

---

## SPRINT REFERENCE

| Sprint | Due Date | Focus |
|---|---|---|
| Sprint 1 | March 2, 2026 | Auth, course search, course detail, degree plan builder, all dev infrastructure |
| Sprint 2 | March 9, 2026 | Calendar, prereq validation, .ics export, dashboard, REST API docs, 80% test coverage, full CI/CD |

GitHub Issues: https://github.com/khajjafar/NEUCourse/issues
Full PRD: `/docs/neucourse-prd.md` in the repository