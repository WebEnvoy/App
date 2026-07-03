# Spec

## Goal

Repair stale Loom carrier state on `main` so the next GH-100 setup is no longer blocked by GH-117 merge-ready drift or the old GH-111 docs-only carrier.

## Required Behavior

- Keep the repair limited to `.loom` carrier state.
- Update `GH-117` progress to match the already-consumed closeout evidence.
- Remove merge-ready wording from `GH-117` status surface.
- Mark `GH-111` as a retired/superseded docs-only carrier and keep GitHub #111 open.
- Update the active fact-chain entrypoint to this repair lane while the repair branch is in flight.
- Prove with Loom checks that GH-111 is no longer reported as an active shared-workspace conflict and GH-117 is no longer reported as a merge-ready stale carrier.

## Non-Goals

- Do not implement any App shell/UI code.
- Do not edit product docs or milestone metadata.
- Do not close GitHub #111.
- Do not change Core/Harbor/Lode contracts or behavior.

## Suite Applicability

- Suite path: not_applicable
- Artifact: suite-level
- Rationale: Control-plane-only `.loom` carrier repair; no product code, schemas, dependencies, generated facts, runtime behavior, or external owner contracts change.
- Consumer boundary: Subsequent GH-100 setup may consume this repair only as control-plane hygiene evidence.
- Recheck condition: Require a stronger suite/review path if the branch expands beyond `.loom` carrier state.
