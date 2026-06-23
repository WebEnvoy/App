# 本地运行形态

WebEnvoy App 第一阶段可以采用本地优先形态。

## 目标形态

```text
WebEnvoy App
  → Local WebEnvoy API Server
  → Local Harbor Runtime
```

App 可以是：

- 本地 Web UI；
- Desktop shell；
- 后续远程或云端 Console。

无论 UI 形态如何变化，任务执行都应通过 WebEnvoy API Server 和 Core Runtime，浏览器身份与运行现场都应通过 Harbor Runtime API。

## 本地服务

第一阶段需要连接或启动：

- WebEnvoy API Server；
- Harbor Runtime API；
- Harbor Viewer；
- 本地证据查看能力；
- 本地配置和连接状态。

## 本地数据边界

App 可以保存：

- UI 设置；
- API 连接配置；
- 最近使用的任务视图；
- 本地诊断日志；
- 非敏感缓存。

App 不应成为以下数据的真相源：

- Run Record；
- Harbor Profile；
- Runtime Session；
- Lode 能力资产；
- Evidence Store。

这些数据应由对应系统维护，App 只通过正式 API 查询和呈现。

## 未来演进

本地优先不排斥后续云化。未来可以支持团队共享 Console、多设备同步和更完整的部署形态。

这些能力不应改变 App 的根本边界：App 是产品入口，不是任务执行真相源。
