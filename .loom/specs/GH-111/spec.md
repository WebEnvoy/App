# Spec

## Goal

Clarify App boundary wording before #111 implementation without completing #111.

## Required Behavior

- `Task = 站点技能 + 账号身份 + 业务输入` remains an App Task Thread key only.
- Core keeps task intent and run record truth.
- Manual browser instances stay in Browser/Harbor session management; they do not create Core Task/Run, Result Envelope, or Lode capability execution.
- Site skill is App's product name for a Lode site capability entry.
- Current implementation should consume capability package metadata first; workflow package is a future extension.
- #111 should explain Lode package/capability source, not require workflow editor/runtime UI.

## Non-Goals

- Do not complete or close #93, #94, #95, or #111.
- Do not implement UI, workflow runtime, workflow editor, Core task submission, Harbor session behavior, or Lode package behavior.
- Do not modify Core, Harbor, or Lode.

## Suite Applicability

- Suite path: not_applicable
- Artifact: suite-level
- Rationale: Docs-only boundary clarification plus item-specific Loom carrier. No code, schema, generated facts, runtime behavior, package manifests, dependencies, fixture, raw evidence, or workflow runtime changes.
- Consumer boundary: #93/#94/#95/#111 implementation work may consume this as boundary wording only.
- Recheck condition: Require stronger suite/review if this PR adds UI code, schema/API/client/runtime behavior, package manifests, generated types, fixtures, Core/Harbor/Lode changes, or workflow runtime/editor behavior.

## Related Issues

- #93
- #94
- #95
- #111
