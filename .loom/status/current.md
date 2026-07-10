# Current Status

## Derived Fact Chain View

- Item ID: APP-265
- Goal: Repair the App/Core/Harbor runtime admission contract so the packaged App can supervise local owner runtimes, detect real browser providers, and submit a read-only Core task that returns run/result/evidence/session refs instead of fixture/UI projection.
- Scope: App #265 owner API IPC and live blocker surfacing keeps packaged Core/Harbor runtime supervision intact while allowing Electron-rendered App pages to consume local Core/Harbor owner APIs without browser CORS false negatives. It prevents fixture/demo/smoke owner payloads and needs-auth/local/fixture identities from opening live task controls. Ownership constraints are limited to App owner API IPC, Core/Harbor renderer client ingestion, owner payload guards, identity task gating, packaged smoke scripts, screenshot artifacts, and APP-265 Loom carriers; Core, Harbor, Lode, raw credentials, raw evidence, browser profile storage contents, and external write actions are forbidden.
- Execution Path: work/app-265-manual-auth-launch
- Workspace Entry: .
- Recovery Entry: .loom/progress/APP-265.md
- Review Entry: .loom/reviews/APP-265.json
- Validation Entry: npm run typecheck; npm run smoke; npm run smoke:packaged; npm run smoke:packaged:readonly; npm run smoke:packaged:runtime; npm run smoke:packaged:vertical; git diff --check; loom status --target . --json; loom fact-chain --target . --json; loom suite carrier validate --target . --item APP-265 --json; loom suite evidence validate --target . --item APP-265 --json
- Closing Condition: PR Ready for the App-only live-safe readonly submit slice after validation proves editable same-origin business input flows through Core `/tasks`, returned owner-shaped run/result/evidence/session refs render in the packaged App, existing packaged runtime/preflight smoke remains green, and no fixture/demo result is promoted to live.
- Current Checkpoint: merge
- Current Stop: PR #277 was rebased onto App main so it includes the separate App #236 manual-authentication confirmation boundary. It needs a current-head review record and hosted merge-gate consumption. This is controller-owned merge work, not a user blocker.
- Next Step: Merge PR #277 after the gate passes, launch the packaged App at the merged head, open the selected live Xiaohongshu identity's Harbor-managed authentication scene, and use the explicit confirmation action only after the user has completed manual authentication in that active session. Keep App #265 and App #14 open until a real Core read-only run returns owner refs.
- Blockers: none
- Latest Validation Summary: 2026-07-10T09:49Z local validation passed on rebased implementation head `fd8498705b5c36c034e9366952108ded78816386`: `npm run typecheck`, `npm run smoke`, and `git diff --check`. The correction gives `打开认证现场` an actual handler that calls the existing Harbor identity-session launch path for the selected identity's site and disables concurrent session actions. It does not make login state writable in App, create a Core task, or promote fixture data to live. No real login, submit, publish, send, sensitive cleartext save, bulk collection, hosted browser, marketplace, full account cloud hosting or risk-control bypass occurred in this validation.
- Recovery Boundary: Revert branch `work/app-265-owner-api-ipc`; stop any Harbor session from the E2E; remove `/tmp/webenvoy-live-e2e-20260710-owner-api-fixed` only if the local test identity/profile state must be discarded.
- Current Lane: App #265 owner API IPC and live identity blocker surfacing.

## Runtime Evidence

- Run Entry: artifacts/app-265-packaged-runtime-smoke.png
- Logs Entry: scripts/smoke.mjs
- Diagnostics Entry: src/renderer/IdentityEnvironmentsPage.tsx; src/renderer/IdentityEnvironmentDetails.tsx; src/renderer/harborIdentityClient.ts
- Verification Entry: .loom/progress/APP-265.md
- Lane Entry: .loom/specs/APP-265/plan.md

## Sources

- Static Truth: .loom/work-items/APP-265.md
- Dynamic Truth: .loom/progress/APP-265.md
- Locator Truth: .loom/bootstrap/init-result.json
- Fact Chain CLI: loom fact-chain --target . --json
