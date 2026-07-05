# Implementation Contract

## Work Item

- Item: APP-137, anchored to GitHub issue #137 and covering #137-#148 as one App first-batch PR.
- Execution Entry: work/stage5-app-library-read-capabilities

## Approved Spec

- Spec Path: .loom/specs/APP-137/spec.md
- Spec Review Entry: .loom/reviews/APP-137.spec.json

## Implementation Scope

- In Scope: fixture metadata, Library catalog/detail UI, install/lock/update intent controls, Task Thread launch, source health blocker display, smoke checks, packaged evidence.
- Out Of Scope: live Lode/Core/Harbor calls, credential/session/raw evidence storage, write-capable actions, Stage 6.

## Validation Plan

- Automated Checks: npm run typecheck; npm run smoke; git diff --check; loom fact-chain --target . --json; loom verify --target . --json
- Manual Verification: packaged smoke screenshot at artifacts/stage5-library-read-capabilities-preview.png

## Risks And Rollback

- Risks: hosted merge gate can still fail if PR metadata, current-head review, or carrier-only drift are not refreshed after the final head SHA changes.
- Rollback Boundary: revert this PR; no external state or live owner truth is modified.

## Host Binding

- Pull Request: https://github.com/WebEnvoy/App/pull/184
- Reviewed Head: pending current-head review after build checkpoint commit
