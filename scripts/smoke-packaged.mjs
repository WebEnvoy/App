import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import electron from "electron";

const screenshotPath = path.resolve("artifacts/gh-168-packaged-preview.png");
await mkdir(path.dirname(screenshotPath), { recursive: true });

const child = spawn(electron, ["dist-electron/main.js"], {
  env: {
    ...process.env,
    WEBENVOY_PACKAGED_SMOKE: "1",
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
  throw new Error(`Packaged Electron smoke failed.\n${stderr || stdout}`);
}

const resultLine = stdout
  .split("\n")
  .find((line) => line.startsWith("WEBSMOKE_RESULT "));

if (!resultLine) {
  throw new Error("Packaged Electron smoke failed: result line is missing.");
}

const result = JSON.parse(resultLine.slice("WEBSMOKE_RESULT ".length));

if (!result.hasPreload || result.rootChildCount === 0 || result.rootTextLength === 0) {
  throw new Error(`Packaged Electron smoke failed: ${JSON.stringify(result)}`);
}

console.log(`Packaged Electron smoke passed. Screenshot: ${screenshotPath}`);
