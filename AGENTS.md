# WebEnvoy App 仓库约定

本仓库是 `WebEnvoy/App`，负责 WebEnvoy 的统一人类用户入口和产品外壳。

App 可以承载 WebEnvoy Console、Harbor Profile / Runtime Session / Viewer UI、运行记录、证据查看和异常处理入口，但不承载 Core Runtime、Harbor Runtime 或 Lode 能力资产真相。

## 边界

- 任务执行必须通过 WebEnvoy API Server 和 Core Runtime；
- 浏览器身份与运行现场必须通过 Harbor Runtime API；
- 网站经验、能力包、任务封装和模板来自 Lode；
- App 不直接执行能力、不直接写 Run Record、不绕过 Harbor API 操作 Runtime Session；
- App 可以保存 UI 设置和非敏感缓存，但不作为任务、Profile、Session、Evidence 或能力资产的真相源。

## 目录方向

后续代码建议按以下方向组织：

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

## 技术默认

默认主语言为 TypeScript / Node.js。UI 可以先采用本地 Web UI，后续再由 Desktop shell 承载。App-facing 类型应复用 WebEnvoy API、Harbor API 和共享 schema，不在 App 内自行定义不兼容模型。

## 许可证

本仓库属于 AGPL 核心产品表面仓库。面向外部集成的通用 SDK、协议定义和生成类型如需更宽松许可，应优先放入独立 contracts / SDK 仓库，而不是放入 App 内部实现路径。
