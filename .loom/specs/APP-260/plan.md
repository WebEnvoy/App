# Plan

## Implementation Goal

Deliver one App batch for milestone #14 corrective FR #256, anchored on #260 and covering #261.

## Phases

### Phase 1

- Objective: Package Lode assets into App build output.
- Deliverable: `scripts/package-lode-assets.mjs` and `build:main` integration.
- Exit condition: build output contains `dist-electron/lode/registry/local-packages.json` and required Xiaohongshu/BOSS site package JSON files.

### Phase 2

- Objective: Resolve and validate packaged/local Lode assets at runtime.
- Deliverable: `src/electron/lodeAssetBundle.ts` and runtime supervisor integration.
- Exit condition: Core launch env receives asset paths only when validation passes; runtime gate stays fail-closed otherwise.

### Phase 3

- Objective: Produce packaged vertical smoke evidence.
- Deliverable: `scripts/smoke-packaged-vertical.mjs`, screenshot artifact, and smoke assertions.
- Exit condition: packaged Electron smoke reaches ready state with temporary local Core/Harbor owner-shaped health endpoints and packaged Lode build-output assets.

### Phase 4

- Objective: Keep validation local and boundary-safe.
- Deliverable: APP-260 Loom carrier, validation evidence, and PR metadata.
- Exit condition: `loom doctor`, `loom verify`, `loom fact-chain`, `npm run typecheck`, `npm run smoke`, `npm run smoke:packaged`, `npm run smoke:packaged:vertical`, and `git diff --check` pass.

## Constraints

- Do not modify Core, Harbor, or Lode repositories.
- Do not use real external sites, real accounts, real profiles, Cookies, production pages, submit/publish/send, or any external visible action.
- Do not save credentials, tokens, Cookies, profile storage, raw evidence, DOM, HAR, trace, video, or downloaded content.
- Do not claim packaged smoke as real Xiaohongshu/BOSS live task evidence.

## Validation

- loom doctor --target . --json
- loom verify --target . --json
- loom fact-chain --target . --json
- npm run typecheck
- npm run smoke
- npm run smoke:packaged
- npm run smoke:packaged:vertical
- git diff --check
