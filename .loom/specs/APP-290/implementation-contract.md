# APP-290 Implementation Contract

## Ownership

- `src/renderer/coreTaskSubmitClient.ts` owns the single BOSS deferred reason, command classification, submit guard, and task projection.
- `src/renderer/App.tsx`, `SiteSkillPages.tsx`, and `TaskThreadPage.tsx` consume that state at existing entry/display boundaries.
- `src/renderer/coreReadTaskClient.ts` retains owner history time.
- `scripts/smoke.mjs` owns authoritative regression assertions.

## Invariants

- `submitCoreReadOnlyTask` cannot contact Core for a deferred BOSS task.
- Shared runtime readiness remains truthful but cannot override BOSS deferred state.
- Fixture/fallback/live success is not displayed as current BOSS capability.
- Historical failure provenance/time/class and BOSS identity/manual browser controls remain observable.
- XHS logic and contracts remain unchanged.

## Verification

Typecheck, full App smoke, packaged smoke, packaged readonly fixture-block smoke, and `git diff --check` must pass at the PR head.
