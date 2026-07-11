import {
  ArrowLeft,
  ArrowRight,
  Box,
  ChevronDown,
  FolderKanban,
  HardDrive,
  Plus,
  PanelRightOpen,
  Search,
  Settings,
  SquarePen,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  defaultConnectionConfig,
  loadLocalConnectionConfig,
  saveLocalConnectionConfig,
  type LocalConnectionConfig,
} from "./localConnectionConfig";
import {
  coreReadTaskStateFromFallback,
  fetchCoreReadTaskState,
  type CoreReadTaskLoadState,
} from "./coreReadTaskClient";
import {
  coreTaskSubmitReadiness,
  initialCoreTaskSubmitState,
  promoteSubmittedCoreTask,
  submitCoreReadOnlyTask,
  type CoreTaskSubmitState,
} from "./coreTaskSubmitClient";
import { fetchHarborIdentityState } from "./harborIdentityClient";
import type { HarborIdentityLoadState } from "./harborIdentityTypes";
import {
  SiteSkillDetailPage,
  SiteSkillDirectoryPage,
} from "./SiteSkillPages";
import { IdentityEnvironmentsPage } from "./IdentityEnvironmentsPage";
import { SettingsPage } from "./SettingsPage";
import { siteSkillFixtures, type SiteSkill } from "./siteSkillFixtures";
import {
  directSessionFixture,
  taskThreadFixtures,
  type TaskProjection,
} from "./taskThreadFixtures";
import { type ThreadNavigationItem } from "./ThreadNavigationRail";
import { RunStatusGlyph } from "./RunStatusGlyph";
import {
  projectRuntimeGatedTasks,
  runtimeSupervisorCheckingState,
  runtimeSupervisorUnavailableState,
  type RuntimeSupervisorState,
} from "./runtimeSupervisorState";
import { loadLocalIdentityEnvironmentDrafts } from "./localIdentityEnvironmentStore";
import { outcomeLabel } from "./TaskThreadFields";
import { TaskThreadComposer } from "./TaskThreadComposer";
import { TaskThreadPage } from "./TaskThreadPage";
import { TaskThreadRightPanel } from "./TaskThreadRightPanel";
import {
  AppShell,
  LeftPanel,
  RightPanel,
  ThreadWorkspace,
} from "./shellPrimitives";

type ShellContext = {
  platform: string;
  colorScheme: "light" | "dark";
  configScope: "local-ui-only";
};
type AppView = "task-thread" | "site-skills" | "identity-environments" | "settings";
type SubmittedTaskOverride = {
  endpoint: string;
  taskId: string;
  task: TaskProjection;
};
type SiteId = "xiaohongshu" | "boss";
const milestone14TaskIds = new Set([
  "task-xhs-publish-write-preview",
  "task-boss-greeting-write-preview",
  "task-xhs-real-read",
  "task-boss-real-read",
]);
const milestone14TaskThreadFixtures = taskThreadFixtures.filter((task) => milestone14TaskIds.has(task.id));

