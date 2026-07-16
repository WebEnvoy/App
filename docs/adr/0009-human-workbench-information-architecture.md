# 0009. 人类工作台信息架构与信息分层

## 状态

Accepted by App #306 as the direction for App #298 product correction, 2026-07-14.

本 ADR 只接受产品方向和设计约束，不代表 IA inventory、原型或场景验收已经完成，
也不关闭 App #298 或其 #299-#305、#308 子项。

2026-07-15 process correction：App #298 在 IA 定稿前增加 Loom Story 用户确认
Gate，并以高保真原型用户验收替代低保真场景验收。Loom review、自动 review、PR
merge 或 agent 判断不能代替这两次用户确认。

2026-07-15 Story Gate 已由用户明确确认。#300-#304 的 canonical IA candidate
记录于 `docs/design/human-workbench-information-architecture.md`；该候选只允许进入
#305 高保真原型，不能代替高保真原型的第二次用户验收。

本 ADR 固化产品方向和下一轮设计约束，不实现生产 UI。它保留 ADR
0005/0006/0008 的 owner truth、敏感数据和本地缓存边界，但 supersede 以下旧决策：

- evidence card、refs、runtime facts 或右侧 context tabs 默认可见；
- risk/approval-request-first 写侧交互；
- Task Thread 固定三栏作为所有场景的唯一页面结构；
- Settings 与 Work、Browser、Library 并列为业务域。

## 背景

当前 App 能展示大量 Core、Harbor 和 Lode facts，但页面以运行状态、refs、
provider/session/controller 和 owner 边界为中心。人类用户难以直接回答：现在能做
什么、任务得到了什么、哪个账号正在使用、失败后下一步是什么。

小红书是当前真实运行验收切片，不是 App 的产品边界。App 还必须观察 CLI、MCP、
API、SDK 和 Agent 产生的任务，并作为账号身份/浏览器环境和站点技能的人类工作台。

## 决策

### 三个业务域

| 业务域 | 用户目标 | 主要对象 |
| --- | --- | --- |
| Work | 创建和管理任务，消费业务结果，处理失败与人工介入 | Task、Run、Result、用户可执行恢复动作 |
| Browser | 管理账号身份、provider、浏览器环境和实例 | 账号身份、环境、provider、实例、登录状态 |
| Library | 浏览、管理和使用站点技能 | 技能、版本、输入输出、资源和动作要求 |

Settings 只承载偏好、全局授权默认值、连接和诊断，不是第四业务域。

### 三种自然入口

```text
账号身份 -> 打开浏览器或选择技能 -> Task
站点技能 -> 选择兼容账号身份 -> Task
App/CLI/MCP/API/SDK/Agent Task -> App 查看运行与结果
```

App 自动任务仍满足：

```text
站点技能 + 账号身份 = Task Thread
Task Thread + 一次业务输入 = Task Turn
Task Turn 的一次执行尝试 = Run
```

Work 可按站点技能或账号身份组织同一批 Task Thread；切换只改变前端分组，
不复制 Task、Run 或结果事实。

手动浏览实例属于 Browser，不伪装成 Core Task/Run/Result。

### 信息层级

每个任务页面按以下顺序展示：

1. **业务结果**：读取、采集、创建、修改或提交了什么；失败原因和下一步。
2. **来源摘要**：账号、技能、原页面、发生时间和入口来源。
3. **运行详情**：有业务意义的阶段、重试和人工介入记录。
4. **诊断**：run/session/evidence/viewer refs、trace、endpoint、provider 原始 facts 和错误。

正常页面不得默认显示 evidence ref、session ref、viewer ref、capture method、source
locator、owner 说明或完整事件流。用户主动诊断时仍可查看或导出这些记录。

中栏按时间顺序展示当前 Task Thread 的全部 Task Turn，每个回合按“业务输入 ->
正在执行 -> 任务总结”组织。运行中和等待人工处理使用进度摘要；完成、部分完成、
失败、取消和未提交使用诚实的终态总结。“正在执行”默认收起，展开后显示打开网址、
滚动、点击、填写和读取等原子页面动作；原始参数、重复事件、日志和 trace 继续归入
折叠诊断。回合导航只负责滚动定位，不切换中栏或右栏内容。右栏初始为空，只有用户
从中栏明确打开结果或文件时才绑定对应回合。

