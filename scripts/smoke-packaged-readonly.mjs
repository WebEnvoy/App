import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import electron from "electron";

const screenshotPath = path.resolve(
  process.env.WEBENVOY_PACKAGED_READONLY_SMOKE_SCREENSHOT ?? "artifacts/app-265-packaged-readonly-smoke.png",
);
const runtimeSessionRef = "harbor:runtime-session/app265/readonly";
const identityEnvironmentRef = "harbor://identity-environment/app265-xhs";
const evidenceRef = "harbor:evidence/app265/readonly";
const resultRef = "result:core/xiaohongshu/app265/readonly";
const smokeInput = "关键词：AI 工具；笔记：https://www.xiaohongshu.com/explore/app265-readonly-smoke";
const smokeTargetRef = "https://www.xiaohongshu.com/explore/app265-readonly-smoke";
const submittedPayloads = [];
let submittedRunId = "run_app265_readonly_smoke_001";

const core = await startJsonServer(async ({ method, pathname, body }) => {
  if (["/health", "/ready", "/runtime/health", "/admission/health", "/admission/ready", "/tasks/admission/health"].includes(pathname)) {
    return {
      service: "webenvoy-core-packaged-readonly-smoke",
      status: "ready",
      owner_boundary: "local owner-shaped contract only; no production page, account, profile, Cookie, publish, send, or submit action",
    };
  }

  if (method === "POST" && pathname === "/tasks") {
    const payload = parseJson(body);
    const validationError = validateReadOnlyPayload(payload);
    if (validationError) return { ok: false, error: { code: validationError } };
    submittedRunId = typeof payload.run_id === "string" ? payload.run_id : submittedRunId;
    submittedPayloads.push(payload);
    return {
      ok: true,
      run_id: submittedRunId,
      task: { run_id: submittedRunId },
      run: runSummary(submittedRunId),
    };
  }

  if (pathname === `/runs/${encodeURIComponent(submittedRunId)}`) {
    return { ok: true, run: runSummary(submittedRunId) };
  }

  if (pathname === `/runs/${encodeURIComponent(submittedRunId)}/result`) {
    return {
      ok: true,
      result: {
        result: {
          envelope_state: "available",
          payload_state: "available",
          result_ref: resultRef,
          result_envelope: {
            result_kind: "xiaohongshu_readonly_owner_refs",
            result_ref: resultRef,
            package_ref: "lode://site-capability/xiaohongshu/search-notes@0.1.0",
            source_refs: ["lode:capability/search-notes"],
            evidence_refs: [evidenceRef],
            post_check: {
              status: "passed",
              summary: "Local owner-shaped smoke returned refs only.",
            },
          },
        },
        evidence_refs: [evidenceObject()],
      },
    };
  }

  if (pathname === `/runs/${encodeURIComponent(submittedRunId)}/evidence-refs`) {
    return { ok: true, evidence: { evidence_refs: [evidenceObject()] } };
  }

  if (pathname === `/runs/${encodeURIComponent(submittedRunId)}/failure`) {
    return { ok: true, failure_reason: { reason_class: "none", app_action: "none", retryable: false } };
  }

  if (pathname === `/runs/${encodeURIComponent(submittedRunId)}/session-refs`) {
    return {
      ok: true,
      session_refs: {
        session_refs: {
          runtime_session_ref: runtimeSessionRef,
          identity_environment_ref: identityEnvironmentRef,
          control_owner: "core_task",
          lifecycle_state: "active",
          session_use: "read_only",
        },
      },
    };
  }

  if (pathname === "/capability-runs") {
    return { ok: true, capability_runs: { runs: [] } };
  }

  return null;
});

const harbor = await startJsonServer(async ({ method, pathname }) => {
  if (["/readiness", "/health", "/ready", "/runtime/health"].includes(pathname)) {
    return {
      service: "webenvoy-harbor-packaged-readonly-smoke",
      status: "ready",
      provider_detection_ref: "harbor:provider-detection/app265/local-readonly",
      evidence_ref: evidenceRef,
      owner_boundary: "local owner-shaped contract only; no provider launch, profile read, Cookie read, or production page access",
    };
  }

  if (pathname === "/runtime/browser-providers" || pathname === "/runtime/browser-provider-status" || pathname === "/browser-providers") {
    return providerCatalog();
  }

  if (pathname === "/runtime/identity-environments" || pathname === "/identity-environments" || pathname === "/runtime/local-identity-environments") {
    return { items: [xiaohongshuIdentity()] };
  }

  if (method === "POST" && pathname === "/runtime/identity-environment-sessions") {
    return {
      schema_version: "harbor-runtime-facts/v0",
      runtime_session_ref: runtimeSessionRef,
      provider_ref: "harbor:provider/cloakbrowser",
      lifecycle_state: "active",
      created_at: "2026-07-09T15:45:00Z",
      last_seen_at: "2026-07-09T15:45:05Z",
      viewer_ref: "harbor:viewer/app265/readonly",
      current_page: {
        requested_url: "about:blank",
        current_url: "about:blank",
        title: "App 265 local readonly smoke",
        status: "ready",
      },
      control_owner: "core_task",
      control_lock: { owner: "core_task", state: "held" },
      current_error: null,
    };
  }

  return null;
});

