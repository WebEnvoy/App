# Spec

## Goal

Migrate the existing #93/#94/#95 Task Thread content into the GH-169 Codex-like shell so the packaged preview shows the full read-only task loop in the new structure.

## Required Behavior

- Preserve user-visible content from #93 shell, #94 read-only Task/Run view, and #95 evidence/source/session context.
- Keep WebEnvoy semantics explicit: Task, Run, Evidence, Identity, Site Skill, and Harbor Session.
- Show direct Identity Runtime Session as Browser/Harbor session context only, not as Core Task/Run/Result success.
- Keep Core task/run/result/failure, Lode package metadata, and Harbor session/provider facts as owner-attributed fixture projections.
- Use the Codex-like shell primitives from GH-169 rather than restoring the old card-heavy dashboard.
- Preserve thread scroll, content max-width, navigation rail, and sticky composer behavior in packaged Electron.
- Attach before/after packaged screenshots to the PR.

## Product Boundary

- GH-170 is fixture-only UI/content migration.
- No Stage 5 Library/Browser lifecycle, no live Core/Harbor/Lode, no write-side behavior, no workflow runtime/editor, no marketplace, and no App-owned truth for task/run/evidence/session/package.
- Current fixture functions and data structures are not real implementation contracts.

## Codex Restored Reference Requirement

- PR body must include `Codex restored references`.
- The section must list restored files/symbols explored, absorbed thread scroll/sticky footer/content-width mechanisms, non-absorbed runtime/product mechanisms, and why WebEnvoy semantics remain distinct.

## Acceptance Checks

- Existing #93/#94/#95 user-visible information remains present in the shell.
- `npm run build` passes.
- Packaged Electron smoke passes and captures a nonblank after screenshot.
- `git diff --check` passes.
- `loom doctor --target . --json`, `loom verify --target . --json`, and `loom fact-chain --target . --json` pass or any Loom tool-surface blocker is classified.

## Suite Applicability

- Suite path: minimal
- Artifact: fixture-only Task Thread content migration into confirmed shell.
- Rationale: GH-170 changes renderer composition, fixture presentation, and screenshot evidence only. It does not change owner API contracts, durable data, credentials, browser profile state, or runtime write behavior.
- Consumer boundary: This PR proves content migration into the shell, not final fidelity QA or live integration.
- Recheck condition: Require stronger suite artifacts before changing owner API calls, IPC payloads, persisted state contracts, security-sensitive data, or live runtime behavior.
- contracts.md not_applicable rationale: GH-170 consumes existing fixtures and renderer components; it does not change Core, Harbor, Lode, Electron preload API shape, IPC protocol, or owner API contracts.
- readiness-checklist.md not_applicable rationale: GH-170 readiness is covered by explicit acceptance checks for preserved #93/#94/#95 content, packaged screenshot, build, smoke, diff check, and Loom readback.
- research.md not_applicable rationale: GH-170 consumes issue requirements, GH-169 foundation, restored Codex CodeGraph exploration, and existing #93/#94/#95 closeout content rather than making a new product strategy decision.
- suite-index.md not_applicable rationale: the minimal suite is located by `.loom/specs/GH-170/spec.md`, `.loom/specs/GH-170/plan.md`, `.loom/specs/GH-170/implementation-contract.md`, `.loom/specs/GH-170/task-carrier.md`, and `.loom/specs/GH-170/build-evidence.json`.
