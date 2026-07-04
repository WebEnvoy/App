# Plan

## Steps

1. Read issue #170, comments, #93/#94/#95 closeout content, and GH-169 shell foundation.
2. Run targeted CodeGraph exploration for restored Codex thread layout / scroll / sticky footer and this repo's shell/thread implementation.
3. Capture a packaged Electron baseline screenshot before content migration.
4. Extract Task Thread content into WebEnvoy-native modules so `App.tsx` remains shell orchestration.
5. Migrate Task/Run/Evidence/Identity/Site Skill/Harbor Session content into the thread workspace, right inspector, navigation rail, and sticky composer.
6. Preserve app-level site skill/settings mutual exclusion and right panel boundaries from GH-169.
7. Build, run packaged smoke with after screenshot, update build evidence, and open a GH-170 PR.

## Ownership Constraints

- Main thread owns Loom carriers, PR metadata, screenshot evidence, commits, pushes, and issue reporting.
- No parallel writer owns `.loom/status/current.md`, `.loom/progress/**`, `.loom/reviews/**`, PR body, or issue state for GH-170.
- Code changes are limited to renderer Task Thread content/composition, renderer styles, screenshot artifacts, and GH-170 carriers.

## Validation

- `npm run build`
- `WEBENVOY_PACKAGED_SMOKE_SCREENSHOT=artifacts/gh-170-task-thread-migration.png npm run smoke:packaged`
- `git diff --check`
- `loom doctor --target . --json`
- `loom verify --target . --json`
- `loom fact-chain --target . --json`
- `loom suite validate --target . --item GH-170 --json`
- `loom suite carrier validate --target . --item GH-170 --json`
