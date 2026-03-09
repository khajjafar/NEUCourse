# Issue #22: README + API Documentation

### Date
March 7, 2026

### Changes Made

#### 1. `README.md` (repo root — full rewrite)
Replaced the default Next.js boilerplate README with a polished project README:
- Project name, description, and feature list
- Screenshots table — all 6 wireframes from `docs/wireframes/`
- Tech stack table with versions (Next.js 16.1.6, TypeScript ^5, TailwindCSS ^4, Firebase ^12.10.0)
- Local dev setup: clone → `.env.local` → `npm install` → `npm run dev`
- Environment variables table (9 variables, all with descriptions, no real values)
- Links section: live app (placeholder), Swagger UI, docs/api.md, docs/openapi.yaml, docs/firestore-schema.md, demo video (placeholder), blog post (placeholder)
- CI/CD section listing all 6 pipeline steps
- Project structure overview
- License section
- GitHub Actions CI badge pointing to `main` branch

#### 2. `.env.example` (new file)
Created with all 9 required environment variables using placeholder values — no real credentials.

### Pre-existing documentation (NOT modified)
- `docs/api.md` — REST API reference with request/response examples (Issue #16)
- `docs/openapi.yaml` — OpenAPI 3.0 spec (Issue #16)
- `docs/firestore-schema.md` — Firestore data model documentation (Issue #14)

### How to verify
1. Open `README.md` at the repo root — confirm all sections are present
2. Confirm all 6 wireframe images render in the Screenshots section (paths: `docs/wireframes/Screen*.png`)
3. Confirm `.env.example` exists with placeholder values (no real credentials)
4. Confirm CI badge URL matches `https://github.com/khajjafar/NEUCourse/actions/workflows/ci.yml`
5. Verify all relative links (`docs/api.md`, `docs/openapi.yaml`, `docs/firestore-schema.md`, `.env.example`, `.github/workflows/ci.yml`) resolve correctly from the repo root
