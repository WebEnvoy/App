# APP-236 Implementation Contract

- Owner: App renderer only.
- Input: `POST /runtime/sessions/{runtime_session_ref}/manual-authentication-completed` through `requestOwnerJson`.
- Preconditions: Harbor live identity; active user-held managed session projection.
- Output: matching Harbor public identity fact only; then refreshed Harbor projection.
- Failure: safe UI diagnostic with no inferred or persisted authentication state.
- Privacy: no Cookie, password, token, verification code, raw profile, DOM, storage, or evidence is read, logged, or persisted.
