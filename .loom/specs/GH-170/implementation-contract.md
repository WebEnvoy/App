# Implementation Contract

## Allowed Files

- `src/renderer/App.tsx`
- `src/renderer/TaskThreadPage.tsx`
- `src/renderer/TaskThreadRightPanel.tsx`
- `src/renderer/TaskThreadComposer.tsx`
- `src/renderer/taskThreadFixtures.ts`
- `src/renderer/styles.css`
- `artifacts/gh-170-before-task-thread.png`
- `artifacts/gh-170-task-thread-migration.png`
- `.loom/work-items/GH-170.md`, `.loom/progress/GH-170.md`, `.loom/status/current.md`, `.loom/bootstrap/init-result.json`, `.loom/specs/GH-170/**`, and later GH-170 review/build evidence carriers.

## Disallowed Changes

- No Stage 5 Library lifecycle, Browser full management, workflow runtime/editor, marketplace, write-side behavior, signing, auto-update, or live Core/Harbor/Lode calls.
- No credential, cookie, token, browser profile, raw evidence, Core Run Record, Harbor session, or Lode package truth persistence.
- No copy of Codex private runtime, signal/store runtime, VSCode host bridge, business semantics, or difficult-to-maintain restored code.
- No claim that current fixtures define real function/data contracts.

## Required PR Metadata

- `Loom Work Item: GH-170`
- `Covered Work Items: #170`
- `Refs #167 #170`
- `Out of scope: #171 fidelity QA, Stage 5, live Core/Harbor/Lode`
- `Codex restored references`
- Screenshot evidence for migration baseline and after packaged Electron preview.
