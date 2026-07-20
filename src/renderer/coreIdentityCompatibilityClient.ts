import { fixtureOrDemoPayloadReason } from "./ownerPayloadGuards";
import type { LodeCatalogSkill } from "./lodeCatalogClient";
import { requestOwnerJson } from "./ownerApiClient";

export type IdentityCompatibilityCandidate = {
  identityEnvironmentRef: string;
  status: "compatible" | "requires_setup" | "incompatible" | "unknown_until_runtime";
  reasonCodes: string[];
  recoveryAction:
    | "none"
    | "select_supported_package_version"
    | "repair_package_contract"
    | "refresh_owner_facts"
    | "select_matching_identity"
    | "open_manual_auth"
    | "install_or_select_provider"
    | "connect_identity_environment"
    | "fix_target"
    | "select_matching_resource_requirements"
    | "retry_at_task_submission";
};

export type SkillIdentityCompatibilityState = {
  status: "loading" | "ready" | "unavailable";
  summary: string;
  candidates: IdentityCompatibilityCandidate[];
};

export type CompatibilityRequest = {
  schema_version: "webenvoy.identity-compatibility-preview-request.v0";
  package_ref: string;
  lock_ref: string;
  version: string;
  operation_id: string;
  operation_mode: WebEnvoyLodeCatalogAction["operationMode"];
  target_ref: string;
  target_origin: string;
  resource_requirement_ref: string;
  resource_requirement_profile_id: string;
  identity_environment_refs: string[];
};

const responseFields = [
  "schema_version",
  "package_ref",
  "lock_ref",
  "version",
  "operation_id",
  "operation_mode",
  "target_ref",
  "target_origin",
  "resource_requirement_ref",
  "resource_requirement_profile_id",
  "generated_at",
  "candidates",
  "consumer_boundary",
] as const;
const candidateFields = [
  "identity_environment_ref",
  "status",
  "reason_codes",
  "missing_requirement_categories",
  "fact_freshness",
  "owner_status",
  "freshness",
  "recovery_action",
] as const;
const compatibilityStatuses = new Set(["compatible", "requires_setup", "incompatible", "unknown_until_runtime"]);
const recoveryActions = new Set([
  "none",
  "select_supported_package_version",
  "repair_package_contract",
  "refresh_owner_facts",
  "select_matching_identity",
  "open_manual_auth",
  "install_or_select_provider",
  "connect_identity_environment",
  "fix_target",
  "select_matching_resource_requirements",
  "retry_at_task_submission",
]);
const consumerBoundary =
  "Core returns bounded compatibility reasons and public freshness only; no task, thread, run, session, browser action, credential, cookie, token, profile storage, evidence body, or raw owner response is created or exposed.";

export function loadingSkillIdentityCompatibility(): SkillIdentityCompatibilityState {
  return { status: "loading", summary: "正在检查账号身份兼容性。", candidates: [] };
}

export function unavailableSkillIdentityCompatibility(summary: string): SkillIdentityCompatibilityState {
  return { status: "unavailable", summary, candidates: [] };
}

export async function fetchSkillIdentityCompatibility(
  coreEndpoint: string,
  skill: LodeCatalogSkill,
  identityEnvironmentRefs: string[],
): Promise<SkillIdentityCompatibilityState> {
  const refs = [...new Set(identityEnvironmentRefs.filter((value) => value.length > 0))];
  if (refs.length === 0) {
    return unavailableSkillIdentityCompatibility("没有账号身份可供兼容性检查。");
  }
  const candidates: IdentityCompatibilityCandidate[] = [];
  for (let index = 0; index < refs.length; index += 32) {
    const request = createSkillIdentityCompatibilityRequest(skill, refs.slice(index, index + 32));
    if (request == null) return unavailableSkillIdentityCompatibility("技能缺少兼容性预检查所需的版本化声明。");
    let payload: unknown;
    try {
      payload = await requestOwnerJson(coreEndpoint, "/identity-compatibility-preview", {
        method: "POST",
        body: request,
        timeoutMs: 2500,
      });
    } catch {
      return unavailableSkillIdentityCompatibility("Core 暂时无法检查账号身份兼容性。");
    }
    if (fixtureOrDemoPayloadReason(payload)) {
      return unavailableSkillIdentityCompatibility("Core 返回了不可用于生产的兼容性数据。");
    }
    const batch = parseSkillIdentityCompatibilityResponse(payload, request);
    if (batch == null) return unavailableSkillIdentityCompatibility("Core 未返回可消费的兼容性投影。");
    candidates.push(...batch);
  }
  const usableCount = candidates.filter(isCandidateUsable).length;
  return {
    status: "ready",
    summary: usableCount > 0 ? `找到 ${usableCount} 个可进入任务创建的账号身份。` : "没有兼容的账号身份。",
    candidates,
  };
}

export function isCandidateUsable(candidate: IdentityCompatibilityCandidate | undefined) {
  return candidate?.status === "compatible" || candidate?.status === "unknown_until_runtime";
}

export function createSkillIdentityCompatibilityRequest(skill: LodeCatalogSkill, refs: string[]): CompatibilityRequest | null {
  const action = skill.actions.length === 1 ? skill.actions[0] : undefined;
  const uniqueRefs = [...new Set(refs.filter((value) => value.length > 0))];
  if (
    action == null || skill.lockRef == null || uniqueRefs.length === 0 || uniqueRefs.length > 32 ||
    action.resourceRequirementProfileIds.length !== 1 || action.supportedOrigins.length !== 1
  ) return null;
  const target = publicOrigin(action.supportedOrigins[0]!);
  if (target == null) return null;
  return {
    schema_version: "webenvoy.identity-compatibility-preview-request.v0",
    package_ref: skill.packageRef,
    lock_ref: skill.lockRef,
    version: skill.version,
    operation_id: action.id,
    operation_mode: action.operationMode,
    target_ref: `${target}/`,
    target_origin: target,
    resource_requirement_ref: action.resourceRequirementRef,
    resource_requirement_profile_id: action.resourceRequirementProfileIds[0]!,
    identity_environment_refs: uniqueRefs,
  };
}

