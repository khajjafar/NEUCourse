# NEUCourse — Product Requirements Document
**Version:** 2.0
**Date:** February 25, 2026
**Team Size:** 2 engineers
**Timeline:** 2 sprints × 1 week each
**Stack:** Next.js + TailwindCSS + Firebase (Firestore + Firebase Auth)

---

## 1. Product Overview

NEUCourse is a web application for Northeastern University students to plan their degree, browse courses, and organize their weekly schedule — all in one place. It replaces the frustrating experience of juggling Banner, paper spreadsheets, and disconnected calendar tools with a fast, student-focused planning hub.

---

## 2. Problem Statement

Northeastern students currently have no single tool that connects degree planning with day-to-day scheduling. Banner is slow and difficult to navigate. Many students plan graduation requirements on paper or in spreadsheets with no validation for prerequisites. Weekly schedules live separately in Google Calendar or physical planners. This fragmentation causes students to miss requirements, create invalid course sequences, and struggle to visualize their time.

---

## 3. Mom Test — Customer Discovery Simulations

The following simulated interviews follow The Mom Test methodology (Fitzpatrick): asking about past behavior and real problems rather than pitching the idea or soliciting opinions about the future.

---

### Interview 1 — Second-Year CS Student

**Interviewer:** Walk me through how you planned your courses for next semester.

**Student:** "I basically opened a spreadsheet my advisor gave me freshman year, looked at what I hadn't checked off yet, and then went to Banner to see what was available. It took like two hours because Banner kept timing out."

**Interviewer:** What made it take so long?

**Student:** "I had to keep cross-referencing the spreadsheet with Banner, and Banner doesn't tell you if you're missing a prereq until you actually try to register. I tried to add a class and got rejected — turns out I needed a co-req I didn't know about."

**Interviewer:** How often does that happen?

**Student:** "It happened to me twice this year. My roommate had it happen three times."

**Interviewer:** What did you do after you got rejected?

**Student:** "I just picked a different class. I didn't have time to figure out the whole prereq chain again."

> **Key Insights:**
> - Students are losing course seats because prereq/co-req errors surface only at registration, not during planning.
> - The spreadsheet + Banner two-window workflow is the current workaround — it's slow and error-prone.
> - The pain is frequent and has a real consequence: students take suboptimal courses.
> - **Mom Test signal:** This is a real, recurring problem with a measurable cost (lost course seats, delayed graduation). Not a hypothetical.

---

### Interview 2 — Third-Year Business Student with a Co-op

**Interviewer:** Tell me about your schedule last semester — how did you keep track of everything?

**Student:** "I had classes Monday/Wednesday/Friday, co-op Tuesday/Thursday, and two club meetings on top of that. I used Google Calendar but I had to manually type in every class time, location, everything."

**Interviewer:** When did you set that up?

**Student:** "First week of classes. Took me like 45 minutes just for the semester schedule."

**Interviewer:** Did anything ever fall through the cracks?

**Student:** "Yeah, I double-booked myself twice — once I had an office hours slot overlapping with a club meeting I forgot to add. I just didn't go to office hours that week."

**Interviewer:** Have you looked for a better way to do it?

**Student:** "I tried importing from Banner but the .ics export is broken half the time. I just gave up and do it manually."

> **Key Insights:**
> - Manual calendar setup is a real, recurring time cost at the start of every semester.
> - Banner's calendar export is unreliable — students have already tried and abandoned it.
> - Double-booking has a real consequence: missed office hours, missed meetings.
> - **Mom Test signal:** Student has already attempted to find a solution (Banner .ics export), confirming the problem is important enough to act on.

---

### Interview 3 — Incoming First-Year Student (Pre-Orientation)

**Interviewer:** How are you currently figuring out what courses to take at Northeastern?

**Student:** "My advisor sent me a PDF of my degree requirements. I've been reading through it but I don't really understand what order I'm supposed to take things in."

**Interviewer:** What's the most confusing part?

**Student:** "The prereqs. Like it says I need Calculus 1 before Calculus 2, that's fine. But some of the CS requirements reference courses I've never heard of and I don't know if I can take them freshman year or not."

**Interviewer:** What have you done to figure it out so far?

**Student:** "I emailed my advisor. She got back to me four days later. I also tried searching on Rate My Professor but that doesn't tell you the prereqs."

