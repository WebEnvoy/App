# 产品表面

本文档描述 WebEnvoy App 第一阶段需要承载的主要产品区域。

WebEnvoy App 采用一个 App、三个产品域：

```text
Work    → WebEnvoy Core
Library → Lode
Browser → Harbor
```

## Work 区域

Work 区域呈现 WebEnvoy Core 提供的任务运行、结果、证据和恢复能力。

### Tasks

- 创建任务；
- 选择能力或任务模板；
- 填写输入；
- 查看资源需求；
- 启动、停止或重试任务。

### Runs

- 查看 Run Record；
- 查看运行状态；
- 查看失败原因；
- 查看 unknown outcome 或 manual recovery 状态；
- 进入重试、恢复或对账流程。

### Results

- 查看结构化结果；
- 查看写入前检查和写入后验证结果；
- 查看 write operation ref；
- 查看状态对账结果。

### Evidence

- 查看截图；
- 查看 Snapshot；
- 查看网络摘要；
- 查看验证结果；
- 查看脱敏站点变化摘要。

### Recovery

- 处理登录异常；
- 处理验证码或访问受限；
- 进入人工接管；
- 从人工恢复后继续任务；
- 标记任务需要能力修复。

## Library 区域

Library 区域呈现 Lode 提供的网站经验和能力资产。

### Sites

- 查看站点列表；
- 查看站点状态；
- 查看站点变化摘要；
- 查看站点下的能力和任务模板。

### Capabilities

- 查看可用能力；
- 查看输入输出；
- 查看资源需求；
- 查看执行边界；
- 查看能力健康状态。

### Task Templates

- 查看任务模板；
- 配置模板参数；
- 查看模板依赖的能力；
- 从模板创建任务。

### Atomic Actions

- 查看可复用原子动作；
- 查看动作依赖的页面状态；
- 查看动作测试样例。

### Test Cases

- 查看脱敏测试样例；
- 查看回归结果；
- 查看能力是否需要修复。

### Versions

- 查看能力版本；
- 查看版本锁定状态；
- 查看兼容性说明。

### Invalidations

- 查看失效标记；
- 查看失败样本；
- 从站点变化进入修复流程。

## Browser 区域

Browser 区域呈现 Harbor 提供的浏览器身份和运行现场。

### Browser Identities

- 查看浏览器身份；
- 查看账号环境；
- 查看登录状态；
- 查看绑定站点和 Profile。

### Profiles

- 创建和管理 Profile；
- 配置代理、语言、时区、viewport 和扩展；
- 查看 Cookie / storage 持久化状态摘要；
- 启动或关闭浏览器。

### Runtime Sessions

- 查看运行中的 Session；
- 查看 provider、Profile 和 session 能力事实；
- 查看健康状态；
- 暂停、恢复或关闭 Session。

### Viewer / Takeover

- 进入浏览器 Viewer；
- 人工接管当前会话；
- 处理异常后交还给 Agent；
- 保留接管证据。

## Settings

- WebEnvoy API Server 连接状态；
- Harbor Runtime 连接状态；
- Lode 资产来源；
- 本地数据目录；
- 证据策略；
- 日志和诊断；
- 更新与版本信息。
