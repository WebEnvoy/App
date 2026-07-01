# Spec

## Goal

通过 docs-only 方式记录 milestone #9 的 Desktop App UI 设计 checkpoint，让 FR #92
进入产品 review；不创建代码、依赖或 UI skeleton。

## Required Behavior

- 记录 Work/Library/Browser/Settings 低保真 IA。
- 记录默认首屏和首个只读任务流。
- Task、run、result、evidence、capability source、Browser runtime 和 connection
  health 状态矩阵覆盖 loading、empty、success、failed、redacted、expired、
  unavailable、stale 和 applicable 的 unknown outcome。
- 记录 failure、empty、loading 和 connection exception 的文案/动作规则。
- Desktop shell native boundary 确认 Electron main/native layer 只封装 OS 能力，
  不承载 WebEnvoy business protocols。
- ADR 中记录 Desktop Taste 插件输入。
- #93/#94/#95 可以声称最终 UI 方向前，列出用户确认点。
- 记录 #93/#94/#95 的实现入口条件。
- Docs/contracts indexes 指向 checkpoint。

## Non-Goals

- 不做高保真视觉稿。
- 不创建 Electron、Vite、React、TypeScript、package manager、component、route、
  client、storage、schema、fixture、generated type、API implementation 或 UI code。
- 不修改 Core、Harbor、Lode、research 或 sources repository。
- 不 merge PR，不做 issue closeout。
- 不关闭或实现 #93、#94、#95。

## Suite Applicability

- Suite path: not_applicable
- Artifact: suite-level
- Rationale: This PR is docs-only and item-specific carrier-only. It changes
  ADR/checkpoint documentation, docs indexes, and Loom carrier files but no code,
  schemas, generated facts, runtime behavior, package manifests, dependencies,
  migrations, fixtures, or raw evidence handling.
- Consumer boundary: Later #93/#94/#95 implementation planning and review may
  consume ADR 0008, docs/contracts index, and GH-96 carrier as design checkpoint
  facts only.
- Recheck condition: Require suite/spec validation if this PR starts Electron,
  UI code, package manifests, dependencies, schema/API/client/runtime behavior,
  generated types, fixtures, migrations, raw evidence handling, Core/Harbor/Lode
  changes, or shared Loom carrier changes beyond GH-96.

## Covered Issues

- #92
- #96, #97, #98, #99