const userDataDir = await mkdtemp(path.join(tmpdir(), "webenvoy-app-packaged-readonly-"));

try {
  await mkdir(path.dirname(screenshotPath), { recursive: true });
  const result = await runElectronSmoke({
    coreEndpoint: core.endpoint,
    harborEndpoint: harbor.endpoint,
    screenshotPath,
    userDataDir,
  });

  if (submittedPayloads.length !== 1) {
    throw new Error(`Packaged readonly smoke failed: expected one Core /tasks submit, got ${submittedPayloads.length}.`);
  }
  if (!result.readonlySubmitSmoke?.ready) {
    throw new Error(`Packaged readonly smoke failed: renderer did not show owner refs. ${JSON.stringify(result.readonlySubmitSmoke)}`);
  }
  const submittedPayload = submittedPayloads[0];
  if (submittedPayload.task_intent?.input?.summary !== smokeInput || submittedPayload.task_intent?.scope?.target_ref !== smokeTargetRef || submittedPayload.harbor?.url !== smokeTargetRef) {
    throw new Error(`Packaged readonly smoke failed: edited business input did not reach Core payload. ${JSON.stringify(submittedPayload)}`);
  }

  console.log(
    [
      "Packaged readonly smoke passed.",
      `Core endpoint: ${core.endpoint}`,
      `Harbor endpoint: ${harbor.endpoint}`,
      `Run id: ${submittedRunId}`,
      `Runtime session ref: ${runtimeSessionRef}`,
      `Evidence ref: ${evidenceRef}`,
      `Screenshot: ${screenshotPath}`,
      "Boundary: local owner-shaped App/Core/Harbor read-only submit and refs only; no real account/profile/Cookie/production page and no publish/send/submit.",
    ].join("\n"),
  );
} finally {
  await rm(userDataDir, { recursive: true, force: true });
  await core.close();
  await harbor.close();
}

