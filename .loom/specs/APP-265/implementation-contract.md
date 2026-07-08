# Implementation Contract

## Ownership

- App lane owns App runtime supervisor, App runtime health/admission clients, App gate display, and App smoke checks.
- Harbor lane owns Harbor runtime API health/readiness endpoints.
- Core lane owns Core admission health and capability run query behavior.
- Main controller owns integration, PR metadata, review, merge, closeout, and final Computer Use E2E.

## Required Evidence

- GitHub issue: App #265.
- Branch: work/app-265-runtime-admission-e2e.
- Validation commands and results.
- Runtime health/admission readback.
- Provider detection readback from Harbor.
- Computer Use App E2E evidence before closeout.

## Non-goals

- No true write, submit, publish, send, or external visible action.
- No hosted browser, marketplace, bulk collection, or risk-control bypass.
- No App-owned durable Core/Harbor/Lode truth.
