import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CircleUserRound,
  Library,
  RefreshCw,
  Settings,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  defaultConnectionConfig,
  loadLocalConnectionConfig,
  saveLocalConnectionConfig,
  type LocalConnectionConfig,
} from "./localConnectionConfig";
import {
  type CoreReadTaskLoadState,
} from "./coreReadTaskClient";
import {
  fetchCoreThreadState,
  loadingCoreThreadState,
  retainLastKnownCoreThreads,
} from "./coreThreadClient";
import {
  coreTaskSubmitReadiness,
  initialCoreTaskSubmitState,
  promoteSubmittedCoreTask,
  submitCoreReadOnlyTask,
  type CoreTaskSubmitState,
} from "./coreTaskSubmitClient";
import { fetchHarborIdentityState } from "./harborIdentityClient";
import type { HarborIdentityLoadState } from "./harborIdentityTypes";
import { IdentityEnvironmentsPage } from "./IdentityEnvironmentsPage";
import { SettingsPage } from "./SettingsPage";
import type { TaskProjection } from "./taskThreadFixtures";
import { type ThreadNavigationItem } from "./ThreadNavigationRail";
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
import { WorkbenchSidebar, type WorkbenchView } from "./WorkbenchSidebar";
import {
  readTaskGrouping,
  readTaskSort,
  writeTaskGrouping,
  writeTaskSort,
  type TaskGrouping,
  type TaskSort,
} from "./workbenchPreferences";
import "./workbench.css";

type ShellContext = {
  platform: string;
  colorScheme: "light" | "dark";
  configScope: "local-ui-only";
};
type SubmittedTaskOverride = {
  endpoint: string;
  taskId: string;
  task: TaskProjection;
};
type WorkMode = "create" | "detail";

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

const initialHarborIdentityState: HarborIdentityLoadState = {
  status: "loading",
  fetchedAt: "pending",
  summary: "正在读取 Harbor live identity public facts。",
  identities: [],
};

function coreSubmitStateKey(taskId: string, endpoint: string) {
  return `${endpoint}::${taskId}`;
}

