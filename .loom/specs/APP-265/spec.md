# Spec

## Governance

- Governance strength: strong-risk App Work Item because this changes packaged runtime supervision, cross-repo health/admission contracts, and production availability semantics.
- Suite path: minimal
- Full-path-artifacts not_applicable: rationale: this batch only fixes App-side consumption and E2E gate behavior for existing owner runtime APIs. It does not change Core/Harbor/Lode contracts directly, does not release a distributable installer, and does not perform real account/profile/Cookie/production page actions. Consumer boundary: review must verify App consumes owner runtime facts and fails closed when live owner facts are absent. Recheck condition: upgrade if this PR adds real browser launch implementation, Core/Harbor contract changes, raw evidence rendering, installer/notarization, or external visible actions.

## Goal

Users opening the App should see a truthful runtime gate and a real Core submit path: Core admission, Harbor health/provider facts, packaged Lode assets, and a ready Harbor live identity must be present before App enables a read-only Core task submit. When a submit succeeds, App must display the Core-owned run/result/evidence/session refs instead of fixture or UI projection.

## Scope

- In scope: App runtime supervisor health/admission consumption, packaged Core/Harbor runtime asset launch from the previous APP-265 batch, local endpoint diagnostics, fail-closed UI state, App-side Core `/tasks` read-only submit client, Core task-intent v0 payload construction, Harbor live identity gating, same-origin target URL guard, result/evidence/failure/session polling, and smoke assertions.
- Out of scope: Core/Harbor/Lode repository changes, real site access, real account/profile/Cookie use, raw evidence storage, submit/publish/send, hosted browser, marketplace, bulk collection, and risk-control bypass.

## Acceptance Criteria

- [ ] App recognizes Harbor readiness through the owner contract once Harbor exposes the agreed health/readiness surface.
- [ ] App recognizes Core admission health once Core exposes the agreed admission surface.
- [ ] App can launch packaged local Core and Harbor runtime wrappers from the built Electron output for local readiness smoke.
- [ ] App shows diagnostic unavailable state when either owner runtime is missing or malformed.
- [ ] App does not show fixture/demo task results as live results.
- [ ] App constructs Core `webenvoy.task-intent.v0` payloads with package ref, capability ref/version, resource requirement refs, evidence policy ref, site scope, and Harbor identity environment ref.
- [ ] App only enables submit when Core health/admission, Harbor health, read-only task spec, and matching ready Harbor live identity are all present.
- [ ] App blocks fixture/local/needs-auth/warning identities and cross-origin task URLs.
- [ ] App polls Core owner endpoints and displays returned run/result/evidence/session refs without reading raw evidence, DOM, HAR, Cookie, token, or profile storage.
- [ ] Packaged smoke covers ready and fail-closed states without real external site actions.
- [ ] Final Computer Use E2E records real App behavior and remaining blocks, if any.
