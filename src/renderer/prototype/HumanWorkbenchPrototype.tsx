import {
  ArrowLeft,
  ArrowRight,
  CircleUserRound,
  Library,
  Plus,
  Settings,
  SquarePen,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppShell, LeftPanel, RightPanel, ThreadWorkspace } from "../shellPrimitives";
import { BrowserSurface } from "./BrowserSurface";
import { LibrarySurface, SettingsSurface } from "./LibrarySettingsSurfaces";
import {
  PrototypeSidebar,
  type TaskGrouping,
  type TaskSort,
} from "./PrototypeSidebar";
import { PrototypeArtifactPanel } from "./PrototypeArtifactPanel";
import {
  actionCategories,
  actionCategoryForTask,
  defaultExecutionPolicy,
  identities as initialIdentities,
  identityCanUseSkill,
  recommendedExecutionPolicy,
  skills,
  tasks,
  type AppView,
  type ExecutionPolicy,
  type Identity,
  type ProxyProfile,
  type PrototypePreviewSelection,
  type PrototypeRun,
  type PrototypeTask,
} from "./prototypeData";
import { PrototypeTaskThreadComposer, WorkSurface } from "./WorkSurface";

type WorkMode = "detail" | "create";
type BrowserMode = "detail" | "create" | "repair" | "edit" | "dependencies";
type LibraryMode = "catalog" | "detail" | "create";
type SettingsSection = "general" | "authorization" | "proxies" | "diagnostics";

const TASK_GROUPING_KEY = "webenvoy.prototype.task-grouping";
const TASK_SORT_KEY = "webenvoy.prototype.task-sort";

