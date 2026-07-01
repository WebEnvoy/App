# Spec

## Goal

Make milestone #8 ready for PR review by recording the Desktop App technical
baseline in App docs without creating code, dependencies, or UI skeletons.

## Required Behavior

- Desktop App first is accepted as the product shape.
- Electron is the default desktop shell.
- React, TypeScript, Vite, Radix UI primitives, and `lucide-react` are the default UI stack.
- Localhost/Web UI is allowed as a development carrier but does not define final product IA.
- Electron shell remains an App carrier and does not replace Core, Harbor, or Lode owner APIs.
- Work/Library/Browser/Settings desktop IA is documented as a baseline input for UI design.
- UI product design checkpoint inputs are documented before later skeleton work can claim final direction.
- Core, Harbor, and Lode client boundaries and source/fetched_at/stale/unavailable connection states are documented.
- App local settings/cache allowed list and sensitive no-store list are documented.
- `AGENTS.md` records stack, dependency, test, change-range, and security constraints.
- `docs/contracts/README.md`, `docs/README.md`, and `README.md` point to the accepted baseline.
- Research locators are explicitly absorbed, trimmed, referenced, or rejected.

## Non-Goals

- No Electron, Vite, React, package manager, component, route, client, storage, schema, fixture, generated type, API implementation, or UI code.
- No Core, Harbor, Lode, research, or sources repository changes.
- No PR merge and no issue closeout.

## Suite Applicability

- Suite path: not_applicable
- Artifact: suite-level
- Rationale: This PR is docs-only and item-specific carrier-only. It changes accepted architecture docs, indexes, and agent constraints but no code, schemas, generated facts, runtime behavior, package manifests, dependencies, migrations, or fixtures.
- Consumer boundary: Later UI skeleton and design Work Items consume ADR 0007, AGENTS constraints, and docs/contracts index.
- Recheck condition: Require suite/spec validation if this PR starts code, package manifests, dependencies, schema/API/client/runtime behavior, generated types, fixtures, migrations, or shared Loom carrier changes beyond GH-75.

## Covered Issues

- #74, #75, #76, #77, #78
- #79, #80, #81, #82, #83
