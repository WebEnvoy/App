# GH-86 Spec

## Goal

Clarify App desktop architecture as a cross-platform shell plus minimal native integration.

## Required Result

- Electron, React, and Radix own the product experience.
- Native code only wraps OS boundary capabilities: processes, files, notifications, windows, keychain, and profile paths.
- Native code must not own task/run/result/capability/evidence/recovery WebEnvoy business protocols.

## Non-Goals

No implementation, dependency, project skeleton, IPC/API detailed spec, or cross-repo edits.

## Suite Path

- Suite path: not_applicable

Minimal docs-only. Recheck with stronger suite if any code, package manifest, dependency, generated file, IPC/API, runtime behavior, or cross-repo contract changes are added.
