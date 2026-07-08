# Spec

## Governance

- Governance strength: strong-risk App Work Item because the change touches packaged runtime assets, Core owner consumption inputs, and production availability semantics.
- Suite path: minimal
- Full-path-artifacts not_applicable: rationale: this App batch packages Lode asset files and proves local App runtime admission behavior. It does not change Core, Harbor, or Lode contracts, does not ship a release build, and does not perform real account/profile/Cookie/production page actions. Consumer boundary: review must verify Lode assets are packaged as files/refs only, Core receives asset path env only after validation, and packaged smoke evidence does not claim real site/live account success. Recheck condition: upgrade if this PR adds real browser launch, task execution against production pages, raw evidence rendering, Core/Harbor/Lode contract changes, installer/notarization, or external visible actions.

## Goal

Users opening the App should have a packaged/local path for Lode Xiaohongshu/BOSS capability assets so Core can consume package refs locally, while App still fails closed unless Core health/admission, Harbor health, and Lode assets are all ready.

## Scope

- In scope: copy Lode registry/sites JSON assets into App build output, resolve env/packaged/build-output asset roots, validate required Xiaohongshu/BOSS package refs and required JSON files, pass Lode asset env to Core child process, include Lode assets in runtime readiness, and add packaged vertical smoke evidence.
- Out of scope: Core/Harbor/Lode repository changes, real Core/Harbor binary packaging, hosted registry, Lode runtime server, live Xiaohongshu/BOSS page access, real account/profile/Cookie use, raw evidence access/storage, submit/publish/send, release packaging/notarization, and issue closeout before merge evidence.

## Upstream Truth Consumed

- Lode #14/#252 closed as capability asset/registry truth only.
- Harbor #12/#218 closed as Harbor-side runtime API/session/evidence truth only.
- Core #13/#243 closed as Core refs-only task submission/query truth only.
- App #257/#258/#259 closed via PR #262 for runtime supervisor and fail-closed display.

## Acceptance Criteria

- [x] `npm run build` packages Lode registry/sites JSON assets into `dist-electron/lode` when the sibling Lode checkout is available.
- [x] Runtime supervisor validates required Xiaohongshu/BOSS package refs and manifest/lock/resource/failure/no-submit guard files.
- [x] Core child process launch receives `WEBENVOY_LODE_ASSETS_PATH` and `WEBENVOY_LODE_REGISTRY_PATH` only when assets are ready.
- [x] Runtime readiness requires Core health/admission, Harbor health, and Lode assets before enabling live runtime state.
- [x] Default packaged smoke still proves fail-closed behavior when owner runtimes are absent.
- [x] Packaged vertical smoke proves packaged App -> local Core/Harbor owner-shaped health/admission -> packaged Lode assets -> runtime gate ready, using local smoke servers only.
