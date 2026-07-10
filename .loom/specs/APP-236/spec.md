# APP-236 Specification

## Suite Path

- Suite path: minimal
- suite-index.md, research.md, contracts.md, and readiness-checklist.md are not_applicable. Rationale: APP-236 is a narrow App IPC consumer of the already-defined Harbor #241 endpoint; it does not introduce a runtime owner, storage model, external site action, or contract delta. Consumer boundary: suite validation and review consume this specification, plan, evidence map, and task carrier without requiring those four full-suite artifacts. Recheck condition: upgrade to a full suite if the App starts owning identity truth, stores sensitive material, changes Harbor's endpoint contract, or includes real task execution or external page behavior.

## User Story

After completing a manual login in a Harbor-managed browser, a user can explicitly confirm completion in App. App submits the session-bound intent and displays only the returned Harbor public identity fact.

## Acceptance

1. The confirmation action is rendered only for a Harbor live identity with an active user-controlled session projection.
2. App calls the exact Harbor #241 route with POST and no request body.
3. App accepts only a matching public record with `authentication_provenance=user_confirmed_managed_session`, `login_state=logged_in`, `manual_authentication_state=completed`, and `recovery_required=false`.
4. App updates from the returned public fact, refreshes Harbor projections, and never infers login from page/DOM/cookie/storage signals.
5. Ineligible or invalid responses fail closed with a safe user diagnostic and no local login-state mutation.
6. A stored public session reference is restored only after a schema-validated retryable Harbor `session_missing` response, including a 404 response body returned through direct fetch or owner-API IPC; transport, authorization, server, malformed, fixture, and incomplete responses do not create a session.
7. Concurrent renderer refreshes for the same stored session share one recovery attempt.

## Non-goals

No Harbor implementation, automatic login detection, account material handling, task execution, submit/publish/send action, or App #265 carrier change.
