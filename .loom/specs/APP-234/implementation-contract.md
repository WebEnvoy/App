# Implementation Contract

## Work Item

- Item: APP-234
- Anchor Issue: #234
- Covered Issues: #233, #234, #235, #236, #237
- Branch: work/app-234-real-harbor-identity
- Workspace: /Volumes/2T/dev/WebEnvoy/App.worktrees/app-234-real-harbor-identity

## Approved Scope

- In Scope: App renderer/client/store/smoke/carrier changes for Harbor identity/browser facts.
- Out Of Scope: Harbor/Core/Lode changes; Core real task execution #238; write preview #243; sensitive material custody; hosted browser; external site writes.

## Validation Plan

- npm run typecheck
- npm run smoke
- WEBENVOY_PACKAGED_SMOKE_SCREENSHOT=artifacts/app-234-real-harbor-identity-packaged.png npm run smoke:packaged
- git diff --check
- loom fact-chain --target . --json
- loom verify --target . --json

## Risks And Rollback

- Risk: Harbor currently exposes runtime-api package facts, while App endpoint paths are tolerant JSON candidates; a formal Harbor HTTP route mismatch remains a follow-up integration risk.
- Rollback Boundary: revert this PR; no external state, profile material, credentials, cookies, tokens, Core run truth, or Harbor session truth is modified by the repository change.

## Host Binding

- Pull Request: pending
- Reviewed Head: pending
