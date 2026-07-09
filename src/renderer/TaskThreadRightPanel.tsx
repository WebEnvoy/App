import {
  Activity,
  Box,
  Braces,
  ExternalLink,
  Globe2,
  ShieldCheck,
} from "lucide-react";

import { ContextPanel, SourceField } from "./TaskThreadFields";
import { PanelTabs } from "./shellPrimitives";
import type { CoreReadTaskLoadState } from "./coreReadTaskClient";
import type { CoreTaskSubmitState } from "./coreTaskSubmitClient";
import { type RuntimeSupervisorState } from "./runtimeSupervisorState";
import type { RunProjection, TaskProjection } from "./taskThreadFixtures";
import { sourceHealthFixture, type SourceHealth, type SourceHealthStatus } from "./sourceHealthFixture";

type ShellDiagnostics = {
  colorScheme?: string;
  configScope?: string;
  platform?: string;
};

const contextTabs = [
  { id: "evidence", label: "结果依据" },
  { id: "session", label: "执行现场" },
  { id: "identity", label: "账号身份" },
  { id: "skill", label: "站点技能" },
  { id: "diagnostics", label: "诊断" },
];

function statusLabel(status: SourceHealth["status"]) {
  if (status === "ready") {
    return "ready";
  }

  if (status === "unavailable") {
    return "unavailable";
  }

  return "fixture";
}

export function TaskThreadRightPanel({
  coreReadState,
  coreSubmitState,
  runtimeSupervisorState,
  selectedRun,
  selectedTask,
  shellDiagnostics,
}: {
  coreReadState: CoreReadTaskLoadState;
  coreSubmitState: CoreTaskSubmitState;
  runtimeSupervisorState: RuntimeSupervisorState;
  selectedRun: RunProjection;
  selectedTask: TaskProjection;
  shellDiagnostics: ShellDiagnostics;
}) {
  return (
    <aside className="context-panel codex-scrollbar" aria-label="Task context">
      <PanelTabs
        ariaLabel="Task context tabs"
        defaultValue="evidence"
        tabs={contextTabs.map((tab) => ({
          ...tab,
          content:
            tab.id === "evidence" ? (
              <EvidenceTab selectedRun={selectedRun} />
            ) : tab.id === "session" ? (
              <SessionTab selectedRun={selectedRun} selectedTask={selectedTask} />
            ) : tab.id === "identity" ? (
              <ContextPanel
                icon={<ShieldCheck size={18} />}
                title="账号身份"
                body={`账号身份来自 ${selectedTask.identitySource ?? "Harbor fixture"}；App 不保存 credential、cookie、token 或 profile storage。`}
              />
            ) : tab.id === "skill" ? (
              <SiteSkillTab selectedTask={selectedTask} />
            ) : (
              <DiagnosticsTab coreSubmitState={coreSubmitState} shellDiagnostics={shellDiagnostics} />
            ),
        }))}
      />

      <SourceHealthSection coreReadState={coreReadState} runtimeSupervisorState={runtimeSupervisorState} />
    </aside>
  );
}

function DiagnosticsTab({
  coreSubmitState,
  shellDiagnostics,
}: {
  coreSubmitState: CoreTaskSubmitState;
  shellDiagnostics: ShellDiagnostics;
}) {
  return (
    <div className="context-copy">
      <div className="card-title">
        <Activity size={18} />
        <h3>诊断</h3>
      </div>
      <p>
        Shell context: {shellDiagnostics.platform ?? "loading"} / {shellDiagnostics.colorScheme ?? "loading"} / {shellDiagnostics.configScope ?? "loading"}.
        UI selection state is App local-only.
      </p>
      <dl className="context-facts compact">
        <SourceField label="Core submit" value={coreSubmitState.status} source="App local-only" />
        <SourceField label="Run id" value={"runId" in coreSubmitState ? coreSubmitState.runId ?? "not submitted" : "not submitted"} source="Core live" />
        <SourceField label="Submit summary" value={coreSubmitState.summary} source="App local-only" />
      </dl>
    </div>
  );
}

