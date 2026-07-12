# APP-290 Spec Suite

## Path Decision

- Suite path: minimal
- Rationale: App-only fail-closed UI and submit guard; no owner contract, external runtime, or real-site behavior changes.
- Provenance: App issue #290 and local zero-request regression evidence on 2026-07-12.

## Artifact Inventory

| Artifact | Locator | Status | Consumer |
| --- | --- | --- | --- |
| Specification | `.loom/specs/APP-290/spec.md` | present | build and review |
| Plan | `.loom/specs/APP-290/plan.md` | present | build and validation |
| Implementation contract | `.loom/specs/APP-290/implementation-contract.md` | present | ownership and invariants |
| Execution breakdown | `.loom/specs/APP-290/execution-breakdown.md` | present | task mapping |
| Task carrier | `.loom/specs/APP-290/task-carrier.md` | present | GitHub binding |
| Evidence map | `.loom/specs/APP-290/evidence-map.md` | present | validation evidence |
| Build evidence | `.loom/specs/APP-290/build-evidence.json` | present | merge checkpoint |

## Recheck Conditions

- Upgrade to full if Core/Lode contracts, BOSS admission, task payloads, or external-page behavior change.

## Not Applicable Items
### Full-Path Artifacts
- Locator: `contracts.md`, `readiness-checklist.md`, `research.md`, and the full-path `suite-index.md` contract are not_applicable.
- Rationale: This minimal App-only fail-closed change consumes existing task IDs and runtime state without changing an owner or cross-repository contract.
- Recheck condition: Author the full-path artifacts if Core/Lode contracts, BOSS admission, task payloads, or external-page behavior change.
- Consumer boundary: Suite validation and PR readiness may consume this rationale; current-head review, tests, hosted checks, and closeout evidence remain required.
