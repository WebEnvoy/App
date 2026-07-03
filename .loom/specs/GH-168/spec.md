# Spec

## Goal

Fix packaged Electron preview startup so the renderer is visible and `window.webenvoyShell` is injected under `file://`.

## Required Behavior

- Vite packaged renderer assets load from the packaged HTML location, not root `/assets`.
- Electron preload injects `window.webenvoyShell` in packaged preview.
- A packaged smoke fails when `#root` is empty, preload is missing, or the renderer throws during startup.
- Packaged preview screenshot can be attached to the PR.

## Product Boundary

- GH-168 only repairs the packaged preview and smoke coverage.
- No UI redesign, Task Thread migration, Stage 5, or live Core/Harbor/Lode integration.
- Electron remains only the desktop carrier; it does not own task/run/result/evidence/session truth.

## Acceptance Checks

- `npm run build` passes.
- `npm run smoke:packaged` passes and checks non-empty renderer plus preload injection.
- `npm run smoke` passes.
- `npm audit --audit-level=high` passes.
- `git diff --check` passes.
- `loom doctor --target . --json`, `loom verify --target . --json`, and `loom fact-chain --target . --json` pass.

## Suite Applicability

- Suite path: minimal
- Artifact: packaged Electron preview repair and smoke.
- Rationale: This is a bounded desktop packaging/smoke fix with no owner API contracts, durable data, sensitive storage, or product semantics changes.
- Consumer boundary: Future #169/#170/#171 shell fidelity work must use their own carriers and must not treat this smoke as UI fidelity approval.
- Recheck condition: Require stronger suite artifacts if the PR adds live owner API calls, persistence, security-sensitive preload APIs, or product behavior beyond startup verification.
- contracts.md not_applicable rationale: GH-168 changes only packaged asset resolution and Electron preload loading; it does not change Core, Harbor, Lode, renderer data, IPC contract shape, or owner API contracts. Consumer boundary: do not treat the smoke-only `webenvoyShell` check as a new business protocol contract. Recheck condition: require contracts.md before adding or changing shell APIs beyond the existing local UI context bridge.
- readiness-checklist.md not_applicable rationale: GH-168 has explicit acceptance checks for packaged renderer visibility, preload injection, build, smoke, audit, diff check, and Loom readback. Consumer boundary: readiness is limited to packaged startup repair, not #169 shell direction or #170/#171 UI fidelity. Recheck condition: require readiness-checklist.md if the PR expands to shell primitives, Task Thread migration, or user-confirmed product direction.
- research.md not_applicable rationale: GH-168 consumes #167/#168 issue facts and does not make a new product or design decision. Consumer boundary: screenshot proves nonblank packaged preview only, not Codex-like desktop fidelity approval. Recheck condition: require research.md for #169 direction confirmation or any new product semantics.
- suite-index.md not_applicable rationale: the minimal suite is located by `.loom/specs/GH-168/spec.md`, `.loom/specs/GH-168/plan.md`, `.loom/specs/GH-168/implementation-contract.md`, `.loom/specs/GH-168/task-carrier.md`, and `.loom/specs/GH-168/build-evidence.json`. Consumer boundary: this omission applies only to the bounded GH-168 repair. Recheck condition: require suite-index.md if additional full-suite artifacts or cross-item suite navigation are introduced.
