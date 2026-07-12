# APP-239 Implementation Contract

- Anchor: App #239; covered closeout candidates: #239 and #241.
- Branch: `work/app-239-xhs-detail-handoff`; workspace: `.`.
- Allowed writes: existing App Core read/submit clients, Task Thread state/UI, bounded fixture/type cleanup, focused smoke, and APP-239 item-specific carriers.
- Preserve: Core/Harbor/Lode ownership, existing polling/result UI, XHS search, APP-290 BOSS deferred zero-fetch behavior, refs-only display, and fail-closed runtime gate.
- Prohibit: manual target URL/note/xsec synthesis, fixture-ready production state, raw evidence, sensitive material, BOSS production, automatic login, external write, bulk collection, or cross-repository edits.
- Validation: `npm run typecheck`, `npm run smoke`, packaged smokes, `git diff --check`, independent review, hosted gate, and merged packaged App live E2E.
