import { identityInputFromProjection, projectHarborIdentity, projectHarborSession, projectLocalDraft } from "./harborIdentityProjection";
import {
  type HarborIdentityFacts,
  type HarborIdentityLoadState,
  type HarborProviderCatalog,
  type HarborRuntimeSession,
  type LocalIdentityEnvironmentDraft,
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
  const catalog = catalogResult.ok && isProviderCatalog(catalogResult.value) ? catalogResult.value : null;
  const liveIdentities = identityResult.ok ? parseIdentityList(identityResult.value).map((item) => projectHarborIdentity(item, catalog, fetchedAt)) : [];
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
  return postHarborSession(harborEndpoint, [
    "/runtime/identity-environment-sessions",
    "/runtime/sessions/identity-environment",
    "/identity-environment-sessions",
  ], {
    identity_environment: identityInputFromProjection(identity),
    url: target.defaultUrl,
    control_owner: "user",
    holder_ref: "app-browser-page",
    reuse_existing: true,
  });
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

async function postFirstJson<T>(base: string, paths: string[], body: unknown) {
  for (const path of paths) {
    const result = await requestJson<T>(base, path, {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (result.ok) return result;
  }
  return { ok: false as const, error: "Harbor endpoint 未接受会话请求。" };
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

function parseIdentityList(value: unknown): HarborIdentityFacts[] {
  const items = Array.isArray(value) ? value : isRecord(value) && Array.isArray(value.items) ? value.items : [];
  return items.flatMap((item) => (isHarborIdentityFacts(item) ? [item] : []));
}

function sessionPaths(sessionRef: string, action: "lock" | "release" | "stop") {
  const encoded = encodeURIComponent(sessionRef);
  return [`/runtime/sessions/${encoded}/${action}`, `/sessions/${encoded}/${action}`];
}
