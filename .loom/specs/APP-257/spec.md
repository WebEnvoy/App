# Spec

## Governance

- Governance strength: strong-risk App Work Item because the change touches runtime startup supervision and production availability semantics.
- Suite path: minimal
- Full-path-artifacts not_applicable: rationale: this App batch adds shell/runtime supervision and fail-closed display behavior only. It does not change Core, Harbor, Lode, schemas, real accounts, evidence storage, true task execution, or external site actions. Consumer boundary: review must verify Core/Harbor runtime health/admission is visible and fixture/demo projections are never promoted to production availability or success. Recheck condition: upgrade if this PR adds real task submission, live account/profile operation, raw evidence rendering, Core/Harbor/Lode contract changes, packaging/release artifacts, or any external visible action.

## Goal

When users open the App without live Core/Harbor runtime, production/real mode must show runtime unavailable/repair state instead of presenting fixture/demo task, provider, identity, result, or write-precheck projections as usable or real success.

## Scope

- In scope: Electron main process supervisor for local Core/Harbor child processes; packaged/local/env launch config; health/admission probes; preload IPC; renderer runtime status; Task Thread fail-closed projection; Browser/identity fail-closed projection; Settings diagnostics; smoke coverage.
- Out of scope: Core/Harbor/Lode repository changes, Lode asset bundling #260, packaged vertical closeout evidence #261, true task submission, real Xiaohongshu/BOSS page access, real account/profile/Cookie use, raw evidence access/storage, submit/publish/send, PR creation, push, merge, or issue closeout.

## Upstream Truth Consumed

- App #256 corrective FR and comments read on 2026-07-08 UTC.
- App #257/#258/#259 Work Items read on 2026-07-08 UTC.
- Harbor #218 and Core #243 remain upstream blockers for full live runtime availability.
- Harbor runtime API is expected to expose local readiness endpoints and a local `pnpm start:runtime` start script.
- Core readiness/admission endpoints may still be pending; App must fail closed when they are unavailable.

## Acceptance Criteria

- [x] App main process can start configured local Core/Harbor runtime commands from env command/path/cwd or packaged runtime path.
- [x] App polls and displays Core health, Core admission, Harbor health, process state, and repair action.
- [x] If Core health/admission or Harbor health is unavailable, Task Thread projections become runtime-blocked and no fixture/demo result/write-precheck is shown as usable or real success.
- [x] If Harbor live identity facts are unavailable, Browser provider/identity/session entries become blocked and launch/task buttons are disabled.
- [x] Demo/fixture content remains present only as isolated metadata/fallback source text, not as production availability proof.
- [x] Focused validation covers runtime launch config resolution, fail-closed readiness, renderer fail-closed strings, and packaged Electron runtime gate rendering.
