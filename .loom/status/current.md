# Current Status

## Derived Fact Chain View

- Item ID: GH-101
- Goal: Deliver the #93 shell batch covering #101, #102, #103, and #104 for the Task Thread first desktop shell.
- Scope: Batch anchor GH-101: integrate the shell primitives needed for Task Thread UI, source health fixtures, Settings local connection boundary, and Task Thread first base navigation/layout; controller-owned Loom/PR/issue ownership remains in the main thread; exclude #105-#113 task submission, run/result/evidence, real Core/Harbor/Lode calls, write-side behavior, full Library/Browser consoles, workflow runtime/editor, packaging, signing, and auto-update.
- Execution Path: product-implementation/desktop-shell-batch
- Workspace Entry: .
- Recovery Entry: .loom/progress/GH-101.md
- Review Entry: .loom/reviews/GH-101.json
- Validation Entry: git diff --check; npm audit --audit-level=high; npm run typecheck; npm run smoke; loom doctor --target . --json; loom verify --target . --json; loom fact-chain --target . --json
- Closing Condition: One implementation PR covers #101, #102, #103, and #104; PR is merged to main; each covered issue receives closeout evidence; #93 remains open unless all parent completion criteria are met; ownership constraints for subagent review/worker output are integrated into `.loom/specs/GH-101/build-evidence.json`.
- Current Checkpoint: merge
- Current Stop: PR #129 is open with current-head review artifacts recorded, PR metadata/head/body read back, and hosted gate recheck pending after GH-101 checkpoint sync.
- Next Step: Wait for hosted `loom-pr-merge-gate` on PR #129; if it passes, proceed to controlled merge and post-merge closeout for #101-#104 only.
- Blockers: None recorded.
- Latest Validation Summary: 2026-07-03 local and hosted-equivalent validation passed `npm run typecheck`, `npm run smoke`, `npm audit --audit-level=high`, `git diff --check`, `loom fact-chain --target . --json`, `loom doctor --target . --json`, `loom verify --target . --json`, `loom suite validate --target . --item GH-101 --json`, `loom suite carrier validate --target . --item GH-101 --json`, and `loom pr metadata-preflight --body-file .loom/tmp/gh101-pr-body-update.md --compare-body-file .loom/tmp/gh101-pr-body-readback.md --json`. Review artifacts `.loom/reviews/GH-101.json` and `.loom/reviews/GH-101.spec.json` are `decision=allow` with `semantic_review_disposition.status=passed`; PR #129 body/head readback is kept aligned after each carrier push by updating the PR metadata machine `head_sha` and rerunning metadata preflight. Hosted `py-compile`, `demo-bootstrap`, `repo-local-cli`, and `loom-check` passed on run `28639585201`; hosted `loom-pr-merge-gate` previously fell back to `build` because the recovery checkpoint still reported `build`. `loom build --target . --item GH-101 --build-evidence .loom/specs/GH-101/build-evidence.json --json` and `loom review record` remain blocked by Loom suite CLI JSON consumption (`suite validate CLI JSON unavailable` / repo-local `tools/loom.py` lookup); no repo-local Loom shim was added.
- Recovery Boundary: GH-101 owns `.loom/work-items/GH-101.md`, `.loom/progress/GH-101.md`, `.loom/specs/GH-101/**`, `.loom/reviews/GH-101.json`, App docs semantic sync, issue body sync for #93/#94/#95/#105/#112/#113, package dependency updates, renderer shell/source-health/settings implementation, and smoke coverage. Do not expand to #105-#113 implementation.
- Current Lane: merge-ready

## Runtime Evidence

- Run Entry: not_applicable
- Logs Entry: not_applicable
- Diagnostics Entry: not_applicable
- Verification Entry: not_applicable
- Lane Entry: not_applicable

## Sources

- Static Truth: .loom/work-items/GH-101.md
- Dynamic Truth: .loom/progress/GH-101.md
- Locator Truth: .loom/bootstrap/init-result.json
- Fact Chain CLI: loom fact-chain --target . --json
