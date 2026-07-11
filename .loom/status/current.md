# Current Status

## Derived Fact Chain View

- Item ID: APP-282
- Goal: Preserve the first Harbor-managed browser session response when a real local provider needs more than five seconds to launch.
- Scope: Owner API timeout classification for Core tasks, protected Harbor session lifecycle requests, ordinary owner requests, and focused smoke coverage.
- Execution Path: work/app-282-session-open-timeout
- Workspace Entry: .
- Recovery Entry: .loom/progress/APP-282.md
- Review Entry: .loom/reviews/APP-282.json
- Validation Entry: npm run typecheck; npm run smoke; git diff --check
- Closing Condition: Merge implementation, then verify first-launch session/viewer refs in the packaged App before closing #282.
- Current Checkpoint: review
- Current Stop: Product head `0ab1313` passes typecheck and full App smoke; current-head review is pending carrier commit.
- Next Step: Commit carriers, create ready PR, consume hosted merge gate, and verify packaged first launch.
- Blockers: None
- Latest Validation Summary: 2026-07-11T17:38Z: `npm run typecheck`, `npm run smoke`, and `git diff --check` passed. Timeout classification is 65 seconds for Core task submit, 20 seconds for protected Harbor session lifecycle, and 5 seconds for ordinary owner requests. No live site action occurred in this validation.
- Recovery Boundary: Revert this branch. Do not change Harbor/Core/Lode, close #282, or claim live first-launch evidence before packaged E2E.
- Current Lane: APP-282 first browser-launch response preservation.

## Runtime Evidence

- Run Entry: packaged first-launch replay pending after merge.
- Logs Entry: scripts/smoke.mjs
- Diagnostics Entry: src/electron/main.ts; src/electron/ownerApiRequest.ts
- Verification Entry: .loom/progress/APP-282.md
- Lane Entry: .loom/specs/APP-282/plan.md

## Sources

- Static Truth: .loom/work-items/APP-282.md
- Dynamic Truth: .loom/progress/APP-282.md
- Locator Truth: .loom/bootstrap/init-result.json
- Fact Chain CLI: loom fact-chain --target . --json
