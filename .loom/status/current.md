# Current Status

## Derived Fact Chain View

- Item ID: APP-240
- Goal: Enable one real read-only BOSS `job-search` submit and display Core-owned run/result/evidence/session refs.
- Scope: Structured `query` plus explicit `city_code`, canonical BOSS search URL, page 1, limit at most 15, strict live identity/runtime admission, owner-ref result display, focused smoke coverage, and APP-240 carriers.
- Execution Path: work/app-240-boss-job-search
- Workspace Entry: .
- Recovery Entry: .loom/progress/APP-240.md
- Review Entry: .loom/reviews/APP-240.json
- Validation Entry: npm run typecheck; npm run smoke; npm run smoke:packaged:readonly; git diff --check
- Closing Condition: PR Ready only. Keep #240 open until Core #270 delivers real `detail_ref`-based job detail.
- Current Checkpoint: merge
- Current Stop: Product head `c7a3473` remains validated; governance-only head `163737d` adds a full suite that passes inspect and validate, and current-head reviews consume it.
- Next Step: Consume the hosted merge gate and perform controlled merge; keep #240 open pending live BOSS and detail evidence.
- Blockers: None
- Latest Validation Summary: 2026-07-11T17:22Z: Product validation remains `npm run typecheck`, `npm run smoke`, `npm run smoke:packaged:readonly`, and `git diff --check` passed at product head `c7a3473`. Governance-only head `163737d` adds the APP-240 full suite; `loom suite inspect --target . --item APP-240 --json` and `loom suite validate --target . --item APP-240 --json` pass with no missing inputs or gaps. No live account/site action occurred.
- Recovery Boundary: Revert this branch. Do not modify Core, Harbor, Lode, merge a PR, close an issue, or perform a real account/site action.
- Current Lane: APP-240 BOSS one-shot job-search submit and owner-ref display.

## Runtime Evidence

- Run Entry: app-xiaohongshu-mrgcpit5 branch evidence; final-head and merged-head replay pending.
- Logs Entry: scripts/smoke.mjs
- Diagnostics Entry: src/renderer/IdentityEnvironmentsPage.tsx; src/renderer/IdentityEnvironmentDetails.tsx; src/renderer/harborIdentityClient.ts
- Verification Entry: .loom/progress/APP-240.md
- Lane Entry: .loom/specs/APP-240/plan.md

## Sources

- Static Truth: .loom/work-items/APP-240.md
- Dynamic Truth: .loom/progress/APP-240.md
- Locator Truth: .loom/bootstrap/init-result.json
- Fact Chain CLI: loom fact-chain --target . --json
