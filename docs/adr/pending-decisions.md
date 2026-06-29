# Pending Decisions

本文件是 App ADR 的唯一待决策索引。Draft ADR 可以保留 `Open Questions`，但必须引用这里的 ID；Accepted ADR 的非阻塞后续项也必须引用这里的 ID。

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
