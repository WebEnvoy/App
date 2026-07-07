# APP-239 Task Carrier

## Story

Users need the App read-only task result view to consume real Core run/result/evidence refs for Xiaohongshu and BOSS instead of presenting fallback projection as if it were owner truth.

## Acceptance

- Core live projection is used when the configured Core endpoint returns read-only capability runs.
- Offline/fallback projection remains clearly labeled.
- Result/evidence UI shows refs, status, freshness, post-check, and recovery state without raw sensitive material.
- No live external site, profile, Cookie, credential, submit, publish, send, push, PR, merge, or issue closeout is performed.

## Batch Binding

- Anchor: APP-239 / GitHub #239
- Parent FR: GitHub #238
- Covered: #239, #240, #241, #242
- Excluded: #243 write-precheck display and Core #230/PR #240 write-precheck facts

## Carrier Rows

| carrier_type | carrier_locator | source_value | normalized_status | relationship | work_item_locator | breakdown_unit_locator | spec_scenario_locator | plan_phase_locator | validation_strategy_locator | provenance | freshness_rule |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| github_issue | https://github.com/WebEnvoy/App/issues/238 | Parent FR: run Xiaohongshu and BOSS real read-only tasks | in_progress | mirror | .loom/work-items/APP-239.md | .loom/specs/APP-239/plan.md | .loom/specs/APP-239/spec.md | .loom/specs/APP-239/plan.md | .loom/specs/APP-239/plan.md#validation | GitHub issue readback 2026-07-07 UTC | Recheck after PR retarget, issue state change, Core owner API contract change, or new validation run. |
| github_issue | https://github.com/WebEnvoy/App/issues/239 | Launch Xiaohongshu search and note-read task display | in_progress | primary | .loom/work-items/APP-239.md | .loom/specs/APP-239/plan.md#phase-1 | .loom/specs/APP-239/spec.md#acceptance-criteria | .loom/specs/APP-239/plan.md#phase-1 | .loom/specs/APP-239/plan.md#validation | GitHub issue readback 2026-07-07 UTC | Recheck after Core capability-run query mapping or XHS task display changes. |
| github_issue | https://github.com/WebEnvoy/App/issues/240 | Launch BOSS search and job-detail task display | in_progress | mirror | .loom/work-items/APP-239.md | .loom/specs/APP-239/plan.md#phase-1 | .loom/specs/APP-239/spec.md#acceptance-criteria | .loom/specs/APP-239/plan.md#phase-1 | .loom/specs/APP-239/plan.md#validation | GitHub issue readback 2026-07-07 UTC | Recheck after Core capability-run query mapping or BOSS task display changes. |
| github_issue | https://github.com/WebEnvoy/App/issues/241 | Display real results, screenshots, and evidence references | in_progress | mirror | .loom/work-items/APP-239.md | .loom/specs/APP-239/plan.md#phase-2 | .loom/specs/APP-239/spec.md#acceptance-criteria | .loom/specs/APP-239/plan.md#phase-2 | .loom/specs/APP-239/plan.md#validation | GitHub issue readback 2026-07-07 UTC | Recheck after evidence-ref rendering, source status, or raw evidence boundary changes. |
| github_issue | https://github.com/WebEnvoy/App/issues/242 | Display login, captcha, page change, and missing-field recovery actions | in_progress | mirror | .loom/work-items/APP-239.md | .loom/specs/APP-239/plan.md#phase-2 | .loom/specs/APP-239/spec.md#acceptance-criteria | .loom/specs/APP-239/plan.md#phase-2 | .loom/specs/APP-239/plan.md#validation | GitHub issue readback 2026-07-07 UTC | Recheck after failure classification, recovery copy, or owner action mapping changes. |
