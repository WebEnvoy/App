import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CircleUserRound,
  Images,
  Languages,
  Library,
  MessageCircle,
  Music2,
  Network,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  SquarePen,
  Stethoscope,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { AppShell, LeftPanel, RightPanel, ThreadWorkspace } from "../shellPrimitives";
import { BrowserSurface } from "./BrowserSurface";
import { LibrarySurface, SettingsSurface } from "./LibrarySettingsSurfaces";
import { PrototypeArtifactPanel } from "./PrototypeArtifactPanel";
import {
  identities as initialIdentities,
  skills,
  tasks,
  type AppView,
  type AuthorizationPolicy,
  type Identity,
  type ProxyProfile,
  type PrototypeResultSelection,
  type PrototypeRun,
  type PrototypeTask,
} from "./prototypeData";
import { WorkSurface } from "./WorkSurface";

type WorkMode = "detail" | "create";
type BrowserMode = "detail" | "create" | "repair" | "edit" | "dependencies";
type LibraryMode = "catalog" | "detail" | "create";
type SettingsSection = "general" | "authorization" | "proxies" | "diagnostics";

export function HumanWorkbenchPrototype() {
  const [view, setView] = useState<AppView>("work");
  const [workMode, setWorkMode] = useState<WorkMode>("detail");
  const [browserMode, setBrowserMode] = useState<BrowserMode>("detail");
  const [libraryMode, setLibraryMode] = useState<LibraryMode>("catalog");
  const [settingsSection, setSettingsSection] = useState<SettingsSection>("general");
  const [selectedTaskId, setSelectedTaskId] = useState(tasks[0].id);
  const [selectedRunId, setSelectedRunId] = useState(tasks[0].runs?.at(-1)?.id ?? "");
  const [taskList, setTaskList] = useState<PrototypeTask[]>(tasks);
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
  const [globalPolicy, setGlobalPolicy] = useState<Exclude<AuthorizationPolicy, "inherit">>("ask");
  const [skillPolicies, setSkillPolicies] = useState<Record<string, AuthorizationPolicy>>({});
  const [selectedResult, setSelectedResult] = useState<PrototypeResultSelection | null>(null);
  const [resultPreviewRequestKey, setResultPreviewRequestKey] = useState(0);
  const [artifactTabHost, setArtifactTabHost] = useState<HTMLDivElement | null>(null);
  const selectedTask = taskList.find((task) => task.id === selectedTaskId) ?? taskList[0];
  const selectedRun = selectedTask.runs?.find((run) => run.id === selectedRunId) ?? selectedTask.runs?.at(-1) ?? fallbackRun(selectedTask);
  const selectedTaskIdentity = identityList.find((identity) => identity.id === selectedTask.identityId);
  const selectedIdentity =
    identityList.find((identity) => identity.id === selectedIdentityId) ?? identityList[0];
  const selectedSkill = skills.find((skill) => skill.id === selectedSkillId) ?? skills[0];

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
    if (settingsSection === "authorization") return "全局授权";
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

  function openTask(taskId: string) {
    const task = taskList.find((item) => item.id === taskId);
    setSelectedTaskId(taskId);
    setSelectedRunId(task?.runs?.at(-1)?.id ?? "");
    setSelectedResult(null);
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
    const run = task.runs?.[0] ?? { id: `run-${Date.now()}`, label: "本次运行", input: task.title, state: task.state, stateLabel: task.stateLabel, summary: task.summary };
    if (existingThread == null) {
      setTaskList((current) => [{ ...task, runs: [run] }, ...current]);
      setSelectedTaskId(task.id);
      setSelectedRunId(run.id);
    } else {
      const appendedRun = { ...run, id: `run-${Date.now()}`, label: `运行 ${(existingThread.runs?.length ?? 0) + 1}` };
      setTaskList((current) => current.map((item) => item.id === existingThread.id ? {
        ...item,
        state: task.state,
        stateLabel: task.stateLabel,
        updatedAt: task.updatedAt,
        summary: task.summary,
        authorization: task.authorization,
        runs: [...(item.runs ?? []), appendedRun],
        artifactSet: task.artifactSet,
        artifactState: task.artifactState,
      } : item));
      setSelectedTaskId(existingThread.id);
      setSelectedRunId(appendedRun.id);
    }
    setSelectedResult(null);
    setWorkMode("detail");
    setView("work");
  }

  function openResult(result: PrototypeResultSelection) {
    setSelectedRunId(result.runId);
    setSelectedResult(result);
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
      runs: (task.runs ?? []).map((run, index, runs) => index === runs.length - 1 ? { ...run, state: "running", stateLabel: "正在继续", summary: "登录状态校验成功，当前运行已恢复。", artifactState: "pending" } : run),
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
    if (returnToTaskCreation) {
      setReturnToTaskCreation(false);
      setPreferredIdentityId(identity.id);
      setWorkMode("create");
      setView("work");
    }
  }

  function goBack() {
    if (view === "work" && workMode === "create") setWorkMode("detail");
    else if (view === "browser" && browserMode !== "detail") setBrowserMode("detail");
    else if (view === "library" && libraryMode !== "catalog") setLibraryMode("catalog");
  }

  const canGoBack =
    (view === "work" && workMode === "create") ||
    (view === "browser" && browserMode !== "detail") ||
    (view === "library" && libraryMode !== "catalog");

  return (
    <AppShell
      rightPanelOpenRequestKey={resultPreviewRequestKey}
      left={
        <LeftPanel>
          <PrototypeSidebar
            identities={identityList}
            librarySiteFilter={librarySiteFilter}
            settingsSection={settingsSection}
            selectedIdentityId={selectedIdentity.id}
            selectedTaskId={selectedTask.id}
            taskList={taskList}
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
            onOpenSettingsSection={(section) => {
              setSettingsSection(section);
              setView("settings");
            }}
            onOpenView={openView}
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
              {view === "browser" ? <button className="prototype-button compact" type="button" onClick={() => { setIdentityCreationSite("小红书"); setReturnToTaskCreation(false); setBrowserMode("create"); }}><Plus size={14} />创建身份</button> : null}
            </div>
          </div>
          <div className="topbar-right-slot prototype-right-topbar">
            {view === "work" && workMode === "detail" ? <><div className="prototype-right-tab-host" ref={setArtifactTabHost} />{panelControls.rightFullscreen}{panelControls.right}</> : null}
          </div>
        </header>
      )}
      workspace={
        <ThreadWorkspace>
          {view === "work" ? (
            <WorkSurface
              globalPolicy={globalPolicy}
              identities={identityList}
              mode={workMode}
              preferredIdentityId={preferredIdentityId}
              selectedSkill={selectedSkill}
              skillPolicy={skillPolicies[selectedSkill.id] ?? "inherit"}
              selectedRunId={selectedRun.id}
              task={selectedTask}
              onCreateIdentity={() => {
                setIdentityCreationSite(selectedSkill.site);
                setReturnToTaskCreation(true);
                setBrowserMode("create");
                setView("browser");
              }}
              onCreateTask={submitTask}
              onOpenResult={openResult}
              onOpenBrowser={() => {
                openIdentityInstance(selectedTask.identityId);
              }}
              onOpenLibrary={() => {
                setLibraryMode("catalog");
                setView("library");
              }}
              onSelectRun={(runId) => {
                setSelectedRunId(runId);
                setSelectedResult(null);
                setResultPreviewRequestKey((current) => current + 1);
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
                setSettingsSection("proxies");
                setView("settings");
              }}
              onOpenInstance={openIdentityInstance}
              onProviderRepaired={() => {
                setCloakProviderInstalled(true);
                setIdentityList((current) => current.map((identity) => identity.provider === "CloakBrowser" && identity.state === "repair" ? {
                  ...identity,
                  state: identity.loginState === "logged-in" ? "available" : "login",
                  stateLabel: identity.loginState === "logged-in" ? "可用" : "需要登录",
                  detail: identity.loginState === "logged-in" ? "空闲 · Provider 刚刚完成验证" : "Provider 已验证 · 等待登录确认",
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
                const compatibleSkill = skills.find((skill) => skill.site === selectedIdentity.site && skill.availability === "available");
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
      right={view === "work" && workMode === "detail" ? <RightPanel><PrototypeArtifactPanel key={selectedTask.id} requestKey={resultPreviewRequestKey} run={selectedRun} selectedResult={selectedResult} tabHost={artifactTabHost} task={selectedTask} /></RightPanel> : null}
    />
  );
}

function defaultIdentityPage(site: string) {
  if (site === "小红书") return "小红书发现页";
  if (site === "微信公众号") return "微信公众号首页";
  if (site === "抖音") return "抖音首页";
  if (site === "淘宝") return "淘宝首页";
  return `${site} 首页`;
}

function fallbackRun(task: PrototypeTask): PrototypeRun {
  return { id: "run-current", label: "本次运行", input: task.title, state: task.state, stateLabel: task.stateLabel, summary: task.summary, artifactSet: task.artifactSet, artifactState: task.artifactState, artifactTotal: task.artifactTotal, artifactCurrent: task.artifactCurrent };
}

function PrototypeSidebar({
  identities,
  librarySiteFilter,
  settingsSection,
  selectedIdentityId,
  selectedTaskId,
  taskList,
  view,
  onCreate,
  onCreateSkill,
  onOpenIdentity,
  onOpenSettingsSection,
  onOpenSite,
  onOpenTask,
  onOpenView,
  onSearchSkills,
}: {
  identities: Identity[];
  librarySiteFilter: string;
  settingsSection: SettingsSection;
  selectedIdentityId: string;
  selectedTaskId: string;
  taskList: PrototypeTask[];
  view: AppView;
  onCreate: () => void;
  onCreateSkill: () => void;
  onOpenIdentity: (identityId: string) => void;
  onOpenSettingsSection: (section: SettingsSection) => void;
  onOpenSite: (site: string) => void;
  onOpenTask: (taskId: string) => void;
  onOpenView: (view: AppView) => void;
  onSearchSkills: () => void;
}) {
  return (
    <aside className="sidebar prototype-sidebar" aria-label="WebEnvoy navigation">
      <nav className="global-nav" aria-label="全局导航">
        <SidebarNav active={view === "work"} icon={<SquarePen size={16} />} label="任务" onClick={() => onOpenView("work")} />
        <SidebarNav active={view === "browser"} icon={<CircleUserRound size={16} />} label="账号身份" onClick={() => onOpenView("browser")} />
        <SidebarNav active={view === "library"} icon={<Library size={16} />} label="站点技能" onClick={() => onOpenView("library")} />
      </nav>

      <section className="prototype-sidebar-context codex-scrollbar">
        <div className="section-heading">
          <span>{view === "browser" ? "账号身份" : view === "library" ? "站点技能" : view === "settings" ? "设置" : "任务线程"}</span>
          {view === "library" ? <span className="section-heading-actions"><button type="button" aria-label="搜索全部站点技能" title="搜索" onClick={onSearchSkills}><Search size={14} /></button><button type="button" aria-label="新增站点技能" title="新增" onClick={onCreateSkill}><Plus size={14} /></button></span> : null}
          {view !== "library" && view !== "settings" ? (
            <button type="button" aria-label="新建" title="新建" onClick={onCreate}><Plus size={15} /></button>
          ) : null}
        </div>
        {view === "work" ? <TaskTree identities={identities} selectedTaskId={selectedTaskId} taskList={taskList} onOpenTask={onOpenTask} /> : null}
        {view === "browser" ? identities.map((identity) => (
          <button className={`prototype-sidebar-row ${selectedIdentityId === identity.id ? "selected" : ""}`} type="button" key={identity.id} onClick={() => onOpenIdentity(identity.id)}>
            <span className="prototype-account-mark">{identity.accountAvatar ?? identity.account.slice(0, 1)}</span>
            <span><strong>{identity.account}</strong><small>{identity.name} · {identity.stateLabel}</small></span>
          </button>
        )) : null}
        {view === "library" ? <button className={`prototype-sidebar-row site-row discovery-row ${librarySiteFilter === "全部" ? "selected" : ""}`} type="button" onClick={() => onOpenSite("全部")}><Search size={14} /><span><strong>发现全部</strong><small>所有站点与技能</small></span></button> : null}
        {view === "library" ? ["小红书", "微信公众号", "抖音", "淘宝", "BOSS 直聘"].map((site) => (
          <button className={`prototype-sidebar-row site-row ${librarySiteFilter === site ? "selected" : ""}`} type="button" key={site} onClick={() => onOpenSite(site)}>
            <SiteGlyph site={site} /><span><strong>{site}</strong><small>{skills.filter((skill) => skill.site === site).length} 个技能</small></span>
          </button>
        )) : null}
        {view === "settings" ? [
          { section: "general" as const, label: "通用", icon: <Languages size={14} /> },
          { section: "authorization" as const, label: "全局授权", icon: <ShieldCheck size={14} /> },
          { section: "proxies" as const, label: "代理", icon: <Network size={14} /> },
          { section: "diagnostics" as const, label: "诊断", icon: <Stethoscope size={14} /> },
        ].map((item) => (
          <button className={`prototype-sidebar-row site-row ${settingsSection === item.section ? "selected" : ""}`} type="button" aria-label={item.label} key={item.section} onClick={() => onOpenSettingsSection(item.section)}>
            {item.icon}<span><strong>{item.label}</strong></span>
          </button>
        )) : null}
      </section>

      <footer className="sidebar-user-footer prototype-user-footer">
        <button className="prototype-user-entry" type="button" aria-label="打开设置" onClick={() => onOpenSettingsSection("general")}>
          <span className="user-avatar" aria-hidden="true">CH</span>
          <span className="user-copy"><strong>Chen</strong></span>
        </button>
      </footer>
    </aside>
  );
}

function TaskTree({ identities, selectedTaskId, taskList, onOpenTask }: { identities: Identity[]; selectedTaskId: string; taskList: PrototypeTask[]; onOpenTask: (taskId: string) => void }) {
  const sites = Array.from(new Set(taskList.map((task) => task.site)));
  return sites.map((site) => {
    const siteTasks = taskList.filter((task) => task.site === site);
    const siteSkills = Array.from(new Set(siteTasks.map((task) => task.skill)));
    return (
      <div className="prototype-task-tree-site" key={site}>
        <div className="prototype-task-tree-label"><SiteGlyph site={site} /><strong>{site}</strong></div>
        {siteSkills.map((skill) => (
          <div className="prototype-task-tree-skill" key={skill}>
            <span>{skill}</span>
            {siteTasks.filter((task) => task.skill === skill).map((task) => (
              <button className={`prototype-sidebar-row task-tree-leaf ${selectedTaskId === task.id ? "selected" : ""}`} type="button" key={task.id} onClick={() => onOpenTask(task.id)}>
                <span className={`prototype-status-dot ${task.state}`} />
                <span><strong>{identities.find((identity) => identity.id === task.identityId)?.account ?? task.identity}</strong><small>{task.runs?.at(-1)?.input ?? task.title} · {task.source}</small></span>
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  });
}

function SiteGlyph({ site }: { site: string }) {
  if (site === "小红书") return <Images size={14} />;
  if (site === "微信公众号") return <MessageCircle size={14} />;
  if (site === "抖音") return <Music2 size={14} />;
  if (site === "淘宝") return <ShoppingBag size={14} />;
  return <BriefcaseBusiness size={14} />;
}

function SidebarNav({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return <button className={`nav-item ${active ? "nav-item-active" : ""}`} type="button" onClick={onClick}>{icon}{label}</button>;
}
