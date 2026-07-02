# WebEnvoy App Vision

WebEnvoy App 的长期愿景，是让人类业务用户通过一个桌面入口运行和管理确定性的网页 workflow。

App 面向市场、运营、产品经理等非技术用户。Agent 不在 App 内运行；Agent 使用 WebEnvoy 的方式是 API、CLI、MCP、SDK 或 skills。App 的职责是把 Lode 的站点技能、Harbor 的账号身份和 Core 的任务运行结果组织成用户能理解和操作的产品表面。

## 一句话愿景

一个桌面 App，让用户用账号身份执行站点技能，查看任务结果、结果依据和执行现场。

## 产品原则

WebEnvoy App 应坚持：

- App 是人类用户入口，不是 Agent 容器；
- App 执行确定性 Lode workflow，不执行任意网页 Agent 任务；
- 用户浅层界面使用业务语言，不暴露 API、endpoint、schema 或 runtime 细节；
- 任务执行通过 WebEnvoy API Server 和 Core Runtime；
- 站点技能、workflow、能力包、测试样例和版本事实来自 Lode；
- 账号身份、浏览器环境、Runtime Session、Viewer 和执行现场来自 Harbor；
- App 不保存 task、run、result、evidence、capability 或 profile 的真相源；
- App 可以保存 UI 设置、最近视图和带来源/时间/stale 标记的非敏感展示缓存；
- 结果必须能追溯到结果依据，失败必须能说明失败阶段和下一步动作；
- 真实写入、批量 crawler、marketplace 和通用 browser agent loop 不属于首个桌面闭环。

## 核心对象

```text
站点技能 + 账号身份 + 业务输入 = Task
Task 的一次执行尝试 = Run
```

- 站点技能：Lode 封装的确定性 workflow，例如“商品详情采集”或“提交评论”。
- 账号身份：账号状态和浏览器环境的组合。无需登录的任务也使用账号身份，例如“本机 Chrome”。
- 业务输入：用户提供的 URL、素材、字段或操作参数。
- Task：围绕同一站点技能、账号身份和业务输入形成的任务线程。
- Run：同一个 Task 下的一次执行记录，可以成功、失败、被接管、重试或产生 unknown outcome。

workflow、账号身份或主要业务输入变化时，通常应创建新 Task；重试、重新登录、接管后继续、runtime 重启或验证重跑应成为同一 Task 下的新 Run。

## 用户能用它做什么

长期目标下，用户可以通过 WebEnvoy App：

- 创建账号身份，或使用本机 Chrome 作为默认运行环境；
- 从站点技能中选择一个确定性 workflow；
- 填写 URL、素材或其他业务输入并发起任务；
- 查看同一 Task 下的多次 Run；
- 在任务完成后阅读任务结束报告；
- 展开执行过程，查看每次 Run 的阶段、失败和重试；
- 查看结构化结果、结果依据、字段来源和页面记录；
- 打开执行现场，观察浏览器环境或按 owner 允许的方式接管；
- 看到账号身份、站点技能和诊断上下文；
- 在失败时根据提示修改输入、重新执行、打开现场或等待恢复；
- 在深层页面管理账号身份、站点技能、连接状态和开发者配置。

## 桌面信息架构方向

当前设计 checkpoint 采用 Task Thread first 方向：

```text
左侧栏
  全局入口：新建任务、搜索、站点技能、账号身份
  任务：账号身份 -> 站点技能 -> Task

中间栏
  Task 标题、状态、站点技能、账号身份、业务输入
  Run navigation rail
  任务结束报告
  可折叠执行过程
  底部固定任务操作区

右侧上下文面板
  结果依据
  执行现场
  账号身份
  站点技能
  诊断
```

左侧全局入口里的“账号身份”是管理界面，用于增删改查账号身份；左侧“任务”区里的账号身份只是任务的第一层组织方式。任务状态只作为 Task 行右侧的小图标或动态标记，不作为分组依据。

## 与 WebEnvoy / Harbor / Lode 的关系

```text
WebEnvoy App
  -> WebEnvoy API Server / Core Runtime：task、run、result、failure、action request
  -> Lode：站点技能、workflow、package、schema、fixture、version、post-check
  -> Harbor：账号身份、browser environment、runtime session、snapshot/refmap/evidence refs、viewer/takeover
```

App 负责把这些事实组合成人类可操作的桌面体验。Core、Lode 和 Harbor 仍分别拥有自己的真相源；App 不绕过 owner API。

## 不是什么

WebEnvoy App 不是：

- Agent 聊天应用；
- 通用浏览器或指纹浏览器替代品；
- 任意网页读写任务启动器；
- Core Runtime、Harbor Runtime 或 Lode Registry；
- 业务策略系统、账号运营系统或内容排期系统；
- raw evidence、cookie、token、browser profile storage 或 Run Record 的存储真相源。

App 的价值是让非技术用户安全、清楚地运行确定性网页 workflow，并能理解结果从哪里来、失败在哪里、下一步能做什么。
