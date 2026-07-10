import { projectHarborIdentity, projectHarborSession, projectLocalDraft } from "./harborIdentityProjection";
import { fixtureOrDemoPayloadReason } from "./ownerPayloadGuards";
import {
  type HarborIdentityFacts,
  type HarborIdentityLoadState,
  type HarborProviderCatalog,
  type HarborRuntimeSession,
  type LocalIdentityEnvironmentDraft,
  type SiteId,
  isHarborIdentityFacts,
  isProviderCatalog,
  isRecord,
} from "./harborIdentityTypes";
import type { BrowserSessionProjection, BrowserTargetProjection, IdentityEnvironmentProjection } from "./identityEnvironmentFixtures";

export async function fetchHarborIdentityState(
  harborEndpoint: string,
  localDrafts: LocalIdentityEnvironmentDraft[],
): Promise<HarborIdentityLoadState> {
  const fetchedAt = new Date().toISOString();
  const [catalogResult, identityResult] = await Promise.all([
    fetchFirstJson<HarborProviderCatalog>(harborEndpoint, [
      "/runtime/browser-providers",
      "/runtime/browser-provider-status",
      "/browser-providers",
    ]),
    fetchFirstJson<unknown>(harborEndpoint, [
      "/runtime/identity-environments",
      "/identity-environments",
      "/runtime/local-identity-environments",
    ]),
  ]);
  const catalog = catalogResult.ok && isProviderCatalog(catalogResult.value) && !fixtureOrDemoPayloadReason(catalogResult.value) ? catalogResult.value : null;
  const liveIdentities = identityResult.ok && !fixtureOrDemoPayloadReason(identityResult.value)
    ? parseIdentityList(identityResult.value, catalog).map((item) => projectHarborIdentity(item, catalog, fetchedAt))
    : [];
  const localIdentities = localDrafts.map((draft) => projectLocalDraft(draft, catalog, fetchedAt));
  const identities = [...liveIdentities, ...localIdentities];

  if (catalog || liveIdentities.length > 0) {
    return {
      status: "ready",
      fetchedAt,
      summary: catalog ? "已读取 Harbor provider/identity public facts。" : "已读取 Harbor identity public facts；provider endpoint 未返回。",
      identities,
    };
  }

  return {
    status: "offline",
    fetchedAt,
    summary: `Harbor endpoint 未返回可消费的 provider/identity JSON；本页保留 App 本地允许配置和离线 fixture。${catalogResult.error ? ` ${catalogResult.error}` : ""}`,
    identities,
  };
}

export async function openHarborIdentitySession(
  harborEndpoint: string,
  identity: IdentityEnvironmentProjection,
  target: BrowserTargetProjection,
) {
  if (identity.source !== "Harbor live") {
    return {
      status: "unavailable" as const,
      message: "只有 Harbor live identity environment 可以启动真实身份浏览器；App local/fixture identity 必须先注册并由 Harbor 回读。",
      retryable: true,
    };
  }
  return postHarborSession(harborEndpoint, [
    "/runtime/identity-environment-sessions",
    "/runtime/sessions/identity-environment",
    "/identity-environment-sessions",
  ], {
    identity_environment_ref: identity.identityEnvironmentRef,
    url: target.defaultUrl,
    headless: false,
    control_owner: "user",
    holder_ref: "app-browser-page",
    reuse_existing: true,
  });
}

export async function createHarborIdentityEnvironment(harborEndpoint: string, draft: LocalIdentityEnvironmentDraft) {
  const result = await postFirstJson<unknown>(
    harborEndpoint,
    ["/runtime/identity-environments", "/identity-environments"],
    identityInputFromDraft(draft),
    "Harbor endpoint 未接受 identity environment 创建请求。",
  );
  if (!result.ok) return result;
  const createdRef = identityEnvironmentRefFromCreateResponse(result.value);
  return createdRef === draft.identityEnvironmentRef
    ? { ok: true as const }
    : { ok: false as const, error: "Harbor 创建响应未回传匹配的 identity_environment_ref；保持 App local-only 草稿。" };
}

export async function lockHarborSession(harborEndpoint: string, sessionRef: string) {
  return postHarborSession(harborEndpoint, sessionPaths(sessionRef, "lock"), {
    control_owner: "user",
    holder_ref: "app-browser-page",
  });
}

