import { BriefcaseBusiness } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

import { fetchPendingAuthorizationDecision } from "../../src/renderer/authorizationDecisionClient";
import { initialCoreTaskSubmitState } from "../../src/renderer/coreTaskSubmitClient";
import { fetchCoreRunResult } from "../../src/renderer/coreRunResultClient";
import type { LodeCatalogSkill } from "../../src/renderer/lodeCatalogClient";
import { OwnerState } from "../../src/renderer/OwnerState";
import {
  fetchCoreThreadState,
  retainLastKnownCoreThreads,
  unavailableCoreThreadState,
} from "../../src/renderer/coreThreadClient";
import {
  projectRuntimeGatedTasks,
  runtimeSupervisorUnavailableState,
} from "../../src/renderer/runtimeSupervisorState";
import {
  AppShell,
  LeftPanel,
  RightPanel,
  ThreadWorkspace,
} from "../../src/renderer/shellPrimitives";
import { SingleActionConfirmation, TaskThreadPage } from "../../src/renderer/TaskThreadPage";
import { projectBusinessResultMessage, projectStandardBusinessResult } from "../../src/renderer/TaskBusinessResult";
import { TaskThreadRightPanel } from "../../src/renderer/TaskThreadRightPanel";
import type { ThreadNavigationItem } from "../../src/renderer/ThreadNavigationRail";
import type { TaskPreviewSelection } from "../../src/renderer/useAppTasks";
import { WorkbenchSidebar } from "../../src/renderer/WorkbenchSidebar";
import "../../src/renderer/uiFoundation.css";
import "../../src/renderer/styles.css";
import "../../src/renderer/workbench.css";

const coreEndpoint = "http://core.owner";
const taskAId = "thread_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const taskBId = "thread_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const emptyTaskId = "thread_cccccccccccccccccccccccccccccccc";
const consumerBoundary = "Core stores bounded field summaries and owner refs only; raw content remains with its owner.";
const authorizationDecisionRef = "authorization-decision:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const authorizationRequests: WebEnvoyOwnerApiJsonRequest[] = [];
let singleActionAttempts = 0;
const resultSkills = [{
  outputKind: "collection",
  outputSchemaId: "lode://schema/site-capability/xiaohongshu/search-notes/output@0.1.0",
  packageRef: "lode://site-capability/xiaohongshu/search-notes@0.1.0",
  version: "0.1.0",
  lockRef: "lode://lock/site-capability/xiaohongshu/search-notes@0.1.0",
}, {
  outputKind: "object",
  outputSchemaId: "lode://schema/site-capability/boss/job-search/output@0.1.0",
  packageRef: "lode://site-capability/boss/job-search@0.1.0",
  version: "0.1.0",
  lockRef: "lode://lock/site-capability/boss/job-search@0.1.0",
}] as LodeCatalogSkill[];
const ownerPayload = {
  ok: true,
  threads: [
    {
      schema_version: "webenvoy.task-thread.v0",
      thread_id: taskAId,
      capability_ref: "lode:capability/search-notes",
      identity_environment_ref: "identity-env:xhs-ops-a",
      created_at: "2026-07-20T08:00:00Z",
      updated_at: "2026-07-20T09:10:00Z",
      turns: [
        {
          turn_id: "turn_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1",
          sequence: 1,
          idempotency_key: "owner-a-turn-1",
          run_id: "run-owner-a-completed",
          creation_channel: "api",
          input: {
            schema_version: "webenvoy.task-turn-input.v0",
            fields: [{ field_id: "keyword", kind: "scalar", summary: "AI 工具" }],
            attachment_refs: [],
            consumer_boundary: consumerBoundary,
          },
          created_at: "2026-07-20T08:00:00Z",
          updated_at: "2026-07-20T08:01:00Z",
          terminal_at: "2026-07-20T08:01:00Z",
          submission_state: "accepted",
          status: "completed",
        },
        {
          turn_id: "turn_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa2",
          sequence: 2,
          idempotency_key: "owner-a-turn-2",
          run_id: "run-owner-a-running",
          creation_channel: "app",
          input: {
            schema_version: "webenvoy.task-turn-input.v0",
            fields: [{ field_id: "keyword", kind: "scalar", summary: "AI 工作台" }],
            attachment_refs: [],
            consumer_boundary: consumerBoundary,
          },
          created_at: "2026-07-20T09:00:00Z",
          updated_at: "2026-07-20T09:10:00Z",
          submission_state: "accepted",
          status: "running",
        },
      ],
    },
    {
      schema_version: "webenvoy.task-thread.v0",
      thread_id: taskBId,
      capability_ref: "lode:capability/job-search",
      identity_environment_ref: "identity-env:recruiting-a",
      created_at: "2026-07-20T07:00:00Z",
      updated_at: "2026-07-20T08:30:00Z",
      turns: [
        {
          turn_id: "turn_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb1",
          sequence: 1,
          idempotency_key: "owner-b-turn-1",
          run_id: "run-owner-b-completed",
          creation_channel: "sdk",
          input: {
            schema_version: "webenvoy.task-turn-input.v0",
            fields: [{ field_id: "keyword", kind: "scalar", summary: "产品经理" }],
            attachment_refs: [],
            consumer_boundary: consumerBoundary,
          },
          created_at: "2026-07-20T07:00:00Z",
          updated_at: "2026-07-20T08:30:00Z",
          terminal_at: "2026-07-20T08:30:00Z",
          submission_state: "accepted",
          status: "completed",
        },
      ],
    },
    {
      schema_version: "webenvoy.task-thread.v0",
      thread_id: emptyTaskId,
      capability_ref: "lode:capability/custom-owner-skill",
      identity_environment_ref: "identity-env:empty-owner",
      created_at: "2026-07-20T06:00:00Z",
      updated_at: "2026-07-20T06:00:00Z",
      turns: [],
    },
  ],
};

