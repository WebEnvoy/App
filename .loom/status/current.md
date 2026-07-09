# Current Status

## Derived Fact Chain View

- Item ID: APP-265
- Goal: Repair the App/Core/Harbor runtime admission contract so the packaged App can supervise local owner runtimes, detect real browser providers, and submit a read-only Core task that returns run/result/evidence/session refs instead of fixture/UI projection.
- Scope: App #265 current live-safe readonly batch makes the App submit path usable from the desktop shell without promoting fixture/demo state to live availability. This lane keeps packaged Core/Harbor runtime supervision intact, lets the user edit same-origin Xiaohongshu readonly business input, opens the Library readonly task entry once the local runtime gate is ready, marks matching Harbor live identity source in the Task context, routes managed identity create/session requests through Harbor owner API refs, and adds packaged Electron smoke coverage for App -> Core `/tasks` -> run/result/evidence/session refs. Ownership constraints are limited to App renderer submit/navigation/identity client state, packaged smoke hooks/scripts, screenshot artifacts, and APP-265 Loom carriers; Core, Harbor, Lode, raw credentials, raw evidence, browser profile storage, and external visible actions are forbidden.
- Execution Path: work/app-265-real-e2e-final
- Workspace Entry: .
- Recovery Entry: .loom/progress/APP-265.md
- Review Entry: .loom/reviews/APP-265.json
- Validation Entry: npm run typecheck; npm run smoke; npm run smoke:packaged; npm run smoke:packaged:readonly; npm run smoke:packaged:runtime; npm run smoke:packaged:vertical; git diff --check; loom status --target . --json; loom fact-chain --target . --json; loom suite carrier validate --target . --item APP-265 --json; loom suite evidence validate --target . --item APP-265 --json
- Closing Condition: PR Ready for the App-only live-safe readonly submit slice after validation proves editable same-origin business input flows through Core `/tasks`, returned owner-shaped run/result/evidence/session refs render in the packaged App, existing packaged runtime/preflight smoke remains green, and no fixture/demo result is promoted to live.
- Current Checkpoint: merge
- Current Stop: PR #274 is open for branch `work/app-265-real-e2e-final` at head `07ab02c6305979ff2deb9f2b942f71c59d753e9f`. The App side of the APP-265 managed identity/session correction has been committed and pushed: App creates Harbor managed identity environments through the owner API, opens manual browser sessions only with `identity_environment_ref` plus `headless:false`/`control_owner:user`, keeps App local-only and fixture identities fail-closed, and records smoke coverage for create/session/submit negative cases. This is local contract and packaged runtime evidence only; it does not close App #265 or App #14 live user stories.
- Next Step: Consume hosted PR checks for #274 and perform controlled merge only after `loom-pr-merge-gate` passes. Do not close App #265 until user-authorized real App E2E evidence exists.
- Blockers: Hosted `loom-pr-merge-gate` must pass after this carrier checkpoint correction; no product-scope blocker in the local contract evidence.
- Latest Validation Summary: 2026-07-09T18:29Z UTC local validation passed on branch `work/app-265-real-e2e-final` before commit: `npm run smoke`, `WEBENVOY_HARBOR_RUNTIME_SOURCE_DIR=/Volumes/2T/dev/WebEnvoy/Harbor.worktrees/harbor-219-persistent-profile-session npm run smoke:packaged:runtime`, `WEBENVOY_HARBOR_RUNTIME_SOURCE_DIR=/Volumes/2T/dev/WebEnvoy/Harbor.worktrees/harbor-219-persistent-profile-session npm run smoke:packaged:readonly`, `git diff --check`, `loom fact-chain --target . --json`, `loom suite carrier validate --target . --item APP-265 --json`, and `loom suite evidence validate --target . --item APP-265 --json`. Evidence boundary: packaged App launched local Core/Harbor runtime processes, used the Harbor owner API contract for managed identity/session requests, kept local/fixture/Chrome restricted fallback submit paths fail-closed, submitted a readonly Xiaohongshu task through App UI to Core `/tasks`, and rendered Core/Harbor refs under the Harbor fixture launcher only. This is owner-shaped contract evidence, not live-site evidence; no real Xiaohongshu/BOSS account, browser profile, Cookie, production page action, submit, publish, send, hosted browser, marketplace, bulk collection, full account cloud hosting, or risk-control bypass occurred.
- Recovery Boundary: Revert branch `work/app-265-real-e2e-final`; no real account/profile/Cookie/production page action, submit, publish, send, save, hosted browser, marketplace, bulk collection, or risk-bypass action occurred.
- Current Lane: App #265 managed identity/session contract and packaged readonly smoke correction.

## Runtime Evidence

- Run Entry: artifacts/app-265-packaged-readonly-smoke.png
- Logs Entry: scripts/smoke.mjs; scripts/smoke-packaged-readonly.mjs; scripts/smoke-packaged-runtime.mjs
- Diagnostics Entry: src/renderer/harborIdentityClient.ts; src/renderer/IdentityEnvironmentsPage.tsx; scripts/smoke.mjs
- Verification Entry: .loom/progress/APP-265.md
- Lane Entry: .loom/specs/APP-265/plan.md

## Sources

- Static Truth: .loom/work-items/APP-265.md
- Dynamic Truth: .loom/progress/APP-265.md
- Locator Truth: .loom/bootstrap/init-result.json
- Fact Chain CLI: loom fact-chain --target . --json
