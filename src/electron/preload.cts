import { contextBridge, ipcRenderer } from "electron";

type WebEnvoyShellContext = {
  platform: NodeJS.Platform;
  colorScheme: "light" | "dark";
  configScope: "local-ui-only";
};

const shellApi = {
  getShellContext: () =>
    ipcRenderer.invoke("webenvoy:shell-context") as Promise<WebEnvoyShellContext>,
};

contextBridge.exposeInMainWorld("webenvoyShell", shellApi);
