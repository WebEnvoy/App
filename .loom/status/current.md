# Current Status

## Derived Fact Chain View

- Item ID: APP-260
- Goal: Package Lode Xiaohongshu/BOSS capability assets with the App build so local Core can consume the registry and package refs without relying on a live Lode server or fixture-as-runtime behavior.
- Scope: App build-time Lode JSON asset packaging, Electron runtime Lode asset resolver, Core child-process env handoff, packaged smoke checks, vertical packaged smoke evidence, APP-260 item-specific carrier, and ownership constraints for the changed App build/runtime/smoke files.
- Execution Path: milestone14/app-lode-assets-packaged-smoke
- Workspace Entry: .
- Recovery Entry: .loom/progress/APP-260.md
- Review Entry: .loom/reviews/APP-260.json
- Validation Entry: loom doctor --target . --json; loom verify --target . --json; loom fact-chain --target . --json; npm run typecheck; npm run smoke; npm run smoke:packaged; npm run smoke:packaged:vertical; git diff --check
- Closing Condition: PR Ready for App #260/#261 with PR/head metadata, validation evidence, packaged Lode asset proof, packaged vertical smoke artifact, and explicit exclusion of real account/profile/Cookie/production page actions and true submit/publish/send.
- Current Checkpoint: merge
- Current Stop: App build packages Lode local registry/sites JSON assets into `dist-electron/lode`; runtime supervisor resolves env, packaged, or build-output Lode assets; Core launch receives `WEBENVOY_LODE_ASSETS_PATH` and `WEBENVOY_LODE_REGISTRY_PATH` only when the bundle validates; packaged vertical smoke passed with local Core/Harbor owner-shaped health endpoints and packaged Lode assets.
- Next Step: PR #263 exists for `work/app-260-packaged-vertical-smoke`; consume hosted merge gate for the current PR head and merge only if required checks pass, then close App #260/#261 and dependent App #233-#247/#256 only with explicit evidence boundaries.
- Blockers: None
- Latest Validation Summary: 2026-07-08T14:50:18Z UTC local validation passed: `npm run typecheck`; `npm run smoke`; `npm run smoke:packaged`; `npm run smoke:packaged:vertical`; `git diff --check`; `loom fact-chain --target . --json`; `loom suite validate --target . --item APP-260 --json`; `loom suite carrier validate --target . --item APP-260 --json`; `loom suite evidence validate --target . --item APP-260 --json`. `loom build --target . --item APP-260 --build-evidence .loom/specs/APP-260/build-evidence.json --json --full-output` classified only `checkpoint-admission` as block with `missing_inputs=[]`; `build-execution` was pass and no unintegrated delegation output remained. Deterministic review-readiness checks were run against the installed Loom package because App has no `tools/` directory: `tools/skills_surface.py check` failed with `skills_docs_reference_sync_drift`; `tools/loom_check.py --profile source --source-surface contract-only` failed with source scope mismatch; `tools/check_release_surface.py` failed because source release docs/workflows are absent from the installed package; `tools/version_surface_check.py` failed because `packages/loom-installer/package.json` is absent from the installed package; `tools/check_npm_package.py` failed with runtime copy parity gaps for source/plugin/.loom/bin paths. These deterministic check failures are classified as external Loom tool surface/package-layout issues outside APP-260 write scope. `smoke:packaged:vertical` used local temporary Core/Harbor HTTP smoke servers, packaged Lode build-output assets, and generated `artifacts/app-261-packaged-vertical-smoke.png`; it did not use real accounts, browser profiles, Cookies, production pages, submit/publish/send, or external visible actions.
- Recovery Boundary: Revert branch `work/app-260-packaged-vertical-smoke`; no Core/Harbor/Lode repository changes, real browser/profile/account operation, Cookie/token/profile storage access, raw evidence storage, submit/publish/send, or production page action occurred.
- Current Lane: App milestone #14 packaged Lode asset and vertical smoke closeout batch

## Runtime Evidence

- Run Entry: artifacts/app-261-packaged-vertical-smoke.png
- Logs Entry: npm run smoke:packaged:vertical output from 2026-07-08 UTC
- Diagnostics Entry: .loom/specs/APP-260/evidence-map.md
- Verification Entry: loom verify --target . --json
- Lane Entry: App milestone #14 packaged Lode asset and vertical smoke closeout batch

## Sources

- Static Truth: .loom/work-items/APP-260.md
- Dynamic Truth: .loom/progress/APP-260.md
- Locator Truth: .loom/bootstrap/init-result.json
- Fact Chain CLI: loom fact-chain --target . --json
