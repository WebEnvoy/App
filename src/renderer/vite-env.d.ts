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
  attempts?: Array<{ url: string; statusCode?: number; summary: string }>;
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
type WebEnvoyLodeAssetBundleState = {
  state: "ready" | "missing" | "invalid";
  source: "env-path" | "packaged-path" | "build-output" | "not_configured";
  rootPath?: string;
  registryPath?: string;
  packageCount: number;
  requiredPackageRefs: string[];
  missingPackageRefs: string[];
  checkedAt: string;
  summary: string;
  consumerBoundary: string;
};
type WebEnvoyRuntimeSupervisorState = {
  mode: "real";
  checkedAt: string;
  services: WebEnvoyRuntimeServiceState[];
  lodeAssets: WebEnvoyLodeAssetBundleState;
  canUseLiveRuntime: boolean;
  failClosed: boolean;
  summary: string;
};
type WebEnvoyOwnerApiJsonRequest = {
  base: string;
  path: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
};
type WebEnvoyManualAuthenticationCompletionIntent = {
  base: string;
  runtimeSessionRef: string;
};
type WebEnvoyLodeCatalogField = {
  id: string;
  label: string;
  kind: "text" | "number" | "boolean" | "select" | "unknown";
  required: boolean;
  description: string;
  options?: string[];
  defaultValue?: string | number | boolean;
  minimum?: number;
  maximum?: number;
};
type WebEnvoyLodeCatalogAction = {
  id: string;
  category: "read" | "prepare" | "commit" | "destructive";
  operationMode: "read" | "validate_only" | "draft" | "preview";
  targetTypes: string[];
  supportedOrigins: string[];
  externalEffects: string[];
  resourceRequirementRef: string;
  resourceRequirementProfileIds: string[];
};
type WebEnvoyLodeCatalogResultView =
  | {
      mode: "standard";
      fallback: "standard_renderer";
      reason: "not_declared" | "incompatible";
    }
  | {
      mode: "skill";
      fallback: "standard_renderer";
      declarationVersion: "0.1.0";
      viewId: string;
      viewVersion: string;
      resourceRef: string;
      lockRef: string;
    };
type WebEnvoyLodeCatalogSkill = {
  id: string;
  packageRef: string;
  lockRef?: string;
  siteSlug: string;
  siteName: string;
  name: string;
  summary: string;
  category: string;
  version: string;
  latestVersion: string;
  lifecycle: string;
  facets: string[];
  sourceHealth: string;
  updatedAt: string;
  availability: "available" | "incompatible";
  availabilityReason: string;
  inputSchemaId: string;
  inputFields: WebEnvoyLodeCatalogField[];
  outputSchemaId: string;
  outputKind: string;
  resultView: WebEnvoyLodeCatalogResultView;
  actions: WebEnvoyLodeCatalogAction[];
};
type WebEnvoyLodeCatalogState = {
  status: "ready" | "unavailable";
  fetchedAt: string;
  source: WebEnvoyLodeAssetBundleState["source"];
  summary: string;
  skills: WebEnvoyLodeCatalogSkill[];
};

interface Window {
  webenvoyShell?: {
    getShellContext: () => Promise<WebEnvoyShellContext>;
    getRuntimeSupervisorState?: (
      config: WebEnvoyRuntimeEndpointConfig,
    ) => Promise<WebEnvoyRuntimeSupervisorState>;
    getLodeCatalog?: () => Promise<WebEnvoyLodeCatalogState>;
    requestOwnerJson?: (request: WebEnvoyOwnerApiJsonRequest) => Promise<unknown>;
    completeHarborManualAuthentication?: (intent: WebEnvoyManualAuthenticationCompletionIntent) => Promise<unknown>;
    subscribeToSystemThemeVariant?: (
      listener: (colorScheme: WebEnvoyShellContext["colorScheme"]) => void,
    ) => () => void;
  };
}
