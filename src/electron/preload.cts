import { contextBridge, ipcRenderer } from "electron";

type WebEnvoyShellContext = {
  platform: NodeJS.Platform;
  colorScheme: "light" | "dark";
  configScope: "local-ui-only";
};
type WebEnvoyColorScheme = WebEnvoyShellContext["colorScheme"];
type RuntimeEndpointConfig = {
  coreEndpoint: string;
  harborEndpoint: string;
};

const shellApi = {
  getShellContext: () =>
    ipcRenderer.invoke("webenvoy:shell-context") as Promise<WebEnvoyShellContext>,
  getRuntimeSupervisorState: (config: RuntimeEndpointConfig) =>
    ipcRenderer.invoke("webenvoy:runtime-supervisor-state", config),
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
