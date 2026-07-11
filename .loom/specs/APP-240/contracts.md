# APP-240 Contracts

## Consumed Request Contract

- BOSS uses `scope.target_type=boss_job_search`.
- `public_query` is exactly `{query, city_code, page: 1, limit}`.
- The target is the canonical `https://www.zhipin.com/web/geek/job` URL for the same query and city.
- Xiaohongshu remains query-only with `scope.target_type=site`.

## Output And Safety Boundary

App displays only Core-owned run, result, evidence, session, failure, and post-check refs. This batch performs no greeting, application, message, save, publish, send, or submit action and persists no password, Cookie, token, verification code, or raw profile material.