export function HumanWorkbenchPrototype() {
  const [view, setView] = useState<AppView>("work");
  const [workMode, setWorkMode] = useState<WorkMode>("detail");
  const [browserMode, setBrowserMode] = useState<BrowserMode>("detail");
  const [libraryMode, setLibraryMode] = useState<LibraryMode>("catalog");
  const [settingsSection, setSettingsSection] = useState<SettingsSection>("general");
  const [settingsReturnView, setSettingsReturnView] = useState<Exclude<AppView, "settings">>("work");
  const [selectedTaskId, setSelectedTaskId] = useState(tasks[0].id);
  const [taskList, setTaskList] = useState<PrototypeTask[]>(tasks);
  const [taskGrouping, setTaskGrouping] = useState<TaskGrouping>(readTaskGrouping);
  const [taskSort, setTaskSort] = useState<TaskSort>(readTaskSort);
  const [selectedIdentityId, setSelectedIdentityId] = useState(initialIdentities[0].id);
  const [selectedSkillId, setSelectedSkillId] = useState(skills[0].id);
  const [librarySiteFilter, setLibrarySiteFilter] = useState("全部");
  const [identityList, setIdentityList] = useState<Identity[]>(initialIdentities);
  const [proxyList, setProxyList] = useState<ProxyProfile[]>([
    { id: "team", name: "团队推荐线路", address: "proxy-cn.example:1080", latency: "上海 · 42 ms", state: "可用" },
    { id: "jp", name: "日本采集线路", address: "proxy-jp.example:1080", latency: "东京 · 86 ms", state: "可用" },
  ]);
  const [identityCreationSite, setIdentityCreationSite] = useState("小红书");
  const [returnToTaskCreation, setReturnToTaskCreation] = useState(false);
  const [preferredIdentityId, setPreferredIdentityId] = useState("");
  const [cloakProviderInstalled, setCloakProviderInstalled] = useState(false);
  const [globalPolicy, setGlobalPolicy] = useState<ExecutionPolicy>({ ...defaultExecutionPolicy });
  const [skillPolicies, setSkillPolicies] = useState<Record<string, ExecutionPolicy>>(() => Object.fromEntries(skills.filter((skill) => skill.availability === "available").map((skill) => [skill.id, recommendedExecutionPolicy(skill)])));
  const [threadExecutionModes, setThreadExecutionModes] = useState<Record<string, Partial<ExecutionPolicy>>>({});
  const [previewSelection, setPreviewSelection] = useState<PrototypePreviewSelection | null>(null);
  const [resultPreviewRequestKey, setResultPreviewRequestKey] = useState(0);
  const [artifactTabHost, setArtifactTabHost] = useState<HTMLDivElement | null>(null);
  const selectedTask = taskList.find((task) => task.id === selectedTaskId) ?? taskList[0];
  const previewRun = previewSelection == null ? null : selectedTask.runs?.find((run) => run.id === previewSelection.runId) ?? null;
  const selectedTaskIdentity = identityList.find((identity) => identity.id === selectedTask.identityId);
  const selectedIdentity =
    identityList.find((identity) => identity.id === selectedIdentityId) ?? identityList[0];
  const selectedSkill = skills.find((skill) => skill.id === selectedSkillId) ?? skills[0];
  const selectedTaskSkill = skills.find((skill) => skill.name === selectedTask.skill && skill.site === selectedTask.site);
  const selectedTaskCategory = actionCategoryForTask(selectedTask.kind);
  const selectedTaskActionDeclared = selectedTaskSkill?.actionCategories.includes(selectedTaskCategory) ?? false;
  const selectedTaskSkillPolicy = selectedTaskSkill == null ? undefined : skillPolicies[selectedTaskSkill.id];
  const selectedTaskThreadPolicy = threadExecutionModes[selectedTask.id];
  const selectedTaskExecutionModes = Object.fromEntries(actionCategories.map((category) => [category, selectedTaskActionDeclared ? selectedTaskThreadPolicy?.[category] ?? selectedTaskSkillPolicy?.[category] ?? globalPolicy[category] : "block"])) as ExecutionPolicy;
  const selectedTaskExecutionSources = Object.fromEntries(actionCategories.map((category) => [category, selectedTaskActionDeclared ? selectedTaskThreadPolicy?.[category] != null ? "当前线程" : selectedTaskSkillPolicy != null ? "我的技能默认" : "全局默认" : "技能声明不匹配"])) as Record<(typeof actionCategories)[number], string>;
  const selectedTaskExecutionMode = selectedTaskExecutionModes[selectedTaskCategory];
  const selectedTaskExecutionSource = selectedTaskExecutionSources[selectedTaskCategory];

  useEffect(() => {
    try {
      window.localStorage.setItem(TASK_GROUPING_KEY, taskGrouping);
    } catch {
      // A display preference must not block the prototype.
    }
  }, [taskGrouping]);

  useEffect(() => {
    try {
      window.localStorage.setItem(TASK_SORT_KEY, taskSort);
    } catch {
      // A display preference must not block the prototype.
    }
  }, [taskSort]);

  const pageTitle = useMemo(() => {
    if (view === "work") {
      return workMode === "create" ? "创建任务" : `${selectedTask.skill} · ${selectedTaskIdentity?.account ?? selectedTask.identity}`;
    }
    if (view === "browser") {
      if (browserMode === "create") return "创建账号身份";
      if (browserMode === "repair") return "修复浏览器 Provider";
      if (browserMode === "edit") return `编辑 ${selectedIdentity.name}`;
      if (browserMode === "dependencies") return "环境依赖";
      return selectedIdentity.account;
    }
    if (view === "library") {
      if (libraryMode === "detail") return selectedSkill.name;
      if (libraryMode === "create") return "新增站点技能";
      return librarySiteFilter === "全部" ? "发现站点技能" : librarySiteFilter;
    }
    if (settingsSection === "general") return "通用";
    if (settingsSection === "authorization") return "执行方式";
    if (settingsSection === "proxies") return "代理管理";
    return "诊断";
  }, [browserMode, libraryMode, librarySiteFilter, selectedIdentity.account, selectedIdentity.name, selectedSkill.name, selectedTask.identity, selectedTask.skill, selectedTaskIdentity?.account, settingsSection, view, workMode]);

  function openView(nextView: AppView) {
    setView(nextView);
    if (nextView === "work") setWorkMode("detail");
    if (nextView === "browser") setBrowserMode("detail");
    if (nextView === "library") {
      setLibraryMode("catalog");
      setLibrarySiteFilter("全部");
    }
  }

  function openSettings(section: SettingsSection) {
    setSettingsSection(section);
    if (view !== "settings") setSettingsReturnView(view);
    setView("settings");
  }

  function openTask(taskId: string) {
    setSelectedTaskId(taskId);
    setPreviewSelection(null);
    setWorkMode("detail");
    setView("work");
  }

  function createTask(skillId?: string, identityId?: string) {
    if (skillId != null) setSelectedSkillId(skillId);
    setPreferredIdentityId(identityId ?? "");
    setWorkMode("create");
    setView("work");
  }

  function submitTask(task: PrototypeTask) {
    const existingThread = taskList.find((item) => item.site === task.site && item.skill === task.skill && item.identityId === task.identityId);
    const run = task.runs?.[0] ?? { id: `run-${Date.now()}`, label: "本回合", input: task.title, state: task.state, stateLabel: task.stateLabel, summary: task.summary };
    if (existingThread == null) {
      setTaskList((current) => [{ ...task, runs: [run] }, ...current]);
      setSelectedTaskId(task.id);
    } else {
      const appendedRun = { ...run, id: `run-${Date.now()}`, label: `回合 ${(existingThread.runs?.length ?? 0) + 1}` };
      setTaskList((current) => current.map((item) => item.id === existingThread.id ? {
        ...item,
        state: task.state,
        stateLabel: task.stateLabel,
        updatedAt: task.updatedAt,
        summary: task.summary,
        runs: [...(item.runs ?? []), appendedRun],
        artifactSet: task.artifactSet,
        artifactState: task.artifactState,
      } : item));
      setSelectedTaskId(existingThread.id);
    }
    setPreviewSelection(null);
    setWorkMode("detail");
    setView("work");
  }

  function submitTaskTurn(input: string, quantity?: number, attachments?: string[], executionSource?: string) {
    const runId = `run-${Date.now()}`;
    const run: PrototypeRun = {
      id: runId,
      label: selectedTask.skill,
      input,
      state: "running",
      stateLabel: "正在运行",
      summary: `正在执行“${selectedTask.skill}”。`,
      attachments,
      artifactSet: selectedTask.artifactSet,
      artifactState: "pending",
      artifactTotal: quantity,
      executionMode: selectedTaskExecutionMode,
      executionSource: executionSource ?? selectedTaskExecutionSource,
    };
    setTaskList((current) => current.map((task) => task.id === selectedTask.id ? {
      ...task,
      state: "running",
      stateLabel: "正在运行",
      updatedAt: "刚刚",
      summary: `已提交“${input}”，结果会在当前线程持续更新。`,
      runs: [...(task.runs ?? []), run],
      artifactState: "pending",
      artifactTotal: quantity ?? task.artifactTotal,
    } : task));
    setPreviewSelection(null);
    window.setTimeout(() => document.querySelector(`[data-content-search-unit-key="${selectedTask.id}-${runId}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function stopTaskTurn() {
    setTaskList((current) => current.map((task) => task.id === selectedTask.id ? {
      ...task,
      state: "failed",
      stateLabel: "已停止",
      updatedAt: "刚刚",
      summary: "当前回合已由用户停止。",
      runs: (task.runs ?? []).map((run, index, runs) => index === runs.length - 1 && run.state === "running" ? { ...run, state: "failed", stateLabel: "已停止", summary: "当前回合已由用户停止。", artifactState: "none" } : run),
      artifactState: "none",
    } : task));
  }

  function openPreview(selection: PrototypePreviewSelection) {
    setPreviewSelection(selection);
    setResultPreviewRequestKey((current) => current + 1);
  }

  function openIdentityInstance(identityId: string) {
    setIdentityList((current) => current.map((identity) => {
      if (identity.id !== identityId || identity.sessionState === "running") return identity;
      return {
        ...identity,
        state: "running",
        stateLabel: "运行中",
        sessionState: "running",
        controller: "用户控制",
        currentPage: identity.currentPage ?? defaultIdentityPage(identity.site),
        lastHealthyAt: "刚刚",
        detail: "实例运行中 · 用户控制",
      };
    }));
  }

  function completeTakeover(taskId: string, identityId: string) {
    const pausedTask = taskList.find((task) => task.id === taskId && task.identityId === identityId && task.kind === "takeover" && task.state === "waiting");
    if (pausedTask == null) return;
    setTaskList((current) => current.map((task) => task.id === pausedTask.id ? {
      ...task,
      state: "running",
      stateLabel: "正在继续",
      updatedAt: "刚刚",
      summary: "登录状态校验成功，任务已恢复执行。",
      runs: (task.runs ?? []).map((run, index, runs) => index === runs.length - 1 ? { ...run, state: "running", stateLabel: "正在继续", summary: "登录状态校验成功，当前回合已恢复。", artifactState: "pending" } : run),
      artifactState: "pending",
    } : task));
    setIdentityList((current) => current.map((identity) => identity.id === identityId ? {
      ...identity,
      state: "running",
      stateLabel: "运行中",
      loginState: "logged-in",
      sessionState: "running",
      controller: "任务占用",
      currentPage: `${identity.site} 收藏夹`,
      lastHealthyAt: "刚刚",
      detail: "登录已确认 · 任务正在继续",
    } : identity));
  }

  function openIdentity(identityId: string) {
    setSelectedIdentityId(identityId);
    setBrowserMode("detail");
    setView("browser");
  }

  function openSkill(skillId: string) {
    setSelectedSkillId(skillId);
    setLibraryMode("detail");
    setView("library");
  }

  function saveIdentity(identity: Identity) {
    setIdentityList((current) => [identity, ...current]);
    setSelectedIdentityId(identity.id);
    setBrowserMode("detail");
    if (returnToTaskCreation && identity.loginState !== "login-required") {
      setReturnToTaskCreation(false);
      setPreferredIdentityId(identity.id);
      setWorkMode("create");
      setView("work");
    } else if (returnToTaskCreation) {
      setReturnToTaskCreation(false);
    }
  }

  function goBack() {
    if (view === "work" && workMode === "create") setWorkMode("detail");
    else if (view === "browser" && browserMode !== "detail") setBrowserMode("detail");
    else if (view === "library" && libraryMode !== "catalog") setLibraryMode("catalog");
    else if (view === "settings") setView(settingsReturnView);
  }

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape" || view !== "settings" || isTextEditingTarget(event.target)) return;
      event.preventDefault();
      setView(settingsReturnView);
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [settingsReturnView, view]);

  const canGoBack =
    (view === "work" && workMode === "create") ||
    (view === "browser" && browserMode !== "detail") ||
    (view === "library" && libraryMode !== "catalog") ||
    view === "settings";

  return (
    <AppShell
      collapsePanelsOnNarrow
      initialRightOpen={false}
      rightPanelOpenRequestKey={resultPreviewRequestKey || undefined}
      left={
        <LeftPanel>
          <PrototypeSidebar
            identities={identityList}
            librarySiteFilter={librarySiteFilter}
            settingsSection={settingsSection}
            selectedIdentityId={selectedIdentity.id}
            selectedTaskId={selectedTask.id}
            taskList={taskList}
            taskGrouping={taskGrouping}
            taskSort={taskSort}
            view={view}
            onCreate={() => {
              if (view === "browser") {
                setIdentityCreationSite("小红书");
                setReturnToTaskCreation(false);
                setBrowserMode("create");
              }
              else createTask();
            }}
            onOpenIdentity={openIdentity}
            onOpenSite={(site) => {
              setLibrarySiteFilter(site);
              setLibraryMode("catalog");
              setView("library");
            }}
            onCreateSkill={() => {
              setLibraryMode("create");
              setView("library");
            }}
            onSearchSkills={() => {
              setLibrarySiteFilter("全部");
              setLibraryMode("catalog");
              setView("library");
            }}
            onOpenTask={openTask}
            onOpenSettingsSection={openSettings}
            onOpenView={openView}
            onTaskGroupingChange={setTaskGrouping}
            onTaskSortChange={setTaskSort}
          />
        </LeftPanel>
      }
      header={(panelControls) => (
        <header className="shell-topbar prototype-topbar" aria-label="应用工具栏">
          <div className="topbar-left-slot">
            {panelControls.left}
            <button className="topbar-icon-button" type="button" aria-label="后退" disabled={!canGoBack} onClick={goBack}>
              <ArrowLeft size={15} />
            </button>
            <button className="topbar-icon-button" type="button" aria-label="前进" disabled>
              <ArrowRight size={15} />
            </button>
          </div>
          <div className="topbar-center-surface">
            <span className="topbar-thread-symbol" aria-hidden="true">
              {view === "work" ? <SquarePen size={15} /> : view === "browser" ? <CircleUserRound size={15} /> : view === "library" ? <Library size={15} /> : <Settings size={15} />}
            </span>
            <h2>{pageTitle}</h2>
            <div className="prototype-center-actions">
              {view === "work" ? <button className="prototype-button compact primary" type="button" onClick={() => createTask()}><Plus size={14} />创建任务</button> : null}
              {view === "browser" && browserMode !== "create" ? <button className="prototype-button compact" type="button" onClick={() => { setIdentityCreationSite("小红书"); setReturnToTaskCreation(false); setBrowserMode("create"); }}><Plus size={14} />创建身份</button> : null}
            </div>
          </div>
          <div className="topbar-right-slot prototype-right-topbar">
            {view === "work" && workMode === "detail" ? <><div className="prototype-right-tab-host" ref={setArtifactTabHost} />{panelControls.rightFullscreen}{panelControls.right}</> : null}
          </div>
        </header>
      )}
      workspace={
        <ThreadWorkspace composer={view === "work" && workMode === "detail" ? <PrototypeTaskThreadComposer actionCategories={selectedTaskActionDeclared ? selectedTaskSkill!.actionCategories : []} actionCategory={selectedTaskCategory} executionLocked={!selectedTaskActionDeclared} executionModes={selectedTaskExecutionModes} executionSources={selectedTaskExecutionSources} identityLabel={selectedTaskIdentity?.account ?? selectedTask.identity} task={selectedTask} onExecutionModeChange={(category, mode) => setThreadExecutionModes((current) => ({ ...current, [selectedTask.id]: { ...current[selectedTask.id], [category]: mode } }))} onSaveAsSkillDefaults={() => {
          if (selectedTaskSkill == null) return;
          setSkillPolicies((current) => ({ ...current, [selectedTaskSkill.id]: { ...(current[selectedTaskSkill.id] ?? globalPolicy), ...selectedTaskThreadPolicy } }));
          setThreadExecutionModes((current) => { const next = { ...current }; delete next[selectedTask.id]; return next; });
        }} onStop={stopTaskTurn} onSubmit={submitTaskTurn} /> : undefined}>
          {view === "work" ? (
            <WorkSurface
              globalPolicy={globalPolicy}
              identities={identityList}
              mode={workMode}
              preferredIdentityId={preferredIdentityId}
              selectedSkill={selectedSkill}
              skillPolicy={skillPolicies[selectedSkill.id]}
              task={selectedTask}
              tasks={taskList}
              threadExecutionModes={threadExecutionModes}
              onCreateIdentity={() => {
                setIdentityCreationSite(selectedSkill.site);
                setReturnToTaskCreation(true);
                setBrowserMode("create");
                setView("browser");
              }}
              onCreateTask={submitTask}
              onOpenPreview={openPreview}
              onOpenBrowser={() => {
                openIdentityInstance(selectedTask.identityId);
              }}
              onOpenLibrary={() => {
                setLibraryMode("catalog");
                setView("library");
              }}
              onTakeoverCompleted={() => completeTakeover(selectedTask.id, selectedTask.identityId)}
              onSelectSkill={setSelectedSkillId}
            />
          ) : null}
          {view === "browser" ? (
            <BrowserSurface
              cloakProviderInstalled={cloakProviderInstalled}
              identity={selectedIdentity}
              identities={identityList}
              initialIdentitySite={identityCreationSite}
              mode={browserMode}
              proxies={proxyList}
              onCreate={saveIdentity}
              onModeChange={setBrowserMode}
              onManageProxies={() => {
                openSettings("proxies");
              }}
              onOpenInstance={openIdentityInstance}
              onProviderRepaired={() => {
                setCloakProviderInstalled(true);
                setIdentityList((current) => current.map((identity) => identity.provider === "CloakBrowser" && identity.state === "repair" ? {
                  ...identity,
                  state: identity.loginState === "logged-in" || identity.loginState === "not-required" ? "available" : "login",
                  stateLabel: identity.loginState === "logged-in" || identity.loginState === "not-required" ? "可用" : "需要登录",
                  detail: identity.loginState === "logged-in" || identity.loginState === "not-required" ? "空闲 · Provider 刚刚完成验证" : "Provider 已验证 · 等待登录确认",
                  sessionState: "idle",
                  controller: "空闲",
                  lastHealthyAt: "尚未启动",
                } : identity));
              }}
              onDeleteIdentity={(identityId) => {
                const remaining = identityList.filter((identity) => identity.id !== identityId);
                if (remaining.length === 0) return;
                setIdentityList(remaining);
                setSelectedIdentityId(remaining[0]?.id ?? "");
                setBrowserMode("detail");
              }}
              onUpdateIdentity={(updated) => {
                setIdentityList((current) => current.map((identity) => identity.id === updated.id ? updated : identity));
                setBrowserMode("detail");
              }}
              onUseSkill={() => {
                const compatibleSkill = skills.find((skill) => skill.availability === "available" && identityCanUseSkill(selectedIdentity, skill));
                if (compatibleSkill != null) createTask(compatibleSkill.id, selectedIdentity.id);
              }}
            />
          ) : null}
          {view === "library" ? (
            <LibrarySurface
              mode={libraryMode}
              siteFilter={librarySiteFilter}
              selectedSkill={selectedSkill}
              skillPolicies={skillPolicies}
              onModeChange={setLibraryMode}
              onSelectSkill={setSelectedSkillId}
              onSkillPolicyChange={(skillId, policy) => setSkillPolicies((current) => ({ ...current, [skillId]: policy }))}
              onUse={createTask}
            />
          ) : null}
          {view === "settings" ? <SettingsSurface globalPolicy={globalPolicy} proxies={proxyList} section={settingsSection} onGlobalPolicyChange={setGlobalPolicy} onProxiesChange={setProxyList} /> : null}
        </ThreadWorkspace>
      }
      right={view === "work" && workMode === "detail" ? <RightPanel><PrototypeArtifactPanel key={selectedTask.id} requestKey={resultPreviewRequestKey} run={previewRun} selection={previewSelection} tabHost={artifactTabHost} task={selectedTask} /></RightPanel> : null}
    />
  );
}

function isTextEditingTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable='true']") != null;
}

function defaultIdentityPage(site: string) {
  if (site === "小红书") return "小红书发现页";
  if (site === "微信公众号") return "微信公众号首页";
  if (site === "抖音") return "抖音首页";
  if (site === "淘宝") return "淘宝首页";
  return `${site} 首页`;
}

function readTaskGrouping(): TaskGrouping {
  try {
    return window.localStorage.getItem(TASK_GROUPING_KEY) === "identity" ? "identity" : "skill";
  } catch {
    return "skill";
  }
}

function readTaskSort(): TaskSort {
  try {
    return window.localStorage.getItem(TASK_SORT_KEY) === "priority" ? "priority" : "recent";
  } catch {
    return "recent";
  }
}
