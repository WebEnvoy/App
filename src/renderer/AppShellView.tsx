import { ArrowLeft, ArrowRight, BriefcaseBusiness, CircleUserRound, Library, Settings } from "lucide-react";
import type { ReactNode } from "react";

import { CreateTaskShell } from "./CreateTaskShell";
import { IdentityEnvironmentsPage } from "./IdentityEnvironmentsPage";
import { OwnerState } from "./OwnerState";
import { SettingsPage } from "./SettingsPage";
import { AppShell, LeftPanel, RightPanel, ThreadWorkspace } from "./shellPrimitives";
import { SiteSkillLibrary } from "./SiteSkillPages";
import { TaskThreadComposer } from "./TaskThreadComposer";
import { TaskThreadPage } from "./TaskThreadPage";
import { TaskThreadRightPanel } from "./TaskThreadRightPanel";
import { findCatalogSkillForTask, type AppController } from "./useAppController";
import { WorkbenchSidebar } from "./WorkbenchSidebar";

export function AppShellView({ controller }: { controller: AppController }) {
  const workDetail = controller.navigation.activeView === "work" && controller.navigation.workMode === "detail";
  return (
    <AppShell
      collapsePanelsOnNarrow
      initialRightOpen={false}
      rightPanelOpenRequestKey={controller.tasks.rightPanelOpenRequestKey}
      rightPanelStateKey={workDetail ? controller.tasks.selectedTask?.id : undefined}
      left={<AppSidebar controller={controller} />}
      header={(panelControls) => <AppHeader controller={controller} panelControls={panelControls} />}
      workspace={<AppWorkspace controller={controller} />}
      right={<AppRightPanel controller={controller} />}
    />
  );
}

function AppSidebar({ controller }: { controller: AppController }) {
  const { actions, navigation, tasks } = controller;
  return (
    <LeftPanel>
      <WorkbenchSidebar
        activeView={navigation.activeView}
        grouping={navigation.taskGrouping}
        selectedTaskId={navigation.activeView === "work" && navigation.workMode === "detail" ? tasks.selectedTask?.id ?? null : null}
        settingsTriggerRef={navigation.settingsTriggerRef}
        sort={navigation.taskSort}
        taskLoadStatus={tasks.effectiveCoreReadState.status}
        tasks={tasks.workbenchTaskThreads}
        onCreateTask={actions.createTask}
        onGroupingChange={navigation.setTaskGrouping}
        onOpenSettings={actions.openSettings}
        onOpenTask={actions.selectTask}
        onOpenView={actions.openView}
        onSortChange={navigation.setTaskSort}
      />
    </LeftPanel>
  );
}

function AppHeader({ controller, panelControls }: {
  controller: AppController;
  panelControls: { left: ReactNode; right: ReactNode; rightFullscreen: ReactNode };
}) {
  const { navigation, tasks } = controller;
  const settings = navigation.activeView === "settings";
  const workDetail = navigation.activeView === "work" && navigation.workMode === "detail" && tasks.selectedTask != null;
  const Icon = settings ? Settings : navigation.activeView === "browser" ? CircleUserRound : navigation.activeView === "library" ? Library : BriefcaseBusiness;
  return (
    <header className="shell-topbar production-topbar" aria-label="应用工具栏">
      <div className="topbar-left-slot">
        {panelControls.left}
        <button className="topbar-icon-button we-toolbar-icon-button cursor-interaction" type="button" aria-label="后退" disabled={!settings} onClick={navigation.closeSettings}><ArrowLeft size={15} /></button>
        <button className="topbar-icon-button we-toolbar-icon-button cursor-interaction" type="button" aria-label="前进" disabled><ArrowRight size={15} /></button>
      </div>
      <div className="topbar-center-surface"><span className="topbar-thread-symbol" aria-hidden="true"><Icon size={15} /></span><h2 id="thread-title">{pageTitle(controller)}</h2></div>
      <div className="topbar-right-slot production-right-topbar">
        {workDetail ? <><span className="right-panel-topbar-title">预览</span>{panelControls.rightFullscreen}{panelControls.right}</> : null}
      </div>
    </header>
  );
}

function AppWorkspace({ controller }: { controller: AppController }) {
  if (controller.navigation.activeView === "browser") return <IdentityWorkspace controller={controller} />;
  if (controller.navigation.activeView === "library") return <LibraryWorkspace controller={controller} />;
  if (controller.navigation.activeView === "settings") return <SettingsWorkspace controller={controller} />;
  return <WorkWorkspace controller={controller} />;
}

