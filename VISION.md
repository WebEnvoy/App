# WebEnvoy App Vision

WebEnvoy App 的长期愿景，是让用户通过一个统一入口管理 Agent 的网页操作任务、网站能力资产和浏览器运行现场。

用户不应该需要在多个后台之间切换，也不应该先理解 WebEnvoy、Harbor 和 Lode 的内部边界，才能完成一个任务。用户真正需要的是：选择或调试任务，查看能力和模板，配置账号环境，启动运行，观察现场，接管异常，查看结果和证据。

## 一句话愿景

一个 App，统一管理 Agent 的网页操作任务、网站能力资产和浏览器运行现场。

## 产品原则

WebEnvoy App 应坚持：

- 产品上统一，架构上分离；
- App 是用户入口，不是任务执行真相源；
- 所有任务执行通过 WebEnvoy API Server 和 Core Runtime；
- 浏览器身份和运行现场通过 Harbor Runtime API；
- 网站经验、能力包和任务模板来自 Lode；
- 人类用户可以查看能力、运行任务、观察现场、接管异常和修复失败；
- App 不应把底层 provider、Profile 或 Runtime Session 细节暴露成黑盒判断。

## 用户能用它做什么

长期目标下，用户可以通过 WebEnvoy App：

- 查看和运行网页操作任务；
- 浏览站点、能力、任务模板和测试样例；
- 查看能力版本、资源需求、失效状态和修复入口；
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
  │   ├── Sites
  │   ├── Capabilities
  │   ├── Task Templates
  │   ├── Atomic Actions
  │   ├── Test Cases
  │   ├── Versions
  │   └── Invalidations
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
- Library 区域对应 Lode，呈现站点知识、能力包、任务模板、原子动作、测试样例、版本和失效状态；
- Browser 区域对应 Harbor，呈现浏览器身份、Profile、Runtime Session、Viewer 和人工接管。

用户看到的是一个 App；内部仍然通过 WebEnvoy Core、Lode 和 Harbor 的正式边界协作。

## 不是什么

WebEnvoy App 不是通用浏览器，也不是独立任务运行时。它不直接执行能力，不直接管理 Harbor 的底层运行时，也不保存 Lode 的能力资产真相。

它的价值是把这些系统组织成一个可以被人类用户使用的产品入口。
