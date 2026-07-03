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
  evidenceCards: Array<{
    id: string;
    title: string;
    summary: string;
    viewerLabel: string;
    viewerHref: string;
    source: OwnerSource;
  }>;
  process: string[];
};

export type TaskProjection = {
  id: string;
  title: string;
  accountIdentity: string;
  siteSkill: string;
  businessInput: string;
  source: OwnerSource;
  packageSource: {
    name: string;
    version: string;
    capabilityRef: string;
    fetchedAt: string;
    source: OwnerSource;
    boundary: string;
  };
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
  providerStatus: {
    provider: string;
    browserSessionRef: string;
    status: "connected" | "degraded" | "unavailable";
    viewerRef: string;
    fetchedAt: string;
    source: OwnerSource;
    boundary: string;
  };
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
    packageSource: {
      name: "@lode/example-commerce-product-detail",
      version: "0.4.2",
      capabilityRef: "lode://capability/example-commerce/product-detail",
      fetchedAt: "2026-07-03T04:20:00Z",
      source: "Lode fixture",
      boundary: "App only displays capability package metadata; workflow runtime/editor stays out of scope.",
    },
    runs: [
      {
        id: "run-running",
        label: "Run 006",
        lifecycle: "running",
        outcome: "partial",
        summary: "正在采集变体价格；已返回核心商品字段，等待 Core 完成最终归档。",
        actionIntent: "Owner-supported action intent: watch live run.",
        owner: "Core",
        source: "Core fixture",
        resultRows: [
          { label: "商品名", value: "Road Runner Keyboard", source: "Core fixture" },
          { label: "价格", value: "Collecting variants", source: "Core fixture" },
          { label: "库存", value: "Pending", source: "Core fixture" },
        ],
        evidenceCards: [
          {
            id: "ev-run-006-live",
            title: "Live run evidence projection",
            summary: "Core fixture reports a running task projection; App does not stream raw trace.",
            viewerLabel: "Open evidence viewer link",
            viewerHref: "#evidence-viewer-run-006",
            source: "Core fixture",
          },
        ],
        process: ["Core accepted task intent.", "Harbor identity attached.", "Variant price extraction is still running."],
      },
      {
        id: "run-review",
        label: "Run 005",
        lifecycle: "needs-action",
        outcome: "failure-safe",
        summary: "需要用户确认站点弹窗；Core 已安全暂停，未执行写入。",
        actionIntent: "Owner-supported action intent: inspect runtime session.",
        owner: "Core",
        source: "Core fixture",
        resultRows: [
          { label: "暂停原因", value: "Site confirmation modal", source: "Core fixture" },
          { label: "安全边界", value: "No write attempted", source: "Core fixture" },
        ],
        evidenceCards: [
          {
            id: "ev-run-005-modal",
            title: "Needs-action evidence",
            summary: "Core-owned projection records a blocked modal without raw DOM cached in App.",
            viewerLabel: "Open evidence viewer link",
            viewerHref: "#evidence-viewer-run-005",
            source: "Core fixture",
          },
        ],
        process: ["Product page loaded.", "Site modal blocked automation.", "Core paused before write-capable action."],
      },
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
        evidenceCards: [
          {
            id: "ev-run-004-result",
            title: "Result evidence projection",
            summary: "Core-owned evidence summary, no raw evidence body cached in App.",
            viewerLabel: "Open evidence viewer link",
            viewerHref: "#evidence-viewer-run-004",
            source: "Core fixture",
          },
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
        evidenceCards: [
          {
            id: "ev-run-003-empty",
            title: "Empty result evidence",
            summary: "Core says extraction completed with zero rows; App links the viewer only.",
            viewerLabel: "Open evidence viewer link",
            viewerHref: "#evidence-viewer-run-003",
            source: "Core fixture",
          },
        ],
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
        evidenceCards: [
          {
            id: "ev-run-002-partial",
            title: "Partial field evidence",
            summary: "Core-owned projection shows required fields passed and optional price missing.",
            viewerLabel: "Open evidence viewer link",
            viewerHref: "#evidence-viewer-run-002",
            source: "Core fixture",
          },
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
        evidenceCards: [
          {
            id: "ev-run-001-safe",
            title: "Failure-safe evidence",
            summary: "Evidence projection confirms no write attempt and no raw evidence saved.",
            viewerLabel: "Open evidence viewer link",
            viewerHref: "#evidence-viewer-run-001",
            source: "Core fixture",
          },
        ],
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
    packageSource: {
      name: "@lode/example-commerce-product-detail",
      version: "0.4.2",
      capabilityRef: "lode://capability/example-commerce/product-detail",
      fetchedAt: "2026-07-03T04:20:00Z",
      source: "Lode fixture",
      boundary: "Missing Core source does not change Lode package attribution.",
    },
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
        evidenceCards: [
          {
            id: "ev-unavailable",
            title: "Unavailable evidence source",
            summary: "Core source is unavailable, so App shows a blocker instead of a result.",
            viewerLabel: "Evidence viewer unavailable",
            viewerHref: "#evidence-viewer-unavailable",
            source: "Core fixture",
          },
        ],
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
        evidenceCards: [
          {
            id: "ev-expired",
            title: "Expired evidence reference",
            summary: "Core projection expired; App does not keep a local raw evidence copy.",
            viewerLabel: "Request fresh evidence viewer link",
            viewerHref: "#evidence-viewer-expired",
            source: "Core fixture",
          },
        ],
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
        evidenceCards: [
          {
            id: "ev-redacted",
            title: "Redacted evidence projection",
            summary: "Owner policy redacted sensitive fields before App display.",
            viewerLabel: "Open allowed evidence viewer link",
            viewerHref: "#evidence-viewer-redacted",
            source: "Core fixture",
          },
        ],
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
        evidenceCards: [
          {
            id: "ev-unknown",
            title: "Unknown outcome evidence",
            summary: "Core cannot classify the run; App keeps the uncertainty visible.",
            viewerLabel: "Open evidence viewer link",
            viewerHref: "#evidence-viewer-unknown",
            source: "Core fixture",
          },
        ],
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
        evidenceCards: [
          {
            id: "ev-failure",
            title: "Failure stage evidence",
            summary: "Core rejected invalid input; App does not convert this into success.",
            viewerLabel: "Open evidence viewer link",
            viewerHref: "#evidence-viewer-failure",
            source: "Core fixture",
          },
        ],
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
  providerStatus: {
    provider: "Harbor Browser provider fixture",
    browserSessionRef: "browser-session://local-chrome/manual-001",
    status: "connected",
    viewerRef: "viewer://harbor/local-chrome/manual-001",
    fetchedAt: "2026-07-03T04:20:00Z",
    source: "Harbor fixture",
    boundary: "Provider private endpoint, raw CDP, VNC, credential, cookie, and profile storage are not exposed.",
  },
};
