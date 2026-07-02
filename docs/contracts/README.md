# App Contracts

This directory indexes stable App contracts without duplicating the accepted ADRs.

| Contract area | Authority | Consumer boundary |
| --- | --- | --- |
| Desktop App product shape, UI stack, IA, connection state, and local cache boundary | [ADR 0007](../adr/0007-desktop-app-technical-baseline.md) | App Desktop/UI skeleton planning and review may rely on Desktop App first, Electron/React/TypeScript/Vite/Radix UI/lucide-react defaults, client boundaries, and no-store rules. |
| Milestone #9 Desktop UI 设计 checkpoint | [ADR 0008](../adr/0008-desktop-ui-design-checkpoint.md) | #93/#94/#95 的实现规划和 review 可以消费推荐的 Workbench IA、状态矩阵、shell 边界和用户确认 gate。 |
| Task entry, run, result, failure, evidence, action request, Browser runtime, viewer, handoff, and Settings display | [ADR 0006](../adr/0006-stage2-task-entry-and-display-contract.md) | App Stage 3 planning, UI implementation, and review may rely on the display and ownership boundaries. |
| Library capability catalog fields | [ADR 0005](../adr/0005-library-capability-catalog-fields.md) | App Library planning and UI implementation may rely on the display fields and local-only cache boundary. |

## Stable Judgments Absorbed From Drafts

These are implementation-consumable summaries. The ADRs above remain the authority.

| Judgment | Authority | Draft source | Implementation consequence |
| --- | --- | --- | --- |
| App is a user-facing display and intent surface over Core, Lode, and Harbor facts. | [ADR 0006](../adr/0006-stage2-task-entry-and-display-contract.md), [ADR 0005](../adr/0005-library-capability-catalog-fields.md) | `docs/draft/architecture.md`, `docs/draft/product-surface.md` | Later implementation may render upstream facts and send owner API intents, but must not create App-owned Run Record, runtime/session, evidence, or Lode asset truth. |
| Work display covers task intent, run status, result/failure, evidence, recovery, and action request boundaries. | [ADR 0006](../adr/0006-stage2-task-entry-and-display-contract.md) | `docs/draft/product-surface.md` | Use ADR 0006 field/state tables; do not reintroduce the older surface list as a second contract. |
| Browser display covers runtime/session/profile refs, viewer/control/handoff facts, and unavailable/redacted/expired states. | [ADR 0006](../adr/0006-stage2-task-entry-and-display-contract.md) | `docs/draft/architecture.md`, `docs/draft/product-surface.md`, `docs/draft/local-runtime.md` | Show owner-provided refs and states only; do not expose raw CDP/VNC endpoints, profile paths, cookies, browser processes, or provider drivers as App truth. |
| Settings and cache are local-only, non-sensitive, rebuildable display state. | [ADR 0006](../adr/0006-stage2-task-entry-and-display-contract.md) | `docs/draft/local-runtime.md` | Store endpoint choices, recent views, filters, and stale markers only; do not store credentials, raw evidence, Run Records, package bodies, fixtures, or Harbor profile/session facts. |
| Library catalog v0 is a display projection over Lode/Core/Harbor facts. | [ADR 0005](../adr/0005-library-capability-catalog-fields.md) | `docs/draft/library-workbench.md`, `docs/draft/product-surface.md` | Consume catalog display fields and local UI preferences only; installer/update/lock/rollback/repair/workbench behavior is deferred. |
| Desktop App first is the product shape; localhost Web UI is a development carrier only. | [ADR 0007](../adr/0007-desktop-app-technical-baseline.md) | GitHub issues #74-#83, `docs/draft/local-runtime.md`, `research/synthesis.md` | Later skeleton work may use Electron/React/TypeScript/Vite/Radix UI/lucide-react defaults, but must not install dependencies or implement UI in docs-only PRs. |
| Milestone #9 从「运营工作台」桌面方向开始：Work-first IA、source-specific state label 和显式用户确认 gate。 | [ADR 0008](../adr/0008-desktop-ui-design-checkpoint.md) | GitHub issues #92/#96/#97/#98/#99 与 Desktop Taste checkpoint 输出 | 后续 #93/#94/#95 只有在消费 checkpoint 并确认列出的产品判断后才能实现。 |

Add a standalone contract file only when an accepted ADR is too broad for a direct implementation or test consumer.
