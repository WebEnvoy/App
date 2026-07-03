# Plan

## Steps

1. Inspect the existing repository structure and package state.
2. Add the smallest Electron/Vite/React/TypeScript skeleton that matches the repository technical baseline.
3. Add scripts for local development/build/smoke without introducing unrelated tooling.
4. Verify Electron main/preload do not carry task/run/result/evidence/capability/recovery business protocol truth.
5. Run the minimum relevant validation commands and record results in `.loom/specs/GH-100/build-evidence.json`.
6. Create/update the PR with GH-100 metadata and keep branch/head/review bindings consistent.

## Risks

- Installing dependencies may require choosing package manager defaults for a repo that has not yet formed an execution surface.
- The shell skeleton must stay below #101/#102/#103/#104 scope even if placeholder UI makes future layout obvious.
- The Electron layer must not become a shortcut around Core, Harbor, or Lode owner APIs.
