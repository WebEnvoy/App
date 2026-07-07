# Spec

- Suite path: minimal
- Full-path-artifacts not_applicable: rationale: this App batch consumes already-closed Core #230 write-precheck owner facts and changes App-side display/client behavior only. It does not change Core, Harbor, Lode, schemas, real accounts, evidence storage, approval execution, or external site actions. Consumer boundary: review must verify live Core write-precheck projections and fallback fixtures both keep submitted=false / 未提交 visible and never imply publish/send success. Recheck condition: upgrade if this PR adds task submission, approval execution, live account/profile operation, raw evidence rendering, Core/Harbor/Lode contract changes, or any external visible write.

## Goal

App users can open Xiaohongshu and BOSS write-precheck Task Threads and see real-page preview facts, risk/approval state, cancellation/expiry handling, evidence refs, and a clear submitted=false / 未提交 boundary.

## Scope

- In scope: App task list access to #244/#245 threads, Library CTA for write-precheck skills, Core `/capability-runs` plus per-run result/evidence/failure/session ref consumption for write-precheck capabilities, fallback fixture labeling, right-panel evidence display, smoke coverage.
- Out of scope: Core/Harbor/Lode changes, real external site access, real account/profile/Cookie use, approval execution, true writes/submits/publishes/sends, credential/token/raw evidence storage, issue closeout.

## Upstream Truth Consumed

- Core/WebEnvoy #230 is closed and covers #231/#232/#233/#234.
- Core/WebEnvoy PR #240 merged at head `1899836f3902bcddc2b34f5e6c1daa619062a3d2` with merge commit `c7d803a76abd4c51e4ca0b1fc9f81fa812caf616`.
- Core/WebEnvoy closeout PR #241 merged with merge commit `984cc054b0719c1710575629afade58c596014da`.
- Core #230 closeout records write-precheck previews with explicit submitted=false / no-submit evidence and no real account/profile/Cookie access or true write.

## Scenarios

- S1: Given the App opens the Xiaohongshu write-precheck task, when Core live projection is available or fallback is used, then the user sees draft expected-change facts, evidence refs, risk state, and submitted=false / 未提交.
- S2: Given the App opens the BOSS greeting write-precheck task, when Core live projection is available or fallback is used, then the user sees greeting expected-change facts, evidence refs, risk state, and submitted=false / 未提交.
- S3: Given Core reports pending, cancelled, expired, page-changed, or preview-unavailable write-precheck states, when the run is selected, then the App displays the state without converting it to published/sent success.
- S4: Given a user clicks the App cancel-intent control, then only local UI state changes; the App does not execute approval, submit, publish, send, or write external state.

## Acceptance Criteria

- [x] Xiaohongshu and BOSS write-precheck tasks are reachable from the Task Thread surface.
- [x] Library write-precheck skills open the matching Task Thread instead of staying disabled as non-read-only.
- [x] Core live write-precheck projections map to existing `writePrecheck` and `approval` UI fields when owner API responses are available.
- [x] Fallback projections remain visible and are not labeled as live owner truth.
- [x] Smoke covers live Core write-precheck mapping, pending/cancelled/expired states, and submitted=false / 未提交 boundary.
