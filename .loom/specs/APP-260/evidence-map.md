# Evidence Map

| Evidence id | Type | Source locator | Consumes | Binding | Freshness | Consumer boundary | Remediation direction |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EV-001 | issue_tree_evidence | https://github.com/WebEnvoy/App/issues/256 https://github.com/WebEnvoy/App/issues/260 https://github.com/WebEnvoy/App/issues/261 | App milestone #14 corrective FR and covered Work Items | APP-260 scope | present | planning/readiness evidence only | Re-read before PR metadata or issue closeout. |
| EV-002 | upstream_asset_truth | WebEnvoy/Lode#252 and sibling `/Volumes/2T/dev/WebEnvoy/Lode/registry/local-packages.json` | Lode capability asset registry, not runtime/live evidence | #260 packaging | present | Lode assets only; no runtime server or live site proof | Recheck if Lode registry/package refs change. |
| EV-003 | behavior_evidence | scripts/package-lode-assets.mjs package.json | build-time asset packaging | #260 | present | copies JSON assets only; does not execute Lode | Rerun build/smoke after package script changes. |
| EV-004 | behavior_evidence | src/electron/lodeAssetBundle.ts src/electron/runtimeSupervisor.ts | asset validation and Core env handoff | #260 | present | App passes refs/paths to Core; Core remains owner of task truth | Rerun typecheck/smoke after runtime changes. |
| EV-005 | test_evidence | scripts/smoke.mjs scripts/smoke-packaged.mjs | packaged assets and fail-closed runtime gate | #260/#261 | present | local smoke only; no live external site/account/profile | Rerun before PR creation. |
| EV-006 | test_evidence | scripts/smoke-packaged-vertical.mjs artifacts/app-261-packaged-vertical-smoke.png | App -> local owner-shaped Core/Harbor health/admission -> packaged Lode assets -> ready runtime gate | #261 | present | temporary local smoke servers only; no production page, account, Cookie, submit/publish/send | Rerun before PR creation or after smoke changes. |
| EV-007 | fresh_verification_input | .loom/progress/APP-260.md | EV-003 EV-004 EV-005 EV-006 | APP-260 latest validation | present | local branch readiness only | Refresh after any diff or head change. |
