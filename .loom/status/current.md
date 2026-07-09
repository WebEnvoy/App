# Current Status

## Derived Fact Chain View

- Item ID: APP-265
- Goal: Repair the App/Core/Harbor runtime admission contract so the packaged App can supervise local owner runtimes, detect real browser providers, and submit a read-only Core task that returns run/result/evidence/session refs instead of fixture/UI projection.
- Scope: App #265 current live-safe readonly batch makes the App submit path usable from the desktop shell without promoting fixture/demo state to live availability. This lane keeps packaged Core/Harbor runtime supervision intact, lets the user edit same-origin Xiaohongshu readonly business input, opens the Library readonly task entry once the local runtime gate is ready, marks matching Harbor live identity source in the Task context, and adds packaged Electron smoke coverage for App -> Core `/tasks` -> run/result/evidence/session refs. Ownership constraints are limited to App renderer submit/navigation state, packaged smoke hooks/scripts, screenshot artifacts, and APP-265 Loom carriers; Core, Harbor, Lode, raw credentials, raw evidence, browser profile storage, and external visible actions are forbidden.
- Execution Path: work/app-265-live-readonly-e2e
- Workspace Entry: .
- Recovery Entry: .loom/progress/APP-265.md
- Review Entry: .loom/reviews/APP-265.json
- Validation Entry: npm run typecheck; npm run smoke; npm run smoke:packaged; npm run smoke:packaged:readonly; npm run smoke:packaged:runtime; npm run smoke:packaged:vertical; git diff --check; loom status --target . --json; loom fact-chain --target . --json; loom suite carrier validate --target . --item APP-265 --json; loom suite evidence validate --target . --item APP-265 --json
- Closing Condition: PR Ready for the App-only live-safe readonly submit slice after validation proves editable same-origin business input flows through Core `/tasks`, returned owner-shaped run/result/evidence/session refs render in the packaged App, existing packaged runtime/preflight smoke remains green, and no fixture/demo result is promoted to live.
- Current Checkpoint: build
- Current Stop: Branch `work/app-265-live-readonly-e2e` has implemented the App-only live-safe readonly submit slice. It covers editable same-origin Xiaohongshu input, Library readonly entry opening after local runtime readiness, Harbor live identity source projection in the Task context, and packaged Electron smoke for App -> Core `/tasks` -> run/result/evidence/session refs. This is local owner-shaped contract evidence only; it does not close App #265 or App #14 user stories.
- Next Step: Commit, push, create PR, read back PR metadata/head SHA, run local PR gate and hosted required checks, and merge only if those gates are clean. Do not close App #265 until user-authorized real App E2E evidence exists.
- Blockers: None
- Latest Validation Summary: 2026-07-09T15:52Z UTC local validation passed in branch `work/app-265-live-readonly-e2e`: `npm run typecheck`, `npm run smoke`, `npm run smoke:packaged`, `npm run smoke:packaged:readonly`, `WEBENVOY_CORE_RUNTIME_SOURCE_DIR=/Volumes/2T/dev/WebEnvoy/WebEnvoy.worktrees/core-244-app-admission-e2e WEBENVOY_HARBOR_RUNTIME_SOURCE_DIR=/Volumes/2T/dev/WebEnvoy/Harbor.worktrees/harbor-main-packaged-smoke npm run smoke:packaged:runtime`, `WEBENVOY_CORE_RUNTIME_SOURCE_DIR=/Volumes/2T/dev/WebEnvoy/WebEnvoy.worktrees/core-244-app-admission-e2e WEBENVOY_HARBOR_RUNTIME_SOURCE_DIR=/Volumes/2T/dev/WebEnvoy/Harbor.worktrees/harbor-main-packaged-smoke npm run smoke:packaged:vertical`, `git diff --check`, `loom status --target . --json`, and `loom fact-chain --target . --json`. Review-readiness tool surface check: `tools/skills_surface.py check`, `tools/loom_check.py --profile source --source-surface contract-only`, `tools/check_release_surface.py`, `tools/version_surface_check.py`, and `tools/check_npm_package.py` are not applicable in this App worktree because `tools/` is absent; hosted `.github/workflows/loom-check.yml` remains the authoritative repo-local-cli surface. Latest packaged readonly smoke rerun produced run id `app-xiaohongshu-mrdounvl`, runtime session ref `harbor:runtime-session/app265/readonly`, evidence ref `harbor:evidence/app265/readonly`, and screenshot `artifacts/app-265-packaged-readonly-smoke.png`. Scope remains local owner-shaped contract and packaged App behavior only; no real Xiaohongshu/BOSS login, browser profile, Cookie, production page action, submit, publish, send, hosted browser, marketplace, bulk collection, or risk-control bypass occurred.
- Recovery Boundary: Revert branch `work/app-265-live-readonly-e2e`; no real account/profile/Cookie/production page action, submit, publish, send, save, hosted browser, marketplace, bulk collection, or risk-bypass action occurred.
- Current Lane: App #265 live-safe readonly submit and packaged owner refs smoke.

## Runtime Evidence

- Run Entry: artifacts/app-265-packaged-readonly-smoke.png
- Logs Entry: scripts/smoke-packaged-readonly.mjs
- Diagnostics Entry: src/electron/main.ts; src/renderer/App.tsx; src/renderer/coreTaskSubmitClient.ts
- Verification Entry: .loom/progress/APP-265.md
- Lane Entry: .loom/specs/APP-265/plan.md

## Sources

- Static Truth: .loom/work-items/APP-265.md
- Dynamic Truth: .loom/progress/APP-265.md
- Locator Truth: .loom/bootstrap/init-result.json
- Fact Chain CLI: loom fact-chain --target . --json
