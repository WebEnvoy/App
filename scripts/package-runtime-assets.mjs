import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const outRoot = path.resolve("dist-electron/runtime");
const coreRoot = findRoot("WEBENVOY_CORE_RUNTIME_SOURCE_DIR", ["../WebEnvoy", "../../WebEnvoy"], "packages/api-server/package.json");
const harborRoot = findRoot("WEBENVOY_HARBOR_RUNTIME_SOURCE_DIR", ["../Harbor", "../../Harbor"], "packages/runtime-api/src/runtime-server.ts");

await rm(outRoot, { recursive: true, force: true });
await mkdir(outRoot, { recursive: true });

if (coreRoot) {
  buildRuntime(coreRoot, "Core");
  await packageCoreRuntime(coreRoot, path.join(outRoot, "core"));
} else {
  console.warn("Core runtime packaging skipped: no sibling WebEnvoy/Core repository was found.");
}

if (harborRoot) {
  buildRuntime(harborRoot, "Harbor");
  await packageHarborRuntime(harborRoot, path.join(outRoot, "harbor"));
} else {
  console.warn("Harbor runtime packaging skipped: no sibling Harbor repository was found.");
}

async function packageCoreRuntime(sourceRoot, outDir) {
  await mkdir(path.join(outDir, "node_modules", "@webenvoy"), { recursive: true });
  await copyPackage(path.join(sourceRoot, "packages", "api-server"), path.join(outDir, "node_modules", "@webenvoy", "api-server"));
  await copyPackage(path.join(sourceRoot, "packages", "core"), path.join(outDir, "node_modules", "@webenvoy", "core-runtime"));
  await writeFile(path.join(outDir, "start-runtime.mjs"), coreStartScript());
  console.log(`Packaged Core runtime from ${sourceRoot} into ${outDir}`);
}

async function packageHarborRuntime(sourceRoot, outDir) {
  await mkdir(outDir, { recursive: true });
  await cp(path.join(sourceRoot, "dist"), path.join(outDir, "dist"), { recursive: true });
  await writeFile(path.join(outDir, "start-runtime.mjs"), harborStartScript());
  console.log(`Packaged Harbor runtime from ${sourceRoot} into ${outDir}`);
}

async function copyPackage(from, to) {
  await mkdir(to, { recursive: true });
  await cp(path.join(from, "dist"), path.join(to, "dist"), { recursive: true });
  await cp(path.join(from, "package.json"), path.join(to, "package.json"));
}

function buildRuntime(cwd, name) {
  const result = spawnSync("pnpm", ["build"], { cwd, stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`${name} runtime build failed with status ${result.status ?? "unknown"}.`);
  }
}

function findRoot(envName, candidates, requiredPath) {
  const roots = [process.env[envName], ...candidates.map((candidate) => path.resolve(candidate))].filter(Boolean);
  return roots.find((candidate) => existsSync(path.join(candidate, requiredPath))) ?? null;
}

function coreStartScript() {
  return `import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { createApiServer } from "@webenvoy/api-server";
import { createFileRunRecordStore, createHttpHarborRuntimeClient, createLocalLodePackageResolver } from "@webenvoy/core-runtime";

const host = process.env.WEBENVOY_CORE_RUNTIME_HOST ?? "127.0.0.1";
const port = parsePort(process.env.PORT ?? process.env.WEBENVOY_CORE_RUNTIME_PORT, 8787);
const runtimeDataDir = process.env.WEBENVOY_RUNTIME_DATA_DIR ?? join(process.cwd(), "data");
const runRecordDir = process.env.WEBENVOY_RUN_RECORD_DIR ?? join(runtimeDataDir, "core-runs");
mkdirSync(runRecordDir, { recursive: true });

const server = createApiServer({
  runRecordStore: createFileRunRecordStore({ directory: runRecordDir }),
  ...(process.env.WEBENVOY_LODE_REGISTRY_PATH ? {
    lodePackageResolver: createLocalLodePackageResolver({
      registryPath: process.env.WEBENVOY_LODE_REGISTRY_PATH,
      ...(process.env.WEBENVOY_LODE_ASSETS_PATH ? { rootDir: process.env.WEBENVOY_LODE_ASSETS_PATH } : {})
    })
  } : {}),
  ...(process.env.WEBENVOY_HARBOR_RUNTIME_URL ? {
    harborRuntimeClient: createHttpHarborRuntimeClient({ baseUrl: process.env.WEBENVOY_HARBOR_RUNTIME_URL })
  } : {})
});

server.listen(port, host, () => {
  console.log(JSON.stringify({ service: "webenvoy-api-server", status: "ready", url: \`http://\${host}:\${port}\`, run_record_store: "configured" }));
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => server.close(() => process.exit(0)));
}

function parsePort(value, fallback) {
  const port = Number(value ?? fallback);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) throw new Error("Runtime port must be 1-65535.");
  return port;
}
`;
}

function harborStartScript() {
  return `import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { HarborRuntime } from "./dist/packages/runtime-api/src/index.js";
import { startHarborRuntimeServer } from "./dist/packages/runtime-api/src/server.js";

const host = process.env.HARBOR_RUNTIME_HOST ?? "127.0.0.1";
const port = parsePort(process.env.HARBOR_RUNTIME_PORT ?? process.env.PORT, 8788);
const runtimeDataDir = process.env.WEBENVOY_RUNTIME_DATA_DIR ?? join(process.cwd(), "data");
const identityStore = process.env.HARBOR_IDENTITY_ENVIRONMENTS_PATH ?? join(runtimeDataDir, "harbor", "identity-environments.json");
mkdirSync(dirname(identityStore), { recursive: true });

const runtime = new HarborRuntime(undefined, { persistence_path: identityStore });
const running = await startHarborRuntimeServer({ host, port, runtime });
console.log(JSON.stringify({ service: "harbor-runtime-api", status: "ready", url: running.url, identity_environment_store: "configured" }));

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, async () => {
    await running.close();
    process.exit(0);
  });
}

function parsePort(value, fallback) {
  const port = Number(value ?? fallback);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) throw new Error("Runtime port must be 1-65535.");
  return port;
}
`;
}
