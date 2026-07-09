import { spawnSync } from "node:child_process";
import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const requiredFiles = [
  "dist-electron/main.js",
  "dist-electron/preload.cjs",
  "dist/renderer/index.html",
  "dist/renderer/assets",
];

for (const file of requiredFiles) {
  await access(file);
}

const mainSource = await readFile("dist-electron/main.js", "utf8");
const preloadSource = await readFile("dist-electron/preload.cjs", "utf8");
const rendererHtml = await readFile("dist/renderer/index.html", "utf8");
const connectionConfigSource = await readFile("src/renderer/localConnectionConfig.ts", "utf8");
const coreReadTaskClientSource = await readFile("src/renderer/coreReadTaskClient.ts", "utf8");
const coreTaskSubmitClientSource = await readFile("src/renderer/coreTaskSubmitClient.ts", "utf8");
const identityEnvironmentFixturesSource = await readFile("src/renderer/identityEnvironmentFixtures.ts", "utf8");
const harborIdentityClientSource = await readFile("src/renderer/harborIdentityClient.ts", "utf8");
const harborIdentityProjectionSource = await readFile("src/renderer/harborIdentityProjection.ts", "utf8");
const harborIdentityTypesSource = await readFile("src/renderer/harborIdentityTypes.ts", "utf8");
const localIdentityStoreSource = await readFile("src/renderer/localIdentityEnvironmentStore.ts", "utf8");
const runtimeSupervisorStateSource = await readFile("src/renderer/runtimeSupervisorState.ts", "utf8");
const rendererAssets = await readFile(
  "dist/renderer/assets/index.js",
  "utf8",
).catch(async () => {
  const { readdir } = await import("node:fs/promises");
  const assets = await readdir("dist/renderer/assets");
  const appAsset = assets.find((asset) => asset.endsWith(".js"));

  if (!appAsset) {
    throw new Error("Renderer smoke failed: bundled JS asset is missing.");
  }

  return readFile(`dist/renderer/assets/${appAsset}`, "utf8");
});

if (!mainSource.includes("webenvoy:shell-context")) {
  throw new Error("Electron main smoke failed: shell context IPC is missing.");
}

if (!mainSource.includes("webenvoy:runtime-supervisor-state")) {
  throw new Error("Electron main smoke failed: runtime supervisor IPC is missing.");
}

if (!preloadSource.includes("webenvoyShell")) {
  throw new Error("Preload smoke failed: shell bridge is missing.");
}

if (!preloadSource.includes("getRuntimeSupervisorState")) {
  throw new Error("Preload smoke failed: runtime supervisor bridge is missing.");
}

if (rendererHtml.includes('src="/assets/') || rendererHtml.includes('href="/assets/')) {
  throw new Error("Renderer smoke failed: packaged assets still use absolute paths.");
}

if (!rendererHtml.includes("WebEnvoy App")) {
  throw new Error("Renderer smoke failed: WebEnvoy title is missing.");
}

for (const expectedText of [
  "Task Thread",
  "source-health",
  "WebEnvoy App 不作为运行事实真相源。",
  "Read-only task creation entry",
  "Missing owner source",
  "Core-owned run navigation",
  "outcome:",
  "success",
  "empty",
  "partial",
  "failure-safe",
  "failure",
  "unavailable",
  "expired",
  "redacted",
  "unknown",
  "Owner-supported action intent",
  "Evidence card only links owner viewer refs",
  "Open evidence viewer link",
  "raw evidence body",
  "Capability package source attribution",
  "Capability attribution",
  "Failure class",
  "Latest capability test",
  "post_check_failed",
  "site_changed",
  "Report broken",
  "Repair drafts",
  "local_signal_only",
  "lode_public_fix_candidate",
  "Status",
  "Freshness",
  "Provenance",
  "evidence_expired",
  "Work failure links back to capability health",
  "Library",
  "启动只读任务",
  "Core source blocked",
  "Source ref",
  "Lock ref",
  "lode://package/example-commerce-product-detail@0.4.2",
  "lode://lock/example-commerce-product-detail/2026-07-03",
  "已锁定",
  "@lode/example-commerce-product-detail",
  "lode://capability/example-commerce/product-detail",
  "Runtime session",
  "App 不使用无关本机浏览器现场代替任务现场",
  "direct Identity Runtime Session",
  "not Core Task/Run/Result",
  "Write-pre preview",
  "真实页面写前验证",
  "validate_only_preview",
  "Validate contact form target and prepare a local preview without submitting.",
  "No-submit guard",
  "page_changed",
  "Open preview evidence viewer link",
  "Risk and approval",
  "action-request:fixture/preview-contact-form",
  "pending",
  "expired",
  "blocked",
  "user_cancelled",
  "Submitted",
  "false",
  "submitted=false / 未提交",
  "No-submit 边界",
  "账号身份",
  "Harbor identity environment public summary",
  "Harbor live",
  "Harbor offline",
  "Harbor endpoint 未返回可消费的 provider/identity JSON",
  "Core read task status",
  "Core owner API projection",
  "实时结果",
  "本地展示",
  "创建本地身份环境配置",
  "导入 Harbor public summary",
  "保存本地允许配置",
  "不保存账号密码、Cookie、token、profile 原始内容",
  "真实任务结果来自 Core owner API",
  "身份环境、登录态、provider 和一致性事实归属 Harbor",
  "CloakBrowser",
  "官方 Chrome",
  "Chromium / Donut Browser 不进入用户 provider 管理",
  "身份浏览器",
  "手动身份浏览是 Browser/Harbor session，不是 Core 任务运行。",
  "推荐主力",
  "受限后备",
  "缺少 CloakBrowser 会影响身份一致性和真实任务运行。",
  "默认打开首页/发现页",
  "默认打开职位入口",
  "控制者",
  "当前网址",
  "小红书 - 发现",
  "查看会话",
  "接管",
  "释放",
  "停止",
  "智能体直接浏览",
  "只有 Core task path 才产生任务运行、结果和 evidence。",
  "小红书运营号 A",
  "BOSS 招聘号",
  "代理",
  "地区 / 语言",
  "时区",
  "指纹摘要",
  "敏感材料状态",
  "Cookie/session",
  "打开认证现场",
  "不展示密码、验证码、Cookie、令牌",
  "小红书搜索和笔记读取",
  "BOSS 搜索和职位详情读取",
  "小红书发布草稿写前验证",
  "BOSS 打招呼写前验证",
  "小红书发布草稿写前预览",
  "BOSS 打招呼写前预览",
  "真实页面写前验证 / draft-only",
  "真实页面写前验证 / message draft",
  "真实页面写前验证已过期",
  "真实页面写前验证已取消",
  "action-request:fixture/xhs-publish-draft-preview-006",
  "action-request:fixture/boss-greeting-preview-004",
  "审批请求",
  "过期请求",
  "取消记录",
  "未发布",
  "未发送",
  "页面状态已过期",
  "记录取消意图",
  "打开小红书写前证据",
  "打开 BOSS 打招呼写前证据",
  "从身份浏览器会话启动真实只读任务",
  "字段来源",
  "小红书笔记读取证据入口",
  "BOSS 职位详情证据入口",
  "未登录",
  "验证码",
  "页面变化",
  "字段缺失",
  "不打招呼、不投递、不发送消息",
  "Runtime supervisor status",
  "生产运行已阻断",
  "fixture/demo 不作为可用结果",
  "App runtime supervisor",
  "Core health / admission",
  "Harbor health",
  "Lode assets",
  "runtime 未连接",
]) {
  if (!rendererAssets.includes(expectedText)) {
    throw new Error(`Renderer smoke failed: ${expectedText} is missing.`);
  }
}

const runtimeSupervisorModule = await import(
  pathToFileURL(path.resolve("dist-electron/runtimeSupervisor.js")).href
);
const lodeAssetBundleModule = await import(
  pathToFileURL(path.resolve("dist-electron/lodeAssetBundle.js")).href
);
const harborLaunch = runtimeSupervisorModule.resolveRuntimeServiceLaunchConfig(
  "harbor",
  { WEBENVOY_HARBOR_RUNTIME_CWD: "/tmp/harbor-runtime" },
  undefined,
);

if (
  harborLaunch?.command !== "pnpm" ||
  harborLaunch.args?.join(" ") !== "start:runtime" ||
  harborLaunch.cwd !== "/tmp/harbor-runtime" ||
  harborLaunch.source !== "local-cwd"
) {
  throw new Error("Runtime supervisor smoke failed: Harbor local start script config was not resolved.");
}

const readiness = runtimeSupervisorModule.summarizeRuntimeReadiness([
  {
    id: "core",
    name: "Core",
    endpoint: "http://127.0.0.1:8787",
    processState: "not_configured",
    launchSource: "not_configured",
    health: { state: "ready", url: "core/health", summary: "ready" },
    admission: { state: "unavailable", url: "core/admission", summary: "missing" },
    checkedAt: "smoke",
    repairAction: "repair core",
  },
  {
    id: "harbor",
    name: "Harbor",
    endpoint: "http://127.0.0.1:8788",
    processState: "not_configured",
    launchSource: "not_configured",
    health: { state: "ready", url: "harbor/health", summary: "ready" },
    checkedAt: "smoke",
    repairAction: "repair harbor",
  },
]);

if (!readiness.failClosed || readiness.canUseLiveRuntime) {
  throw new Error("Runtime supervisor smoke failed: missing Core admission did not fail closed.");
}

const lodeBundle = lodeAssetBundleModule.resolveLodeAssetBundle({}, undefined);

