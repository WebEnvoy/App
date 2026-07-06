# Current Status

## Derived Fact Chain View

- Item ID: APP-234
- Goal: Connect App Browser/identity surface to real Harbor provider, local identity environment, manual authentication, and runtime session facts for App milestone #14 FR #233.
- Scope: App-side Harbor connection layer, safe local identity environment config/import/selection, provider detection display, manual authentication entry, real session start/lock/release/stop intents, smoke checks, and packaged/browser screenshots.
- Execution Path: milestone14/app-real-harbor-identity
- Workspace Entry: /Volumes/2T/dev/WebEnvoy/App.worktrees/app-234-real-harbor-identity
- Recovery Entry: .loom/progress/APP-234.md
- Review Entry: .loom/reviews/APP-234.json
- Validation Entry: npm run typecheck; npm run smoke; npm run smoke:packaged; git diff --check; loom fact-chain --target . --json; loom verify --target . --json
- Closing Condition: PR is ready for #233/#234/#235/#236/#237 without merge or issue closeout.
- Current Checkpoint: merge_ready
- Current Stop: PR #248 is ready for current-head review and hosted gate after controller carrier refresh.
- Next Step: Run hosted gate, merge PR #248 if checks pass, then create closeout/retire lane and close #234-#237 plus parent #233 with post-merge evidence.
- Blockers: No product blocker. Harbor formal HTTP route shape is not present in the Harbor repo; App uses tolerant endpoint candidates and labels offline when unavailable.
- Latest Validation Summary: 2026-07-06T17:34Z local checks passed: npm run typecheck, npm run smoke, WEBENVOY_PACKAGED_SMOKE_SCREENSHOT=artifacts/app-234-real-harbor-identity-packaged.png npm run smoke:packaged, git diff --check, loom fact-chain --target . --json, loom verify --target . --json, loom suite validate/carrier/evidence validate --target . --item APP-234 --json.
- Recovery Boundary: Revert this PR; no external state, real account action, credential/cookie/token/profile/raw evidence storage, or Harbor/Core/Lode repo change is introduced.
- Current Lane: App milestone #14 real Harbor identity/browser batch

## Runtime Evidence

- Run Entry: not_applicable
- Logs Entry: not_applicable
- Diagnostics Entry: not_applicable
- Verification Entry: loom verify --target . --json
- Lane Entry: App milestone #14 real Harbor identity/browser batch

## Sources

- Static Truth: .loom/work-items/APP-234.md
- Dynamic Truth: .loom/progress/APP-234.md
- Locator Truth: .loom/bootstrap/init-result.json
- Fact Chain CLI: loom fact-chain --target . --json