export async function releaseHarborSession(harborEndpoint: string, sessionRef: string) {
  return postHarborSession(harborEndpoint, sessionPaths(sessionRef, "release"), { control_owner: "user" });
}

export async function stopHarborSession(harborEndpoint: string, sessionRef: string) {
  return postHarborSession(harborEndpoint, sessionPaths(sessionRef, "stop"), { control_owner: "user" });
}

export { projectHarborSession };

async function postHarborSession(harborEndpoint: string, paths: string[], body: unknown): Promise<HarborRuntimeSession> {
  const result = await postFirstJson<HarborRuntimeSession>(harborEndpoint, paths, body);
  return result.ok ? result.value : { status: "unavailable", message: result.error, retryable: true };
}

async function fetchFirstJson<T>(base: string, paths: string[]) {
  for (const path of paths) {
    const result = await requestJson<T>(base, path, { method: "GET" });
    if (result.ok) return result;
  }
  return { ok: false as const, error: `无法读取 ${base}` };
}

async function postFirstJson<T>(
  base: string,
  paths: string[],
  body: unknown,
  fallbackError = "Harbor endpoint 未接受会话请求。",
) {
  for (const path of paths) {
    const result = await requestJson<T>(base, path, {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (result.ok) return result;
  }
  return { ok: false as const, error: fallbackError };
}

async function requestJson<T>(base: string, path: string, init: RequestInit) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch(`${base}${path}`, {
      ...init,
      credentials: "omit",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) return { ok: false as const, error: `${path} returned ${response.status}` };
    return { ok: true as const, value: (await response.json()) as T };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : String(error) };
  } finally {
    window.clearTimeout(timeout);
  }
}

function parseIdentityList(value: unknown, catalog: HarborProviderCatalog | null): HarborIdentityFacts[] {
  const items = Array.isArray(value)
    ? value
    : isRecord(value) && Array.isArray(value.identity_environments)
      ? value.identity_environments
      : isRecord(value) && Array.isArray(value.items)
        ? value.items
        : [];
  return items.flatMap((item) => {
    if (isHarborIdentityFacts(item)) return [item];
    const publicFacts = identityFactsFromPublicRecord(item, catalog);
    return publicFacts ? [publicFacts] : [];
  });
}

function identityInputFromDraft(draft: LocalIdentityEnvironmentDraft) {
  return {
    identity_environment_ref: draft.identityEnvironmentRef,
    execution_identity_ref: draft.executionIdentityRef,
    profile_ref: draft.profileRef,
    profile_storage_ref: draft.profileStorageRef,
    site: {
      site_id: draft.siteId,
      origin: siteOrigin(draft.siteId),
      display_name: draft.siteId === "boss" ? "BOSS" : "小红书",
      account_identifier: draft.accountLabel,
    },
    login_state: draft.loginState,
    storage_state: draft.profileStorageRef ? "present" : "unknown",
    credential_ref: draft.credentialRef || undefined,
    proxy_ref: draft.proxyRef || undefined,
    proxy_label: draft.proxyLabel,
    region: draft.region,
    language: draft.language,
    timezone: draft.timezone,
    browser_family: draft.requestedProviderId,
    requested_provider_id: draft.requestedProviderId,
    user_agent_summary: draft.userAgentSummary,
    viewport: draft.viewport,
    fingerprint_summary: draft.fingerprintSummary,
    login_method: "manual",
    manual_authentication_state: draft.manualAuthenticationState,
    human_verification: draft.manualAuthenticationState === "not_required" ? [] : ["manual_login"],
  };
}

function identityEnvironmentRefFromCreateResponse(value: unknown): string | undefined {
  const record = recordValue(value);
  const nested = recordValue(record?.identity_environment);
  return stringValue(record?.identity_environment_ref) ?? stringValue(nested?.identity_environment_ref);
}

function siteOrigin(siteId: SiteId) {
  return siteId === "boss" ? "https://www.zhipin.com" : "https://www.xiaohongshu.com";
}

function sessionPaths(sessionRef: string, action: "lock" | "release" | "stop") {
  const encoded = encodeURIComponent(sessionRef);
  return [`/runtime/sessions/${encoded}/${action}`, `/sessions/${encoded}/${action}`];
}

