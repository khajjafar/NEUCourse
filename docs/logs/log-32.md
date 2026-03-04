---
id: 32
date: "2026-03-04T21:51:00Z"
type: fix
scope: ui
description: "Fix AddToPlanDropdown modal closing unexpectedly"
issue: 6
---

# Changes
- Replaced the `document.addEventListener('mousedown')` logic inside `AddToPlanDropdown.tsx` with a standard React `onClick` overlay backdrop and an `Escape` key listener.
- This resolves a bug where clicking a Plan inside the modal would trigger an unintended complete closure of the modal because the modal logic was lacking the explicit `#add-to-plan-dropdown` ID identifier that the external click listener relied upon.
