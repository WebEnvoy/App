# App FR #133-#135 Stage 5 Test Failure Repair Evidence Story

## User Story

- Schema marker: loom-user-story/v1

- Actor: business user using WebEnvoy App Work, Library, and Browser surfaces.
- Capability: inspect read-capability test health, report suspected breakage, review repair draft provenance, and open owner-provided evidence or viewer refs.
- Outcome: the user can tell whether a read capability was recently tested, why a failed run is attributed to capability, input, runtime, site change, or stale evidence, what repair draft exists, and which evidence links are viewable without exposing local private browser material.
- Business value: Stage 5 becomes a usable capability-maintenance loop instead of a static catalog. Users can move from a failing Work run back to Library health and evidence while Lode, Core, and Harbor remain truth owners.
- Out of scope: Stage 6 write preview or real write flows, hosted browser, marketplace, hosted sync, crawler queue, real account/profile access, live production pages, App-owned package/run/session/evidence truth, raw DOM/HAR/network/cookie/token/profile storage, and further #167 polish.

## Product Context

- Vision / roadmap locator: `/Volumes/2T/dev/WebEnvoy/.github/ROADMAP.md` Stage 5; `/Volumes/2T/dev/WebEnvoy/App/ROADMAP.md`.
- Host issue / notes locator: App #133, #134, #135, and Work Items #149-#159.
- Upstream fact owner locators: Core milestone #10 issues #144/#145/#146 and #148-#157; Harbor milestone #9 issues #112/#113/#114 and #115-#127; Lode Stage 5 issues #139/#140/#141/#142/#143/#144 and related Work Items.
- Discussion summary locator: delegated Stage 5 second-batch objective from thread `019f2731-5b28-72d1-897e-8d1199e94fdc`; execution thread `019f31a5-212e-7952-a56a-bba7ffe9b1b9`.

## Acceptance Scenarios

### Scenario S1

- Scenario id: S1
- Scenario locator: `.loom/stories/APP-FR133-135-stage5-test-failure-repair-evidence.md#scenario-s1`
- Dimension: happy_path_recent_test

Given
- Lode exposes capability lifecycle and test metadata, and Core exposes recent run attribution

When
- the user opens a capability detail in Library

Then
- App shows recent test run, post-check result, failure reason, package/source/version, and freshness without saving Lode package truth or Core run truth.

### Scenario S2

- Scenario id: S2
- Scenario locator: `.loom/stories/APP-FR133-135-stage5-test-failure-repair-evidence.md#scenario-s2`
- Dimension: failure_to_library

Given
- a Work run fails with Core attribution to capability, input, runtime, site change, or evidence freshness

When
- the user follows the Work failure path

Then
- App links back to the relevant Library capability state and preserves Core as the run/result truth owner.

### Scenario S3

- Scenario id: S3
- Scenario locator: `.loom/stories/APP-FR133-135-stage5-test-failure-repair-evidence.md#scenario-s3`
- Dimension: report_broken

Given
- the user suspects a capability is broken

When
- the user reports broken or marks suspected from Library

Then
- App sends a user intent with capability ref, version, source, and non-sensitive context; App does not directly mutate Lode platform truth.

### Scenario S4

- Scenario id: S4
- Scenario locator: `.loom/stories/APP-FR133-135-stage5-test-failure-repair-evidence.md#scenario-s4`
- Dimension: repair_draft_provenance

Given
- Lode exposes repair draft lifecycle, failure-to-repair mapping, and platform/user overlay boundaries

When
- the user views repair state

Then
- App distinguishes local draft, user overlay/fork, platform fix candidate, validation state, and source of the draft.

### Scenario S5

- Scenario id: S5
- Scenario locator: `.loom/stories/APP-FR133-135-stage5-test-failure-repair-evidence.md#scenario-s5`
- Dimension: evidence_viewer_refs

Given
- Harbor exposes viewer/evidence refs with redacted, private, expired, stale, or unavailable status

When
- the user opens evidence from Work or Library

