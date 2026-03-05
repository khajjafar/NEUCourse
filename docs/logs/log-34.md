---
id: 34
date: "2026-03-04T22:04:00Z"
type: fix
scope: auth
description: "Fix root component redirecting authenticated sessions to /login"
issue: 6
---

# Changes
- Replaced the root `app/page.tsx` default unconditionally forced Next.js `redirect()` router call using a static component strategy.
- Converted `app/page.tsx` strictly to a `"use client"` component wrapping the `useAuth()` hook natively checking `loading` state execution.
- If an active `user` context is natively resolved from Firebase auth via the provider, the page structurally redirects active sessions seamlessly inside to `/dashboard`, bypassing forced login.
