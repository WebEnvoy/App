# APP-239 Task Carrier

| carrier_type | carrier_locator | source_value | normalized_status | relationship | work_item_locator | breakdown_unit_locator | spec_scenario_locator | plan_phase_locator | validation_strategy_locator | provenance | freshness_rule |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| github_issue | https://github.com/WebEnvoy/App/issues/239 | Launch Xiaohongshu search and note-detail tasks | in_progress | primary | .loom/work-items/APP-239.md | .loom/specs/APP-239/plan.md | .loom/specs/APP-239/spec.md#acceptance | .loom/specs/APP-239/plan.md | .loom/specs/APP-239/implementation-contract.md#validation | Issue #239 and Core PR #283 readback on 2026-07-12 | Recheck after branch head, PR, owner contract, hosted gate, or live E2E changes. |
| github_issue | https://github.com/WebEnvoy/App/issues/241 | Display Xiaohongshu real result and evidence refs | in_progress | mirror | .loom/work-items/APP-239.md | .loom/specs/APP-239/plan.md | .loom/specs/APP-239/spec.md#acceptance | .loom/specs/APP-239/plan.md | .loom/specs/APP-239/implementation-contract.md#validation | Issue #241 and Core PR #283 readback on 2026-07-12 | Recheck after result projection, evidence UI, or live E2E changes. |

BOSS production and write-precheck are excluded. Shared current/status remains controller-owned.
