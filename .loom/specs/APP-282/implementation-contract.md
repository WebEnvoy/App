# APP-282 Implementation Contract

## Ownership

- `src/electron/ownerApiRequest.ts` owns owner API route timeout classification.
- `src/electron/main.ts` consumes that classification for the existing abort controller.
- `scripts/smoke.mjs` owns exact regression assertions.

## Invariants

- Authorization and supervisor-token attachment remain unchanged.
- Response parsing and fail-closed behavior remain unchanged.
- A timeout never creates or synthesizes a session, viewer, run, result, or evidence ref.
- No Harbor/Core/Lode contract or site action changes in this Work Item.

## Verification

Typecheck and full App smoke must pass at the reviewed product head. Packaged first-launch Computer Use evidence is required after merge before issue closeout.
