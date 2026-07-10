# Current Status

## Derived Fact Chain View

- Item ID: APP-236
- Goal: Let a user explicitly confirm completed manual authentication for an active, user-controlled Harbor managed session and render only Harbor's returned public identity state.
- Scope: App Harbor client, identity recovery UI, focused smoke coverage, and APP-236-specific Loom evidence only. Ownership constraints: App owns only its explicit intent, main-process authorization boundary, and public projection; Harbor remains the session and identity truth owner.
- Execution Path: work/app-236-manual-auth-sync
- Workspace Entry: .
- Recovery Entry: .loom/progress/APP-236.md
- Review Entry: .loom/reviews/APP-236.json
- Validation Entry: npm run typecheck; npm run smoke; git diff --check; loom fact-chain --target . --item APP-236 --json; loom suite carrier validate --target . --item APP-236 --json; loom suite evidence validate --target . --item APP-236 --json
- Closing Condition: PR Ready after App explicitly sends the Harbor confirmation intent through its main-process-only boundary, only renders the returned public owner state, and validation proves no sensitive material or generic owner API bypass is exposed.
- Current Checkpoint: merge
- Current Stop: PR #278 awaits current-head semantic review, hosted merge-gate consumption, and Harbor #241 merge; these are controller-owned integration steps, not user blockers.
- Next Step: Run the current-head review and merge gate, merge Harbor #241 and App #236 in dependency order, then consume the returned public confirmation state in packaged App E2E.
- Blockers: None
- Latest Validation Summary: 2026-07-10 UTC, `npm run typecheck`, `npm run smoke`, and `git diff --check` passed. Smoke covers bodyless confirmation, invalid/missing authorization, generic owner API denial, public response redaction, token rotation and chunk-safe runtime output redaction. Deterministic review-readiness commands were executed against the installed Loom package because this App worktree has no `tools/` directory: `tools/skills_surface.py check` failed with `skills_docs_reference_sync_drift`; `tools/loom_check.py --profile source --source-surface contract-only` failed with source-surface mismatch because the installed package lacks the required source/distribution markers. Both are external Loom tool-surface defects outside APP-236 ownership and do not alter the App runtime boundary.
- Recovery Boundary: Revert work/app-236-manual-auth-sync; do not mutate identity status through generic PATCH or expose supervisor credentials.
- Current Lane: App #236 manual authentication confirmation consumer.

## Runtime Evidence

- Run Entry: not_applicable
- Logs Entry: scripts/smoke.mjs
- Diagnostics Entry: src/electron/main.ts; src/electron/manualAuthenticationCompletion.ts; src/electron/runtimeSupervisor.ts; src/electron/ownerApiRequest.ts
- Verification Entry: .loom/progress/APP-236.md
- Lane Entry: .loom/specs/APP-236/plan.md

## Sources

- Static Truth: .loom/work-items/APP-236.md
- Dynamic Truth: .loom/progress/APP-236.md
- Locator Truth: .loom/bootstrap/init-result.json
- Fact Chain CLI: loom fact-chain --target . --json
