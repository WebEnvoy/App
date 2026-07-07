# Plan

## Implementation Goal

Deliver one App-only batch for milestone #14 FR #238, anchored on Work Item #239 and covering #240/#241/#242.

## Phases

### Phase 1

- Objective: Read Core owner API projections without adding new contracts.
- Deliverable: `coreReadTaskClient.ts` querying capability runs and per-run result/evidence/failure/session refs.
- Exit condition: live projections can replace fallback tasks when endpoint JSON is available.

### Phase 2

- Objective: Surface read-only result and evidence state in existing Task Thread UI.
- Deliverable: Core source strip, right-panel source health, updated read task refs/copy, and failure recovery labels.
- Exit condition: UI clearly distinguishes Core live, Core checking, Core offline, and fallback projection.

### Phase 3

- Objective: Keep validation local and non-external.
- Deliverable: smoke self-check for Core query mapping and raw evidence boundary plus APP-239 carrier.
- Exit condition: `npm run typecheck`, `npm run smoke`, and `git diff --check` pass.

## Constraints

- Do not modify Core/Harbor/Lode.
- Do not modify shared master carriers, Core `.loom/**`, or Core PR #240 body.
- Do not access real external sites, real accounts, real profiles, Cookies, production pages, submit/publish/send, or write external state.
- Do not push, open PR, merge, or close issues from this worker.

## Validation

- npm run typecheck
- npm run smoke
- git diff --check
