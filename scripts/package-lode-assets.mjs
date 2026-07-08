import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const outDir = path.resolve("dist-electron/lode");
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

  return candidates.find((candidate) => existsSync(path.join(candidate, "registry/local-packages.json")));
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
