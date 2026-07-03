import {
  Activity,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  ArrowUp,
  BadgeCheck,
  Box,
  Braces,
  ChevronDown,
  CircleDot,
  DatabaseZap,
  ExternalLink,
  FolderKanban,
  Globe2,
  HardDrive,
  Mic,
  MoreHorizontal,
  Paperclip,
  Plus,
  PanelRightOpen,
  Search,
  Settings,
  ShieldCheck,
  Target,
  Waypoints,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { handleTypeToComposer, registerComposerInput } from "./focusComposer";
import {
  defaultConnectionConfig,
  loadLocalConnectionConfig,
  saveLocalConnectionConfig,
  type LocalConnectionConfig,
} from "./localConnectionConfig";
import { sourceHealthFixture, type SourceHealth } from "./sourceHealthFixture";
import {
  directSessionFixture,
  taskThreadFixtures,
  type RunProjection,
  type TaskProjection,
} from "./taskThreadFixtures";
import {
  AppShell,
  LeftPanel,
  PanelTabs,
  RightPanel,
  ThreadWorkspace,
} from "./shellPrimitives";

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

    const shellContext =
      window.webenvoyShell?.getShellContext?.() ??
      Promise.resolve({
        platform: "browser",
        colorScheme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
        configScope: "local-ui-only" as const,
      });

    shellContext
      .then((context) => {
        if (!cancelled) {
          setShellContext(context);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setShellContext({
            platform: "browser",
            colorScheme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
            configScope: "local-ui-only",
          });
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
    <AppShell
      left={
        <LeftPanel>
          <aside className="sidebar" aria-label="Task Thread navigation">
            <button className="new-task-button" type="button">
              <Plus size={16} />
              新建任务
            </button>

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
        </LeftPanel>
      }
      header={(panelControls) => (
        <header className="shell-topbar" aria-label="Task Thread toolbar">
          <div className="topbar-left-slot">
            {panelControls.left}
            <button className="topbar-icon-button" type="button" aria-label="后退" disabled>
              <ArrowLeft size={15} />
            </button>
            <button className="topbar-icon-button" type="button" aria-label="前进" disabled>
              <ArrowRight size={15} />
            </button>
          </div>
          <div className="topbar-center-surface">
            <span className="topbar-thread-symbol" aria-hidden="true">
              <FolderKanban size={15} />
            </span>
            <h2 id="thread-title">{selectedTask.title}</h2>
            <span className="thread-state">已完成未读</span>
            <CircleDot className="thread-state-dot" size={10} />
            <button className="topbar-icon-button" type="button" aria-label="更多操作">
              <MoreHorizontal size={16} />
            </button>
          </div>
          <div className="topbar-right-slot">
            <button className="topbar-open-button" type="button">
              <PanelRightOpen size={15} />
              打开
              <ChevronDown size={14} />
            </button>
            {panelControls.right}
          </div>
        </header>
      )}
      workspace={
        <ThreadWorkspace
          composer={<ThreadComposer selectedRun={selectedRun} selectedTask={selectedTask} />}
        >
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
            <div className="thread-context-strip" aria-label="Task context">
              <span>站点技能 · {selectedTask.siteSkill}</span>
              <span>账号身份 · {selectedTask.accountIdentity}</span>
              <span>业务输入 · {selectedTask.businessInput}</span>
            </div>

            <section className="run-summary-card">
              <div className="card-title">
                <span className="disclosure">›</span>
                <h3>已处理 1m 27s</h3>
                <span>打开页面、完成登录、采集字段...</span>
              </div>
              <button type="button">点击展开查看详情</button>
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
              <h3 className="subsection-title">提取结果</h3>
              <dl className="input-grid">
                {selectedRun.resultRows.slice(0, 4).map((row) => (
                  <SourceField
                    label={row.label}
                    value={row.value}
                    source={row.source}
                    key={`${selectedRun.id}-${row.label}`}
                  />
                ))}
              </dl>
              <h3 className="subsection-title">运行边界</h3>
              <dl className="input-grid">
                <SourceField label="Run" value={selectedRun.label} source={selectedRun.source} />
                <SourceField label="Lifecycle" value={selectedRun.lifecycle} source={selectedRun.source} />
              </dl>
              <p className="action-intent">{selectedRun.actionIntent}</p>
            </section>

            <section className="process-card">
              <div className="card-title compact-title">
                <Braces size={18} />
                <h3>证据预览</h3>
              </div>
              <dl className="result-table">
                {selectedRun.evidenceCards.map((row) => (
                  <SourceField
                    label={row.title}
                    value={row.summary}
                    source={row.source}
                    key={row.id}
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
        </ThreadWorkspace>
      }
      right={
        <RightPanel>
          <aside className="context-panel" aria-label="Task context">
        <PanelTabs
          ariaLabel="Task context tabs"
          defaultValue="evidence"
          tabs={contextTabs.map((tab) => ({
            ...tab,
            content:
              tab.id === "evidence" ? (
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
              ) : tab.id === "session" ? (
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
              ) : tab.id === "identity" ? (
                <ContextPanel
                  icon={<ShieldCheck size={18} />}
                  title="账号身份"
                  body="账号身份来自 Harbor fixture；App 不保存 credential、cookie、token 或 profile storage。"
                />
              ) : tab.id === "skill" ? (
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
              ) : (
                <ContextPanel
                  icon={<Activity size={18} />}
                  title="诊断"
                  body={`Shell context: ${shellContext?.platform ?? "loading"} / ${
                    shellContext?.colorScheme ?? "loading"
                  } / ${shellContext?.configScope ?? "loading"}. UI selection state is App local-only.`}
                />
              ),
          }))}
        />

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
        </RightPanel>
      }
    />
  );
}

function ThreadComposer({
  selectedRun,
  selectedTask,
}: {
  selectedRun: RunProjection;
  selectedTask: TaskProjection;
}) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const [draft, setDraft] = useState("");
  const [footerMeasure, setFooterMeasure] = useState({
    actionsWidth: 0,
    columnGap: 0,
    containerWidth: 0,
  });
  const availableFooterWidth = Math.max(
    0,
    footerMeasure.containerWidth -
      footerMeasure.actionsWidth -
      (footerMeasure.actionsWidth > 0 ? footerMeasure.columnGap : 0),
  );
  const hideRunContext = availableFooterWidth > 0 && availableFooterWidth < 128;
  const hideSkillContext = availableFooterWidth > 0 && availableFooterWidth < 96;
  const hideAccessControl = availableFooterWidth > 0 && availableFooterWidth < 62;

  useEffect(() => {
    const composerInput = inputRef.current;
    if (composerInput == null) {
      return;
    }

    return registerComposerInput(composerInput, {
      composerId: "task-thread-primary",
      isPrimaryComposer: true,
    });
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const composerInput = inputRef.current;
      if (composerInput == null) {
        return;
      }

      handleTypeToComposer({
        event,
        composerController: {
          focus: () => composerInput.focus(),
          insertTextAtSelection: (text) =>
            insertComposerText(composerInput, text, setDraft),
        },
      });
    }

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, []);

  useEffect(() => {
    const toolbar = toolbarRef.current;
    const actions = actionsRef.current;
    if (
      toolbar == null ||
      actions == null ||
      typeof ResizeObserver === "undefined"
    ) {
      return;
    }

    let animationFrame = 0;
    const readMeasure = () => {
      const { columnGap, gap } = window.getComputedStyle(toolbar);
      const nextMeasure = {
        actionsWidth: actions.getBoundingClientRect().width,
        columnGap: Number.parseFloat(columnGap) || Number.parseFloat(gap) || 0,
        containerWidth: toolbar.getBoundingClientRect().width,
      };

      setFooterMeasure((currentMeasure) =>
        Math.abs(currentMeasure.actionsWidth - nextMeasure.actionsWidth) < 0.5 &&
        Math.abs(currentMeasure.columnGap - nextMeasure.columnGap) < 0.5 &&
        Math.abs(currentMeasure.containerWidth - nextMeasure.containerWidth) < 0.5
          ? currentMeasure
          : nextMeasure,
      );
    };
    const scheduleMeasure = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(readMeasure);
    };

    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(toolbar);
    observer.observe(actions);
    readMeasure();
    window.addEventListener("resize", scheduleMeasure);
    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, []);

  return (
    <form
      className="thread-composer"
      aria-label="Task thread composer"
      onSubmit={(event) => event.preventDefault()}
    >
      <textarea
        ref={inputRef}
        data-webenvoy-composer=""
        value={draft}
        rows={2}
        placeholder="要求后续变更"
        onChange={(event) => setDraft(event.target.value)}
      />
      <div className="composer-toolbar" ref={toolbarRef}>
        <div className="composer-inline-controls">
          <button className="composer-icon-button" type="button" aria-label="添加上下文">
            <Plus size={15} />
          </button>
          <button
            className={
              hideAccessControl
                ? "composer-access composer-control-hidden"
                : "composer-access"
            }
            type="button"
          >
            <ShieldCheck size={14} />
            <span className="composer-button-label">只读边界</span>
          </button>
        </div>
        <div className="composer-expanding-controls">
          <button
            className={
              hideSkillContext
                ? "composer-context-pill composer-context-skill composer-control-hidden"
                : "composer-context-pill composer-context-skill"
            }
            type="button"
          >
            <Target size={14} />
            <span className="composer-button-label">{selectedTask.siteSkill}</span>
          </button>
          <button
            className={
              hideRunContext
                ? "composer-context-pill composer-context-run composer-control-hidden"
                : "composer-context-pill composer-context-run"
            }
            type="button"
          >
            <Zap size={14} />
            <span className="composer-button-label">{selectedRun.label}</span>
          </button>
        </div>
        <div className="composer-actions" ref={actionsRef}>
          <button className="composer-icon-button" type="button" aria-label="附件">
            <Paperclip size={15} />
          </button>
          <button className="composer-icon-button" type="button" aria-label="语音输入">
            <Mic size={15} />
          </button>
          <button className="composer-send" type="submit" aria-label="发送" disabled>
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </form>
  );
}

function insertComposerText(
  composerInput: HTMLTextAreaElement,
  text: string,
  setDraft: (value: string) => void,
) {
  const selectionStart = composerInput.selectionStart;
  const selectionEnd = composerInput.selectionEnd;
  const nextValue =
    composerInput.value.slice(0, selectionStart) +
    text +
    composerInput.value.slice(selectionEnd);

  setDraft(nextValue);
  requestAnimationFrame(() => {
    const nextPosition = selectionStart + text.length;
    composerInput.selectionStart = nextPosition;
    composerInput.selectionEnd = nextPosition;
  });
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
