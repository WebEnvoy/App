# APP-236 Evidence Map

- Suite path: minimal
- This evidence is not live login synchronization evidence and cannot close the user story until merged packaged-App readback.

| evidence_id | evidence_type | source_locator | consumes | binding | freshness | consumer_boundary | remediation_direction |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EV-001 | behavior_evidence | .loom/specs/APP-236/spec.md | Active user-controlled managed-session precondition, exact bodyless POST, complete session-fact validation including page-title/fact-value fixture markers, explicit session-missing recovery, single-flight refresh, and fail-closed diagnostic | APP-236 Harbor manual-authentication and session-recovery consumer behavior | present | App renderer contract only; Harbor remains the identity/session truth owner | Refresh after Harbor #241 route, session-unavailable schema, eligibility, or privacy boundary changes. |
| EV-002 | test_evidence | .loom/progress/APP-236.md | `npm run typecheck`; `node scripts/smoke-session-restart.mjs`; `npm run smoke`; `git diff --check` | APP-236 focused contract validation | present | Local contract smoke only; no production login, browser interaction, external write, or sensitive material access | Rerun and update progress after source, carrier, runtime contract, or PR head changes. |
| EV-003 | fresh_verification_input | .loom/progress/APP-236.md | EV-001 EV-002 | APP-236 current local verification | present | PR-ready evidence input only; no merge or live-E2E claim | Refresh after every push or changed validation input. |
