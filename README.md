# WebEnvoy App

WebEnvoy App 是 WebEnvoy 的统一人类用户入口。

它承载网页操作任务、能力资产、运行记录、证据、异常处理，以及 Harbor 提供的 Profile、Runtime Session、Viewer 和人工接管界面。

WebEnvoy App 不是 Core Runtime，不是 Harbor Runtime，也不是 Lode 资产仓库。所有任务执行仍通过 WebEnvoy API Server 和 Core Runtime；浏览器身份和运行现场仍通过 Harbor Runtime API；网站经验、能力包和任务封装仍来自 Lode。

## 产品定位

WebEnvoy App 是产品外壳，不是执行真相源，也不是能力资产真相源。

它让用户通过一个入口完成：

- 配置、运行和查看网页操作任务；
- 浏览、安装、更新和锁定平台能力资产；
- 创建、配置、测试和版本管理个人能力资产；
- 探索网站，形成站点知识、能力草稿和任务模板草稿；
- 查看结构化结果、失败原因和证据；
- 标记能力失效、创建修复草稿，并提交脱敏失效上报；
- 处理登录异常、验证码、访问受限和人工接管；
- 管理 Harbor 提供的 Profile、浏览器身份和 Runtime Session；
- 进入 Viewer 接管浏览器现场；
- 查看 provider、Profile 和 Runtime Session 的客观能力事实。

## 三个产品域

WebEnvoy App 第一阶段采用一个 App、三个产品域：

```text
Work    → WebEnvoy Core
Library → Lode
Browser → Harbor
```

### Work

Work 区域负责呈现任务运行、结果、证据和恢复流程。

- Tasks；
- Runs；
- Results；
- Evidence；
- Recovery。

### Library

Library 区域负责呈现和操作 Lode 能力资产。

它不只是只读目录，而是 Lode 资产的人类工作台：

- Platform Assets：平台站点知识、官方能力包、官方任务模板、版本和更新；
- My Assets：个人能力、个人任务模板、私有 overlay / fork、草稿、测试样例和版本历史；
- Explorer：网站探索、知识捕获、能力草稿和任务模板草稿；
- Reports：能力失效、站点变化、修复请求和脱敏证据上报。

Library 可以提供浏览、安装、更新、配置、调试、测试、修复、版本管理和上报入口；Lode 仍是能力资产和任务封装的真相源。

### Browser

Browser 区域负责呈现 Harbor 浏览器身份和运行现场。

- Browser Identities；
- Profiles；
- Runtime Sessions；
- Viewer / Takeover；
- Provider Capability Facts。

## 与 WebEnvoy / Harbor / Lode 的关系

- WebEnvoy App 负责统一人类用户入口；
- WebEnvoy Core 负责 API Server、Core Runtime、任务执行、结果归一和 Run Record；
- Lode 负责网站经验、能力包、原子动作、任务封装、模板、测试样例、版本和失效标记；
- Harbor 负责浏览器身份、Runtime Session、Viewer、人工接管、provider 能力事实和运行证据。

```text
WebEnvoy App
  ├── WebEnvoy API Server → WebEnvoy Core Runtime
  ├── Lode 资产接口 / 本地资产来源
  └── Harbor Runtime API
```

涉及任务执行必须通过 WebEnvoy API Server 进入 Core；涉及能力资产真相必须落到 Lode；涉及浏览器身份和运行现场必须通过 Harbor Runtime API。App 不应绕过 Core 写任务记录，不应保存 Lode 能力资产真相，也不应绕过 Harbor API 操作浏览器会话。

## 第一阶段产品表面

第一阶段可以先以本地 Web UI 或 Desktop shell 承载：

- Work：任务提交、运行状态、结果、证据和恢复入口；
- Library：平台资产、个人资产、网站探索、能力草稿、版本管理和失效上报；
- Browser：浏览器身份、Profile、Runtime Session、Viewer、接管和 provider 能力事实；
- Settings：本地 API、Harbor Runtime、Lode 资产来源、数据目录和连接状态。

## 不做什么

WebEnvoy App 不应：

- 直接执行 Lode 能力；
- 保存 Lode 能力资产真相；
- 直接管理浏览器进程、浏览器数据目录或 provider driver；
- 直接写 Core Run Record；
- 绕过 Harbor Runtime API 操作 Runtime Session；
- 默认上传用户个人资产、业务输入或未脱敏执行现场；
- 成为业务策略系统、账号运营系统或内容排期系统。

## 文档

- [愿景](VISION.md)
- [架构决策记录](docs/adr/0001-record-architecture-decisions.md)

## 许可证

本仓库采用 [GNU Affero General Public License v3.0](LICENSE)。
