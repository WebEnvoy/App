# Current Status

## Derived Fact Chain View

- Item ID: APP-265
- Goal: Repair the App/Core/Harbor runtime admission contract so the packaged App can supervise local owner runtimes, detect real browser providers, and submit a read-only Core task that returns run/result/evidence/session refs instead of fixture/UI projection.
- Scope: App #265 owner API IPC and live blocker surfacing keeps packaged Core/Harbor runtime supervision intact while allowing Electron-rendered App pages to consume local Core/Harbor owner APIs without browser CORS false negatives. It prevents fixture/demo/smoke owner payloads and needs-auth/local/fixture identities from opening live task controls. Ownership constraints are limited to App owner API IPC, Core/Harbor renderer client ingestion, owner payload guards, identity task gating, packaged smoke scripts, screenshot artifacts, and APP-265 Loom carriers; Core, Harbor, Lode, raw credentials, raw evidence, browser profile storage contents, and external write actions are forbidden.
- Execution Path: work/app-265-owner-api-ipc
- Workspace Entry: .
- Recovery Entry: .loom/progress/APP-265.md
- Review Entry: .loom/reviews/APP-265.json
- Validation Entry: npm run typecheck; npm run smoke; npm run smoke:packaged; npm run smoke:packaged:readonly; npm run smoke:packaged:runtime; npm run smoke:packaged:vertical; git diff --check; loom status --target . --json; loom fact-chain --target . --json; loom suite carrier validate --target . --item APP-265 --json; loom suite evidence validate --target . --item APP-265 --json
- Closing Condition: PR Ready for the App-only live-safe readonly submit slice after validation proves editable same-origin business input flows through Core `/tasks`, returned owner-shaped run/result/evidence/session refs render in the packaged App, existing packaged runtime/preflight smoke remains green, and no fixture/demo result is promoted to live.
- Current Checkpoint: build
- Current Stop: Preparing an APP-265 follow-up PR from branch `work/app-265-owner-api-ipc`. This correction routes renderer Core/Harbor owner API calls through the Electron local-only IPC bridge, accepts real Harbor provider catalogs that contain descriptive smoke/development wording outside metadata fields, and prevents needs-auth/fixture/local identities from exposing task-start controls as live Core task starts.
- Next Step: Commit, push, create PR, consume hosted `loom-pr-merge-gate`, and merge only after checks pass. Keep App #265 open: the next blocker is a missing ready/logged-in Harbor live identity for Xiaohongshu/BOSS, not runtime health or provider detection.
- Blockers: Missing ready/logged-in Harbor live identity/profile for Xiaohongshu/BOSS. User authorized Chrome/CloakBrowser and production page read-only/write-precheck boundaries; the local E2E created a redacted Harbor identity environment and opened a dedicated-profile Chrome session to `https://www.xiaohongshu.com/explore`, but login state remained `unknown` / `manual_authentication_state=required`, so Core task submit stayed disabled.
- Latest Validation Summary: 2026-07-10T04:17Z UTC local validation passed on branch `work/app-265-owner-api-ipc`: `npm run typecheck`, `npm run smoke`, `npm run smoke:packaged:runtime`, and `npm run smoke:packaged:readonly`. Computer Use E2E observed App runtime ready, Harbor provider detection with CloakBrowser missing and official Chrome launchable, Harbor live identity creation/readback, a real dedicated-profile Chrome session for Xiaohongshu (`session_7766aac0-9ed7-4832-bb94-52482aa4de5c`, viewer `viewer_dd9cf7ec-41d6-4d06-ba3c-55469668a0bb`, page title `小红书 - 你的生活兴趣社区`), and task submit blocked because the identity requires manual login/authentication. No publish, send, submit, sensitive cleartext save, bulk collection, hosted browser, marketplace, full account cloud hosting, or risk-control bypass occurred.
- Recovery Boundary: Revert branch `work/app-265-owner-api-ipc`; stop any Harbor session from the E2E; remove `/tmp/webenvoy-live-e2e-20260710-owner-api-fixed` only if the local test identity/profile state must be discarded.
- Current Lane: App #265 owner API IPC and live identity blocker surfacing.

## Runtime Evidence

- Run Entry: artifacts/app-265-packaged-readonly-smoke.png
- Logs Entry: scripts/smoke.mjs; scripts/smoke-packaged-readonly.mjs; scripts/smoke-packaged-runtime.mjs
- Diagnostics Entry: src/electron/main.ts; src/electron/preload.cts; src/renderer/ownerApiClient.ts; src/renderer/ownerPayloadGuards.ts; src/renderer/coreReadTaskClient.ts; src/renderer/coreTaskSubmitClient.ts; src/renderer/harborIdentityClient.ts; src/renderer/IdentityEnvironmentDetails.tsx; scripts/smoke.mjs
- Verification Entry: .loom/progress/APP-265.md
- Lane Entry: .loom/specs/APP-265/plan.md

## Sources

- Static Truth: .loom/work-items/APP-265.md
- Dynamic Truth: .loom/progress/APP-265.md
- Locator Truth: .loom/bootstrap/init-result.json
- Fact Chain CLI: loom fact-chain --target . --json
