# APP-236 Plan

## Suite Path

- Suite path consumed: minimal
- The plan's automated checks establish only the App consumer boundary. Harbor #241 merge and packaged App E2E remain required to prove a real logged-in identity state.

1. Add a session-bound Harbor client operation with projection eligibility and public-response validation.
2. Add the explicit recovery-panel action and render its returned public state before refreshing the owner projection.
3. Extend the focused smoke contract for success, refreshed state, and local-only fail-closed behavior.
4. Validate complete Harbor runtime session facts, require the explicit `session_missing` response before recovery, and share concurrent recovery attempts.
