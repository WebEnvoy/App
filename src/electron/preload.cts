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
type OwnerApiJsonRequest = {
  base: string;
  path: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
};
type ManualAuthenticationCompletionIntent = {
  base: string;
  runtimeSessionRef: string;
};

const shellApi = {
  getShellContext: () =>
    ipcRenderer.invoke("webenvoy:shell-context") as Promise<WebEnvoyShellContext>,
  getRuntimeSupervisorState: (config: RuntimeEndpointConfig) =>
    ipcRenderer.invoke("webenvoy:runtime-supervisor-state", config),
  getLodeCatalog: () => ipcRenderer.invoke("webenvoy:lode-catalog"),
  requestOwnerJson: (request: OwnerApiJsonRequest) =>
    ipcRenderer.invoke("webenvoy:owner-api-json", request),
  completeHarborManualAuthentication: (intent: ManualAuthenticationCompletionIntent) =>
    ipcRenderer.invoke("webenvoy:harbor-manual-authentication-completed", intent),
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
