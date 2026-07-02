# Spec

## Goal

通过 docs-only 方式记录 milestone #9 的 Desktop Task Thread 设计 checkpoint，让 FR #92
进入产品 review；不创建代码、依赖或 UI skeleton。

## Required Behavior

- 修订 `VISION.md`，明确 App 面向人类业务用户，不是 Agent 容器。
- 明确限制只作用于 App 自动任务执行入口；Agent、API、CLI、MCP、SDK、skills 等其他调用方不受此限制。
- 明确 App 也展示非 App 调用方产生的运行事实。
- 明确没有合适站点技能时，用户可以启动受控浏览器实例进行手动浏览、登录、观察或准备环境。
- 明确 Library 和 Browser 管理面仍存在，不因 Task Thread first 被取消。
- 记录 `Task = 站点技能 + 账号身份 + 业务输入`，`Run = 同一 Task 下的一次执行记录`。
- 记录左侧任务组织：`任务 -> 账号身份 -> 站点技能 -> Task`。
- 记录中间 Task Thread：title/chips、Codex-like navigation rail、任务结束报告、可折叠执行过程、底部固定控制区。
- 记录右侧上下文面板：结果依据、执行现场、账号身份、站点技能、诊断。
- 将选定方向稿纳入版本控制，并明确它是方向参考，不是像素规范或数据合同。
- 创建 `DESIGN.md`，沉淀可延续的桌面设计契约。
- Desktop shell native boundary 确认 Electron main/native layer 只封装 OS 能力，
  不承载 WebEnvoy business protocols。
- 记录 #93/#94/#95 的实现入口条件。
- Docs indexes 指向 checkpoint 和设计契约。

## Non-Goals

- 不做高保真原型。
- 不冻结最终数据结构。
- 不创建 Electron、Vite、React、TypeScript、package manager、component、route、
  client、storage、schema、fixture、generated type、API implementation 或 UI code。
- 不修改 Core、Harbor、Lode、research 或 sources repository。
- 不 merge PR，不做 issue closeout。
- 不关闭或实现 #93、#94、#95。

## Suite Applicability

- Suite path: not_applicable
- Artifact: suite-level
- Rationale: This PR is docs-only and item-specific carrier-only. It changes
  VISION/DESIGN/ADR/checkpoint documentation, a versioned design reference image,
  docs indexes, and Loom carrier files but no code, schemas, generated facts,
  runtime behavior, package manifests, dependencies, migrations, fixtures, or raw
  evidence handling.
- Consumer boundary: Later #93/#94/#95 implementation planning and review may
  consume VISION.md, DESIGN.md, ADR 0008, the design reference image, and GH-96
  carrier as design checkpoint facts only.
- Recheck condition: Require suite/spec validation if this PR starts Electron,
  UI code, package manifests, dependencies, schema/API/client/runtime behavior,
  generated types, fixtures, migrations, raw evidence handling, Core/Harbor/Lode
  changes, or shared Loom carrier changes beyond GH-96.

## Covered Issues

- #92
- #96, #97, #98, #99