function EvidenceTab({ selectedRun }: { selectedRun: RunProjection }) {
  return (
    <div className="context-copy">
      <div className="card-title">
        <Braces size={18} />
        <h3>结果依据</h3>
      </div>
      <p>Evidence card only links owner viewer refs; App does not read raw evidence body.</p>
      {selectedRun.writePrecheck ? (
        <dl className="context-facts compact">
          <SourceField label="Preview state" value={selectedRun.writePrecheck.state} source={selectedRun.source} />
          <SourceField label="Submitted" value={selectedRun.writePrecheck.submittedLabel ?? "false / 未提交"} source={selectedRun.source} />
          <SourceField label="No-submit guard" value={selectedRun.writePrecheck.noSubmitGuard} source={selectedRun.source} />
          <SourceField label="State note" value={selectedRun.writePrecheck.stateNote} source={selectedRun.source} />
        </dl>
      ) : null}
      {selectedRun.fieldSources ? (
        <>
          <h3 className="subsection-title">字段来源</h3>
          <dl className="context-facts compact">
            {selectedRun.fieldSources.map((field) => (
              <SourceField
                label={field.field}
                value={`${field.locator} · ${field.evidenceRef}`}
                source={field.source}
                key={`${selectedRun.id}-${field.field}`}
              />
            ))}
          </dl>
        </>
      ) : null}
      <div className="context-card-list">
        {selectedRun.evidenceCards.map((evidence) => (
          <article className="context-card" key={evidence.id}>
            <strong>{evidence.title}</strong>
            <p>{evidence.summary}</p>
            <dl className="context-facts compact">
              <SourceField label="Status" value={evidence.status ?? "available"} source={evidence.source} />
              <SourceField label="Freshness" value={evidence.freshness ?? "fresh"} source={evidence.source} />
              <SourceField
                label="Provenance"
                value={evidence.provenance ?? "owner viewer ref"}
                source={evidence.source}
              />
            </dl>
            <a href={evidence.viewerHref}>
              <ExternalLink size={14} />
              {evidence.viewerLabel}
            </a>
            <span className="source-chip">{evidence.source}</span>
          </article>
        ))}
      </div>
    </div>
  );
}

function SessionTab({
  selectedRun,
  selectedTask,
}: {
  selectedRun: RunProjection;
  selectedTask: TaskProjection;
}) {
  const { runtimeSessionRef, viewerRef } = sessionRefsForRun(selectedRun);
  const status = runtimeSessionRef == null ? "unavailable" : "ready";

  return (
    <div className="context-copy">
      <div className="card-title">
        <Globe2 size={18} />
        <h3>执行现场</h3>
        <span className={`status-pill status-${status}`}>{status}</span>
      </div>
      <p>
        {runtimeSessionRef == null
          ? "当前 Run 没有暴露可打开的 Harbor runtime session ref；App 不使用无关本机浏览器现场代替任务现场。"
          : "执行现场来自当前 Run 的 Core/Harbor owner refs；App 只展示引用，不读取 profile、Cookie、token、CDP 或 raw evidence。"}
      </p>
      <dl className="context-facts">
        <SourceField label="Task" value={selectedTask.title} source={selectedTask.source} />
        <SourceField label="Run" value={selectedRun.label} source={selectedRun.source} />
        <SourceField
          label="Runtime session"
          value={runtimeSessionRef ?? "not exposed for this run"}
          source={selectedRun.source}
        />
        <SourceField
          label="Viewer ref"
          value={viewerRef ?? "not exposed for this run"}
          source={selectedRun.source}
        />
      </dl>
      <p className="boundary-copy">
        Execution-site facts must be selected-run owner refs; App does not store browser profile
        storage or raw runtime material.
      </p>
    </div>
  );
}

