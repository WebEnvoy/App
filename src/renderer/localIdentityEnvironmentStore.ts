import {
  type HarborIdentityFacts,
  type LocalIdentityEnvironmentDraft,
  type LoginState,
  type ManualAuthState,
  type SiteId,
  isHarborIdentityFacts,
  isRecord,
} from "./harborIdentityTypes";

export const localIdentityEnvironmentStorageKey = "webenvoy.localIdentityEnvironments.v1";
export const localIdentitySelectionStorageKey = "webenvoy.selectedIdentityEnvironment.v1";

export function loadLocalIdentityEnvironmentDrafts(): LocalIdentityEnvironmentDraft[] {
  const stored = window.localStorage.getItem(localIdentityEnvironmentStorageKey);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.flatMap((item) => (isDraft(item) ? [item] : [])) : [];
  } catch {
    return [];
  }
}

export function saveLocalIdentityEnvironmentDrafts(drafts: LocalIdentityEnvironmentDraft[]) {
  window.localStorage.setItem(localIdentityEnvironmentStorageKey, JSON.stringify(drafts));
}

export function upsertLocalIdentityEnvironmentDraft(draft: LocalIdentityEnvironmentDraft) {
  const drafts = loadLocalIdentityEnvironmentDrafts();
  saveLocalIdentityEnvironmentDrafts([draft, ...drafts.filter((item) => item.id !== draft.id)]);
}

export function removeLocalIdentityEnvironmentDraft(id: string) {
  saveLocalIdentityEnvironmentDrafts(loadLocalIdentityEnvironmentDrafts().filter((draft) => draft.id !== id));
}

export function createLocalIdentityEnvironmentDraft(
  input: Record<string, FormDataEntryValue | string>,
): LocalIdentityEnvironmentDraft {
  const siteId: SiteId = input.siteId === "boss" ? "boss" : "xiaohongshu";
  const accountLabel = text(input.accountLabel) || (siteId === "boss" ? "招聘号" : "运营号");
  const identityRef = text(input.identityEnvironmentRef) || `identity-env_app-${siteId}-${slug(accountLabel)}`;
  return {
    id: identityRef,
    name: text(input.name) || `${siteLabel(siteId)} ${accountLabel}`,
    siteId,
    accountLabel,
    identityEnvironmentRef: identityRef,
    executionIdentityRef: text(input.executionIdentityRef) || `${identityRef}:execution`,
    profileRef: text(input.profileRef) || `${identityRef}:profile`,
    requestedProviderId: input.requestedProviderId === "chrome_official" ? "chrome_official" : "cloakbrowser",
    loginState: loginState(input.loginState),
    manualAuthenticationState: manualAuthState(input.manualAuthenticationState),
    profileStorageRef: text(input.profileStorageRef) || `${identityRef}:profile-storage-ref`,
    credentialRef: text(input.credentialRef),
    proxyRef: text(input.proxyRef),
    proxyLabel: text(input.proxyLabel),
    region: text(input.region) || "未知",
    language: text(input.language) || "zh-CN",
    timezone: text(input.timezone) || "Asia/Shanghai",
    userAgentSummary: text(input.userAgentSummary) || "Chrome family / desktop",
    viewport: text(input.viewport) || "系统默认",
    fingerprintSummary: text(input.fingerprintSummary) || "not_configured",
  };
}

export function parseImportedIdentityEnvironment(
  json: string,
): { ok: true; draft: LocalIdentityEnvironmentDraft } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: "导入内容必须是 JSON。" };
  }
  const sensitivePath = findSensitiveMaterial(parsed);
  if (sensitivePath) return { ok: false, error: `导入内容包含禁止保存的敏感字段：${sensitivePath}` };
  if (isHarborIdentityFacts(parsed)) return { ok: true, draft: draftFromHarborFacts(parsed) };
  if (!isRecord(parsed)) return { ok: false, error: "导入内容必须是身份环境对象。" };
  return { ok: true, draft: createLocalIdentityEnvironmentDraft(parsed as Record<string, string>) };
}

function draftFromHarborFacts(facts: HarborIdentityFacts): LocalIdentityEnvironmentDraft {
  return createLocalIdentityEnvironmentDraft({
    name: `${facts.site_binding.display_name} ${facts.site_binding.account_label ?? "本地身份"}`,
    siteId: normalizeSiteId(facts.site_binding.site_id),
    accountLabel: facts.site_binding.account_label ?? "",
    identityEnvironmentRef: facts.identity_environment_ref,
    executionIdentityRef: facts.execution_identity_ref,
    profileRef: facts.profile_ref,
    requestedProviderId: facts.provider_binding.selected_provider_id ?? "cloakbrowser",
    loginState: facts.login_state.state,
    manualAuthenticationState: facts.login_state.manual_authentication_state,
    profileStorageRef: facts.browser_storage.profile_storage_ref,
    credentialRef: facts.credential_recovery.credential_ref ?? "",
    proxyRef: facts.environment.proxy.proxy_ref ?? "",
    proxyLabel: facts.environment.proxy.label ?? "",
    region: facts.environment.region ?? "",
    language: facts.environment.language ?? "",
    timezone: facts.environment.timezone ?? "",
    userAgentSummary: facts.environment.user_agent_summary ?? "",
    viewport: facts.environment.viewport ?? "",
    fingerprintSummary: facts.environment.fingerprint_summary,
  });
}

function findSensitiveMaterial(value: unknown, path = "root"): string | null {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const found = findSensitiveMaterial(value[index], `${path}[${index}]`);
      if (found) return found;
    }
    return null;
  }
  if (!isRecord(value)) return null;
  for (const [key, nested] of Object.entries(value)) {
    if (isSensitiveKey(key)) return `${path}.${key}`;
    const found = findSensitiveMaterial(nested, `${path}.${key}`);
    if (found) return found;
  }
  return null;
}

function isSensitiveKey(key: string) {
  const normalized = key.toLowerCase();
  const allowedPublicStateKeys = new Set([
    "cookies_session_state",
    "lifecycle_state",
    "login_state",
    "manual_authentication_state",
    "storage_state",
  ]);
  if (allowedPublicStateKeys.has(normalized)) return false;
  if (normalized.endsWith("_ref")) return false;
  return /(password|cookie|token|verification_code|raw_|storage_value|profile_storage|cdp_endpoint|vnc_endpoint|authorization|bearer|secret)/i.test(normalized);
}

function isDraft(value: unknown): value is LocalIdentityEnvironmentDraft {
  return isRecord(value) && typeof value.id === "string" && (value.siteId === "xiaohongshu" || value.siteId === "boss");
}

function normalizeSiteId(value: string): SiteId {
  return value === "boss" || value === "zhipin" ? "boss" : "xiaohongshu";
}

function siteLabel(siteId: SiteId): "小红书" | "BOSS" {
  return siteId === "boss" ? "BOSS" : "小红书";
}

function loginState(value: unknown): LoginState {
  return value === "logged_in" || value === "logged_out" || value === "expired" || value === "manual_auth_required" ? value : "unknown";
}

function manualAuthState(value: unknown): ManualAuthState {
  return value === "not_required" || value === "in_progress" || value === "completed" || value === "failed" ? value : "required";
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-").replace(/^-|-$/g, "") || "local";
}
