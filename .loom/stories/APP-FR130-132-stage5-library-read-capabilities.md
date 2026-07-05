# App FR #130-#132 Stage 5 Library Read Capabilities Story

## User Story

- Schema marker: loom-user-story/v1

- Actor: business user using the WebEnvoy App Library.
- Capability: browse, install-intent, lock/update-intent, and launch first-batch read-only capabilities from Library.
- Outcome: the user can understand which read-only capabilities are available, whether their sources are healthy, which version is locked or latest, and start a read task without App owning package, run, session, or evidence truth.
- Business value: Stage 5 turns read-only capability assets into a usable App entry point while keeping Lode, Core, and Harbor as the truth owners.
- Out of scope: Stage 6 write/preview/validation flows, Browser management console expansion, hosted marketplace, Lode package body caching in App, Core run truth in App, Harbor raw evidence/profile exposure, and further polishing of #167.

## Product Context

- Vision / roadmap locator: `/Volumes/2T/dev/WebEnvoy/.github/ROADMAP.md` Stage 5; `/Volumes/2T/dev/WebEnvoy/App/ROADMAP.md`.
- Host issue / notes locator: App #130, #131, #132, and Work Items #137-#148.
- Discussion summary locator: delegated Stage 5 first-batch objective from thread `019f2731-5b28-72d1-897e-8d1199e94fdc`; execution thread `019f31a5-212e-7952-a56a-bba7ffe9b1b9`.

## Acceptance Scenarios

### Scenario S1

- Scenario id: S1
- Scenario locator: `.loom/stories/APP-FR130-132-stage5-library-read-capabilities.md#scenario-s1`
- Dimension: happy_path_catalog

Given
- Lode exposes first-batch read-only catalog metadata with capability ref, package source, version, lifecycle, risk, test status, and update timestamp

When
- the user opens App Library

Then
- Library shows the capability list with source, status, version, risk, update time, and clear empty/unavailable states without storing Lode package truth.

### Scenario S2

- Scenario id: S2
- Scenario locator: `.loom/stories/APP-FR130-132-stage5-library-read-capabilities.md#scenario-s2`
- Dimension: install_lock_update

Given
- a read-only capability has local UI intent state and upstream latest metadata

When
- the user installs, locks, or updates the capability from Library

Then
- App records only local UI intent or preference, shows installed/locked/latest differences, and continues to consume package/version truth from Lode.

### Scenario S3

- Scenario id: S3
- Scenario locator: `.loom/stories/APP-FR130-132-stage5-library-read-capabilities.md#scenario-s3`
- Dimension: launch_read_task

Given
- a capability detail has a locked capability ref, version, and source

When
- the user starts a read task from Library

Then
- App sends Core a read task intent carrying capability ref, version, and source, and Core remains the owner of admission, run record, and result envelope truth.

### Scenario S4

- Scenario id: S4
- Scenario locator: `.loom/stories/APP-FR130-132-stage5-library-read-capabilities.md#scenario-s4`
- Dimension: source_health_blocking

Given
- Lode, Core, or Harbor source health blocks the selected capability

When
- the user views the capability or attempts launch

Then
- App shows the blocking source health state and does not imply a read task has started.

### Scenario S5

- Scenario id: S5
- Scenario locator: `.loom/stories/APP-FR130-132-stage5-library-read-capabilities.md#scenario-s5`
- Dimension: sensitive_data_boundary

Given
- capability catalog, runtime references, or evidence references are displayed

When
- App renders Library, task intent, or source health states

Then
- App does not persist credential, cookie, token, browser profile storage, raw DOM, HAR, raw network body, raw evidence, Core run truth, Harbor session truth, or Lode package body.

## Story Readiness

- Schema marker: loom-story-readiness/v1

- Decision: confirmed
- Rationale: The FR batch has a clear user value, success path, failure states, sensitive-data boundary, non-goals, and dependency truth owners. Known implementation gaps are specific enough to enter item-specific spec/plan work.
- Story locator: `.loom/stories/APP-FR130-132-stage5-library-read-capabilities.md#user-story`
- Missing inputs: none for product semantics. Implementation remains blocked on the separate Loom bootstrap merge-gate repair before product PRs can cleanly merge.
- Bypass rationale, if `not_applicable`: not_applicable

## Story Business Confirmation

- Schema marker: loom-story-business-confirmation/v1

- Decision: confirmed
- Business Confirmation locator: `.loom/stories/APP-FR130-132-stage5-library-read-capabilities.md#story-business-confirmation`
- Confirmed by: Codex execution thread `019f31a5-212e-7952-a56a-bba7ffe9b1b9`, based on user delegation and GitHub issue tree.
- Confirmation source: App #130/#131/#132, App #137-#148, organization Stage 5 ROADMAP, and repo AGENTS boundaries.
- Revision request: none.
- Bypass rationale, if `not_applicable`: not_applicable
- Confirmation scope: actor, capability, outcome, business value, acceptance scenarios, out of scope.

## Dependency Facts

- Lode truth owner: catalog/package/version/test metadata. First batch needs App-consumable catalog metadata v0 for the sample read package; App must not save package truth.
- Core truth owner: task intent, admission, run record, result envelope. First batch needs capability source/lock attribution in additive refs and query projection.
- Harbor truth owner: runtime/session/evidence refs. First batch can consume existing runtime/evidence refs and source health fixture; no Harbor product change is required unless App needs a field absent from current refs.
- App truth owner: user entry and local UI state. App may save endpoint choice, filters, local install/lock/update intent, and non-sensitive stale-marked display cache.

## Delivery Consumption Boundary

- Schema marker: loom-story-delivery-mapping/v1

- Intended Work Item or FR: App FR #130/#131/#132; first App implementation anchor should be #137, with covered Work Items #137-#148 listed in the PR body.
- Scenario locator export: S1-S5 locators above; specs and plans should reference locators instead of copying the story.
- Business Confirmation locator export: `.loom/stories/APP-FR130-132-stage5-library-read-capabilities.md#story-business-confirmation`
- Spec entry expectation: item-specific spec must map S1-S5 to concrete App/Lode/Core slices and explicitly keep Harbor unchanged unless a missing field is proven.
- Plan entry expectation: dependency order is Lode catalog metadata v0, Core additive capability attribution refs, then App Library-to-Work UI consumption.
- Story confirmation requirement: confirmed
- Story fields must not copy delivery handoff, recovery state, review findings, PR summary, merge-ready, closeout state, or formal spec / plan content.
