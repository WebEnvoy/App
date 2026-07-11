# Current Status

## Derived Fact Chain View

- Item ID: APP-239
- Goal: Correct APP-239 so the packaged App can execute one supervised official-Chrome Xiaohongshu read-only task and display only Core-owned live run/result/evidence/session refs.
- Scope: App restricted-Chrome admission, structured public query submit, supervised Core/Harbor bearer distribution, typed owner refs, fixture isolation, runtime timeout, packaged smoke, and APP-239 carriers. BOSS and write-precheck remain excluded.
- Execution Path: work/app-239-official-chrome-readonly
- Workspace Entry: .
- Recovery Entry: .loom/progress/APP-239.md
- Review Entry: .loom/reviews/APP-239.json
- Validation Entry: npm run typecheck; npm run smoke; npm run smoke:packaged:readonly; git diff --check; packaged App Computer Use E2E
- Closing Condition: PR #280 merged and merged-head packaged App Computer Use E2E proves the XHS live run/result/evidence/session path. Keep BOSS and write-precheck issues open.
- Current Checkpoint: merge
- Current Stop: PR #280 is open at head 14cf0126a3f66c7ed51b94e499febd4328485a7c. The stale identity projection is fixed and Computer Use reached Core submission; run app-xiaohongshu-mrghaqn9 correctly failed closed with Harbor not_logged_in.
- Next Step: Classify and repair the Harbor not_logged_in result without weakening login or probe guards, then repeat final-head packaged-App Computer Use E2E. Keep #239 open until a merged-head live run succeeds.
- Blockers: None recorded.
- Latest Validation Summary: 2026-07-11 at 14cf0126a3f66c7ed51b94e499febd4328485a7c: `npm run typecheck`, `npm run smoke`, exact-head packaged runtime build, and `git diff --check` passed. Computer Use proved manual-auth refresh now synchronizes App submit admission and submitted run app-xiaohongshu-mrghaqn9; Core accepted the task and bound a core_task Harbor session, then returned 503/requires_user_action with not_logged_in. No fixture success or prohibited action occurred; successful final-head and merged-head replay remain required.
- Recovery Boundary: Revert PR #251 branch `work/app-239-real-read-results`; no Core/Harbor/Lode repo changes, external site access, real account/profile/Cookie use, raw evidence storage, host merge, issue closeout, or live write occurred. Core #230 / PR #240 write-precheck facts remain excluded scope and are not consumed by this read-only display batch.
- Current Lane: App #239 official-Chrome Xiaohongshu live read-only corrective delivery.

## Runtime Evidence

- Run Entry: app-xiaohongshu-mrgcpit5 branch evidence; final-head and merged-head replay pending.
- Logs Entry: scripts/smoke.mjs
- Diagnostics Entry: src/renderer/IdentityEnvironmentsPage.tsx; src/renderer/IdentityEnvironmentDetails.tsx; src/renderer/harborIdentityClient.ts
- Verification Entry: .loom/progress/APP-239.md
- Lane Entry: .loom/specs/APP-239/plan.md

## Sources

- Static Truth: .loom/work-items/APP-239.md
- Dynamic Truth: .loom/progress/APP-239.md
- Locator Truth: .loom/bootstrap/init-result.json
- Fact Chain CLI: loom fact-chain --target . --json
