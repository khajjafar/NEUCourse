# Log 14 — Firestore Data Model Documentation

**Issue:** #14 — Define and document Firestore data model and Firebase project configuration
**Branch:** joythish-sprint2
**Date:** 2026-03-07

---

## What was done

### File created

| File | Purpose |
|---|---|
| `docs/firestore-schema.md` | Complete Firestore data model reference and Firebase config docs |

### Contents of `docs/firestore-schema.md`

1. **Firebase Project Configuration** — all environment variables (client and server-only), SDK initialisation pattern, and the Email/Password auth provider.

2. **Collection Hierarchy** — visual tree of all collections and subcollections.

3. **Per-collection schemas** — field-by-field tables with type, required flag, and description for:
   - `users/{userId}` — profile metadata, `RequirementGroup` shape
   - `users/{userId}/plans/{planId}` — plan name, `createdAt`, `updatedAt`
   - `users/{userId}/plans/{planId}/semesters/{semId}` — `name`, `order`, `courses` array; `CourseAssignment` shape
   - `users/{userId}/events/{eventId}` — title, ISO startTime/endTime, location, color, timestamps
   - `courses/{courseId}` — full course catalogue schema including `ClassSection` shape and `meetingTimes` en-dash note

4. **Firestore Security Rules** — complete rules block enforcing:
   - UID-scoped access (`request.auth.uid == userId`) for all user data
   - Authenticated read-only access to `courses`
   - No runtime writes to `courses` (only Admin SDK scraper)

5. **Access Pattern Summary** — table cross-referencing who reads/writes each collection and auth requirements.

### Key decisions

- `startTime`/`endTime` on events are stored as **ISO 8601 strings** (not Firestore Timestamps) to avoid serialisation issues over the REST API.
- Semester `courses` is an **array of objects** in the semester document (not a subcollection) for simple reads and `arrayUnion`/`arrayRemove` mutations.
- `courses` collection is public-read (auth required) to support course search without requiring ownership checks.
- `semesterCount` on plans is a **computed value** derived by counting the semesters subcollection at read time — not a stored field.

---

## How to verify manually

1. Open **Firebase Console → Firestore** for your project.
2. Check that collections match the hierarchy:
   `users/{uid}/plans/{planId}/semesters/{semId}` and `users/{uid}/events/{eventId}`.
3. Check **Authentication → Sign-in method** — Email/Password is enabled.
4. Check **Firestore → Rules** — confirm rules match the block in `docs/firestore-schema.md`.
5. Open `docs/firestore-schema.md` in the repo and verify all field names match what you see in actual Firestore documents.
