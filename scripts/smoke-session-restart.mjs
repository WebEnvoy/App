import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const tempDir = await mkdtemp(path.join(tmpdir(), "webenvoy-session-restart-smoke-"));

try {
  const clientModulePath = await writeRendererModules(tempDir);
  const harbor = await startRestartingHarbor();
  try {
    await assertActiveSession(clientModulePath, harbor);
    await assertRestartRecovery(clientModulePath, harbor);
    await assert404Recovery(clientModulePath, harbor, "http-404");
    await assert404Recovery(clientModulePath, harbor, "ipc-404", "ipc");
    await assertDisconnectedSessionFailsClosed(clientModulePath, harbor);
    await assertInvalidLookupResponsesFailClosed(clientModulePath, harbor);
    await assertConcurrentRecoveryIsSingleFlight(clientModulePath, harbor);
    console.log("Renderer session restart smoke passed: only Harbor session-missing facts restore once; invalid and concurrent lookups fail closed.");
  } finally {
    await harbor.close();
  }
} finally {
  await rm(tempDir, { recursive: true, force: true });
}

async function assertActiveSession(clientModulePath, harbor) {
  const first = await runRenderer(clientModulePath, harbor.endpoint, storagePath("active"), harbor.initialSessionRef);
  if (first.sessionRef !== harbor.initialSessionRef || first.state !== "takeover") {
    throw new Error(`Renderer session restart smoke failed: active session was not recovered. ${JSON.stringify(first)}`);
  }
}

async function assertRestartRecovery(clientModulePath, harbor) {
  const storage = storagePath("restart");
  await runRenderer(clientModulePath, harbor.endpoint, storage, harbor.initialSessionRef);
  const before = harbor.resumeRequests();
  harbor.restart();
  const restored = await runRenderer(clientModulePath, harbor.endpoint, storage);
  if (
    restored.sessionRef === harbor.initialSessionRef ||
    restored.state !== "takeover" ||
    restored.controller !== "用户接管" ||
    harbor.resumeRequests() !== before + 1
  ) {
    throw new Error(`Renderer session restart smoke failed: explicit session-missing response did not recreate one managed session. ${JSON.stringify({ restored, resumes: harbor.resumeRequests() })}`);
  }
}

async function assert404Recovery(clientModulePath, harbor, name, transport) {
  const storage = storagePath(name);
  const initialSessionRef = harbor.activeSessionRef();
  await runRenderer(clientModulePath, harbor.endpoint, storage, initialSessionRef, transport);
  const before = harbor.resumeRequests();
  harbor.setLookupMode("missing-404");
  const restored = await runRenderer(clientModulePath, harbor.endpoint, storage, undefined, transport);
  harbor.setLookupMode("normal");
  if (
    restored.sessionRef === initialSessionRef ||
    restored.state !== "takeover" ||
    restored.controller !== "用户接管" ||
    harbor.resumeRequests() !== before + 1
  ) {
    throw new Error(`Renderer session restart smoke failed: ${name} session-missing response did not recreate one managed session. ${JSON.stringify({ restored, resumes: harbor.resumeRequests() })}`);
  }
}

async function assertDisconnectedSessionFailsClosed(clientModulePath, harbor) {
  const storage = storagePath("disconnected");
  await runRenderer(clientModulePath, harbor.endpoint, storage, harbor.activeSessionRef());
  const before = harbor.resumeRequests();
  harbor.disconnectActiveSession();
  const disconnected = await runRenderer(clientModulePath, harbor.endpoint, storage);
  if (disconnected.state !== "failed" || disconnected.controller === "用户接管" || harbor.resumeRequests() !== before) {
    throw new Error(`Renderer session restart smoke failed: disconnected session appeared as authenticated takeover. ${JSON.stringify({ disconnected, resumes: harbor.resumeRequests() })}`);
  }
  harbor.restoreActiveSession();
}

async function assertInvalidLookupResponsesFailClosed(clientModulePath, harbor) {
  for (const mode of ["transport", "forbidden", "server-error", "malformed", "fixture", "fixture-title", "fixture-fact", "unmarked", "missing-404-invalid", "missing-404-fixture"]) {
    const before = harbor.resumeRequests();
    harbor.setLookupMode(mode);
    const result = await runRenderer(clientModulePath, harbor.endpoint, storagePath(mode), harbor.activeSessionRef());
    if (result.state !== "idle" || harbor.resumeRequests() !== before) {
      throw new Error(`Renderer session restart smoke failed: ${mode} lookup started a session. ${JSON.stringify({ result, resumes: harbor.resumeRequests() })}`);
    }
  }
  harbor.setLookupMode("normal");
}

