# Evidence Map

| evidence_id | evidence_type | source_locator | consumes | binding | freshness | consumer_boundary | remediation_direction |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EV-001 | behavior_evidence | src/renderer/coreTaskSubmitClient.ts | APP-240 acceptance criteria | Structured BOSS one-shot submit contract | present | Code behavior only; no live account/site proof | Refresh after submit contract or admission changes. |
| EV-002 | test_evidence | scripts/smoke.mjs | EV-001 | Typecheck, exact BOSS mock POST /tasks contract smoke, packaged readonly smoke, and diff check | present | Local contract smoke bound to Core PR #273 head 09203469; no live account/site action | Rerun after App code, Core #273 head/merge, runtime, or test changes. |
| EV-003 | fresh_verification_input | .loom/progress/APP-240.md | EV-001 EV-002 | APP-240 current implementation validation | present | PR readiness input only; not Core #270 detail or live account E2E | Refresh after commit, push, PR metadata, or validation changes. |
