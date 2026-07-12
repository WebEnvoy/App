# Evidence Map

| evidence_id | evidence_type | source_locator | consumes | binding | freshness | consumer_boundary | remediation_direction |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EV-001 | behavior_evidence | src/renderer/coreTaskSubmitClient.ts | APP-240 acceptance criteria | Structured BOSS one-shot submit and BOSS-spec-only authenticated official Chrome restricted-fallback admission | present | `provider_conflict` plus `fingerprint_conflict` remain required; `proxy_missing` is only an additional BOSS job-search warning | Refresh after submit contract or admission changes. |
| EV-002 | test_evidence | scripts/smoke.mjs | EV-001 | Exact BOSS three-warning and existing XHS two-warning positive cases; BOSS proxy-only, XHS proxy, unknown warning, needs-auth, fixture/local/offline, write/precheck, bulk, and malformed query negative cases | present | Local contract smoke; no external BOSS action | Rerun after App admission, identity projection, or Core submit behavior changes. |
| EV-003 | fresh_verification_input | .loom/progress/APP-240.md | EV-001 EV-002 | APP-240 current implementation validation | present | PR readiness input only; not Core #270 detail or live account E2E | Refresh after commit, push, PR metadata, or validation changes. |
