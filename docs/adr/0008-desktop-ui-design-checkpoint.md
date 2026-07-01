# 0008. Desktop UI 设计 checkpoint

## 状态

提议用于 milestone #9 设计 checkpoint，2026-07-02。

本 checkpoint 覆盖 FR #92 以及 Work Item #96、#97、#98、#99。它是给后续
#93、#94、#95 实现使用的 docs-only 设计事实载体，不实现 Electron shell、
React UI、API client、schema、fixture、viewer、evidence store 或组件系统。

## 背景

ADR 0007 要求在 skeleton 工作把 UI 方向当成最终方向前，先完成 UI 产品设计
checkpoint。ADR 0006 和 ADR 0005 已定义 App 可以展示哪些上游事实，以及
App 本地设置和缓存边界。Draft ADR 0002、0003、0004 仍保留 recovery、viewer
和 evidence 的待决策项，因此本 checkpoint 必须让未知项可见，但不能在 App 内
自造 truth。

本 checkpoint 使用了 Desktop Taste 插件输入：

- Desktop Read：cross-platform desktop；workbench/control-console 类型；
  面向专业用户；任务观察中等到较长；信息节奏偏 dense。
- Layout：sidebar app 加 Work detail split；Browser 状态在 Work 内可见，
  完整 Browser 管理仍属于 Browser section。
- Typography/density：dense，但不是 control-room；列表紧凑、状态文案短、
  metadata 可读，不使用 hero type。
- Native feel：平台 chrome、菜单、focus、selection、键盘路径和 source-specific
  connection state 优先于品牌化 Web 壳一致性。
- Motion：inline state、focus handoff、panel reveal 和 reduced-motion 支持；
  不使用 route fade、营销动画或只靠 toast 的反馈。
- Brand：安静的操作台气质；品牌只进入 accent、microcopy、empty state 和一个
  小型完成反馈，不进入大背景或卡片装饰。

## 决策

推荐的桌面方向是「运营工作台」：左侧稳定导航，默认 Work-first，source-specific
connection/runtime health 靠近相关任务展示，并用 detail surface 把 task、run、
result、evidence、capability source 和 Browser runtime ref 分开。

该方向仍需经过下方用户确认点。确认前，#93/#94/#95 可以把本 ADR 当作推荐
checkpoint 消费，但不能声称最终产品方向已锁定。

## Desktop Read

| 字段 | 判断 |
| --- | --- |
| Platform | Cross-platform desktop。 |
| Platform depth | Cross-platform desktop；window chrome、menu、shortcut、focus、theme 跟随平台。 |
| App archetype | Workbench/control-console，用于提交任务、观察 run、读取 result、检查 evidence 和处理 runtime recovery。 |
| User role | 操作 WebEnvoy task 的专业用户，不是 landing page 访客。 |
| Session context | 短任务提交后接中等到较长的观察、比较、失败恢复和 evidence review。 |
| Density | Dense。界面必须同时容纳 run state、source attribution、connection health 和 evidence ref，不能退化成 dashboard 墙。 |
| Primary interaction | Mouse + keyboard。Command palette 可以后置，第一版必须有可见导航和明确 focus order。 |
| Design thesis | WebEnvoy App 应像一个紧凑的桌面操作台，用于可信地观察任务。 |
| Anti-pattern | 不做 SaaS landing page、card-grid dashboard、伪 Browser manager 或 App-owned truth store。 |

## Art Direction

| 方向 | 摘要 | 使用判断 |
| --- | --- | --- |
| 运营工作台 | Dense split workspace、清楚的 source label、inline run/evidence/runtime state、克制 accent。 | 推荐用于 milestone #9。 |
| Browser 恢复台 | Browser/viewer 状态占据首屏，Work 退为二级 run log。 | 等 Harbor viewer 和 takeover facts 稳定到足以成为主心智后再评估。 |
| Catalog Launcher | Library/capability catalog 成为 home，task 从资产启动。 | 等 Library lifecycle 和 catalog search 字段稳定后再评估。 |

选择方向：运营工作台。

取舍：Browser status 会提升到 Work 内，但完整 Browser surface 仍是二级入口。这能让
首个只读任务路径更清楚，同时避免 runtime/session facts 替代 Core run facts。

## 低保真 IA

### 窗口区域

