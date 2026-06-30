# Pending Decisions

本文件是 App ADR 的唯一待决策索引。Draft ADR 可以保留 `Open Questions`，但必须引用这里的 ID；Accepted ADR 的非阻塞后续项也必须引用这里的 ID。

## 2026-06-30 第一阶段边界结论

本节承载 App #6、#7、#8、#9、#10、#11 的第一阶段结论。依据来自本仓 `AGENTS.md`、`README.md`、`ROADMAP.md`、`VISION.md`、`docs/draft/*`、`docs/adr/0001-0004`，以及组织级 `.github/ROADMAP.md`、`WebEnvoy/ROADMAP.md`、`Harbor/ROADMAP.md`、`Lode/ROADMAP.md`、`research/synthesis.md`、`research/absorability/themes/evidence-and-observability.md`、`research/absorability/themes/browser-identity-and-runtime.md` 在 2026-06-30 的当前内容。

### FR 汇总

| Issue | 结论 | 状态 | 后续阻塞 |
|---|---|---|---|
| App #6 | App 是统一人类入口，只展示 Core、Harbor、Lode 的上游事实并发送用户意图；不得成为 Run Record、Runtime Session、Evidence 或 Lode 资产真相源。 | accepted | 不阻塞第一阶段 closeout；后续字段合同进入阶段二。 |
| App #7 | Work、Library、Browser、Settings 均只能消费上游 facts 或保存本地 UI 状态；不能在 App 内复制上游状态机。 | accepted | 精确字段仍由 Core/Harbor/Lode 合同决定。 |
| App #8 | App 可保存非敏感 UI 设置、连接配置和短期展示缓存；不得保存 credential、raw evidence、browser storage、Run Record 或 Lode package truth。 | accepted | Evidence 默认展示与 retention 继续引用 PD-0012 至 PD-0016。 |
| App #9 | 第一阶段产品域为 Work、Library、Browser、Settings；前三者分别对应 Core、Lode、Harbor，Settings 只管理本地连接与偏好。 | accepted | Settings 不新增独立业务 truth。 |
| App #10 | 四个产品域职责以用户可见表面定义，不定义最终入口 UI 或代码结构。 | accepted | 后续 UI 形态由阶段二以后规格决定。 |
| App #11 | 各域消费的上游事实已列清；App #9 可提出消费需求，但不拥有事实生产责任。 | accepted | 上游 pending 项由 Core/Harbor/Lode/App 后续里程碑收敛。 |

### App 只展示上游事实的边界

| 用户场景 | 展示内容 | 用户意图 | 上游事实来源 | 禁止行为 | 状态 |
|---|---|---|---|---|---|
| Work 查看任务、运行、结果、证据和恢复 | task、run、result、failure、recovery prompt、evidence refs、capability/version attribution | submit、stop、retry、resume、open evidence、report recovery done | WebEnvoy Core Run Record / Result / Recovery facts；Harbor runtime/evidence refs；Lode capability metadata | App 写 Run Record、定义 Core 状态机、直接执行 capability、复制 evidence store | accepted |
| Library 浏览平台资产与个人资产 | site knowledge、capability package、task template、version、fixtures、install/update/lock/failure markers、draft refs | install、update、lock、fork、draft、test、repair、report breakage | Lode catalog / package / registry facts；Core run attribution；Harbor snapshot/evidence refs for exploration | App 定义 Lode package schema、保存官方资产真相、把本地 draft 当成 Lode truth、直接运行 capability | accepted |
| Browser 管理浏览器身份和现场 | Profile、Browser Identity、Runtime Session、Viewer、Takeover、provider capability facts、health | create/select/open/stop session、open viewer、request takeover | Harbor Runtime API、Profile/Session/Viewer/provider facts | App 直接管理 browser process、profile directory、CDP/VNC endpoint、判断任务业务成功 | accepted |
| Settings 配置本地入口 | API endpoint、Harbor endpoint、Lode source、data directory、privacy/evidence display preference、connection health snapshot | connect、test connection、choose local paths、adjust UI preference | User local config；Core/Harbor/Lode health and capability endpoints | Settings 覆盖上游 retention/security policy、保存 credential 或上游业务 truth | accepted |

