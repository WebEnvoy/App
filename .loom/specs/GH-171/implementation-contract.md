# Implementation Contract

## Allowed Files

- `src/renderer/styles.css`
- `artifacts/gh-171-fidelity-tabs-after.png`
- `artifacts/gh-171-fidelity-tabs-after-metrics.json`
- `artifacts/gh-171-right-collapsed.png`
- `artifacts/gh-171-right-collapsed-metrics.json`
- `artifacts/gh-171-left-collapsed.png`
- `artifacts/gh-171-left-collapsed-metrics.json`
- `artifacts/gh-171-app-level-site-skill.png`
- `artifacts/gh-171-app-level-site-skill-metrics.json`
- `artifacts/gh-171-settings-app-level.png`
- `artifacts/gh-171-settings-app-level-metrics.json`
- `artifacts/gh-171-packaged-fidelity.png`
- `.loom/work-items/GH-171.md`, `.loom/progress/GH-171.md`, `.loom/status/current.md`, `.loom/bootstrap/init-result.json`, `.loom/specs/GH-171/**`, and later GH-171 review/build evidence carriers.

## Disallowed Changes

- No new feature surface or product behavior.
- No Stage 5 Library / Browser / Work lifecycle.
- No live Core/Harbor/Lode calls, owner API contract changes, IPC/preload shape changes, persistence contract changes, or write-side behavior.
- No credential, cookie, token, browser profile, raw evidence, Core Run Record, Harbor session, or Lode package truth persistence.
- No copy of Codex private runtime, signal/store runtime, VSCode host bridge, business semantics, or difficult-to-maintain restored code.
- No claim that current fixtures define real function/data contracts or final production UX.

## Required PR Metadata

- `Loom Work Item: GH-171`
- `Covered Work Items: #171`
- `Refs #167 #171`
- `Out of scope: new features, Stage 5, live Core/Harbor/Lode, real data contracts`
- `Codex restored references`
- Screenshot and computed metrics evidence for final packaged/local previews.
