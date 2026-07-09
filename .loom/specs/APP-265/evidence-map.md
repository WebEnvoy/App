# Evidence Map

| evidence_id | evidence_type | source_locator | consumes | binding | freshness | consumer_boundary | remediation_direction |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EV-001 | behavior_evidence | .loom/specs/APP-265/spec.md | App #265 acceptance criteria and safety boundaries | APP-265 supervisor/gate behavior | present | Review and PR readiness only | Refresh if runtime gate behavior, owner endpoint contract, or safety boundary changes. |
| EV-002 | test_evidence | .loom/progress/APP-265.md | npm run typecheck; npm run smoke; npm run smoke:packaged; npm run smoke:packaged:vertical; npm run smoke:packaged:runtime; git diff --check | APP-265 local validation | present | Local packaged/runtime owner-shaped smoke only; not live Xiaohongshu/BOSS evidence | Rerun validation and update progress after code, carrier, PR head, or endpoint changes. |
| EV-003 | fresh_verification_input | .loom/progress/APP-265.md | EV-001 EV-002 | APP-265 current behavior and validation evidence | present | Merge-ready input before final live E2E | Refresh after every push or final Computer Use E2E. |
| EV-004 | build_evidence | .loom/specs/APP-265/build-evidence.json | Delegation ownership, packaged Core/Harbor runtime smoke, validation results, and remaining E2E risks | APP-265 build readiness | present | Build/review input only | Refresh after Harbor/Core PR heads or App E2E evidence changes. |
| EV-005 | runtime_artifact | artifacts/app-265-packaged-runtime-smoke.png | Packaged App screenshot after App-launched local Core/Harbor runtime readiness | APP-265 packaged runtime evidence | present | Screenshot proves local runtime gate state only; not live site/browser task evidence | Refresh whenever packaged runtime smoke or UI gate changes. |