### App 可保存的 UI 设置和缓存边界

| 对象/事实 | 本仓归属 | 非本仓归属 | 消费方 | 依据 | 状态 |
|---|---|---|---|---|---|
| UI 偏好、布局、筛选、最近打开视图 | App 可本地保存非敏感值 | 不适用 | Work、Library、Browser、Settings | `README.md`、`docs/draft/local-runtime.md` 允许 UI 设置 | accepted |
| API / Harbor / Lode endpoint 与连接健康缓存 | App 可保存用户配置和带时间戳的健康快照 | 服务真实状态由 Core、Harbor、Lode 拥有 | Settings、全局 shell | `ROADMAP.md` 和 `docs/draft/local-runtime.md` 定义连接状态 | accepted |
| 展示缓存：列表分页、排序、非敏感 metadata、允许缓存的 thumbnail | App 可作为短期 UI cache，必须可重建 | 原始 facts 仍由 Core、Harbor、Lode 拥有 | Work、Library、Browser | ADR 0004 允许 UI thumbnail / 非敏感展示 metadata | accepted |
| Explorer / repair draft 的编辑缓冲 | App 可保存提交前 UI 草稿；提交后必须落到 Lode 或对应 owner API | Lode 拥有资产、schema、version、fixtures 和 registry truth | Library | `VISION.md`、`docs/draft/library-workbench.md` | accepted |
| Run Record、result、failure、recovery state | 无 App truth ownership | Core | Work | 组织 ROADMAP、Core ROADMAP、ADR 0002/0004 | rejected |
| Evidence artifact：raw screenshot、trace、HAR、video、download、network body | 无 App truth ownership；只展示 ref、summary 或 policy 允许的 thumbnail | Core/Harbor evidence policy 和 store | Work、Browser | research evidence-and-observability、ADR 0004 | rejected |
| Harbor Profile、Runtime Session、browser storage、Cookie/localStorage | 无 App truth ownership | Harbor | Browser、Work recovery | Harbor ROADMAP、research browser-identity-and-runtime | rejected |
| Lode package、catalog schema、fixtures、registry、official asset state | 无 App truth ownership | Lode | Library、Work | Lode ROADMAP、ADR 0004 | rejected |
| Credential、secret、账号密码、完整 DOM、完整请求响应、未脱敏业务内容 | 不保存 | 对应 owner policy 或用户显式授权机制 | 所有域 | 组织 ROADMAP 隐私边界、research synthesis | rejected |

### 产品域职责

| 产品域 | 用户可见职责 | 写侧用户意图 | 不拥有 | 状态 |
|---|---|---|---|---|
| Work | 提交任务意图，查看运行、结果、失败、证据和恢复入口 | submit、cancel/stop、retry、resume、approve/decline future action request | Core execution、Run Record、Result Envelope、Admission、Action Risk | accepted |
| Library | 浏览、安装、锁定、更新、测试、修复和上报能力资产；管理个人 draft/overlay/fork 入口 | install、update、lock、fork、save draft、report invalidation | Lode package/schema/registry/version truth；Core execution | accepted |
| Browser | 查看和进入 Profile、Runtime Session、Viewer、takeover、provider facts | create/select/open/close session、take control、return control | Harbor runtime/session/provider truth；Core task result | accepted |
| Settings | 管理本地连接、目录、隐私展示偏好、诊断入口和版本信息 | configure、test connection、clear UI cache | Core/Harbor/Lode truth、credential vault、evidence retention policy | accepted |

### 各产品域消费的上游事实

