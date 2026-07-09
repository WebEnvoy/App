# Implementation Contract

## Ownership

- App lane owns App runtime supervisor, packaged Core/Harbor runtime asset launch, App runtime health/admission clients, App gate display, readonly submit UI state, Library readonly task opening, live identity source display, and App smoke checks.
- Harbor lane owns Harbor runtime API health/readiness endpoints.
- Core lane owns Core admission health and capability run query behavior.
- Main controller owns integration, PR metadata, review, merge, closeout, and final Computer Use E2E.

## Required Evidence

- GitHub issue: App #265.
- Branch: work/app-265-live-readonly-e2e.
- Validation commands and results.
- Runtime health/admission readback from packaged local Core/Harbor smoke.
- Packaged readonly smoke readback for Core `/tasks`, run/result/evidence/session refs, and rendered owner refs in the App UI.
- Harbor provider detection readback remains required for downstream live browser user stories before their closeout.
- Computer Use App E2E evidence remains required before closing the broader App #14 user stories.

## Non-goals

- No true write, submit, publish, send, or external visible action.
- No hosted browser, marketplace, bulk collection, or risk-control bypass.
- No App-owned durable Core/Harbor/Lode truth.
