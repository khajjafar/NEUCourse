---
trigger: always_on
---

NOTE: Whenever you are about to respond to me, use the 🪐 emoji. 

# Northeastern University degree planning + scheduling web app
# Repo: https://github.com/khajjafar/NEUCourse.git

---

## PROJECT OVERVIEW

Full PRD: project_memory/neucourse-prd.md
GitHub Issues: https://github.com/khajjafar/NEUCourse/issues

Two engineers are working on this project. Always write code that a second developer
can immediately understand and extend.

---

## TECH STACK & FOLDER STRUCTURE

Refer to the PRD for folder structure in project_memory/neucourse-prd.md under the two respective headers:
- Tech Stack
- Folder Structure

---

## ARCHITECTURE

### Routing — Next.js App Router
All pages live under `/app`. All API routes live under `/app/api/v1/`.
Never use the `/pages` directory — this project uses the App Router exclusively.

### API Layer
- The frontend NEVER calls Firestore directly from client components.
- ALL data fetching goes through Next.js API route handlers under `/app/api/v1/`.
- API routes use the Firebase Admin SDK to verify JWTs and read/write Firestore.
- Pass the Firebase JWT as `Authorization: Bearer <token>` on all authenticated requests.
- Unauthenticated routes: GET /api/v1/courses, GET /api/v1/courses/:courseId only.

### Auth Flow
1. User logs in via Firebase Auth client SDK → receives a Firebase JWT
2. Frontend stores JWT in React context (never in localStorage)
3. Every authenticated API call includes `Authorization: Bearer <token>`
4. API route handler calls `firebase-admin` to verify the token server-side

---

## NAMING CONVENTIONS

### Files & Folders
- React components: PascalCase flat files → `CourseCard.tsx`, `WeeklyCalendar.tsx`
- Hooks: camelCase prefixed with `use` → `useAuth.ts`, `useCourseSearch.ts`
- Lib utilities: camelCase → `api-helpers.ts`, `firebase-admin.ts`
- API route files: always named `route.ts` per Next.js App Router convention
- Test files: co-located with source, suffix `.test.ts` or `.test.tsx`
  - e.g. `CourseCard.test.tsx`, `api-helpers.test.ts`

### Variables & Functions
- Variables and functions: camelCase
- React components: PascalCase
- Constants: UPPER_SNAKE_CASE
- TypeScript interfaces: PascalCase prefixed with `I` only if needed to disambiguate
- TypeScript types: PascalCase

### CSS / Tailwind
- Use Tailwind utility classes exclusively. Never write custom CSS files or inline styles.
- Never use arbitrary Tailwind values (e.g. `w-[137px]`) unless absolutely necessary.
- Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`) for all responsive layout.

---

## CODING STANDARDS

- TypeScript strict mode is ON. Never use `any`. Use `unknown` and narrow it.
- Always define return types on functions that return non-trivial values.
- Prefer `async/await` over `.then()` chains.
- Never use `var`. Use `const` by default, `let` only when reassignment is needed.
- All API route handlers must return typed `NextResponse` objects.
- All error responses must use this consistent JSON structure:
  ```json
  { "error": { "code": "ERROR_CODE", "message": "Human readable message" } }
  ```
- All API routes must be versioned under `/api/v1/`.
- Server-only code (firebase-admin, Admin SDK) must never be imported in client components.
  Use the `server-only` package import guard where appropriate.
- Always handle potentially undefined Firestore document fields with null checks or optional chaining.
- Avoid `useEffect` for data fetching — use React Server Components or SWR/fetch in hooks.
- Keep components focused. If a component exceeds ~150 lines, split it.

---

## MUST FOLLOW: LOG FILE (REQUIRED)

After you create/edit anything, make sure to update the log file in the `docs/logs/` directory. This is a file to track the modifications an agent makes to the codebase similar to git commit messages. Please create way to identify each modificaiton and a timestamp as well. Make it concise and EASY TO READ.

NEVER SKIP THIS

---

## MUST DO FIRST BEFORE ANY DEVELOPMENT: TESTING RULES (REQUIRED)

You must create and develop a testing strategy for the feature you are about to implement. Create the tests in the `tests/` directory. 

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

NEVER SKIP THIS

---

## FIRESTORE DATA MODEL

```
users/{userId}
users/{userId}/plans/{planId}
users/{userId}/plans/{planId}/semesters/{semesterId}
users/{userId}/events/{eventId}
courses/{courseId}    ← shared, read-only, populated by scraper
```

- Never expose raw Firestore document IDs in API responses without intention.
- Always store timestamps as Firestore `serverTimestamp()` — never `new Date()`.
- The `courses` collection is read-only at runtime. Only the scraper script writes to it.

### Framework
- Unit + Integration: Vitest + React Testing Library
- E2E: Playwright

### Coverage Goal
- 80%+ across statements, branches, functions, and lines.
- Run: `npm run coverage`

### Patterns
- Mock Firebase and Firebase Admin SDK in all unit/integration tests. Never hit real Firestore.
- Use `vi.mock()` for module mocking in Vitest.
- Test API route handlers by mocking firebase-admin calls.
- Test React components by rendering them and asserting on user-visible output — not implementation details.
- E2E tests use a dedicated Firebase test project or the Firebase emulator suite. Never pollute production data.

### What to test
- All utility functions in `/lib`
- All custom hooks in `/hooks`
- All API route handlers
- All form interactions (login, register, course search, plan creation, calendar event creation)

---

## WIREFRAMES

Review the wireframes in the docs/wireframes/ directory.

---

## SCRUM & WORKFLOW

### Branch Naming
```
feature/<issue-number>-short-description
fix/<issue-number>-short-description
chore/<issue-number>-short-description
docs/<issue-number>-short-description
```
Examples: `feature/1-user-auth` 

### Commit Message Format
```
<type>(<scope>): <short description>

