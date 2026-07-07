# Implementation Contract

## Work Item

- Item: APP-244
- Anchor Issue: #244
- Covered Issues: #243, #244, #245, #246, #247
- Branch: work/app-244-real-write-precheck-display
- Workspace: /Volumes/2T/dev/WebEnvoy/App.worktrees/app-244-real-write-precheck-display

## Approved Scope

- In Scope: App renderer/client/copy/smoke/carrier changes for real write-precheck display.
- Out Of Scope: Core/Harbor/Lode changes; real browser/profile/account operation; approval execution; sensitive material custody; raw evidence body rendering; push/PR/merge/closeout by subagents.

## Validation Plan

- npm run typecheck
- npm run smoke
- git diff --check

## Risks And Rollback

- Risk: a running Core endpoint may not expose write-precheck run records; App keeps fallback projection clearly labeled.
- Risk: Core result payload state may be expired or unavailable; App displays blocked/expired state and keeps submitted=false visible.
- Rollback Boundary: revert this branch; no external state, credentials, cookies, tokens, profile storage, raw evidence, Core truth, Harbor truth, or Lode truth is modified by the repository change.

## Host Binding

- Pull Request: https://github.com/WebEnvoy/App/pull/254
- Reviewed Head: 2c68e73ceeda35f3afe3428ace9a365c0053a804
