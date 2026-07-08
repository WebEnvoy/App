# APP-257 Task Carrier

## Story

Users need the App to tell the truth at startup: if local Core/Harbor runtime is absent or not ready, task/provider/identity/result/write-precheck surfaces must be blocked, not dressed up with fixture/demo success.

## Acceptance

- App can supervise configured local Core and Harbor runtime commands.
- Core health/admission and Harbor health are visible.
- Production/real mode fails closed when endpoints are unavailable.
- Fixture/demo projections are isolated and not used as availability or success proof.
- No live external site, profile, Cookie, credential, submit, publish, send, push, PR, merge, or issue closeout is performed.

## Batch Binding

- Anchor: APP-257 / GitHub #257
- Parent FR: GitHub #256
- Covered: #257, #258, #259
- Excluded: #260, #261, Core #243 implementation, Harbor #218 implementation

## Carrier Rows

| carrier_type | carrier_locator | source_value | normalized_status | relationship | work_item_locator | breakdown_unit_locator | spec_scenario_locator | plan_phase_locator | validation_strategy_locator | provenance | freshness_rule |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| github_issue | https://github.com/WebEnvoy/App/issues/256 | Corrective FR: package and orchestrate local Core/Harbor runtime, disable fixture availability in production | in_progress | mirror | .loom/work-items/APP-257.md | .loom/specs/APP-257/plan.md | .loom/specs/APP-257/spec.md | .loom/specs/APP-257/plan.md | .loom/specs/APP-257/plan.md#validation | GitHub issue readback 2026-07-08 UTC | Recheck after parent issue/dependency change or PR metadata creation. |
| github_issue | https://github.com/WebEnvoy/App/issues/257 | Start and supervise local Core and Harbor runtime | in_progress | primary | .loom/work-items/APP-257.md | .loom/specs/APP-257/plan.md#phase-1 | .loom/specs/APP-257/spec.md#acceptance-criteria | .loom/specs/APP-257/plan.md#phase-1 | .loom/specs/APP-257/plan.md#validation | GitHub issue readback 2026-07-08 UTC | Recheck after runtime command/path/probe behavior changes. |
| github_issue | https://github.com/WebEnvoy/App/issues/258 | Display runtime health/admission blocker state | in_progress | mirror | .loom/work-items/APP-257.md | .loom/specs/APP-257/plan.md#phase-2 | .loom/specs/APP-257/spec.md#acceptance-criteria | .loom/specs/APP-257/plan.md#phase-2 | .loom/specs/APP-257/plan.md#validation | GitHub issue readback 2026-07-08 UTC | Recheck after health/admission UI or endpoint paths change. |
| github_issue | https://github.com/WebEnvoy/App/issues/259 | Isolate fixture/demo mode and forbid production availability misdirection | in_progress | mirror | .loom/work-items/APP-257.md | .loom/specs/APP-257/plan.md#phase-3 | .loom/specs/APP-257/spec.md#acceptance-criteria | .loom/specs/APP-257/plan.md#phase-3 | .loom/specs/APP-257/plan.md#validation | GitHub issue readback 2026-07-08 UTC | Recheck after task, identity, provider, result, or write-precheck display changes. |
