# APP-282 Specification

## Goal

The first real Harbor-managed browser launch can complete within a bounded owner API wait and return its real session/viewer refs without a duplicate user action.

## Acceptance Criteria

- Protected Harbor session lifecycle requests receive a 20-second owner API timeout.
- Core `POST /tasks` remains 65 seconds and ordinary owner requests remain 5 seconds.
- Timeout or failure remains fail-closed and cannot synthesize refs.
- Packaged E2E must prove first-launch refs before #282 closes.

## Non-goals

No Harbor contract, browser launcher, login automation, external write, or site capability change.