window.localStorage.setItem("webenvoy.shell.v3.left-panel-width", "broken");
window.localStorage.setItem("webenvoy.shell.v3.right-panel-width", "broken");
window.localStorage.setItem("webenvoy.shell.v3.right-panel-ratio", "broken");
window.localStorage.setItem(`webenvoy.shell.v3.right-panel-open:${taskAId}`, "broken");
window.webenvoyShell = {
  getShellContext: async () => ({
    platform: "darwin",
    colorScheme: "light",
    configScope: "local-ui-only",
  }),
  requestOwnerJson: async (request) => {
    authorizationRequests.push(request);
    if (/^\/runs\/[^/]+\/result$/.test(request.path)) {
      const runId = decodeURIComponent(request.path.split("/")[2] ?? "");
      if (runId === "run-owner-unavailable") return { ok: false, error: "owner unavailable" };
      const job = runId === "run-owner-b-completed";
      return { ok: true, body: { ok: true, result: {
        schema_version: "webenvoy.result-query.v0",
        run_id: runId,
        status: "succeeded",
        terminal: true,
        result: {
          envelope_state: "available",
          payload_state: runId === "run-result-ref-missing" ? "unavailable" : runId === "run-contradictory" || runId === "run-not-persisted" ? "not_persisted_in_core" : "available",
          ...(runId === "run-result-ref-missing" ? { unavailable_reason: "result_ref_missing" } : {}),
          ...(runId === "run-result-ref-missing" ? {} : { result_ref: `result:core/${runId}` }),
          result_envelope: {
            schema_version: "webenvoy.result-envelope.v0",
            run_record_ref: runId,
            ok: true,
            outcome: "success",
            terminal: true,
            capability_ref: job ? "lode:capability/job-search" : "lode:capability/search-notes",
            capability_version: "0.1.0",
            capability_lock_ref: job ? "lode://lock/site-capability/boss/job-search@0.1.0" : "lode://lock/site-capability/xiaohongshu/search-notes@0.1.0",
            package_ref: job ? "lode://site-capability/boss/job-search@0.1.0" : "lode://site-capability/xiaohongshu/search-notes@0.1.0",
            result_kind: job ? "boss_job_detail" : "xhs_note_search",
            output_schema_id: job ? "lode://schema/site-capability/boss/job-search/output@0.1.0" : "lode://schema/site-capability/xiaohongshu/search-notes/output@0.1.0",
            ...(runId === "run-not-persisted" || runId === "run-result-ref-missing" ? {} : { data: runId.startsWith("run-forbidden") ? { [runId.replace("run-forbidden-", "") || "cookie"]: "private" } : runId === "run-contradictory" ? { title: "not allowed" } : job ? { title: "产品经理", company: "WebEnvoy", city: "上海" } : {
              status: "available",
              normalized: { result_count: 8, notes: Array.from({ length: 8 }, (_, index) => ({
                title: `AI 工具笔记 ${index + 1}`,
                author: `作者 ${index + 1}`,
                interactions: 100 + index,
                readAt: "今天 14:28",
              })) },
            } }),
          },
        },
        evidence_refs: [],
      } } };
    }
    if (request.path === `/authorization-decisions/${encodeURIComponent(authorizationDecisionRef)}`) {
      return { ok: true, body: { ok: true, authorization_decision: {
        schema_version: "webenvoy.authorization-decision.v0",
        decision_ref: authorizationDecisionRef,
        business_action: {
          action_instance_ref: "action-instance:xhs-search",
          action_id: "xhs_search_notes",
          category: "read",
          target: { target_ref: "target:xhs-search-results", target_type: "search_results_page", site_slug: "xiaohongshu", origin: "https://www.xiaohongshu.com" },
        },
        owner_declaration: {
          matcher: "lode_action_declaration",
          declaration_ref: "lode:action/xhs_search_notes",
          declaration_version: "0.1.0",
          resource_match_ref: "lode:resource/xhs_search_notes",
          resource_match_version: "0.1.0",
        },
        effective_policy: { mode: "confirm", source: "installed_skill_user_version", source_version: "1" },
        applicability: { scope: "task", run_id: "run-owner-a-confirming", thread_id: taskAId, turn_id: "turn_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa3", config_refs: ["execution-policy:skill/xhs"] },
        outcome: "confirm",
        risk_marker: null,
        decided_at: "2026-07-20T08:00:00Z",
        expires_at: "2099-07-20T08:05:00Z",
        state: "active",
        invalidated_at: null,
        invalidation_reason: null,
        consumer_boundary: "Business policy decision summary only; technical trace and private browser, evidence, and content material are excluded.",
      } } };
    }
    if (request.path === `/authorization-decisions/${encodeURIComponent(authorizationDecisionRef)}/single-action`) {
      singleActionAttempts += 1;
      if (singleActionAttempts === 1) return { ok: false, error: "simulated_single_action_response_loss" };
      return { ok: true, body: { ok: true, single_action_decision: {
        schema_version: "webenvoy.single-action-decision.v0",
        confirmation_decision_ref: authorizationDecisionRef,
        mode: "deny",
      } } };
    }
    return { ok: true, body: ownerPayload };
  },
};

