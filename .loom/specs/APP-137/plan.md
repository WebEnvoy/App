# Plan

## Implementation Goal

- Deliver the first App Library read-capability fixture loop for #137-#148.
- Defer live owner integration, marketplace sync, write-capable flows, and Stage 6 behavior.

## Phases

### Phase 1

- Objective: Extend Library fixtures with the Lode/Core/Harbor/App fields needed by Stage 5 first batch.
- Deliverable: source, package ref, lock ref, installed/latest state, risk, update state, and source health metadata.
- Exit condition: fixture data renders in catalog and detail views.

### Phase 2

- Objective: Wire Library detail to Task Thread projections.
- Deliverable: start-read-task action and blocked source-health route.
- Exit condition: capability detail opens the existing Core-owned task projection.

### Phase 3

- Objective: Preserve runnable evidence.
- Deliverable: renderer smoke checks and packaged smoke screenshot.
- Exit condition: npm run smoke and npm run smoke:packaged pass.

## Constraints

- App must not save package truth, credential/cookie/profile data, raw evidence, run truth, or session truth.
- The PR remains Stage 5 only and stays stacked until bootstrap/story PRs are merged.
- Harbor changes are not required for this first App batch.

## Validation

- Automated checks: npm run typecheck; npm run smoke; git diff --check
- Manual checks: packaged smoke preview screenshot
- Runtime evidence: npm run smoke:packaged
- Behavior evidence: smoke strings for Library launch, source health, source ref, lock ref, and locked capability state
- Story scenario to evidence mapping: S1-S5 via fixture UI and smoke checks
- Story business confirmation locator: .loom/stories/APP-FR130-132-stage5-library-read-capabilities.md
- Fresh verification evidence: PR body validation block
- Execution ledger plan locator: .loom/specs/APP-137/plan.md
- Execution ledger validation evidence locator: .loom/progress/APP-137.md

## Test Strategy

- TDD or test-first expectation: fixture smoke is sufficient for this low-risk UI fixture batch.
- Regression coverage to add or preserve: packaged renderer bundle includes Library, source health, and owner ref strings.
- Cases intentionally not automated: live owner API calls and marketplace/package sync.
- Passing checks captured as test evidence: command outputs and PR body validation block.

## Dependencies

- Blocking inputs: bootstrap carrier PR and Story Readiness PR must merge before clean retarget to main.
- Required coordination: Lode remains package metadata owner; Core remains task/run/result owner; Harbor remains runtime/evidence ref owner.
- Rollback boundary: this branch only.

## Ready For Implementation

- [x] Spec is stable enough to implement
- [x] Scope and non-goals are clear
- [x] Story business semantics are confirmed
- [x] Validation path is defined
- [x] BDD outer-loop scenarios map to validation
- [x] TDD inner-loop expectations map to smoke evidence
- [x] Risks and dependencies are explicit
