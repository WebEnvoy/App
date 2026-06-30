# Plan

- Suite path: minimal

## Implementation

- Append a concise first read-only task journey and entry absorption section to `docs/adr/pending-decisions.md`.
- Create item-specific Loom carrier files under GH-13.
- Do not modify product code, UI skeletons, workflows, or external source locators.

## Validation

- `git diff --check`
- `loom doctor --target . --json`
- `loom verify --target . --json`
- `loom fact-chain --target . --json`
- `loom installed-state validate --target . --json`
- Direct hosted-style `loom_flow.py pr-gate check` after PR creation
- Hosted `py-compile`, `demo-bootstrap`, `repo-local-cli`, `loom-check`, and `loom-pr-merge-gate`
- Task carrier: `.loom/specs/GH-13/task-carrier.md`

## Minimal Path Applicability Records

- full-path-artifacts not_applicable rationale: this PR changes docs and item-specific Loom carrier files only; consumer boundary: downstream planning consumes boundary decisions and carrier metadata, not executable behavior; recheck condition: require full suite if code, schemas, API contracts, generated facts, UI behavior, fixtures, or workflow logic are added.

## Rollback

Revert this docs-only PR if the issue tree is split differently or an upstream owner changes the first read-only journey boundary before merge.
