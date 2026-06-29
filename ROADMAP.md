# WebEnvoy App 路线图

本文是 `WebEnvoy/.github/ROADMAP.md` 的 App 仓库级投影。若本文与组织级 ROADMAP 冲突，以组织级 ROADMAP 为准。

本文用于指导 App GitHub Milestone 的创建和排序，不维护当前 issue、PR 或执行看板。

## 本仓职责

App 负责 Work、Library 和 Browser 三个用户表面，展示 Core、Harbor 和 Lode 的上游事实并发送用户意图。

App 不直接执行能力，不写 Run Record，不绕过 Harbor 操作 Runtime Session，也不保存 Lode 能力资产 truth。

## 路线原则

- GitHub Milestone 必须能映射到本文的阶段路线和组织级 ROADMAP。
- App 可以早期采用统一产品外壳，但交互能力必须受 Core、Harbor 和 Lode 对外合同约束。
- App milestone 优先消费稳定 facts，不在 UI 内自定义上游字段真相。
- App 可以先做只读表面，再逐步开放操作、接管和修复。
- 涉及当前 milestone 的 pending decision 必须先在 `docs/adr/pending-decisions.md` 标明阻塞级别。

## 阶段路线

### 组织阶段一投影：边界清晰

App 明确自己是用户入口，不是 Core、Harbor 或 Lode 的 truth source。

可创建 milestone 的主题：

- App 边界和 ADR 治理。
- Work / Library / Browser 产品域划分。

### 组织阶段二投影：合同可执行

App 的第一优先级是明确自己需要消费哪些最小 Core、Harbor 和 Lode facts。

可创建 milestone 的主题：

- minimal run viewer facts。
- handoff / recovery prompt facts。
- evidence reference display contract。
- capability catalog fields for Library。

阶段二完成前，不应创建依赖完整执行 UI、完整 Profile Browser 或完整 marketplace 的 milestone。

### 组织阶段三投影：用户表面可启动

App 可以围绕稳定合同先形成只读或低风险入口，让用户看到任务、资产和浏览器身份事实。

可创建 milestone 的主题：

- Work read-only runs/results/evidence。
- Library read-only catalog。
- Browser read-only profile/session/provider facts。
- local settings 和连接状态。

### 组织阶段四投影：运行可恢复

App 支持用户观察、接管、恢复、停止、重试或对账，但不复制上游状态机。

可创建 milestone 的主题：

- Viewer entry 和 takeover prompt。
- recovery action intent。
- unknown outcome 和 manual recovery 展示。
- redacted / expired evidence 状态。

### 组织阶段五投影：产品可操作

App 形成 Work、Library 和 Browser 的完整用户闭环。

可创建 milestone 的主题：

- task submission and run management。
- capability install / lock / update / repair。
- Profile / Runtime Session 操作入口。
- Explorer draft to Lode asset handoff。

### 组织阶段六投影：生态可扩展

App 支持团队、可选同步、外部集成和平台贡献体验，但不成为底层 truth source。

可创建 milestone 的主题：

- team/workspace views。
- optional asset sync / contribution UI。
- external integration settings。

## 不进入 App 路线图

- Core Runtime、Run Record durable truth、Admission 和 Action Risk 执行逻辑。
- Harbor Runtime Server、browser driver、CDP/VNC 和 evidence store。
- Lode package/schema/registry truth。
- 账号运营、内容策略、广告投放、CRM 或业务决策。

## Milestone 创建检查

创建 App milestone 前必须确认：

- 对应组织级 ROADMAP 阶段。
- 对应的 App 阶段路线主题。
- 依赖的 Core、Harbor 或 Lode facts 是否稳定。
- 是否有 `Milestone blocker` 或 `FR blocker` pending decision。
- App 是否只展示上游事实并发送用户意图，而不是复制 truth。
