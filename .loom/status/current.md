# Current Status

## Derived Fact Chain View

- Item ID: APP-244
- Goal: Display App milestone #14 real page write-precheck for Xiaohongshu draft and BOSS greeting flows by consuming Core #230 owner API projections when available, while keeping submitted=false / 未提交 visible in fallback and live states.
- Scope: App Task Thread task list, Library CTA, Core owner API display projection, write-precheck/risk/approval/cancel/expired UI, smoke coverage, APP-244 item-specific carrier, and ownership constraints: main controller owns shared Loom/PR/GitHub carriers while subagents provide bounded implementation/review outputs that are integrated before review.
- Execution Path: milestone14/app-real-write-precheck-display
- Workspace Entry: .
- Recovery Entry: .loom/progress/APP-244.md
- Review Entry: .loom/reviews/APP-244.json
- Validation Entry: npm run typecheck; npm run smoke; git diff --check
- Closing Condition: PR Ready for #243/#244/#245/#246/#247 without issue closeout, live site access, true submit/publish/send, or external visible write.
- Current Checkpoint: build
- Current Stop: PR #254 is open on branch `work/app-244-real-write-precheck-display`; PR body and GitHub readback own the current head SHA, while the hosted `loom-pr-merge-gate` is expected to remain blocked until `.loom/reviews/APP-244.spec.json` and `.loom/reviews/APP-244.json` are committed.
- Next Step: Run APP-244 pre-review/spec-review/review, commit the review artifacts, refresh PR metadata head SHA, and rerun hosted merge gate before merge and issue closeout.
- Blockers: None recorded.
- Latest Validation Summary: 2026-07-07T09:25:37Z review-readiness refresh: prior local validation passed `npm run typecheck`, `npm run smoke`, and `git diff --check`; smoke covers Xiaohongshu and BOSS Core live write-precheck mapping, pending/cancelled/expired states, preview_unavailable and generic failed/blocked fail-closed states, submitted unknown/true blocked labels, preview_result evidence_refs, and submitted=false / 未提交 boundary when Core owner truth explicitly reports false. PR #254 metadata readback matched branch `work/app-244-real-write-precheck-display`, anchor #244, covered issues #243/#244/#245/#246/#247, and explicit non-goals; current head SHA is re-read from GitHub/PR body immediately before review and merge gates. Previous hosted run `28855487905` passed `py-compile`, `demo-bootstrap`, `repo-local-cli`, and `loom-check`; `loom-pr-merge-gate` failed because review artifacts were missing, not because App code or PR metadata failed. Deterministic review-readiness commands were executed: `tools/skills_surface.py check` against the installed Loom package failed with `skills_docs_reference_sync_drift` for missing Loom scaffold doc references, and `tools/loom_check.py --profile source --source-surface contract-only` against the installed Loom package failed with `scope mismatch` because the installed package lacks Loom source/distribution markers; both are classified as external Loom tool surface issues outside the App PR write scope. No real Core endpoint, browser, account, profile, Cookie, production page, approval execution, submit, publish, send, or external visible action was used.
- Recovery Boundary: Revert branch `work/app-244-real-write-precheck-display`; no Core/Harbor/Lode repo changes, external site access, real account/profile/Cookie use, raw evidence storage, approval execution, true write, submit, publish, send, host merge, issue closeout, hosted browser, marketplace, bulk collection, full account cloud hosting, or risk-bypass claim occurred.
- Current Lane: App milestone #14 real write-precheck display batch

## Runtime Evidence

- Run Entry: npm run typecheck; npm run smoke; git diff --check
- Logs Entry: not_applicable
- Diagnostics Entry: .loom/progress/APP-244.md
- Verification Entry: loom verify --target . --json
- Lane Entry: .loom/specs/APP-244/task-carrier.md

## Sources

- Static Truth: .loom/work-items/APP-244.md
- Dynamic Truth: .loom/progress/APP-244.md
- Locator Truth: .loom/bootstrap/init-result.json
- Fact Chain CLI: loom fact-chain --target . --json
