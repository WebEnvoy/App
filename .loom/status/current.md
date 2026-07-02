# Current Status

## Derived Fact Chain View

- Item ID: GH-96
- Goal: 为 milestone #9 FR #92 定义 Desktop Task Thread 设计 checkpoint 事实。
- Scope: Docs-only checkpoint，记录人类用户定位、App 自动执行入口边界、全局观测入口、手动浏览启动台、Task/Run 产品语义、左侧任务组织、中间 Task Thread、右侧上下文面板、底部固定控制区、Library/Browser 管理面、选定方向稿和 desktop shell native 边界；覆盖 #96-#99。
- Execution Path: docs-only/desktop-ui-design-checkpoint
- Workspace Entry: .
- Recovery Entry: .loom/progress/GH-96.md
- Review Entry: .loom/reviews/GH-96.json
- Validation Entry: .loom/progress/GH-96.md
- Closing Condition: PR #114 merged into `main`; hosted required checks passed; issue closeout is owned by the coordinator as the next external step.
- Current Checkpoint: closed_out
- Current Stop: Post-merge carrier closeout recorded for WebEnvoy/App#96 via PR #114.
- Next Step: No further action for GH-96 after coordinator issue closeout comments are posted and covered issues are closed.
- Blockers: None recorded.
- Latest Validation Summary: Post-merge closeout consumed PR #114, head 6522fcd362471538e7a9ff5fd1403c64f0fad4e5, merge commit 883902bddbf7693ca516638080bb13a33deb7367, and hosted run 28582055006 with all required checks passing.
- Recovery Boundary: Terminal carrier for this docs-only Desktop UI design checkpoint; open or continue downstream Work Items for #93/#94/#95 implementation.
- Current Lane: terminal closeout

## Runtime Evidence

- Run Entry: not_applicable
- Logs Entry: not_applicable
- Diagnostics Entry: not_applicable
- Verification Entry: .loom/progress/GH-96.md
- Lane Entry: docs-only

## Sources

- Static Truth: .loom/work-items/GH-96.md
- Dynamic Truth: .loom/progress/GH-96.md
- Locator Truth: .loom/bootstrap/init-result.json
- Fact Chain CLI: loom fact-chain --target . --json

## Notes

- 2026-07-02: 当前 fact chain 切到 GH-96，用于 FR #92 Desktop UI 设计 checkpoint；这不声称 #93/#94/#95 已实现。
- 2026-07-02: Created PR https://github.com/WebEnvoy/App/pull/114 for GH-96 docs-only checkpoint.
- 2026-07-02: 根据用户讨论把 checkpoint 从 Work/Library/Browser/Settings 调整为 Task Thread first；新增版本化方向稿、VISION 修订和 root DESIGN.md。
- 2026-07-02: 根据用户澄清补充：自动执行入口才限制为 Lode 确定性 workflow；App 同时是全局观测入口；没有站点技能时可作为受控浏览器启动台；Library/Browser 管理面不被取消。
- 2026-07-02: Recorded GH-96 spec and semantic review for portable carrier head 74c37a603fe35c29a315024ab7127430b6097a83. Subsequent diff must remain carrier-only before merge.
- 2026-07-02: #93/#94/#95 实现前仍必须消费 VISION.md、README.md、DESIGN.md 和 ADR 0008，并与 Core/Harbor/Lode 合同对齐。
