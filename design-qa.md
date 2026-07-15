# Design QA

## Target

- Existing WebEnvoy Codex-like shell references:
  - `artifacts/app-265-packaged-readonly-smoke.png`
  - `artifacts/app-234-identity-page-browser.png`
  - `artifacts/gh-171-app-level-site-skill.png`
- Approved product inputs:
  - `docs/stories/APP-308.md`
  - `docs/design/human-workbench-information-architecture.md`

The target is the existing shell and interaction grammar, not a pixel clone of
the status-heavy production pages.

## Captures

Playwright captured and visually inspected desktop Work, Result Item, Browser,
Library and Settings states at 1440 x 960, plus the create-task flow at
820 x 720. The transient captures were removed after inspection; the runnable
prototype is the review artifact.

## Findings

- P0: none.
- P1: none.
- P2: none after correction.
- P3: the sample live-browser body is intentionally schematic because this
  prototype does not connect to a real site or runtime.

Verified corrections:

- The permanent evidence/runtime inspector is removed.
- No inactive Search or fake settings navigation remains.
- Structured results open a readable Result Item.
- Library site and business-tag filters work; `去使用` opens contract-driven
  task creation.
- Missing compatible identity opens creation with the target site selected and
  returns to the originating task form.
- Provider recovery changes the affected identity from repair-required to
  available after install and launch validation.
- Human takeover distinguishes view, control, user completion, validation and
  task resume.
- The 820 x 720 capture has no overlapping controls or clipped primary action.
- A fresh browser session has no console errors; the only console entry is the
  React development-mode informational message.

## Verification

```bash
npm run typecheck
npx vite build --config vite.prototype.config.ts
npm run build
git diff --check
```

All commands passed. Production runtime was not contacted.

final result: passed

This QA result does not constitute the required user approval for App #305.