function applyLocalTaskContext(
  task: TaskProjection,
  businessInputOverrides: Record<string, string>,
): TaskProjection {
  const businessInput = businessInputOverrides[task.id] ?? task.businessInput;
  const searchQuery = businessInputOverrides[task.id] === undefined ? task.searchQuery : undefined;

  return {
    ...task,
    businessInput,
    searchQuery,
  };
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
    loadingCoreThreadState(defaultConnectionConfig.coreEndpoint),
  );
  const [coreSubmitStatesByKey, setCoreSubmitStatesByKey] = useState<Record<string, CoreTaskSubmitState>>({});
  const [submittedTaskOverrides, setSubmittedTaskOverrides] = useState<Record<string, SubmittedTaskOverride>>({});
  const [taskBusinessInputOverrides, setTaskBusinessInputOverrides] = useState<Record<string, string>>({});
  const [harborIdentityState, setHarborIdentityState] = useState<HarborIdentityLoadState>(initialHarborIdentityState);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [activeView, setActiveView] = useState<WorkbenchView>("work");
  const [workMode, setWorkMode] = useState<WorkMode>("create");
  const [createTaskSkill, setCreateTaskSkill] = useState<TaskProjection | null>(null);
  const [settingsReturnView, setSettingsReturnView] = useState<Exclude<WorkbenchView, "settings">>("work");
  const [taskGrouping, setTaskGrouping] = useState<TaskGrouping>(readTaskGrouping);
  const [taskSort, setTaskSort] = useState<TaskSort>(readTaskSort);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [selectedRunId, setSelectedRunId] = useState("");
  const [rightPanelOpenRequestKey, setRightPanelOpenRequestKey] = useState<number>();
  const selectedTaskIdRef = useRef(selectedTaskId);
  const coreEndpointRef = useRef(connectionConfig.coreEndpoint);
  const settingsTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    selectedTaskIdRef.current = selectedTaskId;
  }, [selectedTaskId]);

  useEffect(() => {
    coreEndpointRef.current = connectionConfig.coreEndpoint;
  }, [connectionConfig.coreEndpoint]);

  useEffect(() => writeTaskGrouping(taskGrouping), [taskGrouping]);
  useEffect(() => writeTaskSort(taskSort), [taskSort]);

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
        applyLocalTaskContext(task, taskBusinessInputOverrides),
      ),
    [effectiveCoreReadState.tasks, taskBusinessInputOverrides],
  );
  const taskThreads = useMemo(
    () =>
      projectRuntimeGatedTasks(
        effectiveCoreReadTasks.filter((task) => effectiveCoreReadState.liveTaskIds.includes(task.id)),
        runtimeSupervisorState,
        effectiveCoreReadState.liveTaskIds,
      ),
    [effectiveCoreReadState.liveTaskIds, effectiveCoreReadTasks, runtimeSupervisorState],
  );
  const workbenchTaskThreads = useMemo(
    () => taskThreads.filter((task) => task.threadContext != null),
    [taskThreads],
  );
  const selectedTask = taskThreads.find((task) => task.id === selectedTaskId) ?? taskThreads[0];
  const selectedSubmitTask = selectedTask == null
    ? undefined
    : effectiveCoreReadTasks.find((task) => task.id === selectedTask.id) ?? selectedTask;
  const selectedSubmitStateKey = selectedSubmitTask == null
    ? ""
    : coreSubmitStateKey(selectedSubmitTask.id, connectionConfig.coreEndpoint);
  const coreSubmitState = coreSubmitStatesByKey[selectedSubmitStateKey] ?? initialCoreTaskSubmitState;
  const selectedRun = selectedTask?.runs.find((run) => run.id === selectedRunId) ?? selectedTask?.runs[0];
  const isWorkView = activeView === "work";
  const isLibraryView = activeView === "library";
  const isIdentityEnvironmentsView = activeView === "browser";
  const isSettingsView = activeView === "settings";
  const hasLiveIdentity = harborIdentityState.identities.some(
    (identity) => identity.source === "Harbor live",
  );
  const pageTitle = isSettingsView
    ? "设置"
    : isIdentityEnvironmentsView
    ? "账号身份"
    : isLibraryView
    ? "站点技能"
    : workMode === "create"
    ? "创建任务"
    : selectedTask?.title ?? "任务";
  const threadNavigationItems = useMemo<ThreadNavigationItem[]>(
    () =>
      (selectedTask?.runs ?? []).map((run) => ({
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
    if (!isSettingsView) return;
    const frame = window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>("[data-settings-initial-focus]")?.focus();
    });
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || isTextEditingTarget(event.target)) return;
      event.preventDefault();
      closeSettings();
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isSettingsView, settingsReturnView]);

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
    let refreshTimer: number | undefined;
    setCoreReadState(loadingCoreThreadState(connectionConfig.coreEndpoint));

    const refreshCoreThreads = async () => {
      const next = await fetchCoreThreadState(connectionConfig.coreEndpoint);
      if (!cancelled) {
        setCoreReadState((current) => retainLastKnownCoreThreads(current, next));
        refreshTimer = window.setTimeout(refreshCoreThreads, 5000);
      }
    };
    void refreshCoreThreads();

    return () => {
      cancelled = true;
      window.clearTimeout(refreshTimer);
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

    let refreshTimer: number | undefined;
    const refreshRuntimeSupervisor = async () => {
      try {
        const state = await readSupervisor(connectionConfig);
        if (!cancelled) setRuntimeSupervisorState(state);
      } catch (error) {
        if (!cancelled) {
          setRuntimeSupervisorState(
            runtimeSupervisorUnavailableState(
              error instanceof Error ? error.message : String(error),
            ),
          );
        }
      } finally {
        if (!cancelled) {
          refreshTimer = window.setTimeout(refreshRuntimeSupervisor, 5000);
        }
      }
    };
    void refreshRuntimeSupervisor();

    return () => {
      cancelled = true;
      window.clearTimeout(refreshTimer);
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
    setActiveView("work");
    setWorkMode("detail");
    setSelectedTaskId(task.id);
    setSelectedRunId(task.runs[0]?.id ?? "");
  }

  function openTaskById(taskId: string) {
    const task = taskThreads.find((item) => item.id === taskId);
    if (task != null) {
      selectTask(task);
    }
  }

  function openView(view: Exclude<WorkbenchView, "settings">) {
    setActiveView(view);
    if (view === "work") {
      setCreateTaskSkill(null);
      setWorkMode("create");
    }
  }

  function createTask(skill?: TaskProjection) {
    setCreateTaskSkill(skill ?? null);
    setWorkMode("create");
    setActiveView("work");
  }

  function updateSelectedTaskBusinessInput(value: string) {
    if (selectedSubmitTask == null) return;
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
    if (selectedSubmitTask == null) return;
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
    if (activeView !== "settings") setSettingsReturnView(activeView);
    setActiveView("settings");
  }

  function closeSettings() {
    setActiveView(settingsReturnView);
    window.requestAnimationFrame(() => settingsTriggerRef.current?.focus());
  }

  function goBackFromTopbar() {
    if (isSettingsView) {
      closeSettings();
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

  return (
    <AppShell
      collapsePanelsOnNarrow
      initialRightOpen={false}
      rightPanelOpenRequestKey={rightPanelOpenRequestKey}
      rightPanelStateKey={isWorkView && workMode === "detail" ? selectedTask?.id : undefined}
      left={
        <LeftPanel>
          <WorkbenchSidebar
            activeView={activeView}
            grouping={taskGrouping}
            selectedTaskId={isWorkView && workMode === "detail" ? selectedTask?.id ?? null : null}
            settingsTriggerRef={settingsTriggerRef}
            sort={taskSort}
            taskLoadStatus={effectiveCoreReadState.status}
            tasks={workbenchTaskThreads}
            onCreateTask={createTask}
            onGroupingChange={setTaskGrouping}
            onOpenSettings={openSettings}
            onOpenTask={selectTask}
            onOpenView={openView}
            onSortChange={setTaskSort}
          />
        </LeftPanel>
      }
      header={(panelControls) => (
        <header className="shell-topbar production-topbar" aria-label="应用工具栏">
          <div className="topbar-left-slot">
            {panelControls.left}
            <button
              className="topbar-icon-button we-toolbar-icon-button cursor-interaction"
              type="button"
              aria-label="后退"
              disabled={!isSettingsView}
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
                <CircleUserRound size={15} />
              ) : isLibraryView ? (
                <Library size={15} />
              ) : (
                <BriefcaseBusiness size={15} />
              )}
            </span>
            <h2 id="thread-title">{pageTitle}</h2>
          </div>
          <div className="topbar-right-slot production-right-topbar">
            {isWorkView && workMode === "detail" && selectedTask != null ? (
              <>
                <span className="right-panel-topbar-title">预览</span>
                {panelControls.rightFullscreen}
                {panelControls.right}
              </>
            ) : null}
          </div>
        </header>
      )}
      workspace={
        isIdentityEnvironmentsView ? (
          <ThreadWorkspace workspaceKey="browser">
            {harborIdentityState.status === "loading" ? (
              <OwnerState title="正在读取账号身份" summary="正在同步账号、登录状态和浏览器环境。" />
            ) : hasLiveIdentity ? (
              <IdentityEnvironmentsPage
                harborEndpoint={connectionConfig.harborEndpoint}
                initialState={harborIdentityState}
                runtimeSupervisorState={runtimeSupervisorState}
                onHarborStateChange={setHarborIdentityState}
                onOpenTask={openTaskById}
              />
            ) : harborIdentityState.status === "ready" ? (
              <OwnerState
                title="暂无账号身份"
                summary="当前没有可用的账号身份。"
                onRecover={openSettings}
              />
            ) : (
              <OwnerState
                title="账号身份暂不可用"
                summary="暂时无法读取账号身份，请检查连接后重试。"
                onRecover={openSettings}
              />
            )}
          </ThreadWorkspace>
        ) : isLibraryView ? (
          <ThreadWorkspace workspaceKey="library">
            <OwnerState
              title="站点技能暂不可用"
              summary="暂时无法读取已安装的站点技能，请检查连接后重试。"
              onRecover={openSettings}
            />
          </ThreadWorkspace>
        ) : isSettingsView ? (
          <ThreadWorkspace workspaceKey="settings">
            <SettingsPage
              embedded
              colorScheme={shellContext?.colorScheme}
              configScope={shellContext?.configScope}
              connectionConfig={connectionConfig}
              platform={shellContext?.platform}
              runtimeSupervisorState={runtimeSupervisorState}
              settingsError={settingsError}
              settingsSaved={settingsSaved}
              onBack={closeSettings}
              onEndpointChange={updateEndpoint}
              onSave={saveSettings}
            />
          </ThreadWorkspace>
        ) : isWorkView && workMode === "create" ? (
          <ThreadWorkspace workspaceKey="work-create">
            <CreateTaskShell
              coreState={effectiveCoreReadState}
              selectedSkill={createTaskSkill}
              onRecover={openSettings}
            />
          </ThreadWorkspace>
        ) : selectedTask != null && selectedTask.runs.length === 0 ? (
          <ThreadWorkspace workspaceKey={`work:${selectedTask.id}`}>
            <OwnerState title="暂无任务回合" summary="该线程已创建，尚未提交业务输入。" />
          </ThreadWorkspace>
        ) : selectedTask == null || selectedRun == null || selectedSubmitTask == null ? (
          <ThreadWorkspace workspaceKey="work-empty">
            <OwnerState
              title={workEmptyStateTitle(effectiveCoreReadState.status)}
              summary={workEmptyStateSummary(effectiveCoreReadState)}
              onRecover={effectiveCoreReadState.status === "loading" ? undefined : openSettings}
            />
          </ThreadWorkspace>
        ) : (
          <ThreadWorkspace
            workspaceKey={`work:${selectedTask.id}`}
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
              onOpenPreview={() => setRightPanelOpenRequestKey((key) => (key ?? 0) + 1)}
            />
          </ThreadWorkspace>
        )
      }
      right={isWorkView && workMode === "detail" && selectedTask != null && selectedRun != null ? (
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
      ) : null}
    />
  );
}

