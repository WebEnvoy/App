import type { OwnerSource } from "./taskThreadFixtures";

export type SiteSkillStatus = "ready" | "fixture" | "needs-identity" | "unavailable";

export type SiteSkill = {
  id: string;
  name: string;
  category: "电商" | "内容发布" | "账号身份" | "诊断";
  description: string;
  status: SiteSkillStatus;
  source: OwnerSource;
  packageName: string;
  version: string;
  latestVersion: string;
  installState: "not-installed" | "installed" | "locked";
  updateState: "latest" | "update-available" | "blocked";
  risk: "low" | "medium" | "blocked";
  capabilityRef: string;
  packageRef: string;
  lockRef?: string;
  fetchedAt: string;
  sourceHealth: { label: string; status: SiteSkillStatus; detail: string };
  tags: string[];
  inputTemplates: string[];
  readiness: Array<{ label: string; status: SiteSkillStatus; detail: string }>;
  boundaries: string[];
  relatedTaskIds: string[];
  recentTest?: {
    label: string;
    status: "passed" | "failed" | "blocked" | "stale";
    ranAt: string;
    postCheck: string;
    failureReason: string;
    source: OwnerSource;
  };
  reportIntent?: {
    state: "available" | "pending" | "unavailable";
    label: string;
    detail: string;
  };
  repairDrafts?: Array<{
    ref: string;
    state: "candidate" | "validated" | "promoted" | "rejected" | "unavailable";
    source: OwnerSource;
    reason: string;
    provenance: string;
  }>;
  overlayBoundary?: Array<{ label: string; detail: string; source: OwnerSource }>;
};