async function runElectronSmoke({ coreEndpoint, harborEndpoint, screenshotPath, userDataDir }) {
  const child = spawn(electron, ["dist-electron/main.js"], {
    env: {
      ...process.env,
      WEBENVOY_PACKAGED_SMOKE: "1",
      WEBENVOY_PACKAGED_SMOKE_ACTION: "readonly_submit",
      WEBENVOY_PACKAGED_SMOKE_RUNTIME_EXPECTATION: "live_ready",
      WEBENVOY_PACKAGED_SMOKE_CORE_ENDPOINT: coreEndpoint,
      WEBENVOY_PACKAGED_SMOKE_HARBOR_ENDPOINT: harborEndpoint,
      WEBENVOY_PACKAGED_SMOKE_READONLY_INPUT: smokeInput,
      WEBENVOY_PACKAGED_SMOKE_USER_DATA_DIR: userDataDir,
      WEBENVOY_PACKAGED_SMOKE_SCREENSHOT: screenshotPath,
      WEBENVOY_DISABLE_PACKAGED_RUNTIME: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => {
    stdout += chunk;
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk;
  });

  const exitCode = await new Promise((resolve) => {
    child.on("exit", resolve);
  });

  if (exitCode !== 0) {
    throw new Error(`Packaged readonly Electron smoke failed.\n${stderr || stdout}`);
  }

  const resultLine = stdout
    .split("\n")
    .find((line) => line.startsWith("WEBSMOKE_RESULT "));
  if (!resultLine) {
    throw new Error(`Packaged readonly Electron smoke failed: result line is missing.\n${stdout}`);
  }
  return JSON.parse(resultLine.slice("WEBSMOKE_RESULT ".length));
}

async function startJsonServer(handler) {
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", "http://127.0.0.1");
      const body = await readRequestBody(request);
      const payload = await handler({ method: request.method ?? "GET", pathname: url.pathname, searchParams: url.searchParams, body });
      if (payload == null) {
        response.writeHead(404, {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
        });
        response.end(`${JSON.stringify({ status: "missing" })}\n`);
        return;
      }
      response.writeHead(payload.ok === false ? 400 : 200, {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      });
      response.end(`${JSON.stringify(payload)}\n`);
    } catch (error) {
      response.writeHead(500, {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      });
      response.end(`${JSON.stringify({ ok: false, error: { code: error instanceof Error ? error.message : String(error) } })}\n`);
    }
  });

  await new Promise((resolve, reject) => {
    server.on("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Could not allocate a local smoke server port.");
  }

  return {
    endpoint: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  };
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function parseJson(value) {
  try {
    return value ? JSON.parse(value) : {};
  } catch {
    return {};
  }
}

function validateReadOnlyPayload(payload) {
  if (!payload || typeof payload !== "object") return "invalid_payload";
  if (payload.task_intent?.schema_version !== "webenvoy.task-intent.v0") return "invalid_task_intent_schema";
  if (payload.task_intent?.policy?.risk !== "read" || payload.task_intent?.policy?.execution_intent !== "read") return "not_read_only";
  if (payload.harbor?.identity_environment_ref !== identityEnvironmentRef) return "wrong_identity_environment";
  const targetRef = payload.task_intent?.scope?.target_ref;
  if (targetRef !== smokeTargetRef || payload.harbor?.url !== smokeTargetRef || payload.task_intent?.input?.summary !== smokeInput) return "edited_input_not_applied";
  if (new URL(targetRef).origin !== "https://www.xiaohongshu.com") return "wrong_target_origin";
  if (containsSensitiveKey(payload)) return "sensitive_key_present";
  return "";
}

function containsSensitiveKey(value) {
  if (Array.isArray(value)) return value.some(containsSensitiveKey);
  if (!value || typeof value !== "object") return false;
  return Object.entries(value).some(([key, entry]) =>
    /\b(token|cookie|secret|bearer|credential|password|authorization|profile_storage|raw_evidence|dom|har|trace)\b/i.test(key) ||
    containsSensitiveKey(entry),
  );
}

function runSummary(runId) {
  return {
    run_id: runId,
    status: "succeeded",
    timeline: {
      updated_at: "2026-07-09T15:45:05Z",
      terminal_at: "2026-07-09T15:45:06Z",
    },
    task: {
      capability_ref: "lode:capability/search-notes",
      capability_version: "0.1.0",
      capability_source_ref: "lode://site-capability/xiaohongshu/search-notes@0.1.0",
      package_ref: "lode://site-capability/xiaohongshu/search-notes@0.1.0",
    },
    admission: {
      action_risk: "read",
    },
    runtime_refs: {
      session_binding: {
        runtime_session_ref: runtimeSessionRef,
        identity_environment_ref: identityEnvironmentRef,
        control_owner: "core_task",
        lifecycle_state: "active",
        session_use: "read_only",
      },
    },
    terminal_summary: {
      result_ref: resultRef,
      post_check: { status: "passed", summary: "Local owner-shaped smoke completed refs projection." },
    },
  };
}

function evidenceObject() {
  return {
    ref: evidenceRef,
    source: "Harbor live",
    state: "available",
    raw_access: "not_exposed",
    recorded_at: "2026-07-09T15:45:06Z",
    runtime_session_ref: runtimeSessionRef,
    consumer_boundary: "refs only; App does not read raw evidence bytes",
  };
}

function providerCatalog() {
  return {
    schema_version: "harbor-browser-provider-status/v0",
    providers: [
      {
        provider_id: "cloakbrowser",
        display_name: "CloakBrowser",
        role: "primary",
        install: {
          status: "installed",
          path: "/Applications/CloakBrowser.app",
          version: "145.0-local-smoke",
          launchability: "launchable",
          reason: "local contract provider summary",
        },
        limitations: [],
        diagnostics: [{ app_summary: "Local contract provider summary; browser process was not launched.", suggested_action: "none" }],
      },
      {
        provider_id: "chrome_official",
        display_name: "Google Chrome",
        role: "restricted_fallback",
        install: {
          status: "installed",
          path: "/Applications/Google Chrome.app",
          version: "145.0-local-smoke",
          launchability: "launchable",
          reason: "local contract provider summary",
        },
        limitations: ["restricted fallback only"],
        diagnostics: [{ app_summary: "Official Chrome is restricted fallback in this local contract.", suggested_action: "prefer_cloakbrowser" }],
      },
    ],
    excluded_providers: [
      { provider: "chromium", reason: "not supported for identity runtime" },
      { provider: "donut_browser", reason: "not supported for this delivery milestone" },
    ],
  };
}

function xiaohongshuIdentity() {
  return {
    schema_version: "harbor-local-identity-environment/v0",
    identity_environment_ref: identityEnvironmentRef,
    execution_identity_ref: "harbor://execution-identity/app265-xhs",
    profile_ref: "harbor://profile/app265-xhs",
    site_binding: {
      site_id: "xiaohongshu",
      origin: "https://www.xiaohongshu.com",
      display_name: "小红书",
      account_label: "App 265 local readonly",
    },
    login_state: {
      state: "logged_in",
      reason: "local contract says manual auth is not required",
      recovery_required: false,
      manual_authentication_state: "not_required",
      human_verification: [],
    },
    browser_storage: {
      profile_storage_ref: "harbor://profile-storage/app265-xhs",
      state: "present",
      cookies_session_state: "present",
    },
    environment: {
      proxy: { state: "configured", proxy_ref: "proxy:app265-local", label: "local contract proxy ref" },
      region: "CN-SH",
      language: "zh-CN",
      timezone: "Asia/Shanghai",
      browser_family: "CloakBrowser",
      user_agent_summary: "Chrome family local contract",
      viewport: "1440 x 900",
      fingerprint_summary: "provider_claim_local_contract",
    },
    provider_binding: {
      selected_provider_id: "cloakbrowser",
      selection_reason: "local_contract_readonly",
      requires_user_notice: false,
      selected_provider: providerCatalog().providers[0],
      warnings: [],
      unavailable_reason: null,
    },
    credential_recovery: {
      credential_ref: "credential:app265-local-ref",
      recovery_actions: [],
    },
    diagnostics: ["local contract identity summary; no raw Cookie/profile material exposed"],
  };
}