| 区域 | 角色 | 规则 |
| --- | --- | --- |
| Title/toolbar | Window title、source health summary、高频 view control、当前 run identity。 | label 要短；menu 和 shortcut 必须保留平台命名和 disabled state。 |
| 左侧导航 | Work、Library、Browser、Settings。 | 稳定、常驻、键盘可达，selected 强于 hover。 |
| 主工作区 | 当前 section 内容。完成初始连接后默认 Work。 | 首屏不做 hero page、营销文案或 dashboard card。 |
| 右侧 inspector | 当前 run/evidence/capability/runtime context。 | 不替代 Work 主流程；无 selection 时必须清空旧对象。 |
| 底部/status strip | Source freshness、selected count 或后台 query state。 | Health 是 source freshness，不是 task outcome。 |

### 导航

| Section | 当前 milestone 职责 | 本批不做 |
| --- | --- | --- |
| Work | 提交一个 read-only task intent，观察 run status，读取 structured result/failure，打开 evidence refs，看到 Browser runtime ref。 | 多任务队列、复杂 run history 搜索、write approval。 |
| Library | 展示 Work 需要的 capability/package source、version、lifecycle/resource summary、unavailable/unknown state。 | 完整 install/update/lock/repair lifecycle、marketplace、复杂 catalog search。 |
| Browser | 展示 Harbor profile/runtime/session/provider/viewer facts、control owner、availability 和 recovery entry。 | 完整 Browser 管理、profile storage、raw CDP/VNC endpoint、外部 provider console。 |
| Settings | 配置本地 endpoint/source locator，展示 source-specific health diagnostics。 | Credential vault、evidence retention policy truth、本地 service supervisor、updater/signing。 |

### 默认路径

推荐默认：

1. 如果 Core/Harbor/Lode endpoint 缺失，仍打开 Work，但显示紧凑 connection blocker
   和跳转 Settings 的主操作。
2. 如果 endpoint 存在，默认打开 Work。
3. Work 顶部显示 read-only task entry，主区域显示当前或最近 run，inspector 显示
   Browser/session/capability/evidence context。
4. Library 和 Browser 可从 nav 或 context link 打开，但不抢占首个只读任务闭环首屏。

## 首个只读任务流

| 步骤 | 用户看到 | 用户意图 | Owner fact | App 边界 |
| --- | --- | --- | --- | --- |
| Submit task | Capability/source、input summary、read-only scope、resource requirement summary、connection blocker。 | Submit 或提交前 cancel。 | Core task intent/admission、Lode capability metadata、Harbor resource availability。 | App 只发送安全 intent；不定义 task schema，不执行 capability。 |
| Run in progress | Run id、status/timeline、timestamps、current phase summary、runtime/session refs、capability version。 | owner 允许时 stop/cancel，open Browser/viewer，等待。 | Core run facts、Harbor session/viewer facts。 | Loading/polling 只是 App local UI state。 |
| Structured result | Outcome、supported envelope version、public fields/summary、source refs、freshness。 | Inspect、copy allowed summary、open details。 | Core result envelope、Lode result shape metadata。 | App 只渲染 JSON-safe public projection。 |
| Evidence | Evidence ref、type、producer、captured_at、owner、redaction/retention/access state、safe summary 或 policy thumbnail。 | Open evidence ref；owner 暴露时 request permission。 | Core/Harbor evidence refs and policy。 | App 不保存 raw evidence。 |
| Failure/recovery | Failure category/code/phase、owner、safe message、suggested next action、Browser/viewer availability。 | Retry、fix input、open viewer/takeover、stop、leave unresolved。 | Core failure/recovery facts、Harbor viewer/control facts、Lode capability marker。 | App 不判断业务成功，也不判断 recovery result。 |

## 状态矩阵