async function assertConcurrentRecoveryIsSingleFlight(clientModulePath, harbor) {
  const storage = storagePath("concurrent");
  await runRenderer(clientModulePath, harbor.endpoint, storage, harbor.activeSessionRef());
  const before = harbor.resumeRequests();
  harbor.restart();
  const results = await runConcurrentRenderer(clientModulePath, harbor.endpoint, storage);
  if (
    results.some((result) => result.state !== "takeover" || result.controller !== "用户接管") ||
    harbor.resumeRequests() !== before + 1
  ) {
    throw new Error(`Renderer session restart smoke failed: concurrent refresh did not share one recovery. ${JSON.stringify({ results, resumes: harbor.resumeRequests() })}`);
  }
}

function storagePath(name) {
  return path.join(tempDir, `${name}-renderer-local-storage.json`);
}

async function writeRendererModules(root) {
  const sources = await Promise.all([
    readFile("src/renderer/harborIdentityTypes.ts", "utf8"),
    readFile("src/renderer/harborRuntimeSessionFacts.ts", "utf8"),
    readFile("src/renderer/identityEnvironmentFixtures.ts", "utf8"),
    readFile("src/renderer/harborIdentityProjection.ts", "utf8"),
    readFile("src/renderer/ownerPayloadGuards.ts", "utf8"),
    readFile("src/renderer/ownerApiClient.ts", "utf8"),
    readFile("src/renderer/harborSessionReference.ts", "utf8"),
    readFile("src/renderer/harborIdentityClient.ts", "utf8"),
  ]);
  const [types, runtimeSessionFacts, fixtures, projection, payloadGuards, ownerApi, sessionReference, client] = sources.map(transpileModule);

  await Promise.all([
    writeFile(path.join(root, "harborIdentityTypes.mjs"), types),
    writeFile(
      path.join(root, "harborRuntimeSessionFacts.mjs"),
      runtimeSessionFacts
        .replace('from "./harborIdentityTypes";', 'from "./harborIdentityTypes.mjs";')
        .replace('from "./ownerPayloadGuards";', 'from "./ownerPayloadGuards.mjs";'),
    ),
    writeFile(path.join(root, "identityEnvironmentFixtures.mjs"), fixtures),
    writeFile(path.join(root, "ownerPayloadGuards.mjs"), payloadGuards),
    writeFile(path.join(root, "ownerApiClient.mjs"), ownerApi),
    writeFile(path.join(root, "harborSessionReference.mjs"), sessionReference),
    writeFile(
      path.join(root, "harborIdentityProjection.mjs"),
      projection.replace('from "./identityEnvironmentFixtures";', 'from "./identityEnvironmentFixtures.mjs";'),
    ),
    writeFile(
      path.join(root, "harborIdentityClient.mjs"),
      client
        .replace('from "./harborIdentityProjection";', 'from "./harborIdentityProjection.mjs";')
        .replace('from "./harborIdentityTypes";', 'from "./harborIdentityTypes.mjs";')
        .replace('from "./harborRuntimeSessionFacts";', 'from "./harborRuntimeSessionFacts.mjs";')
        .replace('from "./ownerPayloadGuards";', 'from "./ownerPayloadGuards.mjs";')
        .replace('from "./ownerApiClient";', 'from "./ownerApiClient.mjs";')
        .replace('from "./harborSessionReference";', 'from "./harborSessionReference.mjs";')
        .replace('from "./harborSessionReference";', 'from "./harborSessionReference.mjs";'),
    ),
  ]);

  const runnerPath = path.join(root, "renderer-process.mjs");
  await writeFile(runnerPath, `
import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const [clientPath, endpoint, storagePath, initialSessionRef, mode, transport] = process.argv.slice(2);
const storage = JSON.parse(await readFile(storagePath, "utf8").catch(() => "{}"));
if (initialSessionRef && Object.keys(storage).length === 0) {
  storage["webenvoy.harbor.runtime-session-ref.v1:" + endpoint + ":harbor://identity-environment/session-resume"] = initialSessionRef;
}
const localStorage = {
  getItem(key) { return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null; },
  setItem(key, value) { storage[key] = String(value); },
  removeItem(key) { delete storage[key]; },
};
const requestOwnerJson = transport === "ipc" ? async (request) => {
  const response = await fetch(request.base + request.path, {
    method: request.method,
    headers: { Accept: "application/json" },
    ...(request.body === undefined ? {} : { body: JSON.stringify(request.body) }),
  });
  const body = JSON.parse(await response.text());
  return response.ok
    ? { ok: true, status: response.status, body }
    : { ok: false, status: response.status, error: request.path + " returned " + response.status, body };
} : undefined;
globalThis.window = { localStorage, setTimeout, clearTimeout, ...(requestOwnerJson ? { webenvoyShell: { requestOwnerJson } } : {}) };
const client = await import(pathToFileURL(clientPath).href);
const states = await (mode === "concurrent"
  ? Promise.all([client.fetchHarborIdentityState(endpoint, []), client.fetchHarborIdentityState(endpoint, [])])
  : Promise.resolve([await client.fetchHarborIdentityState(endpoint, [])]));
await writeFile(storagePath, JSON.stringify(storage));
const results = states.map((state) => {
  const identity = state.identities.find((item) => item.identityEnvironmentRef === "harbor://identity-environment/session-resume");
  return {
    loadStatus: state.status,
    state: identity?.browser.session.state,
    controller: identity?.browser.session.controller,
    sessionRef: identity?.browser.session.browserSessionRef,
  };
});
console.log(JSON.stringify(results));
`);
  return path.join(root, "harborIdentityClient.mjs");
}

