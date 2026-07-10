# APP-236 Implementation Contract

- Owner: App renderer only.
- Input: `POST /runtime/sessions/{runtime_session_ref}/manual-authentication-completed` through `requestOwnerJson`.
- Preconditions: Harbor live identity; active user-held managed session projection.
- Output: matching Harbor public identity fact only; then refreshed Harbor projection.
- Failure: safe UI diagnostic with no inferred or persisted authentication state.
- Privacy: no Cookie, password, token, verification code, raw profile, DOM, storage, or evidence is read, logged, or persisted.
- Recovery: only a complete Harbor runtime-session public fact is projected. A cached session ref may be recreated only after the validated retryable `status=unavailable` / `failure_class=session_missing` response; all other lookup failures remain fail closed and concurrent recovery shares one request.