function identityFactsFromPublicRecord(value: unknown, catalog: HarborProviderCatalog | null): HarborIdentityFacts | null {
  if (!isRecord(value) || value.schema_version !== "harbor-local-identity-environment-store/v0") return null;
  const site = recordValue(value.site);
  const status = recordValue(value.status);
  const refs = recordValue(value.refs);
  const environment = recordValue(value.environment_summary);
  const identityEnvironmentRef = stringValue(value.identity_environment_ref);
  const executionIdentityRef = stringValue(refs?.execution_identity_ref);
  const profileRef = stringValue(refs?.profile_ref);
  const siteId = stringValue(site?.site_id);
  const origin = stringValue(site?.origin);
  const displayName = stringValue(site?.display_name) ?? siteId;
  const providerId = providerIdValue(environment?.provider_id);

  if (!identityEnvironmentRef || !executionIdentityRef || !profileRef || !siteId || !origin || !displayName) return null;

  const loginState = loginStateValue(status?.login_state);
  const storageState = storageStateValue(status?.browser_storage_state);
  const manualAuthenticationState = manualAuthStateValue(status?.manual_authentication_state);
  const blockingReasons = arrayStrings(status?.blocking_reasons);
  const selectedProvider = providerId ? catalog?.providers.find((provider) => provider.provider_id === providerId) ?? null : null;

  return {
    schema_version: "harbor-local-identity-environment/v0",
    identity_environment_ref: identityEnvironmentRef,
    execution_identity_ref: executionIdentityRef,
    profile_ref: profileRef,
    site_binding: {
      site_id: siteId,
      origin,
      display_name: displayName,
      account_label: stringValue(site?.account_ref) ?? identityEnvironmentRef,
    },
    login_state: {
      state: loginState,
      reason: blockingReasons.join("；") || null,
      recovery_required: status?.recovery_required === true,
      manual_authentication_state: manualAuthenticationState,
      human_verification: status?.recovery_required === true ? ["manual_login"] : [],
    },
    browser_storage: {
      profile_storage_ref: stringValue(refs?.profile_storage_ref) ?? `${profileRef}:storage`,
      state: storageState,
      cookies_session_state: storageState,
    },
    environment: {
      proxy: {
        state: proxyStateValue(environment?.proxy_state),
        proxy_ref: stringValue(refs?.proxy_ref) ?? null,
        label: stringValue(refs?.proxy_ref) ? "Harbor redacted proxy ref" : null,
      },
      region: stringValue(environment?.region) ?? null,
      language: stringValue(environment?.language) ?? null,
      timezone: stringValue(environment?.timezone) ?? null,
      browser_family: stringValue(environment?.browser_family) ?? providerId ?? "unknown",
      user_agent_summary: null,
      viewport: null,
      fingerprint_summary: stringValue(environment?.fingerprint_summary) ?? "not_configured",
    },
    provider_binding: {
      selected_provider_id: providerId,
      selection_reason: "harbor_public_record",
      requires_user_notice: providerId === "chrome_official",
      selected_provider: selectedProvider,
      warnings: blockingReasons,
      unavailable_reason: providerId ? null : "Harbor public record did not expose a selected provider.",
    },
    credential_recovery: {
      credential_ref: stringValue(refs?.credential_ref) ?? null,
      recovery_actions: status?.recovery_required === true ? ["manual_login"] : [],
    },
    diagnostics: blockingReasons,
  };
}

function recordValue(value: unknown) {
  return isRecord(value) ? value : null;
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function arrayStrings(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.length > 0) : [];
}

function providerIdValue(value: unknown) {
  return value === "cloakbrowser" || value === "chrome_official" ? value : null;
}

function loginStateValue(value: unknown): HarborIdentityFacts["login_state"]["state"] {
  return value === "logged_in" || value === "logged_out" || value === "expired" || value === "manual_auth_required" ? value : "unknown";
}

function manualAuthStateValue(value: unknown): HarborIdentityFacts["login_state"]["manual_authentication_state"] {
  return value === "not_required" || value === "required" || value === "in_progress" || value === "completed" || value === "failed"
    ? value
    : "required";
}

function storageStateValue(value: unknown): HarborIdentityFacts["browser_storage"]["state"] {
  return value === "present" || value === "missing" || value === "cleared" ? value : "unknown";
}

function proxyStateValue(value: unknown): HarborIdentityFacts["environment"]["proxy"]["state"] {
  return value === "configured" || value === "missing" ? value : "unknown";
}
