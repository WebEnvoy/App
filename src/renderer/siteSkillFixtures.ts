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
  capabilityRef: string;
  fetchedAt: string;
  tags: string[];
  inputTemplates: string[];
  readiness: Array<{ label: string; status: SiteSkillStatus; detail: string }>;
  boundaries: string[];
  relatedTaskIds: string[];
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
    capabilityRef: "lode://capability/example-commerce/product-detail",
    fetchedAt: "2026-07-03T04:20:00Z",
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
    capabilityRef: "lode://capability/example-commerce/storefront-list",
    fetchedAt: "2026-07-03T04:21:00Z",
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
    capabilityRef: "lode://capability/example-social/review-guard",
    fetchedAt: "2026-07-03T04:22:00Z",
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
    capabilityRef: "app://fixture/source-health",
    fetchedAt: "2026-07-03T04:23:00Z",
    tags: ["诊断", "边界", "只读"],
    inputTemplates: ["Core endpoint", "Harbor endpoint", "Lode endpoint"],
    readiness: [
      { label: "Local config", status: "ready", detail: "endpoint choice stored locally" },
      { label: "Runtime truth", status: "fixture", detail: "not connected to live owners" },
    ],
    boundaries: ["不保存 token、cookie、profile path 或 raw evidence。"],
    relatedTaskIds: ["task-missing-source"],
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
    capabilityRef: "harbor://fixture/runtime-session",
    fetchedAt: "2026-07-03T04:24:00Z",
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
    capabilityRef: "lode://capability/example-commerce/price-compare",
    fetchedAt: "2026-07-03T04:25:00Z",
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
