# Implementation Contract

## Allowed Files

- Renderer UI and fixture files needed for #95 context tabs and smoke coverage.
- `.loom/work-items/GH-110.md`, `.loom/progress/GH-110.md`, `.loom/status/current.md`, `.loom/bootstrap/init-result.json`, `.loom/specs/GH-110/**`, and later GH-110 review/build evidence carriers.

## Disallowed Changes

- No product scope beyond #110-#113.
- No live Core/Harbor/Lode calls.
- No credential, cookie, token, browser profile, raw evidence, Run Record, Harbor session, or Lode package truth persistence.
- No workflow runtime/editor, write-side behavior, full Library lifecycle, or full Browser management.

## Required PR Metadata

- `Loom Work Item: GH-110`
- `Covered Work Items: #110, #111, #112, #113`
- `Refs #95 #110 #111 #112 #113`
- `Out of scope: Stage 5, Library lifecycle, write-side, full Browser management`
