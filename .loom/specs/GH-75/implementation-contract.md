# Implementation Contract

## Host Binding

- Repository: WebEnvoy/App
- Primary Work Item: GH-75
- Branch: work/tech-baseline-app
- Worktree: `/Volumes/2T/dev/WebEnvoy/App.worktrees/tech-baseline-app`
- Parent FRs: #74, #79
- Covered Work Items: #75, #76, #77, #78, #80, #81, #82, #83

## Allowed Writes

- `docs/adr/0007-desktop-app-technical-baseline.md`
- `docs/contracts/README.md`
- `docs/README.md`
- `README.md`
- `AGENTS.md`
- `.loom/status/current.md`
- `.loom/bootstrap/init-result.json` fact-chain entry points only
- `.loom/work-items/GH-75.md`
- `.loom/progress/GH-75.md`
- `.loom/specs/GH-75/*`

## Forbidden Writes

- Code, package manifests, lockfiles, generated files, dependencies, schemas, fixtures, runtime/client implementation, workflows, Core/Harbor/Lode/research/sources files, PR merge state, and issue closeout.
- Shared Loom carriers beyond `.loom/status/current.md` and `.loom/bootstrap/init-result.json` fact-chain entry points unless a gate requires a minimal metadata sync and the drift is classified first.

## Acceptance

- ADR 0007 contains Desktop App first, default UI stack, dev/prod shell boundary, UI design checkpoint, desktop IA, client/connection state rules, local state/cache no-store boundary, research absorption table, covered issues, and non-goals.
- AGENTS contains future implementation constraints for stack, dependencies, testing, change scope, and sensitive data.
- PR metadata uses Refs and binds to GH-75 while explaining coverage for #74-#83.
