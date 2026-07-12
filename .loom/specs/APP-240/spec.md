# Spec

## Goal

The App accepts one explicit BOSS job search, submits it through Core, and displays only Core-owned run/result/evidence/session refs.

## Acceptance Criteria

- [ ] BOSS UI collects a keyword, city selection, and limit while keeping `city_code` internal and page fixed to 1.
- [ ] Core HTTP `public_query` contains exact `{query,city_code,page:1,limit}` for BOSS, matching Core PR #273 head `09203469`; Xiaohongshu remains query-only.
- [ ] BOSS task intent uses `scope.target_type=boss_job_search`; Xiaohongshu keeps `scope.target_type=site`.
- [ ] Target is canonical `https://www.zhipin.com/web/geek/job?query=...&city=...`.
- [ ] Free-text city, unknown filters/city codes, cross-domain input, pagination, bulk limits, fixture identity, and unlogged identity fail closed.
- [ ] Runtime health/admission behavior and owner-ref polling remain fail closed.
- [ ] An authenticated Harbor live identity using official Chrome restricted fallback is admitted for one read-only BOSS search while provider/proxy/fingerprint warnings remain visible; needs-auth, fixture/local/offline, write/precheck, and bulk inputs remain blocked.
- [ ] Job detail is not submitted or synthesized; a future implementation may only consume a real search-result `detail_ref` from Core #270.
- [ ] Query length matches the pinned Lode boundary: 80 characters pass and 81 fail.

## Non-goals

Job detail, write-precheck, greeting/application/message actions, real account E2E, pagination, batch collection, external writes, and changes outside App.
