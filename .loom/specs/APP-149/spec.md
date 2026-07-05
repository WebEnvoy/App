# Spec

- Suite path: minimal

- Full-path-artifacts not_applicable: rationale: this PR is story-readiness only and does not implement live owner contracts, UI behavior, runtime behavior, or Stage 6 behavior; consumer boundary: review, merge-ready, and closeout must not require suite-index.md, research.md, contracts.md, or readiness-checklist.md unless this PR expands beyond story readiness; recheck condition: re-evaluate if the PR adds code, fixtures consumed by product UI, live Lode/Core/Harbor calls, or shared contract changes.

## Goal

Confirm the product semantics for App #133/#134/#135 before implementation: users can understand read capability test health, failure attribution, repair drafts, and evidence/viewer status across Work, Library, and Browser while App consumes upstream facts only.

## Scope

- In scope: Story Readiness, Story Business Confirmation, acceptance scenarios, failure/unavailable states, sensitive-data boundary, non-goals, and dependency truth owner facts for App #133/#134/#135.
- Out of scope: implementing App UI, adding live owner calls, changing Core/Harbor/Lode contracts, closing FRs, closing App milestone #11, Stage 6, hosted browser, marketplace, raw evidence exposure, and #167 polishing.

## Key Scenarios

### Scenario 1

Given App #133 needs recent test and failure health semantics
When readiness is consumed by the later implementation spec
Then the spec can reference S1 and S2 for recent test, post-check, failure reason, Work-to-Library linkage, and capability attribution.

### Scenario 2

Given App #134 needs broken report and repair draft semantics
When readiness is consumed by the later implementation spec
Then the spec can reference S3 and S4 for report intent, repair draft provenance, and user/platform asset boundaries.

### Scenario 3

Given App #135 needs Work/Library/Browser evidence navigation semantics
When readiness is consumed by the later implementation spec
Then the spec can reference S5 and S6 for redacted/private/expired/stale evidence and direct-browser versus managed-task boundaries.

## Behavior Evidence

- Story scenario mapping: S1-S6 in .loom/stories/APP-FR133-135-stage5-test-failure-repair-evidence.md
- Story business confirmation locator: .loom/stories/APP-FR133-135-stage5-test-failure-repair-evidence.md
- Scenario coverage: document readback and Loom carrier validation
- Expected evidence locator: PR validation block and .loom/progress/APP-149.md
- Freshness rule: validation evidence must be regenerated on the PR head before merge-ready
- Execution ledger acceptance locator: .loom/progress/APP-149.md

## Exceptions And Boundaries

- Failure modes: upstream owner facts unavailable, no repair draft, stale evidence, private capture blocked, no recent test, and runtime unavailable.
- Operational boundaries: App only displays upstream facts and sends user intent; Lode owns capability/repair truth, Core owns run/result truth, Harbor owns runtime/evidence truth.
- Rollback or fallback expectations: remove this story readiness PR and return to the previous idle carrier.

## Acceptance Criteria

- [x] Target outcome is observable
- [x] Key scenarios are covered
- [x] Important boundary behavior is defined
- [x] Validation evidence is identified
- [x] Behavior evidence can be consumed by later spec, review, merge-ready, and closeout