| 字段/事实 | 生产者 | 消费者 | 保留/脱敏规则 | 依据 | 状态 |
|---|---|---|---|---|---|
| task、run、status、result、failure、recovery prompt、action request、evidence refs | Core | Work；Settings 只看连接健康 | App 只保留引用、摘要和 UI cache；durable record 在 Core | Core ROADMAP、ADR 0002/0004 | accepted |
| capability/task package identity、version、catalog metadata、fixtures、install/lock/update/failure markers | Lode | Library、Work | App 可缓存非敏感 metadata；package truth 与 version 在 Lode | Lode ROADMAP、ADR 0004 | accepted |
| Profile、Browser Identity、Runtime Session、Viewer entry、takeover availability、provider capability facts、runtime health | Harbor | Browser、Work recovery、Library Explorer | App 只保存选择和最近使用 UI 状态；session/profile truth 在 Harbor | Harbor ROADMAP、ADR 0002/0003 | accepted |
| Snapshot / RefMap / evidence ref / page state summary | Harbor 采集，Core 或 Lode 按合同引用 | Work、Library Explorer、Browser | 默认 ref-over-value；raw artifact 按 evidence policy 打开 | research synthesis、research evidence-and-observability | accepted |
| endpoint、local path、display preference、cache policy | User/App local config | Settings、所有域 shell | 仅非敏感本地保存；secret 和 credential 不进入 App 普通设置 | `docs/draft/local-runtime.md` | accepted |
| evidence type 列表、thumbnail 默认可见性、redacted/expired 状态 | Core/Harbor/App 后续规格 | Work、Browser | 先按 ref/summary 展示；默认不保存 raw evidence | PD-0012、PD-0013、PD-0014 | needs-product-decision |
| Lode catalog filter/search 稳定字段 | Lode/App 后续规格 | Library | App 不先定义字段真相 | PD-0015 | needs-product-decision |
| run history retention UI 是否有 App local-only 设置 | Core/App 后续规格 | Work、Settings | 不能覆盖 Core retention policy | PD-0016 | needs-product-decision |

### Rejected / Deferred 边界

| 事项 | 判断 | 原因 | 状态 |
|---|---|---|---|
| 在 App 内实现 UI/App shell 或代码骨架来证明本阶段 | 不做 | 本阶段只要求边界文档事实载体。 | rejected |
| App 复制 Core、Harbor、Lode facts 到自有 durable truth | 不做 | 会制造第二份 truth source。 | rejected |
| App 定义最终入口 UI、字段 schema 或状态机 | 不做 | 当前阶段只定义职责和消费边界。 | rejected |
| 精确 evidence type、catalog search fields、handoff reason taxonomy | 后续规格 | 需要上游合同稳定后再消费。 | deferred |

## 2026-06-30 首个只读任务旅程与入口吸收结论

本节承载 App #12 至 #23 的第一阶段剩余结论。依据来自本仓 `AGENTS.md`、`ROADMAP.md`、`docs/adr/0002-0004`、`docs/draft/*`，GitHub issue #12 至 #23 正文，以及 `/Volumes/2T/dev/WebEnvoy/research/` 下的 `synthesis.md`、`absorability/themes/evidence-and-observability.md`、`result-normalization-and-reconciliation.md`、`human-handoff-and-recovery.md`、`task-execution-and-admission.md`、`api-cli-mcp-and-agent-interface.md`、`site-knowledge-and-capability-assets.md`、`browser-identity-and-runtime.md` 在 2026-06-30 的当前内容。外部源码 locator `/Volumes/2T/dev/WebEnvoy/sources/CloakHQ/CloakBrowser-Manager` 与 `/Volumes/2T/dev/WebEnvoy/sources/browseros-ai/BrowserOS` 仅作为 #22 非目标参考，不作为 App 源码迁入依据。

### FR 汇总

