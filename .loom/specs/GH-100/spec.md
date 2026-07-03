# Spec

## Goal

Create the minimum runnable desktop shell skeleton for WebEnvoy App using Electron, Vite, React, and TypeScript.

## Required Behavior

- Provide a package/script structure that can install dependencies and run or smoke-check the desktop shell locally.
- Separate Electron main, preload, and renderer entrypoints.
- Keep Electron main/preload limited to OS-bound shell concerns and local config boundary placeholders.
- Keep renderer ownership limited to UI shell entry, local UI state, and future owner API client consumption.
- Include a minimal visible renderer surface that proves the shell loads, without claiming to implement the final Task Thread UI.
- Leave a runnable check that can be used by CI or local validation for this skeleton.

## Product Boundary

- The skeleton must preserve the ADR 0008 Task Thread first direction.
- The skeleton must not regress into a Work/Library/Browser/Settings dashboard, Agent App, Browser tab, or arbitrary task launcher.
- The implementation may include naming/placeholders that reserve Task Thread first regions, but it must not implement #101, #102, #103, or #104 behavior.

## Non-Goals

- Do not implement real task submission, run views, result envelopes, evidence rendering, site skill source health, Settings connection config, Browser/Harbor session UI, Library management, workflow editor/runtime UI, signing, packaging, or auto-update.
- Do not store credential, cookie, token, browser profile storage, raw evidence, Core Run Record truth, Harbor runtime/session truth, or Lode package truth.
- Do not define App-owned task/run/result/evidence/capability/session truth.

## Acceptance Checks

- `git diff --check` passes.
- Existing relevant typecheck/build/smoke commands for the new skeleton pass.
- `loom doctor --target . --json`, `loom verify --target . --json`, and `loom fact-chain --target . --json` pass.
- The PR body, branch, head SHA, Work Item, and review artifact are aligned before merge-ready.

## Suite Applicability

- Suite path: minimal
- Artifact: GH-100 shell skeleton
- Rationale: Product implementation creates runnable project skeleton and must use normal build/typecheck/smoke validation.
- Consumer boundary: #101/#102/#103/#104 may consume this as shell foundation only, not as completed UI layout, source health, Settings, or Task Thread implementation.
- Recheck condition: Re-run shell build/smoke and Loom gates whenever package scripts, Electron boundaries, or renderer entrypoints change.