**Interviewer:** What's the worst case if you get it wrong?

**Student:** "I guess I take the wrong thing and waste a semester? That scares me honestly."

> **Key Insights:**
> - Incoming students face prerequisite confusion before they ever open Banner — the problem starts at onboarding.
> - The current solution (email advisor, wait 4 days) is slow and doesn't scale.
> - The emotional stakes are high: students fear wasting a semester on a planning mistake.
> - **Mom Test signal:** This student has already searched for solutions (Rate My Professor, advisor email), confirming real intent. The consequence of failure (wasted semester) makes this a high-priority problem.

---

## 4. Goals & Non-Goals

### Goals
- Allow students to search and browse NEU courses with accurate prereq/co-req data
- Allow students to build and save one or more multi-semester degree plans
- Allow students to create a weekly calendar with classes, club meetings, and events
- Allow students to export their calendar
- Enforce prerequisite and co-requisite rules in the degree planner
- Support user accounts with persistent, saved data
- Expose a versioned public REST API (`/api/v1/...`) consumed by the frontend
- Provide interactive API documentation via Swagger UI at `/api-docs`

### Non-Goals (out of scope for v1)
- Integration with Banner or NEU SSO
- Mobile native app (iOS/Android)
- Advisor-facing features or admin tools
- Real-time seat availability or registration
- GPA tracking or grade input

---

## 5. User Personas

### Persona 1 — The Overwhelmed Planner (Primary)
A 2nd or 3rd year student with a full schedule: classes, co-op or part-time job, and clubs. Needs to visualize their week without double-booking. Currently manages everything manually across Banner and Google Calendar.

### Persona 2 — The Degree Tracker
A student approaching graduation who needs to know exactly which requirements they've met and what's left. Currently uses a paper checklist or advisor-supplied spreadsheet. Needs prereq validation so they don't plan an invalid course sequence.

### Persona 3 — The Incoming Student
A freshman or transfer student who is unfamiliar with NEU's course catalog. Needs to explore courses and understand the logical order in which to take them before meeting with an advisor.

---

## 6. User Stories & Acceptance Criteria

---

### SPRINT 1 — Core Foundation

---

#### US-01 · User Registration & Login
**As a student**, I want to create an account and log in with email and password so that my data is saved and private to me.

**Acceptance Criteria:**
- [ ] User can register with a valid email and password
- [ ] User receives an error if the email is already in use
- [ ] User receives an error if the password is under 8 characters
- [ ] User can log in with correct credentials
- [ ] User sees an error message on incorrect credentials (no detail about which field is wrong)
- [ ] User session persists across page refreshes
- [ ] User can log out from any page

---

#### US-02 · Course Search & Browsing
**As a student**, I want to search for NEU courses by name, subject, or course number so that I can find the right courses for my degree.

**Acceptance Criteria:**
- [ ] User can type into a search bar and see matching courses in real time (or on submit)
- [ ] Results display: course name, course number, subject, credit hours, and description
- [ ] Results display prerequisite and co-requisite course numbers if they exist
- [ ] User can filter results by subject/department
- [ ] If no results are found, a clear empty state message is shown
- [ ] Course data is sourced from searchneu.com via web scraping and stored in Firestore
- [ ] Search works without being logged in (public access)

---

#### US-03 · View Course Detail
**As a student**, I want to click on a course and see its full details so that I can decide whether to add it to my plan.

**Acceptance Criteria:**
- [ ] Clicking a course opens a detail view (modal or page)
- [ ] Detail view shows: full description, credits, prereqs, co-reqs, and offered semesters (if available)
- [ ] Prereqs and co-reqs are displayed as clickable course links
- [ ] User can close/dismiss the detail view and return to search results

---

#### US-04 · Create a Degree Plan
**As a student**, I want to create a named degree plan and assign courses to semesters so that I can map out my path to graduation.

**Acceptance Criteria:**
- [ ] Logged-in user can create a new degree plan with a custom name
- [ ] Plan is organized by semester (e.g., Fall 2026, Spring 2027)
- [ ] User can add courses to any semester from the course search
- [ ] User can remove a course from a semester
- [ ] Plan is automatically saved via API call in real time or on explicit save action
- [ ] User can create multiple plans under one account

