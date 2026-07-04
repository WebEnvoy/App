# Spec

## Goal

Complete the #171 fidelity QA pass for the Desktop Task Thread shell so #167 can close with concrete screenshot, metrics, packaged smoke, and carrier evidence.

## Required Behavior

- Keep the Desktop Task Thread shell aligned to the Codex-like foundation already established by #169 and populated by #170.
- Right inspector tabs should use a dense, readable, underline-like tab treatment rather than a cramped pill strip.
- Right inspector content should leave enough spacing for scanning without reverting to card-heavy dashboard density.
- Sidebar rows, hover, selected state, status glyph placement, footer, and task tree density should remain Codex-like and token-driven.
- Main thread width, scroll behavior, navigation rail, sticky composer, and composer icon preservation should remain stable at narrow widths.
- Left/right panel collapse, resize, remembered widths, topbar relationship, and app-level page mutual exclusion should remain stable.
- Site skill discovery/detail and settings remain app-level pages: left navigation can stay, but the Task Thread right panel and right panel controls must not coexist with those pages.
- Final PR body must include screenshots, metrics, QA conclusion, and `Codex restored references`.

## Product Boundary

- GH-171 is a fidelity QA and fixture-shell polish item.
- No new product feature, no Stage 5 Library/Browser/Work implementation, no live Core/Harbor/Lode calls, no write-side behavior, no credentials/profile/raw evidence persistence.
- Current fixtures and UI data structures are early architecture scaffolding only; future feature/data integration still requires UI design, review, and walkthrough.
- Do not claim pixel-perfect parity with Codex; claim only bounded Codex-style shell fidelity evidence for this early architecture state.

## Codex Restored Reference Requirement

- PR body must include `Codex restored references`.
- The section must list restored files/symbols explored, absorbed row/button/tab/card/panel mechanisms, non-absorbed runtime/product mechanisms, and why WebEnvoy semantics remain distinct.

## Acceptance Checks

- User has confirmed GH-169 direction and the early-architecture caveat before final closeout.
- Final packaged Electron smoke passes and captures a nonblank screenshot.
- Local screenshot/metrics evidence covers default Task Thread, right collapse, left collapse, site skill app-level page, and settings app-level page.
- `npm run build` passes.
- `git diff --check` passes.
- `loom doctor --target . --json`, `loom verify --target . --json`, and `loom fact-chain --target . --json` pass or any Loom tool-surface blocker is classified.

## Suite Applicability

- Suite path: minimal
- Artifact: fixture-only renderer fidelity QA and screenshot/metrics evidence.
- Rationale: GH-171 changes renderer CSS, screenshots/metrics, and carrier evidence only. It does not change owner API contracts, durable data, credentials, browser profile state, IPC/preload shape, packaged asset loading behavior, or runtime write behavior.
- Consumer boundary: This PR proves bounded Desktop Task Thread fidelity for the current fixture shell, not final product functionality or real data contracts.
- Recheck condition: Require stronger suite artifacts before changing owner API calls, IPC payloads, persisted state contracts, security-sensitive data, or live runtime behavior.
- contracts.md not_applicable rationale: GH-171 does not change Core, Harbor, Lode, Electron preload API shape, IPC protocol, or owner API contracts.
- readiness-checklist.md not_applicable rationale: GH-171 readiness is covered by explicit visual/metrics acceptance checks, packaged screenshot, build, smoke, diff check, and Loom readback.
- research.md not_applicable rationale: GH-171 consumes issue requirements, user direction confirmation, `DESIGN.md`, restored Codex CodeGraph exploration, and existing shell implementation rather than making a new product strategy decision.
- suite-index.md not_applicable rationale: the minimal suite is located by `.loom/specs/GH-171/spec.md`, `.loom/specs/GH-171/plan.md`, `.loom/specs/GH-171/implementation-contract.md`, `.loom/specs/GH-171/task-carrier.md`, `.loom/specs/GH-171/evidence-map.md`, and `.loom/specs/GH-171/build-evidence.json`.
