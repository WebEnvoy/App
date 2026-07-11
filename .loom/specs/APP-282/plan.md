# APP-282 Plan

1. Extract owner API timeout classification beside existing protected-route classification.
2. Apply it in Electron main without changing authorization or payload handling.
3. Cover Core task, Harbor session open/control, and ordinary GET timeout classes in smoke.
4. Run typecheck, full App smoke, suite validation, review, hosted gate, merge, then packaged first-launch E2E.
