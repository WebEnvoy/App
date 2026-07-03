# DESIGN.md

## 1. 桌面设计主张

WebEnvoy App 应像一个克制、紧凑、可信的桌面任务工作台，而不是聊天应用、网页后台或浏览器管理器。

目标用户是市场、运营、产品经理等非技术用户。他们需要选择站点技能、选择账号身份、填写业务输入、执行确定性任务、查看结果依据和执行现场，也需要观测 Agent/API/CLI/MCP 等非 App 调用方产生的运行事实。站点技能当前先消费 Lode capability package metadata，workflow package 是后续扩展。

当前选定方向稿：

![WebEnvoy Desktop Task Thread direction](docs/design/desktop-task-thread-direction.png)

这张图只作为设计方向参考。后续实现应吸收布局、密度、状态层级和任务心智，不照抄具体字段、icon、像素、随机文本或假数据。若设计稿与 Codex App 截图或 restored 源码中的成熟桌面 shell 行为冲突，以 Codex 截图和源码为准；但不得复制 Codex 私有 runtime、业务语义或难以维护的混淆实现。

当前实现方向是 WebEnvoy-native Codex-style UI foundation：吸收 Codex 的样式系统、状态表达、面板行为、thread scroll、sticky composer、navigation rail、right tabs 和 app-level 页面策略，再落成 WebEnvoy 自有组件与产品语义。

## 2. 平台目标

- 产品形态：Desktop App first。
- 平台深度：cross-platform desktop。
- 默认技术载体：Electron shell + React renderer + Radix primitives。
- macOS 和 Windows 应共享信息架构，但窗口控制、菜单、快捷键、focus、selection、theme 和高对比模式跟随平台。
- 原生层只封装 OS 边界能力，不承载 WebEnvoy 业务协议。
- light/dark、motion、density、scrollbar、selection、focus 和 status 表达必须走 renderer token，不在页面组件中散落硬编码色值或临时动画参数。

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
- topbar 与左/中/右三栏同属 shell 层。左侧按钮、前进/后退、线程标题、右侧打开/折叠/全屏控制的位置和移动策略应参考 Codex App 源码；顶部中间区和右侧区不额外用强分割线制造第二套层级。
- 站点技能 discovery/detail 和 Settings 是 app-level 页面：保留左侧导航或设置导航，但不与 Task Thread 右侧 inspector 共存，也不显示右 panel 控制。
- Library 和 Browser 管理台仍存在：Library 管理站点技能和能力资产，Browser 管理账号身份、浏览器环境和 Identity Runtime Session。
- 弹窗只用于短流程，例如创建账号身份；不把长配置塞进 modal。
- 底部 sticky composer 属于当前 Task 的受限操作区，不是 Agent 自由聊天输入框；窄宽度时优先保留 icon 和发送控制，可隐藏文字标签，不允许按钮挤出或换行破坏高度。

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

- 顶部 shell 显示当前页面或 Task 标题，并承载前进、后退、左/右 panel 控制；站点技能、账号身份和业务输入在 thread 内容区以紧凑 context strip 展示；
- `打开 ▾` 属于右侧 topbar slot，只在 Task Thread 三栏模式出现；app-level 页面不显示该 slot；
- Codex-like navigation rail 表达当前 Run/过程位置，支持 hover preview、scrub 和当前可见 run 状态；
- 完成后默认展开任务结束报告，收起执行过程；
- 运行中默认展开当前过程。

右侧上下文面板：

- `结果依据`
- `执行现场`
- `账号身份`
- `站点技能`
- `诊断`

没有合适站点技能时，自动任务入口不可用；用户、Agent、API、CLI 或 MCP 仍可从账号身份或 Browser 管理面启动受控浏览器实例，进行手动浏览、登录、观察或准备环境。direct session 属于 Browser/Harbor session 管理路径，不创建 Core Task/Run/Result；只有进入 Core task path 才展示 Task Thread result/evidence/failure。

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
- 密度应由 token 和 primitive 控制：toolbar icon button、panel tab、list row、settings row、status glyph 和 navigation rail 不各自发明尺寸。
- 右侧 inspector tabs 需要可横向滚动和紧凑排布，但 active/hover 文本必须可读，不能因背景过近或间距过紧丢失层级。

## 7. 色彩与材质

- 主色只用于 selection、primary action 和少量 brand anchor。
- success、warning、error、info 使用语义色，不被品牌色覆盖。
- 左侧栏可使用轻微 tinted surface；主内容保持高可读白/系统背景。
- right context panel 用边界、tab underline 和轻量 surface 表达层级。
- 材质和透明只服务平台感，不牺牲表格、正文、状态和证据可读性。
- Design Token 必须覆盖 surface、text、border、hover、selected、focus、shadow、scrollbar、status、motion 和 density。组件只能消费 token 或已有 primitive，不直接写一次性色值。
- light/dark 必须同步到 document/root token；系统主题变化、Electron shell theme 和 packaged preview 都应保持一致。
- sticky composer 背后的 slot 应透明，不用深色挡板遮住 thread 内容；composer 自身才是浮层 surface。

## 8. 组件

当前需要的组件规则：

