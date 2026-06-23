# WebEnvoy App Vision

WebEnvoy App 的长期愿景，是让用户通过一个统一入口管理 Agent 的网页操作任务、网站能力资产和浏览器运行现场。

用户不应该需要在多个后台之间切换，也不应该先理解 WebEnvoy、Harbor 和 Lode 的内部边界，才能完成一个任务。用户真正需要的是：选择或调试任务，查看能力和模板，安装或更新平台资产，维护个人资产，探索网站形成知识，配置账号环境，启动运行，观察现场，接管异常，查看结果和证据。

## 一句话愿景

一个 App，统一管理 Agent 的网页操作任务、网站能力资产和浏览器运行现场。

## 产品原则

WebEnvoy App 应坚持：

- 产品上统一，架构上分离；
- App 是用户入口，不是任务执行真相源；
- App 是 Lode 资产工作台，但不是能力资产真相源；
- 所有任务执行通过 WebEnvoy API Server 和 Core Runtime；
- 浏览器身份和运行现场通过 Harbor Runtime API；
- 网站经验、能力包、任务模板、测试样例、版本和失效标记来自 Lode；
- 平台资产和用户个人资产必须清楚区分；
- 平台资产应支持按需安装、更新、版本锁定和回滚；
- 用户个人资产应支持版本管理、diff、回滚、overlay / fork 和可选提交；
- 人类用户可以查看能力、运行任务、探索网站、观察现场、接管异常和修复失败；
- App 不应把底层 provider、Profile 或 Runtime Session 细节暴露成黑盒判断。

## 用户能用它做什么

长期目标下，用户可以通过 WebEnvoy App：

- 查看和运行网页操作任务；
- 浏览站点、能力、任务模板和测试样例；
- 按需安装、更新、锁定和回滚平台站点知识；
- 创建和维护个人能力、私有任务模板、overlay、fork 和草稿；
- 查看能力版本、资源需求、失效状态和修复入口；
- 使用 Explorer 探索网站并形成站点知识、能力草稿或任务模板草稿；
- 标记能力失效，提交站点变化报告和脱敏证据；
- 查看运行记录、失败原因和证据；
- 配置 Profile、账号环境和 Runtime Session；
- 在任务卡住时进入 Viewer 并人工接管；
- 根据 Harbor 返回的能力事实理解当前浏览器身份能提供什么；
- 在任务失败后进入恢复、重试或能力修复流程。

## 一个 App，三个产品域

WebEnvoy App 可以从第一天开始采用统一产品外壳，同时保持三个产品域：

```text
WebEnvoy App
  ├── Work 区域
  │   ├── Tasks
  │   ├── Runs
  │   ├── Results
  │   ├── Evidence
  │   └── Recovery
  │
  ├── Library 区域
  │   ├── Platform Assets
  │   ├── My Assets
  │   ├── Explorer
  │   └── Reports
  │
  └── Browser 区域
      ├── Browser Identities
      ├── Profiles
      ├── Runtime Sessions
      ├── Viewer / Takeover
      └── Provider Capability Facts
```

其中：

- Work 区域对应 WebEnvoy Core，呈现任务、运行记录、结果、证据和恢复流程；
- Library 区域对应 Lode，呈现和操作平台资产、用户个人资产、网站探索、能力草稿、版本管理和失效上报；
- Browser 区域对应 Harbor，呈现浏览器身份、Profile、Runtime Session、Viewer 和人工接管。

用户看到的是一个 App；内部仍然通过 WebEnvoy Core、Lode 和 Harbor 的正式边界协作。

## Library 的资产边界

Library 需要明确区分平台资产和用户个人资产。

平台资产包括官方站点知识、官方能力包、官方任务模板、官方测试样例、官方版本和公共失效标记。它们可以被按需安装、更新、锁定版本和回滚，但不应被用户直接改写为官方资产本体。

用户个人资产包括私有能力、私有任务模板、用户 overlay、fork、探索草稿、修复草稿和私有测试样例。它们应该支持版本管理、本地历史、diff、回滚、导出、可选同步和可选提交为公共贡献。

推荐关系是：

```text
平台资产
  └── 用户 overlay / fork / draft
```

App 负责这些资产的管理体验；Lode 负责资产格式、版本、依赖、测试样例、包管理和真相源。

## Explorer 与失效上报

WebEnvoy App 应支持网站探索和知识形成。

典型流程：

```text
打开站点
  → 选择 Profile / Runtime Session
  → 探索页面和操作路径
  → 捕获 Snapshot、页面状态摘要、网络摘要和验证点
  → 形成站点知识草稿
  → 形成能力草稿或任务模板草稿
  → 测试
  → 保存为用户个人资产
  → 可选提交为平台资产贡献
```

知识失效时，App 应支持两种上报路径：

- 私有失效标记：只影响用户本地或团队资产；
- 平台失效上报：向公共能力生态提交脱敏站点变化报告。

平台失效上报默认只能包含脱敏信息，例如能力 ID、版本、失败类型、页面状态摘要、元素变化摘要、错误码、验证阶段和脱敏证据引用，不应包含用户业务内容或未脱敏执行现场。

## 不是什么

WebEnvoy App 不是通用浏览器，也不是独立任务运行时。它不直接执行能力，不直接管理 Harbor 的底层运行时，也不保存 Lode 的能力资产真相。

它的价值是把这些系统组织成一个可以被人类用户使用的产品入口。