export const siteSkillFixtures: SiteSkill[] = [
  {
    id: "product-detail",
    name: "商品详情采集",
    category: "电商",
    description: "读取商品标题、价格、库存和规格信息，结果归属 Core fixture。",
    status: "ready",
    source: "Lode fixture",
    packageName: "@lode/example-commerce-product-detail",
    version: "0.4.2",
    latestVersion: "0.4.2",
    installState: "locked",
    updateState: "latest",
    risk: "low",
    capabilityRef: "lode://capability/example-commerce/product-detail",
    packageRef: "lode://package/example-commerce-product-detail@0.4.2",
    lockRef: "lode://lock/example-commerce-product-detail/2026-07-03",
    fetchedAt: "2026-07-03T04:20:00Z",
    sourceHealth: { label: "source ready", status: "ready", detail: "Core、Harbor、Lode fixture 均可消费。" },
    tags: ["淘宝", "商品页", "只读"],
    inputTemplates: ["商品详情 URL", "账号身份", "字段清单"],
    readiness: [
      { label: "Lode metadata", status: "ready", detail: "capability package fixture available" },
      { label: "Harbor identity", status: "ready", detail: "运营账号 A fixture" },
      { label: "Core endpoint", status: "fixture", detail: "no live task submission in this batch" },
    ],
    boundaries: [
      "App 只展示 capability package metadata，不缓存 workflow body。",
      "证据正文仍由 owner viewer 提供，App 只保存 viewer ref。",
    ],
    relatedTaskIds: ["task-product-page"],
    recentTest: {
      label: "Latest capability test",
      status: "failed",
      ranAt: "2026-07-05T16:40:00Z",
      postCheck: "post_check_failed",
      failureReason: "site_changed",
      source: "Core fixture",
    },
    reportIntent: {
      state: "available",
      label: "Report broken",
      detail: "Creates App local-only suspected-broken intent; Lode/Core remain truth owners.",
    },
    repairDrafts: [
      {
        ref: "lode://repair-draft/site-capability/example/read-public-page/site-change@0.1.1-draft",
        state: "candidate",
        source: "Lode fixture",
        reason: "site_changed",
        provenance: "Lode repair draft fixture from PR #172",
      },
      {
        ref: "lode://repair-draft/site-capability/example/read-public-page/post-check@0.1.1-draft",
        state: "validated",
        source: "Lode fixture",
        reason: "post_check_failed",
        provenance: "Validator and post-check fixture passed",
      },
    ],
    overlayBoundary: [
      { label: "Local report", detail: "local_signal_only; App stores UI intent only", source: "App local-only" },
      { label: "Platform fix", detail: "lode_public_fix_candidate; no private browser material", source: "Lode fixture" },
      { label: "User overlay", detail: "refs-only overlay/fork metadata; no raw evidence body", source: "Lode fixture" },
    ],
  },
  {
    id: "storefront-list",
    name: "店铺商品列表采集",
    category: "电商",
    description: "从店铺列表页提取商品卡片、分页和上架状态。",
    status: "fixture",
    source: "Lode fixture",
    packageName: "@lode/example-commerce-storefront-list",
    version: "0.2.0",
    latestVersion: "0.2.1",
    installState: "installed",
    updateState: "update-available",
    risk: "medium",
    capabilityRef: "lode://capability/example-commerce/storefront-list",
    packageRef: "lode://package/example-commerce-storefront-list@0.2.0",
    fetchedAt: "2026-07-03T04:21:00Z",
    sourceHealth: { label: "update available", status: "fixture", detail: "Lode 提供 0.2.1；App 只记录更新意图。" },
    tags: ["店铺", "分页", "商品卡片"],
    inputTemplates: ["店铺首页 URL", "采集页数", "字段清单"],
    readiness: [
      { label: "Lode metadata", status: "fixture", detail: "fixture only" },
      { label: "Harbor identity", status: "ready", detail: "运营账号 A fixture" },
    ],
    boundaries: ["当前不提交 Core task intent。", "不读取完整 DOM、HAR 或下载文件。"],
    relatedTaskIds: [],
  },
  {
    id: "review-publish",
    name: "评论发布前检查",
    category: "内容发布",
    description: "检查待发布评论的账号、文本和站点限制；写入动作保持禁用。",
    status: "needs-identity",
    source: "Lode fixture",
    packageName: "@lode/example-social-review-guard",
    version: "0.1.5",
    latestVersion: "0.1.5",
    installState: "not-installed",
    updateState: "blocked",
    risk: "blocked",
    capabilityRef: "lode://capability/example-social/review-guard",
    packageRef: "lode://package/example-social-review-guard@0.1.5",
    fetchedAt: "2026-07-03T04:22:00Z",
    sourceHealth: { label: "identity required", status: "needs-identity", detail: "缺少 Harbor identity，不能提交只读任务。" },
    tags: ["评论", "写入前检查", "安全暂停"],
    inputTemplates: ["评论文本", "目标 URL", "账号身份"],
    readiness: [
      { label: "Harbor identity", status: "needs-identity", detail: "需要显式选择账号" },
      { label: "Write boundary", status: "ready", detail: "App fixture forbids live write" },
    ],
    boundaries: ["不执行发布、点赞、关注等外部可见动作。", "只展示任务意图和检查结果。"],
    relatedTaskIds: [],
  },
  {
    id: "source-health-check",
    name: "站点 Source health 检查",
    category: "诊断",
    description: "展示 Core、Harbor、Lode owner source 是否可用于后续任务。",
    status: "ready",
    source: "App local-only",
    packageName: "@webenvoy/app-source-health-fixture",
    version: "0.0.0",
    latestVersion: "0.0.0",
    installState: "installed",
    updateState: "blocked",
    risk: "blocked",
    capabilityRef: "app://fixture/source-health",
    packageRef: "app://fixture/source-health@0.0.0",
    fetchedAt: "2026-07-03T04:23:00Z",
    sourceHealth: { label: "Core source blocked", status: "unavailable", detail: "缺少 Core source；只能展示 blocking state。" },
    tags: ["诊断", "边界", "只读"],
    inputTemplates: ["Core endpoint", "Harbor endpoint", "Lode endpoint"],
    readiness: [
      { label: "Local config", status: "ready", detail: "endpoint choice stored locally" },
      { label: "Runtime truth", status: "fixture", detail: "not connected to live owners" },
    ],
    boundaries: ["不保存 token、cookie、profile path 或 raw evidence。"],
    relatedTaskIds: ["task-source-blocked"],
  },
  {
    id: "identity-session",
    name: "账号身份运行现场",
    category: "账号身份",
    description: "查看 Harbor Browser/Runtime Session 投影，不创建 Core Task。",
    status: "fixture",
    source: "Harbor fixture",
    packageName: "@harbor/browser-session-projection",
    version: "0.3.1",
    latestVersion: "0.3.1",
    installState: "installed",
    updateState: "latest",
    risk: "medium",
    capabilityRef: "harbor://fixture/runtime-session",
    packageRef: "harbor://fixture/runtime-session@0.3.1",
    fetchedAt: "2026-07-03T04:24:00Z",
    sourceHealth: { label: "Harbor fixture", status: "fixture", detail: "只消费 runtime/session refs，不创建 Core task。" },
    tags: ["Browser", "Harbor", "Session"],
    inputTemplates: ["账号身份", "站点域名"],
    readiness: [
      { label: "Browser provider", status: "fixture", detail: "local fixture only" },
      { label: "Core task", status: "unavailable", detail: "direct session is not a Core Run" },
    ],
    boundaries: ["不作为任务成功结果展示。", "不保存 profile storage。"],
    relatedTaskIds: [],
  },
  {
    id: "price-compare",
    name: "跨站价格对比",
    category: "电商",
    description: "把多个商品页结果合并成对比表，当前仅保留目录占位。",
    status: "unavailable",
    source: "Lode fixture",
    packageName: "@lode/example-commerce-price-compare",
    version: "0.0.4",
    latestVersion: "0.0.4",
    installState: "not-installed",
    updateState: "blocked",
    risk: "blocked",
    capabilityRef: "lode://capability/example-commerce/price-compare",
    packageRef: "lode://package/example-commerce-price-compare@0.0.4",
    fetchedAt: "2026-07-03T04:25:00Z",
    sourceHealth: { label: "contract missing", status: "unavailable", detail: "批量聚合合同不在第一批范围内。" },
    tags: ["多站点", "对比", "待接入"],
    inputTemplates: ["商品 URL 列表", "对比字段"],
    readiness: [
      { label: "Lode metadata", status: "fixture", detail: "metadata only" },
      { label: "Core contract", status: "unavailable", detail: "batch aggregation contract missing" },
    ],
    boundaries: ["不进入 Stage 5，不连接 live Core/Harbor/Lode。"],
    relatedTaskIds: [],
  },
];
