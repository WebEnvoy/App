import { access, readFile } from "node:fs/promises";

const requiredFiles = [
  "dist-electron/main.js",
  "dist-electron/preload.js",
  "dist/renderer/index.html",
  "dist/renderer/assets",
];

for (const file of requiredFiles) {
  await access(file);
}

const mainSource = await readFile("dist-electron/main.js", "utf8");
const preloadSource = await readFile("dist-electron/preload.js", "utf8");
const rendererHtml = await readFile("dist/renderer/index.html", "utf8");

if (!mainSource.includes("webenvoy:shell-context")) {
  throw new Error("Electron main smoke failed: shell context IPC is missing.");
}

if (!preloadSource.includes("webenvoyShell")) {
  throw new Error("Preload smoke failed: shell bridge is missing.");
}

if (!rendererHtml.includes("WebEnvoy App")) {
  throw new Error("Renderer smoke failed: WebEnvoy title is missing.");
}

console.log("WebEnvoy desktop shell smoke passed.");
