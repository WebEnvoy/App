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
