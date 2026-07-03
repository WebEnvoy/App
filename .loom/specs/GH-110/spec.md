# Spec

## Goal

Deliver the #95 evidence, site skill source, Browser session reference, and vertical read-only smoke batch with one GH-110 implementation PR covering #110, #111, #112, and #113.

## Required Behavior

- Render result evidence cards in the right context panel with type, owner, captured time, retention/redaction state, and viewer link availability.
- Keep evidence ref-only by default; do not read or persist raw evidence bodies.
- Render site skill/package attribution from Lode/Core references: package id, version, source, lifecycle, and resource summary.
- Render Browser execution-site references from Harbor facts: session, provider, viewer/control availability, and unavailable reasons.
- Keep Browser/source health and direct sessions separate from Core task outcome.
- Extend the read-only vertical smoke so one fixture path proves Task Thread, Run, result, evidence, package source, and execution-site references together.

## Product Boundary

- GH-110 uses local fixture projections shaped as Core/Lode/Harbor owner facts; it does not call production Core, Harbor, or Lode.
- App may keep transient UI state and non-sensitive display projections only.
- Site skill attribution consumes Lode capability/package metadata only; workflow package/runtime/editor remains later work.

## Non-Goals

- Do not implement Stage 5 Library capability lifecycle, marketplace, install/update/repair, workflow runtime/editor, write-side behavior, full Browser management, signing, packaging, or auto-update.
- Do not store credentials, cookies, tokens, browser profile storage, raw evidence, Core Run Record truth, Harbor session truth, or Lode package truth.
- Do not expose raw CDP/VNC/provider private endpoints.

## Acceptance Checks

- `npm run typecheck` passes.
- `npm run smoke` passes and verifies evidence card, viewer link, package attribution, Browser session/provider facts, and the vertical read-only demo path.
- `npm audit --audit-level=high` passes.
- `git diff --check` passes.
- `loom doctor --target . --json`, `loom verify --target . --json`, and `loom fact-chain --target . --json` pass.
- PR metadata binds `Loom Work Item: GH-110`, `Covered Work Items: #110, #111, #112, #113`, `Refs #95 #110 #111 #112 #113`, and `Out of scope: Stage 5, Library lifecycle, write-side, full Browser management`.

## Suite Applicability

- Suite path: minimal
- Artifact: GH-110 read-only evidence/context batch.
- Rationale: This is a bounded renderer/fixture implementation for #95 and does not introduce live owner API calls, durable App-owned evidence/session/package truth, sensitive storage, or write-side behavior.
- Consumer boundary: Future Stage 5 Library/Browser lifecycle work must create its own carrier and must not treat GH-110 fixtures as owner truth.
- Recheck condition: Require stronger suite artifacts if the PR adds live owner API calls, new evidence/session/package schema, persistence contracts, sensitive storage, raw evidence retrieval, or write-side behavior.
