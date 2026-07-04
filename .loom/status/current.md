# Current Status

## Derived Fact Chain View

- Item ID: GH-169
- Goal: Build a Codex-like desktop shell spike with WebEnvoy-native primitives for direction confirmation.
- Scope: GitHub issue #169 under parent #167 post-closeout Desktop UI quality.
- Execution Path: implementation_pr
- Workspace Entry: .
- Recovery Entry: .loom/progress/GH-169.md
- Review Entry: .loom/reviews/GH-169.json
- Validation Entry: npm run typecheck; npm run smoke:packaged; git diff --check; loom doctor --target . --json; loom verify --target . --json; loom fact-chain --target . --json
- Closing Condition: PR ready with packaged Electron screenshot, Codex restored references, and explicit stop before #170 pending direction confirmation.
- Current Checkpoint: review
- Current Stop: Direction confirmed for GH-169 shell foundation; complete current-head review and merge gate before starting GH-170.
- Next Step: Commit GH-169 evidence map/review carriers, update PR metadata to the new head, then rerun hosted checks and merge-ready.
- Blockers: none recorded.
- Latest Validation Summary: CodeGraph exploration completed for restored Codex source and this repo; restored `AppShellLayout`, `LeftPanel`, `RightPanel`, `BottomPanel`, `ResizeHandle`, navigation rail, plugin page, and settings page strategies were mapped into WebEnvoy-native primitives and `DESIGN.md` foundation rules; `npm run build`, `WEBENVOY_PACKAGED_SMOKE_SCREENSHOT=artifacts/gh-169-codex-like-shell.png npm run smoke:packaged`, `git diff --check`, `loom doctor --target . --json`, `loom verify --target . --json`, `loom fact-chain --target . --json`, `loom suite validate --target . --item GH-169 --json`, `loom suite carrier validate --target . --item GH-169 --json`, and `loom suite evidence validate --target . --item GH-169 --json` passed. Hosted run 28675908540 passed py-compile/demo-bootstrap/repo-local-cli/loom-check and failed only at loom-pr-merge-gate because current-head review artifacts were not yet present. Screenshot: `artifacts/gh-169-codex-like-shell.png`.
- Recovery Boundary: GH-169 owns only shell primitives spike and fixture-based preview evidence. It does not migrate #93/#94/#95 business content and does not connect live Core/Harbor/Lode.
- Current Lane: GH-169 implementation

## Runtime Evidence

- Run Entry: .loom/specs/GH-169/build-evidence.json
- Logs Entry: .loom/progress/GH-169.md
- Diagnostics Entry: .loom/specs/GH-169/task-carrier.md
- Verification Entry: .loom/specs/GH-169/build-evidence.json
- Lane Entry: .loom/progress/GH-169.md

## Sources

- Static Truth: .loom/work-items/GH-169.md
- Dynamic Truth: .loom/progress/GH-169.md
- Locator Truth: .loom/bootstrap/init-result.json
- Fact Chain CLI: loom fact-chain --target . --json
