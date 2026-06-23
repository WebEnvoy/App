# Library 工作台

Library 是 WebEnvoy App 中对应 Lode 的产品域。

它不是只读目录，而是 Lode 资产的人类工作台。App 负责操作入口，Lode 负责资产真相源。

## 结构

```text
Library
  ├── Platform Assets
  ├── My Assets
  ├── Explorer
  └── Reports
```

## Platform Assets

面向官方或公共资产，支持查看、安装、更新、锁定、回滚和查看变更记录。

平台资产是公共基线，不应被用户直接改写。

## My Assets

面向用户或团队自己的资产，支持私有能力、私有任务模板、overlay、fork、草稿、测试样例、版本历史、diff、回滚、导出和可选贡献。

## Explorer

用于网站探索和知识形成。

典型流程：

```text
选择站点
  → 探索页面状态和入口
  → 记录操作路径
  → 形成站点知识草稿
  → 形成能力草稿或任务模板草稿
  → 测试
  → 保存为用户个人资产
```

## Reports

用于失效标记、站点变化报告、修复请求和脱敏上报。

## 边界

- Library 是 App 中的操作入口；
- Lode 是资产真相源；
- WebEnvoy Core 负责执行任务；
- Harbor 负责运行环境；
- App 不应复制另一套能力资产真相。
