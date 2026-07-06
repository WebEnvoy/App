import { access, readFile } from "node:fs/promises";
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
const harborIdentityTypesSource = await readFile("src/renderer/harborIdentityTypes.ts", "utf8");
const localIdentityStoreSource = await readFile("src/renderer/localIdentityEnvironmentStore.ts", "utf8");
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

if (!preloadSource.includes("webenvoyShell")) {
  throw new Error("Preload smoke failed: shell bridge is missing.");
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
  "Browser session",
  "Harbor Browser provider fixture",
  "browser-session://local-chrome/manual-001",
  "viewer://harbor/local-chrome/manual-001",
  "Provider private endpoint",
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
  "创建本地身份环境配置",
  "导入 Harbor public summary",
  "保存本地允许配置",
  "不保存账号密码、Cookie、token、profile 原始内容",
  "真实任务运行由 #238 后续接入",
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
]) {
  if (!rendererAssets.includes(expectedText)) {
    throw new Error(`Renderer smoke failed: ${expectedText} is missing.`);
  }
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

function installLocalStorage(entries = {}) {
  const store = new Map(Object.entries(entries));

  globalThis.window = {
    localStorage: {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => store.set(key, value),
    },
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

console.log("WebEnvoy desktop shell smoke passed.");