function transpileModule(source) {
  return ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
}

async function runRenderer(clientPath, endpoint, storage, initialSessionRef, transport) {
  const [result] = await runRendererProcess(clientPath, endpoint, storage, initialSessionRef, undefined, transport);
  return result;
}

function runConcurrentRenderer(clientPath, endpoint, storage) {
  return runRendererProcess(clientPath, endpoint, storage, undefined, "concurrent");
}

async function runRendererProcess(clientPath, endpoint, storage, initialSessionRef, mode, transport) {
  const runnerPath = path.join(path.dirname(clientPath), "renderer-process.mjs");
  const child = spawn(process.execPath, [runnerPath, clientPath, endpoint, storage, initialSessionRef ?? "", mode ?? "", transport ?? ""], {
    stdio: ["ignore", "pipe", "pipe"],
  });
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => { stdout += chunk; });
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  const exitCode = await new Promise((resolve) => child.once("exit", resolve));
  if (exitCode !== 0) throw new Error(`Renderer process exited ${exitCode}: ${stderr || stdout}`);
  return JSON.parse(stdout.trim());
}

async function startRestartingHarbor() {
  const initialSessionRef = "harbor:runtime-session/session-resume/1";
  let activeSessionRef = initialSessionRef;
  let activeLifecycle = "active";
  let lookupMode = "normal";
  let generation = 1;
  let resumes = 0;
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    if (request.method === "GET" && url.pathname === "/runtime/browser-providers") {
      sendJson(response, providerCatalog());
      return;
    }
    if (request.method === "GET" && url.pathname === "/runtime/identity-environments") {
      sendJson(response, { items: [identityFacts()] });
      return;
    }
    if (request.method === "GET" && url.pathname.startsWith("/runtime/sessions/")) {
      if (lookupMode !== "normal") {
        sendLookupResponse(response, lookupMode);
      } else if (activeSessionRef != null && url.pathname === `/runtime/sessions/${encodeURIComponent(activeSessionRef)}`) {
        sendJson(response, sessionFacts(activeSessionRef, activeLifecycle));
      } else {
        sendJson(response, sessionMissingFacts());
      }
      return;
    }
    if (request.method === "POST" && url.pathname === "/runtime/identity-environment-sessions") {
      const body = await readJson(request);
      if (
        body?.identity_environment_ref !== "harbor://identity-environment/session-resume" ||
        body?.control_owner !== "user" ||
        body?.reuse_existing !== true ||
        body?.headless !== false
      ) {
        sendJson(response, { status: "unavailable", message: "invalid restore intent", retryable: false }, 409);
        return;
      }
      generation += 1;
      activeSessionRef = `harbor:runtime-session/session-resume/${generation}`;
      activeLifecycle = "active";
      resumes += 1;
      sendJson(response, sessionFacts(activeSessionRef, activeLifecycle));
      return;
    }
    sendJson(response, { status: "missing" }, 404);
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (address == null || typeof address === "string") throw new Error("Could not start Harbor restart smoke server.");
  return {
    endpoint: `http://127.0.0.1:${address.port}`,
    initialSessionRef,
    restart() { activeSessionRef = null; },
    activeSessionRef: () => activeSessionRef,
    disconnectActiveSession() { activeLifecycle = "disconnected"; },
    restoreActiveSession() { activeLifecycle = "active"; },
    setLookupMode(mode) { lookupMode = mode; },
    resumeRequests: () => resumes,
    close: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
  };
}

