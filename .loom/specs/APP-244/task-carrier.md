# APP-244 Task Carrier

## Story

Users need the App write-precheck surface to show Xiaohongshu draft and BOSS greeting real-page preview facts from Core owner projections, while making it impossible to confuse preview/draft/cancel/expired states with submitted results.

## Acceptance

- Xiaohongshu and BOSS write-precheck tasks are reachable.
- Core live projection is used when the configured endpoint returns write-precheck capability runs.
- Fallback projection remains clearly labeled.
- Risk, approval, cancellation, expired, and no-submit states are visible.
- No live external site, profile, Cookie, credential, submit, publish, send, approval execution, push, PR, merge, or issue closeout is performed by subagents.

## Batch Binding

- Anchor: APP-244 / GitHub #244
- Parent FR: GitHub #243
- Covered: #244, #245, #246, #247
- Excluded: true write/submit/publish/send, hosted browser, marketplace, bulk collection, full account cloud hosting, risk-bypass claims

## Carrier Rows

| carrier_type | carrier_locator | source_value | normalized_status | relationship | work_item_locator | breakdown_unit_locator | spec_scenario_locator | plan_phase_locator | validation_strategy_locator | provenance | freshness_rule |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| github_issue | https://github.com/WebEnvoy/App/issues/243 | Parent FR: display real page write-precheck without submitting | in_progress | mirror | .loom/work-items/APP-244.md | .loom/specs/APP-244/plan.md | .loom/specs/APP-244/spec.md#scenarios | .loom/specs/APP-244/plan.md | .loom/specs/APP-244/plan.md#validation | GitHub issue readback 2026-07-07 UTC | Recheck after PR retarget, issue state change, Core owner API contract change, or validation run. |
| github_issue | https://github.com/WebEnvoy/App/issues/244 | Show Xiaohongshu draft real write-precheck | in_progress | primary | .loom/work-items/APP-244.md | .loom/specs/APP-244/plan.md#phase-1 | .loom/specs/APP-244/spec.md#s1 | .loom/specs/APP-244/plan.md#phase-1 | .loom/specs/APP-244/plan.md#validation | GitHub issue readback 2026-07-07 UTC | Recheck after XHS task reachability or Core projection mapping changes. |
| github_issue | https://github.com/WebEnvoy/App/issues/245 | Show BOSS greeting real write-precheck | in_progress | mirror | .loom/work-items/APP-244.md | .loom/specs/APP-244/plan.md#phase-1 | .loom/specs/APP-244/spec.md#s2 | .loom/specs/APP-244/plan.md#phase-1 | .loom/specs/APP-244/plan.md#validation | GitHub issue readback 2026-07-07 UTC | Recheck after BOSS task reachability or Core projection mapping changes. |
| github_issue | https://github.com/WebEnvoy/App/issues/246 | Display risk, approval request, cancel, and expired states | in_progress | mirror | .loom/work-items/APP-244.md | .loom/specs/APP-244/plan.md#phase-2 | .loom/specs/APP-244/spec.md#s3 | .loom/specs/APP-244/plan.md#phase-2 | .loom/specs/APP-244/plan.md#validation | GitHub issue readback 2026-07-07 UTC | Recheck after approval/cancel/expired UI or smoke coverage changes. |
| github_issue | https://github.com/WebEnvoy/App/issues/247 | Keep submitted=false / 未提交 unmistakable | in_progress | mirror | .loom/work-items/APP-244.md | .loom/specs/APP-244/plan.md#phase-3 | .loom/specs/APP-244/spec.md#s4 | .loom/specs/APP-244/plan.md#phase-3 | .loom/specs/APP-244/plan.md#validation | GitHub issue readback 2026-07-07 UTC | Recheck after no-submit UI copy, result row, or smoke boundary changes. |
