# Spec

## Governance

- Governance strength: strong-risk App Work Item because this changes packaged runtime supervision, cross-repo health/admission contracts, and production availability semantics.
- Suite path: minimal
- Full-path-artifacts not_applicable: rationale: this batch only fixes App-side consumption and E2E gate behavior for existing owner runtime APIs. It does not change Core/Harbor/Lode contracts directly, does not release a distributable installer, and does not perform real account/profile/Cookie/production page actions. Consumer boundary: review must verify App consumes owner runtime facts and fails closed when live owner facts are absent. Recheck condition: upgrade if this PR adds real browser launch implementation, Core/Harbor contract changes, raw evidence rendering, installer/notarization, or external visible actions.

## Goal

Users opening the App should see a truthful runtime gate: Core admission, Harbor health/provider facts, and packaged Lode assets must be live before App enables real task/session/write-precheck actions.

## Scope

- In scope: App runtime supervisor health/admission consumption, local endpoint diagnostics, fail-closed UI state, packaged smoke assertions, and E2E evidence plumbing.
- Out of scope: Core/Harbor/Lode repository changes, real site access, real account/profile/Cookie use, raw evidence storage, submit/publish/send, hosted browser, marketplace, bulk collection, and risk-control bypass.

## Acceptance Criteria

- [ ] App recognizes Harbor readiness through the owner contract once Harbor exposes the agreed health/readiness surface.
- [ ] App recognizes Core admission health once Core exposes the agreed admission surface.
- [ ] App shows diagnostic unavailable state when either owner runtime is missing or malformed.
- [ ] App does not show fixture/demo task results as live results.
- [ ] Packaged smoke covers ready and fail-closed states without real external site actions.
- [ ] Final Computer Use E2E records real App behavior and remaining blocks, if any.
