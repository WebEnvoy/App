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
    status?: "available" | "redacted" | "expired" | "stale" | "private" | "unavailable";
    freshness?: string;
    provenance?: string;
  }>;
  capabilityAttribution?: {
    capabilityRef: string;
    version: string;
    sourceRef: string;
    failureClass: "capability" | "input" | "runtime" | "site_changed" | "evidence_expired" | "none";
    summary: string;
  };
  writePrecheck?: {
    state: "available" | "preview_unavailable" | "page_changed" | "user_cancelled";
    modeLabel: string;
    expectedChangeSummary: string;
    beforeLabel: string;
    afterLabel: string;
    diffRows: Array<{ label: string; before: string; after: string; source: OwnerSource }>;
    noSubmitGuard: "active";
    stateNote: string;
  };
  approval?: {
    actionRequestId: string;
    riskLabel: string;
    riskLevel: "low" | "blocked";
    statuses: Array<{
      label: string;
      status: "pending" | "expired" | "blocked" | "cancelled";
      detail: string;
    }>;
    cancelIntent: string;
    boundary: string;
  };
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
    sourceRef: string;
    lockRef?: string;
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
    id: "task-contact-form-preview",
    title: "预览联系表单草稿",
    accountIdentity: "本机 Chrome",
    siteSkill: "联系表单写前预览",
    businessInput: "https://example.org/contact",
    source: "Core fixture",
    packageSource: {
      name: "@lode/example-preview-contact-form",
      version: "0.1.0",
      capabilityRef: "lode:capability/preview-contact-form",
      sourceRef: "lode://site-capability/example/preview-contact-form@0.1.0",
      lockRef: "lode://lock/site-capability/example/preview-contact-form@0.1.0",
      fetchedAt: "2026-07-06T00:00:00Z",
      source: "Lode fixture",
      boundary: "App displays write-pre package refs and expected-change summaries only; Lode keeps package truth.",
    },
    runs: [
      {
        id: "run-preview-available",
        label: "Preview 003",
        lifecycle: "needs-action",
        outcome: "partial",
        summary: "Validate-only preview ready. Nothing has been submitted.",
        actionIntent: "Owner-supported cancel intent: request Core to record user_cancelled without executing submit.",
        owner: "Core",
        source: "Core fixture",
        resultRows: [
          { label: "Result kind", value: "validate_only_preview", source: "Core fixture" },
          { label: "Submitted", value: "false", source: "Core fixture" },
          { label: "Draft state", value: "preview available", source: "Core fixture" },
        ],
        evidenceCards: [
          {
            id: "ev-preview-before",
            title: "Before-preview Snapshot/RefMap refs",
            summary: "Harbor fixture exposes refs, provenance, and freshness only; raw page material stays private.",
            viewerLabel: "Open preview evidence viewer link",
            viewerHref: "#evidence-viewer-preview-before",
            source: "Harbor fixture",
            status: "available",
            freshness: "fresh",
            provenance: "harbor-preview-evidence-status-fixture/v0",
          },
        ],
        capabilityAttribution: {
          capabilityRef: "lode:capability/preview-contact-form",
          version: "0.1.0",
          sourceRef: "lode://site-capability/example/preview-contact-form@0.1.0",
          failureClass: "none",
          summary: "Core preview Result Envelope links the action, evidence refs, and locked Lode capability version.",
        },
        writePrecheck: {
          state: "available",
          modeLabel: "validate-only preview / draft",
          expectedChangeSummary: "Validate contact form target and prepare a local preview without submitting.",
          beforeLabel: "Message field unchanged on page",
          afterLabel: "Local draft value prepared for review only",
          diffRows: [
            {
              label: "contact.message",
              before: "empty",
              after: "local preview value",
              source: "Lode fixture",
            },
            {
              label: "external_submit",
              before: "not requested",
              after: "false",
              source: "Core fixture",
            },
          ],
          noSubmitGuard: "active",
          stateNote: "Preview is available; this is not a submitted result.",
        },
        approval: {
          actionRequestId: "action-request:fixture/preview-contact-form",
          riskLabel: "write / low / validate_only",
          riskLevel: "low",
          statuses: [
            {
              label: "Approval request",
              status: "pending",
              detail: "Pending user review before any future submit-capable stage.",
            },
            {
              label: "Expired approval",
              status: "expired",
              detail: "Expired requests remain non-executable.",
            },
            {
              label: "Blocked approval",
              status: "blocked",
              detail: "Policy blocks execution; App shows state only.",
            },
            {
              label: "Cancellation record",
              status: "cancelled",
              detail: "Core cancellation summary uses user_cancelled and is not submitted.",
            },
          ],
          cancelIntent: "Cancel intent is local UI intent until Core records cancellation; no submit is sent.",
          boundary: "Core owns action request, approval, cancellation, and no-submit guard truth.",
        },
        process: [
          "Core returned action request risk classification with no-submit guard active.",
          "Lode supplied expected_change and risk_hints from write-pre fixture.",
          "Harbor supplied before-preview refs and freshness without raw material.",
        ],
      },
      {
        id: "run-preview-page-changed",
        label: "Preview 002",
        lifecycle: "blocked",
        outcome: "unavailable",
        summary: "Preview blocked because the page changed after refs were captured.",
        actionIntent: "Owner-supported action intent: refresh preview evidence before approval.",
        owner: "Core",
        source: "Core fixture",
        resultRows: [
          { label: "Preview state", value: "page_changed", source: "Core fixture" },
          { label: "Submitted", value: "false", source: "Core fixture" },
        ],
        evidenceCards: [
          {
            id: "ev-preview-page-changed",
            title: "Stale RefMap preview evidence",
            summary: "Harbor freshness reports page_changed; App blocks the preview instead of showing success.",
            viewerLabel: "Open stale preview evidence link",
            viewerHref: "#evidence-viewer-preview-page-changed",
            source: "Harbor fixture",
            status: "stale",
            freshness: "page_changed",
            provenance: "harbor-preview-evidence-status-fixture/v0",
          },
        ],
        capabilityAttribution: {
          capabilityRef: "lode:capability/preview-contact-form",
          version: "0.1.0",
          sourceRef: "lode://site-capability/example/preview-contact-form@0.1.0",
          failureClass: "site_changed",
          summary: "Core classifies page_changed as preview failure, not submitted result.",
        },
        writePrecheck: {
          state: "page_changed",
          modeLabel: "validate-only preview",
          expectedChangeSummary: "Expected change is withheld until fresh evidence is available.",
          beforeLabel: "Captured RefMap is stale",
          afterLabel: "No draft can be trusted",
          diffRows: [
            { label: "freshness", before: "fresh", after: "page_changed", source: "Harbor fixture" },
            { label: "submitted", before: "false", after: "false", source: "Core fixture" },
          ],
          noSubmitGuard: "active",
          stateNote: "Preview unavailable because the page changed; refresh evidence first.",
        },
        process: ["Harbor detected page_changed.", "Core returned preview failure.", "App kept submitted=false visible."],
      },
      {
        id: "run-preview-cancelled",
        label: "Preview 001",
        lifecycle: "needs-action",
        outcome: "failure-safe",
        summary: "User cancelled the write-pre flow; no external submit was attempted.",
        actionIntent: "Owner-supported action intent: start a new validate-only preview.",
        owner: "Core",
        source: "Core fixture",
        resultRows: [
          { label: "Preview state", value: "user_cancelled", source: "Core fixture" },
          { label: "Submitted", value: "false", source: "Core fixture" },
        ],
        evidenceCards: [
          {
            id: "ev-preview-cancelled",
            title: "Cancellation evidence refs",
            summary: "Cancellation links action refs and evidence refs only.",
            viewerLabel: "Open cancellation evidence link",
            viewerHref: "#evidence-viewer-preview-cancelled",
            source: "Core fixture",
            status: "available",
            freshness: "fresh",
            provenance: "approval-cancellation-query.fixture.json",
          },
        ],
        capabilityAttribution: {
          capabilityRef: "lode:capability/preview-contact-form",
          version: "0.1.0",
          sourceRef: "lode://site-capability/example/preview-contact-form@0.1.0",
          failureClass: "none",
          summary: "Cancelled preview is preserved as write-pre history without submitted success.",
        },
        writePrecheck: {
          state: "user_cancelled",
          modeLabel: "draft cancelled",
          expectedChangeSummary: "No expected change is active after cancellation.",
          beforeLabel: "Draft pending user review",
          afterLabel: "Cancelled before submit-capable stage",
          diffRows: [
            { label: "approval", before: "pending", after: "cancelled", source: "Core fixture" },
            { label: "submitted", before: "false", after: "false", source: "Core fixture" },
          ],
          noSubmitGuard: "active",
          stateNote: "Cancellation is a terminal write-pre state, not submitted success.",
        },
        process: ["User cancellation recorded.", "Core preserved no-submit boundary.", "Run history displays cancelled as write-pre state."],
      },
    ],
  },
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
      sourceRef: "lode://package/example-commerce-product-detail@0.4.2",
      lockRef: "lode://lock/example-commerce-product-detail/2026-07-03",
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
            status: "available",
            freshness: "fresh",
            provenance: "Core run record + Harbor viewer ref",
          },
        ],
        capabilityAttribution: {
          capabilityRef: "lode://capability/example-commerce/product-detail",
          version: "0.4.2",
          sourceRef: "lode://package/example-commerce-product-detail@0.4.2",
          failureClass: "none",
          summary: "Core attributes this run to the locked Lode capability ref.",
        },
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
            status: "private",
            freshness: "fresh",
            provenance: "Harbor private capture redacted to viewer ref",
          },
        ],
        capabilityAttribution: {
          capabilityRef: "lode://capability/example-commerce/product-detail",
          version: "0.4.2",
          sourceRef: "lode://package/example-commerce-product-detail@0.4.2",
          failureClass: "runtime",
          summary: "Failure attribution: runtime needs user action, not package repair.",
        },
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
            status: "available",
            freshness: "fresh",
            provenance: "Core result envelope evidence ref",
          },
        ],
        capabilityAttribution: {
          capabilityRef: "lode://capability/example-commerce/product-detail",
          version: "0.4.2",
          sourceRef: "lode://package/example-commerce-product-detail@0.4.2",
          failureClass: "none",
          summary: "Capability attribution retained on the run record.",
        },
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
            status: "available",
            freshness: "fresh",
            provenance: "Core empty result envelope",
          },
        ],
        capabilityAttribution: {
          capabilityRef: "lode://capability/example-commerce/product-detail",
          version: "0.4.2",
          sourceRef: "lode://package/example-commerce-product-detail@0.4.2",
          failureClass: "input",
          summary: "Empty result is attributed to input content, not capability failure.",
        },
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
            status: "stale",
            freshness: "stale",
            provenance: "Harbor evidence ref marked stale",
          },
        ],
        capabilityAttribution: {
          capabilityRef: "lode://capability/example-commerce/product-detail",
          version: "0.4.2",
          sourceRef: "lode://package/example-commerce-product-detail@0.4.2",
          failureClass: "site_changed",
          summary: "Failure attribution: optional selector drift suggests site_changed repair draft.",
        },
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
            status: "private",
            freshness: "fresh",
            provenance: "Harbor private runtime ref",
          },
        ],
        capabilityAttribution: {
          capabilityRef: "lode://capability/example-commerce/product-detail",
          version: "0.4.2",
          sourceRef: "lode://package/example-commerce-product-detail@0.4.2",
          failureClass: "runtime",
          summary: "Failure attribution: runtime/login challenge blocked the run.",
        },
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
      sourceRef: "lode://package/example-commerce-product-detail@0.4.2",
      lockRef: "lode://lock/example-commerce-product-detail/2026-07-03",
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
            status: "unavailable",
            freshness: "unavailable",
            provenance: "Core source health blocker",
          },
        ],
        capabilityAttribution: {
          capabilityRef: "lode://capability/example-commerce/product-detail",
          version: "0.4.2",
          sourceRef: "lode://package/example-commerce-product-detail@0.4.2",
          failureClass: "runtime",
          summary: "Failure attribution: Core source health is blocking evidence lookup.",
        },
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
            status: "expired",
            freshness: "expired",
            provenance: "Harbor evidence lifecycle",
          },
        ],
        capabilityAttribution: {
          capabilityRef: "lode://capability/example-commerce/product-detail",
          version: "0.4.2",
          sourceRef: "lode://package/example-commerce-product-detail@0.4.2",
          failureClass: "evidence_expired",
          summary: "Failure attribution: evidence refs expired; request fresh evidence before repair.",
        },
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
            status: "redacted",
            freshness: "fresh",
            provenance: "Harbor redacted fixture",
          },
        ],
        capabilityAttribution: {
          capabilityRef: "lode://capability/example-commerce/product-detail",
          version: "0.4.2",
          sourceRef: "lode://package/example-commerce-product-detail@0.4.2",
          failureClass: "none",
          summary: "Redaction is policy state, not capability failure.",
        },
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
            status: "stale",
            freshness: "unknown",
            provenance: "Core unknown result fixture",
          },
        ],
        capabilityAttribution: {
          capabilityRef: "lode://capability/example-commerce/product-detail",
          version: "0.4.2",
          sourceRef: "lode://package/example-commerce-product-detail@0.4.2",
          failureClass: "site_changed",
          summary: "Failure attribution remains unresolved and links back to capability health.",
        },
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
            status: "available",
            freshness: "fresh",
            provenance: "Core admission failure fixture",
          },
        ],
        capabilityAttribution: {
          capabilityRef: "lode://capability/example-commerce/product-detail",
          version: "0.4.2",
          sourceRef: "lode://package/example-commerce-product-detail@0.4.2",
          failureClass: "input",
          summary: "Failure attribution: input validation, not Lode package repair.",
        },
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
