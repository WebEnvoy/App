import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const tempDir = await mkdtemp(path.join(tmpdir(), "webenvoy-session-restart-smoke-"));
const storagePath = path.join(tempDir, "renderer-local-storage.json");

try {
  const clientModulePath = await writeRendererModules(tempDir);
  const harbor = await startRestartingHarbor();
  try {
    const first = await runRenderer(clientModulePath, harbor.endpoint, storagePath, harbor.initialSessionRef);
    if (first.sessionRef !== harbor.initialSessionRef || first.state !== "takeover") {
      throw new Error(`Renderer session restart smoke failed: initial session was not recovered. ${JSON.stringify(first)}`);
    }

    harbor.restart();
    const restored = await runRenderer(clientModulePath, harbor.endpoint, storagePath);
    if (
      restored.sessionRef === harbor.initialSessionRef ||
      restored.state !== "takeover" ||
      restored.controller !== "用户接管" ||
      harbor.resumeRequests() !== 1
    ) {
      throw new Error(`Renderer session restart smoke failed: restart did not recreate one managed session. ${JSON.stringify({ restored, resumes: harbor.resumeRequests() })}`);
    }

    harbor.disconnectActiveSession();
    const disconnected = await runRenderer(clientModulePath, harbor.endpoint, storagePath);
    if (
      disconnected.state !== "failed" ||
      disconnected.controller === "用户接管" ||
      harbor.resumeRequests() !== 1
    ) {
      throw new Error(`Renderer session restart smoke failed: disconnected session appeared as authenticated takeover. ${JSON.stringify({ disconnected, resumes: harbor.resumeRequests() })}`);
    }

    console.log("Renderer session restart smoke passed: persisted public session reference was restored across two renderer processes and disconnected state failed closed.");
  } finally {
    await harbor.close();
  }
} finally {
  await rm(tempDir, { recursive: true, force: true });
}

async function writeRendererModules(root) {
  const sources = await Promise.all([
    readFile("src/renderer/harborIdentityTypes.ts", "utf8"),
    readFile("src/renderer/identityEnvironmentFixtures.ts", "utf8"),
    readFile("src/renderer/harborIdentityProjection.ts", "utf8"),
    readFile("src/renderer/ownerPayloadGuards.ts", "utf8"),
    readFile("src/renderer/ownerApiClient.ts", "utf8"),
    readFile("src/renderer/harborSessionReference.ts", "utf8"),
    readFile("src/renderer/harborIdentityClient.ts", "utf8"),
  ]);
  const [types, fixtures, projection, payloadGuards, ownerApi, sessionReference, client] = sources.map(transpileModule);

  await Promise.all([
    writeFile(path.join(root, "harborIdentityTypes.mjs"), types),
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

const [clientPath, endpoint, storagePath, initialSessionRef] = process.argv.slice(2);
const storage = JSON.parse(await readFile(storagePath, "utf8").catch(() => "{}"));
if (initialSessionRef && Object.keys(storage).length === 0) {
  storage["webenvoy.harbor.runtime-session-ref.v1:" + endpoint + ":harbor://identity-environment/session-resume"] = initialSessionRef;
}
const localStorage = {
  getItem(key) { return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null; },
  setItem(key, value) { storage[key] = String(value); },
  removeItem(key) { delete storage[key]; },
};
globalThis.window = { localStorage, setTimeout, clearTimeout };
const client = await import(pathToFileURL(clientPath).href);
const state = await client.fetchHarborIdentityState(endpoint, []);
await writeFile(storagePath, JSON.stringify(storage));
const identity = state.identities.find((item) => item.identityEnvironmentRef === "harbor://identity-environment/session-resume");
console.log(JSON.stringify({
  loadStatus: state.status,
  summary: state.summary,
  identityCount: state.identities.length,
  state: identity?.browser.session.state,
  controller: identity?.browser.session.controller,
  sessionRef: identity?.browser.session.browserSessionRef,
}));
`);
  return path.join(root, "harborIdentityClient.mjs");
}

function transpileModule(source) {
  return ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
}

async function runRenderer(clientPath, endpoint, storagePath, initialSessionRef) {
  const runnerPath = path.join(path.dirname(clientPath), "renderer-process.mjs");
  const child = spawn(process.execPath, [runnerPath, clientPath, endpoint, storagePath, ...(initialSessionRef ? [initialSessionRef] : [])], {
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
    if (request.method === "GET" && activeSessionRef != null && url.pathname === `/runtime/sessions/${encodeURIComponent(activeSessionRef)}`) {
      sendJson(response, sessionFacts(activeSessionRef, activeLifecycle));
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
    disconnectActiveSession() { activeLifecycle = "disconnected"; },
    resumeRequests: () => resumes,
    close: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
  };
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
    provider_binding: { selected_provider_id: "cloakbrowser", selection_reason: "smoke", requires_user_notice: false, selected_provider: providerCatalog().providers[0], warnings: [], unavailable_reason: null },
    credential_recovery: { credential_ref: null, recovery_actions: [] },
    diagnostics: [],
  };
}

function sessionFacts(runtimeSessionRef, lifecycleState) {
  return {
    schema_version: "harbor-runtime-facts/v0",
    runtime_session_ref: runtimeSessionRef,
    identity_environment_ref: "harbor://identity-environment/session-resume",
    provider_ref: "harbor://provider/cloakbrowser",
    lifecycle_state: lifecycleState,
    created_at: "2026-07-11T00:00:00.000Z",
    last_seen_at: "2026-07-11T00:00:00.000Z",
    viewer_ref: "harbor://viewer/session-resume",
    current_page: { requested_url: "https://www.xiaohongshu.com/explore", current_url: "https://www.xiaohongshu.com/explore", title: "小红书", status: lifecycleState === "active" ? "ready" : "unavailable" },
    control_owner: "user",
    control_lock: { owner: "user", state: "held" },
    current_error: lifecycleState === "active" ? null : { message: "session disconnected", retryable: true },
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