| Issue | 结论 | 状态 | 后续阻塞 |
|---|---|---|---|
| App #12 | 首个低风险只读旅程从一个公共入口提交 task intent，经 Core run status，到 result envelope、evidence refs、failure reason、viewer/takeover entry；App 只呈现上游事实。 | accepted | 精确字段合同进入阶段二；不阻塞第一阶段 closeout。 |
| App #13 | 最小用户路径是 submit intent -> run status -> structured result -> evidence refs；App 不直接执行 capability 或写 Run Record。 | accepted | 由 Core 提供 task/run/result facts，Lode 提供 capability/result shape metadata。 |
| App #14 | 失败路径展示 failure reason、evidence unavailable/redacted/expired、recovery prompt 和 viewer/takeover entry；App 不判断业务成功或恢复结果。 | accepted | evidence type 与 reason taxonomy 继续引用 PD-0003、PD-0006、PD-0007、PD-0012 至 PD-0014。 |
| App #15 | preview、draft、approval request 是未来写侧的显示边界，不是已提交结果。 | accepted | 真实写入仍需后续 Core admission/action request 合同。 |
| App #16 | 写前验证可显示 preview、draft、risk、approval request、cancel intent；提交、执行、审批结果由 owner API 产生。 | accepted | 不阻塞第一阶段；精确 action request 字段后续定义。 |
| App #17 | 未提交内容必须标为 preview/draft/pending approval，不能进入 result history 或 run success。 | accepted | unknown outcome 与对账展示继续引用 PD-0009。 |
| App #18 | 最小公共入口现在就要定义公共任务语义和消费边界：task、run、result、evidence、action request、Harbor runtime facts、Lode capability metadata。 | accepted | 不建设完整 App/API/CLI/MCP 多入口平台；字段合同后续收敛。 |
| App #19 | Core 生产 task/run/result/failure/action request/evidence ref facts，App 只消费并发送用户意图。 | accepted | Core truth source 和 action risk 合同稳定前，只定义消费需求。 |
| App #20 | Harbor 生产 session/viewer/evidence runtime facts，Lode 生产 capability metadata/result shape；App 可缓存非敏感展示 metadata。 | accepted | Lode catalog 稳定字段继续引用 PD-0015。 |
| App #21 | 外部界面壳、hosted 平台控制台和独立 truth source 不进入 App MVP。 | accepted | 后续云端 Console 不改变 truth ownership。 |
| App #22 | CloakBrowser-Manager、BrowserOS 等外部 UI shell 只作机制参考，不整体迁入 App。 | accepted | 如需源码复用必须另开 Work Item 做许可、边界和模块审查。 |
| App #23 | Hosted 平台控制台、vault/persona/payment/remote provider 控制台和独立 truth store 不进入 App MVP。 | accepted | 仅在后续 team/cloud 阶段重新评估。 |

### 首个低风险只读任务最小路径

| 用户场景 | 展示内容 | 用户意图 | 上游事实来源 | 禁止行为 | 状态 |
|---|---|---|---|---|---|
| 提交只读任务 | capability/task package identity、input summary、read-only scope、resource/profile requirement summary | submit task intent、cancel before submission | Lode capability metadata/result shape；Core admission/task intent contract；Harbor profile availability facts | App 直接执行 capability、定义 task schema、保存 Run Record | accepted |
| 查看运行状态 | run identity、status、timestamps、current step summary、capability version、runtime/session refs | stop、retry when allowed、open run | Core Run Record/status facts；Harbor Runtime Session refs；Lode capability version | App 复制 Core 状态机、把 Harbor session health 当业务结果 | accepted |
| 读取结构化结果 | result envelope summary、typed fields from owner contract、source capability/version、result freshness | open result detail、copy/export allowed summary | Core result facts；Lode result shape metadata | App 自定义最终 result schema、把 draft/preview 写入 result history | accepted |
| 打开证据引用 | evidence refs、summary、thumbnail if policy allows、redacted/expired/unavailable state | open evidence ref、request permission if owner exposes it | Core evidence refs；Harbor evidence/runtime policy | App 保存 raw screenshot/HAR/video/network body、绕过 evidence policy | accepted |
| 理解失败原因 | failure reason、blocking owner、evidence refs、next suggested user action | retry、stop、open viewer/takeover、leave unresolved | Core failure/recovery facts；Harbor viewer/takeover facts；Lode capability failure marker if provided | App 判断业务成功、自动标记 capability invalid、把 viewer failure 混成 task result | accepted |

### 最小公共入口消费需求