const ownerState = await fetchCoreThreadState(coreEndpoint);
const authorizationBinding = {
  decisionRef: authorizationDecisionRef,
  runId: "run-owner-a-confirming",
  threadId: taskAId,
  turnId: "turn_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa3",
};
const authorizationProbe = await fetchPendingAuthorizationDecision(coreEndpoint, authorizationBinding);
if (!authorizationProbe.ok) throw new Error(`Authorization decision fixture was rejected: ${authorizationProbe.reason}`);
const retainedState = retainLastKnownCoreThreads(
  ownerState,
  unavailableCoreThreadState(coreEndpoint, "Core runtime disconnected."),
);
const runtimeState = runtimeSupervisorUnavailableState("Core and Harbor runtime unavailable.");
const tasks = projectRuntimeGatedTasks(
  retainedState.tasks,
  runtimeState,
  retainedState.liveTaskIds,
);

function WorkbenchDomHarness() {
  const [selectedTaskId, setSelectedTaskId] = useState(tasks[0]?.id ?? "");
  const [selectedRunIds, setSelectedRunIds] = useState<Record<string, string>>({});
  const [previewSelections, setPreviewSelections] = useState<Record<string, TaskPreviewSelection>>({});
  const [rightPanelOpenRequestKey, setRightPanelOpenRequestKey] = useState<number>();
  const settingsTriggerRef = useRef<HTMLButtonElement>(null);
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? tasks[0];
  const selectedRunId = selectedTask ? selectedRunIds[selectedTask.id] : undefined;
  const selectedRun = selectedTask?.runs.find(
    (run) => run.id === selectedRunId,
  ) ?? selectedTask?.runs.find((run) => run.lifecycle === "completed") ?? selectedTask?.runs[0];
  const displayedTask = selectedTask;
  const displayedRun = displayedTask?.runs.find((run) => run.id === selectedRun?.id);
  const previewSelection = selectedTask == null ? undefined : previewSelections[selectedTask.id];
  const previewRun = previewSelection == null ? undefined : selectedTask?.runs.find((run) => run.id === previewSelection.runId);
  const confirmationRun = selectedTask.id === taskAId && displayedRun != null ? {
    ...displayedRun,
    id: authorizationBinding.runId,
    turnId: authorizationBinding.turnId,
    turnStatus: "waiting_for_user" as const,
    authorizationDecisionRefs: [authorizationDecisionRef],
  } : null;
  const navigationItems = useMemo<ThreadNavigationItem[]>(
    () => selectedTask?.runs.map((run) => ({
      id: run.id,
      hasOutput: run.evidenceCards.length > 0,
      getLabel: () => run.label,
      getPreview: () => ({ response: run.summary, outputs: [] }),
    })) ?? [],
    [selectedTask],
  );

  if (!selectedTask) return null;

  return (
    <AppShell
      collapsePanelsOnNarrow
      initialRightOpen={false}
      rightPanelOpenRequestKey={rightPanelOpenRequestKey}
      rightPanelStateKey={selectedTask.id}
      left={
        <LeftPanel>
          <WorkbenchSidebar
            activeView="work"
            grouping="skill"
            selectedTaskId={selectedTask.id}
            settingsTriggerRef={settingsTriggerRef}
            sort="recent"
            taskLoadStatus={retainedState.status}
            tasks={tasks}
            onGroupingChange={() => {}}
            onCreateTask={() => {}}
            onOpenSettings={() => {}}
            onOpenTask={(task) => setSelectedTaskId(task.id)}
            onOpenView={() => {}}
            onSortChange={() => {}}
          />
        </LeftPanel>
      }
      header={(panelControls) => (
        <header className="shell-topbar production-topbar" aria-label="应用工具栏">
          <div className="topbar-left-slot">{panelControls.left}</div>
          <div className="topbar-center-surface">
            <BriefcaseBusiness size={15} />
            <h2>任务线程</h2>
          </div>
          <div className="topbar-right-slot production-right-topbar">
            <span className="right-panel-topbar-title">预览</span>
            {panelControls.rightFullscreen}
            {panelControls.right}
          </div>
        </header>
      )}
      workspace={displayedRun ? (
        <ThreadWorkspace workspaceKey={`work:${selectedTask.id}`}>
          <TaskThreadPage
            coreEndpoint={coreEndpoint}
            navigationItems={navigationItems}
            selectedRun={displayedRun}
            selectedTask={displayedTask}
            skills={resultSkills}
            onActiveRunChange={(runId) => setSelectedRunIds((current) => ({
              ...current,
              [selectedTask.id]: runId,
            }))}
            onOpenPreview={(selection) => {
              setPreviewSelections((current) => ({ ...current, [selectedTask.id]: selection }));
              setRightPanelOpenRequestKey((key) => (key ?? 0) + 1);
            }}
          />
          {confirmationRun == null ? null : (
            <SingleActionConfirmation
              endpoint={coreEndpoint}
              identityLabel={selectedTask.accountIdentity}
              run={confirmationRun}
              threadRef={selectedTask.id}
            />
          )}
        </ThreadWorkspace>
      ) : (
        <ThreadWorkspace workspaceKey={`work:${selectedTask.id}`}>
          <OwnerState title="暂无任务回合" summary="该线程已创建，尚未提交业务输入。" />
        </ThreadWorkspace>
      )}
      right={previewRun && previewSelection ? (
        <RightPanel>
          <TaskThreadRightPanel
            coreEndpoint={coreEndpoint}
            coreReadState={retainedState}
            coreSubmitState={initialCoreTaskSubmitState}
            runtimeSupervisorState={runtimeState}
            previewSelection={previewSelection}
            selectedRun={previewRun}
            selectedTask={displayedTask}
            skills={resultSkills}
            shellDiagnostics={{ colorScheme: "light", configScope: "local-ui-only", platform: "darwin" }}
          />
        </RightPanel>
      ) : undefined}
    />
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(<WorkbenchDomHarness />);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const waitFor = async (predicate: () => boolean, message: string) => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  throw new Error(message);
};
const shell = () => document.querySelector<HTMLElement>(".app-shell");
const rightPanel = () => document.querySelector<HTMLElement>('[data-focus-area="right-panel"]');
const previewButton = () => document.querySelector<HTMLButtonElement>('[data-workbench-open-right]');
const taskButton = (taskId: string) => Array.from(
  document.querySelectorAll<HTMLButtonElement>(".task-thread-row"),
).find((button) => selectedTaskIdFromButton(button) === taskId);
const selectedTaskIdFromButton = (button: HTMLButtonElement) =>
  button.textContent?.includes("xhs-ops-a")
    ? taskAId
    : button.textContent?.includes("recruiting-a")
      ? taskBId
      : emptyTaskId;

async function runDesktopChecks() {
  await waitFor(() => Boolean(shell() && previewButton()), "Workbench did not render.");
  const appShell = shell();
  assert(appShell, "AppShell is missing.");
  assert(ownerState.status === "ready" && ownerState.tasks.length === 3, "Owner threads were not projected.");
  assert(retainedState.status === "offline" && retainedState.tasks.length === 3, "Last owner state was not retained.");
  assert(taskButton(emptyTaskId), "Empty owner thread was not rendered safely in the sidebar.");
  const taskA = tasks.find((task) => task.id === taskAId);
  assert(taskA, "Projected owner task A is missing.");
  const resultRun = taskA.runs.find((run) => run.id === "run-owner-a-completed");
  assert(resultRun, "Completed owner run is missing for the result matrix.");
  const matrix = [
    resultModel(resultRun, "collection", { normalized: { notes: [{ title: "A" }], result_count: 1 } }, "search_results"),
    resultModel(resultRun, "object", { title: "A" }, "content_detail"),
    resultModel(resultRun, "images", { normalized: { images: [{ name: "cover.png", size: "2 MB" }] } }, "image_gallery"),
    resultModel(resultRun, "media", { normalized: { media: [{ name: "clip.mp4", duration: "10 秒" }] } }, "video_collection"),
    resultModel(resultRun, "files", { normalized: { files: [{ name: "report.pdf", size: "1 MB" }] } }, "file_collection"),
    projectStandardBusinessResult({ ...resultRun, resultRows: [] }, readyResult(undefined, "unknown_owner_type")),
  ].map((model) => model.kind);
  assert(matrix.join(",") === "collection,object,images,media,files,generic", "Standard result type matrix is incomplete.");
  const unboundResult = projectStandardBusinessResult(
    resultRun,
    readyResult({ normalized: { notes: [{ title: "A" }] } }, "search_results"),
  );
  assert(unboundResult.kind === "generic", "A result without an exact package/version/lock/schema binding used a specialized renderer.");
  const stateTitles = [
    projectBusinessResultMessage({ ...resultRun, turnStatus: "cancelled" }, { status: "fixture" })?.title,
    projectBusinessResultMessage({ ...resultRun, turnStatus: "status_unknown" }, { status: "fixture" })?.title,
    projectBusinessResultMessage(resultRun, { status: "unavailable", reason: "owner", summary: "owner unavailable" })?.title,
    projectBusinessResultMessage({ ...resultRun, outcome: "failure", lifecycle: "blocked" }, readyFailure("runtime_timeout"))?.title,
    projectBusinessResultMessage(resultRun, readyUnavailableResult("result_ref_missing"))?.title,
    projectBusinessResultMessage(resultRun, readyUnavailableResult("projection_unavailable"))?.title,
    projectBusinessResultMessage(resultRun, readyPayloadState("not_persisted_in_core"))?.title,
  ];
  assert(stateTitles.join(",") === "已取消,执行状态待确认,结果暂不可用,执行超时,结果引用缺失,结果不可读取,结果内容暂不可用", "Terminal result states are not distinct.");
  const forbiddenRuns = ["cookie", "access_token", "sessionToken", "Authorization", "password", "secret", "api_key", "access_key", "private_key", "encryption_key"];
  const [forbiddenResults, contradictoryResult, notPersistedResult, unavailableResult, missingRefResult] = await Promise.all([
    Promise.all(forbiddenRuns.map((field) => fetchCoreRunResult(coreEndpoint, `run-forbidden-${field}`))),
    fetchCoreRunResult(coreEndpoint, "run-contradictory"),
    fetchCoreRunResult(coreEndpoint, "run-not-persisted"),
    fetchCoreRunResult(coreEndpoint, "run-owner-unavailable"),
    fetchCoreRunResult(coreEndpoint, "run-result-ref-missing"),
  ]);
  assert(forbiddenResults.every((result) => result.status === "unavailable" && result.reason === "invalid") &&
    contradictoryResult.status === "unavailable" && contradictoryResult.reason === "invalid" &&
    notPersistedResult.status === "ready" && notPersistedResult.result.data == null && unavailableResult.status === "unavailable" && unavailableResult.reason === "owner" &&
    missingRefResult.status === "ready" && missingRefResult.result.unavailableReason === "result_ref_missing",
    "Core result client did not fail closed for unsafe or unavailable owner payloads.");
  assert(taskA.runs.some((run) => run.id === "run-owner-a-completed"), "Completed owner turn was not retained.");
  assert(taskA.runs.some((run) => run.id === `runtime-blocked-${taskAId}`), "Active owner turn did not fail closed.");
  assert(!taskA.runs.some((run) => run.id === "run-owner-a-running"), "Active owner turn remained usable after runtime loss.");
  await waitFor(() => Boolean(document.querySelector(".thread-content .business-result-table")), "Collection business result did not render.");
  const firstTimestamp = document.querySelector<HTMLElement>(".task-turn-timestamp");
  assert(firstTimestamp?.textContent?.includes("API"), "Non-App creation channel is not visible beside the timestamp.");
  assert(!document.querySelector(".task-turn-timestamp")?.textContent?.includes("APP"), "App creation channel should stay implicit.");
  assert(!document.body.textContent?.includes("执行过程") && !document.body.textContent?.includes("Capability attribution"),
    "Technical run details still dominate the business timeline.");
  const selectionCell = document.querySelector<HTMLElement>(".thread-content .business-result-table .selection-cell");
  assert(selectionCell && selectionCell.getBoundingClientRect().width <= 40, "Collection selection column is wider than the compact contract.");
  assert(document.querySelectorAll(".thread-content .business-result-table tbody tr").length === 5 && document.body.textContent?.includes("共 8 条，点击查看更多"),
    "Collection pagination summary does not match the approved result pattern.");
  assert(appShell.dataset.rightPanelOpen === "false", "Right panel should be closed initially.");
  assert(appShell.dataset.leftPanelWidth === "300", "Corrupt left-panel width did not use the default.");
  assert(matchMedia("(prefers-reduced-motion: reduce)").matches, "Reduced motion was not emulated.");
  const menuActions = document.querySelector<HTMLElement>(".task-list-heading-actions");
  assert(menuActions && getComputedStyle(menuActions).transitionDuration === "0s", "Reduced-motion CSS did not disable transitions.");
  await waitFor(() => document.body.textContent?.includes("允许这一次") === true && document.body.textContent?.includes("拒绝这一次") === true,
    "Active Core confirmation did not render both single-action choices.");
  const denyOnce = Array.from(document.querySelectorAll<HTMLButtonElement>(".single-action-actions button"))
    .find((button) => button.textContent?.includes("拒绝这一次"));
  assert(denyOnce, "Single-action deny button is missing.");
  denyOnce.click();
  await waitFor(() => document.body.textContent?.includes("重试这次决定") === true, "Single-action failure did not expose retry.");
  document.querySelector<HTMLButtonElement>(".single-action-confirmation.failed button")?.click();
  await waitFor(() => document.body.textContent?.includes("已拒绝这一次。") === true, "Single-action deny did not settle in the UI.");
  const decisionRequests = authorizationRequests.filter((request) => request.path.endsWith("/single-action"));
  const decisionRequest = decisionRequests[0];
  assert(decisionRequests.length === 2 && decisionRequest?.method === "POST" && (decisionRequest.body as { choice?: string })?.choice === "deny_once" &&
    (decisionRequests[0]?.body as { idempotency_key?: string })?.idempotency_key ===
      (decisionRequests[1]?.body as { idempotency_key?: string })?.idempotency_key,
    "Single-action choice was not sent to the Core owner endpoint.");
  assert(!authorizationRequests.some((request) => request.method === "PUT"), "Single-action confirmation mutated a persistent execution policy.");

  const opener = previewButton();
  assert(opener, "Preview opener is missing.");
  opener.focus();
  opener.click();
  await waitFor(
    () => appShell.dataset.rightPanelOpen === "true" && document.activeElement === rightPanel(),
    "Opening the right panel did not move focus into it.",
  );
  assert(document.querySelector('[role="tab"][data-state="active"]')?.textContent?.includes("结果"),
    "A result preview did not activate the result tab.");
  await waitFor(() => document.querySelectorAll(".right-panel .business-result-table tbody tr").length === 1,
    "A row preview did not preserve the selected item in the right panel.");
  assert(Number(appShell.dataset.rightPanelWidth) > 320, "Corrupt right-panel preferences did not use the default width.");

  const closeButton = document.querySelector<HTMLButtonElement>('[data-shell-panel-toggle="right"]');
  assert(closeButton, "Right-panel close button is missing.");
  closeButton.focus();
  closeButton.click();
  await waitFor(
    () => appShell.dataset.rightPanelOpen === "false" && document.activeElement === opener,
    "Closing the right panel did not return focus to its opener.",
  );

  opener.click();
  await waitFor(() => appShell.dataset.rightPanelOpen === "true", "Task A right panel did not reopen.");
  taskButton(taskBId)?.click();
  await waitFor(
    () => taskButton(taskBId)?.getAttribute("aria-current") === "page"
      && appShell.dataset.rightPanelOpen === "false",
    "Task B did not restore its closed right-panel state.",
  );
  taskButton(taskAId)?.click();
  await waitFor(
    () => taskButton(taskAId)?.getAttribute("aria-current") === "page"
      && appShell.dataset.rightPanelOpen === "true",
    "Task A did not restore its open right-panel state.",
  );
  taskButton(emptyTaskId)?.click();
  await waitFor(
    () => document.body.textContent?.includes("暂无任务回合") === true &&
      document.body.textContent?.includes("该线程已创建，尚未提交业务输入。") === true,
    "Opening the empty owner thread did not render its business empty state.",
  );
  taskButton(taskAId)?.click();
  await waitFor(() => Boolean(previewButton()), "Task A did not restore after the empty thread check.");

  return {
    emptyThreadOpenState: true,
    ownerProjection: true,
    nonAppCreationChannel: true,
    runtimeFailClosed: true,
    rightPanelFocusAndRestore: true,
    corruptPreferenceFallback: true,
    reducedMotion: true,
    singleActionDecision: true,
  };
}

function resultModel(run: (typeof tasks)[number]["runs"][number], expected: string, data: Record<string, unknown>, resultKind: string) {
  const model = projectStandardBusinessResult(run, readyResult(data, resultKind), [{
    outputKind: resultKind,
    outputSchemaId: "schema:result/v1",
    packageRef: "package:result@1.0.0",
    version: "1.0.0",
    lockRef: "lock:result@1.0.0",
  }]);
  assert(model.kind === expected, `${expected} result did not use the standard renderer.`);
  return model;
}

function readyResult(data: Record<string, unknown> | undefined, resultKind: string) {
  return {
    status: "ready" as const,
    result: {
      outcome: "success",
      resultKind,
      outputSchemaId: "schema:result/v1",
      packageRef: "package:result@1.0.0",
      capabilityVersion: "1.0.0",
      capabilityLockRef: "lock:result@1.0.0",
      ...(data == null ? {} : { data }),
      payloadState: "available",
      envelopeState: "available",
    },
  };
}

function readyFailure(code: string) {
  return {
    status: "ready" as const,
    result: {
      outcome: "failed",
      payloadState: "unavailable",
      envelopeState: "available",
      failure: { code, recoveryHint: "retry" },
    },
  };
}

function readyUnavailableResult(unavailableReason: string) {
  return {
    status: "ready" as const,
    result: {
      outcome: "success",
      payloadState: "unavailable",
      envelopeState: "unavailable",
      unavailableReason,
    },
  };
}

function readyPayloadState(payloadState: string) {
  return {
    status: "ready" as const,
    result: { outcome: "success", payloadState, envelopeState: "available" },
  };
}

async function runNarrowChecks() {
  const appShell = shell();
  assert(appShell, "AppShell is missing at narrow width.");
  await waitFor(
    () => innerWidth === 720 && appShell.dataset.rightPanelOpen === "false",
    "Narrow layout did not collapse the right panel.",
  );
  const opener = previewButton();
  assert(opener, "Narrow preview opener is missing.");
  opener.focus();
  opener.click();
  await nextFrame();
  await nextFrame();
  await waitFor(() => appShell.dataset.rightPanelOpen === "true", "Narrow right panel did not open.");
  await waitFor(() => {
    const panelRect = document.querySelector<HTMLElement>(".right-panel-resizer")?.getBoundingClientRect();
    const contentRect = document.querySelector<HTMLElement>(".content-region-body")?.getBoundingClientRect();
    return appShell.dataset.rightPanelFullscreen === "true"
      && panelRect != null
      && contentRect != null
      && Math.abs(panelRect.width - contentRect.width) <= 1;
  }, "720px right panel did not settle to the content-region width.");
  const panelRect = document.querySelector<HTMLElement>(".right-panel-resizer")?.getBoundingClientRect();
  const contentRect = document.querySelector<HTMLElement>(".content-region-body")?.getBoundingClientRect();
  assert(panelRect && contentRect, "Narrow panel geometry is unavailable.");
  assert(appShell.dataset.rightPanelFullscreen === "true", "720px right panel is not full width.");
  assert(Math.abs(panelRect.width - contentRect.width) <= 1, "720px right panel does not fill the content region.");
  assert(document.documentElement.scrollWidth <= innerWidth, "720px layout has horizontal overflow.");
  return { fullWidthRightPanel: true, horizontalOverflow: false, viewport: `${innerWidth}x${innerHeight}` };
}

window.__runWorkbenchDomSmoke = async (phase: "desktop" | "narrow") =>
  phase === "desktop" ? runDesktopChecks() : runNarrowChecks();

declare global {
  interface Window {
    __runWorkbenchDomSmoke: (phase: "desktop" | "narrow") => Promise<Record<string, unknown>>;
  }
}
