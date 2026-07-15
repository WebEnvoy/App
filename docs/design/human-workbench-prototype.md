# Human Workbench High-Fidelity Prototype

## Status

This is the interactive high-fidelity prototype for App #305. It uses sample
data and does not connect to Core, Harbor or Lode runtime services. It is an
isolated Vite entry and does not change the production renderer entry.

User approval is the product Gate. Build success, automated checks, a PR or a
Loom review cannot replace that approval.

## Run

```bash
npx vite --config vite.prototype.config.ts
```

Open `http://127.0.0.1:5174/prototype.html`.

## Review Journeys

1. Work: open collection, readable content, download and not-submitted write
   results; expand diagnostics only when needed.
2. Work creation: choose a Site Skill, use its declared fields, choose a
   compatible Account Identity and create the sample task.
3. Result consumption: open a collected note from the structured result table.
4. Browser: create an Account Identity, open or reuse an instance and inspect
   the persistent environment summary.
5. Provider recovery: open `内容研究号`, install CloakBrowser, wait for launch
   validation and return to the now-available identity.
6. Human takeover: open `读取收藏夹中的竞品笔记`, open the browser, take over,
   choose `已完成，继续`, wait for validation and return to the resumed task.
7. Library: filter by site and business tag, open a skill, and use `去使用`.
8. Missing identity: use the Taobao skill, create a Taobao identity, and confirm
   the prototype returns to the original task form with that identity selected.
9. Settings: change the global authorization default and expand skill-level or
   diagnostic details.

## Deliberate Product Corrections

- Reuses the existing Codex-like shell, density, toolbar and list grammar, not
  the current page hierarchy or status-heavy composition.
- Business results are the default Work body. Source facts are compact and
  runtime diagnostics are collapsed.
- Work, Browser and Library are the only primary product domains. Settings is a
  utility destination.
- Browser is Account Identity centered and keeps instance actions in the
  identity context.
- Task creation is generated from Site Skill inputs rather than an open prompt.
- Evidence refs, endpoints, raw runtime facts and owner explanations are not
  part of the default product surface.
