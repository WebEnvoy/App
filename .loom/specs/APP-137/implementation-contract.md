# Implementation Contract

## Work Item

- Item: APP-137, anchored to GitHub issue #137 and covering #137-#148 as one App first-batch PR.
- Execution Entry: work/stage5-app-library-read-capabilities

## Approved Spec

- Spec Path: .loom/specs/APP-137/spec.md
- Spec Review Entry: blocked until bootstrap merge gate accepts the repository carrier

## Implementation Scope

- In Scope: fixture metadata, Library catalog/detail UI, install/lock/update intent controls, Task Thread launch, source health blocker display, smoke checks, packaged evidence.
- Out Of Scope: live Lode/Core/Harbor calls, credential/session/raw evidence storage, write-capable actions, Stage 6.

## Validation Plan

- Automated Checks: npm run typecheck; npm run smoke; git diff --check; loom fact-chain --target . --json; loom verify --target . --json
- Manual Verification: packaged smoke screenshot at artifacts/stage5-library-read-capabilities-preview.png

## Risks And Rollback

- Risks: hosted loom-pr-merge-gate still blocks stacked product PRs because bootstrap carrier metadata is incomplete.
- Rollback Boundary: revert this PR; no external state or live owner truth is modified.

## Host Binding

- Pull Request: https://github.com/WebEnvoy/App/pull/184
- Reviewed Head: pending current-head review
