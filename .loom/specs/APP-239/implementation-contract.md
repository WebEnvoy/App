# Implementation Contract

## Work Item

- Item: APP-239
- Anchor Issue: #239
- Covered Issues: #238, #239, #240, #241, #242
- Branch: work/app-239-real-read-results
- Workspace: /Volumes/2T/dev/WebEnvoy/App.worktrees/app-239-real-read-results

## Approved Scope

- In Scope: App renderer/client/copy/smoke/carrier changes for real read-only result display.
- Out Of Scope: Core/Harbor/Lode changes; App #243 write-precheck display; real browser/profile/account operation; sensitive material custody; raw evidence body rendering; push/PR/merge/closeout.

## Validation Plan

- npm run typecheck
- npm run smoke
- git diff --check

## Risks And Rollback

- Risk: a running Core endpoint may not yet expose the local file-backed run store expected by `/capability-runs`; App keeps offline fallback and labels it.
- Risk: Core result payload state is `not_persisted_in_core`, so App displays result envelope/ref facts rather than raw field payloads.
- Rollback Boundary: revert this branch; no external state, credentials, cookies, tokens, profile storage, raw evidence, Core truth, Harbor truth, or Lode truth is modified by the repository change.

## Host Binding

- Pull Request: not_created
- Reviewed Head: pending
