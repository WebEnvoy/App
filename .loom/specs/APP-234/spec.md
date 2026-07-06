# Spec

- Suite path: minimal
- Full-path-artifacts not_applicable: rationale: this App batch consumes already-merged Harbor milestone #12 facts and only changes App UI/client/store behavior; consumer boundary: review, merge-ready, and closeout must not require new cross-repo contracts unless this PR changes Harbor/Core/Lode APIs; recheck condition: upgrade if the PR adds Core task runtime #238, write preview #243, credential custody, raw evidence storage, hosted browser, or real external account actions.

## Goal

App users can see Harbor browser provider detection, manage safe local identity environment choices, understand manual authentication, and start/stop/take over local identity browser sessions without App storing sensitive browser/account material.

## Scope

- In scope: CloakBrowser/official Chrome provider display, local safe identity environment create/import/select/delete, Harbor endpoint JSON consumption, manual authentication entry, session open/lock/release/stop intents, offline/fixture labeling, smoke checks, screenshots, and APP-234 carrier.
- Out of scope: Core real task execution #238, write-before-preview #243, real login autofill, cookie/token/profile/raw evidence storage, uploads, hosted browser, marketplace, crawler/bulk collection, real writes, or risk-control bypass.

## Harbor Truth Consumed

- Harbor PR #183: provider catalog, CloakBrowser primary, official Chrome restricted fallback, Chromium/Donut exclusion.
- Harbor PR #213: local identity environment public facts, safe refs/status only, sensitive input rejection.
- Harbor PR #216: identity browser session open/stop, Xiaohongshu/BOSS page facts, viewer refs, handoff/release, screenshot/evidence refs.

## Key Scenarios

### Scenario 1

Given Harbor provider facts are available
When the user opens Browser/账号身份
Then App shows CloakBrowser and official Chrome status with primary/fallback roles and exclusions.

### Scenario 2

Given the user creates or imports an identity environment
When App persists it locally
Then only safe config, choices, and redacted refs are saved; password, cookie, token, raw profile, raw storage, raw endpoints, and raw evidence are rejected.

### Scenario 3

Given login recovery or manual authentication is required
When the user opens the identity detail
Then App shows the required human action and a manual authentication entry without autofilling credentials.

### Scenario 4

Given an identity environment is selected
When the user starts, takes over, releases, or stops a session
Then App sends Harbor session intent and displays returned session/page/viewer/control facts, or clearly labels endpoint/offline failure.

## Acceptance Criteria

- [x] Target outcome is observable in App UI and smoke evidence.
- [x] Sensitive import/store rejection is covered by a runnable smoke check.
- [x] Harbor live/offline/fixture sources are visibly distinct.
- [x] #238 and #243 are explicitly excluded.
- [x] Validation evidence can be consumed by PR review and merge-ready.
