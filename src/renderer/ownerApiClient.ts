export type OwnerApiMethod = "GET" | "POST" | "PATCH" | "DELETE";

export type OwnerApiRequestOptions = {
  method?: OwnerApiMethod;
  body?: unknown;
  timeoutMs?: number;
};

export async function requestOwnerJson(
  base: string,
  path: string,
  options: OwnerApiRequestOptions = {},
): Promise<unknown> {
  const shellRequest = window.webenvoyShell?.requestOwnerJson;
  if (shellRequest) {
    const result = await shellRequest({
      base,
      path,
      method: options.method ?? "GET",
      ...(options.body === undefined ? {} : { body: options.body }),
    });
    return unwrapOwnerApiResponse(result, path);
  }

  return requestOwnerJsonWithFetch(base, path, options);
}

async function requestOwnerJsonWithFetch(
  base: string,
  path: string,
  options: OwnerApiRequestOptions,
): Promise<unknown> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs ?? 2500);
  try {
    const response = await fetch(`${base}${path}`, {
      method: options.method ?? "GET",
      credentials: "omit",
      headers: {
        Accept: "application/json",
        ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
      signal: controller.signal,
    });
    const payload = await responsePayload(response);
    if (!response.ok) return { ok: false, error: responseStatusError(path, response.status, payload) };
    return payload ?? {};
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  } finally {
    window.clearTimeout(timeout);
  }
}

function unwrapOwnerApiResponse(value: unknown, path: string): unknown {
  if (!isRecord(value)) return { ok: false, error: `${path} returned invalid owner API response.` };
  if (value.ok === true) return "body" in value ? value.body : {};

  const error = typeof value.error === "string" ? value.error : `${path} owner API request failed.`;
  return {
    ok: false,
    ...(typeof value.status === "number" ? { status: value.status } : {}),
    error,
    ...(value.body === undefined ? {} : { body: value.body }),
  };
}

function responseStatusError(path: string, status: number, payload: unknown) {
  if (!isRecord(payload)) return `${path} returned ${status}`;
  const error = isRecord(payload.error) ? payload.error : null;
  const code = typeof error?.code === "string" ? error.code : undefined;
  const category = typeof error?.category === "string" ? error.category : undefined;
  return [`${path} returned ${status}`, category, code].filter(Boolean).join(": ");
}

async function responsePayload(response: Response): Promise<unknown> {
  if (typeof response.text === "function") {
    return parseJson(await response.text());
  }
  const jsonResponse = response as Response & { json?: () => Promise<unknown> };
  return typeof jsonResponse.json === "function" ? jsonResponse.json() : null;
}

function parseJson(value: string): unknown {
  if (!value.trim()) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
