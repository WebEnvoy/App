# APP-290 Evidence Map

| evidence_id | evidence_type | source_locator | consumes | binding | freshness | consumer_boundary | remediation_direction |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EV-001 | behavior_evidence | src/renderer/coreTaskSubmitClient.ts | APP-290 acceptance criteria | exact deferred guard and projection | present | App behavior only; no live site evidence | Refresh after task IDs or submit path changes. |
| EV-002 | display_evidence | src/renderer/App.tsx | EV-001 | Task Thread, Library, and identity entry consumers | present | UI projection only; related consumers are covered by EV-003 | Refresh after entry or source-strip changes. |
| EV-003 | test_evidence | scripts/smoke.mjs | EV-001 EV-002 | zero POST, history, fixture/live-success exclusion, XHS preservation | present | Automated local evidence; no production page | Rerun after App code or tests change. |
| EV-004 | fresh_verification_input | .loom/progress/APP-290.md | EV-001 EV-002 EV-003 | typecheck/full/packaged/diff checks | present | PR readiness only | Refresh after commit, PR head, or dependency changes. |
