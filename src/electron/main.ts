import { app, BrowserWindow, ipcMain, nativeTheme } from "electron";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createRuntimeSupervisor } from "./runtimeSupervisor.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rendererDevUrl = process.env.WEBENVOY_RENDERER_URL;
const packagedSmoke = process.env.WEBENVOY_PACKAGED_SMOKE === "1";
const packagedSmokeScreenshot = process.env.WEBENVOY_PACKAGED_SMOKE_SCREENSHOT;
const packagedSmokeRuntimeExpectation = process.env.WEBENVOY_PACKAGED_SMOKE_RUNTIME_EXPECTATION ?? "fail_closed";
const packagedSmokeCoreEndpoint = process.env.WEBENVOY_PACKAGED_SMOKE_CORE_ENDPOINT ?? "http://127.0.0.1:8787";
const packagedSmokeHarborEndpoint = process.env.WEBENVOY_PACKAGED_SMOKE_HARBOR_ENDPOINT ?? "http://127.0.0.1:8788";
const packagedSmokeLodeEndpoint = process.env.WEBENVOY_PACKAGED_SMOKE_LODE_ENDPOINT ?? "http://127.0.0.1:8789";
const packagedSmokeUserDataDir = process.env.WEBENVOY_PACKAGED_SMOKE_USER_DATA_DIR;
const localConnectionStorageKey = "webenvoy.localConnectionConfig.v1";
let runtimeSupervisor = createRuntimeSupervisor();
const mainWindows = new Set<BrowserWindow>();
type OwnerApiJsonRequest = {
  base?: unknown;
  path?: unknown;
  method?: unknown;
  body?: unknown;
};
const ownerApiAllowedHosts = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);
const sensitiveOwnerApiFragment =
  /\b(token|cookie|secret|bearer|profile|credential|password|authorization)\b|raw[\s_-]*evidence/i;

app.setName("WebEnvoy App");

if (packagedSmoke && packagedSmokeUserDataDir) {
  app.setPath("userData", packagedSmokeUserDataDir);
}

function getSystemColorScheme() {
  return nativeTheme.shouldUseDarkColors ? "dark" : "light";
}

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
    backgroundColor: getSystemColorScheme() === "dark" ? "#17191d" : "#f7f8fb",
    ...macWindowChrome,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  mainWindows.add(window);
  window.on("closed", () => {
    mainWindows.delete(window);
  });

  const loadRenderer = rendererDevUrl
    ? window.loadURL(rendererDevUrl)
    : window.loadFile(path.join(__dirname, "../dist/renderer/index.html"));
  revealMainWindow(window);

  if (packagedSmoke) {
    void runPackagedSmoke(window, loadRenderer);
  }

  return window;
}

function revealMainWindow(window: BrowserWindow) {
  const reveal = () => {
    if (window.isDestroyed()) return;
    window.show();
    window.focus();
    if (process.platform === "darwin") {
      app.focus({ steal: true });
    }
  };
  window.once("ready-to-show", reveal);
  window.webContents.once("did-finish-load", reveal);
  setTimeout(reveal, 500);
}

