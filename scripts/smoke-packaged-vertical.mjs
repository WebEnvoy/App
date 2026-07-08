import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import electron from "electron";

const screenshotPath = path.resolve(
  process.env.WEBENVOY_PACKAGED_VERTICAL_SMOKE_SCREENSHOT ?? "artifacts/app-261-packaged-vertical-smoke.png",
);

const core = await startJsonServer((pathname) => {
  if (["/health", "/ready", "/runtime/health", "/admission/health", "/admission/ready", "/tasks/admission/health"].includes(pathname)) {
    return {
      service: "webenvoy-core-smoke",
      status: "ready",
      evidence_boundary: "local owner-shaped smoke only; no real site, account, profile, Cookie, submit, publish, or send action",
    };
  }

  return {
    ok: true,
    result_ref: "core:smoke/app-261/result-ref",
    evidence_refs: ["harbor:evidence/app-261/local-smoke"],
  };
});
const harbor = await startJsonServer((pathname) => {
  if (["/health", "/ready", "/runtime/health"].includes(pathname)) {
    return {
      service: "webenvoy-harbor-smoke",
      status: "ready",
      provider_detection_ref: "harbor:provider-detection/app-261/local-smoke",
      evidence_ref: "harbor:evidence/app-261/local-smoke",
      evidence_boundary: "local owner-shaped smoke only; no provider launch, profile use, or production page access",
    };
  }

  return {
    ok: true,
    session_ref: "harbor:runtime-session/app-261/local-smoke",
    evidence_refs: ["harbor:evidence/app-261/local-smoke"],
  };
});

try {
  await mkdir(path.dirname(screenshotPath), { recursive: true });

  const result = await runElectronSmoke({
    coreEndpoint: core.endpoint,
    harborEndpoint: harbor.endpoint,
    screenshotPath,
  });

  if (!result.runtimeSupervisorState?.canUseLiveRuntime) {
    throw new Error(`Packaged vertical smoke failed: live runtime gate was not ready. ${JSON.stringify(result.runtimeSupervisorState)}`);
  }

  if (result.runtimeSupervisorState.lodeAssets?.state !== "ready" || result.runtimeSupervisorState.lodeAssets.packageCount < 6) {
    throw new Error(`Packaged vertical smoke failed: Lode assets were not packaged. ${JSON.stringify(result.runtimeSupervisorState.lodeAssets)}`);
  }

  console.log(
    [
      "Packaged vertical smoke passed.",
      `Core endpoint: ${core.endpoint}`,
      `Harbor endpoint: ${harbor.endpoint}`,
      `Lode asset source: ${result.runtimeSupervisorState.lodeAssets.source}`,
      `Screenshot: ${screenshotPath}`,
      "Boundary: local owner-shaped health/admission/evidence refs only; no real account/profile/Cookie/production page and no submit/publish/send.",
    ].join("\n"),
  );
} finally {
  await core.close();
  await harbor.close();
}

async function runElectronSmoke({ coreEndpoint, harborEndpoint, screenshotPath }) {
  const child = spawn(electron, ["dist-electron/main.js"], {
    env: {
      ...process.env,
      WEBENVOY_PACKAGED_SMOKE: "1",
      WEBENVOY_PACKAGED_SMOKE_RUNTIME_EXPECTATION: "live_ready",
      WEBENVOY_PACKAGED_SMOKE_CORE_ENDPOINT: coreEndpoint,
      WEBENVOY_PACKAGED_SMOKE_HARBOR_ENDPOINT: harborEndpoint,
      WEBENVOY_PACKAGED_SMOKE_SCREENSHOT: screenshotPath,
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
    throw new Error(`Packaged vertical Electron smoke failed.\n${stderr || stdout}`);
  }

  const resultLine = stdout
    .split("\n")
    .find((line) => line.startsWith("WEBSMOKE_RESULT "));

  if (!resultLine) {
    throw new Error("Packaged vertical Electron smoke failed: result line is missing.");
  }

  return JSON.parse(resultLine.slice("WEBSMOKE_RESULT ".length));
}

async function startJsonServer(bodyForPath) {
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    response.writeHead(200, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    });
    response.end(`${JSON.stringify(bodyForPath(url.pathname))}\n`);
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
