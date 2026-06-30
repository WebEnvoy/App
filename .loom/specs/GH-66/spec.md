# Spec

## Goal

Close out the App docs draft milestone by defining minimal docs directory semantics, lifecycle rules for `docs/draft`, and a complete disposition table for current draft files.

## Scope

- In scope: `docs/README.md`, `docs/contracts/README.md`, `docs/draft/README.md`, current `docs/draft/*.md` pointer/deferred pages, and GH-66 Loom carrier.
- Out of scope: product behavior changes, UI/App shell/runtime/storage/schema/API/generated facts/fixtures, executable validation suites, issue closeout, merge, and other repositories.

## Required Behavior

- `docs/` directory semantics define `adr`, `contracts`, and `draft`.
- No empty `docs/guides/` is created.
- `docs/draft/README.md` states that drafts must be short-lived and carry status, owner, linked issue, and exit condition.
- Every current `docs/draft/*.md` appears in a disposition table with file, current use, status, target location, linked issue, and action.
- Status values are limited to `promoted`, `pending`, `deferred`, `removed`, and `pointer`.
- Stage 2 accepted task entry, run/result/evidence/action/Browser/Settings display facts point to accepted ADRs/contracts instead of keeping duplicate draft truth.
- Pending/deferred drafts include owner, linked issue, and exit condition.

## Suite Path

- Suite path: minimal
- Full suite artifacts not_applicable: rationale: this PR changes documentation and item-specific Loom carrier files only; consumer boundary: ADR readers, docs readers, GitHub issues, Loom review, and hosted checks consume docs and carrier metadata, not executable schemas, runtime behavior, UI behavior, fixtures, generated facts, storage, API behavior, or product behavior; recheck condition: require stronger validation if this PR or a follow-up PR adds code, schema, API, runtime, generated facts, fixtures, behavior changes, UI/App shell, storage, workflow logic, external writes, or user-facing runtime behavior.