| 字段/事实 | 生产者 | 消费者 | 保留/脱敏规则 | 依据 | 状态 |
|---|---|---|---|---|---|
| task intent、admission decision、run id、run status、timestamps | Core | App Work；未来 API/CLI/MCP 入口语义对齐 | App 只保存 UI cache 和最近视图；durable truth 在 Core | App #18/#19、ADR 0002/0004、research task-execution-and-admission | accepted |
| result envelope、failure reason、unknown outcome、recovery prompt、action request | Core | App Work；未来多入口共用任务语义 | 不把 preview/draft/pending approval 当作 submitted result | App #13/#14/#15/#17、research result-normalization-and-reconciliation | accepted |
| evidence ref、evidence summary、redacted/expired/unavailable marker | Core/Harbor | Work、Browser、Library Explorer | 默认 ref-over-value；raw artifact 由 owning policy 控制 | App #14/#19/#20、ADR 0004、research evidence-and-observability | accepted |
| Profile、Runtime Session、Viewer entry、takeover availability、runtime health | Harbor | Work recovery、Browser | App 只保存选择和最近使用 UI 状态 | App #14/#20、ADR 0002/0003、research browser-identity-and-runtime | accepted |
| capability identity、version、catalog metadata、result shape、failure marker | Lode | Work、Library | App 可缓存非敏感 metadata；asset truth 在 Lode | App #13/#20、ADR 0004、research site-knowledge-and-capability-assets | accepted |
| 公共任务语义 | Core/Harbor/Lode owner contracts | App；未来 API/CLI/MCP | 现在只定义消费边界，不建设完整多入口平台 | App #18/#19/#20、research api-cli-mcp-and-agent-interface | accepted |

### 写前验证显示边界

| 写侧概念 | 早期允许范围 | 禁止范围 | 进入真实写入条件 | 依据 | 状态 |
|---|---|---|---|---|---|
| preview | 显示将要发生的变更、风险、目标对象、evidence refs 或 validate-only output | 显示为已提交结果、写入 run history success、触发真实外部变更 | Core admission/action risk 返回可执行 action request，并由用户确认 | App #15/#16/#17、research task-execution-and-admission | accepted |
| draft | 作为 App UI 编辑缓冲或 Lode/owner 草稿引用 | 冒充 Lode package truth、Core result 或已发布资产 | 提交到 Lode 或 owner API 后由 owner 返回正式 identity/version | App #16/#17、docs/draft/library-workbench.md | accepted |
| approval request | 显示 owner、action summary、risk、cancel/approve/decline intent | App 自行执行写入、保存审批结果 truth | Core 或 owner API 接收用户意图并生成正式 action/run fact | App #16/#17、ADR 0002/0003 | accepted |

### 入口吸收与非目标

| 非目标 | 排除原因 | 可重新评估条件 | 影响阶段 | 状态 |
|---|---|---|---|---|
| 外部 UI shell 整体迁入 App | CloakBrowser-Manager 是 profile/runtime/viewer 管理器，BrowserOS 是完整 Chromium fork 与 agent 平台；整体迁入会把 Harbor/App/Core/Lode 边界混在一起。 | 有明确小模块复用候选、许可证审查、owner 边界和测试计划。 | 阶段一至阶段四 | rejected |
| Hosted 平台控制台 | vault、persona、payment、remote provider、team/cloud 运维不属于本地优先首个只读任务闭环。 | 进入 team/cloud 阶段并保持 Core/Harbor/Lode truth ownership。 | 阶段九以后 | deferred |
| 独立 App truth source | 会复制 Core Run Record、Harbor Session/Evidence、Lode Asset truth。 | 不重新评估；只能增加 owner API consumer。 | 全阶段 | rejected |
| 完整 App/API/CLI/MCP 多入口平台 | 当前只需公共任务语义和消费边界，完整入口平台属于日常产品稳定阶段。 | 阶段二最小协议稳定并进入阶段九多入口产品化。 | 阶段二至阶段九 | deferred |

## 2026-06-30 Library capability catalog fields v0

本节承载 App #58 / #54 的阶段二结论。权威决策见
[ADR 0005](0005-library-capability-catalog-fields.md)。依据来自本仓 `AGENTS.md`、
`ROADMAP.md`、ADR 0004、GitHub issues #58/#54、Lode 已合并 package minimum
format v0（Lode ADR 0002/0003/0004 与 pending-decisions 第一阶段结论），以及
`research/absorability/themes/api-cli-mcp-and-agent-interface.md`、
`research/absorability/themes/evidence-and-observability.md` 在 2026-06-30 的当前内容。

### Catalog 字段显示合同

