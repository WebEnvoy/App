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
