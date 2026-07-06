# Evidence Map

| Evidence id | Type | Source locator | Consumes | Binding | Freshness | Consumer boundary | Remediation direction |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EV-001 | behavior_evidence | .loom/specs/APP-234/spec.md | Provider, identity, manual auth, and session scenarios | APP-234 / Harbor identity browser behavior | present | review and merge-ready evidence only | Refresh after provider, identity, manual auth, or session behavior changes. |
| EV-002 | behavior_evidence | src/renderer/harborIdentityClient.ts; src/renderer/harborIdentityProjection.ts; src/renderer/localIdentityEnvironmentStore.ts | APP Harbor client, projection, and safe local identity store | APP-234 / implementation behavior | present | review and merge-ready evidence only | Refresh after client/store/session mapping changes. |
| EV-003 | test_evidence | .loom/progress/APP-234.md | npm run typecheck; npm run smoke; npm run smoke:packaged; git diff --check; loom fact-chain; loom verify | APP-234 / local and packaged smoke validation | present | review and merge-ready evidence only | Rerun after UI/client/store/smoke/carrier changes. |
| EV-004 | behavior_evidence | artifacts/app-234-real-harbor-identity-packaged.png; artifacts/app-234-identity-page-browser.png | Desktop UI shell and identity page rendering evidence | APP-234 / visual implementation evidence | present | review evidence only | Regenerate after CSS/layout changes. |
| EV-005 | fresh_verification_input | .loom/progress/APP-234.md | EV-001 EV-002 EV-003 EV-004 | APP-234 / latest validation summary | present | review and merge-ready evidence only | Refresh progress summary and PR metadata after validation or head SHA changes. |