[optional body]

Refs #<issue-number>
```
Types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `style`
Scope: component or module name (e.g. `auth`, `calendar`, `plans`, `api`)

Example: `feat(auth): add Firebase email/password login — Refs #1`

### PR Workflow
1. Branch off `main` using the naming convention above.
2. Reference the GitHub Issue in the PR title: `[#1] Implement user registration and login`
3. PR body must include: what was done, how to test it, and a checklist linking back to the issue's acceptance criteria.
4. Self-merge is permitted. No required peer review.
5. CI must pass (lint + build + tests) before merging.
6. Delete the branch after merging.

### Referencing Issues in Code
- Use `// TODO(#<issue-number>): description` for known gaps tied to a specific issue.
- Use `Refs #<issue-number>` in all commit messages.
- Close issues automatically by including `Closes #<issue-number>` in the PR description.

---

## DO'S

- DO use Next.js Server Components for pages that don't need client interactivity.
- DO use `'use client'` directive only when the component uses hooks, event handlers, or browser APIs.
- DO verify Firebase JWTs server-side on every authenticated API route using firebase-admin.
- DO use Firestore `serverTimestamp()` for all timestamps.
- DO write tests alongside features — not at the end.
- DO keep API responses consistent: always `{ data: ... }` for success, `{ error: { code, message } }` for errors.
- DO use environment variables for all secrets. Never hardcode Firebase config in source.
- DO use `.env.local` for local secrets and Vercel environment variables for production.
- DO commit `.env.example` with placeholder values.
- DO use `next-swagger-doc` + `swagger-ui-react` for API documentation at `/api-docs`.
- DO add JSDoc comments to all API route handlers describing the endpoint.
- DO use the `ics` library for calendar export — client-side only, no server needed.
- DO use Tailwind responsive classes for all layout — never hardcode widths/heights in pixels.

## DON'TS

- DON'T import `firebase-admin` in any client component or page. Server-side only.
- DON'T call Firestore directly from client components. All reads/writes go through API routes.
- DON'T store the Firebase JWT in `localStorage` or `sessionStorage`. Keep it in React context.
- DON'T use the `/pages` directory. This project uses the App Router exclusively.
- DON'T use the src/ directory. All application code lives directly under /app, /components, /hooks, /lib, and /scripts at the project root. Never nest under src/.
- DON'T use `any` in TypeScript. Use `unknown` and narrow it.
- DON'T write custom CSS. Use Tailwind utilities only.
- DON'T create a separate Express server. All API logic lives in Next.js route handlers.
- DON'T deploy to Firebase Hosting. The project deploys to Vercel.
- DON'T use `useEffect` for data fetching. Use Server Components or custom hooks with fetch.
- DON'T hard-block students on prereq violations. Always soft-warn only.
- DON'T commit `.env.local` or any Firebase service account key to the repo.
- DON'T use `react-big-calendar` without evaluating bundle size first — a lightweight custom grid may be preferable.
- DON'T live-scrape searchneu.com on user requests. Course data is pre-scraped and stored in Firestore.

---

## DEPENDENCIES TO PREFER

| Purpose              | Preferred Library         | Notes                              |
|----------------------|---------------------------|------------------------------------|
| Auth                 | firebase (client)         | Already in stack                   |
| Admin / JWT verify   | firebase-admin            | Server-side only                   |
| API docs             | next-swagger-doc + swagger-ui-react | Per PRD                |
| Calendar export      | ics                       | Client-side, lightweight           |
| Testing              | vitest + @testing-library/react | Per PRD                    |
| E2E                  | playwright                | Per PRD                            |
| Date/time            | date-fns                  | Lightweight, tree-shakeable        |
| HTTP fetching        | Native fetch (Next.js)    | No axios needed                    |
| State management     | React context + useState  | No Redux — app is simple enough    |

---

## SECURITY REQUIREMENTS

- All authenticated API routes must verify the Firebase JWT before any Firestore operation.
- Firestore security rules must enforce: users can only read/write their own documents.
- The `courses` collection must be read-only for all clients (write only via Admin SDK in scraper).
- Never log JWTs, user emails, or any PII.
- Run `npm audit` in CI and fail the build on high-severity vulnerabilities.
- Input validation: validate all request bodies in API routes before writing to Firestore.
- Generic error messages on auth failures — never reveal which field (email vs password) was wrong.

## ACCESSIBILITY REQUIREMENTS

- All interactive elements must be keyboard navigable.
- All images and icons must have `alt` text or `aria-label`.
- Use semantic HTML elements (`<nav>`, `<main>`, `<section>`, `<button>`) — not `<div>` for everything.
- Color alone must not convey meaning (e.g. prereq warnings must have text, not just red color).
- Minimum contrast ratio: 4.5:1 for normal text (WCAG AA).