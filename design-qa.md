# Design QA

## Target

- Existing WebEnvoy Codex-like shell references:
  - `artifacts/app-265-packaged-readonly-smoke.png`
  - `artifacts/app-234-identity-page-browser.png`
  - `artifacts/gh-171-app-level-site-skill.png`
- Approved product inputs:
  - `docs/stories/APP-308.md`
  - `docs/design/human-workbench-information-architecture.md`

The target is the existing shell and interaction grammar, not a pixel clone of
the status-heavy production pages.

## Captures

Playwright captured and visually inspected Work at 1440 x 960, 1084 x 816 and
937 x 816, plus Account Identity, Library, artifact tabs and task creation. The
transient captures are not part of the product artifact; the runnable prototype
is the review artifact.

## Findings

- P0: none.
- P1: none.
- P2: none after correction.
- P3: the sample live-browser body is intentionally schematic because this
  prototype does not connect to a real site or runtime.

Verified corrections:

- The permanent evidence/runtime inspector is removed.
- No inactive Search or fake settings navigation remains.
- Structured results open a readable Result Item.
- Library site and business-tag filters work; `去使用` opens contract-driven
  task creation.
- Library hides the repeated site heading when a site is already selected and
  uses distinct site glyphs in the sidebar.
- Work groups tasks as site -> skill -> account identity, restores the existing
  run navigation rail, and presents prior/current runs in the center.
- The reusable right panel previews task artifacts through JSON, rendered
  Markdown, and image tabs; files are declared per task/Run, preview counts are
  explicit, and pending or absent files never reuse another task's output.
- Authorization choices consistently use Complete Access, Write Approval,
  Read Only, and Approve Every Step at global, skill, and task scopes.
- The primary navigation uses `账号身份`; the site account is explicitly named
  `站点账号`.
- Account Identity presents login, instance and recent-task summaries before
  technical environment details, with working edit and environment-management
  actions.
- Login, Provider/instance, controller, and recent-task facts are displayed as
  separate compact statuses rather than a large summary banner. Profile,
  fingerprint, user-agent, screen, page, health, and storage facts stay in a
  disclosure based on the Harbor/CloakBrowser research boundary.
- Provider repair and Provider switching clear stale instance/controller facts;
  Provider validation does not imply account login or instance health.
- Identity edits persist site-account and environment fields in the prototype;
  switching a repair-blocked identity to an available Provider updates only its
  environment state and still requires login confirmation before task creation.
- Provider installation state is independent from identity state. The sample
  data has one CloakBrowser-dependent identity while the running identities use
  the already available official Chrome Provider.
- Provider installation and repair are in the independent `环境依赖` tab, and
  successful repair updates the Provider and affected identity state.
- Clicking the avatar/name area opens Settings; no separate gear entry or local
  workspace label remains.
- Settings separates Global Authorization, Connections and Diagnostics. Global
  Authorization contains no skill/task/one-time configuration or environment
  dependency controls.
- Skill authorization is configured in Library detail and task authorization
  in Work creation; global and skill choices persist across navigation and the
  task form shows the resolved inherited policy. One-time confirmation remains
  an execution-time action.
- Creating a task from an Account Identity chooses a compatible Site Skill and
  preserves the identity. Submission creates a new sample task that displays
  the selected skill, stable identity, business input and resolved task policy.
- Provider recheck, service connection test, diagnostic recheck and diagnostic
  export controls all return visible prototype feedback.
- Missing compatible identity opens creation with the target site selected and
  returns to the originating task form.
- Provider recovery changes the affected identity from repair-required to
  available after install and launch validation.
- Human takeover distinguishes view, control, user completion, validation and
  task resume.
- The 1440 x 960, 1084 x 816 and 937 x 816 Work captures preserve the three
  panels without overlapping controls; narrow result tables scroll inside the
  center panel. Account Identity and Environment Dependencies collapse to the
  available content width.
- A fresh browser session has no console errors or warnings.

## Verification

```bash
npm run typecheck
npx vite build --config vite.prototype.config.ts
npm run build
git diff --check
```

All commands passed. Production runtime was not contacted.

final result: passed

This QA result does not constitute the required user approval for App #305.
