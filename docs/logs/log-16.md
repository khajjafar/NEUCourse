# Log 16 — REST API Docs (Swagger UI at /api-docs)

**Issue:** #16 — Build and document public REST API using Swagger UI
**Branch:** joythish-sprint2
**Date:** 2026-03-07

---

## What was done

### Packages installed
- `swagger-ui-react` — renders the interactive Swagger UI
- `@types/swagger-ui-react` — TypeScript types
- `next-swagger-doc` — pulled in for dependency completeness per CLAUDE.md; spec is authored statically

### Files created

| File | Purpose |
|---|---|
| `lib/swagger.ts` | Static OpenAPI 3.0 spec exported as a typed JS object (`OpenAPIV3.Document`) |
| `app/api/swagger/route.ts` | `GET /api/swagger` — returns the spec as JSON, consumed by the UI |
| `app/api-docs/page.tsx` | `'use client'` page that renders `swagger-ui-react` via `dynamic` (no SSR) |
| `docs/openapi.yaml` | YAML copy of the spec for human review and CI tooling |
| `docs/api.md` | Developer-friendly markdown with request/response examples |

### API coverage

All 18 endpoints are documented:

| Tag | Count | Auth |
|---|---|---|
| Courses | 2 | Public |
| Plans | 6 | Bearer JWT |
| Semesters | 5 | Bearer JWT |
| Events | 4 | Bearer JWT |

### Architecture decisions
- The spec is a static TypeScript object (`lib/swagger.ts`) rather than runtime JSDoc scanning. This is more reliable on Vercel where source files are not available at runtime.
- The Swagger UI component is loaded with `dynamic(..., { ssr: false })` because `swagger-ui-react` is browser-only.
- `GET /api/swagger` is a simple passthrough route — no auth required since the spec is public metadata.

---

## How to test manually

1. Start the dev server: `npm run dev`
2. Navigate to **http://localhost:3000/api-docs**
3. Verify:
   - The Swagger UI loads with 4 tag groups: Courses, Plans, Semesters, Events
   - Each endpoint shows method, path, parameters, and response schemas
   - Click **Authorize** → paste a Firebase JWT → try `GET /api/v1/plans` → should return your plans
   - Without a token, `GET /api/v1/plans` should return 401
   - `GET /api/v1/courses?q=cs` (no auth needed) should return courses
4. Also verify **http://localhost:3000/api/swagger** returns raw JSON spec