- Codex-style foundation primitives：`icon-xs`、`icon-2xs`、`cursor-interaction`、`hide-scrollbar`、`vertical-scroll-fade-mask`、toolbar icon button、panel tab、list row、sectioned page、settings row、status glyph、thread navigation rail。
- Sidebar source list：全局入口、任务区、底部用户/设置。
- Tree list：`账号身份 -> 站点技能 -> Task`。
- Status adornment：Task 行右侧蓝点、spinner、warning、check 等，不作为分组依据；运行中 spinner、完成、失败、需要处理应复刻 Codex 的 inline 状态表达位置和节奏。
- Task header：标题、状态、站点技能、账号身份、业务输入。
- Navigation rail：中间栏左侧细窄刻度轨，绑定 Run/turn 定位，支持 hover preview 和 scrub，只表达位置，不做 stepper。
- Task report：完成后的主输出，默认展开。
- Process log：执行过程，运行中展开，完成后默认折叠。
- Bottom control area：修改输入、再次执行、查看结果依据、打开执行现场、更多。
- Context tabs：结果依据、执行现场、账号身份、站点技能、诊断。
- Site skill discovery/detail：参考 Codex 插件发现页和详情页的信息层级，但使用站点技能、Lode metadata、Core/Harbor 边界等 WebEnvoy 语义；作为 app-level 页面承载，不放进右侧 inspector。
- Settings：参考 Codex 设置页骨架，作为独立 app-level 页面，不与 Task Thread 三栏和右侧 inspector 共存。
- Modal：用于创建账号身份等短流程。

不要在第一版创建完整组件库清单；只沉淀已经被实现消费的 foundation primitive。

## 9. 动效与交互手感

- 动效服务状态确认和空间理解。
- Hover 只揭示次级控制，例如任务区标题行的 `+` / `⋯`。
- 左右 panel collapse/resize 应参考 Codex 的阈值、宽度记忆、拖动手感和 reduced motion 策略；点击折叠和拖动折叠都要稳定，不能出现中间栏抖动。
- topbar 元素在右侧栏展开/收起时应跟随 shell 布局平滑移动，不能在中间区和右侧区之间跳动。
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
- 不把自动任务入口伪装成普通浏览器；但允许 Browser 管理面作为账号身份/浏览器环境启动台。
- 不把首屏做成 Work/Library/Browser/Settings 的网页 dashboard；但 Library/Browser 管理面不能消失。
- 不在浅层 UI 暴露 API endpoint、schema、Core/Harbor/Lode 细节。
- 不用卡片墙替代表格、列表和树。
- 不让 right context panel 承担主流程。
- 不在 app-level 页面保留空的 right panel、right panel tabs 或右侧打开/折叠控制。
- 不把状态作为左侧任务列表的第一分组。
- 不在 App 中保存 raw evidence、cookie、token、profile storage 或 owner truth。
- 不用设计稿里的假数据反推合同。
- 不在组件里新增硬编码主题色、hover 色、selected 色、shadow 或 scrollbar；先补 token 或复用 primitive。
- 不继续逐点补 CSS 来追 Codex 外观；复杂 shell 行为必须回到 Codex restored 源码和截图对齐后再实现。

## 12. Agent 实现指南

后续 Agent 修改 App UI 前必须先读取：

- `VISION.md`
- `DESIGN.md`
- `docs/adr/0008-desktop-ui-design-checkpoint.md`

新增 UI 时先说明它继承了哪些规则：Task Thread first、账号身份分组、底部固定任务操作区、right context tabs、owner API boundary、global observability boundary。

修改 shell、panel、composer、navigation rail、right inspector、site skill 或 settings 时，优先复用现有 WebEnvoy-native foundation：

- `src/renderer/uiFoundation.css` 中的 token 和 utility；
- `shellPrimitives.tsx` 中的 shell/panel primitive；
- 已有 status glyph、navigation rail、sectioned page、list row 和 settings row。

如 Codex 截图、Codex restored 源码和旧设计稿冲突，shell 结构、密度、panel 行为、thread scroll、sticky composer、focus、resize、hover/selected 和 tab 策略以 Codex 截图/源码为准；WebEnvoy 的 Task / Run / Evidence / Identity / Site Skill / Harbor Session 语义不被 Codex 产品语义替代。

如果实现需要偏离当前设计方向，必须记录：

- 为什么偏离；
- 影响哪些 issue 或 FR；
- 是否改变 Task / Run / 账号身份 / 站点技能语义；
- 是否需要用户重新确认。

实现验证至少检查：

- Codex restored 源码参考点和吸收/未吸收原因；
- Codex 截图、设计稿和本 PR/app preview 截图对比；
- computed style：token、light/dark、panel tab、list row、composer、navigation rail、scrollbar；
- 真实数据下的左侧任务树；
- 长任务标题、长 URL 和长账号身份名；
- 运行中、完成、失败、需要处理、已读/未读状态；
- 键盘 focus 和 selection；
- 左右面板点击折叠、拖动折叠、宽度记忆和阈值；
- 窗口缩放；
- composer 极限宽度下 icon、文字隐藏和发送按钮；
- navigation rail hover preview、scrub 和当前 run 绑定；
- right inspector tabs 密度、滚动和可读性；
- app-level 页面与三栏 shell 的互斥关系；
- light/dark 或系统主题边界。

不要把本文件扩展成完整设计系统。只有真实实现需要的规则才进入这里。
