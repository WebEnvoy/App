import * as Tabs from "@radix-ui/react-tabs";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Box,
  Braces,
  CircleDot,
  DatabaseZap,
  FolderKanban,
  Globe2,
  HardDrive,
  PanelRightOpen,
  Search,
  Settings,
  ShieldCheck,
  Waypoints,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import {
  defaultConnectionConfig,
  loadLocalConnectionConfig,
  saveLocalConnectionConfig,
  type LocalConnectionConfig,
} from "./localConnectionConfig";
import { sourceHealthFixture, type SourceHealth } from "./sourceHealthFixture";
import {
  creationEntryFixture,
  directSessionFixture,
  taskThreadFixtures,
  type RunProjection,
  type TaskProjection,
} from "./taskThreadFixtures";

type ShellContext = {
  platform: string;
  colorScheme: "light" | "dark";
  configScope: "local-ui-only";
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

function outcomeLabel(outcome: RunProjection["outcome"]) {
  return `outcome: ${outcome}`;
}

export function App() {
  const [shellContext, setShellContext] = useState<ShellContext | null>(null);
  const [connectionConfig, setConnectionConfig] = useState<LocalConnectionConfig>(
    defaultConnectionConfig,
  );
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState(taskThreadFixtures[0].id);
  const [selectedRunId, setSelectedRunId] = useState(taskThreadFixtures[0].runs[0].id);

  const selectedTask =
    taskThreadFixtures.find((task) => task.id === selectedTaskId) ?? taskThreadFixtures[0];
  const selectedRun =
    selectedTask.runs.find((run) => run.id === selectedRunId) ?? selectedTask.runs[0];

  useEffect(() => {
    let cancelled = false;

    setConnectionConfig(loadLocalConnectionConfig());

    window.webenvoyShell.getShellContext().then((context) => {
      if (!cancelled) {
        setShellContext(context);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  function selectTask(task: TaskProjection) {
    setSelectedTaskId(task.id);
    setSelectedRunId(task.runs[0].id);
  }

  function updateEndpoint(field: keyof LocalConnectionConfig, value: string) {
    setSettingsSaved(false);
    setSettingsError("");
    setConnectionConfig((currentConfig) => ({ ...currentConfig, [field]: value }));
  }

  function saveSettings() {
    const validation = saveLocalConnectionConfig(connectionConfig);

    if (!validation.ok) {
      setSettingsSaved(false);
      setSettingsError(Object.values(validation.errors).join(" "));
      return;
    }

    setConnectionConfig(validation.config);
    setSettingsError("");
    setSettingsSaved(true);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Task Thread navigation">
        <div className="brand-lockup">
          <div className="brand-mark">WE</div>
          <div>
            <p className="eyebrow">WebEnvoy App</p>
            <h1>Task Thread</h1>
          </div>
        </div>

        <nav className="global-nav" aria-label="Global navigation">
          <a className="nav-item nav-item-active" href="#task-thread">
            <FolderKanban size={16} />
            任务
          </a>
          <a className="nav-item" href="#source-health">
            <DatabaseZap size={16} />
            Source health
          </a>
          <a className="nav-item" href="#settings">
            <Settings size={16} />
            Settings
          </a>
          <a className="nav-item" href="#search">
            <Search size={16} />
            Search
          </a>
        </nav>

        <section className="task-tree" aria-label="Tasks grouped by account identity">
          <div className="section-heading">
            <span>任务</span>
            <button type="button" aria-label="Read-only task creation entry">
              +
            </button>
          </div>

          {taskThreadFixtures.map((task) => (
            <div className="tree-account" key={task.id}>
              <div className="tree-account-label">
                <HardDrive size={14} />
                {task.accountIdentity}
              </div>
              <div className="tree-skill">
                <span>{task.siteSkill}</span>
                <button
                  className={task.id === selectedTask.id ? "tree-task selected" : "tree-task"}
                  type="button"
                  onClick={() => selectTask(task)}
                >
                  <CircleDot size={12} />
                  {task.title}
                </button>
              </div>
            </div>
          ))}

          <article className="direct-session-card">
            <strong>{directSessionFixture.title}</strong>
            <span>{directSessionFixture.accountIdentity}</span>
            <p>{directSessionFixture.summary}</p>
          </article>
        </section>
      </aside>

      <section className="thread-column" id="task-thread" aria-labelledby="thread-title">
        <header className="thread-header">
          <div>
            <p className="eyebrow">GH-105 read-only task batch</p>
            <h2 id="thread-title">{selectedTask.title}</h2>
            <div className="thread-meta">
              <span>{selectedTask.accountIdentity}</span>
              <span>{selectedTask.siteSkill}</span>
              <span>{selectedTask.businessInput}</span>
              <span>{selectedTask.source}</span>
            </div>
          </div>
          <button className="panel-button" type="button">
            <PanelRightOpen size={16} />
            打开上下文
          </button>
        </header>

        <div className="thread-body">
          <nav className="run-rail" aria-label="Core-owned run navigation">
            {selectedTask.runs.map((run) => (
              <button
                className={run.id === selectedRun.id ? "run-dot selected" : "run-dot"}
                type="button"
                key={run.id}
                onClick={() => setSelectedRunId(run.id)}
                aria-label={`${run.label} ${outcomeLabel(run.outcome)}`}
              />
            ))}
          </nav>

          <div className="thread-content">
            <section className="creation-card">
              <div className="card-title">
                <Box size={18} />
                <h3>只读任务创建入口</h3>
              </div>
              <dl className="input-grid">
                <SourceField label="站点技能" value={creationEntryFixture.siteSkill.label} source={creationEntryFixture.siteSkill.source} />
                <SourceField label="账号身份" value={creationEntryFixture.accountIdentity.label} source={creationEntryFixture.accountIdentity.source} />
                <SourceField label="业务输入" value={creationEntryFixture.businessInput.label} source={creationEntryFixture.businessInput.source} />
                <SourceField label="Core source" value={creationEntryFixture.coreSource.label} source={creationEntryFixture.coreSource.source} />
              </dl>
              <p className="blocker-copy">{creationEntryFixture.coreSource.blocker}</p>
              <button className="submit-intent" type="button" disabled>
                提交 task intent read-only scope
              </button>
            </section>

            {selectedTask.blocker ? (
              <section className="blocker-card">
                <div className="card-title">
                  <AlertTriangle size={18} />
                  <h3>Blocker: missing source</h3>
                </div>
                <p>{selectedTask.blocker}</p>
              </section>
            ) : null}

            <section className={`report-card outcome-${selectedRun.outcome}`}>
              <div className="card-title">
                <BadgeCheck size={18} />
                <h3>任务结束报告</h3>
                <span className="badge">{outcomeLabel(selectedRun.outcome)}</span>
              </div>
              <p>{selectedRun.summary}</p>
              <dl className="input-grid">
                <SourceField label="Run" value={selectedRun.label} source={selectedRun.source} />
                <SourceField label="Lifecycle" value={selectedRun.lifecycle} source={selectedRun.source} />
              </dl>
              <p className="action-intent">{selectedRun.actionIntent}</p>
            </section>

            <section className="process-card">
              <div className="card-title">
                <Braces size={18} />
                <h3>结构化结果视图</h3>
              </div>
              <dl className="result-table">
                {selectedRun.resultRows.map((row) => (
                  <SourceField
                    label={row.label}
                    value={row.value}
                    source={row.source}
                    key={`${selectedRun.id}-${row.label}`}
                  />
                ))}
              </dl>
            </section>

            <section className="process-card">
              <div className="card-title">
                <Waypoints size={18} />
                <h3>执行过程</h3>
              </div>
              <ol>
                {selectedRun.process.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </section>
          </div>
        </div>

        <footer className="thread-actions" aria-label="Task actions">
          <button type="button" disabled>
            修改输入
          </button>
          <button type="button" disabled>
            再次执行
          </button>
          <button type="button">查看结果依据</button>
          <button type="button">打开执行现场</button>
        </footer>
      </section>

      <aside className="context-panel" aria-label="Task context">
        <section className="source-health" id="source-health">
          <div className="section-heading">
            <span>Source health fixture</span>
            <span className="badge">no live calls</span>
          </div>
          {sourceHealthFixture.map((source) => (
            <article className="source-card" key={source.id}>
              <div>
                <strong>{source.name}</strong>
                <span>{source.ownerTruth}</span>
              </div>
              <p>{source.summary}</p>
              <div className={`status-pill status-${source.status}`}>{statusLabel(source.status)}</div>
            </article>
          ))}
        </section>

        <Tabs.Root className="context-tabs" defaultValue="evidence">
          <Tabs.List className="tab-list" aria-label="Task context tabs">
            {contextTabs.map((tab) => (
              <Tabs.Trigger className="tab-trigger" value={tab.id} key={tab.id}>
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Tabs.Content className="tab-panel" value="evidence">
            <ContextPanel
              icon={<Braces size={18} />}
              title="结果依据"
              body="#110-#113 remain out of scope; this panel only links later owner refs."
            />
          </Tabs.Content>
          <Tabs.Content className="tab-panel" value="session">
            <ContextPanel
              icon={<Globe2 size={18} />}
              title="执行现场"
              body={directSessionFixture.summary}
            />
          </Tabs.Content>
          <Tabs.Content className="tab-panel" value="identity">
            <ContextPanel
              icon={<ShieldCheck size={18} />}
              title="账号身份"
              body="账号身份来自 Harbor fixture；App 不保存 credential、cookie、token 或 profile storage。"
            />
          </Tabs.Content>
          <Tabs.Content className="tab-panel" value="skill">
            <ContextPanel
              icon={<Box size={18} />}
              title="站点技能"
              body="站点技能来自 Lode capability package metadata fixture；workflow runtime/editor UI 不在 GH-105 范围。"
            />
          </Tabs.Content>
          <Tabs.Content className="tab-panel" value="diagnostics">
            <ContextPanel
              icon={<Activity size={18} />}
              title="诊断"
              body={`Shell context: ${shellContext?.platform ?? "loading"} / ${
                shellContext?.colorScheme ?? "loading"
              } / ${shellContext?.configScope ?? "loading"}. UI selection state is App local-only.`}
            />
          </Tabs.Content>
        </Tabs.Root>

        <section className="settings-panel" id="settings">
          <div className="card-title">
            <AlertTriangle size={18} />
            <h3>Settings local boundary</h3>
          </div>
          <p>仅保存本地 endpoint choice。不要输入 token、cookie、profile path 或 raw evidence。</p>
          <ConnectionInput
            label="Core endpoint"
            value={connectionConfig.coreEndpoint}
            onChange={(value) => updateEndpoint("coreEndpoint", value)}
          />
          <ConnectionInput
            label="Harbor endpoint"
            value={connectionConfig.harborEndpoint}
            onChange={(value) => updateEndpoint("harborEndpoint", value)}
          />
          <ConnectionInput
            label="Lode endpoint"
            value={connectionConfig.lodeEndpoint}
            onChange={(value) => updateEndpoint("lodeEndpoint", value)}
          />
          <button className="save-button" type="button" onClick={saveSettings}>
            保存本地配置
          </button>
          {settingsError ? <p className="settings-error" role="alert">{settingsError}</p> : null}
          <span className="settings-saved">{settingsSaved ? "Saved locally" : "Not saved"}</span>
        </section>
      </aside>
    </main>
  );
}

function SourceField({
  label,
  value,
  source,
}: {
  label: string;
  value: string;
  source: string;
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
      <span className="source-chip">{source}</span>
    </div>
  );
}

function ContextPanel({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="context-copy">
      <div className="card-title">
        {icon}
        <h3>{title}</h3>
      </div>
      <p>{body}</p>
    </div>
  );
}

function ConnectionInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="connection-field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.currentTarget.value)} />
    </label>
  );
}
