# Spec

## Goal

Record the docs-only App Stage 2 task entry and display contract covering App #36-#53, #55-#57, and #59.

## Scope

- In scope: Task submission intent, input summary, scope, read-only scope, cancel/retry/resubmit, App no-Run-Record boundary, shared entry fixture/conformance consumption, run viewer facts, result/failure/evidence display, action request display, Browser runtime/viewer/handoff facts, Settings/local-only cache boundary, upstream fact consumption, and research absorption.
- Out of scope: UI code, App shell, schema/API/runtime/storage implementation, API client, evidence viewer, Settings implementation, shared fixture files, conformance runner, Core/Harbor/Lode changes, true-write behavior, merge, and issue closeout.

## Required Behavior

- App displays and submits intent against Core/Harbor/Lode owner facts; App does not create a second task, run, result, runtime, evidence, or package truth source.
- ADR 0006 must consume Core PR #63/#65/#67, Harbor PR #58, and Lode PR #60 as upstream truth.
- App task submission must map to Core shared Task Intent Envelope fields and must explicitly keep invalid/private-field failures outside Run Record creation.
- Run viewer must distinguish owner run status/timeline/query facts from local loading, polling, empty, expired, connection health, and session unavailable states.
- Result/failure display must use Core Result Envelope, failure taxonomy, and recovery hints; preview, draft, and validate-only must not enter result history.
- Evidence display must distinguish evidence card fields, redacted, expired, unavailable, thumbnail, source trace, and viewer link states without storing raw evidence.
- Action request display must include approval request, approve/decline/cancel intent, risk, expected change, and expiry, while leaving execution to owner APIs.
- Browser/Settings boundaries must keep runtime/viewer/handoff facts in Harbor/Core and local settings/cache in App as non-sensitive, rebuildable UI state.
- Research absorption must state what is absorbed, trimmed, reference-only, and rejected for MVP.

## Suite Path

- Suite path: minimal
- Full suite artifacts not_applicable: rationale: this PR changes Markdown contracts and GH-37 item-specific Loom carrier files only; consumer boundary: ADR readers, GitHub issues, Loom validation/review, PR metadata, and hosted checks consume docs and carrier metadata, not executable schemas, runtime behavior, UI behavior, fixtures, validators, generated assets, or external writes; recheck condition: require full suite if this PR adds code, UI, schemas, API client, runtime/storage behavior, evidence viewer, Settings implementation, shared fixture files, conformance runner, generated facts, workflow logic, true-write behavior, external-visible behavior, merge, or issue closeout.
