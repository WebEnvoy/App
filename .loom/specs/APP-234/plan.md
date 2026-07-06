# Plan

## Implementation Goal

Deliver the App-side real Harbor identity/browser batch for #233 with #234 as anchor and #235/#236/#237 covered in one PR.

## Phases

### Phase 1

- Objective: Add the minimal App Harbor client and projection layer.
- Deliverable: provider catalog, identity facts, and runtime session mapping from Harbor-shaped JSON.
- Exit condition: App can render live Harbor facts when endpoint JSON is available and labels offline fallback when unavailable.

### Phase 2

- Objective: Add safe local identity environment create/import/select/delete.
- Deliverable: localStorage store for allowed config/refs only plus sensitive import rejection.
- Exit condition: smoke proves safe drafts are saved and sensitive keys are rejected.

### Phase 3

- Objective: Wire Browser/账号身份 UI actions.
- Deliverable: start/takeover/release/stop Harbor session intents, manual authentication refresh entry, and #238/#243 non-goal copy.
- Exit condition: typecheck, smoke, packaged smoke, browser visual check, git diff check, and Loom checks pass.

## Constraints

- Do not modify Harbor/Core/Lode.
- Do not save password, cookie, token, raw profile, raw storage, raw CDP/VNC endpoint, raw evidence, DOM, HAR, trace, video, network body, or downloaded file material.
- Do not perform real login, submit, publish, apply, greet, message send, CAPTCHA/risk-control bypass, or external account action.

## Validation

- Automated checks: npm run typecheck; npm run smoke; WEBENVOY_PACKAGED_SMOKE_SCREENSHOT=artifacts/app-234-real-harbor-identity-packaged.png npm run smoke:packaged; git diff --check
- Browser evidence: artifacts/app-234-identity-page-browser.png from http://127.0.0.1:5174/
- Loom checks: loom fact-chain --target . --json; loom verify --target . --json; suite/carrier checks if available for APP-234
