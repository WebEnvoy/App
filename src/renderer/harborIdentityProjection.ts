import {
  manualBrowserTargets,
  type BrowserProviderProjection,
  type BrowserSessionProjection,
  type BrowserTargetProjection,
  type IdentityEnvironmentProjection,
  type IdentityStatus,
} from "./identityEnvironmentFixtures";
import type {
  HarborIdentityFacts,
  HarborProviderCatalog,
  HarborProviderStatus,
  HarborRuntimeSession,
  LocalIdentityEnvironmentDraft,
  ProviderId,
  SiteId,
} from "./harborIdentityTypes";

export function mergeIdentityEnvironmentProjections(
  primary: IdentityEnvironmentProjection[],
  fallback: IdentityEnvironmentProjection[],
) {
  const seen = new Set(primary.map((identity) => identity.identityEnvironmentRef));
  return [...primary, ...fallback.filter((identity) => !seen.has(identity.identityEnvironmentRef))];
}

export function projectHarborIdentity(
  facts: HarborIdentityFacts,
  catalog: HarborProviderCatalog | null,
  fetchedAt: string,
): IdentityEnvironmentProjection {
  const siteId = normalizeSiteId(facts.site_binding.site_id);
  const selected = providerName(facts.provider_binding.selected_provider_id);
  const recoveryActions = [
    ...facts.login_state.human_verification.map(authLabel),
    ...facts.credential_recovery.recovery_actions.map(authLabel),
  ];
  const readiness = readinessFromFacts(facts);
  return {
    id: facts.identity_environment_ref,
    name: `${facts.site_binding.display_name} ${facts.site_binding.account_label ?? "本地身份"}`,
    siteName: siteLabel(siteId),
    siteId,
    origin: facts.site_binding.origin,
    accountLabel: facts.site_binding.account_label ?? "未绑定账号",
    source: "Harbor live",
    fetchedAt,
    identityEnvironmentRef: facts.identity_environment_ref,
    executionIdentityRef: facts.execution_identity_ref,
    profileRef: facts.profile_ref,
    admissionFacts: {
      providerId: facts.provider_binding.selected_provider_id,
      providerRole: facts.provider_binding.selected_provider?.role ?? null,
      authenticationProvenance: facts.authentication_provenance ?? null,
      loginState: facts.login_state.state,
      manualAuthenticationState: facts.login_state.manual_authentication_state,
      recoveryRequired: facts.login_state.recovery_required,
      browserStorageState: facts.browser_storage.state,
      warningReasonCodes: [...facts.provider_binding.warnings],
    },
    provider: {
      selected,
      role: selected === "CloakBrowser" ? "默认主力" : selected === "官方 Chrome" ? "受限后备" : "不可启动",
      state: readiness.state,
      reason: facts.provider_binding.warnings.join("；") || facts.provider_binding.unavailable_reason || facts.provider_binding.selection_reason,
    },
    login: {
      state: loginLabel(facts.login_state.state),
      recoveryRequired: facts.login_state.recovery_required,
      manualAuthenticationState: manualAuthLabel(facts.login_state.manual_authentication_state),
      recoveryActions: Array.from(new Set(recoveryActions)),
      reason: facts.login_state.reason ?? "登录恢复和人工认证由 Harbor 浏览器现场完成。",
    },
    environment: {
      proxy: facts.environment.proxy.label ?? facts.environment.proxy.proxy_ref ?? facts.environment.proxy.state,
      region: facts.environment.region ?? "未知",
      language: facts.environment.language ?? "未知",
      timezone: facts.environment.timezone ?? "未知",
      browser: facts.environment.browser_family,
      userAgent: facts.environment.user_agent_summary ?? "未知",
      viewport: facts.environment.viewport ?? "未知",
      fingerprint: facts.environment.fingerprint_summary,
    },
    storage: {
      profileStorage: profileStorageLabel(facts.browser_storage.state),
      cookies: storageLabel(facts.browser_storage.cookies_session_state),
      credentialRef: facts.credential_recovery.credential_ref ? "已绑定本机引用" : "未绑定",
    },
    readiness,
    siteBindings: siteBindings(siteId),
    browser: {
      providers: providerList(catalog, facts.provider_binding.selected_provider),
      defaultProvider: selected === "官方 Chrome" ? "官方 Chrome" : "CloakBrowser",
      targets: manualBrowserTargets,
      session: emptySession(selected === "官方 Chrome" ? "官方 Chrome" : "CloakBrowser", facts.identity_environment_ref),
      boundary: "App 只发送启动、查看、接管、释放、停止意图；Harbor 拥有 session、controller、viewer 和 provider truth。",
    },
    taskEntries: [],
  };
}

