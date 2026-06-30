# Implementation Contract

- Write scope: `docs/adr/0006-stage2-task-entry-and-display-contract.md`, `docs/adr/pending-decisions.md`, `.loom/**/GH-37*`, `.loom/status/current.md`, and minimal `.loom/bootstrap/init-result.json` metadata only if needed for active item readout.
- Allowed shared status update: `.loom/status/current.md` may point to GH-37 for this active PR.
- Forbidden scope: Core/Harbor/Lode changes, App UI/code, App shell, schema, API client, runtime, storage, evidence viewer, Settings implementation, shared fixture files, conformance runner, generated artifacts, real package/validator behavior, true-write behavior, external-visible live actions, issue closeout, merge, `INIT-0001`, and unrelated Work Item carriers.
- Validation floor: whitespace check, JSON validation, Loom fact-chain/suite/carrier validation for GH-37 where available, PR metadata readback, and hosted basic checks.