| 字段或状态 | owner | consumer | 有效性/过期规则 | 失败分类 | 非目标 |
|---|---|---|---|---|---|
| display name | Lode | App Library card/list/detail | 随上游 catalog fact 刷新；缺失时用 capability id 兜底显示 unknown marker。 | `unknown` / `unavailable` | App 不命名官方能力。 |
| capability id | Lode | Library deep link、run attribution display | catalog version 内稳定；缺失阻断依赖该 id 的动作显示。 | `metadata_missing` | App 不 mint id。 |
| version / lock | Lode/Core/App local intent 分层拥有 | Library version、installed/locked/pending intent display | 上游 version 随 catalog 刷新；本地 pin 只是 pending UI intent，owner 确认前不是事实。 | `unknown version` / `lock unavailable` / `stale lock` | 不实现 install/update/rollback/store。 |
| family / tags | Lode | grouping、轻量过滤、浏览 | 可缓存为可重建 display snapshot；taxonomy truth 不在 App。 | `uncategorized` / `unknown` | App 不定义 canonical taxonomy。 |
| operation mode | Lode 声明，Core admission/action risk 拥有执行判断 | read / validate-only / draft-preview / write-like / unknown 显示 | metadata 或 admission 合同变化时重评估。 | `unknown mode` / `invalid_contract` | App 不决定 action risk。 |
| lifecycle / deprecation / invalidation | Lode；Core 可报告 runtime invalid contract | proposed / experimental / stable / deprecated / invalidated / unavailable 显示 | invalidation/deprecation 优先于缓存。 | `deprecated` / `invalidated` / `invalid_contract` / `capability_unavailable` | App 不 repair 或清除 invalidation。 |
| resource requirement summary | Lode 声明；Core 根据 Harbor facts 匹配 | 展示抽象需求摘要，不展示为当前可用性 | 当前可用性必须来自 Core/Harbor health/admission facts。 | `requirement unknown` / `resource unavailable` / `admission unavailable` | App 不选择 Profile/provider。 |
| fixture / post-check signals | Lode owns requirements；Core owns execution result | 只显示存在、缺失、redacted、required、passed/failed 等摘要 | package facts 随 Lode 刷新；execution signals 随 Core run facts 刷新。 | `fixture missing` / `post-check unavailable` / `post-check failed` / `redacted` | App 不 inline fixture、不运行 check、不存 raw evidence。 |
| source / evidence refs | Core/Harbor/Lode 各自 owner | refs、summary、policy-allowed thumbnail | 遵循 owner evidence/catalog policy。 | `redacted` / `expired` / `permission denied` / `unavailable` | App 不复制 screenshot、HAR、trace、DOM、network body 或 payload。 |

### App 可保存与不可保存

| 对象 | 结论 | 边界 | 状态 |
|---|---|---|---|
| 排序、分组、可见列、折叠 family、最近 Library view | App 可保存 | 非敏感 UI preference。 | accepted |
| search text、filter chips、selected tags/family、dismissed local hints | App 可保存 | 只是本地便利，不是 catalog truth。 | accepted |
| 非敏感 catalog display snapshot | App 可短期缓存 | 必须带 upstream source、fetched-at、stale/unknown marker，且可重建。 | accepted |
| local pin / lock intent | App 可保存为 pending UI intent | 直到 Lode/Core owner API 返回 fact 前都不是真实 lock。 | accepted |
| package body、fixture body、raw evidence、credential、Harbor profile/session facts、Core Run Record facts | App 不保存 | 只能按 owner policy 显示 ref 或 summary。 | rejected |

### unknown / redacted / unavailable 显示边界

| 状态 | 含义 | Library 规则 |
|---|---|---|
| `unknown` | upstream 未供应或字段尚未标准化。 | 显示 unknown marker，不启用依赖该字段的能力声明。 |
| `redacted` | owner 有意隐藏值。 | 显示 redacted 与 owner/source，不用缓存 raw value 代替。 |
| `unavailable` | owner endpoint、catalog、evidence 或 admission source 不可达。 | 显示 unavailable 与 source，不把缓存当 fresh success。 |
| `metadata_missing` | 当前显示动作需要的 identity/version/lifecycle 缺失。 | 禁用依赖动作，归类为合同缺口。 |
| `invalid_contract` | owner 明确表示 metadata 不一致或不可消费。 | 显示 invalid contract，并把 repair/report intent 指向 owner flow。 |

