import {
  AlertTriangle,
  CheckCircle2,
  Fingerprint,
  Globe2,
  KeyRound,
  LockKeyhole,
  MapPin,
  MonitorCog,
  Plus,
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
  type IdentityEnvironmentProjection,
  type IdentityStatus,
} from "./identityEnvironmentFixtures";

export function IdentityEnvironmentsPage() {
  const [selectedId, setSelectedId] = useState(identityEnvironmentFixtures[0].id);
  const selected =
    identityEnvironmentFixtures.find((identity) => identity.id === selectedId) ??
    identityEnvironmentFixtures[0];

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
          <RecoveryPanel identity={selected} />
          <BoundaryPanel identity={selected} />
        </section>
      </div>
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
