import { isManualAuthenticationCompletionPath } from "./manualAuthenticationCompletion.js";

export type OwnerApiJsonRequest = {
  base?: unknown;
  path?: unknown;
  method?: unknown;
  body?: unknown;
};

type OwnerApiMethod = "GET" | "POST" | "PATCH" | "DELETE";

export type ParsedOwnerApiRequest =
  | { ok: true; url: string; path: string; method: OwnerApiMethod; body?: unknown }
  | { ok: false; error: string };

const ownerApiAllowedHosts = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);
const sensitiveOwnerApiFragment =
  /\b(token|cookie|secret|bearer|profile|credential|password|authorization)\b|raw[\s_-]*evidence/i;

export function parseOwnerApiRequest(request: OwnerApiJsonRequest): ParsedOwnerApiRequest {
  if (typeof request?.base !== "string" || typeof request.path !== "string") {
    return { ok: false, error: "Owner API request requires base and path strings." };
  }
  const method = ownerApiMethod(request.method);
  if (!method) return { ok: false, error: "Owner API method is not allowed." };
  if (!request.path.startsWith("/") || request.path.startsWith("//")) {
    return { ok: false, error: "Owner API path must be an absolute local path." };
  }
  if (sensitiveOwnerApiFragment.test(request.base) || sensitiveOwnerApiFragment.test(request.path)) {
    return { ok: false, error: "Owner API URL cannot include sensitive fragments." };
  }

  let baseUrl: URL;
  try {
    baseUrl = new URL(request.base);
  } catch {
    return { ok: false, error: "Owner API base must be a valid URL." };
  }
  if (baseUrl.protocol !== "http:") {
    return { ok: false, error: "Owner API base must use http on the local machine." };
  }
  if (!ownerApiAllowedHosts.has(baseUrl.hostname)) {
    return { ok: false, error: "Owner API host must be localhost or loopback." };
  }
  if (baseUrl.username || baseUrl.password || baseUrl.search || baseUrl.hash) {
    return { ok: false, error: "Owner API base cannot include credentials, query, or hash." };
  }

  const url = new URL(request.path, `${baseUrl.origin}${baseUrl.pathname.replace(/\/+$/, "")}/`);
  if (url.origin !== baseUrl.origin) {
    return { ok: false, error: "Owner API path must stay on the configured local origin." };
  }
  if (isManualAuthenticationCompletionPath(url.pathname)) {
    return { ok: false, error: "Manual authentication completion requires its dedicated IPC intent." };
  }
  return {
    ok: true,
    url: url.toString(),
    path: `${url.pathname}${url.search}`,
    method,
    ...(request.body === undefined ? {} : { body: request.body }),
  };
}

function ownerApiMethod(value: unknown): OwnerApiMethod | null {
  if (value === undefined) return "GET";
  return value === "GET" || value === "POST" || value === "PATCH" || value === "DELETE" ? value : null;
}
