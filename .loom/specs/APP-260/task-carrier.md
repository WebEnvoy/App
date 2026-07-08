# APP-260 Task Carrier

## Story

Users need the desktop App to bring Lode capability assets with the local product loop so Core can resolve Xiaohongshu/BOSS capability refs without a live Lode server, while still telling the truth when Core/Harbor/Lode readiness is incomplete.

## Acceptance

- Lode registry/sites JSON assets are packaged with the App build output.
- Runtime supervisor can validate required Xiaohongshu/BOSS package refs and required asset files.
- Core runtime launch receives Lode asset path env only when the bundle is ready.
- Runtime readiness requires Core health/admission, Harbor health, and Lode assets.
- Packaged vertical smoke proves local owner-shaped readiness and packaged Lode assets without touching real accounts/profiles/Cookies/production pages or submit/publish/send.

## Batch Binding

- Anchor: APP-260 / GitHub #260
- Parent FR: GitHub #256
- Covered: #260, #261
- Excluded: real Core/Harbor binary packaging, Core/Harbor/Lode repo changes, live Xiaohongshu/BOSS account/profile/Cookie/production page operation, true write/submit/publish/send, hosted browser, marketplace, bulk collection, risk-bypass claims.

## Carrier Rows

| carrier_type | carrier_locator | source_value | normalized_status | relationship | work_item_locator | breakdown_unit_locator | spec_scenario_locator | plan_phase_locator | validation_strategy_locator | provenance | freshness_rule |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| github_issue | https://github.com/WebEnvoy/App/issues/256 | Corrective FR: package and orchestrate local Core/Harbor runtime, disable fixture availability in production | in_progress | mirror | .loom/work-items/APP-260.md | .loom/specs/APP-260/plan.md | .loom/specs/APP-260/spec.md | .loom/specs/APP-260/plan.md | .loom/specs/APP-260/plan.md#validation | GitHub issue readback 2026-07-08 UTC | Recheck after parent issue/dependency change or PR metadata creation. |
| github_issue | https://github.com/WebEnvoy/App/issues/260 | Package Lode capability assets for local Core consumption | in_progress | primary | .loom/work-items/APP-260.md | .loom/specs/APP-260/plan.md#phase-1 | .loom/specs/APP-260/spec.md#acceptance-criteria | .loom/specs/APP-260/plan.md#phase-1 | .loom/specs/APP-260/plan.md#validation | GitHub issue readback 2026-07-08 UTC | Recheck after Lode asset packaging or registry refs change. |
| github_issue | https://github.com/WebEnvoy/App/issues/261 | Generate packaged real vertical smoke evidence | in_progress | mirror | .loom/work-items/APP-260.md | .loom/specs/APP-260/plan.md#phase-3 | .loom/specs/APP-260/spec.md#acceptance-criteria | .loom/specs/APP-260/plan.md#phase-3 | .loom/specs/APP-260/plan.md#validation | GitHub issue readback 2026-07-08 UTC | Recheck after packaged smoke, runtime endpoint, or evidence artifact change. |
