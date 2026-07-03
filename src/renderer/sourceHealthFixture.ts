export type SourceHealthStatus = "ready" | "fixture" | "unavailable";

export type SourceHealth = {
  id: "core" | "harbor" | "lode";
  name: string;
  ownerTruth: string;
  status: SourceHealthStatus;
  summary: string;
  fetchedAt: string;
  boundary: string;
};

export const sourceHealthFixture: SourceHealth[] = [
  {
    id: "core",
    name: "Core",
    ownerTruth: "task / run / result / failure",
    status: "fixture",
    summary: "本地 fixture 仅证明 Task Thread shell 能显示 owner source 状态。",
    fetchedAt: "2026-07-03T04:20:00Z",
    boundary: "Renderer 不自建 run lifecycle，不写 Core Run Record truth。",
  },
  {
    id: "harbor",
    name: "Harbor",
    ownerTruth: "account identity / Identity Runtime Session / viewer",
    status: "fixture",
    summary: "direct session 可由用户、Agent、API、CLI 或 MCP 发起。",
    fetchedAt: "2026-07-03T04:20:00Z",
    boundary: "direct session 不创建 Core Task/Run/Result，也不是 task outcome。",
  },
  {
    id: "lode",
    name: "Lode",
    ownerTruth: "site skill / capability package metadata",
    status: "fixture",
    summary: "当前只消费 capability package metadata；workflow package 是后续扩展。",
    fetchedAt: "2026-07-03T04:20:00Z",
    boundary: "App 不保存 package truth，不提供 workflow runtime/editor UI。",
  },
];

export const taskThreadFixture = {
  accountIdentity: "运营账号 A",
  siteSkill: "商品详情采集",
  businessInput: "https://example.com/products/road-runner",
  title: "采集商品详情页",
  state: "Shell fixture",
  runLabel: "Run fixture only",
  report:
    "GH-101 只建立只读 shell：当前没有 Core task path，因此不展示真实 result/evidence/failure。",
  process: [
    "Source health 使用本地 fixture，不代表 Core/Harbor/Lode 已连接。",
    "Settings 只保存 endpoint choice，不保存 credential、cookie、profile storage 或 raw evidence。",
    "进入 #105-#113 前，不实现 task submission、run/result/evidence 或 Browser 管理台。",
  ],
};
