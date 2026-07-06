import type { IdentityEnvironmentProjection } from "./identityEnvironmentFixtures";

export type SiteId = "xiaohongshu" | "boss";
export type ProviderId = "cloakbrowser" | "chrome_official";
export type LoginState = "logged_in" | "logged_out" | "expired" | "unknown" | "manual_auth_required";
export type ManualAuthState = "not_required" | "required" | "in_progress" | "completed" | "failed";

export type LocalIdentityEnvironmentDraft = {
  id: string;
  name: string;
  siteId: SiteId;
  accountLabel: string;
  identityEnvironmentRef: string;
  executionIdentityRef: string;
  profileRef: string;
  requestedProviderId: ProviderId;
  loginState: LoginState;
  manualAuthenticationState: ManualAuthState;
  profileStorageRef: string;
  credentialRef: string;
  proxyRef: string;
  proxyLabel: string;
  region: string;
  language: string;
  timezone: string;
  userAgentSummary: string;
  viewport: string;
  fingerprintSummary: string;
};

export type HarborProviderCatalog = {
  schema_version: "harbor-browser-provider-status/v0";
  providers: HarborProviderStatus[];
  excluded_providers: Array<{ provider: "chromium" | "donut_browser"; reason: string }>;
};

export type HarborProviderStatus = {
  provider_id: ProviderId;
  display_name: string;
  role: "primary" | "restricted_fallback";
  install: {
    status: "installed" | "missing" | "path_invalid";
    path: string | null;
    version: string | null;
    launchability: "launchable" | "not_executable" | "not_checked";
    reason: string | null;
  };
  limitations?: string[];
  download_guide?: { install_hint: string; missing_impacts: string[] };
  diagnostics?: Array<{ app_summary: string; suggested_action: string }>;
};

export type HarborIdentityFacts = {
  schema_version: "harbor-local-identity-environment/v0";
  identity_environment_ref: string;
  execution_identity_ref: string;
  profile_ref: string;
  site_binding: {
    site_id: string;
    origin: string;
    display_name: string;
    account_label: string | null;
  };
  login_state: {
    state: LoginState;
    reason: string | null;
    recovery_required: boolean;
    manual_authentication_state: ManualAuthState;
    human_verification: string[];
  };
  browser_storage: {
    profile_storage_ref: string;
    state: "present" | "missing" | "cleared" | "unknown";
    cookies_session_state: "present" | "missing" | "cleared" | "unknown";
  };
  environment: {
    proxy: { state: "configured" | "missing" | "unknown"; proxy_ref: string | null; label: string | null };
    region: string | null;
    language: string | null;
    timezone: string | null;
    browser_family: string;
    user_agent_summary: string | null;
    viewport: string | null;
    fingerprint_summary: string;
  };
  provider_binding: {
    selected_provider_id: ProviderId | null;
    selection_reason: string;
    requires_user_notice: boolean;
    selected_provider: HarborProviderStatus | null;
    warnings: string[];
    unavailable_reason: string | null;
  };
  credential_recovery: {
    credential_ref: string | null;
    recovery_actions: string[];
  };
  diagnostics: string[];
};

export type HarborRuntimeSession =
  | {
      schema_version: "harbor-runtime-facts/v0";
      runtime_session_ref: string;
      provider_ref: string;
      lifecycle_state: "starting" | "active" | "idle" | "locked" | "disconnected" | "expired" | "failed" | "closed";
      created_at: string;
      last_seen_at: string;
      viewer_ref?: string;
      current_page: {
        requested_url: string;
        current_url: string | null;
        title: string | null;
        status: "ready" | "unavailable" | "unknown";
      };
      control_owner: "system" | "user" | "agent" | "core_task" | "app" | "provider" | "none" | "unknown";
      control_lock: { owner: string; state: "held" | "released" | "closed" };
      current_error: { message: string; retryable: boolean } | null;
    }
  | {
      status: "unavailable";
      message: string;
      retryable: boolean;
    };

export type HarborIdentityLoadState = {
  status: "loading" | "ready" | "offline";
  fetchedAt: string;
  summary: string;
  identities: IdentityEnvironmentProjection[];
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isProviderCatalog(value: unknown): value is HarborProviderCatalog {
  return isRecord(value) && value.schema_version === "harbor-browser-provider-status/v0" && Array.isArray(value.providers);
}

export function isHarborIdentityFacts(value: unknown): value is HarborIdentityFacts {
  return isRecord(value) && value.schema_version === "harbor-local-identity-environment/v0" && isRecord(value.site_binding);
}
