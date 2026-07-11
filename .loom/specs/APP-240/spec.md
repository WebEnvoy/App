# Spec

## Goal

The App accepts one explicit BOSS job search, submits it through Core, and displays only Core-owned run/result/evidence/session refs.

## Acceptance Criteria

- [ ] BOSS payload contains `query`, explicit supported `city_code`, `page=1`, and `limit<=15`.
- [ ] Target is canonical `https://www.zhipin.com/web/geek/job?query=...&city=...`.
- [ ] Free-text city, unknown filters/city codes, cross-domain input, pagination, bulk limits, fixture identity, and unlogged identity fail closed.
- [ ] Runtime health/admission behavior and owner-ref polling remain fail closed.
- [ ] Job detail is not submitted or synthesized; a future implementation may only consume a real search-result `detail_ref` from Core #270.

## Non-goals

Job detail, write-precheck, greeting/application/message actions, real account E2E, pagination, batch collection, external writes, and changes outside App.