Then
- App opens only owner-provided refs/links, explains unavailable or private states, and never reads raw private capture, full DOM, HAR, raw network body, cookie, token, or profile storage.

### Scenario S6

- Scenario id: S6
- Scenario locator: `.loom/stories/APP-FR133-135-stage5-test-failure-repair-evidence.md#scenario-s6`
- Dimension: direct_browser_boundary

Given
- Browser can show direct Identity Runtime Session state and Core-managed task evidence

When
- the user moves between Work, Library, and Browser

Then
- App makes clear which links belong to managed task evidence and which belong to direct browsing identity state.

## Story Readiness

- Schema marker: loom-story-readiness/v1

- Decision: confirmed
- Rationale: The FR batch has a concrete actor, observable outcomes, success paths, unavailable states, sensitive-data boundary, non-goals, and upstream truth-owner facts. It is ready for item-specific spec and plan work without expanding Stage 5.
- Story locator: `.loom/stories/APP-FR133-135-stage5-test-failure-repair-evidence.md#user-story`
- Missing inputs: none for product semantics. Implementation remains dependent on upstream Core/Harbor/Lode fixture and schema PRs before App can consume those facts.
- Bypass rationale, if `not_applicable`: not_applicable

## Story Business Confirmation

- Schema marker: loom-story-business-confirmation/v1

- Decision: confirmed
- Business Confirmation locator: `.loom/stories/APP-FR133-135-stage5-test-failure-repair-evidence.md#story-business-confirmation`
- Confirmed by: Codex execution thread `019f31a5-212e-7952-a56a-bba7ffe9b1b9`, based on user delegation and GitHub issue tree.
- Confirmation source: App #133/#134/#135, App #149-#159, organization Stage 5 ROADMAP, repo AGENTS boundaries, and delegated second-batch objective.
- Revision request: none.
- Bypass rationale, if `not_applicable`: not_applicable
- Confirmation scope: actor, capability, outcome, business value, acceptance scenarios, out of scope.

## Dependency Facts

- Lode truth owner: capability lifecycle/version/lock/compatibility, previous known good, local registry metadata, failure-to-repair mapping, repair draft lifecycle, overlay/fork/draft boundary, draft validation and promotion checks, and sensitive-material exclusion.
- Core truth owner: capability version admission, Run Record capability attribution, post-check result, failure attribution categories, recent run/failure summary queries, and evidence refs associated with capability version.
- Harbor truth owner: runtime validation facts, Snapshot/RefMap/Evidence refs, viewer refs, private/redacted/expired/stale/unavailable statuses, evidence lifecycle, provenance, and freshness.
- App truth owner: user entry, local UI preferences, report-broken intent UI, navigation between Work/Library/Browser, and non-sensitive stale-marked display cache.

## Failure And Unavailable States

- No recent test: show missing or unavailable test fact and do not infer capability health.
- Post-check failed: show owner-provided failure reason and next action.
- Runtime not satisfied: show Core/Harbor blocking state without blaming package health.
- Site changed: show site-change attribution and repair draft link when Lode exposes it.
- Evidence stale, expired, private, redacted, or unavailable: show status and only open allowed refs.
- Repair draft unavailable: show no draft without manufacturing draft truth.

## Delivery Consumption Boundary

- Schema marker: loom-story-delivery-mapping/v1

- Intended Work Item or FR: App FR #133/#134/#135; readiness anchor #149, later App implementation may batch #149-#159 after upstream facts merge.
- Scenario locator export: S1-S6 locators above; specs and plans should reference locators instead of copying the story.
- Business Confirmation locator export: `.loom/stories/APP-FR133-135-stage5-test-failure-repair-evidence.md#story-business-confirmation`
- Spec entry expectation: item-specific specs must map App behavior to upstream fact locators and explicitly avoid App-owned upstream truth.
- Plan entry expectation: dependency order is Harbor/Lode/Core facts first, then App #133/#134/#135 consumption, then closeout.
- Story confirmation requirement: confirmed
- Story fields must not copy delivery handoff, recovery state, review findings, PR summary, merge-ready, closeout state, or formal spec / plan content.
