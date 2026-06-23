# WebEnvoy App

WebEnvoy App 是 WebEnvoy 的统一人类用户入口。

它承载任务、能力、运行记录、证据、异常处理，以及 Harbor 提供的 Profile、Runtime Session、Viewer 和人工接管界面。

WebEnvoy App 不是 Core Runtime，也不是 Harbor Runtime。所有任务执行仍通过 WebEnvoy API Server 和 Core Runtime；浏览器身份和运行现场仍通过 Harbor Runtime API；网站经验、能力包和任务封装仍来自 Lode。

## 产品定位

WebEnvoy App 是产品外壳，不是执行真相源。

它让用户通过一个入口完成：

- 配置和查看网页操作任务；
- 查看能力、任务模板和运行记录；
- 查看结构化结果、失败原因和证据；
- 处理登录异常、验证码、访问受限和人工接管；
- 管理 Harbor 提供的 Profile、浏览器身份和 Runtime Session；
- 进入 Viewer 接管浏览器现场；
- 查看 provider、Profile 和 Runtime Session 的客观能力事实。

## 与 WebEnvoy / Harbor / Lode 的关系

- WebEnvoy App 负责统一人类用户入口；
- WebEnvoy Core 负责 API Server、Core Runtime、任务执行、结果归一和 Run Record；
- Harbor 负责浏览器身份、Runtime Session、Viewer、人工接管、provider 能力事实和运行证据；
- Lode 负责网站经验、能力包、原子动作、任务封装、模板和测试样例。

```text
WebEnvoy App
  ↓
WebEnvoy API Server
  ↓
WebEnvoy Core Runtime
  ↓                 ↓
Lode                Harbor Runtime API
```

App 可以调用 WebEnvoy API Server 和 Harbor Runtime API，但不应绕过 Core 写任务记录，也不应绕过 Harbor API 操作浏览器会话。

## 第一阶段产品表面

第一阶段可以先以本地 Web UI 或 Desktop shell 承载：

- Tasks：任务提交、运行状态和结果；
- Capabilities：能力和任务模板浏览；
- Runs：运行记录、失败原因和恢复入口；
- Evidence：截图、Snapshot、网络摘要和验证结果；
- Browser Identities：Profile、账号环境和登录状态；
- Sessions：Runtime Session、Viewer、接管和关闭；
- Settings：本地 API、Harbor Runtime、数据目录和连接状态。

## 不做什么

WebEnvoy App 不应：

- 直接执行 Lode 能力；
- 直接管理浏览器进程、浏览器数据目录或 provider driver；
- 直接写 Core Run Record；
- 绕过 Harbor Runtime API 操作 Runtime Session；
- 成为业务策略系统、账号运营系统或内容排期系统。

## 文档

- [愿景](VISION.md)
- [架构](docs/architecture.md)
- [产品表面](docs/product-surface.md)
- [本地运行形态](docs/local-runtime.md)

## 许可证

本仓库采用 GNU Affero General Public License v3.0。