export function projectLocalDraft(
  draft: LocalIdentityEnvironmentDraft,
  catalog: HarborProviderCatalog | null,
  fetchedAt: string,
): IdentityEnvironmentProjection {
  const selected = providerName(draft.requestedProviderId);
  const recoveryRequired = draft.loginState !== "logged_in";
  return {
    id: draft.id,
    name: draft.name,
    siteName: siteLabel(draft.siteId),
    siteId: draft.siteId,
    origin: siteOrigin(draft.siteId),
    accountLabel: draft.accountLabel,
    source: "App local-only",
    fetchedAt,
    identityEnvironmentRef: draft.identityEnvironmentRef,
    executionIdentityRef: draft.executionIdentityRef,
    profileRef: draft.profileRef,
    provider: {
      selected,
      role: selected === "CloakBrowser" ? "默认主力" : "受限后备",
      state: catalog ? "unknown" : "warning",
      reason: catalog ? "Provider 状态来自 Harbor 检测；身份环境配置来自 App 本地允许字段。" : "等待 Harbor provider 检测回读。",
    },
    login: {
      state: loginLabel(draft.loginState),
      recoveryRequired,
      manualAuthenticationState: manualAuthLabel(draft.manualAuthenticationState),
      recoveryActions: recoveryRequired ? [manualAuthLabel(draft.manualAuthenticationState)] : [],
      reason: "App 只保存登录状态摘要；认证必须在 Harbor 浏览器现场人工完成。",
    },
    environment: {
      proxy: draft.proxyLabel || draft.proxyRef || "缺失",
      region: draft.region,
      language: draft.language,
      timezone: draft.timezone,
      browser: selected,
      userAgent: draft.userAgentSummary,
      viewport: draft.viewport,
      fingerprint: draft.fingerprintSummary,
    },
    storage: {
      profileStorage: draft.profileStorageRef ? "存在" : "未知",
      cookies: draft.loginState === "logged_in" ? "存在" : draft.loginState === "expired" ? "过期" : "未知",
      credentialRef: draft.credentialRef ? "已绑定本机引用" : "未绑定",
    },
    readiness: {
      state: draft.loginState === "logged_in" ? "ready" : "needs-auth",
      label: draft.loginState === "logged_in" ? "可请求 Harbor 会话" : "需要人工认证",
      reasons: ["本地只保存允许配置/选择；真实 session、provider 和登录恢复必须由 Harbor 回读。"],
    },
    siteBindings: siteBindings(draft.siteId),
    browser: {
      providers: providerList(catalog, null),
      defaultProvider: selected === "官方 Chrome" ? "官方 Chrome" : "CloakBrowser",
      targets: manualBrowserTargets,
      session: emptySession(selected === "官方 Chrome" ? "官方 Chrome" : "CloakBrowser", draft.identityEnvironmentRef),
      boundary: "App 本地配置不包含密码、Cookie、token、profile 原始内容或 raw evidence；启动后以 Harbor session facts 为准。",
    },
    taskEntries: taskEntries(draft.siteId),
  };
}

export function projectHarborSession(
  result: HarborRuntimeSession,
  fallback: BrowserSessionProjection,
): BrowserSessionProjection {
  if ("status" in result) {
    return { ...fallback, state: "failed", statusLabel: "不可用", message: result.message };
  }
  const state =
    result.lifecycle_state === "closed"
      ? "stopped"
      : result.lifecycle_state === "failed"
      ? "failed"
      : result.lifecycle_state === "idle" || result.control_owner === "none"
      ? "idle"
      : result.control_owner === "user"
      ? "takeover"
      : "running";
  return {
    provider: fallback.provider,
    state,
    statusLabel: state === "takeover" ? "用户接管" : state === "stopped" ? "已停止" : state === "failed" ? "失败" : state === "idle" ? "已释放" : "已启动",
    controller: result.control_owner === "none" ? "空闲" : result.control_owner === "user" ? "用户接管" : result.control_owner === "core_task" ? "Core 任务运行" : "手动浏览",
    browserSessionRef: result.runtime_session_ref,
    viewerRef: result.viewer_ref ?? fallback.viewerRef,
    currentUrl: result.current_page.current_url ?? result.current_page.requested_url,
    title: result.current_page.title ?? "无标题",
    startedAt: result.created_at,
    message: result.current_error?.message ?? "Harbor 已返回真实本地身份浏览器会话事实。",
  };
}

