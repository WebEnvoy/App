# APP-282 Evidence Map

| evidence_id | evidence_type | source_locator | consumes | binding | freshness | consumer_boundary | remediation_direction |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EV-001 | behavior_evidence | src/electron/ownerApiRequest.ts | APP-282 acceptance criteria | bounded route timeout classifier | present | Code behavior only; no live browser proof | Refresh after owner API route or timeout changes. |
| EV-002 | test_evidence | scripts/smoke.mjs | EV-001 | exact timeout class regression | present | Local automated evidence only | Rerun after App code or test changes. |
| EV-003 | fresh_verification_input | .loom/progress/APP-282.md | EV-001 EV-002 | typecheck, full smoke, and diff validation | present | PR readiness only; packaged first launch remains pending | Refresh after commit, PR head, validation, or E2E changes. |
