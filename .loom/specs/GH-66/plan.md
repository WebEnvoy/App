# Plan

- Suite path: minimal

## Implementation

- Add `docs/README.md` with minimal directory semantics for `adr`, `contracts`, and `draft`.
- Add `docs/contracts/README.md` as a short index to accepted ADR contracts.
- Rewrite `docs/draft/README.md` with lifecycle rules and the complete draft disposition table.
- Replace duplicated accepted draft content with short pointers.
- Mark non-current Library workbench and local runtime material as deferred with owner, linked issue, and exit condition.
- Add item-specific GH-66 Loom carrier files and update `.loom/status/current.md`.
- Add a minimal evidence map for the docs-only behavior evidence, validation evidence, and fresh verification input.

## Validation

- `git diff --check`
- Validate `.loom/**/*.json` with `jq`
- `loom fact-chain --target . --item GH-66 --json`
- `loom suite validate --target . --item GH-66 --json`
- `loom suite carrier validate --target . --item GH-66 --json`
- `loom suite evidence validate --target . --item GH-66 --json`
- Hosted checks after PR creation

## Minimal Path Applicability Records

- full-path-artifacts not_applicable rationale: this PR changes docs and item-specific Loom carrier files only.
- consumer boundary: downstream planning, docs readers, Loom review, GitHub issue/PR metadata, and hosted checks consume only documentation and carrier metadata.
- recheck condition: switch to stronger validation if executable code, UI behavior, API/schema/runtime behavior, generated facts, fixtures, validators, workflow logic, storage, App shell behavior, external evidence capture, or product behavior is added.

## Rollback

Revert this docs-only PR if the docs draft closeout issue tree changes before merge or if accepted Stage 2 contracts move to a different authority.
