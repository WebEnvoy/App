# App Docs

This directory keeps App product decisions and implementation-facing contracts.

## Directories

| Directory | Purpose | Rule |
| --- | --- | --- |
| `adr/` | Decisions, tradeoffs, accepted/rejected options, and pending decision records. | Use for why a product or architecture direction is accepted, rejected, deferred, or still blocked. |
| `contracts/` | Stable contracts that later implementation, tests, or cross-repo consumers may rely on. | Prefer short indexes to accepted ADRs unless a separate contract file is needed. |
| `draft/` | Temporary planning notes that have not become stable truth. | Drafts must have status, owner, linked issue, and exit condition; they are not implementation authority. |

Do not create `docs/guides/` until there is a real runnable workflow to document.

## Current Desktop Baseline

[ADR 0007](adr/0007-desktop-app-technical-baseline.md) is the authority for the
Desktop App first product shape, UI technology defaults, Work/Library/Browser/
Settings desktop IA, client connection state rules, local cache boundary, and
the UI product design checkpoint required before skeleton work treats a design
direction as final.
