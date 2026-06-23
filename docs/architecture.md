# WebEnvoy App 架构

WebEnvoy App 是统一产品入口。它负责呈现任务、能力、运行记录、证据、异常处理和 Harbor 浏览器身份界面，但不承载核心任务执行逻辑。

## 分层关系

```text
WebEnvoy App
  ↓
WebEnvoy API Server
  ↓
WebEnvoy Core Runtime
  ↓                 ↓
Lode                Harbor Runtime API
```

App 可以直接调用 Harbor Runtime API 获取 Profile、Runtime Session、Viewer 和能力事实，也可以通过 WebEnvoy API Server 获取聚合后的任务视图。涉及任务执行、Run Record、结果归一和能力运行的操作，必须通过 WebEnvoy API Server 进入 Core Runtime。

## 主要模块方向

```text
apps/
  shell/
  web-ui/

packages/
  app-client/
  api-client/
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
- 能力与任务模板列表；
- Run Record 查询；
- Evidence 查询；
- 失败恢复入口；
- Harbor Profile 列表；
- Runtime Session 列表；
- Viewer / Takeover 入口；
- provider、Profile、Runtime Session 能力事实。

## 边界原则

- App 不直接执行 Lode 能力；
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
```

未来可以演进为远程或云端 Console，但仍应保持：

```text
App 表面
  → API Server
  → Core Runtime / Harbor Runtime API
```
