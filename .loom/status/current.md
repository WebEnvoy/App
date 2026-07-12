# Current Status

## Derived Fact Chain View

- Item ID: APP-240
- Goal: Enable one real read-only BOSS `job-search` submit and display Core-owned run/result/evidence/session refs.
- Scope: Structured `query` plus explicit `city_code`, canonical BOSS search URL, page 1, limit at most 15, strict live identity/runtime admission including authenticated official Chrome restricted fallback with preserved provider/proxy/fingerprint warnings, consistent per-entry identity-page admission, owner-ref result display, focused smoke coverage, and APP-240 item-specific carriers.
- Execution Path: work/app-240-identity-entry-admission
- Workspace Entry: .
- Recovery Entry: .loom/progress/APP-240.md
- Review Entry: .loom/reviews/APP-240.json
- Validation Entry: npm run typecheck; npm run smoke; npm run smoke:packaged:readonly; git diff --check
- Closing Condition: PR Ready only. Keep #240 open until Core #270 delivers real `detail_ref`-based job detail.
- Current Checkpoint: pre-review
- Current Stop: Product head `4751f3ef448a00380ed0f3009c4227f560e3135f` passed focused/full validation and independent current-head review after the identity detail entry was aligned with the existing restricted-Chrome BOSS search admission.
- Next Step: Push the reviewed correction, open the APP-240 PR, consume hosted gate, and merge; keep #240 open while Harbor resolves the live `page.boss_spa.ready` blocker and until merged-package BOSS result/evidence/post-check evidence exists.
- Blockers: None
- Latest Validation Summary: 2026-07-12T06:37Z: At product head `4751f3ef448a00380ed0f3009c4227f560e3135f`, `npm run typecheck`, `npm run smoke`, and `git diff --check` passed. Independent current-head review returned ALLOW after confirming per-entry shared admission: authenticated Harbor-live BOSS restricted Chrome job search is enabled, while write-precheck, unknown task, needs-auth, non-live, XHS proxy_missing, proxy-only, and unknown-warning paths remain fail closed. Computer Use pre-validation exposed the corrected BOSS entry and submitted run `app-boss-mrhf6p7h`; Core returned the precise downstream blocker `resource_fact_missing:page.boss_spa.ready`, and Harbor released session `session_d11738b7-5d23-4a4b-88bf-48e070207cb4`. No external write occurred.
- Recovery Boundary: Revert this branch. Do not modify Core, Harbor, Lode, merge a PR, close an issue, or perform a real account/site action.
- Current Lane: APP-240 identity-entry admission consistency correction.

## Runtime Evidence

- Run Entry: pre-merge `app-boss-mrhf6p7h` blocked downstream on `resource_fact_missing:page.boss_spa.ready`; merged-package successful replay remains pending
- Logs Entry: scripts/smoke.mjs
- Diagnostics Entry: src/renderer/coreTaskSubmitClient.ts
- Verification Entry: .loom/progress/APP-240.md
- Lane Entry: .loom/specs/APP-240/plan.md

## Sources

- Static Truth: .loom/work-items/APP-240.md
- Dynamic Truth: .loom/progress/APP-240.md
- Locator Truth: .loom/bootstrap/init-result.json
- Fact Chain CLI: loom fact-chain --target . --json
