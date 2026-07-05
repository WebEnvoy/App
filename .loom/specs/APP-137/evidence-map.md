# Evidence Map

| Evidence id | Type | Source locator | Consumes | Binding | Freshness | Consumer boundary | Remediation direction |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EV-001 | behavior_evidence | .loom/specs/APP-137/spec.md | Scenario 1 Scenario 2 Scenario 3 Scenario 4 / acceptance criteria | APP-137 / Library read capability fixture behavior | present | review and merge-ready evidence only | Refresh after Library catalog, install/lock/update, task launch, or source health behavior changes. |
| EV-002 | test_evidence | .loom/progress/APP-137.md | npm run smoke, packaged smoke, git diff check, Loom suite/fact-chain/verify checks | APP-137 / local and packaged smoke validation | present | review and merge-ready evidence only | Rerun local validation after fixture, UI, smoke, or carrier edits. |
| EV-003 | fresh_verification_input | .loom/progress/APP-137.md | EV-001 EV-002 | APP-137 / latest validation summary | present | review and merge-ready evidence only | Refresh progress summary and PR metadata after validation or head SHA changes. |
