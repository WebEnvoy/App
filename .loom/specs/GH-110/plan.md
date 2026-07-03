# Plan

## Steps

1. Admit GH-110 as the single batch anchor for #110, #111, #112, and #113.
2. Reuse the existing Task Thread fixture/UI structure from #94 and add only #95 context details.
3. Add evidence, package attribution, and execution-site fixture projections with owner/source labels.
4. Render those projections in the right context tabs without raw evidence, raw browser endpoint, or durable truth storage.
5. Extend smoke coverage for the vertical read-only demo path.
6. Verify typecheck, smoke, audit, diff check, and Loom fact-chain/doctor/verify.
7. Create one implementation PR with GH-110 metadata and covered Work Items.

## Ownership Constraints

- Main/controller thread owns shared Loom carriers, PR metadata, issue metadata, and final gate/merge/closeout decisions.
- Worker/reviewer threads may inspect or propose bounded renderer changes, but must not write `.loom/status/current.md`, `.loom/bootstrap/init-result.json`, `.loom/progress/**`, `.loom/reviews/**`, issue bodies, PR bodies, commits, pushes, or GitHub state.
- GH-110 implementation owns only #95 read-only evidence/source/session reference UI and smoke coverage for #110-#113.

## Risks

- Evidence UI could accidentally imply App stores raw evidence.
- Harbor provider/viewer health could be mistaken for Core task outcome.
- Package attribution fixture could be mistaken for Lode package truth.

## Validation

- `npm run typecheck`
- `npm run smoke`
- `npm audit --audit-level=high`
- `git diff --check`
- `loom fact-chain --target . --json`
- `loom doctor --target . --json`
- `loom verify --target . --json`
- `loom suite validate --target . --item GH-110 --json`
- `loom suite carrier validate --target . --item GH-110 --json`
