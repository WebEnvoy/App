import type { OwnerSource } from "./taskThreadFixtures";

export type IdentityStatus = "ready" | "needs-auth" | "warning" | "blocked" | "unknown";

export type IdentityEnvironmentProjection = {
  id: string;
  name: string;
  siteName: "小红书" | "BOSS";
  siteId: "xiaohongshu" | "boss";
  origin: string;
  accountLabel: string;
  source: OwnerSource;
  fetchedAt: string;
  identityEnvironmentRef: string;
  executionIdentityRef: string;
  profileRef: string;
  provider: {
    selected: "CloakBrowser" | "官方 Chrome" | "未可用";
    role: "默认主力" | "受限后备" | "不可启动";
    state: IdentityStatus;
    reason: string;
  };
  login: {
    state: "已登录" | "未登录" | "已过期" | "需要人工认证" | "未知";
    recoveryRequired: boolean;
    manualAuthenticationState: "无需认证" | "需要认证" | "认证中" | "已完成" | "认证失败";
    recoveryActions: string[];
    reason: string;
  };
  environment: {
    proxy: string;
    region: string;
    language: string;
    timezone: string;
    browser: string;
    userAgent: string;
    viewport: string;
    fingerprint: string;
  };
  storage: {
    profileStorage: "存在" | "缺失" | "未知";
    cookies: "存在" | "缺失" | "过期" | "未知";
    credentialRef: "已绑定本机引用" | "未绑定" | "未知";
  };
  readiness: {
    state: IdentityStatus;
    label: string;
    reasons: string[];
  };
  siteBindings: string[];
};

export const identityEnvironmentFixtures: IdentityEnvironmentProjection[] = [
  {
    id: "identity-xhs-ops-a",
    name: "小红书运营号 A",
    siteName: "小红书",
    siteId: "xiaohongshu",
    origin: "https://www.xiaohongshu.com",
    accountLabel: "运营号 A",
    source: "Harbor fixture",
    fetchedAt: "2026-07-06T08:46:00Z",
    identityEnvironmentRef: "harbor://identity-environment/xhs-ops-a",
    executionIdentityRef: "harbor://execution-identity/xhs-ops-a",
    profileRef: "harbor://profile/xhs-ops-a",
    provider: {
      selected: "CloakBrowser",
      role: "默认主力",
      state: "ready",
      reason: "Harbor 默认选择 CloakBrowser；官方 Chrome 仅作 fallback/dev/manual。",
    },
    login: {
      state: "已登录",
      recoveryRequired: false,
      manualAuthenticationState: "无需认证",
      recoveryActions: [],
      reason: "Harbor public summary 显示登录态可用。",
    },
    environment: {
      proxy: "上海住宅代理 · proxy_ref 已配置",
      region: "CN-SH",
      language: "zh-CN",
      timezone: "Asia/Shanghai",
      browser: "CloakBrowser 145",
      userAgent: "Chrome family / desktop",
      viewport: "1440 x 900",
      fingerprint: "provider_claim: cloak-native-fingerprint / validation required",
    },
    storage: {
      profileStorage: "存在",
      cookies: "存在",
      credentialRef: "已绑定本机引用",
    },
    readiness: {
      state: "ready",
      label: "可用于只读任务",
      reasons: ["provider、代理、地区、语言、时区和登录态均有 Harbor 摘要。"],
    },
    siteBindings: ["小红书搜索和笔记读取", "小红书发布草稿写前预览"],
  },
  {
    id: "identity-boss-recruiter",
    name: "BOSS 招聘号",
    siteName: "BOSS",
    siteId: "boss",
    origin: "https://www.zhipin.com",
    accountLabel: "招聘号",
    source: "Harbor fixture",
    fetchedAt: "2026-07-06T08:47:00Z",
    identityEnvironmentRef: "harbor://identity-environment/boss-recruiter",
    executionIdentityRef: "harbor://execution-identity/boss-recruiter",
    profileRef: "harbor://profile/boss-recruiter",
    provider: {
      selected: "CloakBrowser",
      role: "默认主力",
      state: "warning",
      reason: "Harbor 选择 CloakBrowser，但现场观测缺少最新登录确认。",
    },
    login: {
      state: "需要人工认证",
      recoveryRequired: true,
      manualAuthenticationState: "需要认证",
      recoveryActions: ["扫码", "二次验证"],
      reason: "登录恢复由 Harbor 浏览器现场完成；App 不读取验证码或密码。",
    },
    environment: {
      proxy: "北京办公出口 · proxy_ref 已配置",
      region: "CN-BJ",
      language: "zh-CN",
      timezone: "Asia/Shanghai",
      browser: "CloakBrowser 145",
      userAgent: "Chrome family / desktop",
      viewport: "1366 x 900",
      fingerprint: "configured: stable desktop fingerprint summary",
    },
    storage: {
      profileStorage: "存在",
      cookies: "过期",
      credentialRef: "已绑定本机引用",
    },
    readiness: {
      state: "needs-auth",
      label: "需要人工认证",
      reasons: ["登录态过期", "需要扫码或二次验证", "任务运行前必须刷新 Harbor 状态。"],
    },
    siteBindings: ["BOSS 搜索和职位详情读取", "BOSS 打招呼写前预览"],
  },
  {
    id: "identity-local-chrome-dev",
    name: "本机 Chrome 开发环境",
    siteName: "小红书",
    siteId: "xiaohongshu",
    origin: "https://www.xiaohongshu.com",
    accountLabel: "未绑定账号",
    source: "Harbor fixture",
    fetchedAt: "2026-07-06T08:48:00Z",
    identityEnvironmentRef: "harbor://identity-environment/local-chrome-dev",
    executionIdentityRef: "harbor://execution-identity/local-chrome-dev",
    profileRef: "harbor://profile/local-chrome-dev",
    provider: {
      selected: "官方 Chrome",
      role: "受限后备",
      state: "warning",
      reason: "CloakBrowser 缺失或不可启动时才使用；不提供原生指纹控制。",
    },
    login: {
      state: "未知",
      recoveryRequired: true,
      manualAuthenticationState: "需要认证",
      recoveryActions: ["手动登录"],
      reason: "Chrome fallback/dev/manual 不能证明站点任务身份连续性。",
    },
    environment: {
      proxy: "缺失",
      region: "未知",
      language: "zh-CN",
      timezone: "Asia/Shanghai",
      browser: "Google Chrome",
      userAgent: "Chrome official / desktop",
      viewport: "系统默认",
      fingerprint: "not_configured",
    },
    storage: {
      profileStorage: "未知",
      cookies: "未知",
      credentialRef: "未绑定",
    },
    readiness: {
      state: "blocked",
      label: "不建议运行站点任务",
      reasons: ["缺少代理", "缺少指纹摘要", "官方 Chrome 只作为 fallback/dev/manual。"],
    },
    siteBindings: ["开发调试", "人工登录准备"],
  },
];

export const identityEnvironmentBoundaries = [
  "身份环境、登录态、provider 和一致性事实归属 Harbor；App 只展示 public summary 和发送用户意图。",
  "敏感材料只显示状态或脱敏引用；密码、Cookie、令牌、profile storage 和 raw evidence 不进入 App。",
  "Provider 只展示 CloakBrowser 和官方 Chrome；Chromium 是内部开发实现，Donut Browser 只作机制参考。",
];
