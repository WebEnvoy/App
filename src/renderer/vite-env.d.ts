/// <reference types="vite/client" />

type WebEnvoyShellContext = {
  platform: NodeJS.Platform;
  colorScheme: "light" | "dark";
  configScope: "local-ui-only";
};
type WebEnvoyRuntimeEndpointConfig = {
  coreEndpoint: string;
  harborEndpoint: string;
};
type WebEnvoyRuntimeProbe = {
  state: "ready" | "unavailable";
  url: string;
  statusCode?: number;
  summary: string;
};
type WebEnvoyRuntimeServiceState = {
  id: "core" | "harbor";
  name: string;
  endpoint: string;
  processState: "not_configured" | "starting" | "running" | "exited" | "failed";
  launchSource: "env-command" | "env-path" | "packaged-path" | "local-cwd" | "not_configured";
  command?: string;
  cwd?: string;
  pid?: number;
  health: WebEnvoyRuntimeProbe;
  admission?: WebEnvoyRuntimeProbe;
  checkedAt: string;
  lastExitCode?: number | null;
  lastError?: string;
  repairAction: string;
};
type WebEnvoyRuntimeSupervisorState = {
  mode: "real";
  checkedAt: string;
  services: WebEnvoyRuntimeServiceState[];
  canUseLiveRuntime: boolean;
  failClosed: boolean;
  summary: string;
};

interface Window {
  webenvoyShell?: {
    getShellContext: () => Promise<WebEnvoyShellContext>;
    getRuntimeSupervisorState?: (
      config: WebEnvoyRuntimeEndpointConfig,
    ) => Promise<WebEnvoyRuntimeSupervisorState>;
    subscribeToSystemThemeVariant?: (
      listener: (colorScheme: WebEnvoyShellContext["colorScheme"]) => void,
    ) => () => void;
  };
}
