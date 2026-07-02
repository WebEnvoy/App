# Current Status

## Derived Fact Chain View

- Item ID: GH-96
- Goal: 为 milestone #9 FR #92 定义 Desktop Task Thread 设计 checkpoint 事实。
- Scope: Docs-only checkpoint，记录人类用户定位、App 自动执行入口边界、全局观测入口、手动浏览启动台、Task/Run 产品语义、左侧任务组织、中间 Task Thread、右侧上下文面板、底部固定控制区、Library/Browser 管理面、选定方向稿和 desktop shell native 边界；覆盖 #96-#99。
- Execution Path: docs-only/desktop-ui-design-checkpoint
- Workspace Entry: /Volumes/2T/.codex/worktrees/f0c5/App
- Recovery Entry: .loom/progress/GH-96.md
- Review Entry: .loom/reviews/GH-96.json
- Validation Entry: .loom/specs/GH-96/build-evidence.json
- Closing Condition: PR ready for FR #92 checkpoint review；不 merge，不关闭 #93/#94/#95，也不声称已实现 #93/#94/#95。
- Current Checkpoint: merge
- Current Stop: GH-96 当前 head 语义 review 已记录；等待 carrier-only review commit、PR metadata 回写、hosted pr-gate 和受控合并。
- Next Step: 提交并推送 GH-96 review carrier，更新 PR #114 Head SHA，等待 hosted `loom-pr-merge-gate` 通过后合并。
- Blockers: none for docs-only merge; #93/#94/#95 实现前仍必须消费 VISION.md、README.md、DESIGN.md 和 ADR 0008，并与 Core/Harbor/Lode 合同对齐。
- Latest Validation Summary: `git diff --check` pass；`jq empty .loom/specs/GH-96/build-evidence.json` pass；`loom suite validate --target . --item GH-96 --json` returned `not_applicable` with no missing inputs；`loom fact-chain --target . --json` pass。
- Recovery Boundary: Docs-only checkpoint。若 diff 触碰 Electron/Vite/React code、package manifests、dependencies、schema/API/client/runtime behavior、fixtures、raw evidence handling 或 Core/Harbor/Lode repositories，必须重新 review。
- Current Lane: merge

## Runtime Evidence

- Run Entry: not_applicable
- Logs Entry: not_applicable
- Diagnostics Entry: not_applicable
- Verification Entry: .loom/specs/GH-96/build-evidence.json
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
- 2026-07-02: Recorded GH-96 spec and semantic review for product head c0ff3e8d3a8a9106c17b69a8c74007b7012d2737. Subsequent diff must remain carrier-only before merge.