export function parseSkillIdentityCompatibilityResponse(
  value: unknown,
  request: CompatibilityRequest,
  now = Date.now(),
): IdentityCompatibilityCandidate[] | null {
  if (!isRecord(value) || !hasOnlyKeys(value, responseFields)) return null;
  if (
    value.schema_version !== "webenvoy.identity-compatibility-preview.v0" ||
    value.package_ref !== request.package_ref || value.lock_ref !== request.lock_ref || value.version !== request.version ||
    value.operation_id !== request.operation_id || value.operation_mode !== request.operation_mode ||
    value.target_ref !== request.target_ref || value.target_origin !== request.target_origin ||
    value.resource_requirement_ref !== request.resource_requirement_ref ||
    value.resource_requirement_profile_id !== request.resource_requirement_profile_id ||
    value.consumer_boundary !== consumerBoundary || !isFreshTimestamp(value.generated_at, now) || !Array.isArray(value.candidates) ||
    value.candidates.length !== request.identity_environment_refs.length
  ) return null;
  const candidates = value.candidates.flatMap(parseCandidate);
  if (candidates.length !== value.candidates.length) return null;
  const expectedRefs = new Set(request.identity_environment_refs);
  if (new Set(candidates.map((candidate) => candidate.identityEnvironmentRef)).size !== candidates.length) return null;
  if (candidates.some((candidate) => !expectedRefs.has(candidate.identityEnvironmentRef))) return null;
  return candidates;
}

function parseCandidate(value: unknown): IdentityCompatibilityCandidate[] {
  if (!isRecord(value) || !hasOnlyKeys(value, candidateFields)) return [];
  const identityEnvironmentRef = boundedString(value.identity_environment_ref, 256);
  const status = boundedString(value.status, 64);
  const reasonCodes = stringArray(value.reason_codes, 4, 128);
  const missingCategories = stringArray(value.missing_requirement_categories, 4, 64);
  const recoveryAction = boundedString(value.recovery_action, 128);
  if (
    identityEnvironmentRef == null || status == null || !compatibilityStatuses.has(status) || reasonCodes == null ||
    missingCategories == null || recoveryAction == null || !recoveryActions.has(recoveryAction) ||
    !validFactFreshness(value.fact_freshness) || !validOwnerStatus(value.owner_status) || !validFreshness(value.freshness) ||
    (isCandidateStatusUsable(status) && !hasUsableOwnerFacts(value.owner_status, value.freshness))
  ) return [];
  return [{
    identityEnvironmentRef,
    status: status as IdentityCompatibilityCandidate["status"],
    reasonCodes,
    recoveryAction: recoveryAction as IdentityCompatibilityCandidate["recoveryAction"],
  }];
}

function isCandidateStatusUsable(status: string) {
  return status === "compatible" || status === "unknown_until_runtime";
}

function hasUsableOwnerFacts(ownerStatus: unknown, freshness: unknown) {
  return isRecord(ownerStatus) && ownerStatus.lode === "available" && ownerStatus.harbor === "available" &&
    isRecord(freshness) && freshness.state === "fresh";
}

function validFactFreshness(value: unknown) {
  return Array.isArray(value) && value.length <= 32 && value.every((item) => isRecord(item) &&
    hasOnlyKeys(item, ["fact_key", "required_freshness", "state"]) &&
    boundedString(item.fact_key, 128) != null && boundedString(item.required_freshness, 64) != null &&
    ["satisfied", "missing", "unknown_until_runtime"].includes(String(item.state)));
}

function validOwnerStatus(value: unknown) {
  const allowed = ["available", "unavailable", "malformed", "stale", "not_checked"];
  return isRecord(value) && hasOnlyKeys(value, ["lode", "harbor"]) &&
    allowed.includes(String(value.lode)) && allowed.includes(String(value.harbor));
}

function validFreshness(value: unknown) {
  if (!isRecord(value) || !["fresh", "stale", "unavailable"].includes(String(value.state))) return false;
  if (!Object.keys(value).every((key) => ["state", "observed_at", "age_ms"].includes(key))) return false;
  return (value.observed_at === undefined || isRfc3339(value.observed_at)) &&
    (value.age_ms === undefined || (Number.isInteger(value.age_ms) && Number(value.age_ms) >= 0));
}

function publicOrigin(value: string) {
  try {
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol) || url.username || url.password || url.origin !== value) return null;
    return url.origin;
  } catch {
    return null;
  }
}

function isRfc3339(value: unknown) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value) &&
    Number.isFinite(Date.parse(value));
}

function isFreshTimestamp(value: unknown, now: number) {
  if (!isRfc3339(value)) return false;
  const timestamp = Date.parse(value as string);
  return timestamp >= now - 5 * 60_000 && timestamp <= now + 60_000;
}

function stringArray(value: unknown, maxItems: number, maxLength: number) {
  if (!Array.isArray(value) || value.length > maxItems) return null;
  const values = value.map((item) => boundedString(item, maxLength));
  return values.some((item) => item == null) ? null : values as string[];
}

function boundedString(value: unknown, maxLength: number) {
  return typeof value === "string" && value.length > 0 && value.length <= maxLength && value.trim() === value &&
    !/[\u0000-\u001f\u007f]/.test(value) ? value : null;
}

function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]) {
  return Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
