# WebEnvoy App 架构

WebEnvoy App 是统一产品入口。它负责呈现任务、能力资产、运行记录、证据、异常处理和 Harbor 浏览器身份界面，但不承载核心任务执行逻辑，也不保存 Lode 能力资产真相。

## 分层关系

```text
WebEnvoy App
  ├── WebEnvoy API Server → WebEnvoy Core Runtime
  ├── Lode 资产接口 / 本地资产来源
  └── Harbor Runtime API
```

App 可以通过 WebEnvoy API Server 获取聚合后的任务、运行记录、结果、证据和能力视图；可以通过 Harbor Runtime API 获取 Profile、Runtime Session、Viewer 和能力事实；可以通过 Lode 或 WebEnvoy API 呈现站点知识、能力包、任务模板、版本、测试样例和失效状态。

涉及任务执行、Run Record、结果归一和能力运行的操作，必须通过 WebEnvoy API Server 进入 Core Runtime。涉及能力资产真相的操作，必须落到 Lode 的资产模型和版本边界。涉及浏览器身份和运行现场的操作，必须通过 Harbor Runtime API。

## 三个产品域

```text
Work    → WebEnvoy Core
Library → Lode
Browser → Harbor
```

### Work

Work 域通过 WebEnvoy API Server 进入 Core Runtime，呈现任务、运行记录、结果、证据和恢复入口。

### Library

Library 域通过 Lode 或 WebEnvoy API 呈现和操作能力资产。

Library 需要支持：

- 平台资产按需安装、更新、锁定版本和回滚；
- 用户个人资产创建、配置、测试、版本管理和回滚；
- 平台资产与用户 overlay / fork 的区分；
- 网站探索、知识捕获、能力草稿和任务模板草稿；
- 能力失效标记、修复请求和脱敏上报。

App 可以提供这些操作入口，但 Lode 仍是资产格式、版本、依赖、测试样例、包管理和真相源。

### Browser

Browser 域通过 Harbor Runtime API 呈现浏览器身份和运行现场。

Browser 需要支持：

- Profile；
- Browser Identity；
- Runtime Session；
- Viewer / Takeover；
- provider、Profile、Runtime Session 能力事实。

## 主要模块方向

```text
apps/
  shell/
  web-ui/

packages/
  app-client/
  api-client/
  lode-client/
  harbor-client/
  ui-components/
  state/

docs/
examples/
```

以上目录是初期实施方向，不代表已经实现。

## App-facing API

WebEnvoy App 需要的 API 表面包括：

- 任务提交和运行状态；
- Run Record 查询；
- Evidence 查询；
- 失败恢复入口；
- 站点知识、能力包和任务模板列表；
- 平台资产安装、更新、锁定和回滚入口；
- 用户个人资产的创建、版本管理、diff 和回滚入口；
- Explorer 运行、能力草稿和任务模板草稿入口；
- 失效标记、站点变化报告和脱敏上报入口；
- Harbor Profile 列表；
- Runtime Session 列表；
- Viewer / Takeover 入口；
- provider、Profile、Runtime Session 能力事实。

## 边界原则

- App 不直接执行 Lode 能力；
- App 不直接保存 Lode 能力资产真相；
- App 不直接写 Core Run Record；
- App 不绕过 Harbor Runtime API 操作 Runtime Session；
- App 不把 provider 能力事实解释成黑盒风险分；
- App 可以呈现证据，但不应默认外传敏感执行现场；
- App 可以承载本地 Web UI、Desktop shell 或未来 Cloud Console，但执行路径不随 UI 形态改变。

## 本地优先与未来云化

第一阶段可以采用本地优先形态：

```text
Desktop shell 或 localhost UI
  → 本地 WebEnvoy API Server
  → 本地 Harbor Runtime
  → 本地或远程 Lode 资产来源
```

未来可以演进为远程或云端 Console，但仍应保持：

```text
App 表面
  → API Server / Lode / Harbor Runtime API
  → Core Runtime / Lode 资产真相源 / Harbor Runtime
```