export function identityInputFromProjection(identity: IdentityEnvironmentProjection) {
  return {
    identity_environment_ref: identity.identityEnvironmentRef,
    execution_identity_ref: identity.executionIdentityRef,
    profile_ref: identity.profileRef,
    site: {
      site_id: identity.siteId,
      origin: identity.origin,
      display_name: identity.siteName,
      account_identifier: identity.accountLabel,
    },
    login_state: reverseLoginLabel(identity.login.state),
    storage_state: identity.storage.profileStorage === "存在" ? "present" : "unknown",
    profile_storage_ref: `${identity.profileRef}:storage`,
    proxy_label: identity.environment.proxy,
    region: identity.environment.region,
    language: identity.environment.language,
    timezone: identity.environment.timezone,
    browser_family: identity.provider.selected === "官方 Chrome" ? "chrome_official" : "cloakbrowser",
    user_agent_summary: identity.environment.userAgent,
    viewport: identity.environment.viewport,
    fingerprint_summary: identity.environment.fingerprint,
    login_method: "manual",
    manual_authentication_state: identity.login.recoveryRequired ? "required" : "not_required",
    human_verification: identity.login.recoveryRequired ? ["manual_login"] : [],
    requested_provider_id: identity.provider.selected === "官方 Chrome" ? "chrome_official" : "cloakbrowser",
  };
}

function providerList(catalog: HarborProviderCatalog | null, fallbackProvider: HarborProviderStatus | null): BrowserProviderProjection[] {
  const mapped = (catalog?.providers ?? (fallbackProvider ? [fallbackProvider] : [])).map(providerProjection);
  if (mapped.length > 0) return mapped;
  return [
    { name: "CloakBrowser", role: "推荐主力", state: "missing", statusLabel: "待检测", summary: "等待 Harbor provider 检测结果。" },
    { name: "官方 Chrome", role: "受限后备", state: "restricted", statusLabel: "待检测", summary: "官方 Chrome 只作为受限后备或手动准备环境。" },
  ];
}

function providerProjection(provider: HarborProviderStatus): BrowserProviderProjection {
  const launchable = provider.install.status === "installed" && provider.install.launchability === "launchable";
  const chrome = provider.provider_id === "chrome_official";
  return {
    name: providerName(provider.provider_id) === "官方 Chrome" ? "官方 Chrome" : "CloakBrowser",
    role: chrome ? "受限后备" : "推荐主力",
    state: launchable ? (chrome ? "restricted" : "available") : "missing",
    statusLabel: launchable ? (chrome ? "受限可用" : "可用") : provider.install.status === "missing" ? "未安装" : "不可启动",
    summary: provider.diagnostics?.[0]?.app_summary ?? provider.limitations?.[0] ?? provider.install.reason ?? "Harbor provider 检测已回读。",
    installHint: launchable ? undefined : provider.download_guide?.install_hint,
  };
}

function readinessFromFacts(facts: HarborIdentityFacts): { state: IdentityStatus; label: string; reasons: string[] } {
  if (!facts.provider_binding.selected_provider) return { state: "blocked", label: "provider 不可用", reasons: facts.diagnostics };
  if (facts.login_state.recovery_required) return { state: "needs-auth", label: "需要人工认证", reasons: facts.login_state.human_verification.map(authLabel) };
  return {
    state: facts.provider_binding.requires_user_notice ? "warning" : "ready",
    label: facts.provider_binding.requires_user_notice ? "受限后备" : "可用于只读任务",
    reasons: facts.provider_binding.warnings.length ? facts.provider_binding.warnings : ["Harbor public summary 可用。"],
  };
}

