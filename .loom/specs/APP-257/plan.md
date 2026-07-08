# Plan

## Implementation Goal

Deliver one App-only worker batch for milestone #14 corrective FR #256, anchored on #257 and covering #258/#259.

## Phases

### Phase 1

- Objective: Add local runtime supervision without new dependencies.
- Deliverable: Electron main `runtimeSupervisor.ts`, IPC handler, and preload bridge.
- Exit condition: configured env command/path/cwd or packaged runtime path can be started, probed, and summarized.

### Phase 2

- Objective: Make health/admission visible and fail closed.
- Deliverable: renderer runtime state, Task Thread runtime strip, right-panel source health, Settings diagnostics, and runtime-blocked task projection.
- Exit condition: unavailable Core/Harbor runtime blocks task/result/write-precheck success display.

### Phase 3

- Objective: Stop Browser/identity fixture availability leakage.
- Deliverable: identity runtime gate projection and disabled provider/session/task controls when Harbor live identity facts are absent.
- Exit condition: fixture/demo provider, identity, session, and task entries do not display as production usable.

### Phase 4

- Objective: Keep validation focused and local.
- Deliverable: smoke checks plus APP-257 Loom carrier.
- Exit condition: `loom doctor --target . --json`, `loom verify --target . --json`, `loom fact-chain --target . --json`, `npm run typecheck`, `npm run smoke`, `npm run smoke:packaged`, and `git diff --check` pass.

## Constraints

- Do not modify Core, Harbor, or Lode repositories.
- Do not write GitHub issues, PRs, milestones, dependencies, or comments.
- Do not access real external sites, real accounts, real profiles, Cookies, production pages, submit/publish/send, or any external visible action.
- Do not save credential, token, Cookie, profile storage, raw evidence, DOM, HAR, trace, video, or downloaded content.

## Validation

- loom doctor --target . --json
- loom verify --target . --json
- loom fact-chain --target . --json
- npm run typecheck
- npm run smoke
- npm run smoke:packaged
- git diff --check
