import { spawn } from "node:child_process";
import { createServer } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { app, BrowserWindow } from "electron";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const viteBin = path.join(root, "node_modules/vite/bin/vite.js");
const nodeBin = process.env.npm_node_execpath ?? "node";
app.commandLine.appendSwitch("force-prefers-reduced-motion");
const electronReady = app.whenReady();
let vite;
let window;

function stage(message) {
  process.stderr.write(`[workbench-dom] ${message}\n`);
}

function withTimeout(promise, label, timeoutMs = 30_000) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms.`)), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function availablePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

async function waitForVite(url, stderr) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (vite.exitCode != null) throw new Error(`Vite exited early.\n${stderr()}`);
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Vite is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for ${url}.\n${stderr()}`);
}

async function run() {
  stage("waiting for Electron ready");
  await withTimeout(electronReady, "Electron ready", 10_000);
  stage("reserving port");
  const port = await availablePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  let viteStderr = "";
  vite = spawn(nodeBin, [viteBin, "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
    cwd: root,
    env: process.env,
    stdio: ["ignore", "ignore", "pipe"],
  });
  vite.stderr.setEncoding("utf8");
  vite.stderr.on("data", (chunk) => { viteStderr += chunk; });
  stage(`starting Vite on ${port}`);
  await withTimeout(waitForVite(baseUrl, () => viteStderr), "Vite startup");
  stage("creating BrowserWindow");

  window = new BrowserWindow({
    show: false,
    width: 1200,
    height: 900,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });
  stage("BrowserWindow created");
  stage("loading harness");
  await withTimeout(
    window.loadURL(`${baseUrl}/tests/renderer/workbench-dom.html`),
    "Workbench harness load",
  );

  stage("running desktop checks");
  const desktop = await withTimeout(
    window.webContents.executeJavaScript("window.__runWorkbenchDomSmoke('desktop')", true),
    "Desktop DOM checks",
  );
  stage("resizing to 720x900");
  window.setContentSize(720, 900);
  await new Promise((resolve) => setTimeout(resolve, 100));
  const narrow = await withTimeout(
    window.webContents.executeJavaScript("window.__runWorkbenchDomSmoke('narrow')", true),
    "Narrow DOM checks",
  );
  stage("checks passed");
  process.stdout.write(`${JSON.stringify({ desktop, narrow }, null, 2)}\n`);
}

async function cleanup(exitCode) {
  if (window && !window.isDestroyed()) {
    window.destroy();
  }
  if (vite && vite.exitCode == null) {
    vite.kill("SIGTERM");
    await Promise.race([
      new Promise((resolve) => vite.once("exit", resolve)),
      new Promise((resolve) => setTimeout(resolve, 1_000)),
    ]);
    if (vite.exitCode == null) vite.kill("SIGKILL");
  }
  app.exit(exitCode);
}

void withTimeout(run(), "Electron DOM smoke", 45_000)
  .then(() => cleanup(0))
  .catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
    return cleanup(1);
  });