function getBrowserColorScheme(): ShellContext["colorScheme"] {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function localShellContext(colorScheme: ShellContext["colorScheme"]): ShellContext {
  return {
    platform: "browser",
    colorScheme,
    configScope: "local-ui-only",
  };
}

function applyDocumentTheme(colorScheme: ShellContext["colorScheme"]) {
  document.documentElement.style.setProperty("color-scheme", colorScheme);
  document.documentElement.dataset.weTheme = colorScheme;
}

const defaultTaskThread =
  milestone14TaskThreadFixtures.find((task) => task.id === "task-xhs-real-read") ??
  milestone14TaskThreadFixtures[0] ??
  taskThreadFixtures[0];
const initialHarborIdentityState: HarborIdentityLoadState = {
  status: "loading",
  fetchedAt: "pending",
  summary: "正在读取 Harbor live identity public facts。",
  identities: [],
};

function coreSubmitStateKey(taskId: string, endpoint: string) {
  return `${endpoint}::${taskId}`;
}

function siteForTask(task: TaskProjection): SiteId {
  return task.id.includes("boss") || task.siteSkill.toLowerCase().includes("boss") ? "boss" : "xiaohongshu";
}

function applyLocalTaskContext(
  task: TaskProjection,
  businessInputOverrides: Record<string, string>,
  harborIdentityState: HarborIdentityLoadState,
): TaskProjection {
  const businessInput = businessInputOverrides[task.id] ?? task.businessInput;
  const searchQuery = businessInputOverrides[task.id] === undefined ? task.searchQuery : undefined;
  const liveIdentity = harborIdentityState.identities.find(
    (identity) => identity.source === "Harbor live" && identity.siteId === siteForTask(task),
  );

  return {
    ...task,
    businessInput,
    searchQuery,
    ...(liveIdentity == null
      ? {}
      : {
          accountIdentity: liveIdentity.name,
          identitySource: liveIdentity.source,
        }),
  };
}

function readOnlyTaskId(taskId: string) {
  return milestone14TaskIds.has(taskId) && !taskId.includes("write-preview");
}

export function App() {
  const [shellContext, setShellContext] = useState<ShellContext | null>(null);
  const [connectionConfig, setConnectionConfig] = useState<LocalConnectionConfig>(
    defaultConnectionConfig,
  );
  const [runtimeSupervisorState, setRuntimeSupervisorState] = useState<RuntimeSupervisorState>(
    runtimeSupervisorCheckingState,
  );
  const [coreReadState, setCoreReadState] = useState<CoreReadTaskLoadState>(() =>
    coreReadTaskStateFromFallback(defaultConnectionConfig.coreEndpoint, milestone14TaskThreadFixtures),
  );
  const [coreSubmitStatesByKey, setCoreSubmitStatesByKey] = useState<Record<string, CoreTaskSubmitState>>({});
  const [submittedTaskOverrides, setSubmittedTaskOverrides] = useState<Record<string, SubmittedTaskOverride>>({});
  const [taskBusinessInputOverrides, setTaskBusinessInputOverrides] = useState<Record<string, string>>({});
  const [harborIdentityState, setHarborIdentityState] = useState<HarborIdentityLoadState>(initialHarborIdentityState);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [activeView, setActiveView] = useState<AppView>("task-thread");
  const [selectedTaskId, setSelectedTaskId] = useState(defaultTaskThread.id);
  const [selectedRunId, setSelectedRunId] = useState(defaultTaskThread.runs[0]?.id ?? "");
  const [selectedSiteSkillId, setSelectedSiteSkillId] = useState(siteSkillFixtures[0].id);
  const [isSiteSkillDetailOpen, setSiteSkillDetailOpen] = useState(false);
  const selectedTaskIdRef = useRef(selectedTaskId);
  const coreEndpointRef = useRef(connectionConfig.coreEndpoint);

  useEffect(() => {
    selectedTaskIdRef.current = selectedTaskId;
  }, [selectedTaskId]);

  useEffect(() => {
    coreEndpointRef.current = connectionConfig.coreEndpoint;
  }, [connectionConfig.coreEndpoint]);

  const currentEndpointSubmittedOverrides = useMemo(
    () =>
      Object.values(submittedTaskOverrides).filter(
        (override) => override.endpoint === connectionConfig.coreEndpoint,
      ),
    [connectionConfig.coreEndpoint, submittedTaskOverrides],
  );
  const submittedLiveTaskIds = useMemo(
    () => currentEndpointSubmittedOverrides.map((override) => override.taskId),
    [currentEndpointSubmittedOverrides],
  );
  const effectiveCoreReadState = useMemo<CoreReadTaskLoadState>(() => {
    const liveTaskIds = Array.from(new Set([...coreReadState.liveTaskIds, ...submittedLiveTaskIds]));
    const submittedTasksById = new Map(
      currentEndpointSubmittedOverrides.map((override) => [override.taskId, override.task]),
    );
    return {
      ...coreReadState,
      status: liveTaskIds.length > coreReadState.liveTaskIds.length ? "ready" : coreReadState.status,
      summary: submittedLiveTaskIds.length > 0
        ? `${coreReadState.summary} 已包含 UI 提交产生的 live run。`
        : coreReadState.summary,
      tasks: coreReadState.tasks.map((task) => submittedTasksById.get(task.id) ?? task),
      liveTaskIds,
    };
  }, [coreReadState, currentEndpointSubmittedOverrides, submittedLiveTaskIds]);
  const effectiveCoreReadTasks = useMemo(
    () =>
      effectiveCoreReadState.tasks.map((task) =>
        applyLocalTaskContext(task, taskBusinessInputOverrides, harborIdentityState),
      ),
    [effectiveCoreReadState.tasks, harborIdentityState, taskBusinessInputOverrides],
  );
  const taskThreads = useMemo(
    () =>
      projectRuntimeGatedTasks(
        effectiveCoreReadTasks,
        runtimeSupervisorState,
        effectiveCoreReadState.liveTaskIds,
      ),
    [effectiveCoreReadState.liveTaskIds, effectiveCoreReadTasks, runtimeSupervisorState],
  );
  const selectedTask =
    taskThreads.find((task) => task.id === selectedTaskId) ?? taskThreads[0] ?? defaultTaskThread;
  const selectedSubmitTask =
    effectiveCoreReadTasks.find((task) => task.id === selectedTask.id) ?? selectedTask;
  const selectedSubmitStateKey = coreSubmitStateKey(selectedSubmitTask.id, connectionConfig.coreEndpoint);
  const coreSubmitState = coreSubmitStatesByKey[selectedSubmitStateKey] ?? initialCoreTaskSubmitState;
  const selectedRun =
    selectedTask.runs.find((run) => run.id === selectedRunId) ?? selectedTask.runs[0];
  const selectedSiteSkill =
    siteSkillFixtures.find((skill) => skill.id === selectedSiteSkillId) ?? siteSkillFixtures[0];
  const isSiteSkillView = activeView === "site-skills";
  const isIdentityEnvironmentsView = activeView === "identity-environments";
  const isSettingsView = activeView === "settings";
  const isAppLevelView = isSiteSkillView || isIdentityEnvironmentsView || isSettingsView;
  const pageTitle = isSettingsView
    ? "设置"
    : isIdentityEnvironmentsView
    ? "账号身份"
    : isSiteSkillView
    ? isSiteSkillDetailOpen
      ? selectedSiteSkill.name
      : "Library"
    : selectedTask.title;
  const threadNavigationItems = useMemo<ThreadNavigationItem[]>(
    () =>
      selectedTask.runs.map((run) => ({
        id: run.id,
        getLabel: () => `${run.label} · ${outcomeLabel(run.outcome)}`,
        hasOutput: run.evidenceCards.length > 0,
        getPreview: () => ({
          response: run.summary,
          outputs: [
            { type: "outcome", label: outcomeLabel(run.outcome) },
            { type: "lifecycle", label: run.lifecycle },
            ...run.resultRows.slice(0, 2).map((row) => ({
              type: "field",
              label: row.label,
            })),
          ],
        }),
      })),
    [selectedTask],
  );

  useEffect(() => {
    let cancelled = false;

    setConnectionConfig(loadLocalConnectionConfig());

    const getShellContext =
      window.webenvoyShell && typeof window.webenvoyShell.getShellContext === "function"
        ? window.webenvoyShell.getShellContext
        : null;
    const shellContext =
      getShellContext?.() ??
      Promise.resolve(localShellContext(getBrowserColorScheme()));

    shellContext
      .then((context) => {
        if (!cancelled) {
          applyDocumentTheme(context.colorScheme);
          setShellContext(context);
        }
      })
      .catch(() => {
        if (!cancelled) {
          const colorScheme = getBrowserColorScheme();
          applyDocumentTheme(colorScheme);
          setShellContext(localShellContext(colorScheme));
        }
      });

    const applyColorScheme = (colorScheme: ShellContext["colorScheme"]) => {
      applyDocumentTheme(colorScheme);
      setShellContext((context) =>
        context == null ? localShellContext(colorScheme) : { ...context, colorScheme },
      );
    };
    const unsubscribeShellTheme =
      window.webenvoyShell?.subscribeToSystemThemeVariant?.((colorScheme) => {
        if (!cancelled) {
          applyColorScheme(colorScheme);
        }
      }) ?? null;
    const mediaQuery =
      unsubscribeShellTheme == null ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    const handleBrowserThemeChange = () => {
      if (!cancelled) {
        applyColorScheme(getBrowserColorScheme());
      }
    };
    mediaQuery?.addEventListener("change", handleBrowserThemeChange);

    return () => {
      cancelled = true;
      unsubscribeShellTheme?.();
      mediaQuery?.removeEventListener("change", handleBrowserThemeChange);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setCoreReadState(coreReadTaskStateFromFallback(connectionConfig.coreEndpoint, milestone14TaskThreadFixtures));
    fetchCoreReadTaskState(connectionConfig.coreEndpoint, milestone14TaskThreadFixtures).then((state) => {
      if (!cancelled) setCoreReadState(state);
    });
    return () => {
      cancelled = true;
    };
  }, [connectionConfig.coreEndpoint]);

  useEffect(() => {
    let cancelled = false;
    setHarborIdentityState(initialHarborIdentityState);
    fetchHarborIdentityState(connectionConfig.harborEndpoint, loadLocalIdentityEnvironmentDrafts()).then((state) => {
      if (!cancelled) setHarborIdentityState(state);
    });
    return () => {
      cancelled = true;
    };
  }, [connectionConfig.harborEndpoint, runtimeSupervisorState.canUseLiveRuntime]);

  useEffect(() => {
    let cancelled = false;
    setRuntimeSupervisorState(runtimeSupervisorCheckingState());

    const readSupervisor = window.webenvoyShell?.getRuntimeSupervisorState;
    if (readSupervisor == null) {
      setRuntimeSupervisorState(
        runtimeSupervisorUnavailableState(
          "Electron runtime supervisor unavailable；生产任务保持 fail closed，fixture/demo 不作为可用结果。",
        ),
      );
      return () => {
        cancelled = true;
      };
    }

    const refreshRuntimeSupervisor = () => {
      readSupervisor(connectionConfig)
        .then((state) => {
          if (!cancelled) setRuntimeSupervisorState(state);
        })
        .catch((error) => {
          if (!cancelled) {
            setRuntimeSupervisorState(
              runtimeSupervisorUnavailableState(
                error instanceof Error ? error.message : String(error),
              ),
            );
          }
        });
    };
    refreshRuntimeSupervisor();
    const interval = window.setInterval(refreshRuntimeSupervisor, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [connectionConfig]);

  useEffect(() => {
    const task = taskThreads.find((item) => item.id === selectedTaskId) ?? taskThreads[0];
    if (!task) return;
    if (task.id !== selectedTaskId) {
      setSelectedTaskId(task.id);
      setSelectedRunId(task.runs[0]?.id ?? "");
      return;
    }
    if (!task.runs.some((run) => run.id === selectedRunId)) {
      setSelectedRunId(task.runs[0]?.id ?? "");
    }
  }, [selectedRunId, selectedTaskId, taskThreads]);

  function selectTask(task: TaskProjection) {
    setActiveView("task-thread");
    setSelectedTaskId(task.id);
    setSelectedRunId(task.runs[0].id);
  }

  function openTaskById(taskId: string) {
    const task = taskThreads.find((item) => item.id === taskId);
    if (task != null) {
      selectTask(task);
    }
  }

  function openTaskThread() {
    setActiveView("task-thread");
  }

  function openSiteSkillDirectory() {
    setActiveView("site-skills");
    setSiteSkillDetailOpen(false);
  }

  function openIdentityEnvironments() {
    setActiveView("identity-environments");
  }

  function openSiteSkillDetail(skill: SiteSkill) {
    setActiveView("site-skills");
    setSelectedSiteSkillId(skill.id);
    setSiteSkillDetailOpen(true);
  }

  function startReadTask(skill: SiteSkill) {
    const taskId = skill.relatedTaskIds[0];
    if (
      taskId != null &&
      runtimeSupervisorState.canUseLiveRuntime &&
      (readOnlyTaskId(taskId) || effectiveCoreReadState.liveTaskIds.includes(taskId))
    ) {
      openTaskById(taskId);
    }
  }

  function updateSelectedTaskBusinessInput(value: string) {
    const taskId = selectedSubmitTask.id;
    const submitKey = coreSubmitStateKey(taskId, connectionConfig.coreEndpoint);
    setTaskBusinessInputOverrides((current) => ({
      ...current,
      [taskId]: value,
    }));
    setCoreSubmitStatesByKey((current) => ({
      ...current,
      [submitKey]: initialCoreTaskSubmitState,
    }));
  }

  async function submitSelectedCoreTask() {
    const submitTask = selectedSubmitTask;
    const submitEndpoint = connectionConfig.coreEndpoint;
    const submitKey = coreSubmitStateKey(submitTask.id, submitEndpoint);
    const readiness = coreTaskSubmitReadiness(
      submitTask,
      runtimeSupervisorState,
      harborIdentityState.identities,
    );
    if (!readiness.ok) {
      setCoreSubmitStatesByKey((current) => ({
        ...current,
        [submitKey]: { status: "blocked", summary: readiness.reason },
      }));
      return;
    }

    setCoreSubmitStatesByKey((current) => ({
      ...current,
      [submitKey]: {
        status: "submitting",
        summary: "正在向 Core POST /tasks 提交只读 task intent。",
      },
    }));
    const result = await submitCoreReadOnlyTask(
      submitEndpoint,
      submitTask,
      runtimeSupervisorState,
      harborIdentityState.identities,
    );
    setCoreSubmitStatesByKey((current) => ({ ...current, [submitKey]: result }));
    if (result.status === "ready") {
      setSubmittedTaskOverrides((current) => ({
        ...current,
        [submitKey]: {
          endpoint: submitEndpoint,
          taskId: submitTask.id,
          task: promoteSubmittedCoreTask(submitTask, result.run),
        },
      }));
      if (selectedTaskIdRef.current === submitTask.id && coreEndpointRef.current === submitEndpoint) {
        setSelectedRunId(result.run.id);
      }
    }
  }

  function openSettings() {
    setActiveView("settings");
  }

  function goBackFromTopbar() {
    if (isSettingsView) {
      openTaskThread();
      return;
    }

    if (isIdentityEnvironmentsView) {
      openTaskThread();
      return;
    }

    if (isSiteSkillDetailOpen) {
      openSiteSkillDirectory();
    }
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

  if (isSettingsView) {
    return (
      <SettingsPage
        colorScheme={shellContext?.colorScheme}
        configScope={shellContext?.configScope}
        connectionConfig={connectionConfig}
        platform={shellContext?.platform}
        runtimeSupervisorState={runtimeSupervisorState}
        settingsError={settingsError}
        settingsSaved={settingsSaved}
        onBack={openTaskThread}
        onEndpointChange={updateEndpoint}
        onSave={saveSettings}
      />
    );
  }

  return (
    <AppShell
      left={
        <LeftPanel>
          <aside className="sidebar" aria-label="Task Thread navigation">
            <nav className="global-nav" aria-label="Global navigation">
              <button
                className={
                  activeView === "task-thread"
                    ? "nav-item we-list-row cursor-interaction nav-item-active"
                    : "nav-item we-list-row cursor-interaction"
                }
                type="button"
                onClick={openTaskThread}
              >
                <SquarePen size={16} />
                任务
              </button>
              <button
                className={
                  activeView === "site-skills"
                    ? "nav-item we-list-row cursor-interaction nav-item-active"
                    : "nav-item we-list-row cursor-interaction"
                }
                type="button"
                onClick={openSiteSkillDirectory}
              >
                <Box size={16} />
                Library
              </button>
              <button
                className={
                  activeView === "identity-environments"
                    ? "nav-item we-list-row cursor-interaction nav-item-active"
                    : "nav-item we-list-row cursor-interaction"
                }
                type="button"
                onClick={openIdentityEnvironments}
              >
                <UserRound size={16} />
                账号身份
              </button>
              <button
                className="nav-item we-list-row cursor-interaction"
                type="button"
                disabled
                title="搜索不属于 APP-239 真实只读结果展示批次。"
              >
                <Search size={16} />
                Search
              </button>
            </nav>

            <section className="task-tree codex-scrollbar" aria-label="Tasks grouped by account identity">
              <div className="section-heading">
                <span>任务</span>
                <button
                  type="button"
                  aria-label="Read-only task creation entry"
                  disabled
                  title="新建任务不属于 APP-244；本批次只展示已有小红书/BOSS 只读任务和写前验证。"
                >
                  <Plus size={15} />
                </button>
              </div>

              {taskThreads.map((task) => (
                <div className="tree-account" key={task.id}>
                  <div className="tree-account-label">
                    <HardDrive size={14} />
                    {task.accountIdentity}
                  </div>
                  <div className="tree-skill">
                    <span>{task.siteSkill}</span>
                    <button
                      className={
                        task.id === selectedTask.id
                          ? "tree-task we-list-row cursor-interaction selected"
                          : "tree-task we-list-row cursor-interaction"
                      }
                      type="button"
                      onClick={() => selectTask(task)}
                    >
                      <span className="tree-task-title">{task.title}</span>
                      <RunStatusGlyph compact run={task.runs[0]} />
                    </button>
                  </div>
                </div>
              ))}

              <article className="direct-session-card">
                <strong>{directSessionFixture.title}</strong>
                <span>{directSessionFixture.accountIdentity} · {directSessionFixture.sessionState}</span>
                <p>{directSessionFixture.summary}</p>
              </article>
            </section>

            <footer className="sidebar-user-footer" aria-label="Current user">
              <span className="user-avatar" aria-hidden="true">CH</span>
              <span className="user-copy">
                <strong>Chen</strong>
                <span>Pro</span>
              </span>
              <button
                className={isSettingsView ? "selected" : undefined}
                type="button"
                aria-label="用户设置"
                onClick={openSettings}
              >
                <Settings size={16} />
              </button>
            </footer>
          </aside>
        </LeftPanel>
      }
      header={(panelControls) => (
        <header className="shell-topbar" aria-label={isSiteSkillView ? "Site skill toolbar" : "Task Thread toolbar"}>
          <div className="topbar-left-slot">
            {panelControls.left}
            <button
              className="topbar-icon-button we-toolbar-icon-button cursor-interaction"
              type="button"
              aria-label="后退"
              disabled={activeView === "task-thread" || (isSiteSkillView && !isSiteSkillDetailOpen)}
              onClick={goBackFromTopbar}
            >
              <ArrowLeft size={15} />
            </button>
            <button className="topbar-icon-button we-toolbar-icon-button cursor-interaction" type="button" aria-label="前进" disabled>
              <ArrowRight size={15} />
            </button>
          </div>
          <div className="topbar-center-surface">
            <span className="topbar-thread-symbol" aria-hidden="true">
              {isSettingsView ? (
                <Settings size={15} />
              ) : isIdentityEnvironmentsView ? (
                <UserRound size={15} />
              ) : isSiteSkillView ? (
                <Box size={15} />
              ) : (
                <FolderKanban size={15} />
              )}
            </span>
            <h2 id="thread-title">{pageTitle}</h2>
          </div>
          {isAppLevelView ? null : (
            <div className="topbar-right-slot">
              <button className="topbar-open-button" type="button" disabled title="使用右侧图标显示或隐藏上下文面板。">
                <PanelRightOpen size={15} />
                <span>打开</span>
                <ChevronDown size={14} />
              </button>
              {panelControls.rightFullscreen}
              {panelControls.right}
            </div>
          )}
        </header>
      )}
      workspace={
        isIdentityEnvironmentsView ? (
          <ThreadWorkspace>
            <IdentityEnvironmentsPage
              harborEndpoint={connectionConfig.harborEndpoint}
              runtimeSupervisorState={runtimeSupervisorState}
              onHarborStateChange={setHarborIdentityState}
              onOpenTask={openTaskById}
            />
          </ThreadWorkspace>
        ) : isSiteSkillView ? (
          <ThreadWorkspace>
            {isSiteSkillDetailOpen ? (
              <SiteSkillDetailPage
                canUseLiveRuntime={runtimeSupervisorState.canUseLiveRuntime}
                liveTaskIds={effectiveCoreReadState.liveTaskIds}
                skill={selectedSiteSkill}
                onBack={openSiteSkillDirectory}
                onOpenTask={startReadTask}
              />
            ) : (
              <SiteSkillDirectoryPage
                canUseLiveRuntime={runtimeSupervisorState.canUseLiveRuntime}
                liveTaskIds={effectiveCoreReadState.liveTaskIds}
                selectedSkillId={selectedSiteSkill.id}
                onSelectSkill={openSiteSkillDetail}
              />
            )}
          </ThreadWorkspace>
        ) : (
          <ThreadWorkspace
            composer={
              <TaskThreadComposer
                coreSubmitState={coreSubmitState}
                harborIdentityState={harborIdentityState}
                runtimeSupervisorState={runtimeSupervisorState}
                businessInput={selectedSubmitTask.businessInput}
                selectedRun={selectedRun}
                selectedTask={selectedSubmitTask}
                onBusinessInputChange={updateSelectedTaskBusinessInput}
                onSubmitCoreTask={submitSelectedCoreTask}
              />
            }
          >
            <TaskThreadPage
              coreReadState={effectiveCoreReadState}
              coreSubmitState={coreSubmitState}
              navigationItems={threadNavigationItems}
              runtimeSupervisorState={runtimeSupervisorState}
              selectedRun={selectedRun}
              selectedTask={selectedTask}
              onActiveRunChange={setSelectedRunId}
            />
          </ThreadWorkspace>
        )
      }
      right={isAppLevelView ? null : (
        <RightPanel>
          <TaskThreadRightPanel
            coreReadState={effectiveCoreReadState}
            coreSubmitState={coreSubmitState}
            runtimeSupervisorState={runtimeSupervisorState}
            selectedRun={selectedRun}
            selectedTask={selectedTask}
            shellDiagnostics={{
              colorScheme: shellContext?.colorScheme,
              configScope: shellContext?.configScope,
              platform: shellContext?.platform,
            }}
          />
        </RightPanel>
      )}
    />
  );
}
