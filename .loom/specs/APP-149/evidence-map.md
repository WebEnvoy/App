# Evidence Map

| Evidence id | Type | Source locator | Consumes | Binding | Freshness | Consumer boundary | Remediation direction |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EV-001 | story_evidence | .loom/stories/APP-FR133-135-stage5-test-failure-repair-evidence.md | S1 S2 S3 S4 S5 S6 / Story Readiness / Story Business Confirmation | APP-149 / App #133-#135 readiness | present | later App/Core/Harbor/Lode specs and review evidence only | Refresh if issue scope, Stage 5 boundary, or owner truth changes. |
| EV-002 | carrier_evidence | .loom/specs/APP-149/spec.md | acceptance criteria and validation mapping | APP-149 / minimal suite carrier | present | review and merge-ready evidence only | Refresh after story, spec, plan, or carrier edits. |
| EV-003 | test_evidence | .loom/progress/APP-149.md | git diff check and Loom checks | APP-149 / local validation | pending | review and merge-ready evidence only | Rerun local validation after story or carrier edits. |
