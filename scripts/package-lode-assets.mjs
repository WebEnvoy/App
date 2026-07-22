import { spawnSync } from "node:child_process";
import { cp, mkdir, readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const outDir = path.resolve("dist-electron/lode");
const sourceLock = JSON.parse(await readFile(new URL("./runtime-source-lock.json", import.meta.url), "utf8"));
const sourceRoot = findLodeRoot();

await rm(outDir, { recursive: true, force: true });

if (!sourceRoot) {
  console.warn("Lode asset packaging skipped: no sibling Lode registry was found.");
  process.exit(0);
}

await mkdir(outDir, { recursive: true });
await copyJsonTree(path.join(sourceRoot, "registry"), path.join(outDir, "registry"));
await copyJsonTree(path.join(sourceRoot, "sites"), path.join(outDir, "sites"));

console.log(`Packaged Lode capability assets from ${sourceRoot} into ${outDir}`);

function findLodeRoot() {
  const candidates = [
    process.env.WEBENVOY_LODE_ASSETS_SOURCE_DIR,
    path.resolve("../Lode"),
    path.resolve("../../Lode"),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (!existsSync(path.join(candidate, "registry/local-packages.json"))) continue;
    if (isLockedCleanSource(candidate, sourceLock.lode, ["registry", "sites"])) return candidate;
    if (candidate === process.env.WEBENVOY_LODE_ASSETS_SOURCE_DIR) {
      throw new Error(`Lode source must be clean and pinned to ${sourceLock.lode}: ${candidate}`);
    }
  }
  return null;
}

function isLockedCleanSource(candidate, expectedHead, paths) {
  const head = spawnSync("git", ["rev-parse", "HEAD"], { cwd: candidate, encoding: "utf8" });
  const status = spawnSync("git", ["status", "--porcelain", "--untracked-files=all", "--", ...paths], {
    cwd: candidate,
    encoding: "utf8",
  });
  return head.status === 0 && head.stdout.trim() === expectedHead && status.status === 0 && status.stdout.trim() === "";
}

async function copyJsonTree(from, to) {
  if (!existsSync(from)) return;
  await cp(from, to, {
    recursive: true,
    filter: (source) => {
      const name = path.basename(source);
      return source === from || (!name.startsWith(".") && (!path.extname(source) || source.endsWith(".json")));
    },
  });
}