function emptySession(provider: BrowserSessionProjection["provider"], identityRef: string): BrowserSessionProjection {
  return {
    provider,
    state: "idle",
    statusLabel: "空闲",
    controller: "空闲",
    browserSessionRef: `${identityRef}:session-next`,
    viewerRef: `${identityRef}:viewer-next`,
    currentUrl: "未打开",
    title: "无活动页面",
    startedAt: "未启动",
    message: "从目标站点入口启动后，App 只展示 Harbor 返回的 session facts。",
  };
}

function taskEntries(siteId: SiteId) {
  return siteId === "boss"
    ? [
        { id: "task-entry-boss-real-read", label: "启动 BOSS 职位搜索", taskId: "task-boss-real-read", inputSummary: "职位关键词：前端工程师；城市：上海；结果数：15。", readiness: "真实搜索结果来自 Core owner API；职位详情等待真实 detail_ref。", source: "Core fixture" as const },
        { id: "task-entry-boss-write-preview", label: "查看 BOSS 打招呼写前验证", taskId: "task-boss-greeting-write-preview", inputSummary: "目标职位、候选人消息框和打招呼文案的真实页面写前验证。", readiness: "只展示 submitted=false / 未发送 的写前投影；不发送消息。", source: "Core fixture" as const },
      ]
    : [
        { id: "task-entry-xhs-real-read", label: "启动小红书搜索/笔记读取", taskId: "task-xhs-real-read", inputSummary: "关键词：AI 工具；可继续读取指定笔记 URL。", readiness: "真实任务结果来自 Core owner API；离线时显示 fallback projection。", source: "Core fixture" as const },
        { id: "task-entry-xhs-write-preview", label: "查看小红书发布草稿写前验证", taskId: "task-xhs-publish-write-preview", inputSummary: "草稿标题、正文、话题和发布器字段的真实页面写前验证。", readiness: "只展示 submitted=false / 未发布 的写前投影；不点击发布。", source: "Core fixture" as const },
      ];
}

function siteBindings(siteId: SiteId) {
  return siteId === "boss" ? ["BOSS 职位搜索", "BOSS 打招呼写前预览"] : ["小红书搜索和笔记读取", "小红书发布草稿写前预览"];
}

function normalizeSiteId(value: string): SiteId {
  return value === "boss" || value === "zhipin" ? "boss" : "xiaohongshu";
}

function siteLabel(siteId: SiteId): "小红书" | "BOSS" {
  return siteId === "boss" ? "BOSS" : "小红书";
}

function siteOrigin(siteId: SiteId) {
  return siteId === "boss" ? "https://www.zhipin.com" : "https://www.xiaohongshu.com";
}

function providerName(providerId: ProviderId | null): "CloakBrowser" | "官方 Chrome" | "未可用" {
  return providerId === "chrome_official" ? "官方 Chrome" : providerId === "cloakbrowser" ? "CloakBrowser" : "未可用";
}

function loginLabel(state: string) {
  return state === "logged_in" ? "已登录" : state === "logged_out" ? "未登录" : state === "expired" ? "已过期" : state === "manual_auth_required" ? "需要人工认证" : "未知";
}

function reverseLoginLabel(label: string) {
  return label === "已登录" ? "logged_in" : label === "未登录" ? "logged_out" : label === "已过期" ? "expired" : label === "需要人工认证" ? "manual_auth_required" : "unknown";
}

function manualAuthLabel(state: string) {
  return state === "not_required" ? "无需认证" : state === "in_progress" ? "认证中" : state === "completed" ? "已完成" : state === "failed" ? "认证失败" : "需要认证";
}

function authLabel(value: string) {
  return value === "qr_scan" ? "扫码" : value === "two_factor" ? "二次验证" : value === "captcha" ? "验证码" : value === "login_expired" ? "登录过期" : "手动登录";
}

function storageLabel(state: string): "存在" | "缺失" | "过期" | "未知" {
  return state === "present" ? "存在" : state === "missing" || state === "cleared" ? "缺失" : "未知";
}

function profileStorageLabel(state: string): "存在" | "缺失" | "未知" {
  return state === "present" ? "存在" : state === "missing" || state === "cleared" ? "缺失" : "未知";
}
