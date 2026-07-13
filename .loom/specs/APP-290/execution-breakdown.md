# APP-290 Execution Breakdown

| Unit | Scope | Acceptance | Validation |
| --- | --- | --- | --- |
| APP-290-U1 | Fail closed for all BOSS command entry and submit paths | Exact deferred reason and zero `POST /tasks` | `npm run smoke` |
| APP-290-U2 | Project BOSS UI/history without current capability claims | Identity/manual browser retained; only historical live failures retain provenance/time | `npm run smoke`; `npm run smoke:packaged` |
| APP-290-U3 | Preserve unrelated behavior | XHS and shared runtime health unchanged | `npm run typecheck`; `npm run smoke:packaged:readonly` |

No unit accesses a production page, account, profile, or sensitive material.
