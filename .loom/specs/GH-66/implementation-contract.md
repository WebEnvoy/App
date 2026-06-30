# Implementation Contract

- Write scope: `docs/README.md`, `docs/contracts/README.md`, `docs/draft/README.md`, current `docs/draft/*.md`, and `.loom/**/GH-66*` item-specific carrier files.
- Allowed shared status update: `.loom/status/current.md` may point to GH-66 for this active PR.
- Forbidden scope: UI/App shell/runtime/storage/schema/API code, generated facts, fixtures, product behavior, external writes, other repositories, issue closeout, merge, empty `docs/guides/`, and unrelated Work Item carriers.
- Validation floor: whitespace check, JSON validation, Loom fact-chain/suite/carrier validation where available, and hosted checks after PR creation.
