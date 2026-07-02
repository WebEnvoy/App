# WebEnvoy App 仓库约定

本仓库是 `WebEnvoy/App`，负责 WebEnvoy 的统一人类用户入口和产品外壳。

App 可以承载 WebEnvoy Console、Harbor Profile / Runtime Session / Viewer UI、运行记录、证据查看和异常处理入口，但不承载 Core Runtime、Harbor Runtime 或 Lode 能力资产真相。

## 边界

- 任务执行必须通过 WebEnvoy API Server 和 Core Runtime；
- 浏览器身份与运行现场必须通过 Harbor Runtime API；
- 网站经验、能力包、任务封装和模板来自 Lode；
- App 不直接执行能力、不直接写 Run Record、不绕过 Harbor API 操作 Runtime Session；
- App 可以保存 UI 设置和非敏感缓存，但不作为任务、Profile、Session、Evidence 或能力资产的真相源。

## 产品语义边界

- App 面向人类业务用户，不是 Agent 容器；Agent 通过 API、CLI、MCP、SDK 或 skills 使用 WebEnvoy。
- App 自动任务入口只执行 Lode 提供的站点能力入口；当前实现先消费 capability package metadata，后续可升级为 workflow package。手动浏览实例属于 Browser/Harbor session 管理路径，不创建 Core Task/Run，不产生 Result Envelope，也不代表 Lode capability 被执行。
- 只有用户显式从站点技能发起自动任务时，App 才向 Core 提交 task intent。
- `Task = 站点技能 + 账号身份 + 业务输入` 是 App 用来组织体验的 Task Thread key；Core 仍拥有 task intent 和 run record truth。
- App 必须能呈现 Agent/API/CLI/MCP/SDK/skills 等非 App 调用方产生的运行事实。
- Task Thread first 是默认桌面体验，不取消 Library 的站点技能/能力资产管理面，也不取消 Browser 的账号身份/运行现场管理面。
- UI 实现前必须读取 `VISION.md`、`DESIGN.md`、`docs/adr/0008-desktop-ui-design-checkpoint.md` 和 `docs/design/desktop-task-thread-direction.png`。

## 目录方向

后续代码建议按以下方向组织：

```text
apps/
  shell/
  web-ui/
packages/
  app-client/
  api-client/
  harbor-client/
  ui-components/
  state/
docs/
examples/
```

## 技术默认

默认主语言为 TypeScript / Node.js。产品形态按 Desktop App first 设计；开发期可以用本地 Web UI 调试，生产承载默认由 Desktop shell 提供。App-facing 类型应复用 WebEnvoy API、Harbor API 和共享 schema，不在 App 内自行定义不兼容模型。

## Desktop App 技术基线

- 产品形态默认 Desktop App first；开发期 localhost/Web UI 只是调试载体，不定义最终产品体验。
- Desktop shell 默认 Electron；UI 默认 React、TypeScript、Vite、Radix UI primitives 和 `lucide-react`。
- App 采用“跨平台 shell + 最小原生集成”：Electron / React / Radix 承载主要产品体验；原生层只封装进程、文件、通知、窗口、keychain、profile 路径等 OS 边界能力，不承载 task/run/result/capability/evidence/recovery 等 WebEnvoy 业务协议。
- 不安装依赖、不初始化 Electron/Vite/React 项目、不创建组件库，除非当前 Work Item 明确是代码骨架或实现项。
- Tauri/Rust、Next.js、重型设计系统、手写图标系统或外部 UI shell 迁入，需要新的 ADR 或对应 Work Item 明确接受。
- UI 实现前必须完成低保真 IA、状态矩阵和 Browser/connection 优先级的产品设计 checkpoint；worker 不能自行把临时 UI 当最终方向。
- App 只通过 Core、Harbor、Lode owner API 读取事实或发送用户意图；Electron shell 不能绕过 owner API，也不能替代 Core/Harbor/Lode。
- App 只可保存 endpoint choice、recent views、filters、layout preference 和带 `source` / `fetched_at` / stale marker 的非敏感 display cache。
- App 禁止保存 credential、cookie、token、browser profile storage、Core Run Record truth、Harbor runtime/session truth、Lode package/fixture body、raw evidence、完整 DOM、HAR、trace、video、network body 或下载文件。
- 代码实现项的测试应优先使用仓库已有脚本；UI skeleton 至少要覆盖 TypeScript/build 可运行性和关键状态渲染检查。docs-only PR 只需要 Markdown/JSON 可读性与 `git diff --check` 等最小验证。
- 变更范围必须绑定当前 Work Item；docs-only 技术基线不得顺手创建代码骨架、安装包、重构目录或修改 Core/Harbor/Lode。

## 路线图 / 里程碑 / 功能需求 / 工作项

