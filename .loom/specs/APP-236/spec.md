# APP-236 Specification

## User Story

After completing a manual login in a Harbor-managed browser, a user can explicitly confirm completion in App. App submits the session-bound intent and displays only the returned Harbor public identity fact.

## Acceptance

1. The confirmation action is rendered only for a Harbor live identity with an active user-controlled session projection.
2. App calls the exact Harbor #241 route with POST and no request body.
3. App accepts only a matching public record with `authentication_provenance=user_confirmed_managed_session`, `login_state=logged_in`, `manual_authentication_state=completed`, and `recovery_required=false`.
4. App updates from the returned public fact, refreshes Harbor projections, and never infers login from page/DOM/cookie/storage signals.
5. Ineligible or invalid responses fail closed with a safe user diagnostic and no local login-state mutation.

## Non-goals

No Harbor implementation, automatic login detection, account material handling, task execution, submit/publish/send action, or App #265 carrier change.
