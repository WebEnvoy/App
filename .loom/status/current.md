# Current Status

## Derived Fact Chain View

- Item ID: APP-265
- Goal: Repair the App/Core/Harbor runtime admission contract so the packaged App can supervise local owner runtimes, detect real browser providers, and submit a read-only Core task that returns run/result/evidence/session refs instead of fixture/UI projection.
- Scope: App #265 current batch consumes the already-merged packaged runtime gate plus Core #248 result/evidence refs. This lane adds App-side Core `/tasks` submit client, fail-closed submit readiness, Harbor live identity gating, result/evidence/session polling, UI submit/status display, smoke coverage, and APP-265 carriers. Ownership constraints are limited to App renderer submit/read UI, `scripts/smoke.mjs`, and APP-265 Loom carriers; Core, Harbor, Lode, raw credentials, raw evidence, browser profile storage, and external visible actions are forbidden.
- Execution Path: work/app-265-core-task-submit
- Workspace Entry: .
- Recovery Entry: .loom/progress/APP-265.md
- Review Entry: .loom/reviews/APP-265.json
- Validation Entry: npm run typecheck; npm run smoke; git diff --check; loom fact-chain --target . --json; loom suite carrier/evidence validate --target . --item APP-265 --json; loom build --target . --item APP-265 --build-evidence .loom/specs/APP-265/build-evidence.json --json
- Closing Condition: PR Ready for the App-only Core submit/polling slice after validation proves the UI constructs Core task-intent v0, stays fail-closed without live runtime/ready Harbor identity, blocks cross-origin task URLs, and never promotes fixture/demo results to live.
- Current Checkpoint: build
- Current Stop: App-side Core submit/polling slice is implemented in `work/app-265-core-task-submit` and locally validated. It is not live Xiaohongshu/BOSS E2E evidence.
- Next Step: Create/update the App PR for APP-265, run review/gate, and keep App #265 open until user-authorized real browser/provider/session/task evidence is available.
- Blockers: None recorded.
- Latest Validation Summary: 2026-07-09T06:24Z UTC: `git diff --check`, `npm run typecheck`, and `npm run smoke` passed. Smoke built the Electron app, packaged sibling Lode/Core/Harbor runtime assets, and covers Core task-intent v0 payload construction, ready Harbor live identity gating, needs-auth identity rejection, same-origin task URL enforcement, refs-only evidence policy, no invalid top-level task `entrypoint`, POST `/tasks` submit/poll happy path, returned run/evidence/session refs projection, and accepted-but-not-ready runs staying `polling` instead of failed.
- Recovery Boundary: Revert this branch. No real account/profile/Cookie/production page action, submit, publish, send, save, hosted browser, marketplace, bulk collection, or risk-bypass action occurred. This batch only adds App-side submit/polling contract behavior and UI status display; live Xiaohongshu/BOSS E2E remains a later gate requiring explicit allowed/prohibited action confirmation.
- Current Lane: App #265 Core read-only task submit and result/evidence refs polling.

## Runtime Evidence

- Run Entry: src/renderer/coreTaskSubmitClient.ts
- Logs Entry: scripts/smoke.mjs
- Diagnostics Entry: src/renderer/TaskThreadPage.tsx
- Verification Entry: .loom/progress/APP-265.md
- Lane Entry: .loom/specs/APP-265/plan.md

## Sources

- Static Truth: .loom/work-items/APP-265.md
- Dynamic Truth: .loom/progress/APP-265.md
- Locator Truth: .loom/bootstrap/init-result.json
- Fact Chain CLI: loom fact-chain --target . --json
