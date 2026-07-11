# APP-282 Task Carrier

- Item: APP-282
- Branch: work/app-282-session-open-timeout
- Workspace: .
- Checkpoint: review
- Next: current-head review, ready PR, hosted gate, merge, packaged E2E.
- Boundary: App transport timing only; no Harbor contract or live-site behavior change.

| carrier_type | carrier_locator | source_value | normalized_status | relationship | work_item_locator | breakdown_unit_locator | spec_scenario_locator | plan_phase_locator | validation_strategy_locator | provenance | freshness_rule |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| github_issue | https://github.com/WebEnvoy/App/issues/282 | First real browser launch must preserve Harbor session refs | in_progress | primary | .loom/work-items/APP-282.md | .loom/specs/APP-282/execution-breakdown.md | .loom/specs/APP-282/spec.md#acceptance-criteria | .loom/specs/APP-282/plan.md | .loom/progress/APP-282.md | GitHub issue and merged-package E2E readback 2026-07-11T17:36Z | Recheck after issue, PR head, validation, or packaged E2E changes. |
