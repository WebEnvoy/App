# Task Carrier

- Item: APP-240
- Branch: work/app-240-boss-job-search
- Workspace: .
- Checkpoint: implementation
- Next: validate, commit, push, and open a ready PR without merge or issue closeout.
- Boundary: search only; Core #270 owns the future real `detail_ref` detail path.

## Carrier Rows

| carrier_type | carrier_locator | source_value | normalized_status | relationship | work_item_locator | breakdown_unit_locator | spec_scenario_locator | plan_phase_locator | validation_strategy_locator | provenance | freshness_rule |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| github_issue | https://github.com/WebEnvoy/App/issues/240 | BOSS one-shot job-search submit and owner-ref display; detail remains open | in_progress | primary | .loom/work-items/APP-240.md | .loom/specs/APP-240/plan.md | .loom/specs/APP-240/spec.md#acceptance-criteria | .loom/specs/APP-240/plan.md | .loom/progress/APP-240.md | GitHub issue readback 2026-07-11T16:10Z | Recheck after issue/PR state, head, Core #270 detail contract, or validation changes. |
