# Plan

## Implementation

- Add `docs/adr/0007-desktop-app-technical-baseline.md`.
- Update `README.md`, `docs/README.md`, and `docs/contracts/README.md` to point to ADR 0007.
- Update `AGENTS.md` with Desktop App stack, dependency, test, change-range, and security constraints.
- Add GH-75 item-specific Loom carrier files covering #74-#83.
- Sync `.loom/status/current.md` and the minimal `.loom/bootstrap/init-result.json` fact-chain entry points to GH-75 so local fact-chain and PR metadata consume the same active Work Item.
- Keep reviews, shared shadow carriers, workflows, code, package manifests, and other repositories unchanged.

## Validation

- `git diff --check`
- Markdown readability check for changed `.md` files.
- JSON readability check for changed `.json` files.
- `loom verify --target . --json`
- `loom fact-chain --target . --item GH-75 --json` when the local CLI supports item-specific readback; classify failure instead of rerunning blindly.
- PR body/head readback after PR creation.

## PR Ready

- Push `work/tech-baseline-app`.
- Create a PR against `main` using Refs, not auto-closing keywords.
- PR body must bind `Loom Work Item: GH-75`, branch, head SHA, docs-only suite rationale, and coverage for #74-#83.
- Do not merge the PR and do not close issues.
