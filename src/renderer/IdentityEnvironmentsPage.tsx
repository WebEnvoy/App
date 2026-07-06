import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Fingerprint,
  Globe2,
  KeyRound,
  LockKeyhole,
  MapPin,
  MonitorCog,
  Plus,
  Play,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import {
  identityEnvironmentBoundaries,
  identityEnvironmentFixtures,
  type BrowserSessionProjection,
  type BrowserSessionState,
  type BrowserTargetProjection,
  type IdentityEnvironmentProjection,
  type IdentityStatus,
  type IdentityTaskEntryProjection,
} from "./identityEnvironmentFixtures";

const controllerModes = [
  ["手动浏览", "用户从身份环境直接打开浏览器，不创建 Core Task/Run/Result。"],
  ["智能体直接浏览", "Agent/API/CLI 可占用现场，但不等同于 App 自动任务。"],
  ["Core 任务运行", "只有 Core task path 才产生任务运行、结果和 evidence。"],
  ["空闲", "没有活动控制者或会话已释放。"],
] as const;

export function IdentityEnvironmentsPage({ onOpenTask }: { onOpenTask: (taskId: string) => void }) {
  const [selectedId, setSelectedId] = useState(identityEnvironmentFixtures[0].id);
  const [sessionOverrides, setSessionOverrides] = useState<Record<string, BrowserSessionProjection>>({});
  const selected =
    identityEnvironmentFixtures.find((identity) => identity.id === selectedId) ??
    identityEnvironmentFixtures[0];
  const session = sessionOverrides[selected.id] ?? selected.browser.session;

  function updateSelectedSession(nextSession: BrowserSessionProjection) {
    setSessionOverrides((current) => ({ ...current, [selected.id]: nextSession }));
  }

  function startManualBrowser(target: BrowserTargetProjection) {
    updateSelectedSession({
      ...selected.browser.session,
      provider: selected.browser.defaultProvider,
      state: "running",
      statusLabel: "已启动",
      controller: "手动浏览",
      currentUrl: target.defaultUrl,
      title: target.defaultTitle,
      startedAt: "本地意图待 Harbor 回读",
      message: `已请求 Harbor 用 ${selected.browser.defaultProvider} 打开${target.label}默认页面；这是手动身份浏览，不创建 Core 任务。`,
    });
  }

  function viewSession() {
    updateSelectedSession({
      ...session,
      message: `查看会话入口指向 ${session.viewerRef}；App 不暴露 raw CDP/VNC endpoint。`,
    });
  }

  function takeoverSession() {
    updateSelectedSession({
      ...session,
      state: "takeover",
      statusLabel: "用户接管",
      controller: "用户接管",
      message: "已发送用户接管意图；冲突和失败原因应由 Harbor 回读展示。",
    });
  }

  function releaseSession() {
    updateSelectedSession({
      ...session,
      state: "running",
      statusLabel: "已释放",
      controller: "空闲",
      message: "已发送释放意图；会话可回到 Harbor 或后续任务控制。",
    });
  }

  function stopSession() {
    updateSelectedSession({
      ...session,
      state: "stopped",
      statusLabel: "已停止",
      controller: "空闲",
      currentUrl: "已停止",
      title: "无活动页面",
      message: "已发送停止意图；不会强杀用户未确认的关键操作。",
    });
  }

  return (
    <div className="identity-page we-sectioned-page">
      <header className="identity-header">
        <div>
          <h1>账号身份</h1>
          <p>Harbor identity environment public summary；App 不拥有身份环境真相。</p>
        </div>
        <div className="identity-header-actions" aria-label="身份环境管理入口">
          <button type="button">
            <Plus size={15} />
            创建
          </button>
          <button type="button">
            <Upload size={15} />
            导入
          </button>
          <button type="button">
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

      <div className="identity-layout">
        <section className="identity-list" aria-label="身份环境列表">
          {identityEnvironmentFixtures.map((identity) => (
            <IdentityListRow
              identity={identity}
              isSelected={identity.id === selected.id}
              onSelect={() => setSelectedId(identity.id)}
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
          />
          <RecoveryPanel identity={selected} />
          <BoundaryPanel identity={selected} />
        </section>
      </div>
    </div>
  );
}

function BrowserLaunchPanel({
  identity,
  session,
  onOpenTask,
  onReleaseSession,
  onStartTarget,
  onStopSession,
  onTakeoverSession,
  onViewSession,
}: {
  identity: IdentityEnvironmentProjection;
  session: BrowserSessionProjection;
  onOpenTask: (taskId: string) => void;
  onReleaseSession: () => void;
  onStartTarget: (target: BrowserTargetProjection) => void;
  onStopSession: () => void;
  onTakeoverSession: () => void;
  onViewSession: () => void;
}) {
  const canControl = session.state === "running" || session.state === "takeover";
  const canView = session.state !== "idle" && session.state !== "stopped";

  return (
    <section className="identity-browser-panel" aria-label="身份浏览器会话">
      <div className="identity-browser-heading">
        <div className="card-title">
          <MonitorCog size={18} />
          <h3>身份浏览器</h3>
          <SessionStatusPill state={session.state} label={session.statusLabel} />
        </div>
        <p>手动身份浏览是 Browser/Harbor session，不是 Core 任务运行。</p>
      </div>

      <ProviderStatusList providers={identity.browser.providers} />
      <BrowserTargetButtons targets={identity.browser.targets} onStartTarget={onStartTarget} />
      <ReadTaskEntryPanel entries={identity.taskEntries} onOpenTask={onOpenTask} />
      <SessionControlPanel
        canControl={canControl}
        canView={canView}
        session={session}
        onReleaseSession={onReleaseSession}
        onStopSession={onStopSession}
        onTakeoverSession={onTakeoverSession}
        onViewSession={onViewSession}
      />
      <ControllerModeList activeController={session.controller} />

      <p className="identity-browser-boundary">{identity.browser.boundary}</p>
    </section>
  );
}

function ProviderStatusList({
  providers,
}: {
  providers: IdentityEnvironmentProjection["browser"]["providers"];
}) {
  return (
    <div className="identity-provider-grid" aria-label="Provider 可用状态">
      {providers.map((provider) => (
        <article className={`identity-provider-row provider-${provider.state}`} key={provider.name}>
          <div>
            <strong>{provider.name}</strong>
            <span>{provider.role}</span>
          </div>
          <ProviderPill state={provider.state} label={provider.statusLabel} />
          <p>{provider.summary}</p>
          {provider.installHint != null ? <small>{provider.installHint}</small> : null}
        </article>
      ))}
    </div>
  );
}

function BrowserTargetButtons({
  targets,
  onStartTarget,
}: {
  targets: BrowserTargetProjection[];
  onStartTarget: (target: BrowserTargetProjection) => void;
}) {
  return (
    <div className="identity-browser-targets" aria-label="打开默认页面">
      {targets.map((target) => (
        <button type="button" onClick={() => onStartTarget(target)} key={target.id}>
          <Play size={15} />
          打开{target.label}
          <span>{target.readiness}</span>
        </button>
      ))}
    </div>
  );
}

function ReadTaskEntryPanel({
  entries,
  onOpenTask,
}: {
  entries: IdentityTaskEntryProjection[];
  onOpenTask: (taskId: string) => void;
}) {
  return (
    <div className="identity-read-task-panel" aria-label="真实只读任务入口">
      <div>
        <strong>从身份浏览器会话启动真实只读任务</strong>
        <span>Core task path 才产生 Run / Result / Evidence；这里使用本地 fixture projection 表达上游回读。</span>
      </div>
      {entries.map((entry) => (
        <button type="button" onClick={() => onOpenTask(entry.taskId)} key={entry.id}>
          <Play size={15} />
          <span>
            {entry.label}
            <small>{entry.inputSummary}</small>
            <small>{entry.readiness}</small>
          </span>
          <em>{entry.source}</em>
        </button>
      ))}
    </div>
  );
}

function SessionControlPanel({
  canControl,
  canView,
  session,
  onReleaseSession,
  onStopSession,
  onTakeoverSession,
  onViewSession,
}: {
  canControl: boolean;
  canView: boolean;
  session: BrowserSessionProjection;
  onReleaseSession: () => void;
  onStopSession: () => void;
  onTakeoverSession: () => void;
  onViewSession: () => void;
}) {
  return (
    <div className="identity-session-grid">
      <dl className="identity-facts identity-session-facts">
        <Fact label="会话状态" value={`${session.statusLabel} · ${session.provider}`} />
        <Fact label="控制者" value={session.controller} />
        <Fact label="当前网址" value={session.currentUrl} />
        <Fact label="标题" value={session.title} />
        <Fact label="Session ref" value={session.browserSessionRef} />
        <Fact label="Viewer ref" value={session.viewerRef} />
      </dl>
      <div className="identity-session-actions">
        <p>{session.message}</p>
        <div className="identity-action-row">
          <button type="button" disabled={!canView} onClick={onViewSession}>
            <ExternalLink size={15} />
            查看会话
          </button>
          <button
            type="button"
            disabled={!canControl || session.controller === "用户接管"}
            onClick={onTakeoverSession}
          >
            <KeyRound size={15} />
            接管
          </button>
          <button type="button" disabled={!canControl} onClick={onReleaseSession}>
            <ShieldCheck size={15} />
            释放
          </button>
          <button type="button" disabled={!canView} onClick={onStopSession}>
            <AlertTriangle size={15} />
            停止
          </button>
        </div>
      </div>
    </div>
  );
}

function ControllerModeList({ activeController }: { activeController: BrowserSessionProjection["controller"] }) {
  return (
    <div className="identity-controller-modes" aria-label="控制者状态说明">
      {controllerModes.map(([mode, detail]) => (
        <div className={activeController === mode ? "active" : undefined} key={mode}>
          <strong>{mode}</strong>
          <span>{detail}</span>
        </div>
      ))}
    </div>
  );
}

function IdentityListRow({
  identity,
  isSelected,
  onSelect,
}: {
  identity: IdentityEnvironmentProjection;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={isSelected ? "identity-list-row we-list-row selected" : "identity-list-row we-list-row"}
      type="button"
      aria-current={isSelected ? "page" : undefined}
      onClick={onSelect}
    >
      <span className="identity-site-mark">{identity.siteName.slice(0, 1)}</span>
      <span className="identity-list-copy">
        <strong>{identity.name}</strong>
        <span>
          {identity.siteName} · {identity.accountLabel}
        </span>
      </span>
      <StatusPill status={identity.readiness.state} label={identity.readiness.label} />
    </button>
  );
}

function DetailHeader({ identity }: { identity: IdentityEnvironmentProjection }) {
  return (
    <div className="identity-detail-header">
      <div>
        <h2>{identity.name}</h2>
        <p>
          {identity.origin} · {identity.source} · {identity.fetchedAt}
        </p>
      </div>
      <StatusPill status={identity.readiness.state} label={identity.readiness.label} />
    </div>
  );
}

function DetailGrid({ identity }: { identity: IdentityEnvironmentProjection }) {
  return (
    <div className="identity-detail-grid">
      <DetailCard icon={Globe2} title="站点绑定">
        <Fact label="站点" value={`${identity.siteName} / ${identity.siteId}`} />
        <Fact label="账号" value={identity.accountLabel} />
        <Fact label="任务入口" value={identity.siteBindings.join("、")} />
      </DetailCard>
      <DetailCard icon={MonitorCog} title="Provider">
        <Fact label="当前" value={`${identity.provider.selected} · ${identity.provider.role}`} />
        <Fact label="说明" value={identity.provider.reason} />
        <Fact label="排除" value="Chromium / Donut Browser 不进入用户 provider 管理" />
      </DetailCard>
      <DetailCard icon={MapPin} title="环境摘要">
        <Fact label="代理" value={identity.environment.proxy} />
        <Fact label="地区 / 语言" value={`${identity.environment.region} / ${identity.environment.language}`} />
        <Fact label="时区" value={identity.environment.timezone} />
      </DetailCard>
      <DetailCard icon={Fingerprint} title="指纹摘要">
        <Fact label="浏览器" value={identity.environment.browser} />
        <Fact label="UA" value={identity.environment.userAgent} />
        <Fact label="指纹" value={identity.environment.fingerprint} />
      </DetailCard>
      <DetailCard icon={LockKeyhole} title="敏感材料状态">
        <Fact label="Profile storage" value={identity.storage.profileStorage} />
        <Fact label="Cookie/session" value={identity.storage.cookies} />
        <Fact label="本机凭据引用" value={identity.storage.credentialRef} />
      </DetailCard>
      <DetailCard icon={ShieldCheck} title="一致性">
        <Fact label="状态" value={identity.readiness.label} />
        <Fact label="原因" value={identity.readiness.reasons.join("；")} />
        <Fact label="风险承诺" value="不承诺绕过风控或平台检测" />
      </DetailCard>
    </div>
  );
}

function RecoveryPanel({ identity }: { identity: IdentityEnvironmentProjection }) {
  return (
    <section className="identity-recovery-panel">
      <div>
        <h3>登录恢复与人工认证</h3>
        <p>{identity.login.reason}</p>
      </div>
      <dl className="identity-facts">
        <Fact label="登录态" value={identity.login.state} />
        <Fact label="人工认证" value={identity.login.manualAuthenticationState} />
        <Fact
          label="恢复动作"
          value={identity.login.recoveryActions.length > 0 ? identity.login.recoveryActions.join("、") : "无需恢复"}
        />
      </dl>
      <div className="identity-action-row">
        <button type="button" disabled={!identity.login.recoveryRequired}>
          <KeyRound size={15} />
          打开认证现场
        </button>
        <button type="button">
          <RefreshCw size={15} />
          刷新 Harbor 状态
        </button>
      </div>
    </section>
  );
}

function BoundaryPanel({ identity }: { identity: IdentityEnvironmentProjection }) {
  return (
    <section className="identity-boundary-card">
      <AlertTriangle size={17} />
      <div>
        <strong>App 展示边界</strong>
        <p>
          当前详情只消费 {identity.identityEnvironmentRef}、{identity.executionIdentityRef} 和
          {identity.profileRef} 的公开摘要；不展示密码、验证码、Cookie、令牌、raw CDP/VNC endpoint 或 profile storage。
        </p>
      </div>
    </section>
  );
}

function DetailCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Globe2;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="identity-card">
      <div className="card-title">
        <Icon size={18} />
        <h3>{title}</h3>
      </div>
      <dl className="identity-facts">{children}</dl>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function StatusPill({ status, label }: { status: IdentityStatus; label: string }) {
  return (
    <span className={`identity-status identity-status-${status}`}>
      {status === "ready" ? <CheckCircle2 size={12} /> : null}
      {label}
    </span>
  );
}

function ProviderPill({ state, label }: { state: "available" | "missing" | "restricted"; label: string }) {
  return <span className={`identity-status provider-status-${state}`}>{label}</span>;
}

function SessionStatusPill({ state, label }: { state: BrowserSessionState; label: string }) {
  return <span className={`identity-status session-status-${state}`}>{label}</span>;
}