### 研究吸收边界

| 输入 | 吸收 | 裁剪 | 只参考 | 拒绝 |
|---|---|---|---|---|
| Lode package minimum format v0 | capability identity、operation、family、lifecycle、version、resource requirement、fixture/post-check、invalidation 都作为上游事实投影。 | App 只保留显示字段和 local UI 设置。 | 未来 registry 形态可替换事实来源。 | App-owned package schema、hosted registry 承诺、runtime/provider 选择。 |
| API / CLI / MCP research | 小型确定性接口、reference-over-value、owner-specific surfaces。 | 本轮不设计 CLI/MCP/API。 | tool registry 可服务后续入口一致性。 | 把低层 CDP/eval/browser tools 当 Library capability truth。 |
| Evidence / observability research | evidence refs、redacted/expired/unavailable、post-check 与 result separation。 | Library 只显示 summary/marker。 | 宽 evidence taxonomy 留给 Work/Evidence UI。 | App 默认保存 raw screenshot/HAR/trace/video/network body。 |
| App ADR 0004 | Library 读取 Lode metadata，标记 unknown/unavailable。 | 本轮只收敛 catalog display fields。 | run history/evidence browser 继续独立。 | App-defined package schema 或 evidence store。 |

### Deferred / non-goals

| 事项 | 判断 | 重新进入条件 | 状态 |
|---|---|---|---|
| marketplace / hosted registry / sync / contribution flow | 不在本轮承诺。 | Lode 本地 package、validator、install/lock/update 事实稳定后。 | deferred |
| App shell、UI component、catalog store | 不在本轮实现。 | 独立 UI Work Item 绑定本 ADR 消费字段。 | deferred |
| installer、真实 lock/update/rollback/repair | 不在本轮实现。 | owner API 与 Core/Lode fact flow 稳定后。 | deferred |
| fixture/post-check 执行 | App 只显示摘要。 | Core/Lode/Harbor 合同定义执行和证据 refs 后。 | deferred |

## 待决策索引

