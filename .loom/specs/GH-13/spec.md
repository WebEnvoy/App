# Spec

## Goal

Record the first low-risk read-only task journey and the minimum App consumption boundary for public task semantics.

## Scope

- In scope: docs-only boundary tables for App #12 through #23 and item-specific Loom carrier for GH-13.
- Out of scope: UI implementation, code skeletons, API/CLI/MCP platform implementation, schema ownership, Core Run Record truth, Harbor Runtime Session truth, Lode asset truth, and external UI shell migration.

## Required Behavior

- App presents submit intent, run status, result envelope, evidence refs, failure reason, and viewer/takeover entry from upstream facts.
- App defines minimum consumption needs for Core task/run/result/evidence/action request, Harbor session/evidence/viewer facts, and Lode capability metadata/result shape.
- Preview, draft, and approval request are displayed only as future/pending states, never as submitted results.
- External UI shells, hosted platform consoles, and independent App truth sources remain non-goals.

## Suite Path

- Suite path: minimal
- Full suite artifacts not_applicable: rationale: this PR changes documentation and item-specific Loom carrier files only; consumer boundary: review and merge gates consume `docs/adr/pending-decisions.md`, `.loom/work-items/GH-13.md`, `.loom/progress/GH-13.md`, and `.loom/specs/GH-13/*`; recheck condition: require full suite or stronger validation if this PR adds executable code, schema/API/runtime behavior, generated facts, fixtures, workflow logic, or user-facing UI behavior.
