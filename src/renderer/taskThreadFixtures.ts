export type OwnerSource = "Core fixture" | "Harbor fixture" | "Lode fixture" | "App local-only";

export type OutcomeKind =
  | "success"
  | "empty"
  | "partial"
  | "failure-safe"
  | "failure"
  | "unavailable"
  | "expired"
  | "redacted"
  | "unknown";

export type RunProjection = {
  id: string;
  label: string;
  lifecycle: "queued" | "running" | "completed" | "needs-action" | "blocked";
  outcome: OutcomeKind;
  summary: string;
  actionIntent: string;
  owner: "Core";
  source: OwnerSource;
  resultRows: Array<{ label: string; value: string; source: OwnerSource }>;
  process: string[];
};

export type TaskProjection = {
  id: string;
  title: string;
  accountIdentity: string;
  siteSkill: string;
  businessInput: string;
  source: OwnerSource;
  blocker?: string;
  runs: RunProjection[];
};

export type DirectSessionProjection = {
  id: string;
  title: string;
  accountIdentity: string;
  sessionState: "available";
  source: OwnerSource;
  summary: string;
};

export const creationEntryFixture = {
  siteSkill: {
    label: "商品详情采集",
    source: "Lode fixture" as OwnerSource,
    blocker: "",
  },
  accountIdentity: {
    label: "运营账号 A",
    source: "Harbor fixture" as OwnerSource,
    blocker: "",
  },
  businessInput: {
    label: "https://example.com/products/road-runner",
    source: "App local-only" as OwnerSource,
    blocker: "",
  },
  coreSource: {
    label: "Core task intent endpoint",
    source: "Core fixture" as OwnerSource,
    blocker: "Missing Core source blocks real submission; this batch stays read-only.",
  },
};

export const taskThreadFixtures: TaskProjection[] = [
  {
    id: "task-product-page",
    title: "采集商品详情页",
    accountIdentity: "运营账号 A",
    siteSkill: "商品详情采集",
    businessInput: "https://example.com/products/road-runner",
    source: "Core fixture",
    runs: [
      {
        id: "run-success",
        label: "Run 004",
        lifecycle: "completed",
        outcome: "success",
        summary: "任务成功完成，结构化结果来自 Core fixture projection。",
        actionIntent: "Owner-supported action intent: view result sources.",
        owner: "Core",
        source: "Core fixture",
        resultRows: [
          { label: "商品名", value: "Road Runner Keyboard", source: "Core fixture" },
          { label: "价格", value: "$129", source: "Core fixture" },
          { label: "库存", value: "In stock", source: "Core fixture" },
        ],
        process: ["Core accepted read-only task intent.", "Lode capability metadata matched.", "Harbor identity was referenced, not stored."],
      },
      {
        id: "run-empty",
        label: "Run 003",
        lifecycle: "completed",
        outcome: "empty",
        summary: "任务完成但没有匹配记录；empty outcome 不等于 failure。",
        actionIntent: "Owner-supported action intent: modify input.",
        owner: "Core",
        source: "Core fixture",
        resultRows: [{ label: "结果", value: "No matching rows", source: "Core fixture" }],
        process: ["Page loaded.", "Extractor returned zero rows.", "Core closed run as empty."],
      },
      {
        id: "run-partial",
        label: "Run 002",
        lifecycle: "completed",
        outcome: "partial",
        summary: "任务部分完成，缺少可选字段；partial outcome 保留缺口。",
        actionIntent: "Owner-supported action intent: retry run.",
        owner: "Core",
        source: "Core fixture",
        resultRows: [
          { label: "商品名", value: "Road Runner Keyboard", source: "Core fixture" },
          { label: "价格", value: "Unavailable", source: "Core fixture" },
        ],
        process: ["Required fields passed.", "Optional price selector was unavailable.", "Core returned partial result."],
      },
      {
        id: "run-failure-safe",
        label: "Run 001",
        lifecycle: "needs-action",
        outcome: "failure-safe",
        summary: "任务安全失败，没有执行写入或保存 raw evidence。",
        actionIntent: "Owner-supported action intent: open runtime session.",
        owner: "Core",
        source: "Core fixture",
        resultRows: [{ label: "安全结果", value: "No write was attempted", source: "Core fixture" }],
        process: ["Login challenge detected.", "Core stopped before extraction.", "Failure-safe report created."],
      },
    ],
  },
  {
    id: "task-source-blocked",
    title: "缺少 source 的只读任务",
    accountIdentity: "运营账号 A",
    siteSkill: "商品详情采集",
    businessInput: "https://example.com/products/source-missing",
    source: "Core fixture",
    blocker: "Missing owner source: Core run source is unavailable, so App must show blocker.",
    runs: [
      {
        id: "run-unavailable",
        label: "Run unavailable",
        lifecycle: "blocked",
        outcome: "unavailable",
        summary: "Core source unavailable；不能本地转换为 task success。",
        actionIntent: "Owner-supported action intent: wait for Core source.",
        owner: "Core",
        source: "Core fixture",
        resultRows: [{ label: "结果", value: "Unavailable", source: "Core fixture" }],
        process: ["Source health unavailable.", "Task submission remains read-only.", "No Core Run Record is created by App."],
      },
      {
        id: "run-expired",
        label: "Run expired",
        lifecycle: "needs-action",
        outcome: "expired",
        summary: "结果引用已过期；只能提示 owner-supported action intent。",
        actionIntent: "Owner-supported action intent: request fresh run.",
        owner: "Core",
        source: "Core fixture",
        resultRows: [{ label: "结果", value: "Expired", source: "Core fixture" }],
        process: ["Core reported expired result projection.", "App did not cache raw evidence."],
      },
      {
        id: "run-redacted",
        label: "Run redacted",
        lifecycle: "completed",
        outcome: "redacted",
        summary: "字段被 owner policy redacted；不能在 App 中恢复敏感内容。",
        actionIntent: "Owner-supported action intent: view allowed fields.",
        owner: "Core",
        source: "Core fixture",
        resultRows: [{ label: "账号字段", value: "Redacted by owner policy", source: "Core fixture" }],
        process: ["Core returned redacted projection.", "Renderer displayed policy boundary."],
      },
      {
        id: "run-unknown",
        label: "Run unknown",
        lifecycle: "needs-action",
        outcome: "unknown",
        summary: "unknown outcome 需要人工确认；不能显示为成功。",
        actionIntent: "Owner-supported action intent: open diagnostics.",
        owner: "Core",
        source: "Core fixture",
        resultRows: [{ label: "结果", value: "Unknown outcome", source: "Core fixture" }],
        process: ["Run state could not be classified.", "App keeps unknown outcome visible."],
      },
      {
        id: "run-failure",
        label: "Run failure",
        lifecycle: "completed",
        outcome: "failure",
        summary: "任务失败，报告失败阶段和下一步动作。",
        actionIntent: "Owner-supported action intent: fix input and retry.",
        owner: "Core",
        source: "Core fixture",
        resultRows: [{ label: "失败阶段", value: "Input validation", source: "Core fixture" }],
        process: ["Core rejected invalid business input.", "No task success was shown."],
      },
    ],
  },
];

export const directSessionFixture: DirectSessionProjection = {
  id: "direct-session-local-chrome",
  title: "本机 Chrome 手动浏览实例",
  accountIdentity: "本机 Chrome",
  sessionState: "available",
  source: "Harbor fixture",
  summary:
    "direct Identity Runtime Session is Browser/Harbor only; it is not Core Task/Run/Result and must not display as task success.",
};
