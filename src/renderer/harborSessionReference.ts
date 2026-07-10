export function rememberHarborRuntimeSessionReference(
  harborEndpoint: string,
  identityEnvironmentRef: string,
  runtimeSessionRef: string,
) {
  if (!isPublicReference(identityEnvironmentRef) || !isPublicReference(runtimeSessionRef)) return;

  try {
    window.localStorage.setItem(
      harborSessionStorageKey(harborEndpoint, identityEnvironmentRef),
      runtimeSessionRef,
    );
  } catch {
    // Storage is an optional display cache. Harbor remains the source of session truth.
  }
}

export function forgetHarborRuntimeSessionReference(
  harborEndpoint: string,
  identityEnvironmentRef: string,
) {
  if (!isPublicReference(identityEnvironmentRef)) return;

  try {
    window.localStorage.removeItem(harborSessionStorageKey(harborEndpoint, identityEnvironmentRef));
  } catch {
    // Storage is an optional display cache. Harbor remains the source of session truth.
  }
}

export function storedHarborRuntimeSessionReference(
  harborEndpoint: string,
  identityEnvironmentRef: string,
) {
  try {
    const value = window.localStorage.getItem(harborSessionStorageKey(harborEndpoint, identityEnvironmentRef));
    return isPublicReference(value) ? value : null;
  } catch {
    return null;
  }
}

function harborSessionStorageKey(harborEndpoint: string, identityEnvironmentRef: string) {
  return `webenvoy.harbor.runtime-session-ref.v1:${normalizeEndpoint(harborEndpoint)}:${identityEnvironmentRef}`;
}

function normalizeEndpoint(value: string) {
  return value.trim().replace(/\/+$/, "");
}

function isPublicReference(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 512;
}
