# Current Status

## Derived Fact Chain View

- Item ID: GH-117
- Goal: Refresh App repo-level Loom adoption metadata and workflow pin to v0.26.3.
- Scope: GH-117 is limited to `.loom/installed-state.json`, `.github/workflows/loom-check.yml`, GH-117 item-specific Loom carriers, and PR metadata required for Loom admission, review, merge-ready, and closeout.
- Execution Path: maintenance/loom-v0.26.3-adoption
- Workspace Entry: .
- Recovery Entry: .loom/progress/GH-117.md
- Review Entry: .loom/reviews/GH-117.json
- Validation Entry: `loom installed-state validate --target . --json`; `loom upgrade-plan --target . --host codex --json`; `loom upgrade --target . --host codex --apply --json`; `loom host verify --host codex --target . --json`; `loom skills check --target . --json`; `loom doctor --target . --json`; `loom runtime-upgrade check --target . --item GH-117 --issue 117 --pr 119 --branch work/GH-117-loom-v0.26.3-installed-state --head-sha b80ad04dca532e4d26e2ef280f62df186f296fc3 --to 0.26.3 --json`; PR body/head readback.
- Closing Condition: PR #119 is merged into `main`, closeout evidence records PR/head/merge commit/hosted run, and issue #117 is closed.
- Current Checkpoint: build
- Current Stop: PR #119 is open for Loom v0.26.3 maintenance adoption. Repo changes are limited to installed-state metadata, workflow pin, and GH-117 Loom carriers.
- Next Step: Run current-head review, merge-ready, hosted gate, merge, and closeout for PR #119.
- Blockers: Hosted `loom-pr-merge-gate` previously blocked because the fact chain still pointed at GH-111; this carrier switches the fact chain to GH-117.
- Latest Validation Summary: `loom installed-state validate --target . --json` passed after the v0.26.3 upgrade; `loom doctor --target . --json` passed; `loom runtime-upgrade check --target . --item GH-117 --issue 117 --pr 119 --branch work/GH-117-loom-v0.26.3-installed-state --head-sha b80ad04dca532e4d26e2ef280f62df186f296fc3 --to 0.26.3 --json` passed with workflow version `0.26.3`; PR metadata preflight/readback passed for head `b80ad04dca532e4d26e2ef280f62df186f296fc3`; `git diff --check` passed. Review-readiness source-distribution tools are not applicable to this consumer repo because `tools/skills_surface.py` and `tools/loom_check.py` are absent.
- Recovery Boundary: Keep GH-117 limited to Loom maintenance adoption metadata and workflow pin refresh. Do not add product code, business behavior, unrelated specs, repo-local runtime/plugin payloads, or bootstrap residue repair.
- Current Lane: merge-ready

## Runtime Evidence

- Run Entry: not_applicable
- Logs Entry: not_applicable
- Diagnostics Entry: not_applicable
- Verification Entry: .loom/progress/GH-117.md
- Lane Entry: merge-ready

## Sources

- Static Truth: .loom/work-items/GH-117.md
- Dynamic Truth: .loom/progress/GH-117.md
- Locator Truth: .loom/bootstrap/init-result.json
- Fact Chain CLI: loom fact-chain --target . --json
