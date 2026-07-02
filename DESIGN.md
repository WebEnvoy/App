# DESIGN.md

## 1. 桌面设计主张

WebEnvoy App 应像一个克制、紧凑、可信的桌面任务工作台，而不是聊天应用、网页后台或浏览器管理器。

目标用户是市场、运营、产品经理等非技术用户。他们需要选择站点技能、选择账号身份、填写业务输入、执行确定性任务、查看结果依据和执行现场。

当前选定方向稿：

![WebEnvoy Desktop Task Thread direction](docs/design/desktop-task-thread-direction.png)

这张图只作为设计方向参考。后续实现应吸收布局、密度、状态层级和任务心智，不照抄具体字段、icon、像素、随机文本或假数据。

## 2. 平台目标

- 产品形态：Desktop App first。
- 平台深度：cross-platform desktop。
- 默认技术载体：Electron shell + React renderer + Radix primitives。
- macOS 和 Windows 应共享信息架构，但窗口控制、菜单、快捷键、focus、selection、theme 和高对比模式跟随平台。
- 原生层只封装 OS 边界能力，不承载 WebEnvoy 业务协议。

## 3. 窗口与表面系统

主窗口采用三栏工作台：

```text
左侧栏：全局入口 + 任务组织
中间栏：当前 Task Thread
右侧栏：可折叠上下文面板
```

- 左侧栏长期稳定，使用 source-list 密度。
- 中间栏承载主要工作：标题、状态、navigation rail、任务结束报告、执行过程和底部操作区。
- 右侧栏依附当前 Task/Run/selection，只放结果依据、执行现场、账号身份、站点技能和诊断上下文。
- 弹窗只用于短流程，例如创建账号身份；不把长配置塞进 modal。
- 底部固定操作区属于当前 Task，不是聊天输入框。

## 4. 布局语法

选定布局类型：sidebar app + task thread workspace + inspector/context panel。

左侧任务组织：

```text
任务
  账号身份
    站点技能
      Task
```

中间 Task Thread：

- 顶部显示任务标题、状态、站点技能、账号身份和业务输入；
- `打开 ▾` 位于中间栏顶部右侧，用于打开上下文面板；
- Codex-like navigation rail 表达当前 Run/过程位置；
- 完成后默认展开任务结束报告，收起执行过程；
- 运行中默认展开当前过程。

右侧上下文面板：

- `结果依据`
- `执行现场`
- `账号身份`
- `站点技能`
- `诊断`

## 5. 排版

- 使用系统字体。
- 标题只用于当前 Task，不使用 hero-scale type。
- 列表行、metadata、状态、字段来源和时间戳要紧凑但可读。
- 技术字段在浅层 UI 中应转成业务语言，例如 `结果依据`、`执行现场`、`账号身份`。
- 代码、路径、原始 selector 或诊断细节只在深层诊断或开发者模式中显示。

## 6. 间距与密度

密度目标：dense，但不是 control-room。

- 左侧栏行高接近桌面 source list。
- 中间栏报告区允许表格和紧凑 metadata。
- 右侧证据面板可以高密度展示字段来源和状态。
- 控件必须保留可点击目标、focus ring 和 disabled 说明。
- 不使用大面积 marketing 留白、dashboard 卡片墙或 hero 区块。

## 7. 色彩与材质

- 主色只用于 selection、primary action 和少量 brand anchor。
- success、warning、error、info 使用语义色，不被品牌色覆盖。
- 左侧栏可使用轻微 tinted surface；主内容保持高可读白/系统背景。
- right context panel 用边界、tab underline 和轻量 surface 表达层级。
- 材质和透明只服务平台感，不牺牲表格、正文、状态和证据可读性。

## 8. 组件

当前需要的组件规则：

- Sidebar source list：全局入口、任务区、底部用户/设置。
- Tree list：`账号身份 -> 站点技能 -> Task`。
- Status adornment：Task 行右侧蓝点、spinner、warning、check 等，不作为分组依据。
- Task header：标题、状态、站点技能、账号身份、业务输入。
- Navigation rail：中间栏左侧细窄刻度轨，只表达位置，不做 stepper。
- Task report：完成后的主输出，默认展开。
- Process log：执行过程，运行中展开，完成后默认折叠。
- Bottom control area：修改输入、再次执行、查看结果依据、打开执行现场、更多。
- Context tabs：结果依据、执行现场、账号身份、站点技能、诊断。
- Modal：用于创建账号身份等短流程。

不要在第一版创建完整组件库清单。

## 9. 动效与交互手感

- 动效服务状态确认和空间理解。
- Hover 只揭示次级控制，例如任务区标题行的 `+` / `⋯`。
- 右侧面板展开/收起应快速、稳定、可 reduced motion。
- Run 切换、过程折叠和任务完成反馈要轻，不做营销式动画。
- Loading 应靠近对象 inline 展示，不用全屏遮罩替代局部状态。

## 10. 品牌表达

品牌表达应服务可信任务执行：

- app icon、selected color、completion marker 和少量 microcopy 可以体现 WebEnvoy 识别；
- 主工作区和结果依据区域必须克制；
- 不做品牌官网式背景、装饰大卡、渐变海报或空洞插画；
- 空态文案应直接告诉用户下一步，而不是讲愿景。

## 11. Anti-Slop 规则

- 不把 App 做成 Agent 聊天窗口。
- 不把底部操作区做成自由输入 composer。
- 不把 App 做成普通浏览器或指纹浏览器。
- 不把首屏做成 Work/Library/Browser/Settings 的网页 dashboard。
- 不在浅层 UI 暴露 API endpoint、schema、Core/Harbor/Lode 细节。
- 不用卡片墙替代表格、列表和树。
- 不让 right context panel 承担主流程。
- 不把状态作为左侧任务列表的第一分组。
- 不在 App 中保存 raw evidence、cookie、token、profile storage 或 owner truth。
- 不用设计稿里的假数据反推合同。

## 12. Agent 实现指南

后续 Agent 修改 App UI 前必须先读取：

- `VISION.md`
- `DESIGN.md`
- `docs/adr/0008-desktop-ui-design-checkpoint.md`

新增 UI 时先说明它继承了哪些规则：Task Thread first、账号身份分组、底部固定任务操作区、right context tabs、owner API boundary。

如果实现需要偏离当前设计方向，必须记录：

- 为什么偏离；
- 影响哪些 issue 或 FR；
- 是否改变 Task / Run / 账号身份 / 站点技能语义；
- 是否需要用户重新确认。

实现验证至少检查：

- 真实数据下的左侧任务树；
- 长任务标题、长 URL 和长账号身份名；
- 运行中、完成、失败、需要处理、已读/未读状态；
- 键盘 focus 和 selection；
- 右侧面板展开/收起；
- 窗口缩放；
- light/dark 或系统主题边界。

不要把本文件扩展成完整设计系统。只有真实实现需要的规则才进入这里。
