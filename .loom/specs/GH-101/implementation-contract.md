# Implementation Contract

## Work Item

- Item: GH-101
- Branch: work/GH-101-shell-batch
- Parent FR: https://github.com/WebEnvoy/App/issues/93
- Covered Work Items: #101, #102, #103, #104

## Implementation Scope

GH-101 is the #93 shell batch implementation:

- install and use `@radix-ui/react-tabs` and `lucide-react`;
- replace the GH-100 placeholder renderer with a Task Thread first shell;
- add Core/Harbor/Lode source health fixture data;
- add local endpoint choice settings backed by renderer-local storage;
- extend smoke validation for Task Thread, source health, Settings boundary, and direct session text;
- sync App docs and selected GitHub issue bodies for direct session, Core task path, and Lode capability package metadata semantics.

## Required Boundaries

- Electron main owns window lifecycle, native theme readback, and local shell context IPC only.
- Electron preload exposes only the shell context bridge.
- Renderer may own navigation, local UI state, fixture display, source health projection, and endpoint choice storage.
- Source health and direct Identity Runtime Session state must not be displayed as task outcome.
- Settings may persist endpoint choices only; credentials, cookies, tokens, profile paths, raw evidence, package truth, run truth, and session truth are forbidden.

## Explicit Non-Goals

- No #105-#113 implementation.
- No real Core/Harbor/Lode API calls.
- No task submission, Core run lifecycle, result envelope, failure rendering, evidence rendering, Browser management, Library management, workflow runtime/editor UI, signing, packaging, or auto-update.

## Validation Contract

- `npm run typecheck`
- `npm run smoke`
- `npm audit --audit-level=high`
- `git diff --check`
- `loom fact-chain --target . --json`
- `loom doctor --target . --json`
- `loom verify --target . --json`

## Consumer Boundary

#105-#113 may consume GH-101 as the shell frame and local fixture/config foundation only. They must not treat GH-101 as proof of real task submission, result/evidence/failure display, Lode workflow package execution, Harbor runtime control, or owner API integration.
