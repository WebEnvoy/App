import { fixtureOrDemoPayloadReason } from "./ownerPayloadGuards";
import { type HarborRuntimeSession, isRecord } from "./harborIdentityTypes";

const runtimeFixtureMarker = /(^|[\s:._/-])(demo|fixture|smoke)([\s:._/-]|$)/i;

export function isHarborRuntimeSessionFacts(value: unknown): value is Exclude<HarborRuntimeSession, { status: "unavailable" }> {
  if (!isRecord(value) || fixtureOrDemoPayloadReason(value)) return false;
  const page = recordValue(value.current_page);
  const lock = recordValue(value.control_lock);
  return value.schema_version === "harbor-runtime-facts/v0" &&
    publicReference(value.runtime_session_ref) &&
    publicReference(value.identity_environment_ref) &&
    publicReference(value.profile_ref) &&
    publicReference(value.provider_ref) &&
    value.provider_mode === "local_dedicated_profile" &&
    lifecycleState(value.lifecycle_state) &&
    publicTimestamp(value.created_at) &&
    publicTimestamp(value.last_seen_at) &&
    isAvailability(value.availability) &&
    isCurrentPage(page) &&
    controlOwner(value.control_owner) &&
    isControlLock(lock) &&
    runtimeErrorOrNull(value.current_error) &&
    isRuntimeFacts(value.facts) &&
    (value.viewer_ref === undefined || publicReference(value.viewer_ref));
}

export function isHarborSessionMissingAfterRestart(value: unknown) {
  if (!isRecord(value) || fixtureOrDemoPayloadReason(value)) return false;
  return value.status === "unavailable" &&
    value.failure_class === "session_missing" &&
    publicMessage(value.message) &&
    value.retryable === true &&
    isRuntimeError(value.current_error) &&
    value.current_error.code === "session_lost" &&
    value.current_error.retryable === true;
}

function isAvailability(value: unknown) {
  if (!isRecord(value)) return false;
  return availabilityState(value.cdp) && availabilityState(value.viewer) &&
    availabilityState(value.snapshot) && availabilityState(value.evidence);
}

function isCurrentPage(value: Record<string, unknown> | null) {
  return value != null && publicMessage(value.requested_url) &&
    nullablePublicMessage(value.current_url) && nullablePublicMessage(value.title) && !fixtureMarker(value.title) &&
    (value.status === "ready" || value.status === "unavailable" || value.status === "unknown") &&
    runtimeErrorOrNull(value.error_reason) && publicTimestamp(value.observed_at);
}

function isControlLock(value: Record<string, unknown> | null) {
  return value != null && controlOwner(value.owner) &&
    (value.state === "held" || value.state === "released" || value.state === "closed") &&
    nullablePublicMessage(value.holder_ref) && publicTimestamp(value.updated_at) && runtimeErrorOrNull(value.conflict_error);
}

function runtimeErrorOrNull(value: unknown) {
  return value === null || isRuntimeError(value);
}

function isRuntimeError(value: unknown): value is Record<string, unknown> {
  return isRecord(value) && publicMessage(value.code) && publicMessage(value.message) && typeof value.retryable === "boolean";
}

function isRuntimeFacts(value: unknown) {
  return Array.isArray(value) && value.every((fact) => {
    if (!isRecord(fact)) return false;
    return publicMessage(fact.key) && publicMessage(fact.value) && !fixtureMarker(fact.value) &&
      (fact.source === "configured" || fact.source === "observed" || fact.source === "provider_claim" || fact.source === "validation_evidence") &&
      (fact.evidence_ref === undefined || publicReference(fact.evidence_ref));
  });
}

function lifecycleState(value: unknown) {
  return value === "starting" || value === "active" || value === "idle" || value === "locked" ||
    value === "disconnected" || value === "expired" || value === "failed" || value === "closed";
}

function controlOwner(value: unknown) {
  return value === "system" || value === "user" || value === "agent" || value === "core_task" ||
    value === "app" || value === "provider" || value === "none" || value === "unknown";
}

function availabilityState(value: unknown) {
  return value === "available" || value === "unavailable" || value === "policy_denied" || value === "unsupported";
}

function publicReference(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 512;
}

function publicMessage(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 2048;
}

function nullablePublicMessage(value: unknown) {
  return value === null || publicMessage(value);
}

function publicTimestamp(value: unknown) {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function fixtureMarker(value: unknown) {
  return typeof value === "string" && runtimeFixtureMarker.test(value);
}

function recordValue(value: unknown) {
  return isRecord(value) ? value : null;
}