if (lodeBundle.state !== "ready" || lodeBundle.packageCount < 6 || lodeBundle.missingPackageRefs.length > 0) {
  throw new Error(`Lode asset bundle smoke failed: ${JSON.stringify(lodeBundle)}`);
}

const coreLodeEnv = lodeAssetBundleModule.coreLodeAssetEnvironment(lodeBundle);

if (!coreLodeEnv.WEBENVOY_LODE_ASSETS_PATH || !coreLodeEnv.WEBENVOY_LODE_REGISTRY_PATH) {
  throw new Error("Lode asset bundle smoke failed: Core env did not include asset paths.");
}

await assertPackagedRuntimeRequiredFailsClosed();

const liveReadiness = runtimeSupervisorModule.summarizeRuntimeReadiness(
  [
    {
      id: "core",
      name: "Core",
      endpoint: "http://127.0.0.1:8787",
      processState: "running",
      launchSource: "packaged-path",
      health: { state: "ready", url: "core/health", summary: "ready" },
      admission: { state: "ready", url: "core/admission", summary: "ready" },
      checkedAt: "smoke",
      repairAction: "ready",
    },
    {
      id: "harbor",
      name: "Harbor",
      endpoint: "http://127.0.0.1:8788",
      processState: "running",
      launchSource: "packaged-path",
      health: { state: "ready", url: "harbor/health", summary: "ready" },
      checkedAt: "smoke",
      repairAction: "ready",
    },
  ],
  lodeBundle,
);

if (!liveReadiness.canUseLiveRuntime || liveReadiness.failClosed) {
  throw new Error("Runtime supervisor smoke failed: ready Core/Harbor/Lode did not open live gate.");
}

const fixtureCore = await startJsonServer((pathname) =>
  ["/health", "/admission/health"].includes(pathname) ? { status: "ready" } : null,
);
const fixtureHarbor = await startJsonServer((pathname) =>
  pathname === "/readiness" ? { status: "ready", source: "fixture" } : null,
);
try {
  const fixtureState = await runtimeSupervisorModule.createRuntimeSupervisor().readState({
    coreEndpoint: fixtureCore.endpoint,
    harborEndpoint: fixtureHarbor.endpoint,
  });
  const harborHealth = fixtureState.services.find((service) => service.id === "harbor")?.health;
  if (harborHealth?.state !== "unavailable" || fixtureState.canUseLiveRuntime) {
    throw new Error(`Runtime supervisor smoke failed: fixture Harbor readiness opened live gate. ${JSON.stringify(fixtureState)}`);
  }
} finally {
  await fixtureCore.close();
  await fixtureHarbor.close();
}

