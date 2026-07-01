# GH-86 Spec

## Goal

Clarify App desktop architecture as a cross-platform shell plus minimal native integration.

## Required Result

- Electron, React, and Radix own the product experience.
- Native code only wraps OS boundary capabilities: processes, files, notifications, windows, keychain, and profile paths.
- Native code must not own task/run/result/capability/evidence/recovery WebEnvoy business protocols.

## Non-Goals

No implementation, dependency, project skeleton, IPC/API detailed spec, or cross-repo edits.

## Suite Applicability

- Suite path: not_applicable
- Artifact: suite-level
- Rationale: This PR is docs-only and item-specific carrier-only. It changes ADR and AGENTS wording but no code, package manifests, dependencies, generated files, IPC/API, runtime behavior, fixtures, migrations, or cross-repo contracts.
- Consumer boundary: Later App UI skeleton and desktop shell Work Items consume ADR 0007 and AGENTS constraints.
- Recheck condition: Require suite/spec validation if this PR starts code, package manifests, dependencies, IPC/API/client/runtime behavior, generated files, fixtures, migrations, or Core/Harbor/Lode changes.

Minimal docs-only. Recheck with stronger suite if any code, package manifest, dependency, generated file, IPC/API, runtime behavior, or cross-repo contract changes are added.
