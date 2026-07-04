# Current Status

## Derived Fact Chain View

- Item ID: GH-170
- Goal: Migrate the existing #93/#94/#95 Task Thread content into the Codex-like shell confirmed by GH-169.
- Scope: GitHub issue #170 under parent #167 post-closeout Desktop UI quality.
- Execution Path: implementation_pr
- Workspace Entry: .
- Recovery Entry: .loom/progress/GH-170.md
- Review Entry: .loom/reviews/GH-170.json
- Validation Entry: npm run build; npm run smoke:packaged; git diff --check; loom doctor --target . --json; loom verify --target . --json; loom fact-chain --target . --json
- Closing Condition: PR ready with before/after packaged screenshots, Codex restored references, and explicit exclusion of live Core/Harbor/Lode.
- Current Checkpoint: implemented
- Current Stop: Open GH-170 PR after local validation and evidence carrier update.
- Next Step: Run diff/Loom validation, create review artifact, commit, push, and open PR.
- Blockers: none recorded.
- Latest Validation Summary: `npm run build` passed; `WEBENVOY_PACKAGED_SMOKE_SCREENSHOT=artifacts/gh-170-task-thread-migration.png npm run smoke:packaged` passed and produced a non-blank packaged screenshot. CodeGraph exploration completed before implementation for restored Codex thread layout / scroll / sticky footer and this repo's shell primitives.
- Recovery Boundary: GH-170 owns only migration of existing #93/#94/#95 fixture content into the confirmed shell. It does not connect live Core/Harbor/Lode, create Stage 5 surfaces, or define real data contracts.
- Current Lane: GH-170 implementation

## Runtime Evidence

- Run Entry: .loom/specs/GH-170/build-evidence.json
- Logs Entry: .loom/progress/GH-170.md
- Diagnostics Entry: .loom/specs/GH-170/task-carrier.md
- Verification Entry: .loom/specs/GH-170/build-evidence.json
- Lane Entry: .loom/progress/GH-170.md

## Sources

- Static Truth: .loom/work-items/GH-170.md
- Dynamic Truth: .loom/progress/GH-170.md
- Locator Truth: .loom/bootstrap/init-result.json
- Fact Chain CLI: loom fact-chain --target . --json
