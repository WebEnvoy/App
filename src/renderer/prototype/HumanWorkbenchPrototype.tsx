import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CircleUserRound,
  Cloud,
  Images,
  Library,
  MessageCircle,
  Music2,
  Plus,
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
  type PrototypeResultSelection,
  type PrototypeTask,
} from "./prototypeData";
import { WorkSurface } from "./WorkSurface";

type WorkMode = "detail" | "create";
type BrowserMode = "detail" | "create" | "repair" | "live" | "edit" | "dependencies";
type LibraryMode = "catalog" | "detail";
type SettingsSection = "authorization" | "connections" | "diagnostics";

export function HumanWorkbenchPrototype() {
  const [view, setView] = useState<AppView>("work");
  const [workMode, setWorkMode] = useState<WorkMode>("detail");
  const [browserMode, setBrowserMode] = useState<BrowserMode>("detail");
  const [libraryMode, setLibraryMode] = useState<LibraryMode>("catalog");
  const [settingsSection, setSettingsSection] = useState<SettingsSection>("authorization");
  const [selectedTaskId, setSelectedTaskId] = useState(tasks[0].id);
  const [taskList, setTaskList] = useState<PrototypeTask[]>(tasks);
  const [selectedIdentityId, setSelectedIdentityId] = useState(initialIdentities[0].id);
  const [selectedSkillId, setSelectedSkillId] = useState(skills[0].id);
  const [librarySiteFilter, setLibrarySiteFilter] = useState("全部");
  const [identityList, setIdentityList] = useState<Identity[]>(initialIdentities);
  const [identityCreationSite, setIdentityCreationSite] = useState("小红书");
  const [returnToTaskCreation, setReturnToTaskCreation] = useState(false);
  const [preferredIdentityId, setPreferredIdentityId] = useState("");
  const [takeoverCompleted, setTakeoverCompleted] = useState(false);
  const [cloakProviderInstalled, setCloakProviderInstalled] = useState(false);
  const [globalPolicy, setGlobalPolicy] = useState<Exclude<AuthorizationPolicy, "inherit">>("ask");
  const [skillPolicies, setSkillPolicies] = useState<Record<string, AuthorizationPolicy>>({});
  const [selectedResult, setSelectedResult] = useState<PrototypeResultSelection | null>(null);
  const [resultPreviewRequestKey, setResultPreviewRequestKey] = useState(0);
  const selectedTask = taskList.find((task) => task.id === selectedTaskId) ?? taskList[0];
  const selectedIdentity =
    identityList.find((identity) => identity.id === selectedIdentityId) ?? identityList[0];
  const selectedSkill = skills.find((skill) => skill.id === selectedSkillId) ?? skills[0];

  const pageTitle = useMemo(() => {
    if (view === "work") {
      return workMode === "create" ? "创建任务" : selectedTask.title;
    }
    if (view === "browser") {
      if (browserMode === "create") return "创建账号身份";
      if (browserMode === "repair") return "修复浏览器 Provider";
      if (browserMode === "live") return `${selectedIdentity.name} · 浏览器`;
      if (browserMode === "edit") return `编辑 ${selectedIdentity.name}`;
      if (browserMode === "dependencies") return "环境依赖";
      return selectedIdentity.name;
    }
    if (view === "library") {
      return libraryMode === "detail" ? selectedSkill.name : "Library";
    }
    return settingsSection === "authorization" ? "全局授权" : settingsSection === "connections" ? "连接" : "诊断";
  }, [browserMode, libraryMode, selectedIdentity.name, selectedSkill.name, selectedTask.title, settingsSection, view, workMode]);

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
    setSelectedTaskId(taskId);
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
    setTaskList((current) => [task, ...current]);
    setSelectedTaskId(task.id);
    setSelectedResult(null);
    setWorkMode("detail");
    setView("work");
  }

  function openResult(result: PrototypeResultSelection) {
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
    else if (view === "library" && libraryMode === "detail") setLibraryMode("catalog");
  }

  const canGoBack =
    (view === "work" && workMode === "create") ||
    (view === "browser" && browserMode !== "detail") ||
    (view === "library" && libraryMode === "detail");

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
        <header className="shell-topbar prototype-topbar" aria-label="Prototype toolbar">
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
          </div>
          <div className="topbar-right-slot prototype-topbar-actions">
            {view === "work" && workMode === "detail" ? panelControls.right : null}
            <span className="prototype-badge">交互原型 · 样例数据</span>
            {view === "work" ? (
              <button className="prototype-button compact primary" type="button" onClick={() => createTask()}><Plus size={14} />创建任务</button>
            ) : null}
            {view === "browser" ? (
              <button className="prototype-button compact" type="button" onClick={() => { setIdentityCreationSite("小红书"); setReturnToTaskCreation(false); setBrowserMode("create"); }}><Plus size={14} />创建身份</button>
            ) : null}
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
              taskList={taskList}
              selectedSkill={selectedSkill}
              skillPolicy={skillPolicies[selectedSkill.id] ?? "inherit"}
              task={selectedTask}
              takeoverCompleted={takeoverCompleted}
              onCreateIdentity={() => {
                setIdentityCreationSite(selectedSkill.site);
                setReturnToTaskCreation(true);
                setBrowserMode("create");
                setView("browser");
              }}
              onCreateTask={submitTask}
              onOpenResult={openResult}
              onOpenBrowser={() => {
                openIdentityInstance("research");
                setSelectedIdentityId("research");
                setBrowserMode("live");
                setView("browser");
              }}
              onOpenLibrary={() => {
                setLibraryMode("catalog");
                setView("library");
              }}
              onSelectTask={openTask}
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
              taskList={taskList}
              onCreate={saveIdentity}
              onModeChange={setBrowserMode}
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
              onTakeoverCompleted={(identityId) => {
                const pausedTask = taskList.find((task) => task.identityId === identityId && task.kind === "takeover" && task.state === "waiting");
                if (pausedTask != null) setTakeoverCompleted(true);
                setTaskList((current) => current.map((task) => task.id === pausedTask?.id ? {
                  ...task,
                  state: "running",
                  stateLabel: "正在继续",
                  updatedAt: "刚刚",
                  summary: "登录状态校验成功，任务已恢复执行，正在读取收藏夹内容。",
                  runs: [{ id: "run-current", label: "本次运行", stateLabel: "正在继续", summary: "登录状态校验成功，任务已恢复执行。" }],
                  artifactState: "pending",
                } : task));
                setIdentityList((current) => current.map((identity) => identity.id === identityId ? {
                  ...identity,
                  state: "running",
                  stateLabel: "运行中",
                  loginState: "logged-in",
                  sessionState: "running",
                  controller: pausedTask == null ? "用户控制" : "任务占用",
                  currentPage: pausedTask == null ? identity.currentPage ?? `${identity.site} 当前页面` : `${identity.site} 收藏夹`,
                  lastHealthyAt: "刚刚",
                  detail: pausedTask == null ? "实例运行中 · 用户控制" : "登录已确认 · 任务正在继续",
                } : identity));
              }}
              onReturnToTask={(identityId) => {
                const pausedTask = taskList.find((task) => task.identityId === identityId && task.kind === "takeover");
                if (pausedTask == null) setBrowserMode("detail");
                else openTask(pausedTask.id);
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
                setTaskList((current) => current.map((task) => task.identityId === updated.id ? { ...task, identity: updated.name } : task));
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
          {view === "settings" ? <SettingsSurface globalPolicy={globalPolicy} section={settingsSection} onGlobalPolicyChange={setGlobalPolicy} /> : null}
        </ThreadWorkspace>
      }
      right={view === "work" && workMode === "detail" ? <RightPanel><PrototypeArtifactPanel key={`${selectedTask.id}:${resultPreviewRequestKey}`} selectedResult={selectedResult} task={selectedTask} /></RightPanel> : null}
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

function PrototypeSidebar({
  identities,
  librarySiteFilter,
  settingsSection,
  selectedIdentityId,
  selectedTaskId,
  taskList,
  view,
  onCreate,
  onOpenIdentity,
  onOpenSettingsSection,
  onOpenSite,
  onOpenTask,
  onOpenView,
}: {
  identities: Identity[];
  librarySiteFilter: string;
  settingsSection: SettingsSection;
  selectedIdentityId: string;
  selectedTaskId: string;
  taskList: PrototypeTask[];
  view: AppView;
  onCreate: () => void;
  onOpenIdentity: (identityId: string) => void;
  onOpenSettingsSection: (section: SettingsSection) => void;
  onOpenSite: (site: string) => void;
  onOpenTask: (taskId: string) => void;
  onOpenView: (view: AppView) => void;
}) {
  return (
    <aside className="sidebar prototype-sidebar" aria-label="WebEnvoy navigation">
      <nav className="global-nav" aria-label="Global navigation">
        <SidebarNav active={view === "work"} icon={<SquarePen size={16} />} label="Work" onClick={() => onOpenView("work")} />
        <SidebarNav active={view === "browser"} icon={<CircleUserRound size={16} />} label="账号身份" onClick={() => onOpenView("browser")} />
        <SidebarNav active={view === "library"} icon={<Library size={16} />} label="Library" onClick={() => onOpenView("library")} />
      </nav>

      <section className="prototype-sidebar-context codex-scrollbar">
        <div className="section-heading">
          <span>{view === "browser" ? "账号身份" : view === "library" ? "站点" : view === "settings" ? "设置" : "最近任务"}</span>
          {view !== "library" && view !== "settings" ? (
            <button type="button" aria-label="新建" title="新建" onClick={onCreate}><Plus size={15} /></button>
          ) : null}
        </div>
        {view === "work" ? <TaskTree selectedTaskId={selectedTaskId} taskList={taskList} onOpenTask={onOpenTask} /> : null}
        {view === "browser" ? identities.map((identity) => (
          <button className={`prototype-sidebar-row ${selectedIdentityId === identity.id ? "selected" : ""}`} type="button" key={identity.id} onClick={() => onOpenIdentity(identity.id)}>
            <span className="prototype-account-mark">{identity.site.slice(0, 1)}</span>
            <span><strong>{identity.name}</strong><small>{identity.stateLabel}</small></span>
          </button>
        )) : null}
        {view === "library" ? ["小红书", "微信公众号", "抖音", "淘宝", "BOSS 直聘"].map((site) => (
          <button className={`prototype-sidebar-row site-row ${librarySiteFilter === site ? "selected" : ""}`} type="button" key={site} onClick={() => onOpenSite(site)}>
            <SiteGlyph site={site} /><span><strong>{site}</strong><small>{skills.filter((skill) => skill.site === site).length} 个技能</small></span>
          </button>
        )) : null}
        {view === "settings" ? [
          { section: "authorization" as const, label: "全局授权", icon: <ShieldCheck size={14} /> },
          { section: "connections" as const, label: "连接", icon: <Cloud size={14} /> },
          { section: "diagnostics" as const, label: "诊断", icon: <Stethoscope size={14} /> },
        ].map((item) => (
          <button className={`prototype-sidebar-row site-row ${settingsSection === item.section ? "selected" : ""}`} type="button" key={item.section} onClick={() => onOpenSettingsSection(item.section)}>
            {item.icon}<span><strong>{item.label}</strong></span>
          </button>
        )) : null}
      </section>

      <footer className="sidebar-user-footer prototype-user-footer">
        <button className="prototype-user-entry" type="button" aria-label="打开设置" onClick={() => onOpenSettingsSection("authorization")}>
          <span className="user-avatar" aria-hidden="true">CH</span>
          <span className="user-copy"><strong>Chen</strong></span>
        </button>
      </footer>
    </aside>
  );
}

function TaskTree({ selectedTaskId, taskList, onOpenTask }: { selectedTaskId: string; taskList: PrototypeTask[]; onOpenTask: (taskId: string) => void }) {
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
                <span><strong>{task.identity}</strong><small>{task.title} · {task.source}</small></span>
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
