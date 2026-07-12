# APP-290 Specification

## Goal

The default App cannot execute BOSS search, detail, or write-precheck commands and consistently displays `目标站点当前访问受限，功能延期` without misrepresenting runtime, fixture, fallback, or historical success as current availability.

## Acceptance Criteria

- Every App BOSS task entry is disabled before Core submission and direct submit performs zero `POST /tasks` requests.
- Task Thread, Library, and identity task entry use the exact deferred text even when shared runtime and historical live task IDs are ready.
- Current BOSS projections contain no running, ready, available, success, or completed capability state.
- Only historical Core-live failures remain, with provenance, owner time, and failure class.
- BOSS identity summary and manual Harbor browser/session controls remain available under their existing runtime rules.
- Xiaohongshu behavior and shared runtime health are unchanged.

## Non-goals

No feature framework, BOSS capability/profile/history deletion, Core/Harbor/Lode change, production page access, login, sensitive-material read, submit, send, publish, or risk-control bypass.