| Surface | Loading/checking | Empty | Success/available | Failed/blocked | Redacted | Expired | Unavailable/stale |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Task intent | 校验 input、capability、scope 和 resource。 | 无 current draft；显示一个紧凑 read-only task starter。 | Core accepted 并返回 run ref。 | Invalid/private input、unsupported entrypoint、policy denied。 | Private fields 在提交前被拒绝。 | Draft/preview 提交前过期。 | Core admission 或必要 source 不可达。 |
| Run | 查询或 polling Core。 | 无 run selected；仅当 owner facts 存在时显示 recent runs。 | Core 返回 accepted/running/succeeded/partial/requires user action。 | Core 返回 failed、blocked、cancelled、unknown outcome。 | Owner 隐藏敏感 run fields。 | Result/evidence body expired；owner 允许时保留 run summary。 | Core unavailable、permission denied、query timeout。 |
| Result | 获取 envelope/projection refs。 | Owner 返回有效 empty result。 | 支持的 envelope 和 public structured projection。 | Unsupported version、projection failed、output invalid。 | Owner redacts fields；显示 owner/source。 | Result body/ref expired；owner 允许时保留 locator metadata。 | Result ref missing、source unavailable、stale cache。 |
| Evidence | 检查 evidence ref 和 access。 | 当前 run 没有 evidence refs。 | Ref summary 和 policy-allowed thumbnail/viewer link。 | Missing、access denied、capture denied、policy denied。 | Redacted marker 优先于 cache。 | Expired marker；App 不能恢复 raw material。 | Evidence owner down、viewer unavailable、只有 stale cache。 |
| Capability source | 加载 Lode/Core attribution。 | Task entry 前未选择 capability。 | Identity、version、lifecycle、operation mode、resource summary。 | Invalid contract、deprecated/invalidation marker 阻止能力声明。 | Redacted package metadata marker。 | Catalog snapshot stale/expired。 | Lode catalog/source unavailable 或 metadata missing。 |
| Browser session/provider | 检查 Harbor facts。 | 当前 run 没有绑定 session。 | Session/provider/viewer/control facts available。 | Handoff required、control lost、login/captcha/access blocker。 | Profile/identity details hidden。 | Runtime/session/viewer ref expired。 | Harbor unavailable、provider unavailable、runtime lost。 |
| Connection health | 测试 owner endpoint/source。 | 未配置 endpoint。 | Healthy，带 source 和 fetched_at。 | Misconfigured、permission denied、invalid source。 | Secret/credential 不展示。 | Health snapshot stale。 | Core/Harbor/Lode unavailable 分别标注。 |

## Failure、Empty、Loading 和连接异常

| 状态类 | 文案规则 | 操作规则 |
| --- | --- | --- |
| Loading | 点名正在查询的 source：Core run、Harbor session、Lode catalog 或 evidence owner。 | 进度靠近对象 inline 展示；除非首次加载阻塞全部内容，否则不替换整屏。 |
| Empty | 只有 owner 说没有数据，或用户没有 current selection 时才显示 empty。 | 只给一个最相关下一步；不写营销文案。 |
| Failure | 说明什么失败、谁拥有该事实、是否有用户动作。 | retry/fix/open viewer/Settings 贴近失败对象；stale action 禁用并说明原因。 |
| Connection unavailable | 区分 Core API、Harbor runtime、Lode catalog 和 local config 失败。 | 配置问题去 Settings；runtime 观察去 Browser；不要把 source outage 改写成 task failure。 |
| Redacted | 说明 owner 有意隐藏该值。 | 不用 local cache 揭示它。 |
| Expired | 说明哪个 body/ref 过期，以及还保留哪些 metadata。 | 只有 owner 暴露动作时才提供 re-run、re-query 或 owner flow。 |
| Unknown outcome | 说明 owner facts 当前不能证明 success 或 failure。 | 提供 owner-supplied recovery/check action；App 不本地标记 success。 |

## Desktop native 和 shell 边界

Electron 是 App carrier，不是 WebEnvoy runtime。

| Layer | 可以拥有 | 不能拥有 |
| --- | --- | --- |
| Electron main/native layer | Window lifecycle、menus、file dialogs、notifications、OS theme、后续被授权时的 keychain boundary、profile path locator display、app quit/restart、安全 local config file access。 | Task/run/result/evidence/capability/recovery protocols、Core Run Record truth、Harbor session/profile/browser storage truth、Lode package truth、raw evidence、CDP/VNC endpoints。 |
| Renderer/App UI | Navigation、local UI state、owner API clients、display projections、source health display、带 source/fetched_at/stale marker 的非敏感 cache。 | Durable task store、alternate status machine、raw artifact storage、local package registry、credential/cookie/token storage。 |
| Owner APIs | Core task/run/result/failure/action facts；Harbor profile/session/viewer/runtime facts；Lode capability/package/catalog facts。 | App-local UI preferences 和 transient loading state。 |

#93 实现规则：IPC 只能承载 OS-bound request 和 local configuration；业务 facts 必须来自
owner API 或 owner contract 生成类型。如果 IPC 变成 domain protocol，#93 就越界。