- 跨仓长期方向以 `WebEnvoy/.github/ROADMAP.md` 为准。
- 当前执行状态以 GitHub Milestones、Project、issues 和 PR 为准，不在仓库文档中复制维护。
- GitHub Milestone 只承载当前 1-3 个可交付阶段，不承载全部远期设想。
- 功能需求（FR）issue 表达用户可见或系统可验证的能力增量。
- 工作项（Work Item）issue 是可由一个 PR 完成的最小执行单元。
- 新建功能需求或工作项前，先确认它属于当前活跃 Milestone；不属于则回到总 ROADMAP 或 backlog。
- 创建或调整 Milestone、功能需求或工作项前，先检查本仓 `docs/adr/pending-decisions.md`；会阻塞当前事项的决策必须链接到 issue，并标明阻塞级别：`Milestone blocker`、`FR blocker`、`Work Item blocker`、`Spec detail` 或 `Deferred`。
- 被决策阻塞的 issue 使用 `status: needs-decision`；决策完成后必须回写对应 ADR 或 `docs/adr/pending-decisions.md`，再继续拆分或实施。
- 仓库级 `ROADMAP.md` 是组织级 ROADMAP 的本仓投影，只能说明本仓如何服务总路线，不能新增跨仓阶段、重定义目标状态或覆盖组织级边界。
- 除仓库级 `ROADMAP.md` 外，单仓 planning 文档只能解释本仓如何服务当前活跃 Milestone，不能新增跨仓 Milestone。
- 不允许在单仓创建与总 ROADMAP 冲突的平行路线图。
- 规格文档只服务当前或下一个活跃 Milestone，不提前铺满远期设计。
- 涉及跨仓方向、阶段阶梯或边界调整时，先更新或评审总 ROADMAP / 跨仓架构，再拆单仓事项。

## 许可证

本仓库属于 AGPL 核心产品表面仓库。面向外部集成的通用 SDK、协议定义和生成类型如需更宽松许可，应优先放入独立 contracts / SDK 仓库，而不是放入 App 内部实现路径。

<!-- LOOM_BOOTSTRAP_START -->
## Loom Bootstrap

本仓库采用 Loom execution-control 承接正式执行事实链，并默认按 strong-governance 评估正式 Work Item。开始实现、review、merge-ready 或 closeout 前，先运行 `loom doctor --target . --json`、`loom verify --target . --json` 和 `loom fact-chain --target . --json`。

默认策略：中高风险、跨仓、API/Schema、数据、安全、权限、运行时身份、发布、生产写入或 merge gate 相关事项按 `strong-governance` 执行；只有明确低风险事项才可在 PR metadata 中降为 `standard`。

执行事实链固定为 `.loom/work-items/**`、`.loom/progress/**`、`.loom/status/current.md`、`.loom/reviews/**` 和 `.loom/specs/**`。GitHub issue / PR 是宿主控制面，不替代仓内事实链。

宿主强制条件由 GitHub branch protection / repository ruleset 承接：`py-compile`、`demo-bootstrap`、`repo-local-cli`、`loom-check` 和 `loom-pr-merge-gate` 必须作为 required checks 通过。单人开发不启用 GitHub 原生 required PR review；semantic approval 必须来自绑定当前 head 的 Loom authored review record。

Loom CLI、Codex plugin 和 skills 由用户级全局安装提供；不要把 repo-local Loom runtime、plugin payload、skills payload 或 runtime/cache 写入仓库。运行态只应留在 `.loom/runtime/`、`.loom/tmp/`、`.loom/cache/`、`.loom/local/` 等忽略路径。
<!-- LOOM_BOOTSTRAP_END -->

## Loom / PR / closeout 约束

- `INIT-0001` 只用于 Loom bootstrap 或 gate repair；产品、规划、边界和实现 PR 必须绑定真实 GitHub Work Item，并使用对应的 item-specific Loom carrier。
- PR body、`.loom/work-items/**`、`.loom/progress/**` 和 `.loom/reviews/**` 必须指向同一 Work Item、branch 和 head 链路；每次 push 后回读 `Loom Work Item`、`Branch`、`Head SHA` 和 review artifact 的 `reviewed_head`。
- 如果 Loom workflow 或 gate 本身有问题，先用独立 repair PR 合入 `main`，再更新产品 PR 到新 base；不要在旧 gate 上反复重跑产品 PR。
- 本地 gate 验证必须匹配 hosted workflow 的真实入口；当前 workflow 直接调用 packaged `loom_flow.py`，不要改回会清理执行上下文的外层 `loom` wrapper。
- `suite not_applicable` 只适用于真实 docs-only 或 workflow-only PR，并必须写清原因、覆盖 head、consumer boundary 和重新要求 suite 的条件。
- 不并行改同一个共享 Loom carrier；同一 PR 默认只维护自己的 item-specific carrier。确需修改 `.loom/status/current.md` 时，必须由当前 PR 串行更新，并确认默认 `loom fact-chain` 不产生 active item 漂移。
- issue closeout 不等于 PR merge；关闭 issue 前必须写 post-merge 证据：PR、merge commit、head、hosted run、仓内事实载体和范围限制。
