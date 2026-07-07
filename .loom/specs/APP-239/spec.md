# Spec

- Suite path: minimal
- Full-path-artifacts not_applicable: rationale: this App batch only consumes already-closed Core #225 read-only query facts and App-side display/client behavior; it does not change Core, Harbor, Lode, schemas, real accounts, evidence storage, or external site actions. Consumer boundary: review must verify Core owner refs/status are displayed and fallback is clearly labeled. Recheck condition: upgrade if this PR adds task submission, live account/profile operation, raw evidence rendering, write-precheck #243, or any Core/Harbor/Lode contract change.

## Goal

App users can open the Xiaohongshu and BOSS read-only Task Threads and see Core owner API run/result/evidence projections when the configured Core endpoint is available, while offline mode remains explicitly labeled as fallback projection.

## Scope

- In scope: Core `/capability-runs`, `/runs/:id/result`, `/runs/:id/evidence-refs`, `/runs/:id/failure`, `/runs/:id/session-refs` read paths; source status strip; result/evidence/ref display; failure recovery labels for not logged in, captcha, page changed, and field missing; smoke coverage.
- Out of scope: Core/Harbor/Lode changes, real external site access, true writes/submits/sends, credential/Cookie/token/profile/raw evidence storage, PR creation, push, merge, and issue closeout.

## Upstream Truth Consumed

- Core/WebEnvoy #225 is closed and blocks App #238.
- Core/WebEnvoy #226/#227/#228/#229 are closed and provide the read-only run, result, evidence ref, and failure classification facts.
- Lode #235/#240 and Harbor #208 dependencies of Core #225 are closed.
- Core/WebEnvoy #230 and PR #240 are write-precheck scope for App #243 and are not consumed by this read-only display batch.

## Acceptance Criteria

- [x] Xiaohongshu/BOSS read tasks can replace fallback projections with Core live projections from owner API responses.
- [x] Result display shows Core result kind, payload state, post-check, runtime session ref, and evidence refs without raw evidence body.
- [x] Failure states keep recovery actions visible and do not convert login/captcha/page/field problems into success.
- [x] Offline Core endpoint keeps fallback visible and labeled as offline/fallback.
- [x] Smoke covers Core live projection mapping and raw evidence boundary.
