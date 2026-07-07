import { AlertTriangle, Ban, Braces, FileDiff, HardDrive, ShieldAlert, Waypoints } from "lucide-react";
import { useState } from "react";

import { outcomeLabel, SourceField } from "./TaskThreadFields";
import { ThreadNavigationRail, type ThreadNavigationItem } from "./ThreadNavigationRail";
import { RunStatusGlyph, runReportTitle } from "./RunStatusGlyph";
import type { CoreReadTaskLoadState } from "./coreReadTaskClient";
import type { RunProjection, TaskProjection } from "./taskThreadFixtures";

export function TaskThreadPage({
  coreReadState,
  navigationItems,
  selectedRun,
  selectedTask,
  onActiveRunChange,
}: {
  coreReadState: CoreReadTaskLoadState;
  navigationItems: ThreadNavigationItem[];
  selectedRun: RunProjection;
  selectedTask: TaskProjection;
  onActiveRunChange: (runId: string) => void;
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
              isSelected={run.id === selectedRun.id}
              key={run.id}
              run={run}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CoreReadSourceStrip({
  selectedTask,
  state,
}: {
  selectedTask: TaskProjection;
  state: CoreReadTaskLoadState;
}) {
  const isLiveTask = state.liveTaskIds.includes(selectedTask.id);
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
      ? "已读取 owner 返回的只读运行结果引用；页面只展示结果、证据引用和恢复状态。"
      : status === "loading"
      ? "正在检查是否有可用的只读运行结果；检查期间保留本地展示。"
      : status === "fallback"
      ? "当前任务没有可用的实时结果，继续显示明确标记的本地展示。"
      : "暂未读取到可用实时结果，继续显示明确标记的本地展示。";

  return (
    <section className={`core-read-source-strip core-read-source-${status}`} aria-label="Core read task status">
      <div>
        <strong>{label}</strong>
        <span>只读任务结果</span>
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
        <span className="badge">{selectedTask.source === "Core live" ? "Core live projection" : "fallback projection"}</span>
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
          source="Harbor fixture"
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

function RunTurn({ run, isSelected }: { run: RunProjection; isSelected: boolean }) {
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

      {!isSelected ? null : (
        <>
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
        </>
      )}
    </article>
  );
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

  return (
    <section className="write-precheck-panel" aria-label="Write-pre preview">
      <div className="card-title compact-title">
        <FileDiff size={18} />
        <h3>真实页面写前验证 (Write-pre preview)</h3>
        <span className="badge">{preview.modeLabel}</span>
      </div>
      <p>{preview.expectedChangeSummary}</p>
      <dl className="input-grid">
        <SourceField label="Preview state" value={preview.state} source="Core fixture" />
        <SourceField label="Submitted" value="false / 未提交" source="Core fixture" />
        <SourceField label="No-submit guard" value={preview.noSubmitGuard} source="Core fixture" />
        {run.approval ? <SourceField label="Risk" value={run.approval.riskLabel} source="Core fixture" /> : null}
        {run.approval ? (
          <SourceField
            label="Approval states"
            value={run.approval.statuses.map((item) => item.status).join(" / ")}
            source="Core fixture"
          />
        ) : null}
        <SourceField label="Before" value={preview.beforeLabel} source="Harbor fixture" />
        <SourceField label="After" value={preview.afterLabel} source="Lode fixture" />
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

  return (
    <section className="approval-panel" aria-label="Risk and approval request">
      <div className="card-title compact-title">
        <ShieldAlert size={18} />
        <h3>风险与审批请求 (Risk and approval)</h3>
        <span className={`status-pill status-${approval.riskLevel}`}>{approval.riskLabel}</span>
      </div>
      <dl className="input-grid">
        <SourceField label="Action request" value={approval.actionRequestId} source="Core fixture" />
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