function IdentityWorkspace({ controller }: { controller: AppController }) {
  const { actions, skillWorkbench, sources } = controller;
  const live = sources.harborIdentityState.identities.some((identity) => identity.source === "Harbor live");
  if (sources.harborIdentityState.status === "loading") return <ThreadWorkspace workspaceKey="browser"><OwnerState title="正在读取账号身份" summary="正在同步账号、登录状态和浏览器环境。" /></ThreadWorkspace>;
  if (!live) {
    const ready = sources.harborIdentityState.status === "ready";
    return <ThreadWorkspace workspaceKey="browser"><OwnerState title={ready ? "暂无账号身份" : "账号身份暂不可用"} summary={ready ? "当前没有可用的账号身份。" : "暂时无法读取账号身份，请检查连接后重试。"} onRecover={actions.openSettings} /></ThreadWorkspace>;
  }
  return (
    <ThreadWorkspace workspaceKey="browser">
      <IdentityEnvironmentsPage
        harborEndpoint={sources.connectionConfig.harborEndpoint}
        initialState={sources.harborIdentityState}
        runtimeSupervisorState={sources.runtimeSupervisorState}
        onHarborStateChange={actions.onHarborStateChange}
        onOpenTask={actions.openTaskById}
      />
    </ThreadWorkspace>
  );
}

function LibraryWorkspace({ controller }: { controller: AppController }) {
  const { actions, skillWorkbench, sources } = controller;
  const catalog = sources.lodeCatalogState;
  if (catalog.status === "loading") return <ThreadWorkspace workspaceKey="library"><OwnerState title="正在读取站点技能" summary={catalog.summary} /></ThreadWorkspace>;
  if (catalog.status === "offline") return <ThreadWorkspace workspaceKey="library"><OwnerState title="站点技能暂不可用" summary={catalog.summary} onRecover={actions.openSettings} /></ThreadWorkspace>;
  return (
    <ThreadWorkspace workspaceKey="library">
      <SiteSkillLibrary
        catalog={catalog}
        compatibilityBySkill={skillWorkbench.compatibilityBySkill}
        identities={sources.harborIdentityState.identities}
        recoveryRequest={skillWorkbench.siteSkillRecoveryRequest}
        runtimeSupervisorState={sources.runtimeSupervisorState}
        onCreateIdentity={() => actions.openView("browser")}
        onNavigation={() => { skillWorkbench.invalidateRequests(); skillWorkbench.abandonSiteSkillRecovery(); }}
        onRecoveryConsumed={skillWorkbench.acknowledgeSiteSkillRecovery}
        onRecoverCandidate={skillWorkbench.recoverCandidate}
        onUse={skillWorkbench.useSiteSkill}
      />
    </ThreadWorkspace>
  );
}

function SettingsWorkspace({ controller }: { controller: AppController }) {
  const { navigation, sources } = controller;
  return (
    <ThreadWorkspace workspaceKey="settings">
      <SettingsPage
        embedded colorScheme={sources.shellContext?.colorScheme} configScope={sources.shellContext?.configScope}
        connectionConfig={sources.connectionConfig} platform={sources.shellContext?.platform}
        runtimeSupervisorState={sources.runtimeSupervisorState} settingsError={sources.settingsError} settingsSaved={sources.settingsSaved}
        onBack={navigation.closeSettings} onEndpointChange={controller.actions.updateEndpoint} onSave={sources.saveSettings}
      />
    </ThreadWorkspace>
  );
}

function WorkWorkspace({ controller }: { controller: AppController }) {
  const { navigation, skillWorkbench, sources } = controller;
  if (navigation.workMode === "create") {
    return (
      <ThreadWorkspace workspaceKey="work-create">
        <CreateTaskShell
          catalog={sources.lodeCatalogState} compatibilityBySkill={skillWorkbench.compatibilityBySkill}
          identities={sources.harborIdentityState.identities} selection={skillWorkbench.createTaskSelection}
          coreEndpoint={sources.connectionConfig.coreEndpoint} runtimeSupervisorState={sources.runtimeSupervisorState} onSelect={skillWorkbench.useSiteSkill}
          onCreateIdentity={() => controller.actions.openView("browser")} onCheckCompatibility={skillWorkbench.checkCreateTaskCompatibility}
          onRecover={controller.actions.openSettings} onRecoverCandidate={skillWorkbench.recoverCandidate}
          onRecoverExactTarget={skillWorkbench.recoverExactTarget} onTargetChange={skillWorkbench.resetTargetCompatibility}
          onTaskCreated={controller.actions.acceptCreatedTask}
        />
      </ThreadWorkspace>
    );
  }
  return <WorkDetail controller={controller} />;
}

