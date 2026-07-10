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
  Play,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";

import type {
  BrowserSessionProjection,
  BrowserSessionState,
  BrowserTargetProjection,
  IdentityEnvironmentProjection,
  IdentityStatus,
  IdentityTaskEntryProjection,
} from "./identityEnvironmentFixtures";
import { manualAuthenticationCompletionBlockReason } from "./harborIdentityClient";

const controllerModes = [
  ["手动浏览", "用户从身份环境直接打开浏览器，不创建 Core Task/Run/Result。"],
  ["智能体直接浏览", "Agent/API/CLI 可占用现场，但不等同于 App 自动任务。"],
  ["Core 任务运行", "只有 Core task path 才产生任务运行、结果和 evidence。"],
  ["空闲", "没有活动控制者或会话已释放。"],
] as const;

export function BrowserLaunchPanel({
  identity,
  session,
  onOpenTask,
  onReleaseSession,
  onStartTarget,
  onStopSession,
  onTakeoverSession,
  onViewSession,
  sessionBusy,
}: {
  identity: IdentityEnvironmentProjection;
  session: BrowserSessionProjection;
  onOpenTask: (taskId: string) => void;
  onReleaseSession: () => void;
  onStartTarget: (target: BrowserTargetProjection) => void;
  onStopSession: () => void;
  onTakeoverSession: () => void;
  onViewSession: () => void;
  sessionBusy: string;
}) {
  const canControl = session.state === "running" || session.state === "takeover";
  const canView = session.state !== "idle" && session.state !== "stopped";
  const runtimeBlocked = identity.source === "App runtime supervisor";
  const taskBlockReason = readTaskBlockReason(identity);

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
      <BrowserTargetButtons
        isRuntimeBlocked={runtimeBlocked}
        targets={identity.browser.targets}
        onStartTarget={onStartTarget}
        sessionBusy={sessionBusy}
      />
      <ReadTaskEntryPanel
        entries={identity.taskEntries}
        isRuntimeBlocked={runtimeBlocked}
        onOpenTask={onOpenTask}
        taskBlockReason={taskBlockReason}
      />
      <SessionControlPanel
        canControl={canControl && !runtimeBlocked}
        canView={canView && !runtimeBlocked}
        session={session}
        onReleaseSession={onReleaseSession}
        onStopSession={onStopSession}
        onTakeoverSession={onTakeoverSession}
        onViewSession={onViewSession}
        sessionBusy={sessionBusy}
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
  isRuntimeBlocked,
  targets,
  onStartTarget,
  sessionBusy,
}: {
  isRuntimeBlocked: boolean;
  targets: BrowserTargetProjection[];
  onStartTarget: (target: BrowserTargetProjection) => void;
  sessionBusy: string;
}) {
  return (
    <div className="identity-browser-targets" aria-label="打开默认页面">
      {targets.map((target) => (
        <button type="button" disabled={isRuntimeBlocked || Boolean(sessionBusy)} onClick={() => onStartTarget(target)} key={target.id}>
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
  isRuntimeBlocked,
  onOpenTask,
  taskBlockReason,
}: {
  entries: IdentityTaskEntryProjection[];
  isRuntimeBlocked: boolean;
  onOpenTask: (taskId: string) => void;
  taskBlockReason: string | null;
}) {
  const disabledReason = isRuntimeBlocked ? null : taskBlockReason;
  return (
    <div className="identity-read-task-panel" aria-label="真实只读任务入口">
      <div>
        <strong>从身份浏览器会话启动真实只读任务</strong>
        <span>Core task path 才产生 Run / Result / Evidence；App 只读取 Core owner API projection。</span>
      </div>
      {entries.map((entry) => (
        <button type="button" disabled={isRuntimeBlocked || disabledReason != null} onClick={() => onOpenTask(entry.taskId)} key={entry.id}>
          <Play size={15} />
          <span>
            {entry.label}
            <small>{entry.inputSummary}</small>
            {disabledReason != null ? <small>{disabledReason}</small> : null}
            <small>{entry.readiness}</small>
          </span>
          <em>{entry.source}</em>
        </button>
      ))}
    </div>
  );
}

function readTaskBlockReason(identity: IdentityEnvironmentProjection) {
  if (identity.source !== "Harbor live") {
    return "缺少 Harbor live identity；fixture/local identity 只能管理或认证，不能启动真实 Core task。";
  }
  if (identity.login.recoveryRequired || identity.readiness.state === "needs-auth") {
    return "需要先在 Harbor 身份浏览器完成登录/人工认证；未登录身份不能启动真实 Core task。";
  }
  if (identity.readiness.state !== "ready" || identity.provider.state !== "ready") {
    return "身份环境尚未 ready；受限或告警状态不能直接启动真实 Core task。";
  }
  return null;
}

function SessionControlPanel({
  canControl,
  canView,
  session,
  onReleaseSession,
  onStopSession,
  onTakeoverSession,
  onViewSession,
  sessionBusy,
}: {
  canControl: boolean;
  canView: boolean;
  session: BrowserSessionProjection;
  onReleaseSession: () => void;
  onStopSession: () => void;
  onTakeoverSession: () => void;
  onViewSession: () => void;
  sessionBusy: string;
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
            disabled={!canControl || Boolean(sessionBusy) || session.controller === "用户接管"}
            onClick={onTakeoverSession}
          >
            <KeyRound size={15} />
            接管
          </button>
          <button type="button" disabled={!canControl || Boolean(sessionBusy)} onClick={onReleaseSession}>
            <ShieldCheck size={15} />
            释放
          </button>
          <button type="button" disabled={!canView || Boolean(sessionBusy)} onClick={onStopSession}>
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

export function IdentityListRow({
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

export function DetailHeader({ identity }: { identity: IdentityEnvironmentProjection }) {
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

export function DetailGrid({ identity }: { identity: IdentityEnvironmentProjection }) {
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

export function RecoveryPanel({
  identity,
  manualAuthenticationBusy,
  manualAuthenticationMessage,
  onCompleteManualAuthentication,
  onRefresh,
  session,
}: {
  identity: IdentityEnvironmentProjection;
  manualAuthenticationBusy: boolean;
  manualAuthenticationMessage: string;
  onCompleteManualAuthentication: () => void;
  onRefresh: () => void;
  session: BrowserSessionProjection;
}) {
  const manualAuthenticationBlockReason = manualAuthenticationCompletionBlockReason(identity, session);
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
        {manualAuthenticationBlockReason == null ? (
          <button type="button" disabled={manualAuthenticationBusy} onClick={onCompleteManualAuthentication}>
            <CheckCircle2 size={15} />
            我已完成认证
          </button>
        ) : (
          <span>{manualAuthenticationBlockReason}</span>
        )}
        <button type="button" onClick={onRefresh}>
          <RefreshCw size={15} />
          刷新 Harbor 状态
        </button>
      </div>
      {manualAuthenticationMessage ? <p>{manualAuthenticationMessage}</p> : null}
    </section>
  );
}

export function BoundaryPanel({ identity }: { identity: IdentityEnvironmentProjection }) {
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
