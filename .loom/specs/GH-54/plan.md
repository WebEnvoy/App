# Plan

- Suite path: minimal

## Implementation

- Add a small ADR for Library capability catalog fields v0.
- Update `docs/adr/pending-decisions.md` with the accepted summary and research absorption boundary.
- Add item-specific Loom carrier files under GH-54.
- Do not modify UI/code, App shell, catalog store, package schema, registry, installer, or unrelated issue carriers.

## Validation

- `git diff --check`
- JSON validation for `.loom/**/*.json`
- `loom fact-chain --target . --json`
- `loom suite validate --target . --json`
- `loom suite carrier validate --target . --json`
- Hosted basic checks after PR creation

## Minimal Path Applicability Records

- full-path-artifacts not_applicable rationale: this PR changes docs and item-specific Loom carrier files only.
- consumer boundary: downstream planning, ADR readers, Loom review, and hosted checks consume only the Library display contract and carrier metadata.
- recheck condition: switch to full suite if executable code, UI behavior, API/schema/runtime behavior, generated facts, package directories, fixtures, validators, workflow logic, marketplace, installer, registry, or external evidence capture is added.

## Rollback

Revert this docs-only PR if upstream Lode/Core/Harbor ownership changes before merge or if App #58 is split into a narrower Work Item.