function WorkDetail({ controller }: { controller: AppController }) {
  const { sources, tasks } = controller;
  const skill = tasks.selectedTask == null ? undefined : findCatalogSkillForTask(tasks.selectedTask, sources.lodeCatalogState.skills);
  if (tasks.selectedTask != null && tasks.selectedTask.runs.length === 0 && tasks.selectedSubmitTask != null) {
    return (
      <ThreadWorkspace workspaceKey={`work:${tasks.selectedTask.id}`} composer={
        <TaskThreadComposer
          coreEndpoint={sources.connectionConfig.coreEndpoint}
          harborIdentityState={sources.harborIdentityState}
          runtimeSupervisorState={sources.runtimeSupervisorState}
          selectedTask={tasks.selectedSubmitTask}
          skill={skill}
          onTask={tasks.acceptTaskThreadProjection}
        />
      }>
        <OwnerState title="暂无任务回合" summary="填写业务输入后即可提交第一个回合。" />
      </ThreadWorkspace>
    );
  }
  if (tasks.selectedTask == null || tasks.selectedRun == null || tasks.selectedSubmitTask == null) {
    return <ThreadWorkspace workspaceKey="work-empty"><OwnerState title={emptyTitle(tasks.effectiveCoreReadState.status)} summary={emptySummary(tasks.effectiveCoreReadState.status, tasks.effectiveCoreReadState.summary)} onRecover={tasks.effectiveCoreReadState.status === "loading" ? undefined : controller.actions.openSettings} /></ThreadWorkspace>;
  }
  return (
    <ThreadWorkspace workspaceKey={`work:${tasks.selectedTask.id}`} composer={
      <TaskThreadComposer
        coreEndpoint={sources.connectionConfig.coreEndpoint} harborIdentityState={sources.harborIdentityState}
        runtimeSupervisorState={sources.runtimeSupervisorState} selectedTask={tasks.selectedSubmitTask}
        skill={skill} onTask={tasks.acceptTaskThreadProjection}
      />
    }>
      <TaskThreadPage
        coreEndpoint={sources.connectionConfig.coreEndpoint}
        coreReadState={tasks.effectiveCoreReadState} coreSubmitState={tasks.coreSubmitState}
        navigationItems={tasks.threadNavigationItems} runtimeSupervisorState={sources.runtimeSupervisorState}
        skill={skill}
        selectedRun={tasks.selectedRun} selectedTask={tasks.selectedTask} onActiveRunChange={tasks.setSelectedRunId}
        onOpenPreview={tasks.requestRightPanel}
      />
    </ThreadWorkspace>
  );
}

function AppRightPanel({ controller }: { controller: AppController }) {
  const { navigation, sources, tasks } = controller;
  if (navigation.activeView !== "work" || navigation.workMode !== "detail" || tasks.selectedTask == null || tasks.selectedRun == null) return null;
  return (
    <RightPanel>
      <TaskThreadRightPanel
        coreReadState={tasks.effectiveCoreReadState} coreSubmitState={tasks.coreSubmitState}
        runtimeSupervisorState={sources.runtimeSupervisorState} selectedRun={tasks.selectedRun} selectedTask={tasks.selectedTask}
        shellDiagnostics={{ colorScheme: sources.shellContext?.colorScheme, configScope: sources.shellContext?.configScope, platform: sources.shellContext?.platform }}
      />
    </RightPanel>
  );
}

function pageTitle(controller: AppController) {
  const { activeView, workMode } = controller.navigation;
  if (activeView === "settings") return "设置";
  if (activeView === "browser") return "账号身份";
  if (activeView === "library") return "站点技能";
  return workMode === "create" ? "创建任务" : controller.tasks.selectedTask?.title ?? "任务";
}

function emptyTitle(status: string) {
  return status === "loading" ? "正在读取任务" : status === "ready" ? "暂无任务线程" : "任务暂不可用";
}

function emptySummary(status: string, summary: string) {
  return status === "loading" ? summary : status === "ready" ? "当前没有任务线程。" : "暂时无法读取任务线程，请检查连接后重试。";
}
