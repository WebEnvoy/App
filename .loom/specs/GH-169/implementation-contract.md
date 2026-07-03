# Implementation Contract

## Allowed Files

- `src/renderer/App.tsx`
- `src/renderer/shellPrimitives.tsx`
- `src/renderer/styles.css`
- Smoke script change only if needed for GH-169 screenshot locator support.
- `artifacts/gh-169-codex-like-shell.png`
- `.loom/work-items/GH-169.md`, `.loom/progress/GH-169.md`, `.loom/status/current.md`, `.loom/specs/GH-169/**`, and later GH-169 review/build evidence carriers.

## Disallowed Changes

- No migration of #93/#94/#95 business content.
- No Stage 5, Library lifecycle, Browser management, write-side behavior, signing, auto-update, or live Core/Harbor/Lode calls.
- No credential, cookie, token, browser profile, raw evidence, Core Run Record, Harbor session, or Lode package truth persistence.
- No copy of Codex private runtime, VSCode host bridge, business semantics, or difficult-to-maintain restored code.

## Required PR Metadata

- `Loom Work Item: GH-169`
- `Covered Work Items: #169`
- `Refs #167 #169`
- `Out of scope: #170 content migration, #171 fidelity QA, Stage 5, live Core/Harbor/Lode`
- `Codex restored references`
- Screenshot evidence for Codex reference, `docs/design/desktop-task-thread-direction.png`, and this PR packaged Electron preview.
