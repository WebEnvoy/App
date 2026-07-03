# Plan

## Steps

1. Admit GH-101 as the single batch anchor for #101, #102, #103, and #104.
2. Record host reconciliation that `#93 blocked by #101` is expected parent/child structure.
3. Sync App docs and GitHub issue semantics for direct session, Core task path, and Lode capability package metadata boundaries.
4. Add the minimal Radix/lucide dependencies needed by the shell.
5. Implement local source health fixtures, Settings endpoint choice boundary, and Task Thread first base layout.
6. Verify typecheck, smoke, audit, diff check, and Loom fact-chain/doctor/verify.
7. Create one implementation PR with GH-101 metadata and covered Work Items.

## Ownership Constraints

- Main/controller thread owns shared Loom carriers, PR metadata, issue metadata, and final gate/merge/closeout decisions.
- Worker/reviewer threads may inspect or propose bounded changes, but must not concurrently write `.loom/status/current.md`, `.loom/bootstrap/init-result.json`, `.loom/progress/**`, `.loom/reviews/**`, issue bodies, or PR bodies.
- GH-101 implementation owns only this batch's shell surface and local fixture/config boundary.
- Follow-on Work Items #105-#113 remain out of scope and must use later Work Item carriers.

## Risks

- The shell could accidentally imply real task outcomes from source health or direct Browser sessions.
- Settings could drift into sensitive storage if endpoint choice boundaries are not explicit.
- Layout work could regress into a generic four-page dashboard rather than Task Thread first.
- Adding dependencies must stay limited to primitives actually used by the shell.

## Validation

- `npm run typecheck`
- `npm run smoke`
- `npm audit --audit-level=high`
- `git diff --check`
- `loom fact-chain --target . --json`
- `loom doctor --target . --json`
- `loom verify --target . --json`
- `loom suite validate --target . --item GH-101 --json`
- `loom suite carrier validate --target . --item GH-101 --json`
