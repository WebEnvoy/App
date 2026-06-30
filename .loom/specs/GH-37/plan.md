# Plan

- Suite path: minimal

## Implementation

- Add one App ADR for the Stage 2 task entry and display contract.
- Update `docs/adr/pending-decisions.md` with the accepted summary and research absorption boundary.
- Add item-specific GH-37 Loom carrier files.
- Update `.loom/status/current.md` to point at GH-37 for this active PR.
- Do not modify UI/code, App shell, schema/API/runtime/storage/evidence viewer/Settings implementation, Core/Harbor/Lode, issue state, or merge state.

## Validation

- `git diff --check`
- JSON validation for changed `.json` carrier files
- `loom fact-chain --target . --item GH-37 --json`
- `loom suite validate --target . --item GH-37 --json`
- `loom suite carrier validate --target . --item GH-37 --json`
- PR body readback for `Loom Work Item`, `Branch`, `Head SHA`, `Repository`, and Refs-only issue references
- Hosted basic checks after PR creation

## Minimal Path Applicability Records

- full-path-artifacts not_applicable rationale: this PR changes documentation and GH-37 item-specific Loom carrier files only.
- consumer boundary: downstream planning, ADR readers, GitHub issues, Loom validation/review, PR metadata, and hosted checks consume only the App Stage 2 display/entry contract and carrier metadata.
- recheck condition: switch to full suite if executable code, UI behavior, schema/API/runtime behavior, API client, storage, evidence viewer, Settings implementation, generated facts, shared fixture files, conformance runner, workflow logic, true-write behavior, external-visible behavior, merge, or issue closeout is added.

## Rollback

Revert this docs-only PR if upstream Core/Harbor/Lode ownership changes before merge or if App #36-#53/#55-#57/#59 are split into narrower Work Items that cannot share GH-37 as anchor.
