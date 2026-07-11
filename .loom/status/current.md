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
- Current Stop: PR #280 is open at head 200ff872fb5c2fe71bb2ec62804451edded15018. Local validation and cross-review are complete; final-head Computer Use replay is waiting only for the Mac to be unlocked.
- Next Step: After unlock, repeat the final-head packaged-App Computer Use run, record current-head review, consume hosted checks, and merge. Keep #239 open until merged-head replay.
- Blockers: None recorded.
- Latest Validation Summary: 2026-07-11 at 200ff872fb5c2fe71bb2ec62804451edded15018: `npm run typecheck`, `npm run smoke`, `npm run smoke:packaged:readonly`, and `git diff --check` passed; cross-review found no P0-P3. Earlier branch run app-xiaohongshu-mrgcpit5 proved supervised official-Chrome read-only execution and five public refs. Final-head Computer Use replay is pending unlock; merged-head replay remains required.
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