---

### SPRINT 2 — Scheduling, Validation & Polish

---

#### US-05 · Prerequisite & Co-requisite Validation
**As a student**, I want the planner to warn me if I add a course before completing its prerequisites so that I don't create an invalid academic plan.

**Acceptance Criteria:**
- [ ] When a user adds a course to a semester, the system checks if prereqs appear in earlier semesters
- [ ] If a prereq is missing, a warning is shown (not a hard block — student can override)
- [ ] Co-requisites are flagged if they are not in the same semester
- [ ] Warning messages clearly name the missing prereq or co-req course

---

#### US-06 · Weekly Calendar View
**As a student**, I want a weekly calendar where I can add my classes and other events so that I can see my full week at a glance.

**Acceptance Criteria:**
- [ ] User can view a 7-day weekly calendar with time slots (7am–10pm minimum)
- [ ] User can add an event with: title, day(s), start time, end time, optional location, optional color tag
- [ ] Events are displayed as blocks in the correct time slot
- [ ] User can edit or delete an existing event
- [ ] Events are saved via API call and persist across sessions
- [ ] Overlapping events are visually indicated

---

#### US-07 · Add Courses to Calendar
**As a student**, I want to add a course from my degree plan directly to my weekly calendar so that I don't have to manually re-enter class times.

**Acceptance Criteria:**
- [ ] User can select a course from their degree plan and add it to the calendar
- [ ] Course meeting times (if available in scraped data) pre-populate the event fields
- [ ] User can edit pre-populated fields before saving
- [ ] Course event appears on the calendar in the correct time slot

---

#### US-08 · Export Calendar
**As a student**, I want to export my weekly calendar so that I can import it into Google Calendar or another tool.

**Acceptance Criteria:**
- [ ] User can export their calendar as an .ics file
- [ ] Exported file includes all saved events with correct times and titles
- [ ] Export is triggered by a visible button in the calendar view
- [ ] Exported .ics is valid and importable into Google Calendar (manually verified in testing)

---

#### US-09 · Manage Multiple Degree Plans
**As a student**, I want to view, rename, and delete my saved degree plans so that I can keep my planning organized.

**Acceptance Criteria:**
- [ ] User can see a list of all their saved plans on a dashboard or plans page
- [ ] User can rename any plan
- [ ] User can delete a plan (with a confirmation prompt)
- [ ] Deleting a plan does not affect other plans or calendar data

---

#### US-10 · Persistent Dashboard
**As a student**, I want a home screen after logging in that shows my plans and calendar at a glance so that I can quickly get back to where I left off.

**Acceptance Criteria:**
- [ ] After login, user lands on a dashboard
- [ ] Dashboard shows a list of saved degree plans with last-modified date
- [ ] Dashboard shows upcoming calendar events (next 7 days)
- [ ] User can navigate to any plan or to the full calendar from the dashboard

---

## 7. Technical Architecture

### Stack

| Concern | Decision |
|---|---|
| **Frontend** | Next.js 14 (App Router) + TailwindCSS |
| **Backend** | Next.js API Routes (`/app/api/v1/...`) |
| **Auth** | Firebase Authentication — email/password (issues Firebase JWT tokens consumed by API routes) |
| **Database** | Cloud Firestore — user plans, calendar events, course cache |
| **Course Data** | Web scraped from searchneu.com, stored in Firestore as a `courses` collection |
| **API Docs** | `next-swagger-doc` + `swagger-ui-react` — live at `/api-docs` |
| **Calendar Export** | Client-side .ics generation (`ics` library) |
| **Hosting** | Vercel (free tier) — automatic deploys from `main`, deploy previews on PRs |
| **Cost** | $0 — Firebase Spark plan + Vercel free tier |

### API Design

All frontend data fetching goes through Next.js API routes — no direct Firestore calls from client components. Firebase Auth JWTs are passed as `Authorization: Bearer <token>` headers and verified server-side via the Firebase Admin SDK in each API route.

API routes follow REST conventions and are versioned under `/api/v1/`.

