# NEUCourse REST API

> Interactive docs: **[/api-docs](/api-docs)**
> OpenAPI spec: **[/api/swagger](/api/swagger)**
> YAML source: [docs/openapi.yaml](./openapi.yaml)

Base URL: `/api/v1`

---

## Authentication

All endpoints except the two course endpoints require a Firebase ID token:

```
Authorization: Bearer <firebase-jwt>
```

Get the token in your frontend:
```ts
const token = await auth.currentUser?.getIdToken();
```

---

## Response shapes

**Success**
```json
{ "data": { ... } }
```

**Error**
```json
{ "error": { "code": "ERROR_CODE", "message": "Human-readable message" } }
```

---

## Courses (public — no auth required)

### `GET /api/v1/courses`

Search / list pre-scraped NEU courses. Returns up to 50 results from an in-memory cache (refreshed hourly from Firestore).

| Query param | Type | Description |
|---|---|---|
| `q` | string | Free-text search (courseId, name, subject) |
| `subject` | string | Exact subject code, e.g. `CS` |
| `minLevel` | integer | Min course number, e.g. `3000` |
| `maxLevel` | integer | Max course number, e.g. `4999` |

**Response 200**
```json
{
  "data": [
    {
      "id": "CS3500",
      "subject": "CS",
      "number": "3500",
      "name": "Object-Oriented Design",
      "prereqs": ["CS2510"],
      "sections": [{ "crn": "10243", "meetingTimes": "MWF 10:30am – 11:35am", ... }]
    }
  ]
}
```

---

### `GET /api/v1/courses/:courseId`

Returns the full Firestore document for a single course.

**Response 200**
```json
{ "data": { "id": "CS3500", "name": "Object-Oriented Design", ... } }
```

**Response 404**
```json
{ "error": { "code": "NOT_FOUND", "message": "Course CS9999 not found." } }
```

---

## Degree Plans

### `GET /api/v1/plans`

List the authenticated user's degree plans.

**Response 200**
```json
{
  "data": [
    { "id": "abc123", "name": "My 4-Year Plan", "semesterCount": 8, "createdAt": "..." }
  ]
}
```

---

### `POST /api/v1/plans`

Create a new degree plan.

**Request body**
```json
{ "name": "My 4-Year Plan" }
```

**Response 201**
```json
{ "data": { "id": "abc123", "name": "My 4-Year Plan" } }
```

---

### `GET /api/v1/plans/:planId`

Get a plan with its full semesters array (ordered by `order` asc).

**Response 200**
```json
{
  "data": {
    "id": "abc123",
    "name": "My 4-Year Plan",
    "semesters": [
      { "id": "sem1", "name": "Fall 2025", "order": 0, "courses": ["CS2500", { "courseId": "CS3500", "crn": "10243" }] }
    ]
  }
}
```

---

### `PUT /api/v1/plans/:planId`

Rename a plan.

**Request body**
```json
{ "name": "Revised 4-Year Plan" }
```

---

### `PATCH /api/v1/plans/:planId`

Partial update (currently supports `name`).

**Request body**
```json
{ "name": "Optional new name" }
```

---

### `DELETE /api/v1/plans/:planId`

Delete a plan (does not cascade-delete semesters at Firestore level, but they become inaccessible).

**Response 200**
```json
{ "data": { "deleted": true } }
```

---

## Semesters

### `POST /api/v1/plans/:planId/semesters`

Add a semester to a plan.

**Request body**
```json
{ "name": "Fall 2026", "order": 0 }
```

**Response 201**
```json
{ "data": { "id": "sem1", "name": "Fall 2026", "order": 0, "courses": [] } }
```

---

### `PATCH /api/v1/plans/:planId/semesters/:semId`

Update semester attributes. Used for drag-and-drop reordering (`order`), renaming, or replacing the full courses array.

**Request body** (all optional, at least one required)
```json
{ "name": "Spring 2027", "order": 1, "courses": [...] }
```

---

### `DELETE /api/v1/plans/:planId/semesters/:semId`

Delete a semester from a plan.

---

### `POST /api/v1/plans/:planId/semesters/:semId/courses`

Add a course to a semester.

**Request body**
```json
{ "courseId": "CS3500", "crn": "10243" }
```

`crn` is optional — omit it if the student hasn't chosen a specific section yet.

---

### `DELETE /api/v1/plans/:planId/semesters/:semId/courses/:courseId`

Remove a course from a semester.

---

## Calendar Events

### `GET /api/v1/events`

List all calendar events for the authenticated user, ordered by `startTime` ascending.

**Response 200**
```json
{
  "data": [
    {
      "id": "evt1",
      "title": "CS3500 Lecture",
      "startTime": "2026-09-08T10:30:00",
      "endTime": "2026-09-08T11:35:00",
      "location": "Shillman Hall 105",
      "color": "blue"
    }
  ]
}
```

---

### `POST /api/v1/events`

Create a calendar event.

**Request body**
```json
{
  "title": "CS3500 Lecture",
  "startTime": "2026-09-08T10:30:00",
  "endTime": "2026-09-08T11:35:00",
  "location": "Shillman Hall 105",
  "color": "blue"
}
```

`location` and `color` are optional (default `""` and `"blue"` respectively).

**Response 201**
```json
{ "data": { "id": "evt1", "title": "CS3500 Lecture", ... } }
```

---

### `PUT /api/v1/events/:eventId`

Replace all fields on a calendar event. All of `title`, `startTime`, `endTime` are required.

---

### `DELETE /api/v1/events/:eventId`

Delete a calendar event.

**Response 200**
```json
{ "data": { "success": true } }
```

---

## HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | OK — successful read or update |
| 201 | Created — resource created |
| 400 | Bad Request — missing or invalid fields |
| 401 | Unauthorized — missing or invalid JWT |
| 404 | Not Found — resource does not exist |
| 500 | Internal Server Error — unexpected failure |
