# APP-240 Execution Breakdown

| Unit | Spec coverage | Validation | Status |
| --- | --- | --- | --- |
| Human BOSS search controls | keyword, city, limit | typecheck and smoke | complete |
| Exact Core request | target type, public query, canonical URL | positive and fail-closed mock smoke | complete |
| Owner-ref projection | run/result/evidence/session facts | packaged read-only smoke | complete |
| Governance convergence | current-head review and full suite | suite validation and hosted merge gate | in progress |
| Live BOSS account run | separate runtime E2E issues | packaged App + Computer Use | not covered |

The first three units are one APP-240 implementation batch. Live BOSS and detail evidence must not be closed by this PR.