### Key API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/plans` | List all plans for the authenticated user | Yes |
| `GET` | `/api/v1/plans/:planId` | Get a single plan by ID | Yes |
| `POST` | `/api/v1/plans` | Create a new degree plan | Yes |
| `PUT` | `/api/v1/plans/:planId` | Update a plan | Yes |
| `DELETE` | `/api/v1/plans/:planId` | Delete a plan | Yes |
| `GET` | `/api/v1/plans/:planId/semesters` | Get all semesters in a plan | Yes |
| `POST` | `/api/v1/plans/:planId/semesters/:semId/courses` | Add a course to a semester | Yes |
| `DELETE` | `/api/v1/plans/:planId/semesters/:semId/courses/:courseId` | Remove a course from a semester | Yes |
| `GET` | `/api/v1/events` | List all calendar events for the user | Yes |
| `POST` | `/api/v1/events` | Create a calendar event | Yes |
| `PUT` | `/api/v1/events/:eventId` | Update a calendar event | Yes |
| `DELETE` | `/api/v1/events/:eventId` | Delete a calendar event | Yes |
| `GET` | `/api/v1/courses` | Search/list courses (public) | No |
| `GET` | `/api/v1/courses/:courseId` | Get a single course detail (public) | No |

### Firestore Data Model

```
users/{userId}                          — profile metadata
users/{userId}/plans/{planId}           — degree plan metadata + timestamps
users/{userId}/plans/{planId}/semesters/{semesterId}  — semester with course list
users/{userId}/events/{eventId}         — calendar events
courses/{courseId}                      — scraped NEU course data (shared, read-only)
```

### Folder Structure

```
/app
  /api/v1
    /plans/...          — degree plan API routes
    /events/...         — calendar event API routes
    /courses/...        — course search API routes
  /dashboard/page.tsx
  /courses/page.tsx
  /plans/[planId]/page.tsx
  /calendar/page.tsx
  /api-docs/page.tsx    — Swagger UI
/components
/hooks
/lib
  /firebase.ts          — client-side Firebase init
  /firebase-admin.ts    — server-side Admin SDK init
  /api-helpers.ts       — auth verification, error responses
/docs
  /openapi.yaml         — OpenAPI 3.0 spec
  /firestore-schema.md
  /scraper.md
  /api.md
  /sprints/
/scripts
  /scrape-courses.js    — one-time data scraper
```

---

## 8. Sprint Plan Summary

| Issue | User Story / Task | Sprint |
|---|---|---|
| #11 | Repository & Project Setup (Next.js + Tailwind) | Sprint 1 |
| #12 | CI/CD Pipeline — Base Setup | Sprint 1 |
| #13 | Testing Infrastructure Setup | Sprint 1 |
| #14 | Firebase Backend & Firestore Data Model | Sprint 1 |
| #15 | Course Data Scraper | Sprint 1 |
| #1 | US-01 · User Registration & Login | Sprint 1 |
| #2 | US-02 · Course Search & Browsing | Sprint 1 |
| #3 | US-03 · View Course Detail | Sprint 1 |
| #4 | US-04 · Create a Degree Plan | Sprint 1 |
| #5 | US-05 · Prereq & Co-req Validation | Sprint 2 |
| #6 | US-06 · Weekly Calendar View | Sprint 2 |
| #7 | US-07 · Add Courses to Calendar | Sprint 2 |
| #8 | US-08 · Export Calendar | Sprint 2 |
| #9 | US-09 · Manage Multiple Degree Plans | Sprint 2 |
| #10 | US-10 · Persistent Dashboard | Sprint 2 |
| #16 | Public REST API — Next.js Routes + Swagger UI | Sprint 2 |
| #17 | E2E Testing with Playwright | Sprint 2 |
| #18 | Unit & Integration Tests — 80% Coverage | Sprint 2 |
| #19 | CI/CD Pipeline — Full Coverage & Deploy | Sprint 2 |
| #20 | Sprint Documentation & Retrospectives | Sprint 2 |
| #21 | AI Modality Documentation | Sprint 2 |
| #22 | README & API Documentation | Sprint 2 |
| #23 | Technical Blog Post | Sprint 2 |
| #24 | Demo Video | Sprint 2 |

---

## 9. Out of Scope / Future Considerations
- NEU SSO / Husky ID login
- Advisor portal
- Degree audit automation (checking if all requirements are satisfied)
- Mobile app
- Real-time course seat availability
- Collaborative planning (sharing plans between students)
