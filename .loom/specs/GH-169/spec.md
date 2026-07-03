# Spec

## Goal

Build a Codex-like desktop shell spike that can be reviewed in packaged Electron before Task Thread content migration.

## Required Behavior

- Provide WebEnvoy-native shell primitives named `AppShell`, `LeftPanel`, `ThreadWorkspace`, `RightPanel`, `BottomPanelSlot`, `PanelTabs`, `ResizablePanel`, and `FocusArea`.
- Present the existing fixture data inside a desktop workbench structure: left navigation, central thread workspace, right inspector, panel tabs, sticky bottom action slot, focus area markers, and resizable right panel.
- Use fixture data only. Do not migrate #93/#94/#95 business content.
- Preserve WebEnvoy semantics for Task, Run, Evidence, Identity, Site Skill, and Harbor Session labels where fixture content is shown.
- Produce a packaged Electron screenshot for direction confirmation.

## Product Boundary

- GH-169 is a direction-confirmation spike only.
- No Stage 5, no live Core/Harbor/Lode, no Library/Browser full management surfaces, no private Codex runtime or business semantics.
- #170 must not start until user or scheduler confirms the #169 direction.

## Codex Restored Reference Requirement

- PR body must include `Codex restored references`.
- The section must list restored symbols/files explored, mechanisms absorbed, mechanisms not absorbed, and why this lowers direction mismatch risk.

## Acceptance Checks

- `npm run typecheck` passes.
- `npm run smoke:packaged` passes and captures a nonblank packaged Electron screenshot.
- `git diff --check` passes.
- `loom doctor --target . --json`, `loom verify --target . --json`, and `loom fact-chain --target . --json` pass or any Loom tool-surface blocker is classified.

## Suite Applicability

- Suite path: minimal
- Artifact: fixture-only desktop shell spike and packaged screenshot.
- Rationale: GH-169 changes UI structure and local renderer primitives only; it does not change owner API contracts, durable data, credentials, browser profile state, or runtime write behavior.
- Consumer boundary: This spike confirms shell direction only. #170 must use its own carrier before migrating Task Thread content.
- Recheck condition: Require stronger suite artifacts if the PR adds live owner API calls, persistence, security-sensitive shell APIs, or migrated business workflows.
- contracts.md not_applicable rationale: GH-169 adds fixture-only renderer shell primitives and does not change Core, Harbor, Lode, Electron preload API shape, IPC protocol, or owner API contracts. Consumer boundary: do not treat `AppShell`/panel primitives as a business protocol contract. Recheck condition: require contracts.md before changing shell API exposure, owner API calls, IPC payloads, or persisted state contracts.
- readiness-checklist.md not_applicable rationale: GH-169 readiness is covered by explicit acceptance checks for primitives, fixture-only boundary, packaged screenshot, typecheck, packaged smoke, diff check, and Loom readback. Consumer boundary: readiness is limited to direction confirmation, not #170 content migration or #171 fidelity QA. Recheck condition: require readiness-checklist.md if the PR expands to migrated workflows, keyboard completeness, live data, or closeout QA.
- research.md not_applicable rationale: GH-169 consumes the issue requirements, VISION/DESIGN/ADR direction, `docs/design/desktop-task-thread-direction.png`, and targeted CodeGraph restored exploration; it does not make a new product strategy decision beyond the requested shell spike. Consumer boundary: the CodeGraph reference section in the PR body is the research evidence for this spike only. Recheck condition: require research.md if direction changes beyond Codex-like shell primitives or if user feedback asks for a different IA.
- suite-index.md not_applicable rationale: the minimal suite is located by `.loom/specs/GH-169/spec.md`, `.loom/specs/GH-169/plan.md`, `.loom/specs/GH-169/implementation-contract.md`, `.loom/specs/GH-169/task-carrier.md`, and `.loom/specs/GH-169/build-evidence.json`. Consumer boundary: this omission applies only to the bounded GH-169 spike. Recheck condition: require suite-index.md if additional full-suite artifacts or cross-item suite navigation are introduced.
