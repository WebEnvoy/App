# Implementation Contract

## Inputs

- `AGENTS.md`
- `ROADMAP.md`
- `docs/contracts/README.md`
- `docs/adr/0002-run-viewer-and-handoff-surface.md`
- `docs/adr/0003-login-captcha-and-user-takeover.md`
- `docs/adr/0004-run-history-evidence-and-capability-browser.md`
- `docs/adr/0005-library-capability-catalog-fields.md`
- `docs/adr/0006-stage2-task-entry-and-display-contract.md`
- `docs/adr/0007-desktop-app-technical-baseline.md`
- `docs/adr/pending-decisions.md`
- GitHub issues #92、#96、#97、#98、#99、#93、#94、#95
- Desktop Taste plugin skill outputs

## Output

- `VISION.md`
- `DESIGN.md`
- `docs/adr/0008-desktop-ui-design-checkpoint.md`
- `docs/design/desktop-task-thread-direction.png`
- docs index updates
- GH-96 Loom carrier
- `.loom/bootstrap/init-result.json` fact-chain entry point sync

## Acceptance

- VISION 明确 App 面向人类业务用户，不是 Agent 容器。
- ADR 0008 覆盖 #96 Task Thread low-fidelity IA。
- ADR 0008 覆盖 #97 Task/Run、站点技能、账号身份、业务输入、结果依据和执行现场关系。
- ADR 0008 覆盖 #98 process/completion/failure/unavailable/redacted/expired/unknown outcome display rules。
- ADR 0008 覆盖 #99 desktop shell native boundary。
- DESIGN.md 记录可延续的桌面设计契约。
- 方向稿纳入版本控制，并标记为 reference, not pixel spec。
- ADR 0008 列出 #93/#94/#95 entry conditions。
- `.loom/bootstrap/init-result.json` 和 `.loom/status/current.md` 指向 GH-96。
- Local validation 通过。

## Forbidden Changes

- 不改 code、package manifests、dependencies、schemas、generated types、fixtures、
  runtime behavior、UI skeleton、raw evidence handling 或 Core/Harbor/Lode repo。
