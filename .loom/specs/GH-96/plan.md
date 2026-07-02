# Plan

## Steps

1. 读取 AGENTS、ROADMAP、docs/contracts、ADR 0002-0007、pending decisions，
   以及 GitHub issues #92/#96/#97/#98/#99 和下游 #93/#94/#95。
2. 使用 Desktop Taste 完成 Desktop Read、IA/layout、density、native feel、
   motion、brand、art direction 和 design-document 约束判断。
3. 基于用户讨论修订 VISION.md、ADR 0008 和 Desktop DESIGN.md。
4. 将选定方向稿保存到 docs/design/，并更新 docs index。
5. 同步 GH-96 item-specific Loom carrier。
6. 使用 `git diff --check`、`loom suite validate --target . --item GH-96 --json`
   和 PR 创建后的 metadata readback 做验证。

## Risks

- 设计稿只是方向参考，不是高保真原型或数据合同。
- Task/Run 产品语义后续仍需和 Core/Harbor/Lode 合同对齐。
- Pending ADR decisions PD-0012/PD-0013/PD-0014 继续约束 evidence UI。
- 本 checkpoint 不能被解释为 #93/#94/#95 实现。
