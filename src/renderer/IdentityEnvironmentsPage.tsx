import { Plus, Trash2, Upload } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import {
  BoundaryPanel,
  BrowserLaunchPanel,
  DetailGrid,
  DetailHeader,
  IdentityListRow,
  RecoveryPanel,
} from "./IdentityEnvironmentDetails";
import {
  HarborConnectionStrip,
  IdentityEnvironmentManagementPanel,
  type IdentityManagementMode,
} from "./IdentityEnvironmentManagementPanel";
import {
  completeHarborManualAuthentication,
  createHarborIdentityEnvironment,
  fetchHarborIdentityState,
  lockHarborSession,
  openHarborIdentitySession,
  projectHarborSession,
  releaseHarborSession,
  stopHarborSession,
} from "./harborIdentityClient";
import { mergeIdentityEnvironmentProjections, projectHarborIdentity } from "./harborIdentityProjection";
import type { HarborIdentityLoadState } from "./harborIdentityTypes";
import {
  identityEnvironmentBoundaries,
  identityEnvironmentFixtures,
  type BrowserSessionProjection,
  type BrowserTargetProjection,
} from "./identityEnvironmentFixtures";
import {
  createLocalIdentityEnvironmentDraft,
  loadLocalIdentityEnvironmentDrafts,
  localIdentitySelectionStorageKey,
  parseImportedIdentityEnvironment,
  removeLocalIdentityEnvironmentDraft,
  upsertLocalIdentityEnvironmentDraft,
} from "./localIdentityEnvironmentStore";
import {
  projectRuntimeGatedIdentities,
  type RuntimeSupervisorState,
} from "./runtimeSupervisorState";

const initialHarborState: HarborIdentityLoadState = {
  status: "loading",
  fetchedAt: "pending",
  summary: "正在读取 Harbor provider、identity environment 和 session public facts。",
  identities: [],
};