| ID | 问题 | 来源 ADR | 阻塞什么 | 当前状态 | 后续归属/下一步 |
|---|---|---|---|---|---|
| <a id="pd-0001"></a>PD-0001 | 后续实现 PR 是否需要在改变 App 边界时引用对应 ADR。 | [ADR 0001](0001-record-architecture-decisions.md#implementation-time-decisions) | 不阻塞 ADR 0001；阻塞后续 PR 流程收紧。 | Pending | App maintainers 在首个边界变更实现 PR 前决定。 |
| <a id="pd-0002"></a>PD-0002 | 如果决策变成跨仓合同，ADR 是否应迁移或同步到共享 WebEnvoy 架构位置。 | [ADR 0001](0001-record-architecture-decisions.md#implementation-time-decisions) | 不阻塞 ADR 0001；阻塞跨仓合同沉淀方式。 | Pending | WebEnvoy/App/Core/Harbor/Lode owner 在首个跨仓合同前决定。 |
| <a id="pd-0003"></a>PD-0003 | Core 应暴露哪些最小 handoff facts 供 App 渲染，而不要求 App 理解完整状态机。 | [ADR 0002](0002-run-viewer-and-handoff-surface.md#open-questions) | 阻塞 run viewer/handoff UI 绑定正式 Core 数据。 | Pending | Core/App 对齐最小 handoff facts。 |
| <a id="pd-0004"></a>PD-0004 | Harbor 第一阶段只提供 mediated viewer URL，还是同时提供本地浏览器窗口入口。 | [ADR 0002](0002-run-viewer-and-handoff-surface.md#open-questions) | 阻塞 viewer entry 的第一阶段 UI 形态。 | Pending | Harbor/App 决定 viewer entry 能力。 |
| <a id="pd-0005"></a>PD-0005 | 用户控制 session 时，mutating automation 是否必须硬暂停，read-only observation 是否可继续。 | [ADR 0002](0002-run-viewer-and-handoff-surface.md#open-questions) | 阻塞 takeover 期间的控制权规则。 | Pending | Core/Harbor/App 共同定义控制权策略。 |
| <a id="pd-0006"></a>PD-0006 | 哪些 viewer failure 应作为 run recovery blocker，哪些只作为 Harbor runtime health issue。 | [ADR 0002](0002-run-viewer-and-handoff-surface.md#open-questions) | 阻塞 viewer failure 的 UI 分类。 | Pending | Core/Harbor/App 对齐 failure taxonomy。 |
| <a id="pd-0007"></a>PD-0007 | Core 和 Harbor 应向 App 暴露什么最小 recovery reason taxonomy。 | [ADR 0003](0003-login-captcha-and-user-takeover.md#open-questions) | 阻塞 login/captcha/takeover prompt 的正式 reason 显示。 | Pending | Core/Harbor 定义最小 reason，App 消费。 |
| <a id="pd-0008"></a>PD-0008 | App 是否需要为用户 takeover prompt 显示倒计时、超时或 SLA。 | [ADR 0003](0003-login-captcha-and-user-takeover.md#open-questions) | 阻塞 takeover prompt 的时间语义。 | Pending | App/Core 决定是否有 timeout/SLA。 |
| <a id="pd-0009"></a>PD-0009 | 用户手动改变页面状态后，App 应如何展示 unknown outcome。 | [ADR 0003](0003-login-captcha-and-user-takeover.md#open-questions) | 阻塞 manual recovery 后的结果呈现。 | Pending | Core/App 对齐 unknown outcome 展示。 |
| <a id="pd-0010"></a>PD-0010 | 哪些 recovery prompt 可以 deferred，而不保持 Harbor session 存活。 | [ADR 0003](0003-login-captcha-and-user-takeover.md#open-questions) | 阻塞 recovery deferral 与 session 生命周期策略。 | Pending | Core/Harbor/App 决定 session keep/close 规则。 |
| <a id="pd-0011"></a>PD-0011 | Clipboard 和 file upload 支持属于 viewer UX，还是后续 Harbor 决策。 | [ADR 0003](0003-login-captcha-and-user-takeover.md#open-questions) | 阻塞 viewer takeover 的输入能力范围。 | Pending | Harbor/App 决定 viewer 输入能力边界。 |
| <a id="pd-0012"></a>PD-0012 | App 第一版应展示哪些 evidence reference types：screenshots、console/network summaries、trace、HAR、video、downloads、result refs。 | [ADR 0004](0004-run-history-evidence-and-capability-browser.md#open-questions) | 阻塞 evidence browser 的第一版范围。 | Pending | Core/Harbor/App 裁剪 evidence type 列表。 |
| <a id="pd-0013"></a>PD-0013 | 哪些 evidence type 可以默认展示 thumbnail，哪些需要用户显式打开。 | [ADR 0004](0004-run-history-evidence-and-capability-browser.md#open-questions) | 阻塞 evidence 默认可见性和隐私 UI。 | Pending | App/Core/Harbor 决定默认展示策略。 |
| <a id="pd-0014"></a>PD-0014 | App 应如何展示已存在但被 redacted 或 expired 的 evidence。 | [ADR 0004](0004-run-history-evidence-and-capability-browser.md#open-questions) | 阻塞 evidence unavailable/redacted 状态。 | Pending | App 根据 Core/Harbor evidence policy 设计状态。 |
| <a id="pd-0015"></a>PD-0015 | 哪些 Lode catalog fields 已稳定到足以支持 App filtering 和 search。 | [ADR 0004](0004-run-history-evidence-and-capability-browser.md#open-questions) | 阻塞 capability browser 的 filter/search 字段。 | Pending | Lode/App 对齐 catalog metadata 稳定字段。 |
| <a id="pd-0016"></a>PD-0016 | Run history 是否应支持 App local-only retention settings，还是只反映 Core retention policy。 | [ADR 0004](0004-run-history-evidence-and-capability-browser.md#open-questions) | 阻塞 run history retention UI。 | Pending | Core/App 决定 retention ownership。 |
