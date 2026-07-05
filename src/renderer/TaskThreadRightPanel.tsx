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
import { directSessionFixture, type RunProjection, type TaskProjection } from "./taskThreadFixtures";
import { sourceHealthFixture, type SourceHealth } from "./sourceHealthFixture";

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
  selectedRun,
  selectedTask,
  shellDiagnostics,
}: {
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
              <SessionTab />
            ) : tab.id === "identity" ? (
              <ContextPanel
                icon={<ShieldCheck size={18} />}
                title="账号身份"
                body="账号身份来自 Harbor fixture；App 不保存 credential、cookie、token 或 profile storage。"
              />
            ) : tab.id === "skill" ? (
              <SiteSkillTab selectedTask={selectedTask} />
            ) : (
              <ContextPanel
                icon={<Activity size={18} />}
                title="诊断"
                body={`Shell context: ${shellDiagnostics.platform ?? "loading"} / ${
                  shellDiagnostics.colorScheme ?? "loading"
                } / ${shellDiagnostics.configScope ?? "loading"}. UI selection state is App local-only.`}
              />
            ),
        }))}
      />

      <SourceHealthSection />
    </aside>
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
      <div className="context-card-list">
        {selectedRun.evidenceCards.map((evidence) => (
          <article className="context-card" key={evidence.id}>
            <strong>{evidence.title}</strong>
            <p>{evidence.summary}</p>
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

function SessionTab() {
  return (
    <div className="context-copy">
      <div className="card-title">
        <Globe2 size={18} />
        <h3>执行现场</h3>
        <span className={`status-pill status-${directSessionFixture.providerStatus.status}`}>
          {directSessionFixture.providerStatus.status}
        </span>
      </div>
      <p>{directSessionFixture.summary}</p>
      <dl className="context-facts">
        {[
          ["Browser session", directSessionFixture.providerStatus.browserSessionRef],
          ["Provider", directSessionFixture.providerStatus.provider],
          ["Viewer ref", directSessionFixture.providerStatus.viewerRef],
          ["Fetched at", directSessionFixture.providerStatus.fetchedAt],
        ].map(([label, value]) => (
          <SourceField
            label={label}
            value={value}
            source={directSessionFixture.providerStatus.source}
            key={label}
          />
        ))}
      </dl>
      <p className="boundary-copy">{directSessionFixture.providerStatus.boundary}</p>
    </div>
  );
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
      <p className="boundary-copy">{selectedTask.packageSource.boundary}</p>
    </div>
  );
}

function SourceHealthSection() {
  return (
    <section className="source-health" id="source-health">
      <div className="section-heading">
        <span>来源</span>
        <span className="badge">fixture</span>
      </div>
      {sourceHealthFixture.map((source) => (
        <article className="source-card" key={source.id}>
          <div>
            <strong>{source.name}</strong>
            <span className={`status-pill status-${source.status}`}>{statusLabel(source.status)}</span>
          </div>
          <p>{source.ownerTruth}</p>
        </article>
      ))}
    </section>
  );
}
