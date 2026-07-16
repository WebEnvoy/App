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
2. Work navigation: hover or focus the task-list heading, open its overflow
   menu, and switch grouping between Site Skill and Account Identity or sorting
   between priority and recent update; confirm every view shows the same
   threads, preserves the selected thread, and uses the left-edge rail to move
   between task turns without replacing center or right-panel content.
3. Task turns: confirm the center shows every turn in chronological order, with
   each business input followed by a collapsed `正在执行` action record and a
   terminal summary or live progress summary. Expand the action record to inspect
   atomic page actions; waiting and partial outcomes remain honest.
4. Result consumption: inspect the structured result in the center, then switch
   the right file preview between JSON, rendered Markdown, and page image. The
   right panel starts empty and changes only after an explicit center action;
   rail navigation must not change it.
5. Work creation: choose a Site Skill, use its declared fields, choose a
   compatible Account Identity and create the sample task.
6. Account Identity: inspect independent login, environment, instance and
   controller facts, edit the identity, and manage its environment from one
   surface.
7. Environment Dependencies: switch from Account Identities to the independent
   dependency tab, install CloakBrowser, wait for launch validation, and confirm
   the Provider becomes available while identities without confirmed login stay
   unavailable for task creation.
8. Human takeover: open `读取收藏夹中的竞品笔记`, open the browser, take over,
   choose `已完成，继续`, wait for validation and return to the resumed task.
9. Library: filter by site and business tag, open a skill, and use `去使用`.
10. Missing identity: use the Taobao skill, create a Taobao identity, and confirm
   the prototype returns to the original task form with that identity selected.
11. Authorization: change the global default in Settings, the skill default in
   Library, and the task override in Work creation.
12. Settings: click the avatar/name entry, then inspect Global Authorization,
    Connections, and Diagnostics as separate pages.

## Deliberate Product Corrections

- Reuses the existing Codex-like shell, density, toolbar and list grammar, not
  the current page hierarchy or status-heavy composition.
- Business results are the default Work body. Source facts are compact and
  runtime diagnostics are collapsed.
- Work uses the existing Codex-like three-panel shell for task detail: grouped
  threads on the left, multiple task turns and business results in the center,
  and a generic multi-tab artifact preview on the right.
- The current task thread owns the center timeline. The center keeps all task
  turns in chronological order and each turn follows
  request -> collapsed atomic action record -> terminal summary. Active and
  waiting work uses a progress summary; raw parameters, logs and traces stay in
  diagnostics. The rail only navigates this timeline; the right preview opens
  only from an explicit center action.
- A Task Thread is fixed by Site Skill + Account Identity. The left navigator
  can project the same threads by Site Skill or by Account Identity; switching
  grouping or sorting preserves selection and does not duplicate task facts.
- Task grouping and sorting live in the list-heading overflow menu. The heading
  reveals overflow and new-task actions on hover or keyboard focus, following
  the existing Codex-like project-list interaction instead of showing a
  persistent segmented control.
- Work, Account Identity and Library are the only primary product domains.
  Settings is a utility destination opened from the user identity area.
- Account Identity keeps site-account facts, instance actions and environment
  management together. Provider installation and repair live in a sibling
  Environment Dependencies tab.
- Harbor/CloakBrowser profile and session research informs the independent
  login, environment, instance, controller and health facts. Raw paths,
  endpoints and full fingerprint fields remain folded into technical detail.
- Task creation is generated from Site Skill inputs rather than an open prompt.
- Authorization is configured at its owner surface: global in Settings, skill
  in Library, task in Work, and one-time at execution.
- Evidence refs, endpoints, raw runtime facts and owner explanations are not
  part of the default product surface.
