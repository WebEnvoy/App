# Plan

## Implementation Goal

- Deliver story readiness only for App #133/#134/#135 and Work Items #149-#159.
- Defer upstream facts and App UI implementation to later PRs after this readiness PR merges.

## Phases

### Phase 1

- Objective: Capture user value, success experience, failure/unavailable states, sensitive-data boundary, non-goals, and dependency fact owners.
- Deliverable: .loom/stories/APP-FR133-135-stage5-test-failure-repair-evidence.md
- Exit condition: Story Readiness and Story Business Confirmation are confirmed.

### Phase 2

- Objective: Add minimal item-specific Loom carriers for #149 readiness.
- Deliverable: work item, progress, spec, plan, implementation contract, evidence map, and task carrier.
- Exit condition: suite/carrier/fact-chain validation can consume APP-149.

### Phase 3

- Objective: Preserve verification evidence.
- Deliverable: validation command results in PR body and progress summary.
- Exit condition: git diff check and Loom checks pass on the PR head.

## Constraints

- App must not save package truth, run truth, session truth, raw evidence, credentials, cookies, tokens, profile storage, raw DOM, HAR, or raw network bodies.
- The PR remains Stage 5 story readiness only.
- No Core/Harbor/Lode owner truth is modified in this PR.

## Validation

- Automated checks: git diff --check; loom story --target . --json; loom suite validate --target . --item APP-149 --json; loom suite carrier validate --target . --item APP-149 --json; loom fact-chain --target . --json; loom verify --target . --json
- Manual checks: readback of story scenarios against App #133/#134/#135 and #149-#159.
- Runtime evidence: not required for this story-readiness-only PR; review and merge-ready consume story/carrier validation instead of runtime smoke; require App smoke and packaged screenshot when a later PR changes UI behavior or owner fact consumption.
- Behavior evidence: confirmed story scenarios and dependency boundary facts.
- Story scenario to evidence mapping: S1-S6 via story and minimal spec.
- Story business confirmation locator: .loom/stories/APP-FR133-135-stage5-test-failure-repair-evidence.md
- Fresh verification evidence: PR body validation block and .loom/progress/APP-149.md
- Execution ledger plan locator: .loom/specs/APP-149/plan.md
- Execution ledger validation evidence locator: .loom/progress/APP-149.md

## Test Strategy

- TDD or test-first expectation: not required for this story-readiness-only PR because no product code or fixture behavior changes; review and merge-ready consume document readback and Loom checks; require target smoke/tests when code, fixtures, or UI are changed.
- Regression coverage to add or preserve: Loom suite/carrier validation proves later specs can consume the readiness locator.
- Cases intentionally not automated: UI rendering, packaged screenshot, live owner calls, Core/Harbor/Lode fixture behavior.
- Passing checks captured as test evidence: command outputs and PR validation block.

## Dependencies

- Blocking inputs: App #133/#134/#135 issue tree and delegated Stage 5 second-batch objective.
- Required coordination: Core/Harbor/Lode upstream facts must merge before App implementation consumes them.
- Rollback boundary: this branch only.

## Ready For Implementation

- [x] Spec is stable enough to implement
- [x] Scope and non-goals are clear
- [x] Story business semantics are confirmed
- [x] Validation path is defined
- [x] BDD outer-loop scenarios map to validation
- [x] TDD inner-loop expectations are deferred to later implementation specs because this PR changes only story readiness
- [x] Risks and dependencies are explicit
