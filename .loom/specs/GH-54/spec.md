# Spec

## Goal

Record the docs-only Library capability catalog fields v0 contract for App #58 / #54.

## Scope

- In scope: display fields, owner/consumer boundaries, local-only UI cache rules, unknown/redacted/unavailable display states, research absorption, and relation to Lode package minimum format v0.
- Out of scope: UI/code, App shell, catalog store, installer, marketplace, hosted registry, real package registry, package schema ownership, fixture execution, post-check execution, and issue closeout.

## Required Behavior

- App Library displays Lode/Core/Harbor upstream facts only; it does not own capability truth.
- The field contract covers display name, capability id, version/lock, family/tags, operation mode, lifecycle/deprecation/invalidation, resource requirement summary, fixture/post-check signals, and evidence/source reference display.
- Local storage is limited to non-sensitive UI preferences, rebuildable display cache, and pending local UI intent.
- `unknown`, `redacted`, `unavailable`, `metadata_missing`, and `invalid_contract` remain distinct states.
- The contract consumes Lode package minimum format v0 without promising marketplace, installer, hosted sync, or registry behavior.

## Suite Path

- Suite path: minimal
- Full suite artifacts not_applicable: rationale: this PR changes documentation and item-specific Loom carrier files only; consumer boundary: ADR readers, GitHub issues, Loom review, and hosted checks consume docs and carrier metadata, not executable schemas, runtime behavior, UI behavior, fixtures, or generated assets; recheck condition: require full suite if this PR adds code, UI, schemas, package directories, fixtures, validators, generated assets, workflow logic, installer/store behavior, hosted registry behavior, external writes, or user-facing runtime behavior.
