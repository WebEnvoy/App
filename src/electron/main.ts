import { app, BrowserWindow, ipcMain, nativeTheme } from "electron";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rendererDevUrl = process.env.WEBENVOY_RENDERER_URL;
const packagedSmoke = process.env.WEBENVOY_PACKAGED_SMOKE === "1";
const packagedSmokeScreenshot = process.env.WEBENVOY_PACKAGED_SMOKE_SCREENSHOT;

function createMainWindow() {
  const macWindowChrome =
    process.platform === "darwin"
      ? {
          titleBarStyle: "hiddenInset" as const,
          trafficLightPosition: { x: 16, y: 16 },
        }
      : {};

  const window = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    title: "WebEnvoy App",
    backgroundColor: nativeTheme.shouldUseDarkColors ? "#17191d" : "#f7f8fb",
    ...macWindowChrome,
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
        const appShell = document.querySelector(".app-shell");
        const leftPanelButton = document.querySelector('[data-shell-panel-toggle="left"]');
        const rightPanelButton = document.querySelector('[data-shell-panel-toggle="right"]');
        const panelButtons = [leftPanelButton, rightPanelButton].filter(Boolean);
        const composer = document.querySelector("[data-webenvoy-composer]");
        const waitFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
        const readPanels = () => ({
          left: appShell?.getAttribute("data-left-panel-open"),
          right: appShell?.getAttribute("data-right-panel-open"),
          leftWidth: Number(appShell?.getAttribute("data-left-panel-width") ?? 0),
          rightWidth: Number(appShell?.getAttribute("data-right-panel-width") ?? 0)
        });
        const dragHandle = async (handle, deltaX) => {
          if (!handle) return false;
          const rect = handle.getBoundingClientRect();
          const pointer = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
          handle.dispatchEvent(new PointerEvent("pointerdown", {
            bubbles: true,
            button: 0,
            clientX: pointer.x,
            clientY: pointer.y,
            pointerId: 1
          }));
          await waitFrame();
          window.dispatchEvent(new PointerEvent("pointermove", {
            bubbles: true,
            clientX: pointer.x + deltaX,
            clientY: pointer.y,
            pointerId: 1
          }));
          window.dispatchEvent(new PointerEvent("pointerup", {
            bubbles: true,
            clientX: pointer.x + deltaX,
            clientY: pointer.y,
            pointerId: 1
          }));
          await waitFrame();
          return true;
        };
        const initialPanels = readPanels();
        rightPanelButton?.click();
        await waitFrame();
        const rightCollapsed = readPanels();
        rightPanelButton?.click();
        await waitFrame();
        const rightRestored = readPanels();
        leftPanelButton?.click();
        await waitFrame();
        const leftCollapsed = readPanels();
        const leftRevealZone = document.querySelector(".left-panel-reveal-zone");
        leftRevealZone?.dispatchEvent(new PointerEvent("pointerover", {
          bubbles: true,
          clientX: 2,
          clientY: 64,
          pointerId: 2
        }));
        await waitFrame();
        const leftHoverPreviewVisible = Boolean(
          document.querySelector("[data-floating-left-panel]")
        );
        leftPanelButton?.click();
        await waitFrame();
        const leftRestored = readPanels();
        composer?.focus();
        await waitFrame();
        const composerFocused = document.activeElement === composer;
        const leftHandleAfterRestore = document.querySelector(".left-panel-resizer .resize-handle-right");
        const leftDragStarted = await dragHandle(leftHandleAfterRestore, -90);
        const leftDragCollapsed = readPanels();
        if (leftDragCollapsed.left === "false") {
          leftPanelButton?.click();
          await waitFrame();
        }
        const leftAfterDragRestore = readPanels();
        const rightHandleAfterLeftRestore = document.querySelector(".right-panel-resizer .resize-handle-left");
        const rightCollapseDragDistance =
          Math.max(360, leftAfterDragRestore.rightWidth - 280) * (window.devicePixelRatio || 1);
        const rightDragStarted = await dragHandle(
          rightHandleAfterLeftRestore,
          rightCollapseDragDistance
        );
        const rightDragCollapsed = readPanels();
        if (rightDragCollapsed.right === "false") {
          rightPanelButton?.click();
          await waitFrame();
        }
        const dragRestored = readPanels();
        return {
          hasRoot: Boolean(root),
          rootChildCount: root?.childElementCount ?? 0,
          rootTextLength: root?.textContent?.trim().length ?? 0,
          hasPreload: typeof shell?.getShellContext === "function",
          shellContext: shell?.getShellContext ? await shell.getShellContext() : null,
          panelControls: panelButtons.length,
          hasComposer: Boolean(composer),
          composerFocused,
          panelToggleSmoke:
            initialPanels.left === "true" &&
            initialPanels.right === "true" &&
            rightCollapsed.right === "false" &&
            rightRestored.right === "true" &&
            leftCollapsed.left === "false" &&
            leftHoverPreviewVisible &&
            leftRestored.left === "true",
          panelDragSmoke:
            leftDragStarted &&
            rightDragStarted &&
            leftDragCollapsed.left === "false" &&
            rightDragCollapsed.right === "false" &&
            leftAfterDragRestore.left === "true" &&
            dragRestored.left === "true" &&
            dragRestored.right === "true",
          panelStateTrace: {
            initialPanels,
            rightCollapsed,
            rightRestored,
            leftCollapsed,
            leftHoverPreviewVisible,
            leftRestored,
            leftDragCollapsed,
            leftAfterDragRestore,
            rightDragCollapsed,
            dragRestored
          }
        };
      })();
    `)) as {
      hasRoot: boolean;
      rootChildCount: number;
      rootTextLength: number;
      hasPreload: boolean;
      shellContext: unknown;
      panelControls: number;
      hasComposer: boolean;
      composerFocused: boolean;
      panelToggleSmoke: boolean;
      panelDragSmoke: boolean;
      panelStateTrace: unknown;
    };

    if (!result.hasRoot || result.rootChildCount === 0 || result.rootTextLength === 0) {
      throw new Error("packaged renderer smoke failed: #root is blank.");
    }

    if (!result.hasPreload || result.shellContext === null) {
      throw new Error("packaged renderer smoke failed: preload was not injected.");
    }

    if (result.panelControls < 2 || !result.panelToggleSmoke) {
      throw new Error(
        `packaged renderer smoke failed: panel controls did not toggle. ${JSON.stringify(result.panelStateTrace)}`,
      );
    }

    if (!result.hasComposer || !result.composerFocused) {
      throw new Error("packaged renderer smoke failed: composer is missing or cannot receive focus.");
    }

    if (!result.panelDragSmoke) {
      throw new Error(
        `packaged renderer smoke failed: panel drag thresholds did not collapse. ${JSON.stringify(result.panelStateTrace)}`,
      );
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
