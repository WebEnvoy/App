/// <reference types="vite/client" />

type WebEnvoyShellContext = {
  platform: NodeJS.Platform;
  colorScheme: "light" | "dark";
  configScope: "local-ui-only";
};

interface Window {
  webenvoyShell?: {
    getShellContext: () => Promise<WebEnvoyShellContext>;
    subscribeToSystemThemeVariant?: (
      listener: (colorScheme: WebEnvoyShellContext["colorScheme"]) => void,
    ) => () => void;
  };
}
