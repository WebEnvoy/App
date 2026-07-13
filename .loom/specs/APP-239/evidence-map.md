# APP-239 Evidence Map

| Evidence ID | Type | Source Locator | Binding | Freshness | Consumer Boundary | Remediation |
| --- | --- | --- | --- | --- | --- | --- |
| EV-001 | issue_tree | https://github.com/WebEnvoy/App/issues/239; https://github.com/WebEnvoy/App/issues/241 | APP-239/#241 scope | present | planning only | Re-read after issue change. |
| EV-002 | upstream_contract | https://github.com/WebEnvoy/WebEnvoy/pull/283 | Core opaque detail target and detail task contract | merged `795059d6` | Core behavior only | Stop if owner contract changes. |
| EV-003 | behavior | `src/renderer/coreReadTaskClient.ts`; `src/renderer/coreTaskSubmitClient.ts`; `src/renderer/App.tsx`; `src/renderer/TaskThreadPage.tsx` | APP-239 implementation | product head `9412b7f` | App behavior only | Refresh after implementation changes. |
| EV-004 | test | `scripts/smoke.mjs`; packaged smoke scripts | positive/fail-closed target, submit, resume, result and packaged runtime paths | 2026-07-12T14:29Z | local/packaged test only | Refresh after validation/head changes. |
| EV-005 | live_runtime | merged packaged App Computer Use run refs | #239/#241 closeout | missing | XHS read-only only | Required before issue closeout. |