const { outputText: connectionConfigModuleSource } = ts.transpileModule(connectionConfigSource, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
const connectionConfigModule = await import(
  `data:text/javascript;charset=utf-8,${encodeURIComponent(connectionConfigModuleSource)}`
);
const { outputText: harborIdentityTypesModuleSource } = ts.transpileModule(harborIdentityTypesSource, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
const harborIdentityTypesModuleUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(harborIdentityTypesModuleSource)}`;
const { outputText: identityEnvironmentFixturesModuleSource } = ts.transpileModule(identityEnvironmentFixturesSource, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
const identityEnvironmentFixturesModuleUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(identityEnvironmentFixturesModuleSource)}`;
const { outputText: harborIdentityProjectionModuleSource } = ts.transpileModule(harborIdentityProjectionSource, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
const harborIdentityProjectionModuleUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(
  harborIdentityProjectionModuleSource.replace(
    'from "./identityEnvironmentFixtures";',
    `from "${identityEnvironmentFixturesModuleUrl}";`,
  ),
)}`;
const { outputText: harborIdentityClientModuleSource } = ts.transpileModule(harborIdentityClientSource, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
const harborIdentityClientModule = await import(
  `data:text/javascript;charset=utf-8,${encodeURIComponent(
    harborIdentityClientModuleSource
      .replace(
        'from "./harborIdentityProjection";',
        `from "${harborIdentityProjectionModuleUrl}";`,
      )
      .replace(
        'from "./harborIdentityTypes";',
        `from "${harborIdentityTypesModuleUrl}";`,
      ),
  )}`
);
const { outputText: localIdentityStoreModuleSource } = ts.transpileModule(localIdentityStoreSource, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
const localIdentityStoreModule = await import(
  `data:text/javascript;charset=utf-8,${encodeURIComponent(
    localIdentityStoreModuleSource.replace(
      'from "./harborIdentityTypes";',
      `from "${harborIdentityTypesModuleUrl}";`,
    ),
  )}`
);
const { outputText: coreReadTaskClientModuleSource } = ts.transpileModule(coreReadTaskClientSource, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
const coreReadTaskClientModule = await import(
  `data:text/javascript;charset=utf-8,${encodeURIComponent(coreReadTaskClientModuleSource)}`
);
const { outputText: runtimeSupervisorStateModuleSource } = ts.transpileModule(runtimeSupervisorStateSource, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
const runtimeSupervisorStateModuleUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(runtimeSupervisorStateModuleSource)}`;
const coreReadTaskClientModuleUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(coreReadTaskClientModuleSource)}`;
const { outputText: coreTaskSubmitClientModuleSource } = ts.transpileModule(coreTaskSubmitClientSource, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
const coreTaskSubmitClientModule = await import(
  `data:text/javascript;charset=utf-8,${encodeURIComponent(
    coreTaskSubmitClientModuleSource
      .replace(
        'from "./coreReadTaskClient";',
        `from "${coreReadTaskClientModuleUrl}";`,
      )
      .replace(
        'from "./runtimeSupervisorState";',
        `from "${runtimeSupervisorStateModuleUrl}";`,
      ),
  )}`
);

function installLocalStorage(entries = {}) {
  const store = new Map(Object.entries(entries));

  globalThis.window = {
    clearTimeout: globalThis.clearTimeout,
    localStorage: {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => store.set(key, value),
    },
    setTimeout: globalThis.setTimeout,
  };

  return store;
}

installLocalStorage({
  [connectionConfigModule.localConnectionStorageKey]: "{broken",
});
const malformedConfig = connectionConfigModule.loadLocalConnectionConfig();

if (malformedConfig.coreEndpoint !== connectionConfigModule.defaultConnectionConfig.coreEndpoint) {
  throw new Error("Connection config smoke failed: malformed stored JSON did not fall back.");
}

const validStore = installLocalStorage();
const validSave = connectionConfigModule.saveLocalConnectionConfig({
  ...connectionConfigModule.defaultConnectionConfig,
  coreEndpoint: " http://localhost:3000/api/ ",
});

if (!validSave.ok || validSave.config.coreEndpoint !== "http://localhost:3000/api") {
  throw new Error("Connection config smoke failed: valid endpoint was not sanitized and saved.");
}

if (!validStore.has(connectionConfigModule.localConnectionStorageKey)) {
  throw new Error("Connection config smoke failed: valid endpoint did not write localStorage.");
}

const sensitiveStore = installLocalStorage();
const sensitiveSave = connectionConfigModule.saveLocalConnectionConfig({
  ...connectionConfigModule.defaultConnectionConfig,
  coreEndpoint: "https://example.test/profile",
});

if (sensitiveSave.ok || sensitiveStore.has(connectionConfigModule.localConnectionStorageKey)) {
  throw new Error("Connection config smoke failed: sensitive endpoint was saved.");
}

const safeIdentityStore = installLocalStorage();
const localDraft = localIdentityStoreModule.createLocalIdentityEnvironmentDraft({
  siteId: "xiaohongshu",
  accountLabel: "运营号 A",
  identityEnvironmentRef: "identity-env_smoke",
  profileRef: "profile_smoke",
  requestedProviderId: "cloakbrowser",
  loginState: "manual_auth_required",
});
localIdentityStoreModule.upsertLocalIdentityEnvironmentDraft(localDraft);
const savedIdentities = safeIdentityStore.get(localIdentityStoreModule.localIdentityEnvironmentStorageKey) ?? "";

if (!savedIdentities.includes("identity-env_smoke") || savedIdentities.includes("password") || savedIdentities.includes("cookie_value")) {
  throw new Error("Identity store smoke failed: safe identity draft was not saved correctly.");
}

const sensitiveImport = localIdentityStoreModule.parseImportedIdentityEnvironment(JSON.stringify({
  siteId: "boss",
  accountLabel: "招聘号",
  cookie_value: "do-not-store",
}));

if (sensitiveImport.ok) {
  throw new Error("Identity store smoke failed: sensitive import was accepted.");
}

const ambiguousCookieStateImport = localIdentityStoreModule.parseImportedIdentityEnvironment(JSON.stringify({
  siteId: "boss",
  accountLabel: "招聘号",
  cookie_state: "raw-or-ambiguous",
}));

if (ambiguousCookieStateImport.ok) {
  throw new Error("Identity store smoke failed: ambiguous cookie state import was accepted.");
}

const safeHarborImport = localIdentityStoreModule.parseImportedIdentityEnvironment(JSON.stringify({
  schema_version: "harbor-local-identity-environment/v0",
  identity_environment_ref: "identity-env_imported",
  execution_identity_ref: "execution-imported",
  profile_ref: "profile-imported",
  site_binding: {
    site_id: "boss",
    origin: "https://www.zhipin.com",
    display_name: "BOSS",
    account_label: "招聘号"
  },
  login_state: {
    state: "manual_auth_required",
    reason: "manual login required",
    recovery_required: true,
    manual_authentication_state: "required",
    human_verification: ["qr_scan"]
  },
  browser_storage: {
    profile_storage_ref: "profile-storage-ref",
    state: "present",
    cookies_session_state: "unknown"
  },
  environment: {
    proxy: { state: "configured", proxy_ref: "proxy-ref", label: "proxy summary" },
    region: "CN-SH",
    language: "zh-CN",
    timezone: "Asia/Shanghai",
    browser_family: "cloakbrowser",
    user_agent_summary: "Chrome family",
    viewport: "1440 x 900",
    fingerprint_summary: "provider_claim"
  },
  provider_binding: {
    selected_provider_id: "cloakbrowser",
    selection_reason: "cloakbrowser_default",
    requires_user_notice: false,
    selected_provider: null,
    warnings: [],
    unavailable_reason: null
  },
  credential_recovery: {
    credential_ref: "credential-ref",
    recovery_actions: ["manual_login"]
  },
  diagnostics: []
}));

if (!safeHarborImport.ok || safeHarborImport.draft.siteId !== "boss") {
  throw new Error("Identity store smoke failed: safe Harbor public summary import was rejected.");
}

const harborContract = await startHarborIdentityContractServer();
let readyXhsIdentity;
let harborRuntimeSession;
try {
  const createPayload = await harborIdentityClientModule.createHarborIdentityEnvironment(harborContract.endpoint, {
    id: "harbor://identity-environment/xhs-smoke",
    name: "小红书 smoke",
    siteId: "xiaohongshu",
    accountLabel: "运营号 smoke",
    identityEnvironmentRef: "harbor://identity-environment/xhs-smoke",
    executionIdentityRef: "harbor://execution-identity/xhs-smoke",
    profileRef: "harbor://profile/xhs-smoke",
    requestedProviderId: "cloakbrowser",
    loginState: "logged_in",
    manualAuthenticationState: "not_required",
    profileStorageRef: "harbor://profile-storage/xhs-smoke",
    credentialRef: "credential:smoke-ref",
    proxyRef: "proxy:smoke",
    proxyLabel: "local contract proxy ref",
    region: "CN-SH",
    language: "zh-CN",
    timezone: "Asia/Shanghai",
    userAgentSummary: "Chrome family smoke",
    viewport: "1440 x 900",
    fingerprintSummary: "provider_claim_smoke",
  });
  if (createPayload.ok !== true) {
    throw new Error(`Harbor identity contract smoke failed: create was not accepted: ${JSON.stringify(createPayload)}`);
  }

  const harborReadback = await harborIdentityClientModule.fetchHarborIdentityState(harborContract.endpoint, []);
  readyXhsIdentity = harborReadback.identities.find((identity) => identity.identityEnvironmentRef === "harbor://identity-environment/xhs-smoke");
  if (harborReadback.status !== "ready" || readyXhsIdentity?.source !== "Harbor live" || readyXhsIdentity.readiness.state !== "ready") {
    throw new Error(`Harbor identity contract smoke failed: readback did not return ready Harbor live identity: ${JSON.stringify(harborReadback)}`);
  }

  harborRuntimeSession = await harborIdentityClientModule.openHarborIdentitySession(
    harborContract.endpoint,
    readyXhsIdentity,
    readyXhsIdentity.browser.targets[0],
  );
  if ("status" in harborRuntimeSession || harborRuntimeSession.lifecycle_state !== "active") {
    throw new Error(`Harbor identity contract smoke failed: session was not active: ${JSON.stringify(harborRuntimeSession)}`);
  }

  let localOnlySessionFetchCalled = false;
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    localOnlySessionFetchCalled = true;
    throw new Error("local-only identity must not call Harbor session endpoint");
  };
  try {
    const localOnlySession = await harborIdentityClientModule.openHarborIdentitySession(
      harborContract.endpoint,
      { ...readyXhsIdentity, source: "App local-only" },
      readyXhsIdentity.browser.targets[0],
    );
    if (!("status" in localOnlySession) || localOnlySessionFetchCalled) {
      throw new Error(`Harbor identity contract smoke failed: local-only session was not fail-closed before fetch: ${JSON.stringify(localOnlySession)}`);
    }
  } finally {
    globalThis.fetch = previousFetch;
  }
} finally {
  await harborContract.close();
}

const liveRuntimeForSubmit = {
  canUseLiveRuntime: true,
  services: [
    { id: "core", health: { state: "ready" }, admission: { state: "ready" } },
    { id: "harbor", health: { state: "ready" } },
  ],
};
const readonlySubmitTask = {
  id: "task-xhs-real-read",
  title: "小红书搜索与笔记读取",
  accountIdentity: "小红书运营号 A",
  siteSkill: "小红书搜索和笔记读取",
  businessInput: "读取 https://www.xiaohongshu.com/explore/abc?xsec_token=url-ref-only",
  packageSource: {
    lockRef: "lode://lock/site-capability/xiaohongshu/search-notes@0.1.0",
  },
  runs: [],
};
const submitReadiness = coreTaskSubmitClientModule.coreTaskSubmitReadiness(
  readonlySubmitTask,
  liveRuntimeForSubmit,
  [readyXhsIdentity],
);

if (!submitReadiness.ok) {
  throw new Error(`Core submit smoke failed: ready live identity was blocked: ${submitReadiness.reason}`);
}

if (Object.prototype.hasOwnProperty.call(submitReadiness.payload, "entrypoint")) {
  throw new Error("Core submit smoke failed: payload still has invalid top-level entrypoint.");
}

if (
  submitReadiness.payload.task_intent.schema_version !== "webenvoy.task-intent.v0" ||
  submitReadiness.payload.task_intent.entrypoint !== "app" ||
  submitReadiness.payload.task_intent.scope.target_ref !== "https://www.xiaohongshu.com/explore/abc?xsec_token=url-ref-only" ||
  submitReadiness.payload.task_intent.resource_requirement_refs[0] !== "xiaohongshu.search-notes.resources" ||
  submitReadiness.payload.task_intent.evidence_policy_ref !== "evidence-policy:refs-only"
) {
  throw new Error(`Core submit smoke failed: task intent payload is malformed: ${JSON.stringify(submitReadiness.payload)}`);
}

const needsAuthReadiness = coreTaskSubmitClientModule.coreTaskSubmitReadiness(
  readonlySubmitTask,
  liveRuntimeForSubmit,
  [
    {
      ...readyXhsIdentity,
      login: { recoveryRequired: true },
      readiness: { state: "needs-auth" },
    },
  ],
);

if (needsAuthReadiness.ok) {
  throw new Error("Core submit smoke failed: needs-auth Harbor identity was accepted.");
}

for (const source of ["App local-only", "Harbor fixture"]) {
  const nonLiveReadiness = coreTaskSubmitClientModule.coreTaskSubmitReadiness(
    readonlySubmitTask,
    liveRuntimeForSubmit,
    [{ ...readyXhsIdentity, source }],
  );
  if (nonLiveReadiness.ok) {
    throw new Error(`Core submit smoke failed: ${source} identity was accepted as live.`);
  }
}

const chromeFallbackReadiness = coreTaskSubmitClientModule.coreTaskSubmitReadiness(
  readonlySubmitTask,
  liveRuntimeForSubmit,
  [
    {
      ...readyXhsIdentity,
      provider: { ...readyXhsIdentity.provider, selected: "官方 Chrome", state: "warning" },
      readiness: { ...readyXhsIdentity.readiness, state: "warning" },
    },
  ],
);
if (chromeFallbackReadiness.ok) {
  throw new Error("Core submit smoke failed: Chrome restricted fallback was accepted for Core task submit.");
}

const crossOriginReadiness = coreTaskSubmitClientModule.coreTaskSubmitReadiness(
  {
    ...readonlySubmitTask,
    businessInput: "读取 https://example.test/not-the-selected-site",
  },
  liveRuntimeForSubmit,
  [readyXhsIdentity],
);

if (crossOriginReadiness.ok) {
  throw new Error("Core submit smoke failed: cross-origin task URL was accepted.");
}

const originalFetch = globalThis.fetch;
const fakeRun = {
  schema_version: "webenvoy.run-query.v0",
  run_id: "run_smoke_real_site_xhs_001",
  status: "succeeded",
  timeline: {
    created_at: "2026-07-06T10:00:00.000Z",
    updated_at: "2026-07-06T10:00:03.000Z",
    terminal_at: "2026-07-06T10:00:03.000Z",
  },
  task: {
    capability_ref: "lode:capability/search-notes",
    capability_version: "0.1.0",
    capability_source_ref: "lode://site-capability/xiaohongshu/search-notes@0.1.0",
    capability_lock_ref: "lode://lock/site-capability/xiaohongshu/search-notes@0.1.0",
    package_ref: "lode://site-capability/xiaohongshu/search-notes@0.1.0",
  },
  admission: {
    decision: "accepted",
    action_risk: "read",
  },
  runtime_refs: {
    session_binding: {
      runtime_session_ref: harborRuntimeSession.runtime_session_ref,
      control_owner: "core_task",
      lifecycle_state: "active",
      session_use: "core_task_run",
    },
  },
  terminal_summary: {
    terminal: true,
    status: "succeeded",
    result_ref: "result:core/xiaohongshu/search-notes/smoke",
    post_check: {
      schema_version: "webenvoy.post-check-result.v0",
      status: "passed",
      summary: "Smoke result refs are queryable.",
    },
  },
};

const submitFetchCalls = [];
globalThis.fetch = async (url, init = {}) => {
  const pathname = String(url);
  submitFetchCalls.push(`${init.method ?? "GET"} ${pathname}`);
  const submitRun = { ...fakeRun, run_id: "run_submit_xhs_001" };
  const json = pathname.endsWith("/tasks")
    ? { ok: true, run_id: submitRun.run_id }
    : pathname.endsWith(`/runs/${submitRun.run_id}`)
    ? { ok: true, run: submitRun }
    : pathname.endsWith("/result")
    ? {
        ok: true,
        result: {
          schema_version: "webenvoy.result-query.v0",
          run_id: submitRun.run_id,
          status: "succeeded",
          terminal: true,
          result: {
            envelope_state: "available",
            payload_state: "not_persisted_in_core",
            result_envelope: {
              result_kind: "xhs_note_search",
              result_ref: "result:core/xiaohongshu/search-notes/submitted",
              package_ref: "lode://site-capability/xiaohongshu/search-notes@0.1.0",
              evidence_refs: ["harbor:evidence/xiaohongshu/search-notes/submitted"],
            },
          },
        },
      }
    : pathname.endsWith("/evidence-refs")
    ? {
        ok: true,
        evidence: {
          evidence_refs: [
            {
              ref: "harbor:evidence/xiaohongshu/search-notes/submitted",
              source: "submit_smoke",
              state: "available",
              raw_access: "not_available_from_core",
              recorded_at: "2026-07-06T10:01:03.000Z",
              runtime_session_ref: harborRuntimeSession.runtime_session_ref,
            },
          ],
        },
      }
    : pathname.endsWith("/failure")
    ? { ok: true, failure_reason: { reason_class: "none", app_action: "none", retryable: false } }
    : pathname.endsWith("/session-refs")
    ? {
        ok: true,
        session_refs: {
          session_refs: {
            runtime_session_ref: harborRuntimeSession.runtime_session_ref,
            control_owner: "core_task",
            lifecycle_state: "active",
            session_use: "core_task_run",
          },
        },
      }
    : { ok: false, error: { code: "unexpected_submit_smoke_path" } };
  return {
    ok: true,
    status: 200,
    json: async () => json,
    text: async () => JSON.stringify(json),
  };
};
const submittedRun = await coreTaskSubmitClientModule.submitCoreReadOnlyTask(
  "http://core.test",
  readonlySubmitTask,
  liveRuntimeForSubmit,
  [readyXhsIdentity],
  { pollAttempts: 1, pollIntervalMs: 0 },
);
globalThis.fetch = originalFetch;

if (submittedRun.status !== "ready" || submittedRun.runId !== "run_submit_xhs_001") {
  throw new Error(`Core submit smoke failed: submit/poll did not return ready run: ${JSON.stringify(submittedRun)}`);
}

for (const expectedPath of ["/tasks", "/runs/run_submit_xhs_001", "/result", "/evidence-refs", "/failure", "/session-refs"]) {
  if (!submitFetchCalls.some((entry) => entry.includes(expectedPath))) {
    throw new Error(`Core submit smoke failed: ${expectedPath} was not consumed.`);
  }
}

if (!submittedRun.run.evidenceCards[0]?.summary.includes("harbor:evidence/xiaohongshu/search-notes/submitted")) {
  throw new Error("Core submit smoke failed: submitted run evidence refs were not projected.");
}

if (!submittedRun.run.resultRows.some((row) => row.value === harborRuntimeSession.runtime_session_ref)) {
  throw new Error("Core submit smoke failed: Harbor session ref from create/readback/session chain was not projected.");
}

globalThis.fetch = async (url, init = {}) => {
  const pathname = String(url);
  const json = pathname.endsWith("/tasks")
    ? { ok: true, run_id: "run_submit_pending_001" }
    : pathname.includes("/runs/run_submit_pending_001")
    ? { ok: false, error: { code: "run_not_queryable_yet" } }
    : { ok: false, error: { code: "unexpected_pending_smoke_path" } };
  return {
    ok: true,
    status: 200,
    json: async () => json,
    text: async () => JSON.stringify(json),
  };
};
const pendingRun = await coreTaskSubmitClientModule.submitCoreReadOnlyTask(
  "http://core.test",
  readonlySubmitTask,
  liveRuntimeForSubmit,
  [readyXhsIdentity],
  { pollAttempts: 2, pollIntervalMs: 0 },
);
globalThis.fetch = originalFetch;

if (pendingRun.status !== "polling" || pendingRun.runId !== "run_submit_pending_001") {
  throw new Error(`Core submit smoke failed: accepted-but-not-ready run was not kept in polling state: ${JSON.stringify(pendingRun)}`);
}

globalThis.fetch = async (url) => {
  const pathname = String(url);
  const json = pathname.includes("/capability-runs") && pathname.includes("search-notes")
    ? { ok: true, capability_runs: { runs: [fakeRun], latest_run: fakeRun } }
    : pathname.includes("/capability-runs")
    ? { ok: true, capability_runs: { runs: [] } }
    : pathname.endsWith("/result")
    ? {
        ok: true,
        result: {
          schema_version: "webenvoy.result-query.v0",
          run_id: fakeRun.run_id,
          status: "succeeded",
          terminal: true,
          result: {
            envelope_state: "available",
            payload_state: "not_persisted_in_core",
            result_ref: "result:core/xiaohongshu/search-notes/smoke",
            result_envelope: {
              result_kind: "xhs_note_search",
              result_ref: "result:core/xiaohongshu/search-notes/smoke",
              package_ref: "lode://site-capability/xiaohongshu/search-notes@0.1.0",
              evidence_refs: ["harbor:evidence/xiaohongshu/search-notes/snapshot"],
            },
          },
          evidence_refs: [
            {
              ref: "harbor:evidence/xiaohongshu/search-notes/snapshot",
              source: "admission_and_terminal",
              state: "available",
              raw_access: "not_available_from_core",
              recorded_at: "2026-07-06T10:00:03.000Z",
              runtime_session_ref: harborRuntimeSession.runtime_session_ref,
            },
          ],
        },
      }
    : pathname.endsWith("/evidence-refs")
    ? {
        ok: true,
        evidence: {
          evidence_refs: [],
        },
      }
    : pathname.endsWith("/failure")
    ? { ok: true, failure_reason: { reason_class: "none", app_action: "none", retryable: false } }
    : { ok: true, session_refs: { session_refs: { runtime_session_ref: harborRuntimeSession.runtime_session_ref } } };
  return {
    ok: true,
    json: async () => json,
  };
};
const coreReadState = await coreReadTaskClientModule.fetchCoreReadTaskState("http://core.test", [
  {
    id: "task-xhs-real-read",
    title: "小红书搜索与笔记读取",
    accountIdentity: "小红书运营号 A",
    siteSkill: "小红书搜索和笔记读取",
    businessInput: "关键词：AI 工具",
    source: "Core fixture",
    packageSource: {
      name: "@lode/xiaohongshu-read-only",
      version: "0.1.0",
      capabilityRef: "lode:capability/search-notes",
      sourceRef: "lode://site-capability/xiaohongshu/search-notes@0.1.0",
      fetchedAt: "fixture",
      source: "Lode fixture",
      boundary: "fixture",
    },
    runs: [],
  },
]);
globalThis.fetch = originalFetch;

if (coreReadState.status !== "ready" || coreReadState.tasks[0].runs[0]?.source !== "Core live") {
  throw new Error("Core read task smoke failed: live Core projection was not applied.");
}

if (!coreReadState.tasks[0].runs[0].evidenceCards[0]?.summary.includes("not_available_from_core")) {
  throw new Error("Core read task smoke failed: raw evidence boundary is missing.");
}

if (coreReadState.tasks[0].runs[0].failureRecovery) {
  throw new Error("Core read task smoke failed: reason_class none rendered as recoverable failure.");
}

if (coreReadState.tasks[0].runs[0].actionIntent.includes("none")) {
  throw new Error("Core read task smoke failed: app_action none rendered as an action intent.");
}

const bossFakeRun = {
  schema_version: "webenvoy.run-query.v0",
  run_id: "run_smoke_real_site_boss_001",
  status: "manual_recovery_required",
  timeline: {
    created_at: "2026-07-06T10:20:00.000Z",
    updated_at: "2026-07-06T10:20:03.000Z",
    terminal_at: "2026-07-06T10:20:03.000Z",
  },
  task: {
    capability_ref: "lode:capability/job-search",
    capability_version: "0.1.0",
    capability_source_ref: "lode://site-capability/boss/job-search@0.1.0",
    capability_lock_ref: "lode://lock/site-capability/boss/job-search@0.1.0",
    package_ref: "lode://site-capability/boss/job-search@0.1.0",
  },
  admission: {
    decision: "accepted",
    action_risk: "read",
  },
  runtime_refs: {
    session_binding: {
      runtime_session_ref: "harbor:runtime-session/boss/readonly",
      control_owner: "core_task",
      lifecycle_state: "active",
      session_use: "core_task_run",
    },
  },
  terminal_summary: {
    terminal: true,
    status: "manual_recovery_required",
    result_ref: "result:core/boss/job-search/smoke",
    post_check: {
      schema_version: "webenvoy.post-check-result.v0",
      status: "failed",
      summary: "Login recovery required before reading BOSS job cards.",
    },
    failure: {
      code: "login_required",
      category: "identity",
      phase: "admission",
      recovery_hint: "open_identity_session",
    },
  },
};
const bossFetchCalls = new Set();
globalThis.fetch = async (url) => {
  const pathname = String(url);
  const json = pathname.includes("/capability-runs")
    ? (bossFetchCalls.add("capability-runs"),
      pathname.includes("job-search")
        ? { ok: true, capability_runs: { runs: [bossFakeRun], latest_run: bossFakeRun } }
        : { ok: true, capability_runs: { runs: [] } })
    : pathname.endsWith("/result")
    ? (bossFetchCalls.add("result"),
      {
        ok: true,
        result: {
          schema_version: "webenvoy.result-query.v0",
          run_id: bossFakeRun.run_id,
          status: "manual_recovery_required",
          terminal: true,
          result: {
            envelope_state: "available",
            payload_state: "not_persisted_in_core",
            result_ref: "result:core/boss/job-search/smoke",
            result_envelope: {
              result_kind: "boss_job_search",
              result_ref: "result:core/boss/job-search/smoke",
              package_ref: "lode://site-capability/boss/job-search@0.1.0",
              evidence_refs: ["harbor:evidence/boss/job-search/login-required"],
            },
          },
        },
      })
    : pathname.endsWith("/evidence-refs")
    ? (bossFetchCalls.add("evidence"),
      {
        ok: true,
        evidence: {
          evidence_refs: [
            {
              ref: "harbor:evidence/boss/job-search/login-required",
              source: "core_failure",
              state: "available",
              raw_access: "not_available_from_core",
              recorded_at: "2026-07-06T10:20:03.000Z",
              runtime_session_ref: "harbor:runtime-session/boss/readonly",
            },
          ],
        },
      })
    : pathname.endsWith("/failure")
    ? (bossFetchCalls.add("failure"),
      {
        ok: true,
        failure_reason: {
          reason_class: "login_required",
          app_action: "open_identity_session",
          retryable: true,
          failure: {
            code: "login_required",
            category: "identity",
            phase: "admission",
            recovery_hint: "open_identity_session",
          },
        },
      })
    : pathname.endsWith("/session-refs")
    ? (bossFetchCalls.add("session"),
      {
        ok: true,
        session_refs: {
          session_refs: {
            runtime_session_ref: "harbor:runtime-session/boss/readonly",
            control_owner: "core_task",
            lifecycle_state: "active",
            session_use: "core_task_run",
          },
        },
      })
    : { ok: true };
  return {
    ok: true,
    json: async () => json,
  };
};
const bossCoreReadState = await coreReadTaskClientModule.fetchCoreReadTaskState("http://core.test", [
  {
    id: "task-boss-real-read",
    title: "BOSS 搜索与职位详情读取",
    accountIdentity: "BOSS 招聘号",
    siteSkill: "BOSS 搜索和职位详情读取",
    businessInput: "职位：前端工程师；城市：上海",
    source: "Core fixture",
    packageSource: {
      name: "@lode/boss-read-only",
      version: "0.1.0",
      capabilityRef: "lode:capability/job-search + lode:capability/read-job-detail",
      sourceRef: "lode://site-capability/boss/job-search@0.1.0 + lode://site-capability/boss/read-job-detail@0.1.0",
      fetchedAt: "fixture",
      source: "Lode fixture",
      boundary: "fixture",
    },
    runs: [],
  },
]);
globalThis.fetch = originalFetch;

const bossLiveRun = bossCoreReadState.tasks.find((task) => task.id === "task-boss-real-read")?.runs[0];

for (const expectedCall of ["capability-runs", "result", "evidence", "session"]) {
  if (!bossFetchCalls.has(expectedCall)) {
    throw new Error(`Core read task smoke failed: BOSS ${expectedCall} mock was not consumed.`);
  }
}

if (bossCoreReadState.status !== "ready" || bossLiveRun?.source !== "Core live") {
  throw new Error("Core read task smoke failed: BOSS live Core projection was not applied.");
}

if (bossLiveRun.capabilityAttribution?.failureClass !== "login_required") {
  throw new Error("Core read task smoke failed: BOSS failure class was swallowed.");
}

if (bossLiveRun.failureRecovery?.state !== "未登录" || !bossLiveRun.failureRecovery.nextActions[0]?.includes("open_identity_session")) {
  throw new Error("Core read task smoke failed: BOSS failure recovery action was swallowed.");
}

if (!bossLiveRun.actionIntent.includes("open_identity_session")) {
  throw new Error("Core read task smoke failed: BOSS action label was swallowed.");
}

globalThis.fetch = async (url) => {
  const pathname = String(url);
  const json = pathname.includes("/capability-runs")
    ? { ok: true, capability_runs: { runs: [fakeRun] } }
    : pathname.endsWith("/result")
    ? { ok: false, error: { code: "result_query_unavailable" } }
    : { ok: true, evidence: { evidence_refs: [] } };
  return {
    ok: true,
    json: async () => json,
  };
};
const failedDetailState = await coreReadTaskClientModule.fetchCoreReadTaskState("http://core.test", [
  {
    id: "task-xhs-real-read",
    title: "小红书搜索与笔记读取",
    accountIdentity: "小红书运营号 A",
    siteSkill: "小红书搜索和笔记读取",
    businessInput: "关键词：AI 工具",
    source: "Core fixture",
    packageSource: {
      name: "@lode/xiaohongshu-read-only",
      version: "0.1.0",
      capabilityRef: "lode:capability/search-notes",
      sourceRef: "lode://site-capability/xiaohongshu/search-notes@0.1.0",
      fetchedAt: "fixture",
      source: "Lode fixture",
      boundary: "fixture",
    },
    runs: [],
  },
]);
globalThis.fetch = originalFetch;

if (failedDetailState.status !== "offline" || failedDetailState.liveTaskIds.length !== 0) {
  throw new Error("Core read task smoke failed: per-run detail failure was treated as live projection.");
}

const olderRun = {
  ...fakeRun,
  run_id: "run_older_ok",
  timeline: {
    created_at: "2026-07-06T09:50:00.000Z",
    updated_at: "2026-07-06T09:50:03.000Z",
    terminal_at: "2026-07-06T09:50:03.000Z",
  },
};
const latestRunWithFailedDetail = {
  ...fakeRun,
  run_id: "run_latest_failed",
  timeline: {
    created_at: "2026-07-06T10:10:00.000Z",
    updated_at: "2026-07-06T10:10:03.000Z",
    terminal_at: "2026-07-06T10:10:03.000Z",
  },
};
globalThis.fetch = async (url) => {
  const pathname = String(url);
  const json = pathname.includes("/capability-runs") && pathname.includes("search-notes")
    ? { ok: true, capability_runs: { runs: [latestRunWithFailedDetail, olderRun] } }
    : pathname.includes("/capability-runs")
    ? { ok: true, capability_runs: { runs: [] } }
    : pathname.includes("/runs/run_latest_failed/result")
    ? { ok: false, error: { code: "latest_result_unavailable" } }
    : pathname.endsWith("/result")
    ? {
        ok: true,
        result: {
          schema_version: "webenvoy.result-query.v0",
          run_id: olderRun.run_id,
          status: "succeeded",
          terminal: true,
          result: {
            envelope_state: "available",
            payload_state: "not_persisted_in_core",
            result_envelope: {
              result_kind: "xhs_note_search",
              evidence_refs: ["harbor:evidence/xiaohongshu/search-notes/older"],
            },
          },
        },
      }
    : pathname.endsWith("/evidence-refs")
    ? { ok: true, evidence: { evidence_refs: [] } }
    : pathname.endsWith("/failure")
    ? { ok: true, failure_reason: { reason_class: "none", app_action: "none", retryable: false } }
    : { ok: true, session_refs: { session_refs: { runtime_session_ref: harborRuntimeSession.runtime_session_ref } } };
  return {
    ok: true,
    json: async () => json,
  };
};
const mixedDetailState = await coreReadTaskClientModule.fetchCoreReadTaskState("http://core.test", [
  {
    id: "task-xhs-real-read",
    title: "小红书搜索与笔记读取",
    accountIdentity: "小红书运营号 A",
    siteSkill: "小红书搜索和笔记读取",
    businessInput: "关键词：AI 工具",
    source: "Core fixture",
    packageSource: {
      name: "@lode/xiaohongshu-read-only",
      version: "0.1.0",
      capabilityRef: "lode:capability/search-notes",
      sourceRef: "lode://site-capability/xiaohongshu/search-notes@0.1.0",
      fetchedAt: "fixture",
      source: "Lode fixture",
      boundary: "fixture",
    },
    runs: [],
  },
]);
globalThis.fetch = originalFetch;

if (mixedDetailState.status !== "offline" || mixedDetailState.liveTaskIds.length !== 0) {
  throw new Error("Core read task smoke failed: mixed run detail failure was hidden by an older run.");
}

const writePreviewRuns = [
  {
    schema_version: "webenvoy.run-query.v0",
    run_id: "run_fixture_real_site_xiaohongshu_write_preview_001",
    status: "succeeded",
    timeline: { updated_at: "2026-07-06T11:00:04.000Z", terminal_at: "2026-07-06T11:00:04.000Z" },
    task: {
      capability_ref: "lode:capability/xiaohongshu-draft-precheck",
      capability_version: "0.1.0",
      capability_source_ref: "lode://site-capability/xiaohongshu/draft-precheck@0.1.0",
      package_ref: "lode://site-capability/xiaohongshu/draft-precheck@0.1.0",
    },
    admission: { action_risk: "write" },
    runtime_refs: {
      session_binding: { runtime_session_ref: "harbor:runtime-session/xiaohongshu/write-precheck" },
    },
  },
  {
    schema_version: "webenvoy.run-query.v0",
    run_id: "run_fixture_real_site_write_preview_cancelled_001",
    status: "cancelled",
    timeline: { updated_at: "2026-07-06T11:03:02.000Z", terminal_at: "2026-07-06T11:03:02.000Z" },
    task: {
      capability_ref: "lode:capability/xiaohongshu-draft-precheck",
      capability_version: "0.1.0",
      capability_source_ref: "lode://site-capability/xiaohongshu/draft-precheck@0.1.0",
      package_ref: "lode://site-capability/xiaohongshu/draft-precheck@0.1.0",
    },
    admission: { action_risk: "write" },
  },
  {
    schema_version: "webenvoy.run-query.v0",
    run_id: "run_fixture_real_site_write_preview_expired_001",
    status: "expired",
    timeline: { updated_at: "2026-07-06T11:14:01.000Z", terminal_at: "2026-07-06T11:14:01.000Z" },
    task: {
      capability_ref: "lode:capability/xiaohongshu-draft-precheck",
      capability_version: "0.1.0",
      capability_source_ref: "lode://site-capability/xiaohongshu/draft-precheck@0.1.0",
      package_ref: "lode://site-capability/xiaohongshu/draft-precheck@0.1.0",
    },
    admission: { action_risk: "write" },
  },
  {
    schema_version: "webenvoy.run-query.v0",
    run_id: "run_fixture_real_site_write_preview_page_changed_001",
    status: "failed",
    timeline: { updated_at: "2026-07-06T11:15:01.000Z", terminal_at: "2026-07-06T11:15:01.000Z" },
    task: {
      capability_ref: "lode:capability/xiaohongshu-draft-precheck",
      capability_version: "0.1.0",
      capability_source_ref: "lode://site-capability/xiaohongshu/draft-precheck@0.1.0",
      package_ref: "lode://site-capability/xiaohongshu/draft-precheck@0.1.0",
    },
    admission: { action_risk: "write" },
  },
];
const bossWritePreviewRuns = [
  {
    schema_version: "webenvoy.run-query.v0",
    run_id: "run_fixture_boss_preview_unavailable_001",
    status: "succeeded",
    timeline: { updated_at: "2026-07-06T11:20:01.000Z", terminal_at: "2026-07-06T11:20:01.000Z" },
    task: {
      capability_ref: "lode:capability/boss-greeting-precheck",
      capability_version: "0.1.0",
      capability_source_ref: "lode://site-capability/boss/greeting-precheck@0.1.0",
      package_ref: "lode://site-capability/boss/greeting-precheck@0.1.0",
    },
    admission: { action_risk: "write" },
  },
  {
    schema_version: "webenvoy.run-query.v0",
    run_id: "run_fixture_boss_blocked_available_missing_action_request_001",
    status: "blocked",
    timeline: { updated_at: "2026-07-06T11:19:30.000Z", terminal_at: "2026-07-06T11:19:30.000Z" },
    task: {
      capability_ref: "lode:capability/boss-greeting-precheck",
      capability_version: "0.1.0",
      capability_source_ref: "lode://site-capability/boss/greeting-precheck@0.1.0",
      package_ref: "lode://site-capability/boss/greeting-precheck@0.1.0",
    },
    admission: { action_risk: "write" },
  },
  {
    schema_version: "webenvoy.run-query.v0",
    run_id: "run_fixture_boss_available_unknown_submitted_001",
    status: "succeeded",
    timeline: { updated_at: "2026-07-06T11:19:01.000Z", terminal_at: "2026-07-06T11:19:01.000Z" },
    task: {
      capability_ref: "lode:capability/boss-greeting-precheck",
      capability_version: "0.1.0",
      capability_source_ref: "lode://site-capability/boss/greeting-precheck@0.1.0",
      package_ref: "lode://site-capability/boss/greeting-precheck@0.1.0",
    },
    admission: { action_risk: "write" },
  },
  {
    schema_version: "webenvoy.run-query.v0",
    run_id: "run_fixture_boss_available_true_submitted_001",
    status: "succeeded",
    timeline: { updated_at: "2026-07-06T11:18:01.000Z", terminal_at: "2026-07-06T11:18:01.000Z" },
    task: {
      capability_ref: "lode:capability/boss-greeting-precheck",
      capability_version: "0.1.0",
      capability_source_ref: "lode://site-capability/boss/greeting-precheck@0.1.0",
      package_ref: "lode://site-capability/boss/greeting-precheck@0.1.0",
    },
    admission: { action_risk: "write" },
  },
  {
    schema_version: "webenvoy.run-query.v0",
    run_id: "run_fixture_boss_generic_blocked_001",
    status: "blocked",
    timeline: { updated_at: "2026-07-06T11:17:01.000Z", terminal_at: "2026-07-06T11:17:01.000Z" },
    task: {
      capability_ref: "lode:capability/boss-greeting-precheck",
      capability_version: "0.1.0",
      capability_source_ref: "lode://site-capability/boss/greeting-precheck@0.1.0",
      package_ref: "lode://site-capability/boss/greeting-precheck@0.1.0",
    },
    admission: { action_risk: "write" },
  },
  {
    schema_version: "webenvoy.run-query.v0",
    run_id: "run_fixture_boss_failed_available_false_submitted_001",
    status: "failed",
    timeline: { updated_at: "2026-07-06T11:16:30.000Z", terminal_at: "2026-07-06T11:16:30.000Z" },
    task: {
      capability_ref: "lode:capability/boss-greeting-precheck",
      capability_version: "0.1.0",
      capability_source_ref: "lode://site-capability/boss/greeting-precheck@0.1.0",
      package_ref: "lode://site-capability/boss/greeting-precheck@0.1.0",
    },
    admission: { action_risk: "write" },
  },
  {
    schema_version: "webenvoy.run-query.v0",
    run_id: "run_fixture_boss_generic_failed_001",
    status: "failed",
    timeline: { updated_at: "2026-07-06T11:16:01.000Z", terminal_at: "2026-07-06T11:16:01.000Z" },
    task: {
      capability_ref: "lode:capability/boss-greeting-precheck",
      capability_version: "0.1.0",
      capability_source_ref: "lode://site-capability/boss/greeting-precheck@0.1.0",
      package_ref: "lode://site-capability/boss/greeting-precheck@0.1.0",
    },
    admission: { action_risk: "write" },
  },
];
globalThis.fetch = async (url) => {
  const pathname = String(url);
  const runId = decodeURIComponent(pathname.match(/\/runs\/([^/]+)/)?.[1] ?? "");
  const json = pathname.includes("/capability-runs") && pathname.includes("xiaohongshu-draft-precheck")
    ? { ok: true, capability_runs: { runs: writePreviewRuns } }
    : pathname.includes("/capability-runs") && pathname.includes("boss-greeting-precheck")
    ? { ok: true, capability_runs: { runs: bossWritePreviewRuns } }
    : pathname.endsWith("/result") && runId.includes("page_changed")
    ? {
        ok: true,
        result: {
          schema_version: "webenvoy.result-query.v0",
          run_id: runId,
          status: "failed",
          terminal: true,
          failure: { code: "page_changed", category: "page_state", phase: "precheck" },
          result: {
            envelope_state: "available",
            payload_state: "not_persisted_in_core",
            result_envelope: {
              result_kind: "real_page_write_precheck_projection",
              preview_result: {
                schema_version: "webenvoy.preview-result.v0",
                state: "available",
                submitted: false,
                expected_change: { summary: "Page changed after the write-precheck preview was captured." },
                action_refs: { action_request_id: "action-request:intent_real_site_xiaohongshu_page_changed" },
              },
              failure: { code: "page_changed", category: "page_state", phase: "precheck" },
            },
          },
          evidence_refs: [],
        },
      }
    : pathname.endsWith("/result") && runId.includes("expired")
    ? {
        ok: true,
        result: {
          schema_version: "webenvoy.result-query.v0",
          run_id: runId,
          status: "expired",
          terminal: true,
          result: {
            envelope_state: "available",
            payload_state: "expired",
            result_envelope: {
              result_kind: "real_page_write_precheck_projection",
              preview_result: {
                schema_version: "webenvoy.preview-result.v0",
                state: "available",
                submitted: false,
                expected_change: { summary: "Expired owner run still returned a stale preview." },
                action_refs: { action_request_id: "action-request:intent_real_site_xiaohongshu_expired" },
              },
            },
          },
          evidence_refs: [],
        },
      }
    : pathname.endsWith("/result") && runId.includes("boss_preview_unavailable")
    ? {
        ok: true,
        result: {
          schema_version: "webenvoy.result-query.v0",
          run_id: runId,
          status: "succeeded",
          terminal: true,
          result: {
            envelope_state: "available",
            payload_state: "not_persisted_in_core",
            result_envelope: {
              result_kind: "real_page_write_precheck_projection",
              preview_result: {
                schema_version: "webenvoy.preview-result.v0",
                state: "preview_unavailable",
                submitted: false,
                expected_change: {
                  summary: "BOSS 打招呼写前验证不可用，不发送消息。",
                  target_ref: "harbor:writable-target/boss/greeting-box",
                  external_submit: false,
                },
                action_refs: { action_request_id: "action-request:intent_real_site_boss_greeting_preview_unavailable" },
                capability: {
                  capability_ref: "lode:capability/boss-greeting-precheck",
                  capability_version: "0.1.0",
                  capability_source_ref: "lode://site-capability/boss/greeting-precheck@0.1.0",
                },
                evidence_refs: ["harbor:evidence/boss/greeting/preview-result-only"],
                consumer_boundary: "Core blocked this preview before approval; it is not submitted.",
              },
            },
          },
          evidence_refs: [],
        },
      }
    : pathname.endsWith("/result") && runId.includes("boss_blocked_available_missing_action_request")
    ? {
        ok: true,
        result: {
          schema_version: "webenvoy.result-query.v0",
          run_id: runId,
          status: "blocked",
          terminal: true,
          result: {
            envelope_state: "available",
            payload_state: "not_persisted_in_core",
            result_envelope: {
              result_kind: "real_page_write_precheck_projection",
              preview_result: {
                schema_version: "webenvoy.preview-result.v0",
                state: "available",
                submitted: false,
                expected_change: { summary: "BOSS message preview conflicts with a blocked owner run." },
              },
            },
          },
          evidence_refs: [],
        },
      }
    : pathname.endsWith("/result") && runId.includes("boss_available_unknown_submitted")
    ? {
        ok: true,
        result: {
          schema_version: "webenvoy.result-query.v0",
          run_id: runId,
          status: "succeeded",
          terminal: true,
          result: {
            envelope_state: "available",
            payload_state: "not_persisted_in_core",
            result_envelope: {
              result_kind: "real_page_write_precheck_projection",
              preview_result: {
                schema_version: "webenvoy.preview-result.v0",
                state: "available",
                expected_change: { summary: "BOSS message preview missing submitted owner truth." },
                action_refs: { action_request_id: "action-request:intent_real_site_boss_greeting_unknown_submitted" },
              },
            },
          },
          evidence_refs: [],
        },
      }
    : pathname.endsWith("/result") && runId.includes("boss_available_true_submitted")
    ? {
        ok: true,
        result: {
          schema_version: "webenvoy.result-query.v0",
          run_id: runId,
          status: "succeeded",
          terminal: true,
          result: {
            envelope_state: "available",
            payload_state: "not_persisted_in_core",
            result_envelope: {
              result_kind: "real_page_write_precheck_projection",
              preview_result: {
                schema_version: "webenvoy.preview-result.v0",
                state: "available",
                submitted: true,
                expected_change: { summary: "BOSS message preview reported submitted true." },
                action_refs: { action_request_id: "action-request:intent_real_site_boss_greeting_true_submitted" },
              },
            },
          },
          evidence_refs: [],
        },
      }
    : pathname.endsWith("/result") && runId.includes("boss_failed_available_false_submitted")
    ? {
        ok: true,
        result: {
          schema_version: "webenvoy.result-query.v0",
          run_id: runId,
          status: "failed",
          terminal: true,
          result: {
            envelope_state: "available",
            payload_state: "not_persisted_in_core",
            result_envelope: {
              result_kind: "real_page_write_precheck_projection",
              preview_result: {
                schema_version: "webenvoy.preview-result.v0",
                state: "available",
                submitted: false,
                expected_change: { summary: "BOSS failed owner run still returned preview.available + submitted=false." },
                action_refs: { action_request_id: "action-request:intent_real_site_boss_failed_available_false" },
              },
            },
          },
          evidence_refs: [],
        },
      }
    : pathname.endsWith("/result") && runId.includes("boss_generic_")
    ? {
        ok: true,
        result: {
          schema_version: "webenvoy.result-query.v0",
          run_id: runId,
          status: runId.includes("failed") ? "failed" : "blocked",
          terminal: true,
          result: { envelope_state: "unavailable", payload_state: "not_reported" },
          evidence_refs: [],
        },
      }
    : pathname.endsWith("/result")
    ? {
        ok: true,
        result: {
          schema_version: "webenvoy.result-query.v0",
          run_id: runId,
          status: runId.includes("cancelled") ? "cancelled" : "succeeded",
          terminal: true,
          result: {
            envelope_state: "available",
            payload_state: "not_persisted_in_core",
            result_envelope: {
              result_kind: "real_page_write_precheck_projection",
              preview_result: {
                schema_version: "webenvoy.preview-result.v0",
                state: "available",
                submitted: false,
                expected_change: {
                  summary: "预览小红书草稿编辑器可写字段和预期草稿变化，不保存、不发布。",
                  target_ref: "harbor:writable-target/xiaohongshu/draft-editor",
                  external_submit: false,
                },
                action_refs: { action_request_id: "action-request:intent_real_site_xiaohongshu_draft_preview" },
                capability: {
                  capability_ref: "lode:capability/xiaohongshu-draft-precheck",
                  capability_version: "0.1.0",
                  capability_source_ref: "lode://site-capability/xiaohongshu/draft-precheck@0.1.0",
                },
                evidence_refs: [
                  "harbor:evidence/xiaohongshu/draft-editor/precheck",
                  "harbor:evidence/xiaohongshu/draft-editor/preview-result-only",
                ],
                consumer_boundary: "Core preview result is validate-only/draft/preview projection; it is not submitted result.",
              },
            },
          },
          evidence_refs: [
            {
              ref: "harbor:evidence/xiaohongshu/draft-editor/precheck",
              source: "terminal",
              state: "available",
              raw_access: "not_available_from_core",
              recorded_at: "2026-07-06T11:00:04.000Z",
              runtime_session_ref: "harbor:runtime-session/xiaohongshu/write-precheck",
            },
          ],
        },
      }
    : pathname.endsWith("/evidence-refs")
    ? { ok: true, evidence: { evidence_refs: [] } }
    : pathname.endsWith("/failure")
    ? { ok: true, failure_reason: { reason_class: "none", app_action: "none", retryable: false } }
    : pathname.endsWith("/session-refs")
    ? { ok: true, session_refs: { session_refs: { runtime_session_ref: "harbor:runtime-session/xiaohongshu/write-precheck" } } }
    : { ok: true, capability_runs: { runs: [] } };
  return { ok: true, json: async () => json };
};
const writePreviewState = await coreReadTaskClientModule.fetchCoreReadTaskState("http://core.test", [
  {
    id: "task-xhs-publish-write-preview",
    title: "小红书发布草稿写前验证",
    accountIdentity: "小红书运营号 A",
    siteSkill: "小红书发布草稿写前预览",
    businessInput: "笔记标题：AI 工具清单",
    source: "Core fixture",
    packageSource: {
      name: "@lode/xiaohongshu-write-pre-preview",
      version: "0.1.0",
      capabilityRef: "lode://capability/xiaohongshu/publish-draft-write-preview",
      sourceRef: "lode://package/xiaohongshu-write-pre-preview@0.1.0",
      fetchedAt: "fixture",
      source: "Lode fixture",
      boundary: "fixture",
    },
    runs: [],
  },
  {
    id: "task-boss-greeting-write-preview",
    title: "BOSS 打招呼写前验证",
    accountIdentity: "BOSS 招聘号",
    siteSkill: "BOSS 打招呼写前预览",
    businessInput: "候选人：前端工程师",
    source: "Core fixture",
    packageSource: {
      name: "@lode/boss-greeting-write-pre-preview",
      version: "0.1.0",
      capabilityRef: "lode://capability/boss/greeting-write-preview",
      sourceRef: "lode://package/boss-greeting-write-pre-preview@0.1.0",
      fetchedAt: "fixture",
      source: "Lode fixture",
      boundary: "fixture",
    },
    runs: [],
  },
]);
globalThis.fetch = originalFetch;

const writePreviewTask = writePreviewState.tasks.find((task) => task.id === "task-xhs-publish-write-preview");
const bossWritePreviewTask = writePreviewState.tasks.find((task) => task.id === "task-boss-greeting-write-preview");

if (!writePreviewTask || !bossWritePreviewTask) {
  throw new Error("Core write-precheck smoke failed: expected live write-precheck tasks are missing.");
}

const writePreviewStates = writePreviewTask.runs.map((run) => run.writePrecheck?.state);

if (writePreviewState.status !== "ready" || writePreviewTask.source !== "Core live" || bossWritePreviewTask.source !== "Core live") {
  throw new Error("Core write-precheck smoke failed: live Core projection was not applied.");
}

for (const expectedState of ["available", "user_cancelled", "expired", "page_changed"]) {
  if (!writePreviewStates.includes(expectedState)) {
    throw new Error(`Core write-precheck smoke failed: ${expectedState} state was not projected.`);
  }
}

if (!writePreviewTask.runs.some((run) => run.resultRows.some((row) => row.label === "Submitted" && row.value === "false / 未提交"))) {
  throw new Error("Core write-precheck smoke failed: submitted=false boundary is missing when Core reports submitted=false.");
}

if (!writePreviewTask.runs.some((run) => run.fieldSources?.some((field) => field.evidenceRef === "harbor:evidence/xiaohongshu/draft-editor/preview-result-only"))) {
  throw new Error("Core write-precheck smoke failed: preview_result evidence_refs were dropped.");
}

if (!writePreviewTask.runs.some((run) => run.approval?.statuses.some((status) => status.status === "pending"))) {
  throw new Error("Core write-precheck smoke failed: pending approval state is missing.");
}

if (bossWritePreviewTask.runs.some((run) => run.lifecycle !== "blocked" || run.approval?.statuses.some((status) => status.status === "pending"))) {
  throw new Error("Core BOSS write-precheck smoke failed: unsafe previews were not blocked.");
}

const terminalConflictCases = [
  {
    label: "failed + preview.available + submitted=false",
    run: bossWritePreviewTask.runs.find((run) => run.id.includes("boss_failed_available_false_submitted")),
    status: "failed",
    state: "preview_unavailable",
    lifecycle: "blocked",
  },
  {
    label: "expired + preview.available + submitted=false",
    run: writePreviewTask.runs.find((run) => run.id.includes("expired")),
    status: "expired",
    state: "expired",
    lifecycle: "blocked",
  },
  {
    label: "cancelled + preview.available + submitted=false",
    run: writePreviewTask.runs.find((run) => run.id.includes("cancelled")),
    status: "cancelled",
    state: "user_cancelled",
    lifecycle: "completed",
  },
  {
    label: "page_changed + preview.available + submitted=false",
    run: writePreviewTask.runs.find((run) => run.id.includes("page_changed")),
    status: "failed",
    state: "page_changed",
    lifecycle: "blocked",
  },
];

for (const { label, run, status, state, lifecycle } of terminalConflictCases) {
  if (!run) {
    throw new Error(`Core write-precheck smoke failed: ${label} fixture is missing.`);
  }
  if (
    run.writePrecheck?.state !== state ||
    run.lifecycle !== lifecycle ||
    run.approval?.riskLevel === "low" ||
    run.approval?.statuses.some((approvalStatus) => approvalStatus.status === "pending") ||
    !run.resultRows.some((row) => row.label === "Run status" && row.value === status) ||
    !run.resultRows.some((row) => row.label === "Submitted" && row.value === "false / 未提交")
  ) {
    throw new Error(`Core write-precheck smoke failed: ${label} was displayed as pending/low approval or lost owner terminal facts.`);
  }
}

if (!bossWritePreviewTask.runs.some((run) => run.resultRows.some((row) => row.label === "Submitted" && row.value === "unknown / blocked"))) {
  throw new Error("Core BOSS write-precheck smoke failed: unknown submitted state was not shown.");
}

if (!bossWritePreviewTask.runs.some((run) => run.resultRows.some((row) => row.label === "Submitted" && row.value === "true / blocked"))) {
  throw new Error("Core BOSS write-precheck smoke failed: submitted=true state was not blocked.");
}

const blockedAvailableRun = bossWritePreviewTask.runs.find((run) => run.id.includes("boss_blocked_available_missing_action_request"));

if (!blockedAvailableRun) {
  throw new Error("Core BOSS write-precheck smoke failed: blocked available conflict fixture is missing.");
}

if (
  blockedAvailableRun.writePrecheck?.state === "available" ||
  blockedAvailableRun.lifecycle !== "blocked" ||
  blockedAvailableRun.approval?.riskLevel === "low" ||
  blockedAvailableRun.approval?.statuses.some((status) => status.status === "pending")
) {
  throw new Error("Core BOSS write-precheck smoke failed: blocked owner state displayed as pending/low approval.");
}

if (blockedAvailableRun.approval?.actionRequestId.startsWith("action-request:")) {
  throw new Error("Core BOSS write-precheck smoke failed: missing action_request_id was synthesized from run_id.");
}

if (!bossWritePreviewTask.runs.some((run) => run.fieldSources?.some((field) => field.evidenceRef === "harbor:evidence/boss/greeting/preview-result-only"))) {
  throw new Error("Core BOSS write-precheck smoke failed: preview_result evidence refs were not projected.");
}

async function assertPackagedRuntimeRequiredFailsClosed() {
  const tempDir = await mkdtemp(path.join(tmpdir(), "webenvoy-runtime-assets-smoke-"));
  try {
    const result = spawnSync(process.execPath, [path.resolve("scripts/package-runtime-assets.mjs")], {
      cwd: tempDir,
      encoding: "utf8",
      env: {
        ...process.env,
        WEBENVOY_REQUIRE_PACKAGED_RUNTIME: "1",
        WEBENVOY_CORE_RUNTIME_SOURCE_DIR: path.join(tempDir, "missing-core"),
        WEBENVOY_HARBOR_RUNTIME_SOURCE_DIR: path.join(tempDir, "missing-harbor"),
      },
    });
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status === 0 || !output.includes("Packaged runtime assets blocked")) {
      throw new Error(`Runtime asset packaging smoke failed: missing assets did not fail closed. ${output}`);
    }
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function startHarborIdentityContractServer() {
  let created = false;
  const identity = harborIdentityFacts();
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const pathname = url.pathname;

    if (request.method === "GET" && ["/runtime/browser-providers", "/runtime/browser-provider-status", "/browser-providers"].includes(pathname)) {
      sendJson(response, 200, harborProviderCatalog());
      return;
    }

    if (request.method === "GET" && ["/runtime/identity-environments", "/identity-environments", "/runtime/local-identity-environments"].includes(pathname)) {
      sendJson(response, 200, { items: created ? [identity] : [] });
      return;
    }

    if (request.method === "POST" && pathname === "/runtime/identity-environments") {
      const body = await readRequestJson(request);
      created = body?.identity_environment_ref === identity.identity_environment_ref;
      sendJson(response, created ? 200 : 422, created ? { ok: true, identity_environment: identity } : { ok: false, error: "identity_ref_mismatch" });
      return;
    }

    if (request.method === "POST" && ["/runtime/identity-environment-sessions", "/runtime/sessions/identity-environment", "/identity-environment-sessions"].includes(pathname)) {
      const body = await readRequestJson(request);
      const managedRefRequest =
        body?.identity_environment_ref === identity.identity_environment_ref &&
        body?.identity_environment == null &&
        body?.headless === false &&
        body?.control_owner === "user";
      sendJson(
        response,
        created && managedRefRequest ? 200 : 409,
        created && managedRefRequest
          ? harborRuntimeSessionFacts(body?.url)
          : { ok: false, error: created ? "managed_identity_ref_required" : "identity_not_created" },
      );
      return;
    }

    sendJson(response, 404, { status: "missing" });
  });

  await new Promise((resolve, reject) => {
    server.on("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Could not allocate a local Harbor contract smoke port.");
  }

  return {
    endpoint: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  };
}

function harborProviderCatalog() {
  return {
    schema_version: "harbor-browser-provider-status/v0",
    providers: [
      {
        provider_id: "cloakbrowser",
        display_name: "CloakBrowser",
        role: "primary",
        install: {
          status: "installed",
          path: "/Applications/CloakBrowser.app",
          version: "smoke",
          launchability: "launchable",
          reason: null,
        },
        limitations: [],
        diagnostics: [{ app_summary: "Local contract smoke provider; no browser was launched.", suggested_action: "none" }],
      },
    ],
    excluded_providers: [{ provider: "chromium", reason: "not identity-stable for production App runtime" }],
  };
}

function harborIdentityFacts() {
  return {
    schema_version: "harbor-local-identity-environment/v0",
    identity_environment_ref: "harbor://identity-environment/xhs-smoke",
    execution_identity_ref: "harbor://execution-identity/xhs-smoke",
    profile_ref: "harbor://profile/xhs-smoke",
    site_binding: {
      site_id: "xiaohongshu",
      origin: "https://www.xiaohongshu.com",
      display_name: "小红书",
      account_label: "运营号 smoke",
    },
    login_state: {
      state: "logged_in",
      reason: "local contract smoke only",
      recovery_required: false,
      manual_authentication_state: "not_required",
      human_verification: [],
    },
    browser_storage: {
      profile_storage_ref: "harbor://profile-storage/xhs-smoke",
      state: "present",
      cookies_session_state: "present",
    },
    environment: {
      proxy: { state: "configured", proxy_ref: "proxy:smoke", label: "local contract proxy ref" },
      region: "CN-SH",
      language: "zh-CN",
      timezone: "Asia/Shanghai",
      browser_family: "cloakbrowser",
      user_agent_summary: "Chrome family smoke",
      viewport: "1440 x 900",
      fingerprint_summary: "provider_claim_smoke",
    },
    provider_binding: {
      selected_provider_id: "cloakbrowser",
      selection_reason: "smoke_create_readback",
      requires_user_notice: false,
      selected_provider: harborProviderCatalog().providers[0],
      warnings: [],
      unavailable_reason: null,
    },
    credential_recovery: {
      credential_ref: "credential:smoke-ref",
      recovery_actions: [],
    },
    diagnostics: [],
  };
}

function harborRuntimeSessionFacts(requestedUrl) {
  const url = typeof requestedUrl === "string" ? requestedUrl : "https://www.xiaohongshu.com/explore";
  return {
    schema_version: "harbor-runtime-facts/v0",
    runtime_session_ref: "harbor:runtime-session/xhs-smoke/readonly",
    provider_ref: "harbor:provider/cloakbrowser",
    lifecycle_state: "active",
    created_at: "2026-07-09T12:00:00.000Z",
    last_seen_at: "2026-07-09T12:00:01.000Z",
    viewer_ref: "harbor:viewer/xhs-smoke/readonly",
    current_page: {
      requested_url: url,
      current_url: url,
      title: "小红书 - smoke",
      status: "ready",
    },
    control_owner: "user",
    control_lock: { owner: "user", state: "held" },
    current_error: null,
  };
}

async function readRequestJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (chunks.length === 0) return null;
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return null;
  }
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(`${JSON.stringify(body)}\n`);
}

async function startJsonServer(bodyForPath) {
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const body = bodyForPath(url.pathname);
    if (body == null) {
      response.writeHead(404, {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      });
      response.end(`${JSON.stringify({ status: "missing" })}\n`);
      return;
    }
    response.writeHead(200, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    });
    response.end(`${JSON.stringify(body)}\n`);
  });

  await new Promise((resolve, reject) => {
    server.on("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Could not allocate a local smoke server port.");
  }

  return {
    endpoint: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  };
}

console.log("WebEnvoy desktop shell smoke passed.");
process.exit(0);
