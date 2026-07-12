# Implementation Contract

- Owned code: `src/renderer/coreTaskSubmitClient.ts`, `TaskThreadComposer.tsx`, `App.tsx`, necessary `siteSkillFixtures.ts`, `harborIdentityProjection.ts`, `SiteSkillPages.tsx`, and `scripts/smoke.mjs`.
- Owned governance: APP-240 item-specific work-item/spec carriers only; shared current/progress/review carriers remain controller-owned.
- Forbidden: other repositories, Core/Harbor/Lode contracts, job detail implementation, synthetic `detail_ref`, writes, live account E2E, merge, and issue closeout.
- Branch: `work/app-240-chrome-readonly-admission`.
- Workspace: `/Volumes/2T/dev/WebEnvoy/App.worktrees/app-240-chrome-readonly-admission`.
- Validation: `npm run typecheck`, `npm run smoke`, `npm run build`, `git diff --check`.