function sendLookupResponse(response, mode) {
  if (mode === "transport") return response.destroy();
  if (mode === "forbidden") return sendJson(response, { error: "forbidden" }, 403);
  if (mode === "server-error") return sendJson(response, { error: "unavailable" }, 503);
  if (mode === "malformed") return sendJson(response, { schema_version: "harbor-runtime-facts/v0" });
  if (mode === "fixture") return sendJson(response, { ...sessionFacts("harbor:runtime-session/fixture"), source: "fixture" });
  if (mode === "fixture-title") {
    const session = sessionFacts("harbor:runtime-session/title");
    return sendJson(response, { ...session, current_page: { ...session.current_page, title: "Fixture browser" } });
  }
  if (mode === "fixture-fact") {
    return sendJson(response, {
      ...sessionFacts("harbor:runtime-session/fact"),
      facts: [{ key: "session.state", source: "observed", value: "demo launcher" }],
    });
  }
  if (mode === "missing-404") return sendJson(response, sessionMissingFacts(), 404);
  if (mode === "missing-404-invalid") return sendJson(response, { status: "unavailable", failure_class: "session_missing" }, 404);
  if (mode === "missing-404-fixture") return sendJson(response, { ...sessionMissingFacts(), source: "fixture" }, 404);
  return sendJson(response, {
    schema_version: "harbor-runtime-facts/v0",
    runtime_session_ref: "harbor:runtime-session/unmarked",
    identity_environment_ref: "harbor://identity-environment/session-resume",
  });
}

function providerCatalog() {
  return {
    schema_version: "harbor-browser-provider-status/v0",
    providers: [{
      provider_id: "cloakbrowser",
      display_name: "CloakBrowser",
      role: "primary",
      install: { status: "installed", path: "/Applications/CloakBrowser.app", version: "1.0", launchability: "launchable", reason: null },
      limitations: [],
    }],
    excluded_providers: [],
  };
}

function identityFacts() {
  return {
    schema_version: "harbor-local-identity-environment/v0",
    identity_environment_ref: "harbor://identity-environment/session-resume",
    execution_identity_ref: "harbor://execution-identity/session-resume",
    profile_ref: "harbor://profile/session-resume",
    site_binding: { site_id: "xiaohongshu", origin: "https://www.xiaohongshu.com", display_name: "小红书", account_label: "session resume" },
    login_state: { state: "logged_in", reason: "Harbor public state", recovery_required: false, manual_authentication_state: "completed", human_verification: [] },
    browser_storage: { profile_storage_ref: "harbor://profile/session-resume/storage", state: "present", cookies_session_state: "present" },
    environment: { proxy: { state: "configured", proxy_ref: null, label: "configured" }, region: "CN-SH", language: "zh-CN", timezone: "Asia/Shanghai", browser_family: "cloakbrowser", user_agent_summary: null, viewport: null, fingerprint_summary: "managed" },
    provider_binding: { selected_provider_id: "cloakbrowser", selection_reason: "Harbor public state", requires_user_notice: false, selected_provider: providerCatalog().providers[0], warnings: [], unavailable_reason: null },
    credential_recovery: { credential_ref: null, recovery_actions: [] },
    diagnostics: [],
  };
}

function sessionMissingFacts() {
  return {
    status: "unavailable",
    failure_class: "session_missing",
    message: "Runtime Session is missing.",
    retryable: true,
    current_error: { code: "session_lost", message: "Runtime Session is missing.", retryable: true },
  };
}

function sessionFacts(runtimeSessionRef, lifecycleState = "active") {
  const now = "2026-07-11T00:00:00.000Z";
  const active = lifecycleState === "active";
  return {
    schema_version: "harbor-runtime-facts/v0",
    runtime_session_ref: runtimeSessionRef,
    identity_environment_ref: "harbor://identity-environment/session-resume",
    profile_ref: "harbor://profile/session-resume",
    provider_ref: "harbor://provider/cloakbrowser",
    provider_mode: "local_dedicated_profile",
    lifecycle_state: lifecycleState,
    created_at: now,
    last_seen_at: now,
    availability: { cdp: active ? "available" : "unavailable", viewer: active ? "available" : "unavailable", snapshot: "unavailable", evidence: "unavailable" },
    viewer_ref: "harbor://viewer/session-resume",
    current_page: {
      requested_url: "https://www.xiaohongshu.com/explore",
      current_url: active ? "https://www.xiaohongshu.com/explore" : null,
      title: active ? "小红书" : null,
      status: active ? "ready" : "unavailable",
      error_reason: active ? null : { code: "session_lost", message: "session disconnected", retryable: true },
      observed_at: now,
    },
    control_owner: "user",
    control_lock: { owner: "user", state: "held", holder_ref: "app-browser-page", updated_at: now, conflict_error: null },
    current_error: active ? null : { code: "session_lost", message: "session disconnected", retryable: true },
    facts: [{ key: "session.state", source: "observed", value: lifecycleState }],
  };
}

async function readJson(request) {
  let body = "";
  for await (const chunk of request) body += chunk;
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

function sendJson(response, body, status = 200) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}
