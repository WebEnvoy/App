import { spawn, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

import { coreLodeAssetEnvironment, resolveLodeAssetBundle, type LodeAssetBundleState } from "./lodeAssetBundle.js";

export type RuntimeServiceId = "core" | "harbor";

export type RuntimeEndpointConfig = {
  coreEndpoint: string;
  harborEndpoint: string;
};

export type RuntimeServiceLaunchConfig = {
  command: string;
  args?: string[];
  cwd?: string;
  source: "env-command" | "env-path" | "packaged-path" | "local-cwd";
};

export type RuntimeProcessState = "not_configured" | "starting" | "running" | "exited" | "failed";
export type RuntimeProbeState = "ready" | "unavailable";

export type RuntimeProbe = {
  state: RuntimeProbeState;
  url: string;
  statusCode?: number;
  summary: string;
  attempts?: Array<{ url: string; statusCode?: number; summary: string }>;
};

type RuntimeProbeAttempt = RuntimeProbe & {
  continueFallback: boolean;
};

export type RuntimeServiceState = {
  id: RuntimeServiceId;
  name: string;
  endpoint: string;
  processState: RuntimeProcessState;
  launchSource: RuntimeServiceLaunchConfig["source"] | "not_configured";
  command?: string;
  cwd?: string;
  pid?: number;
  health: RuntimeProbe;
  admission?: RuntimeProbe;
  checkedAt: string;
  lastExitCode?: number | null;
  lastError?: string;
  repairAction: string;
};

export type RuntimeSupervisorState = {
  mode: "real";
  checkedAt: string;
  services: RuntimeServiceState[];
  lodeAssets: LodeAssetBundleState;
  canUseLiveRuntime: boolean;
  failClosed: boolean;
  summary: string;
};

type ProcessSnapshot = {
  processState: RuntimeProcessState;
  child?: ChildProcess;
  lastExitCode?: number | null;
  lastError?: string;
};

const serviceNames: Record<RuntimeServiceId, string> = {
  core: "Core",
  harbor: "Harbor",
};

const serviceHealthPaths: Record<RuntimeServiceId, string[]> = {
  core: ["/health", "/ready", "/runtime/health"],
  harbor: ["/readiness", "/health", "/ready", "/runtime/health"],
};

const coreAdmissionPaths = ["/admission/health", "/admission/ready", "/tasks/admission/health"];

export function resolveRuntimeServiceLaunchConfig(
  id: RuntimeServiceId,
  env: NodeJS.ProcessEnv = process.env,
  resourcesPath = getResourcesPath(),
): RuntimeServiceLaunchConfig | null {
  const prefix = `WEBENVOY_${id.toUpperCase()}_RUNTIME`;
  const command = env[`${prefix}_COMMAND`]?.trim();
  if (command) {
    const parsed = parseCommand(command);
    if (parsed) return { ...parsed, cwd: env[`${prefix}_CWD`], source: "env-command" };
  }

  const explicitPath = env[`${prefix}_PATH`]?.trim();
  if (explicitPath) return { command: explicitPath, cwd: env[`${prefix}_CWD`], source: "env-path" };

  const packagedPath = resolvePackagedRuntimePath(id, resourcesPath);
  if (packagedPath) return { command: packagedPath, source: "packaged-path" };

  const cwd = env[`${prefix}_CWD`]?.trim();
  if (cwd) return { command: "pnpm", args: ["start:runtime"], cwd, source: "local-cwd" };

  return null;
}

export function summarizeRuntimeReadiness(services: RuntimeServiceState[], lodeAssets = resolveLodeAssetBundle()) {
  const core = services.find((service) => service.id === "core");
  const harbor = services.find((service) => service.id === "harbor");
  const canUseLiveRuntime =
    core?.health.state === "ready" &&
    core.admission?.state === "ready" &&
    harbor?.health.state === "ready" &&
    lodeAssets.state === "ready";

  return {
    canUseLiveRuntime,
    failClosed: !canUseLiveRuntime,
    summary: canUseLiveRuntime
      ? "本地 Core health/admission、Harbor runtime health 与 Lode capability assets 均可用。"
      : "生产运行已 fail closed：Core health/admission、Harbor runtime health 或 Lode capability assets 尚不可用，fixture/demo 不作为可用结果。",
  };
}

export function createRuntimeSupervisor() {
  const processSnapshots = new Map<RuntimeServiceId, ProcessSnapshot>();

  return {
    async readState(config: RuntimeEndpointConfig): Promise<RuntimeSupervisorState> {
      const checkedAt = new Date().toISOString();
      const lodeAssets = resolveLodeAssetBundle();
      const services = await Promise.all(
        (["core", "harbor"] as const).map((id) =>
          readServiceState(id, endpointFor(id, config), checkedAt, processSnapshots, lodeAssets),
        ),
      );
      const readiness = summarizeRuntimeReadiness(services, lodeAssets);

      return {
        mode: "real",
        checkedAt,
        services,
        lodeAssets,
        ...readiness,
      };
    },
    stop() {
      for (const snapshot of processSnapshots.values()) {
        snapshot.child?.kill();
      }
    },
  };
}

async function readServiceState(
  id: RuntimeServiceId,
  endpoint: string,
  checkedAt: string,
  processSnapshots: Map<RuntimeServiceId, ProcessSnapshot>,
  lodeAssets: LodeAssetBundleState,
): Promise<RuntimeServiceState> {
  const launch = resolveRuntimeServiceLaunchConfig(id);
  const snapshot = ensureProcess(id, launch, processSnapshots, id === "core" ? coreLodeAssetEnvironment(lodeAssets) : {});
  const health = await probeFirst(endpoint, serviceHealthPaths[id]);
  const admission = id === "core" ? await probeFirst(endpoint, coreAdmissionPaths) : undefined;
  const processState = health.state === "ready" && snapshot.processState === "not_configured" ? "running" : snapshot.processState;

  return {
    id,
    name: serviceNames[id],
    endpoint,
    processState,
    launchSource: launch?.source ?? "not_configured",
    command: launch?.command,
    cwd: launch?.cwd,
    pid: snapshot.child?.pid,
    health,
    ...(admission ? { admission } : {}),
    checkedAt,
    lastExitCode: snapshot.lastExitCode,
    lastError: snapshot.lastError,
    repairAction: repairAction(id, launch, health, admission),
  };
}

function ensureProcess(
  id: RuntimeServiceId,
  launch: RuntimeServiceLaunchConfig | null,
  processSnapshots: Map<RuntimeServiceId, ProcessSnapshot>,
  extraEnv: NodeJS.ProcessEnv = {},
): ProcessSnapshot {
  const current = processSnapshots.get(id);
  if (current?.child && current.processState !== "exited" && current.processState !== "failed") {
    return current;
  }

  if (!launch) {
    const snapshot = current ?? { processState: "not_configured" as const };
    processSnapshots.set(id, snapshot);
    return snapshot;
  }

  try {
    const child = spawn(launch.command, launch.args ?? [], {
      cwd: launch.cwd,
      env: { ...process.env, ...extraEnv },
      stdio: "ignore",
      windowsHide: true,
    });
    const snapshot: ProcessSnapshot = { child, processState: "starting" };
    processSnapshots.set(id, snapshot);
    child.on("spawn", () => {
      snapshot.processState = "running";
    });
    child.on("error", (error) => {
      snapshot.processState = "failed";
      snapshot.lastError = error.message;
    });
    child.on("exit", (code) => {
      snapshot.processState = code === 0 ? "exited" : "failed";
      snapshot.lastExitCode = code;
      snapshot.child = undefined;
    });
    return snapshot;
  } catch (error) {
    const snapshot: ProcessSnapshot = {
      processState: "failed",
      lastError: error instanceof Error ? error.message : String(error),
    };
    processSnapshots.set(id, snapshot);
    return snapshot;
  }
}

async function probeFirst(endpoint: string, paths: string[]): Promise<RuntimeProbe> {
  const attempts: RuntimeProbe["attempts"] = [];

  for (const probePath of paths) {
    const result = await probeEndpoint(endpoint, probePath);
    attempts.push({ url: result.url, statusCode: result.statusCode, summary: result.summary });
    const { continueFallback, ...probe } = result;
    if (result.state === "ready") return { ...probe, attempts };
    if (!continueFallback) return { ...probe, attempts };
  }

  return {
    state: "unavailable",
    url: `${endpoint}${paths[0]}`,
    statusCode: attempts.at(-1)?.statusCode,
    summary: `No ready response from ${paths.join(", ")}. ${attempts.at(-1)?.summary ?? ""}`.trim(),
    attempts,
  };
}

async function probeEndpoint(endpoint: string, probePath: string): Promise<RuntimeProbeAttempt> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1500);
  const url = `${endpoint}${probePath}`;

  try {
    const response = await fetch(url, {
      credentials: "omit",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    const text = await response.text();
    const payload = parseJson(text);
    const fixtureReason = fixturePayloadReason(payload);
    const unavailableReason = explicitUnavailableReason(payload);
    if (!response.ok) {
      return {
        state: "unavailable",
        url,
        statusCode: response.status,
        summary: `${probePath} returned ${response.status}.`,
        continueFallback: response.status === 404,
      };
    }
    if (fixtureReason) {
      return {
        state: "unavailable",
        url,
        statusCode: response.status,
        summary: `${probePath} returned fixture/demo state: ${fixtureReason}.`,
        continueFallback: false,
      };
    }
    if (unavailableReason) {
      return {
        state: "unavailable",
        url,
        statusCode: response.status,
        summary: `${probePath} returned unavailable state: ${unavailableReason}.`,
        continueFallback: false,
      };
    }
    const readyReason = explicitReadyReason(payload);
    if (!readyReason) {
      return {
        state: "unavailable",
        url,
        statusCode: response.status,
        summary: `${probePath} returned ${response.status} without owner readiness facts.`,
        continueFallback: false,
      };
    }
    return { state: "ready", url, statusCode: response.status, summary: `${probePath} returned ${response.status}: ${readyReason}.`, continueFallback: false };
  } catch (error) {
    return {
      state: "unavailable",
      url,
      summary: error instanceof Error ? error.message : String(error),
      continueFallback: true,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function parseJson(text: string) {
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function fixturePayloadReason(value: unknown): string | null {
  if (!isRecord(value)) return null;
  for (const key of ["source", "mode", "environment", "runtime_mode", "kind", "type"]) {
    const field = value[key];
    if (typeof field === "string" && /\b(demo|fixture)\b/i.test(field)) return `${key}=${field}`;
  }
  for (const key of ["demo", "fixture", "is_demo", "is_fixture"]) {
    if (value[key] === true) return `${key}=true`;
  }
  if (value.live === false) return "live=false";
  return null;
}

function explicitUnavailableReason(value: unknown): string | null {
  if (!isRecord(value)) return null;
  for (const key of ["status", "state", "readiness", "health"]) {
    const field = value[key];
    if (field === false) return `${key}=false`;
    if (typeof field === "string" && /^(blocked|down|error|failed|missing|not[-_ ]?ready|unavailable)$/i.test(field)) {
      return `${key}=${field}`;
    }
  }
  if (value.ready === false || value.healthy === false) {
    return value.ready === false ? "ready=false" : "healthy=false";
  }
  return null;
}

function explicitReadyReason(value: unknown): string | null {
  if (!isRecord(value)) return null;
  for (const key of ["status", "state", "readiness", "health"]) {
    const field = value[key];
    if (field === true) return `${key}=true`;
    if (typeof field === "string" && /^(ready|ok|healthy|available|up)$/i.test(field)) {
      return `${key}=${field}`;
    }
  }
  if (value.ready === true || value.healthy === true) {
    return value.ready === true ? "ready=true" : "healthy=true";
  }
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function endpointFor(id: RuntimeServiceId, config: RuntimeEndpointConfig) {
  return normalizeEndpoint(id === "core" ? config.coreEndpoint : config.harborEndpoint);
}

function normalizeEndpoint(value: string) {
  try {
    const parsed = new URL(value);
    const pathname = parsed.pathname.replace(/\/+$/, "");
    return `${parsed.origin}${pathname === "" ? "" : pathname}`;
  } catch {
    return value.replace(/\/+$/, "");
  }
}

function resolvePackagedRuntimePath(id: RuntimeServiceId, resourcesPath: string | undefined) {
  if (!resourcesPath) return null;
  const candidate = path.join(resourcesPath, "runtime", id, "start-runtime");
  return existsSync(candidate) ? candidate : null;
}

function getResourcesPath() {
  return (process as NodeJS.Process & { resourcesPath?: string }).resourcesPath;
}

function parseCommand(command: string) {
  const tokens = command.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g)?.map((token) => token.replace(/^["']|["']$/g, ""));
  if (!tokens?.length) return null;
  return { command: tokens[0], args: tokens.slice(1) };
}

function repairAction(
  id: RuntimeServiceId,
  launch: RuntimeServiceLaunchConfig | null,
  health: RuntimeProbe,
  admission: RuntimeProbe | undefined,
) {
  if (health.state === "ready" && (admission == null || admission.state === "ready")) {
    return `${serviceNames[id]} runtime is ready.`;
  }

  if (!launch) {
    return `Configure WEBENVOY_${id.toUpperCase()}_RUNTIME_CWD or WEBENVOY_${id.toUpperCase()}_RUNTIME_COMMAND, then restart App.`;
  }

  if (admission?.state === "unavailable") {
    return "Core health is not enough; expose a local admission readiness endpoint before enabling real tasks.";
  }

  return `Check ${serviceNames[id]} command (${launch.command}) and local readiness endpoint.`;
}