### 结果渲染

Work 优先渲染 Lode/Core 提供的公共业务类型：content、author/profile、comment、
media、metric、record collection 和 write operation。未知 output schema 使用通用
表格或键值详情，不要求每个站点拥有独立页面，也不把 raw JSON 当首选结果。

### Browser 生命周期

Browser 以账号身份组织环境。用户可以检测 provider、创建或选择环境、登录、启动、
停止和人工使用实例。Provider 分为 Harbor managed、system installed 和 external
managed 三种来源；恢复旅程必须说明当前来源、可执行动作和责任边界。Provider 缺失、
损坏、版本不兼容或启动失败时，用户进入检测 -> 下载 -> 完整性校验 ->
安装/更新/修复 -> 启动验证 -> 返回原任务的恢复路径。system/external provider
不可由 Harbor 修改时，App 提供定位、重检或打开外部管理入口，不伪装成一键修复。

浅层只显示可执行状态，例如“可以使用”“需要登录”“未安装”“修复后重试”。路径、
版本探测、原始错误和 runtime refs 进入诊断。

### 统一授权交互

App 消费 Core 的统一授权策略：

- 全局默认：仅查看、修改前询问、按当前任务/操作授权；
- 当前 task 或 Browser environment operation 可以继承或覆盖全局默认；
- 超出当前 grant、但仍在 Lode/Harbor 权威动作声明与目标范围内时，允许一次、
  本 task/operation 允许或拒绝；超出权威声明属于硬拒绝，不向用户提供扩大声明的授权入口。

App 不保存授权 truth，不建立站点专用审批状态机。个人本机体验使用“授权”或“确认”，
只有未来真实多人流程才使用“审批”。

## Story 与高保真设计门槛

生产 UI Work Item 前必须完成：

- Loom User Story、Story Readiness 与 Story Business Confirmation；confirmation
  初始为 `pending`，只有用户明确确认后才可进入 IA 定稿；
- 当前页面 inventory，并标记保留、重命名、移动、折叠、仅诊断或删除；
- 三域导航和页面清单；
- 账号、技能、任务三种入口旅程；
- provider 安装修复、人工接管和授权旅程；
- 业务结果、空结果、失败和需要人工处理状态；
- 高保真原型场景验收；原型可采用交互单页应用、图片状态序列或其他足以评审
  关键旅程的载体，但必须由用户明确批准。

用户要求修订 Story 或原型时，状态保持 `revision-requested`，不得进入生产 UI
Work Item。Loom review 与自动检查只可验证载体，不构成产品审核。

固定三栏、右侧 tabs、navigation rail 或 Task Thread 树只能作为候选组件，不再是
未经场景验证的全局结构约束。

## 影响

- App #241 默认展示业务结果，截图和 refs 降为诊断。
- App #258 显示用户可处理状态，health/admission 细节降为诊断。
- App #233/#234/#237 以账号身份和 provider/实例生命周期组织 Browser。
- App #246 消费 Core 统一授权策略，不再延续 approval-request-first UI。
- ADR 0006 继续约束 owner truth、缓存和敏感数据，但其默认 display hierarchy 被本 ADR 取代。
- ADR 0008 继续作为历史设计 checkpoint，其固定 Task Thread IA 不再指导新实现。
- 历史 App #80/#93/#95/#96/#104/#156/#193 中的固定 Task Thread、evidence-first
  或 approval-first 结论由本 ADR supersede；这些历史 issue 不作为新 UI 验收证明。
- 当前实现 FR/Work Items #233/#238/#243/#256 必须消费本 ADR，但仍需各自的真实实现
  与 E2E 证据，本 ADR 不关闭它们。

## 非目标

- 不在本 ADR 中决定视觉样式、像素、组件库或最终路由名。
- 不创建 App-owned task、runtime、capability、evidence 或 authorization truth。
- 不实现站点任务、provider installer 或 Core policy evaluator。
- 不把小红书或 BOSS 作为 App 全局信息架构。
