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

Library 区域呈现和操作 Lode 提供的网站经验和能力资产。

Library 不是只读能力目录，而是 Lode 资产的人类工作台。它需要区分平台资产和用户个人资产，并提供安装、更新、配置、调试、探索、修复和上报入口。

### Platform Assets

平台资产是官方或公共分发的能力资产。

- 查看可用站点；
- 查看官方站点知识；
- 查看官方能力包；
- 查看官方任务模板；
- 查看官方测试样例；
- 按需安装站点知识或能力包；
- 更新到新版本；
- 锁定版本；
- 回滚版本；
- 查看变更记录；
- 查看官方失效标记。

### My Assets

用户个人资产是用户私有或团队私有的能力资产。

- 查看个人能力；
- 查看个人任务模板；
- 管理用户 overlay；
- 管理 fork；
- 管理探索草稿；
- 管理修复草稿；
- 管理私有测试样例；
- 查看版本历史；
- 查看 diff；
- 回滚；
- 导出；
- 可选提交为公共贡献。

### Explorer

Explorer 用于网站探索和知识形成。

- 选择站点；
- 选择 Profile / Runtime Session；
- 探索页面状态和入口；
- 捕获 Snapshot、页面状态摘要、网络摘要和验证点；
- 记录操作路径；
- 形成站点知识草稿；
- 形成能力草稿；
- 形成任务模板草稿；
- 运行测试；
- 保存为用户个人资产。

### Reports

Reports 用于能力失效、站点变化和修复上报。

- 标记能力失效；
- 标记任务模板失效；
- 创建站点变化报告；
- 创建修复请求；
- 附加脱敏证据；
- 提交平台失效上报；
- 管理私有失效标记。

平台失效上报应只包含脱敏信息，例如能力 ID、版本、失败类型、页面状态摘要、元素变化摘要、错误码和证据引用。

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
- 平台资产安装目录；
- 用户个人资产目录；
- 证据策略；
- 日志和诊断；
- 更新与版本信息。
