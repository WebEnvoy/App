# Current Status

## Derived Fact Chain View

- Item ID: APP-239
- Goal: Let users continue from a successful Xiaohongshu search result into one Core-owned note-detail task and inspect real public refs.
- Scope: Ownership remains in App for Core owner-result parsing, bounded opaque target selection, exact detail submit, polling, result/source/evidence/post-check/session projection, fixture isolation, and APP-239 carriers. BOSS and write-precheck remain excluded.
- Execution Path: work/app-239-xhs-detail-handoff
- Workspace Entry: .
- Recovery Entry: .loom/progress/APP-239.md
- Review Entry: .loom/reviews/APP-239.json
- Validation Entry: npm run typecheck; npm run smoke; npm run smoke:packaged:readonly; git diff --check; packaged App Computer Use E2E
- Closing Condition: Implementation PR merged and merged-head packaged App Computer Use E2E proves search -> opaque detail ref -> detail run/result/source/evidence/post-check/session refs. Keep BOSS and write-precheck issues open.
- Current Checkpoint: review
- Current Stop: Product head `9412b7f9cc921066d404744c079475faf327beb9` passed local and packaged validation plus independent semantic review with no blocking findings.
- Next Step: Commit current-head carriers, create the stacked APP-239 PR, and consume hosted checks. Keep #239/#241 open for merged packaged live E2E.
- Blockers: APP-290 / PR #291 must merge before this stacked PR can target main. Core #270 is merged as `795059d6ac08df10e26f89789a675614c738c1ca`.
- Latest Validation Summary: 2026-07-12T14:29Z at product head `9412b7f9cc921066d404744c079475faf327beb9`: `npm run typecheck`, `npm run smoke`, `npm run smoke:packaged`, `WEBENVOY_REQUIRE_PACKAGED_RUNTIME=1 npm run smoke:packaged:readonly`, and `git diff --check` passed using Core #270 and Harbor #252 packaged sources. Independent review returned ALLOW after exact Core envelope, strict detail normalization, resume zero-POST, concurrency, UUID, fixture isolation, and BOSS deferred checks.
- Recovery Boundary: Revert only APP-239 detail-handoff code and item-specific carriers; no Core/Harbor/Lode edits, BOSS production, sensitive material, external writes, or issue closeout.
- Current Lane: APP-239 Xiaohongshu opaque-ref detail handoff.

## Runtime Evidence

- Run Entry: no live detail run during implementation; merged packaged App E2E required for closeout
- Logs Entry: scripts/smoke.mjs; packaged runtime smoke at product head `9412b7f9cc921066d404744c079475faf327beb9`
- Diagnostics Entry: src/renderer/coreReadTaskClient.ts; src/renderer/coreTaskSubmitClient.ts
- Verification Entry: .loom/specs/APP-239/build-evidence.json
- Lane Entry: .loom/specs/APP-239/plan.md

## Sources

- Static Truth: .loom/work-items/APP-239.md
- Dynamic Truth: .loom/progress/APP-239.md
- Locator Truth: .loom/bootstrap/init-result.json
- Fact Chain CLI: loom fact-chain --target . --json
