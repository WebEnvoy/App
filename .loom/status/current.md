# Current Status

## Derived Fact Chain View

- Item ID: APP-240
- Goal: Enable one real read-only BOSS `job-search` submit and display Core-owned run/result/evidence/session refs.
- Scope: Structured `query` plus explicit `city_code`, canonical BOSS search URL, page 1, limit at most 15, strict live identity/runtime admission including authenticated official Chrome restricted fallback with preserved provider/proxy/fingerprint warnings, owner-ref result display, focused smoke coverage, and APP-240 item-specific carriers.
- Execution Path: work/app-240-chrome-readonly-admission
- Workspace Entry: .
- Recovery Entry: .loom/progress/APP-240.md
- Review Entry: .loom/reviews/APP-240.json
- Validation Entry: npm run typecheck; npm run smoke; npm run smoke:packaged:readonly; git diff --check
- Closing Condition: PR Ready only. Keep #240 open until Core #270 delivers real `detail_ref`-based job detail.
- Current Checkpoint: merge
- Current Stop: Product and carrier head `c3bc0cd12dcd3da487bfff8af98ba9fddff13161` passed focused/full validation and independent current-head review after narrowing the `proxy_missing` exception to authenticated BOSS job search only.
- Next Step: Consume the hosted merge gate and perform controlled merge; keep #240 open pending merged-package BOSS run/result/evidence/post-check evidence.
- Blockers: None
- Latest Validation Summary: 2026-07-12T04:56Z: At head `c3bc0cd12dcd3da487bfff8af98ba9fddff13161`, `npm run typecheck`, `npm run smoke`, `npm run build`, and `git diff --check` passed. Independent review confirmed only authenticated Harbor-live BOSS job search may tolerate `proxy_missing` in addition to required `provider_conflict` and `fingerprint_conflict`; proxy-only, XHS, unknown-warning, needs-auth, fixture/local/offline, write/precheck, and batch paths remain denied. No external write occurred.
- Recovery Boundary: Revert this branch. Do not modify Core, Harbor, Lode, merge a PR, close an issue, or perform a real account/site action.
- Current Lane: APP-240 restricted official Chrome BOSS one-shot read-only admission correction.

## Runtime Evidence

- Run Entry: merged-package BOSS job-search replay pending after merge
- Logs Entry: scripts/smoke.mjs
- Diagnostics Entry: src/renderer/coreTaskSubmitClient.ts
- Verification Entry: .loom/progress/APP-240.md
- Lane Entry: .loom/specs/APP-240/plan.md

## Sources

- Static Truth: .loom/work-items/APP-240.md
- Dynamic Truth: .loom/progress/APP-240.md
- Locator Truth: .loom/bootstrap/init-result.json
- Fact Chain CLI: loom fact-chain --target . --json
