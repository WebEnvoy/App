# WebEnvoy App 仓库约定

本仓库是 `WebEnvoy/App`，负责 WebEnvoy 的统一人类用户入口和产品外壳。

App 可以承载 WebEnvoy Console、Harbor Profile / Runtime Session / Viewer UI、运行记录、证据查看和异常处理入口，但不承载 Core Runtime、Harbor Runtime 或 Lode 能力资产真相。

## 边界

- 任务执行必须通过 WebEnvoy API Server 和 Core Runtime；
- 浏览器身份与运行现场必须通过 Harbor Runtime API；
- 网站经验、能力包、任务封装和模板来自 Lode；
- App 不直接执行能力、不直接写 Run Record、不绕过 Harbor API 操作 Runtime Session；
- App 可以保存 UI 设置和非敏感缓存，但不作为任务、Profile、Session、Evidence 或能力资产的真相源。

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

默认主语言为 TypeScript / Node.js。UI 可以先采用本地 Web UI，后续再由 Desktop shell 承载。App-facing 类型应复用 WebEnvoy API、Harbor API 和共享 schema，不在 App 内自行定义不兼容模型。

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

本仓库采用 Loom execution-control（standard maturity）承接正式执行事实链。正式实现、review、merge-ready 或 closeout 前，先从 Loom 入口恢复当前事实：

1. 运行 `loom doctor --target . --json` 和 `loom verify --target . --json`。
2. 运行 `loom fact-chain --target . --json`，确认 `Work Item -> progress -> status -> review/merge-ready` 事实链可读。
3. 以 `.loom/work-items/**` 作为静态执行入口，以 `.loom/progress/**` 和 `.loom/status/current.md` 作为恢复与状态读取入口；GitHub issue / PR 是宿主控制面，不替代仓内事实链。
4. merge-ready / closeout 前必须消费 Loom review、验证摘要、PR head 和事实链当前状态。

Loom CLI、Codex plugin 和 skills 由用户级全局安装提供；不要把 repo-local Loom runtime、plugin payload、skills payload 或 runtime/cache 写入仓库。运行态只应留在 `.loom/runtime/`、`.loom/tmp/`、`.loom/cache/`、`.loom/local/` 等忽略路径。

默认不启用 `strong-governance`。当事项涉及安全、数据、权限、运行时身份、发布、生产写入、强 merge gate，或可能破坏跨仓共享合同/API/Schema 时，先评估并显式升级到 `strong-governance` 再继续。
<!-- LOOM_BOOTSTRAP_END -->
