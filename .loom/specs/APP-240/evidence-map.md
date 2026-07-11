# Evidence Map

| evidence_id | evidence_type | source_locator | consumes | binding | freshness | consumer_boundary | remediation_direction |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EV-001 | behavior_evidence | src/renderer/coreTaskSubmitClient.ts | APP-240 acceptance criteria | Structured BOSS one-shot submit contract | present | Code behavior only; no live account/site proof | Refresh after submit contract or admission changes. |
| EV-002 | test_evidence | scripts/smoke.mjs | EV-001 | Typecheck, smoke, packaged readonly smoke, and diff check at 2026-07-11T16:17Z | present | Local positive/fail-closed contract smoke; no live account/site action | Rerun after code, fixture, runtime, or test changes. |
| EV-003 | fresh_verification_input | .loom/progress/APP-240.md | EV-001 EV-002 | APP-240 current implementation validation | present | PR readiness input only; not Core #270 detail or live account E2E | Refresh after commit, push, PR metadata, or validation changes. |
