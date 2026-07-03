# Spec

## Goal

Deliver the #93 shell batch with one GH-101 implementation PR covering #101, #102, #103, and #104.

## Required Behavior

- Add only the Radix UI and lucide-react primitives needed by the Task Thread shell.
- Show Core, Harbor, and Lode source health using local fixture data only.
- Provide a Settings local connection configuration boundary for endpoint choices only.
- Render the Task Thread first base shell: account identity / site skill / Task organization, middle Task Thread frame, right context tabs, and bottom task action area.
- Preserve Electron main and preload as OS/local-shell boundaries only.

## Product Boundary

- GH-101 does not submit tasks, create Core runs, display real results, display real evidence, or execute Lode capabilities.
- direct Identity Runtime Session belongs to Browser/Harbor session management and does not create Core Task/Run/Result.
- Task Thread result/evidence/failure appears only after a Core task path exists in later Work Items.
- Lode source display currently consumes capability package metadata; workflow package support is a later extension.

## Non-Goals

- Do not implement #105 through #113.
- Do not make real Core, Harbor, or Lode calls.
- Do not implement write-side behavior, full Library, full Browser management, workflow runtime/editor UI, signing, packaging, or auto-update.
- Do not store credentials, cookies, tokens, browser profile storage, raw evidence, Core Run Record truth, Harbor session truth, or Lode package truth.

## Acceptance Checks

- `npm run typecheck` passes.
- `npm run smoke` passes and verifies the built Task Thread shell strings.
- `npm audit --audit-level=high` passes.
- `git diff --check` passes.
- `loom doctor --target . --json`, `loom verify --target . --json`, and `loom fact-chain --target . --json` pass.
- PR metadata binds `Loom Work Item: GH-101`, `Covered Work Items: #101, #102, #103, #104`, `Refs #93 #101 #102 #103 #104`, and `Out of scope: #105-#113`.

## Suite Applicability

- Suite path: minimal
- Artifact: GH-101 desktop shell batch.
- Rationale: This PR is a bounded shell/layout/fixture/config implementation and does not introduce owner API contracts, runtime data contracts, or real Core/Harbor/Lode integration.
- Consumer boundary: #105-#113 may consume the shell frame, local fixture projection, Settings local boundary, and context tab structure only.
- Recheck condition: Require stronger suite artifacts if the PR adds real owner API calls, task/run/result/evidence semantics, package truth, Harbor runtime control, storage of sensitive data, or write-side behavior.
- contracts.md not_applicable rationale: GH-101 does not introduce or change Core, Harbor, Lode, or App-facing API/schema contracts; consumer boundary: reviewers and follow-on Work Items may consume only the documented owner-boundary statements, not a new contract; recheck condition: require contracts.md if live owner API fields, task/run/result/evidence/session/package schema, or persistence contracts are added.
- readiness-checklist.md not_applicable rationale: GH-101 is a bounded shell batch with explicit acceptance checks in this spec and plan; consumer boundary: readiness is limited to local shell build/smoke/audit/diff/Loom checks, not full milestone readiness; recheck condition: require readiness-checklist.md if the PR claims #93 parent closeout, #94/#95 behavior, or end-to-end user workflow readiness.
- research.md not_applicable rationale: GH-101 consumes accepted ADR 0008 and existing design docs; no new research decision is made; consumer boundary: do not treat fixture values or UI copy as research conclusions; recheck condition: require research.md if new product direction, information architecture, dependency choice, or owner API interpretation is introduced.
- suite-index.md not_applicable rationale: the minimal suite is fully located by `.loom/specs/GH-101/spec.md`, `.loom/specs/GH-101/plan.md`, `.loom/specs/GH-101/implementation-contract.md`, `.loom/specs/GH-101/build-evidence.json`, and `.loom/specs/GH-101/task-carrier.md`; consumer boundary: this index omission applies only to the minimal GH-101 shell batch; recheck condition: require suite-index.md if additional full-suite artifacts or cross-item suite navigation are introduced.
