# Plan

## Steps

1. Align GH-117 progress and status surfaces with the already-merged closeout evidence.
2. Retire the GH-111 docs-only carrier without closing GitHub #111.
3. Repoint the active fact-chain entrypoint to GH-122 while this repair branch is active.
4. Validate with `git diff --check`, `loom doctor --target . --json`, `loom verify --target . --json`, and `loom fact-chain --target . --json`.
5. Re-test GH-100 setup and record the remaining exact Loom error if setup is still blocked for a non-stale-carrier reason.

## Risks

- Do not let the repair lane grow into App implementation.
- Keep GitHub #111 open and clearly separate from the retired docs-only carrier.
