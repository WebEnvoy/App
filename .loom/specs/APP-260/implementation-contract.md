# Implementation Contract

## Work Item

- Item: APP-260
- Anchor Issue: #260
- Parent FR: #256
- Covered Issues: #260, #261
- Branch: work/app-260-packaged-vertical-smoke
- Workspace: /Volumes/2T/dev/WebEnvoy/App.worktrees/app-260-packaged-vertical-smoke

## Approved Scope

- In Scope: App build-time Lode asset packaging, Electron Lode asset resolver, Core runtime env handoff, runtime readiness update, packaged smoke assertions, packaged vertical smoke evidence, and item-specific Loom carrier.
- Out Of Scope: Core/Harbor/Lode repo changes; real Core/Harbor binary packaging; hosted registry; Lode runtime server; live browser/profile/account/Cookie/site access; true task execution against production pages; submit/publish/send; raw evidence access/storage; release packaging/notarization.

## Runtime Config

- App packages sibling Lode JSON assets from `../Lode` or `WEBENVOY_LODE_ASSETS_SOURCE_DIR` into `dist-electron/lode` during `build:main`.
- Runtime Lode asset resolution order: `WEBENVOY_LODE_ASSETS_PATH`, Electron packaged resources `resources/lode`, build output next to `dist-electron/main.js`.
- Core child process receives `WEBENVOY_LODE_ASSETS_PATH` and `WEBENVOY_LODE_REGISTRY_PATH` only after the Lode bundle validates.

## Validation Plan

- loom doctor --target . --json
- loom verify --target . --json
- loom fact-chain --target . --json
- npm run typecheck
- npm run smoke
- npm run smoke:packaged
- npm run smoke:packaged:vertical
- git diff --check

## Risks And Rollback

- Risk: packaged production installer wiring may need an electron-builder/electron-forge resources mapping in a later release-packaging Work Item; this PR proves build-output and Electron smoke path, not notarized installer distribution.
- Risk: Core runtime may later require a different env name; App currently passes explicit `WEBENVOY_LODE_ASSETS_PATH` and `WEBENVOY_LODE_REGISTRY_PATH` and fails closed if owner runtime does not consume them.
- Rollback Boundary: revert this branch; no external account, profile, Cookie, production page, Core/Harbor/Lode truth, or external visible action is modified.
