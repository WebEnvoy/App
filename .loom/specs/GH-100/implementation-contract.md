# Implementation Contract

## Work Item

- Item: GH-100
- Issue: https://github.com/WebEnvoy/App/issues/100
- Branch: work/GH-100-vite-electron-react-ts-skeleton
- PR: https://github.com/WebEnvoy/App/pull/126

## Implementation Scope

GH-100 creates only the minimum runnable desktop shell skeleton:

- root npm package and lockfile;
- Electron main/preload entrypoints;
- Vite React renderer entrypoint;
- TypeScript configuration for renderer and Electron code;
- smoke script that verifies built shell artifacts;
- local start path for the Electron shell.

## Required Boundaries

- Electron main may own window lifecycle, app lifecycle, native theme readback, and the local shell context IPC handler.
- Electron preload may expose only a narrow shell-context bridge to the renderer.
- Renderer may show only a skeleton surface proving the shell loads and documenting future Task Thread ownership.
- No layer may define or persist task/run/result/evidence/capability/recovery/session/package truth.
- No credential, cookie, token, browser profile storage, raw evidence, Core Run Record truth, Harbor runtime/session truth, or Lode package truth may be stored.

## Explicit Non-Goals

- Do not implement #101 Radix UI or lucide-react primitives.
- Do not implement #102 Core / Harbor / Lode source health fixture.
- Do not implement #103 Settings local connection configuration.
- Do not implement #104 Task Thread first navigation and layout.
- Do not implement real task submission, run/result views, evidence rendering, Browser management, Library management, signing, packaging, or auto-update.

## Validation Contract

- `git diff --check`
- `npm audit --audit-level=high`
- `npm run typecheck`
- `npm run smoke`
- short `npm run start` launch
- `loom doctor --target . --json`
- `loom verify --target . --json`
- `loom fact-chain --target . --json`

## Consumer Boundary

#101/#102/#103/#104 may consume this PR only as the runnable shell foundation. They must not treat this skeleton as completing Task Thread layout, source health, Settings, or any business runtime behavior.
