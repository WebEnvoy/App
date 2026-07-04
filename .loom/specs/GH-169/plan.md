# Plan

## Steps

1. Read AGENTS, VISION, DESIGN, ADR 0008, issue #169, and design screenshot requirement.
2. Run targeted CodeGraph exploration on restored Codex source and this repo.
3. Add WebEnvoy-native shell primitives with the required exported names.
4. Recompose the existing fixture UI into the shell primitives without migrating #93/#94/#95 content.
5. Tighten desktop density, focus areas, right inspector tabs, right panel resize, and sticky bottom slot.
6. Build and run packaged Electron smoke.
7. Capture packaged screenshot and open a GH-169 direction confirmation PR.

## Ownership Constraints

- Main thread owns Loom carriers, PR metadata, screenshot evidence, commits, pushes, and direction-confirmation reporting.
- No parallel writer owns `.loom/status/current.md`, `.loom/progress/**`, `.loom/reviews/**`, PR body, or issue state for GH-169.
- Code changes are limited to renderer shell primitives, renderer layout/styles, optional smoke screenshot path support, packaged screenshot artifact, and GH-169 carriers.

## Validation

- `npm run typecheck`
- `npm run smoke:packaged`
- `git diff --check`
- `loom doctor --target . --json`
- `loom verify --target . --json`
- `loom fact-chain --target . --json`
