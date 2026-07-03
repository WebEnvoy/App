# Implementation Contract

## Scope

GH-105 may change renderer task-thread UI, local read-only fixtures, thin adapter code, CSS, smoke checks, and GH-105 Loom carriers needed for #105-#109.

## Required Boundaries

- Core task/run/result/failure projections are read-only and fixture/API-shaped.
- App-local fields must be UI-only and must not claim owner truth.
- direct Identity Runtime Session remains a Browser/Harbor session path and never creates Core Task/Run/Result.
- Site skill display consumes Lode capability/package metadata only; workflow runtime/editor UI remains out of scope.
- Electron main/preload must not carry task/run/result/evidence/capability/recovery business protocol truth.

## Forbidden Changes

- No #110-#113 or #95 implementation.
- No production Core/Harbor/Lode calls.
- No credentials, cookies, tokens, browser profile storage, raw evidence, Core Run Record truth, Harbor session truth, or Lode package truth in App storage.
- No write-side behavior, full Library, full Browser console, marketplace, signing, packaging, or auto-update.
