import { app, BrowserWindow, ipcMain, nativeTheme } from "electron";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rendererDevUrl = process.env.WEBENVOY_RENDERER_URL;
const packagedSmoke = process.env.WEBENVOY_PACKAGED_SMOKE === "1";
const packagedSmokeScreenshot = process.env.WEBENVOY_PACKAGED_SMOKE_SCREENSHOT;

function createMainWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    title: "WebEnvoy App",
    backgroundColor: nativeTheme.shouldUseDarkColors ? "#17191d" : "#f7f8fb",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const loadRenderer = rendererDevUrl
    ? window.loadURL(rendererDevUrl)
    : window.loadFile(path.join(__dirname, "../dist/renderer/index.html"));

  if (packagedSmoke) {
    void runPackagedSmoke(window, loadRenderer);
  }

  return window;
}

async function runPackagedSmoke(window: BrowserWindow, loadRenderer: Promise<void>) {
  try {
    await loadRenderer;
    const result = (await window.webContents.executeJavaScript(`
      (async () => {
        const root = document.getElementById("root");
        const shell = window.webenvoyShell;
        return {
          hasRoot: Boolean(root),
          rootChildCount: root?.childElementCount ?? 0,
          rootTextLength: root?.textContent?.trim().length ?? 0,
          hasPreload: typeof shell?.getShellContext === "function",
          shellContext: shell?.getShellContext ? await shell.getShellContext() : null
        };
      })();
    `)) as {
      hasRoot: boolean;
      rootChildCount: number;
      rootTextLength: number;
      hasPreload: boolean;
      shellContext: unknown;
    };

    if (!result.hasRoot || result.rootChildCount === 0 || result.rootTextLength === 0) {
      throw new Error("packaged renderer smoke failed: #root is blank.");
    }

    if (!result.hasPreload || result.shellContext === null) {
      throw new Error("packaged renderer smoke failed: preload was not injected.");
    }

    if (packagedSmokeScreenshot) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      await mkdir(path.dirname(packagedSmokeScreenshot), { recursive: true });
      const image = await window.webContents.capturePage();
      const pixels = image.toBitmap();
      const firstPixel = pixels.subarray(0, 4).toString("hex");
      let hasDifferentPixel = false;

      for (let offset = 4; offset < pixels.length; offset += 4) {
        if (pixels.subarray(offset, offset + 4).toString("hex") !== firstPixel) {
          hasDifferentPixel = true;
          break;
        }
      }

      if (!hasDifferentPixel) {
        throw new Error("packaged renderer smoke failed: captured preview is blank.");
      }

      await writeFile(packagedSmokeScreenshot, image.toPNG());
    }

    console.log(`WEBSMOKE_RESULT ${JSON.stringify(result)}`);
    app.exit(0);
  } catch (error) {
    console.error(error);
    app.exit(1);
  }
}

app.whenReady().then(() => {
  ipcMain.handle("webenvoy:shell-context", () => ({
    platform: process.platform,
    colorScheme: nativeTheme.shouldUseDarkColors ? "dark" : "light",
    configScope: "local-ui-only",
  }));

  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