export function IdentityEnvironmentsPage({
  harborEndpoint,
  runtimeSupervisorState,
  onOpenTask,
}: {
  harborEndpoint: string;
  runtimeSupervisorState: RuntimeSupervisorState;
  onOpenTask: (taskId: string) => void;
}) {
  const [selectedId, setSelectedId] = useState(
    () => window.localStorage.getItem(localIdentitySelectionStorageKey) ?? identityEnvironmentFixtures[0].id,
  );
  const [localDrafts, setLocalDrafts] = useState(loadLocalIdentityEnvironmentDrafts);
  const [harborState, setHarborState] = useState<HarborIdentityLoadState>(initialHarborState);
  const [managementMode, setManagementMode] = useState<IdentityManagementMode>("closed");
  const [managementMessage, setManagementMessage] = useState("");
  const [importText, setImportText] = useState("");
  const [sessionBusy, setSessionBusy] = useState("");
  const [sessionOverrides, setSessionOverrides] = useState<Record<string, BrowserSessionProjection>>({});
  const [manualAuthenticationMessage, setManualAuthenticationMessage] = useState("");
  const identityEnvironments = useMemo(
    () =>
      projectRuntimeGatedIdentities(
        mergeIdentityEnvironmentProjections(harborState.identities, identityEnvironmentFixtures),
        runtimeSupervisorState,
      ),
    [harborState.identities, runtimeSupervisorState],
  );
  const selected =
    identityEnvironments.find((identity) => identity.id === selectedId) ??
    identityEnvironments[0] ??
    identityEnvironmentFixtures[0];
  const session = sessionOverrides[selected.id] ?? selected.browser.session;

  useEffect(() => {
    void refreshHarborState();
  }, [harborEndpoint, localDrafts]);

  useEffect(() => {
    if (!identityEnvironments.some((identity) => identity.id === selectedId)) {
      selectIdentity(identityEnvironments[0]?.id ?? identityEnvironmentFixtures[0].id);
    }
  }, [identityEnvironments, selectedId]);

  async function refreshHarborState() {
    setHarborState((current) => ({ ...current, status: "loading" }));
    setHarborState(await fetchHarborIdentityState(harborEndpoint, localDrafts));
  }

  function selectIdentity(id: string) {
    setSelectedId(id);
    setManualAuthenticationMessage("");
    window.localStorage.setItem(localIdentitySelectionStorageKey, id);
  }

  function updateSelectedSession(nextSession: BrowserSessionProjection) {
    setSessionOverrides((current) => ({ ...current, [selected.id]: nextSession }));
  }

  async function startManualBrowser(target: BrowserTargetProjection) {
    const fallbackSession: BrowserSessionProjection = {
      ...selected.browser.session,
      provider: selected.browser.defaultProvider,
      state: "running",
      statusLabel: "请求中",
      controller: "手动浏览",
      currentUrl: target.defaultUrl,
      title: target.defaultTitle,
      startedAt: "等待 Harbor 回读",
      message: `已请求 Harbor 用 ${selected.browser.defaultProvider} 打开${target.label}默认页面；这是手动身份浏览，不创建 Core 任务。`,
    };
    updateSelectedSession(fallbackSession);
    setSessionBusy(`open-${target.id}`);
    updateSelectedSession(projectHarborSession(await openHarborIdentitySession(harborEndpoint, selected, target), fallbackSession));
    setSessionBusy("");
  }

  function viewSession() {
    updateSelectedSession({
      ...session,
      message: `查看会话入口指向 ${session.viewerRef}；App 不暴露 raw CDP/VNC endpoint。`,
    });
  }

  async function takeoverSession() {
    setSessionBusy("takeover");
    updateSelectedSession(projectHarborSession(await lockHarborSession(harborEndpoint, session.browserSessionRef), session));
    setSessionBusy("");
  }

  async function releaseSession() {
    setSessionBusy("release");
    updateSelectedSession(projectHarborSession(await releaseHarborSession(harborEndpoint, session.browserSessionRef), session));
    setSessionBusy("");
  }

  async function stopSession() {
    setSessionBusy("stop");
    updateSelectedSession(projectHarborSession(await stopHarborSession(harborEndpoint, session.browserSessionRef), session));
    setSessionBusy("");
  }

  async function completeManualAuthentication() {
    setSessionBusy("manual-authentication-completed");
    setManualAuthenticationMessage("");
    const result = await completeHarborManualAuthentication(harborEndpoint, selected, session);
    if (!result.ok) {
      setManualAuthenticationMessage(result.error);
      setSessionBusy("");
      return;
    }

    const fetchedAt = new Date().toISOString();
    setHarborState((current) => ({
      ...current,
      status: "ready",
      fetchedAt,
      summary: "Harbor 已返回用户确认的公开认证状态；正在刷新 identity projection。",
      identities: current.identities.map((identity) =>
        identity.identityEnvironmentRef === result.identity.identity_environment_ref
          ? projectHarborIdentity(result.identity, null, fetchedAt)
          : identity,
      ),
    }));
    setManualAuthenticationMessage("Harbor 已接受认证完成确认，并返回公开身份状态。App 未读取或保存认证材料。");
    await refreshHarborState();
    setSessionBusy("");
  }

  function saveDraft(draft: ReturnType<typeof createLocalIdentityEnvironmentDraft>, message: string) {
    upsertLocalIdentityEnvironmentDraft(draft);
    setLocalDrafts(loadLocalIdentityEnvironmentDrafts());
    selectIdentity(draft.id);
    setManagementMode("closed");
    setManagementMessage(message);
  }

  async function registerDraftWithHarbor(draft: ReturnType<typeof createLocalIdentityEnvironmentDraft>, fallbackMessage: string) {
    setManagementMessage("正在写入 Harbor identity environment owner API。");
    const result = await createHarborIdentityEnvironment(harborEndpoint, draft);
    if (!result.ok) {
      saveDraft(draft, `${fallbackMessage} ${result.error} 已保存为 App local-only 草稿；不能启动真实身份浏览器或提交真实 Core task。`);
      return;
    }

    removeLocalIdentityEnvironmentDraft(draft.id);
    setLocalDrafts(loadLocalIdentityEnvironmentDrafts());
    selectIdentity(draft.identityEnvironmentRef);
    setManagementMode("closed");
    setManagementMessage("已写入 Harbor identity environment owner API；App localStorage 未保存 Cookie、token、profile 原始内容或 raw evidence。");
    await refreshHarborState();
  }

  async function createIdentity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const draft = createLocalIdentityEnvironmentDraft(Object.fromEntries(new FormData(form)));
    form.reset();
    await registerDraftWithHarbor(draft, "Harbor 暂未接受创建请求。");
  }

  async function importIdentity() {
    const parsed = parseImportedIdentityEnvironment(importText);
    if (!parsed.ok) {
      setManagementMessage(parsed.error);
      return;
    }
    setImportText("");
    await registerDraftWithHarbor(parsed.draft, "Harbor 暂未接受导入请求。");
  }

  function deleteSelectedIdentity() {
    if (!localDrafts.some((draft) => draft.id === selected.id)) {
      setManagementMessage("只能删除 App 本地允许配置；Harbor live 或 fixture 事实由 owner/source 管理。");
      return;
    }
    removeLocalIdentityEnvironmentDraft(selected.id);
    setLocalDrafts(loadLocalIdentityEnvironmentDrafts());
    selectIdentity(identityEnvironmentFixtures[0].id);
    setManagementMessage("已删除 App 本地身份环境配置；未触碰 Harbor profile 或凭据材料。");
  }

  return (
    <div className="identity-page we-sectioned-page">
      <header className="identity-header">
        <div>
          <h1>账号身份</h1>
          <p>Harbor identity environment public summary；App 不拥有身份环境真相。</p>
        </div>
        <div className="identity-header-actions" aria-label="身份环境管理入口">
          <button type="button" onClick={() => setManagementMode("create")}>
            <Plus size={15} />
            创建
          </button>
          <button type="button" onClick={() => setManagementMode("import")}>
            <Upload size={15} />
            导入
          </button>
          <button type="button" onClick={deleteSelectedIdentity}>
            <Trash2 size={15} />
            删除
          </button>
        </div>
      </header>

      <section className="identity-boundary-strip" aria-label="数据边界">
        {identityEnvironmentBoundaries.map((boundary) => (
          <span key={boundary}>{boundary}</span>
        ))}
      </section>

      <HarborConnectionStrip
        harborEndpoint={harborEndpoint}
        state={harborState}
        onRefresh={refreshHarborState}
      />

      <IdentityEnvironmentManagementPanel
        importText={importText}
        message={managementMessage}
        mode={managementMode}
        onCancel={() => {
          setManagementMode("closed");
          setManagementMessage("");
        }}
        onCreate={createIdentity}
        onImport={importIdentity}
        onImportTextChange={setImportText}
      />

      <div className="identity-layout">
        <section className="identity-list" aria-label="身份环境列表">
          {identityEnvironments.map((identity) => (
            <IdentityListRow
              identity={identity}
              isSelected={identity.id === selected.id}
              onSelect={() => selectIdentity(identity.id)}
              key={identity.id}
            />
          ))}
        </section>

        <section className="identity-detail" aria-label="身份环境详情">
          <DetailHeader identity={selected} />
          <DetailGrid identity={selected} />
          <BrowserLaunchPanel
            identity={selected}
            session={session}
            onOpenTask={onOpenTask}
            onReleaseSession={releaseSession}
            onStartTarget={startManualBrowser}
            onStopSession={stopSession}
            onTakeoverSession={takeoverSession}
            onViewSession={viewSession}
            sessionBusy={sessionBusy}
          />
          <RecoveryPanel
            identity={selected}
            manualAuthenticationMessage={manualAuthenticationMessage}
            manualAuthenticationBusy={sessionBusy === "manual-authentication-completed"}
            onCompleteManualAuthentication={completeManualAuthentication}
            onRefresh={refreshHarborState}
            session={session}
          />
          <BoundaryPanel identity={selected} />
        </section>
      </div>
    </div>
  );
}