function sessionRefsForRun(run: RunProjection) {
  const rowRefs = run.resultRows
    .filter((row) => row.label === "执行现场" || row.label === "Runtime session" || row.label === "Viewer ref")
    .map((row) => row.value);
  const fieldRef = run.fieldSources?.find((field) => field.locator.startsWith("harbor:runtime-session/"))?.locator;
  const evidenceRuntimeRef = run.evidenceCards
    .map((card) => /harbor:runtime-session\/[^;.)\s]+/.exec(card.summary)?.[0])
    .find((ref): ref is string => Boolean(ref));
  const runtimeSessionRef =
    rowRefs.find((ref) => ref.startsWith("harbor:runtime-session/")) ?? fieldRef ?? evidenceRuntimeRef;
  const viewerRef = rowRefs.find((ref) => ref.startsWith("viewer://"));
  return { runtimeSessionRef, viewerRef };
}

function SiteSkillTab({ selectedTask }: { selectedTask: TaskProjection }) {
  return (
    <div className="context-copy">
      <div className="card-title">
        <Box size={18} />
        <h3>站点技能</h3>
      </div>
      <p>Capability package source attribution comes from Lode metadata fixture.</p>
      <dl className="context-facts">
        {[
          ["Package", selectedTask.packageSource.name],
          ["Version", selectedTask.packageSource.version],
          ["Capability ref", selectedTask.packageSource.capabilityRef],
          ["Source ref", selectedTask.packageSource.sourceRef],
          ["Lock ref", selectedTask.packageSource.lockRef ?? "unlocked"],
          ["Fetched at", selectedTask.packageSource.fetchedAt],
        ].map(([label, value]) => (
          <SourceField
            label={label}
            value={value}
            source={selectedTask.packageSource.source}
            key={label}
          />
        ))}
      </dl>
      <p className="boundary-copy">
        Work failure links back to capability health through Core run attribution; App keeps only the selected ref
        and local navigation state.
      </p>
      <p className="boundary-copy">{selectedTask.packageSource.boundary}</p>
    </div>
  );
}

function SourceHealthSection({
  coreReadState,
  runtimeSupervisorState,
}: {
  coreReadState: CoreReadTaskLoadState;
  runtimeSupervisorState: RuntimeSupervisorState;
}) {
  const coreStatus: SourceHealthStatus =
    runtimeSupervisorState.services.find((service) => service.id === "core")?.health.state === "ready"
      ? "ready"
      : "unavailable";
  const harborStatus: SourceHealthStatus =
    runtimeSupervisorState.services.find((service) => service.id === "harbor")?.health.state === "ready"
      ? "ready"
      : "unavailable";
  const sources = sourceHealthFixture.map((source) =>
    source.id === "core"
      ? {
          ...source,
          status: coreStatus,
          summary: runtimeSupervisorState.summary,
          fetchedAt: runtimeSupervisorState.checkedAt,
        }
      : source.id === "harbor"
      ? {
          ...source,
          status: harborStatus,
          summary:
            harborStatus === "ready"
              ? "Harbor runtime health is ready."
              : "Harbor runtime health unavailable；fixture/demo provider 不作为可用。",
          fetchedAt: runtimeSupervisorState.checkedAt,
        }
      : source,
  );

  return (
    <section className="source-health" id="source-health">
      <div className="section-heading">
        <span>来源</span>
        <span className="badge">{runtimeSupervisorState.canUseLiveRuntime ? coreReadState.status : "fail-closed"}</span>
      </div>
      {sources.map((source) => (
        <article className="source-card" key={source.id}>
          <div>
            <strong>{source.name}</strong>
            <span className={`status-pill status-${source.status}`}>{statusLabel(source.status)}</span>
          </div>
          <p>{source.ownerTruth}</p>
          <p>{source.summary}</p>
        </article>
      ))}
    </section>
  );
}
