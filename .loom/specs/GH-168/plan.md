# Plan

## Steps

1. Inspect the current Electron/Vite packaging path and smoke scripts.
2. Fix packaged renderer asset loading and preload injection at the shared startup boundary.
3. Add the smallest packaged smoke that fails on blank renderer, missing preload, or renderer startup error.
4. Build and run packaged preview/smoke.
5. Capture packaged preview screenshot.
6. Open a single GH-168 implementation PR with required metadata and evidence.

## Ownership Constraints

- Main thread owns Loom carriers, PR metadata, commits, pushes, screenshots, and GitHub state.
- No parallel writer owns `.loom/status/current.md`, `.loom/progress/**`, `.loom/reviews/**`, PR body, or issue state for GH-168.
- Code changes are limited to Electron/Vite packaging and packaged smoke coverage.

## Validation

- `npm run build`
- `npm run smoke:packaged`
- `npm run smoke`
- `npm audit --audit-level=high`
- `git diff --check`
- `loom fact-chain --target . --json`
- `loom doctor --target . --json`
- `loom verify --target . --json`
