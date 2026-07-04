# Plan

## Steps

1. Read issue #171, parent #167, `DESIGN.md`, `docs/adr/0008-desktop-ui-design-checkpoint.md`, and current shell implementation.
2. Run targeted CodeGraph exploration for restored Codex row/button/tab/card/right-panel density and this repo's shell primitives.
3. Compare current local preview against Codex screenshots/source and the current design contract.
4. Apply only bounded renderer fidelity fixes needed for #171.
5. Capture local browser screenshots and computed metrics for Task Thread, panel collapse, app-level site skill, and settings.
6. Run packaged Electron smoke with final screenshot.
7. Run local build, diff, Loom, and suite validation.
8. Commit, push, open PR, validate PR metadata/readback, pass hosted checks, merge, close #171, retire current pointer, and close #167 with post-merge evidence.

## Ownership Constraints

- Main thread owns Loom carriers, PR metadata, screenshot evidence, commits, pushes, issue closeout, and scheduler report.
- No parallel writer owns `.loom/status/current.md`, `.loom/progress/**`, `.loom/reviews/**`, PR body, or issue state for GH-171.
- Code changes are limited to renderer fidelity styling, screenshot/metrics artifacts, and GH-171 carriers.

## Validation

- `npm run build`
- `WEBENVOY_PACKAGED_SMOKE_SCREENSHOT=artifacts/gh-171-packaged-fidelity.png npm run smoke:packaged`
- `git diff --check`
- `loom doctor --target . --json`
- `loom verify --target . --json`
- `loom fact-chain --target . --json`
- `loom suite validate --target . --item GH-171 --json`
- `loom suite carrier validate --target . --item GH-171 --json`
- `loom suite evidence validate --target . --item GH-171 --json`
