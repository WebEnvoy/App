import { contextBridge, ipcRenderer } from "electron";

type WebEnvoyShellContext = {
  platform: NodeJS.Platform;
  colorScheme: "light" | "dark";
  configScope: "local-ui-only";
};
type WebEnvoyColorScheme = WebEnvoyShellContext["colorScheme"];

const shellApi = {
  getShellContext: () =>
    ipcRenderer.invoke("webenvoy:shell-context") as Promise<WebEnvoyShellContext>,
  subscribeToSystemThemeVariant: (listener: (colorScheme: WebEnvoyColorScheme) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, colorScheme: WebEnvoyColorScheme) => {
      listener(colorScheme);
    };
    ipcRenderer.on("webenvoy:system-theme-variant", handler);
    return () => {
      ipcRenderer.off("webenvoy:system-theme-variant", handler);
    };
  },
};

contextBridge.exposeInMainWorld("webenvoyShell", shellApi);
