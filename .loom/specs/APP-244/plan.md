# Plan

## Implementation Goal

Deliver one App-only batch for milestone #14 FR #243, anchored on Work Item #244 and covering #245/#246/#247.

## Phases

### Phase 1

- Objective: Make write-precheck Task Threads reachable.
- Deliverable: App task list includes #244/#245 write-precheck tasks; Library CTA opens write-precheck tasks.
- Exit condition: users can open Xiaohongshu and BOSS write-precheck views without using hidden fixture-only bundle text.

### Phase 2

- Objective: Consume Core #230 write-precheck owner projections without adding App-owned truth.
- Deliverable: `coreReadTaskClient.ts` maps Core live preview result, action refs, evidence refs, session refs, cancellation, and expiry into existing `writePrecheck` / `approval` display fields.
- Exit condition: live owner projection replaces fallback for write-precheck capabilities when endpoint JSON is available.

### Phase 3

- Objective: Keep no-submit and external-action boundaries testable.
- Deliverable: smoke coverage for live Core write-precheck mapping and existing UI source labels.
- Exit condition: `npm run typecheck`, `npm run smoke`, and `git diff --check` pass.

## Constraints

- Do not modify Core/Harbor/Lode.
- Do not access real external sites, real accounts, real profiles, Cookies, production pages, submit/publish/send, approval execution, or other external visible state.
- Do not store credentials, tokens, browser profile storage, raw evidence bodies, DOM, HAR, screenshots, videos, CDP/VNC endpoints, chat materials, or resumes.
- Do not modify shared Loom carriers outside the APP-244 lane except `.loom/status/current.md` and bootstrap fact-chain pointer required to bind the current item.

## Validation

- npm run typecheck
- npm run smoke
- git diff --check

## Subagent Integration

- Darwin read-only exploration identified existing write-precheck UI/data flow and risk points.
- Ramanujan implemented a bounded smoke assertion patch and validated `npm run typecheck` / `npm run smoke`.
- Main controller integrated non-overlapping App client/UI changes and owns Loom/GitHub/PR/review/merge/closeout.
