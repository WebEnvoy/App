# Implementation Contract

- Write scope: `docs/adr/0005-library-capability-catalog-fields.md`, `docs/adr/pending-decisions.md`, and `.loom/**/GH-54*` item-specific carrier files.
- Allowed shared status update: `.loom/status/current.md` may point to GH-54 for this active PR.
- Forbidden scope: UI/code, App shell, catalog store, package schema, real capability package, fixtures, validators, installer, marketplace, hosted registry, external writes, issue closeout, and unrelated carriers for #36/#40/#44/#48/#52/#59.
- Validation floor: whitespace check, JSON validation, Loom fact-chain/suite/carrier validation where available, and hosted basic checks.
