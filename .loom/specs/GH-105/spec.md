# Spec

## Goal

Deliver the #94 read-only Task Thread batch with one GH-105 implementation PR covering #105, #106, #107, #108, and #109.

## Required Behavior

- Provide a read-only task creation entry that combines site skill, account identity, and business input.
- Make unavailable/blocker states visible when the selected site skill, account identity, or Core source is unavailable.
- Render Run navigation and Core-owned run lifecycle projections without creating an App-owned status machine.
- Render task completion reports and structured result projections for success, empty, partial, and failure-safe fixture states.
- Render failure, unavailable, expired, redacted, and unknown outcome states without locally converting them to success.
- Keep direct Identity Runtime Session separate from Core task results; direct sessions must not create Core Task/Run/Result UI.

## Product Boundary

- GH-105 uses local Core/Lode/Harbor-facing fixtures or adapter-shaped projections only; it does not call production Core, Harbor, or Lode.
- App may keep transient UI state, selected fixture state, and non-sensitive display projections only.
- Lode site skill selection currently consumes capability/package metadata; workflow package support remains a later extension.
- Result evidence/source/session reference cards that belong to #95 remain limited to entry points or placeholders, not full #110-#113 implementation.

## Non-Goals

- Do not implement #110 through #113 or close #95.
- Do not implement write-side behavior, full Library, full Browser management, workflow runtime/editor UI, signing, packaging, or auto-update.
- Do not store credentials, cookies, tokens, browser profile storage, raw evidence, Core Run Record truth, Harbor session truth, or Lode package truth.
- Do not introduce a new dependency unless an already-installed dependency cannot cover the UI.

## Acceptance Checks

- `npm run typecheck` passes.
- `npm run smoke` passes and verifies task creation, run navigation, result, failure, unavailable, redacted/expired, and direct-session separation strings.
- `npm audit --audit-level=high` passes.
- `git diff --check` passes.
- `loom doctor --target . --json`, `loom verify --target . --json`, and `loom fact-chain --target . --json` pass.
- PR metadata binds `Loom Work Item: GH-105`, `Covered Work Items: #105, #106, #107, #108, #109`, `Refs #94 #105 #106 #107 #108 #109`, and `Out of scope: #110-#113`.

## Suite Applicability

- Suite path: minimal
- Artifact: GH-105 read-only Task Thread batch.
- Rationale: This PR is a bounded renderer/fixture implementation for #94 and does not introduce live owner API calls, durable App-owned task/run/result truth, Harbor runtime control, Lode package truth, or write-side behavior.
- Consumer boundary: #110-#113 may consume result/evidence/session entry points only after their own GH-110+ carrier defines the #95 source/evidence/browser reference behavior.
- Recheck condition: Require stronger suite artifacts if the PR adds live owner API calls, new task/run/result/evidence/session/package schema, persistence contracts, sensitive storage, or write-side behavior.
- contracts.md not_applicable rationale: GH-105 consumes fixture-shaped Core/Lode/Harbor projections and does not change owner API contracts; consumer boundary: do not treat fixture field names as owner schema truth; recheck condition: require contracts.md before wiring live Core/Harbor/Lode fields.
- readiness-checklist.md not_applicable rationale: GH-105 is a bounded #94 batch with explicit acceptance checks; consumer boundary: readiness is limited to local read-only task/run/result/failure UI, not the full milestone; recheck condition: require readiness-checklist.md if the PR claims #95 or milestone completion.
- research.md not_applicable rationale: GH-105 consumes accepted ADR 0008, DESIGN.md, VISION.md, and GitHub issue bodies; no new product research decision is made; consumer boundary: fixture examples are not research conclusions; recheck condition: require research.md for new product direction or owner contract interpretation.
- suite-index.md not_applicable rationale: the minimal suite is located by `.loom/specs/GH-105/spec.md`, `.loom/specs/GH-105/plan.md`, `.loom/specs/GH-105/implementation-contract.md`, `.loom/specs/GH-105/build-evidence.json`, and `.loom/specs/GH-105/task-carrier.md`; consumer boundary: this omission applies only to the minimal GH-105 batch; recheck condition: require suite-index.md if additional full-suite artifacts or cross-item suite navigation are introduced.
