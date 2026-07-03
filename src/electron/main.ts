import { app, BrowserWindow, ipcMain, nativeTheme } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rendererDevUrl = process.env.WEBENVOY_RENDERER_URL;

function createMainWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    title: "WebEnvoy App",
    backgroundColor: nativeTheme.shouldUseDarkColors ? "#17191d" : "#f7f8fb",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (rendererDevUrl) {
    void window.loadURL(rendererDevUrl);
  } else {
    void window.loadFile(path.join(__dirname, "../dist/renderer/index.html"));
  }

  return window;
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