function CreateTaskShell({
  coreState,
  selectedSkill,
  onRecover,
}: {
  coreState: CoreReadTaskLoadState;
  selectedSkill: TaskProjection | null;
  onRecover: () => void;
}) {
  return (
    <section className="create-task-shell" aria-labelledby="create-task-heading">
      <div className="create-task-intro">
        <h1 id="create-task-heading">这次要让 WebEnvoy 完成什么？</h1>
        <p>
          {selectedSkill == null
            ? "选择账号身份与站点技能后，业务输入将由技能字段定义生成。"
            : `已选择 ${selectedSkill.siteSkill}；请选择兼容账号身份后填写业务输入。`}
        </p>
      </div>
      <OwnerState
        title="任务创建暂不可用"
        summary={coreState.summary}
        onRecover={onRecover}
      />
    </section>
  );
}

function OwnerState({ title, summary, onRecover }: { title: string; summary: string; onRecover?: () => void }) {
  return (
    <section className="owner-state" role="status">
      <RefreshCw size={20} aria-hidden="true" />
      <div><h1>{title}</h1><p>{summary}</p></div>
      {onRecover ? <button type="button" onClick={onRecover}>检查连接</button> : null}
    </section>
  );
}

function isTextEditingTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable='true']") != null;
}

function workEmptyStateTitle(status: CoreReadTaskLoadState["status"]) {
  if (status === "loading") return "正在读取任务";
  return status === "ready" ? "暂无任务线程" : "任务暂不可用";
}

function workEmptyStateSummary(state: CoreReadTaskLoadState) {
  if (state.status === "loading") return state.summary;
  if (state.status === "ready") return "当前没有任务线程。";
  return "暂时无法读取任务线程，请检查连接后重试。";
}