async function runPackagedSmoke(window: BrowserWindow, loadRenderer: Promise<void>) {
  try {
    await loadRenderer;
    await applyPackagedSmokeConnectionConfig(window);
    const result = (await window.webContents.executeJavaScript(`
      (async () => {
        const root = document.getElementById("root");
        const shell = window.webenvoyShell;
        const appShell = document.querySelector(".app-shell");
        const leftPanelButton = document.querySelector('[data-shell-panel-toggle="left"]');
        const rightPanelButton = document.querySelector('[data-shell-panel-toggle="right"]');
        const rightFullscreenButton = document.querySelector('[data-shell-panel-fullscreen="right"]');
        const panelButtons = [leftPanelButton, rightPanelButton].filter(Boolean);
        const composer = document.querySelector("[data-webenvoy-composer]");
        const runtimeGate = document.querySelector("[aria-label='Runtime supervisor status']");
        const waitUntil = async (predicate, attempts = 40, delayMs = 250) => {
          let latest = null;
          for (let attempt = 0; attempt < attempts; attempt += 1) {
            latest = predicate();
            if (latest) return latest;
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
          return latest;
        };
        const readRuntimeSupervisorState = async () => {
          if (!shell?.getRuntimeSupervisorState) return null;
          let latest = null;
          for (let attempt = 0; attempt < 12; attempt += 1) {
            latest = await shell.getRuntimeSupervisorState({
              coreEndpoint: ${JSON.stringify(packagedSmokeCoreEndpoint)},
              harborEndpoint: ${JSON.stringify(packagedSmokeHarborEndpoint)}
            });
            if (${JSON.stringify(packagedSmokeRuntimeExpectation)} !== "live_ready" || latest?.canUseLiveRuntime) return latest;
            await new Promise((resolve) => setTimeout(resolve, 750));
          }
          return latest;
        };
        const runtimeSupervisorState = await readRuntimeSupervisorState();
        const waitFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
        const readPanels = () => ({
          left: appShell?.getAttribute("data-left-panel-open"),
          right: appShell?.getAttribute("data-right-panel-open"),
          rightFullscreen: appShell?.getAttribute("data-right-panel-fullscreen"),
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
        rightFullscreenButton?.click();
        await waitFrame();
        const rightFullscreen = readPanels();
        rightFullscreenButton?.click();
        await waitFrame();
        const rightFullscreenRestored = readPanels();
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
        const deviceScale = window.devicePixelRatio || 1;
        const leftHandleAfterRestore = document.querySelector(".left-panel-resizer .resize-handle-right");
        const leftStayOpenDragDistance = -(leftRestored.leftWidth - 180) * deviceScale;
        const leftStayOpenDragStarted = await dragHandle(
          leftHandleAfterRestore,
          leftStayOpenDragDistance
        );
        const leftDragStayedOpen = readPanels();
        const leftCollapseDragDistance = -(leftDragStayedOpen.leftWidth - 96) * deviceScale;
        const leftDragStarted = await dragHandle(leftHandleAfterRestore, leftCollapseDragDistance);
        const leftDragCollapsed = readPanels();
        if (leftDragCollapsed.left === "false") {
          leftPanelButton?.click();
          await waitFrame();
        }
        const leftAfterDragRestore = readPanels();
        const rightHandleAfterLeftRestore = document.querySelector(".right-panel-resizer .resize-handle-left");
        const rightStayOpenDragDistance = (leftAfterDragRestore.rightWidth - 220) * deviceScale;
        const rightStayOpenDragStarted = await dragHandle(
          rightHandleAfterLeftRestore,
          rightStayOpenDragDistance
        );
        const rightDragStayedOpen = readPanels();
        const rightCollapseDragDistance = (rightDragStayedOpen.rightWidth - 140) * deviceScale;
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
          hasRuntimeSupervisorApi: typeof shell?.getRuntimeSupervisorState === "function",
          shellContext: shell?.getShellContext ? await shell.getShellContext() : null,
          runtimeSupervisorState,
          hasRuntimeGate: Boolean(runtimeGate),
          runtimeGateText: runtimeGate?.textContent ?? "",
          panelControls: panelButtons.length,
          hasComposer: Boolean(composer),
          composerFocused,
          panelToggleSmoke:
            initialPanels.left === "true" &&
            initialPanels.right === "true" &&
            rightCollapsed.right === "false" &&
            rightRestored.right === "true" &&
            rightFullscreen.right === "true" &&
            rightFullscreen.rightFullscreen === "true" &&
            rightFullscreen.left === initialPanels.left &&
            rightFullscreen.leftWidth === initialPanels.leftWidth &&
            rightFullscreenRestored.rightFullscreen === "false" &&
            leftCollapsed.left === "false" &&
            leftHoverPreviewVisible &&
            leftRestored.left === "true",
          panelDragSmoke:
            leftStayOpenDragStarted &&
            leftDragStarted &&
            rightStayOpenDragStarted &&
            rightDragStarted &&
            leftDragStayedOpen.left === "true" &&
            leftDragCollapsed.left === "false" &&
            rightDragStayedOpen.right === "true" &&
            rightDragCollapsed.right === "false" &&
            leftAfterDragRestore.left === "true" &&
            dragRestored.left === "true" &&
            dragRestored.right === "true",
          panelStateTrace: {
            initialPanels,
            rightCollapsed,
            rightRestored,
            rightFullscreen,
            rightFullscreenRestored,
            leftCollapsed,
            leftHoverPreviewVisible,
            leftRestored,
            leftDragStayedOpen,
            leftDragCollapsed,
            leftAfterDragRestore,
            rightDragStayedOpen,
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
      hasRuntimeSupervisorApi: boolean;
      shellContext: unknown;
      runtimeSupervisorState: {
        canUseLiveRuntime?: boolean;
        failClosed?: boolean;
        services?: { id: string; health?: { state?: string }; admission?: { state?: string } }[];
        lodeAssets?: { state?: string; packageCount?: number };
      } | null;
      hasRuntimeGate: boolean;
      runtimeGateText: string;
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

    if (!result.hasRuntimeSupervisorApi || !result.hasRuntimeGate || result.runtimeSupervisorState === null) {
      throw new Error("packaged renderer smoke failed: runtime supervisor bridge or gate is missing.");
    }

    if (
      packagedSmokeRuntimeExpectation === "live_ready" &&
      (!result.runtimeSupervisorState.canUseLiveRuntime ||
        result.runtimeSupervisorState.lodeAssets?.state !== "ready" ||
        result.runtimeSupervisorState.services?.some((service) => service.health?.state !== "ready") ||
        result.runtimeSupervisorState.services?.some((service) => service.id === "core" && service.admission?.state !== "ready"))
    ) {
      throw new Error(
        `packaged renderer smoke failed: runtime supervisor did not reach live_ready. ${JSON.stringify(result.runtimeSupervisorState)}`,
      );
    }

    if (
      packagedSmokeRuntimeExpectation !== "live_ready" &&
      (!result.runtimeSupervisorState.failClosed || !result.runtimeGateText.includes("生产运行已阻断"))
    ) {
      throw new Error("packaged renderer smoke failed: runtime supervisor fail-closed gate is missing.");
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
        `packaged renderer smoke failed: panel drag thresholds did not match Codex behavior. ${JSON.stringify(result.panelStateTrace)}`,
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

async function applyPackagedSmokeConnectionConfig(window: BrowserWindow) {
  const connectionConfig = JSON.stringify({
    coreEndpoint: packagedSmokeCoreEndpoint,
    harborEndpoint: packagedSmokeHarborEndpoint,
    lodeEndpoint: packagedSmokeLodeEndpoint,
  });
  await window.webContents.executeJavaScript(
    `window.localStorage.setItem(${JSON.stringify(localConnectionStorageKey)}, ${JSON.stringify(connectionConfig)})`,
  );
  await reloadWindow(window);
}

function reloadWindow(window: BrowserWindow) {
  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      window.webContents.off("did-finish-load", didFinishLoad);
      window.webContents.off("did-fail-load", didFailLoad);
    };
    const didFinishLoad = () => {
      cleanup();
      resolve();
    };
    const didFailLoad = (_event: Electron.Event, _errorCode: number, errorDescription: string) => {
      cleanup();
      reject(new Error(`packaged smoke renderer reload failed: ${errorDescription}`));
    };
    window.webContents.once("did-finish-load", didFinishLoad);
    window.webContents.once("did-fail-load", didFailLoad);
    window.webContents.reload();
  });
}

app.whenReady().then(() => {
  runtimeSupervisor = createRuntimeSupervisor({ dataDir: path.join(app.getPath("userData"), "runtime") });
  ipcMain.handle("webenvoy:shell-context", () => ({
    platform: process.platform,
    colorScheme: getSystemColorScheme(),
    configScope: "local-ui-only",
  }));
  ipcMain.handle("webenvoy:runtime-supervisor-state", (_event, config) =>
    runtimeSupervisor.readState(config),
  );
  ipcMain.handle("webenvoy:owner-api-json", (_event, request) =>
    requestOwnerApiJson(request),
  );

  nativeTheme.on("updated", () => {
    const colorScheme = getSystemColorScheme();
    for (const window of BrowserWindow.getAllWindows()) {
      window.webContents.send("webenvoy:system-theme-variant", colorScheme);
    }
  });

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

app.on("before-quit", () => {
  runtimeSupervisor.stop();
});

async function requestOwnerApiJson(request: OwnerApiJsonRequest) {
  const parsed = parseOwnerApiRequest(request);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(parsed.url, {
      method: parsed.method,
      credentials: "omit",
      headers: {
        Accept: "application/json",
        ...(parsed.body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      ...(parsed.body === undefined ? {} : { body: JSON.stringify(parsed.body) }),
      signal: controller.signal,
    });
    const text = await response.text();
    const json = parseJson(text);
    if (!response.ok) {
      return { ok: false, status: response.status, error: `${parsed.path} returned ${response.status}`, body: json };
    }
    return { ok: true, status: response.status, body: json ?? {} };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timeout);
  }
}

function parseOwnerApiRequest(request: OwnerApiJsonRequest):
  | { ok: true; url: string; path: string; method: "GET" | "POST" | "PATCH" | "DELETE"; body?: unknown }
  | { ok: false; error: string } {
  if (typeof request?.base !== "string" || typeof request.path !== "string") {
    return { ok: false, error: "Owner API request requires base and path strings." };
  }
  const method = ownerApiMethod(request.method);
  if (!method) return { ok: false, error: "Owner API method is not allowed." };
  if (!request.path.startsWith("/") || request.path.startsWith("//")) {
    return { ok: false, error: "Owner API path must be an absolute local path." };
  }
  if (sensitiveOwnerApiFragment.test(request.base) || sensitiveOwnerApiFragment.test(request.path)) {
    return { ok: false, error: "Owner API URL cannot include sensitive fragments." };
  }

  let baseUrl: URL;
  try {
    baseUrl = new URL(request.base);
  } catch {
    return { ok: false, error: "Owner API base must be a valid URL." };
  }
  if (baseUrl.protocol !== "http:") {
    return { ok: false, error: "Owner API base must use http on the local machine." };
  }
  if (!ownerApiAllowedHosts.has(baseUrl.hostname)) {
    return { ok: false, error: "Owner API host must be localhost or loopback." };
  }
  if (baseUrl.username || baseUrl.password || baseUrl.search || baseUrl.hash) {
    return { ok: false, error: "Owner API base cannot include credentials, query, or hash." };
  }

  const url = new URL(request.path, `${baseUrl.origin}${baseUrl.pathname.replace(/\/+$/, "")}/`);
  if (url.origin !== baseUrl.origin) {
    return { ok: false, error: "Owner API path must stay on the configured local origin." };
  }
  return {
    ok: true,
    url: url.toString(),
    path: `${url.pathname}${url.search}`,
    method,
    ...(request.body === undefined ? {} : { body: request.body }),
  };
}

function ownerApiMethod(value: unknown): "GET" | "POST" | "PATCH" | "DELETE" | null {
  if (value === undefined) return "GET";
  return value === "GET" || value === "POST" || value === "PATCH" || value === "DELETE" ? value : null;
}

function parseJson(text: string) {
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}
