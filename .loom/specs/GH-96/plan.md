# Plan

## Steps

1. 读取 AGENTS、ROADMAP、docs/contracts、ADR 0002-0007、pending decisions，
   以及 GitHub issues #92/#96/#97/#98/#99 和下游 #93/#94/#95。
2. 使用 Desktop Taste 完成 Desktop Read、IA/layout、density、native feel、
   motion、brand、art direction 和 design-document 约束判断。
3. 新增 ADR 0008 作为 checkpoint 事实载体。
4. 更新 docs indexes，让后续实现工作能定位 ADR 0008。
5. 增加 GH-96 item-specific Loom carrier。
6. 使用 `git diff --check`、`loom suite validate --target . --item GH-96 --json`
   和 PR 创建后的 metadata readback 做验证。

## Risks

- 首屏、Browser priority、evidence visibility 和 result density 仍需要用户确认。
- Pending ADR decisions PD-0012/PD-0013/PD-0014 继续约束 evidence UI。
- 本 checkpoint 不能被解释为 #93/#94/#95 实现。
