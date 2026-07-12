# APP-239 Specification

- Suite Path: full

## Acceptance

1. App accepts detail targets only from a successful Core-live Xiaohongshu search result and only when each target is an opaque `detail_ref`; fixture, URL, note ID, xsec, duplicate, empty, or over-limit targets cannot create a command.
2. Selecting one target sends exactly one Core `read-note-detail` task with the selected `detail_ref` and identity environment; payload contains no public query, URL, note ID, xsec, or free text.
3. Polling and owner queries use Core-returned run IDs and project validated detail public fields plus source/evidence/post-check/session refs through the existing Task Thread UI.
4. Core unavailable, target expiry/replay/binding drift, challenge, or malformed result fails closed and never falls back to a fixture success.
5. BOSS remains deferred and issues zero owner task requests. Xiaohongshu search behavior remains intact.

## Evidence Boundary

Local smoke proves App contract and UI state only. Closing #239/#241 additionally requires the merged packaged App to complete a real Xiaohongshu search-to-detail run with Core/Harbor refs under the allowed read-only boundary.
