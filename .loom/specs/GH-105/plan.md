# Plan

## Steps

1. Admit GH-105 as the single batch anchor for #105, #106, #107, #108, and #109.
2. Record host reconciliation that #105 is a child/blocker of parent FR #94 and that the dependency relation should not be rewritten.
3. Add Core-facing read-only task/run fixture projections and a thin renderer adapter that marks fields as owner-sourced or local-only.
4. Extend the Task Thread shell with task creation, run rail, completion report, structured result, failure, unavailable, redacted/expired, and unknown outcome states.
5. Preserve #95 result-evidence/source/session reference work as out-of-scope entry points only.
6. Extend smoke coverage for the #105-#109 states and direct-session separation.
7. Verify typecheck, smoke, audit, diff check, and Loom fact-chain/doctor/verify.
8. Create one implementation PR with GH-105 metadata and covered Work Items.

## Ownership Constraints

- Main/controller thread owns shared Loom carriers, PR metadata, issue metadata, and final gate/merge/closeout decisions.
- Worker/reviewer threads may inspect or propose bounded renderer changes, but must not concurrently write `.loom/status/current.md`, `.loom/bootstrap/init-result.json`, `.loom/progress/**`, `.loom/reviews/**`, issue bodies, PR bodies, commits, pushes, or GitHub state.
- GH-105 implementation owns only #94 read-only task/run/result/failure UI and fixtures for #105-#109.
- #110-#113 and #95 remain out of scope and must use later Work Item carriers.

## Risks

- The UI could accidentally imply that a direct Harbor session is a Core task success.
- Fixtures could be mistaken for owner API schema truth.
- Result and failure UI could drift into #95 evidence/source/session reference implementation.
- Adding local state could become an App-owned task/run status machine.

## Validation

- `npm run typecheck`
- `npm run smoke`
- `npm audit --audit-level=high`
- `git diff --check`
- `loom fact-chain --target . --json`
- `loom doctor --target . --json`
- `loom verify --target . --json`
- `loom suite validate --target . --item GH-105 --json`
- `loom suite carrier validate --target . --item GH-105 --json`
