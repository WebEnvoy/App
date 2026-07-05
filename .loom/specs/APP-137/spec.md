# Spec

- Suite path: minimal

- Full-path-artifacts not_applicable: rationale: this App fixture batch is low-risk and already bounded by Story Readiness, spec.md, plan.md, and task-carrier.md; consumer boundary: review, merge-ready, and closeout must not require suite-index.md, research.md, contracts.md, or readiness-checklist.md unless this PR expands into live owner contracts or Stage 6 behavior; recheck condition: re-evaluate if the PR adds live Lode/Core/Harbor calls, external writes, new shared contracts, or broader governance scope.

## Goal

App users can use Library as the first Stage 5 entry point for read-only capabilities: browse the catalog, understand install/lock/update state, and start a read task projection without App owning upstream truth.

## Scope

- In scope: local fixture catalog metadata, status/version/source/risk/update time display, install/lock/update UI intent, locked/latest differences, source health blockers, and read task launch into existing Task Thread projections.
- Out of scope: live Lode sync, marketplace flows, write-capable tasks, package editing, credential/profile storage, raw DOM/network/evidence display, and Stage 6 behavior.

## Key Scenarios

### Scenario 1

Given the user opens Library
When capability fixtures are rendered
Then each capability exposes source, status, installed/latest version, risk, fetched time, and owner boundary fields.

### Scenario 2

Given a capability has installed, locked, latest, or update-available state
When the user opens the capability detail
Then App shows install, lock, and update intent controls without persisting Lode package truth.

### Scenario 3

Given a capability has a related read task fixture
When the user starts the read task from Library
Then App opens the Core-owned Task Thread projection with capability ref, source ref, and lock ref visible.

### Scenario 4

Given owner source health is unavailable
When the user follows the Library launch path
Then App shows the blocking Task Thread state and does not convert the blocker into task success.

## Behavior Evidence

- Story scenario mapping: S1, S2, S3, S4, S5 in .loom/stories/APP-FR130-132-stage5-library-read-capabilities.md
- Story business confirmation locator: .loom/stories/APP-FR130-132-stage5-library-read-capabilities.md
- Scenario coverage: npm run smoke; npm run smoke:packaged
- Expected evidence locator: artifacts/stage5-library-read-capabilities-preview.png and PR validation block
- Freshness rule: evidence must be regenerated on the PR head before merge-ready
- Execution ledger acceptance locator: .loom/progress/APP-137.md

## Exceptions And Boundaries

- Failure modes: no catalog match, unavailable source health, no related task fixture, update unavailable.
- Operational boundaries: App displays local UI intent and upstream refs only; Lode owns packages, Core owns tasks/runs/results, Harbor owns runtime/session/evidence refs.
- Rollback or fallback expectations: remove the fixture/UI branch and return to the Story Readiness branch.

## Acceptance Criteria

- [x] Target outcome is observable
- [x] Key scenarios are covered
- [x] Important boundary behavior is defined
- [x] Validation evidence is identified
- [x] Behavior evidence can be consumed by review, merge-ready, and closeout