## Typography、Density、Motion 和 Brand

| Area | 规则 |
| --- | --- |
| Typography | 使用平台/system font stack。Window title、section label、metadata、status、error、table/list row、code/log text 需要稳定角色。普通 app workspace 不使用 hero-scale type。 |
| Density | 允许 dense list 和紧凑 metadata；控件仍必须有可访问 hit target、focus ring 和可读长 label。 |
| Layout | 优先 split/list/detail/inspector，不默认 generic rounded cards。Card 只用于 evidence ref 等有明确边界的重复项，且 list/table 不更合适时才用。 |
| Motion | Motion 服务 state change 和空间关系：panel reveal、focus handoff、selection change、loading progress。Reduced motion 保留反馈但移除大位移。 |
| Brand | 使用克制 accent、command microcopy、empty state 和一个小 completion pulse。Error/warning/success semantic color 不能被 brand color 覆盖。 |

## 用户确认点

这些判断必须在 #93/#94/#95 声称最终产品方向前确认：

1. 首屏：Work-first 加 connection blocker，还是 endpoint 配好前 Settings-first。
2. 导航主次：Work primary、Browser 作为可见 runtime context，还是 Browser co-primary。
3. Work layout：task entry 和 run detail 在一个 Work surface，还是拆成 Submit / Run views。
4. Browser state 强度：放在 Work 的 inspector/status strip，还是在 Work 首屏放更大的 embedded viewer/status panel。
5. Evidence 默认可见性：PD-0012/PD-0013 解决前 summary/ref-only，还是 owner 允许时默认 policy thumbnail。
6. Result density：默认 compact structured table/list，还是更宽松的 result cards。
7. Failure recovery：retry/open viewer/Settings 只做 inline action，还是增加 dedicated recovery queue。
8. Library 在 milestone #9 的角色：只做 constrained capability source attribution，还是做 browsable catalog placeholder。
9. Connection health 位置：global toolbar 加 per-object label，还是 Settings-only diagnostics 加 inline blocker。
10. Completion signal：只做 inline status update，还是增加尊重 reduced motion 的轻量 completion pulse。

## 后续实现入口条件

| Future FR | 可开始条件 | 禁止事项 |
| --- | --- | --- |
| #93 Electron + React shell | 用户确认首屏、导航主次、connection health 位置和 Electron native 边界。 | 不把 task/run/result/evidence protocols 加进 Electron main；不创建超出 skeleton slice 的组件库。 |
| #94 read-only task/run view | 用户确认 Work layout、result density、failure recovery 位置和 Core query field mapping。 | 不定义 App-owned task schema、run lifecycle、result envelope 或 retry semantics。 |
| #95 evidence/capability/Browser references | 用户确认 evidence 默认可见性和 Browser state 强度，或明确接受 PD-0012/PD-0013/PD-0014 未解决时的 summary/ref-only 行为。 | 不保存 raw evidence，不暴露 raw CDP/VNC endpoint，不定义 Lode catalog truth，不把 Harbor health 当 task outcome。 |

## 覆盖 issue

| Issue | 覆盖 |
| --- | --- |
| #92 | 冻结推荐 desktop IA/state/shell-boundary checkpoint，并记录用户确认 gate。 |
| #96 | 定义 Work/Library/Browser/Settings 低保真 IA、默认路径和非目标。 |
| #97 | 定义 task、run、result、evidence、capability source、Browser runtime 和 connection state matrix。 |
| #98 | 定义 loading、empty、failure、unavailable、redacted、expired、unknown outcome 的文案和动作规则。 |
| #99 | 复核 Electron/native layer 仅拥有 OS 能力，禁止业务 protocol truth 进入 shell。 |

## 非目标

- 不做高保真视觉稿。
- 不初始化 Electron/Vite/React/TypeScript。
- 不安装依赖或创建 package manifest。
- 不创建 UI component library。
- 不修改 Core、Harbor 或 Lode。
- 不保存 raw evidence、credential、cookie、browser profile storage、package body 或 Run Record。
- 不关闭或实现 #93、#94、#95。

## 后果

- 后续实现可以从明确桌面方向出发，不在第一个 skeleton PR 里临时发明 Web dashboard。
- 未确认的产品判断作为 gate 显式存在，而不是藏进 UI code。
- Evidence、viewer、recovery 的 pending decision 继续 pending；本 checkpoint 只提供安全显示默认值，不替跨仓合同拍板。
