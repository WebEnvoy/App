# APP-236 Evidence Map

| evidence_id | evidence_type | source_locator | consumes | binding | freshness | consumer_boundary | remediation_direction |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EV-001 | behavior_evidence | .loom/specs/APP-236/spec.md | Active user-controlled managed-session precondition, exact bodyless POST, owner provenance/state validation, refresh, and fail-closed diagnostic | APP-236 Harbor manual-authentication consumer behavior | present | App renderer contract only; Harbor remains the identity/session truth owner | Refresh after Harbor #241 route, public response, eligibility, or privacy boundary changes. |
| EV-002 | test_evidence | .loom/progress/APP-236.md | `npm run typecheck`; `npm run smoke`; `git diff --check` | APP-236 focused contract validation | present | Local contract smoke only; no production login, browser interaction, external write, or sensitive material access | Rerun and update progress after source, carrier, runtime contract, or PR head changes. |
| EV-003 | fresh_verification_input | .loom/progress/APP-236.md | EV-001 EV-002 | APP-236 current local verification | present | PR-ready evidence input only; no merge or live-E2E claim | Refresh after every push or changed validation input. |
