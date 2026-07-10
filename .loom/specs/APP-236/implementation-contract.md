# APP-236 Implementation Contract

- Owner: App renderer only.
- Input: `POST /runtime/sessions/{runtime_session_ref}/manual-authentication-completed` through `requestOwnerJson`.
- Preconditions: Harbor live identity; active user-held managed session projection.
- Output: matching Harbor public identity fact only; then refreshed Harbor projection.
- Failure: safe UI diagnostic with no inferred or persisted authentication state.
- Privacy: no Cookie, password, token, verification code, raw profile, DOM, storage, or evidence is read, logged, or persisted.
- Recovery: only a complete Harbor runtime-session public fact is projected. A cached session ref may be recreated only after an HTTP 404, non-fixture owner body with `schema_version=harbor-runtime-facts/v0`, the exact requested `runtime_session_ref`, `status=unavailable`, `failure_class=session_missing|session_lost`, public `message`, `retryable=true`, and `current_error.code=session_lost` / `retryable=true`; all other lookup failures remain fail closed and concurrent recovery shares one request.
