import { Activity, AlertTriangle, Ban, Braces, Check, FileDiff, HardDrive, PanelRightOpen, ShieldAlert, Waypoints, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { decideSingleAction, fetchPendingAuthorizationDecision, type PendingAuthorizationDecision } from "./authorizationDecisionClient";
import { policySourceLabel } from "./executionPolicyClient";
import type { LodeCatalogSkill } from "./lodeCatalogClient";
import { outcomeLabel, SourceField } from "./TaskThreadFields";
import { ThreadNavigationRail, type ThreadNavigationItem } from "./ThreadNavigationRail";
import { RunStatusGlyph, runReportTitle } from "./RunStatusGlyph";
import type { CoreReadTaskLoadState } from "./coreReadTaskClient";
import type { CoreTaskSubmitState } from "./coreTaskSubmitClient";
import { runtimeService, type RuntimeSupervisorState } from "./runtimeSupervisorState";
import type { RunProjection, TaskProjection } from "./taskThreadFixtures";
import { TaskTurnBusinessInput } from "./TaskTurnBusinessInput";

export function TaskThreadPage({
  coreEndpoint,
  coreReadState,
  coreSubmitState,
  navigationItems,
  runtimeSupervisorState,
  skill,
  selectedRun,
  selectedTask,
  onActiveRunChange,
  onOpenPreview,
}: {
  coreEndpoint: string;
  coreReadState: CoreReadTaskLoadState;
  coreSubmitState: CoreTaskSubmitState;
  navigationItems: ThreadNavigationItem[];
  runtimeSupervisorState: RuntimeSupervisorState;
  skill?: LodeCatalogSkill;
  selectedRun: RunProjection;
  selectedTask: TaskProjection;
  onActiveRunChange: (runId: string) => void;
  onOpenPreview: () => void;
}) {
  return (
    <div className="thread-body">
      <ThreadNavigationRail
        activeItemId={selectedRun.id}
        items={navigationItems}
        onActiveItemChange={onActiveRunChange}
      />

      <div className="thread-content">
        <div className="thread-context-strip" aria-label="Task context">
          <span>站点技能 · {selectedTask.siteSkill}</span>
          <span>账号身份 · {selectedTask.accountIdentity}</span>
          <span>业务输入 · {selectedTask.businessInput}</span>
        </div>

        <CoreReadSourceStrip selectedTask={selectedTask} state={coreReadState} />
        <RuntimeSupervisorStrip state={runtimeSupervisorState} />
        <CoreSubmitStrip state={coreSubmitState} />
        <TaskIntentTurn selectedTask={selectedTask} />

        {selectedTask.blocker ? (
          <section className="blocker-card">
            <div className="card-title">
              <AlertTriangle size={18} />
              <h3>Blocker: missing source</h3>
            </div>
            <p>{selectedTask.blocker}</p>
          </section>
        ) : null}

        <div className="run-turn-list" aria-label="Core-owned run timeline">
          {selectedTask.runs.map((run) => (
            <RunTurn
              coreEndpoint={coreEndpoint}
              identityLabel={selectedTask.accountIdentity}
              threadRef={selectedTask.id}
              skill={skill}
              isSelected={run.id === selectedRun.id}
              key={run.id}
              run={run}
              onOpenPreview={onOpenPreview}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CoreSubmitStrip({ state }: { state: CoreTaskSubmitState }) {
  const status =
    state.status === "ready"
      ? "ready"
      : state.status === "idle" || state.status === "polling" || state.status === "submitting"
      ? "loading"
      : "blocked";
  const runId = "runId" in state ? state.runId : "not submitted";
  const title =
    state.status === "ready"
      ? "提交完成"
      : state.status === "polling"
      ? "等待 refs"
      : state.status === "submitting"
      ? "提交中"
      : state.status === "idle"
      ? "提交待命"
      : "提交受控";

  return (
    <section className={`core-read-source-strip core-read-source-${status}`} aria-label="Core task submit status">
      <div>
        <strong>{title}</strong>
        <span>POST /tasks read-only</span>
      </div>
      <p>{state.summary}</p>
      <span className="badge">{runId}</span>
    </section>
  );
}

function RuntimeSupervisorStrip({ state }: { state: RuntimeSupervisorState }) {
  const core = runtimeService(state, "core");
  const harbor = runtimeService(state, "harbor");
  const status = state.canUseLiveRuntime ? "ready" : "blocked";

  return (
    <section className={`runtime-supervisor-strip runtime-supervisor-${status}`} aria-label="Runtime supervisor status">
      <div>
        <Activity size={16} />
        <strong>{state.canUseLiveRuntime ? "本地 runtime 可用" : "生产运行已阻断"}</strong>
        <span className={`status-pill status-${status}`}>{status}</span>
      </div>
      <p>{state.summary}</p>
      <dl>
        <SourceField
          label="Core health / admission"
          value={`${core?.health.state ?? "unavailable"} / ${core?.admission?.state ?? "unavailable"}`}
          source="App runtime supervisor"
        />
        <SourceField
          label="Harbor health"
          value={harbor?.health.state ?? "unavailable"}
          source="App runtime supervisor"
        />
        <SourceField
          label="Runtime probes"
          value={[
            core?.health.summary,
            core?.admission?.summary,
            harbor?.health.summary,
          ].filter(Boolean).join(" ")}
          source="App runtime supervisor"
        />
        <SourceField
          label="Repair"
          value={runtimeRepairAction(state)}
          source="App runtime supervisor"
        />
      </dl>
    </section>
  );
}

function runtimeRepairAction(state: RuntimeSupervisorState) {
  const core = runtimeService(state, "core");
  const harbor = runtimeService(state, "harbor");

  if (!core || core.health.state !== "ready") return core?.repairAction ?? "Configure Core runtime command/path.";
  if (core.admission?.state !== "ready") return core.repairAction;
  if (harbor?.health.state !== "ready") return harbor?.repairAction ?? "Configure Harbor runtime command/path.";
  return core?.repairAction ?? harbor?.repairAction ?? "Configure local runtime command/path.";
}

function CoreReadSourceStrip({
  selectedTask,
  state,
}: {
  selectedTask: TaskProjection;
  state: CoreReadTaskLoadState;
}) {
  const isLiveTask = state.liveTaskIds.includes(selectedTask.id);
  const isWritePrecheckTask = selectedTask.runs.some((run) => run.writePrecheck);
  const taskKind = isWritePrecheckTask ? "写前验证" : "只读任务结果";
  const status = state.status === "ready" && !isLiveTask ? "fallback" : state.status;
  const label =
    status === "ready"
      ? "实时结果"
      : status === "fallback"
      ? "本地展示"
      : status === "loading"
      ? "正在检查"
      : "本地展示";
  const summary =
    status === "ready"
      ? isWritePrecheckTask
        ? "已读取 owner 返回的写前验证引用；页面只展示预期变化、证据引用、风险状态和 owner submitted 状态。"
        : "已读取 owner 返回的只读运行结果引用；页面只展示结果、证据引用和恢复状态。"
      : status === "loading"
      ? `正在检查是否有可用的${taskKind}；检查期间保留本地展示。`
      : status === "fallback"
      ? "当前任务没有可用的实时结果，继续显示明确标记的本地展示。"
      : "暂未读取到可用实时结果，继续显示明确标记的本地展示。";

  return (
    <section className={`core-read-source-strip core-read-source-${status}`} aria-label="Core read task status">
      <div>
        <strong>{label}</strong>
        <span>{taskKind}</span>
      </div>
      <p>{summary}</p>
      <span className="badge">{status === "ready" ? "owner refs" : "fallback"}</span>
    </section>
  );
}

function TaskIntentTurn({ selectedTask }: { selectedTask: TaskProjection }) {
  return (
    <section className="thread-intent-turn" aria-label="Task thread intent">
      <div className="thread-intent-title">
        <HardDrive size={16} />
        <div>
          <strong>Task = 站点技能 + 账号身份 + 业务输入</strong>
          <p>App 只组织用户意图；Core、Harbor、Lode 仍拥有各自事实来源。</p>
        </div>
        <span className="badge">{selectedTask.source}</span>
      </div>
      <dl className="thread-intent-grid">
        <SourceField
          label="Site Skill"
          value={selectedTask.siteSkill}
          source={selectedTask.packageSource.source}
        />
        <SourceField
          label="Identity"
          value={selectedTask.accountIdentity}
          source={selectedTask.identitySource ?? selectedTask.source}
        />
        <SourceField
          label="Business input"
          value={selectedTask.businessInput}
          source="App local-only"
        />
      </dl>
      <p className="boundary-copy">
        Managed Core Task 展示 Run / Result / Evidence；direct Identity Runtime Session 只作为
        Harbor session context，不会被转换成 task success。
      </p>
    </section>
  );
}

function RunTurn({
  coreEndpoint,
  identityLabel,
  threadRef,
  skill,
  run,
  isSelected,
  onOpenPreview,
}: {
  coreEndpoint: string;
  identityLabel: string;
  threadRef: string;
  skill?: LodeCatalogSkill;
  run: RunProjection;
  isSelected: boolean;
  onOpenPreview: () => void;
}) {
  return (
    <article
      className={isSelected ? "run-turn selected" : "run-turn"}
      data-content-search-unit-key={run.id}
      data-turn-key={run.id}
    >
      <section className="run-summary-card">
        <div className="card-title">
          <span className="disclosure">›</span>
          <RunStatusGlyph run={run} />
          <h3>{run.label}</h3>
          <span>{run.process[0] ?? run.lifecycle}</span>
        </div>
        {isSelected ? <span className="badge">当前 Run</span> : null}
      </section>

      {run.businessInput == null ? null : <TaskTurnBusinessInput input={run.businessInput} skill={skill} />}
      <SingleActionConfirmation endpoint={coreEndpoint} identityLabel={identityLabel} run={run} threadRef={threadRef} />
      <section className="process-card">
        <div className="card-title compact-title process-title">
          <Waypoints size={18} />
          <h3>执行过程</h3>
        </div>
        <ol>
          {run.process.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>
      <section className={`report-card outcome-${run.outcome} lifecycle-${run.lifecycle}`}>
        <div className="card-title">
          <RunStatusGlyph run={run} />
          <h3>{runReportTitle(run)}</h3>
          <span className="badge">{outcomeLabel(run.outcome)}</span>
        </div>
        <p>{run.summary}</p>
        {run.writePrecheck ? <WritePrecheckPreview run={run} /> : null}
        {run.approval ? <ApprovalPreview run={run} /> : null}
        <h3 className="subsection-title">提取结果</h3>
        <dl className="input-grid">
          {run.resultRows.slice(0, 4).map((row) => (
            <SourceField
              label={row.label}
              value={row.value}
              source={row.source}
              key={`${run.id}-${row.label}`}
            />
          ))}
        </dl>
        {run.fieldSources ? <FieldSources run={run} /> : null}
        {run.failureRecovery ? <FailureRecovery run={run} /> : null}
        <h3 className="subsection-title">运行边界</h3>
        <dl className="input-grid">
          <SourceField label="Run" value={run.label} source={run.source} />
          <SourceField label="Lifecycle" value={run.lifecycle} source={run.source} />
        </dl>
        {run.capabilityAttribution ? (
          <>
            <h3 className="subsection-title">Capability attribution</h3>
            <dl className="input-grid">
              <SourceField label="Capability" value={run.capabilityAttribution.capabilityRef} source={run.source} />
              <SourceField label="Version" value={run.capabilityAttribution.version} source={run.source} />
              <SourceField label="Failure class" value={run.capabilityAttribution.failureClass} source={run.source} />
              <SourceField label="Source ref" value={run.capabilityAttribution.sourceRef} source={run.source} />
            </dl>
            <p className="action-intent">{run.capabilityAttribution.summary}</p>
          </>
        ) : null}
        <p className="action-intent">{run.actionIntent}</p>
      </section>

      <section className="process-card">
        <div className="card-title compact-title">
          <Braces size={18} />
          <h3>证据预览</h3>
          <button
            className="task-preview-button we-toolbar-icon-button cursor-interaction"
            type="button"
            aria-label="在右栏打开结果依据"
            title="在右栏打开结果依据"
            data-workbench-open-right
            onClick={onOpenPreview}
          >
            <PanelRightOpen size={16} />
          </button>
        </div>
        <dl className="result-table">
          {run.evidenceCards.map((row) => (
            <SourceField
              label={row.title}
              value={`${row.summary} Status: ${row.status ?? "available"}; freshness: ${row.freshness ?? "fresh"}; provenance: ${
                row.provenance ?? "owner viewer ref"
              }.`}
              source={row.source}
              key={row.id}
            />
          ))}
        </dl>
      </section>
      <footer className="task-turn-timestamp">{formatTurnTime(run.terminalAt ?? run.updatedAt ?? run.createdAt)}</footer>
    </article>
  );
}

type ConfirmationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; decision: PendingAuthorizationDecision }
  | { status: "submitting"; decision: PendingAuthorizationDecision }
  | { status: "settled"; summary: string }
  | { status: "failed"; summary: string };

export function SingleActionConfirmation({ endpoint, identityLabel, run, threadRef }: {
  endpoint: string;
  identityLabel: string;
  run: RunProjection;
  threadRef: string;
}) {
  const [state, setState] = useState<ConfirmationState>({ status: "idle" });
  const statusRef = useRef<HTMLElement>(null);
  const refsKey = (run.authorizationDecisionRefs ?? []).join("\u0000");

  useEffect(() => {
    const refs = run.authorizationDecisionRefs ?? [];
    if (run.turnStatus !== "waiting_for_user" || run.turnId == null || refs.length === 0) {
      setState({ status: "idle" });
      return;
    }
    let cancelled = false;
    setState({ status: "loading" });
    void fetchPendingAuthorizationDecision(endpoint, {
      decisionRef: refs.at(-1)!,
      runId: run.id,
      threadId: threadRef,
      turnId: run.turnId!,
    }).then((result) => {
      if (cancelled) return;
      setState(result.ok ? { status: "ready", decision: result.decision } : { status: "idle" });
    });
    return () => { cancelled = true; };
  }, [endpoint, refsKey, run.id, run.turnId, run.turnStatus, threadRef]);

  async function decide(choice: "allow_once" | "deny_once") {
    if (state.status !== "ready") return;
    const decision = state.decision;
    setState({ status: "submitting", decision });
    const result = await decideSingleAction(endpoint, decision.decisionRef, choice);
    setState(result.ok ? { status: "settled", summary: result.summary } : { status: "failed", summary: result.reason });
    window.requestAnimationFrame(() => statusRef.current?.focus());
  }

  if (state.status === "idle" || state.status === "loading") return null;
  if (state.status === "settled" || state.status === "failed") {
    return <section ref={statusRef} className={`single-action-confirmation ${state.status}`} role="status" tabIndex={-1}><span>{state.summary}</span></section>;
  }
  const decision = state.decision;
  const busy = state.status === "submitting";
  return (
    <section className={`single-action-confirmation${decision.destructive ? " destructive" : ""}`} aria-label="当前动作确认">
      <div className="single-action-copy">
        <ShieldAlert size={17} />
        <span>
          <strong>{actionLabel(decision.category)}</strong>
          <small>{identityLabel} · {targetLabel(decision)} · {policySourceLabel(decision.policySource)}</small>
        </span>
      </div>
      {decision.destructive ? <span className="single-action-risk"><AlertTriangle size={13} />危险行为</span> : null}
      <div className="single-action-actions">
        <button type="button" disabled={busy} onClick={() => void decide("deny_once")}><X size={14} />拒绝这一次</button>
        <button className="primary" type="button" disabled={busy} onClick={() => void decide("allow_once")}><Check size={14} />{busy ? "处理中" : "允许这一次"}</button>
      </div>
    </section>
  );
}

function actionLabel(category: PendingAuthorizationDecision["category"]) {
  return { read: "读取和下载", prepare: "填写但不提交", commit: "发布或提交", destructive: "危险行为" }[category];
}

function targetLabel(decision: PendingAuthorizationDecision) {
  return [decision.siteSlug, decision.targetType, decision.origin].filter(Boolean).join(" · ") || decision.targetRef;
}

function formatTurnTime(value: string | undefined) {
  if (value == null || !Number.isFinite(Date.parse(value))) return "时间未知";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function FieldSources({ run }: { run: RunProjection }) {
  return (
    <>
      <h3 className="subsection-title">字段来源</h3>
      <dl className="input-grid">
        {run.fieldSources?.map((row) => (
          <SourceField
            label={row.field}
            value={`${row.value} · ${row.locator} · ${row.evidenceRef}`}
            source={row.source}
            key={`${run.id}-${row.field}`}
          />
        ))}
      </dl>
    </>
  );
}

function FailureRecovery({ run }: { run: RunProjection }) {
  const recovery = run.failureRecovery;
  if (!recovery) {
    return null;
  }

  return (
    <section className="failure-recovery-panel" aria-label="可恢复失败">
      <div className="card-title compact-title">
        <AlertTriangle size={18} />
        <h3>{recovery.state}</h3>
        <span className="source-chip">{recovery.source}</span>
      </div>
      <p>{recovery.reason}</p>
      <ol className="failure-recovery-list">
        {recovery.nextActions.map((action) => (
          <li key={action}>{action}</li>
        ))}
      </ol>
    </section>
  );
}

function WritePrecheckPreview({ run }: { run: RunProjection }) {
  const preview = run.writePrecheck;
  if (!preview) {
    return null;
  }
  const ownerSource = run.source;

  return (
    <section className="write-precheck-panel" aria-label="Write-pre preview">
      <div className="card-title compact-title">
        <FileDiff size={18} />
        <h3>真实页面写前验证 (Write-pre preview)</h3>
        <span className="badge">{preview.modeLabel}</span>
      </div>
      <p>{preview.expectedChangeSummary}</p>
      <dl className="input-grid">
        <SourceField label="Preview state" value={preview.state} source={ownerSource} />
        <SourceField label="Submitted" value={preview.submittedLabel ?? "false / 未提交"} source={ownerSource} />
        <SourceField label="No-submit guard" value={preview.noSubmitGuard} source={ownerSource} />
        {run.approval ? <SourceField label="Risk" value={run.approval.riskLabel} source={ownerSource} /> : null}
        {run.approval ? (
          <SourceField
            label="Approval states"
            value={run.approval.statuses.map((item) => item.status).join(" / ")}
            source={ownerSource}
          />
        ) : null}
        <SourceField label="Before" value={preview.beforeLabel} source={ownerSource} />
        <SourceField label="After" value={preview.afterLabel} source={ownerSource} />
      </dl>
      <div className="diff-preview" aria-label="Diff-like preview">
        {preview.diffRows.map((row) => (
          <div className="diff-preview-row" key={`${run.id}-${row.label}`}>
            <strong>{row.label}</strong>
            <span>{row.before}</span>
            <span>{row.after}</span>
            <span className="source-chip">{row.source}</span>
          </div>
        ))}
      </div>
      <p className="boundary-copy">{preview.stateNote}</p>
    </section>
  );
}

function ApprovalPreview({ run }: { run: RunProjection }) {
  const approval = run.approval;
  const [cancelRequested, setCancelRequested] = useState(false);
  if (!approval) {
    return null;
  }
  const ownerSource = run.source;

  return (
    <section className="approval-panel" aria-label="Risk and approval request">
      <div className="card-title compact-title">
        <ShieldAlert size={18} />
        <h3>风险与审批请求 (Risk and approval)</h3>
        <span className={`status-pill status-${approval.riskLevel}`}>{approval.riskLabel}</span>
      </div>
      <dl className="input-grid">
        <SourceField label="Action request" value={approval.actionRequestId} source={ownerSource} />
        <SourceField label="Cancel intent" value={approval.cancelIntent} source="App local-only" />
      </dl>
      <div className="approval-state-list">
        {approval.statuses.map((item) => (
          <div className="approval-state-row" key={`${run.id}-${item.label}`}>
            <span>{item.label}</span>
            <span className={`status-pill status-${item.status}`}>{item.status}</span>
            <p>{item.detail}</p>
          </div>
        ))}
      </div>
      <button className="cancel-intent-button" type="button" onClick={() => setCancelRequested(true)}>
        <Ban size={15} />
        {cancelRequested ? "取消意图已暂存" : "记录取消意图"}
      </button>
      <p className="boundary-copy">{approval.boundary}</p>
    </section>
  );
}
