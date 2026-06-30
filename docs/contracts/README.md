# App Contracts

This directory indexes stable App contracts without duplicating the accepted ADRs.

| Contract area | Authority | Consumer boundary |
| --- | --- | --- |
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

Add a standalone contract file only when an accepted ADR is too broad for a direct implementation or test consumer.
