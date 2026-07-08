# Implementation Contract

## Work Item

- Item: APP-257
- Anchor Issue: #257
- Parent FR: #256
- Covered Issues: #257, #258, #259
- Branch: work/app-257-runtime-supervisor
- Workspace: /Volumes/2T/dev/WebEnvoy/App.worktrees/app-257-runtime-supervisor

## Approved Scope

- In Scope: App Electron main/preload runtime supervisor, renderer runtime health/admission/fail-closed state, Browser/identity fail-closed UI, focused smoke checks, and item-specific Loom carrier.
- Out Of Scope: Core/Harbor/Lode changes; GitHub issue/PR/milestone writes; PR creation; push; merge; closeout; real browser/profile/account/Cookie use; true task submission; submit/publish/send; raw evidence access or storage.

## Runtime Config

- Core supports `WEBENVOY_CORE_RUNTIME_COMMAND`, `WEBENVOY_CORE_RUNTIME_PATH`, `WEBENVOY_CORE_RUNTIME_CWD`, and packaged `runtime/core/start-runtime`.
- Harbor supports `WEBENVOY_HARBOR_RUNTIME_COMMAND`, `WEBENVOY_HARBOR_RUNTIME_PATH`, `WEBENVOY_HARBOR_RUNTIME_CWD`, and packaged `runtime/harbor/start-runtime`.
- `*_RUNTIME_CWD` defaults to `pnpm start:runtime`, matching the expected Harbor runtime script and allowing Core to adopt the same local start contract if needed.

## Validation Plan

- loom doctor --target . --json
- loom verify --target . --json
- loom fact-chain --target . --json
- npm run typecheck
- npm run smoke
- npm run smoke:packaged
- git diff --check

## Risks And Rollback

- Risk: Core admission endpoint paths may differ when Core #243 lands; App remains fail-closed and exposes repair state until endpoint paths are aligned.
- Risk: Harbor #218 may expose readiness under a different path; App checks `/health`, `/ready`, and `/runtime/health` and otherwise fails closed.
- Risk: repeated restart of a configured but failing local runtime command can retry every poll; keep env config pointed at stable local scripts.
- Rollback Boundary: revert this branch; no external state, credentials, cookies, tokens, profile storage, raw evidence, Core truth, Harbor truth, or Lode truth is modified by the repository change.

## Host Binding

- Pull Request: not_created
- Reviewed Head: pending
