import {
  Check,
  ChevronDown,
  CircleAlert,
  CircleStop,
  Download,
  ExternalLink,
  Import,
  KeyRound,
  LoaderCircle,
  Monitor,
  Play,
  RefreshCw,
  RotateCcw,
  Settings2,
  ShieldCheck,
  UserRoundPlus,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";

import type { Identity } from "./prototypeData";

export function BrowserSurface({
  identity,
  initialIdentitySite,
  mode,
  onCreate,
  onModeChange,
  onProviderRepaired,
  onReturnToTask,
  onTakeoverCompleted,
  onUseSkill,
}: {
  identity: Identity;
  initialIdentitySite: string;
  mode: "detail" | "create" | "repair" | "live";
  onCreate: (identity: Identity) => void;
  onModeChange: (mode: "detail" | "create" | "repair" | "live") => void;
  onProviderRepaired: () => void;
  onReturnToTask: () => void;
  onTakeoverCompleted: () => void;
  onUseSkill: () => void;
}) {
  if (mode === "create") return <CreateIdentity initialSite={initialIdentitySite} onCreate={onCreate} />;
  if (mode === "repair") return <ProviderRecovery onDone={() => { onProviderRepaired(); onModeChange("detail"); }} />;
  if (mode === "live") return <LiveBrowser identity={identity} onReturnToTask={onReturnToTask} onTakeoverCompleted={onTakeoverCompleted} />;
  return <IdentityDetail identity={identity} onModeChange={onModeChange} onUseSkill={onUseSkill} />;
}

function IdentityDetail({ identity, onModeChange, onUseSkill }: { identity: Identity; onModeChange: (mode: "detail" | "create" | "repair" | "live") => void; onUseSkill: () => void }) {
  const unavailable = identity.state === "repair";
  return (
    <div className="prototype-page identity-detail-page">
      <header className="prototype-page-heading identity-heading">
        <div className="identity-title-group"><span className="identity-avatar">{identity.site.slice(0, 1)}</span><div><div className="prototype-eyebrow">{identity.site} · {identity.account}</div><h1>{identity.name}</h1><p>{identity.provider} · {identity.detail}</p></div></div>
        <span className={`prototype-state-chip ${identity.state}`}>{identity.state === "available" || identity.state === "running" ? <Check size={13} /> : <CircleAlert size={13} />}{identity.stateLabel}</span>
      </header>

      {unavailable ? (
        <section className="prototype-callout action-needed"><CircleAlert size={18} /><div><strong>CloakBrowser 尚未安装</strong><p>这个账号的持久环境仍然保留。安装并验证 Provider 后即可重新打开。</p></div><button className="prototype-button primary" type="button" onClick={() => onModeChange("repair")}><Download size={14} />安装并修复</button></section>
      ) : null}

      <section className="identity-primary-action">
        <div><h2>{unavailable ? "浏览器当前不可用" : identity.state === "running" ? "浏览器实例正在运行" : identity.state === "login" ? "需要重新登录" : "环境已就绪"}</h2><p>{unavailable ? "账号环境仍然保留，先完成 Provider 修复。" : identity.state === "running" ? "已有实例会被复用，不会为同一账号静默启动第二个实例。" : identity.state === "login" ? "打开当前持久环境完成登录，返回后同步登录状态。" : "打开后进入该账号的持久浏览器环境。"}</p></div>
        <div className="section-actions"><button className="prototype-button primary" type="button" disabled={unavailable} onClick={() => onModeChange("live")}><Monitor size={14} />{identity.state === "running" ? "查看实例" : identity.state === "login" ? "打开并登录" : "打开浏览器"}</button><button className="prototype-button" type="button" disabled={unavailable} onClick={onUseSkill}><Play size={14} />创建任务</button></div>
      </section>

      <div className="identity-columns">
        <section className="prototype-section compact-section">
          <div className="prototype-section-title"><div><h2>账号与站点</h2><p>业务用户首先看到的身份信息</p></div><button className="icon-plain-button" type="button" aria-label="编辑账号身份"><Settings2 size={15} /></button></div>
          <dl className="prototype-detail-list"><div><dt>站点</dt><dd>{identity.site}</dd></div><div><dt>账号标识</dt><dd>{identity.account}</dd></div><div><dt>最近确认登录</dt><dd>{identity.state === "login" ? "18 分钟前 · 已失效" : "今天 14:31"}</dd></div><div><dt>相关任务</dt><dd>8 个 · 最近今天 14:32</dd></div></dl>
        </section>
        <section className="prototype-section compact-section">
          <div className="prototype-section-title"><div><h2>浏览器环境</h2><p>一个身份对应一个持久环境</p></div><button className="icon-plain-button" type="button" aria-label="编辑环境"><Settings2 size={15} /></button></div>
          <dl className="prototype-detail-list"><div><dt>Provider</dt><dd>{identity.provider}</dd></div><div><dt>环境预设</dt><dd>中国大陆 · 中文 · 自动时区</dd></div><div><dt>代理</dt><dd>团队推荐线路 · 可用</dd></div><div><dt>本机数据</dt><dd>已保留 · App 不展示敏感内容</dd></div></dl>
        </section>
      </div>

      <section className="prototype-disclosure"><button type="button"><ChevronDown size={15} />高级环境设置与诊断<span>代理、语言、时区、指纹摘要和路径</span></button></section>
    </div>
  );
}

function CreateIdentity({ initialSite, onCreate }: { initialSite: string; onCreate: (identity: Identity) => void }) {
  const [name, setName] = useState("");
  const [site, setSite] = useState(initialSite);
  const [provider, setProvider] = useState("CloakBrowser");
  return (
    <div className="prototype-page create-identity-page">
      <header className="prototype-page-heading"><div><div className="prototype-eyebrow">Browser</div><h1>创建账号身份</h1><p>为一个站点账号创建独立、持久的浏览器环境。</p></div><button className="prototype-button" type="button"><Import size={14} />从已有环境导入</button></header>
      <form className="prototype-form identity-form" onSubmit={(event) => { event.preventDefault(); onCreate({ id: `identity-${Date.now()}`, name, site, account: "待登录", provider, state: "login", stateLabel: "需要登录", detail: "环境已创建 · 等待首次登录" }); }}>
        <fieldset><legend>账号身份</legend><div className="inline-form-grid"><label>身份名称<input required value={name} placeholder="例如：小红书品牌号" onChange={(event) => setName(event.target.value)} /></label><label>目标站点<select value={site} onChange={(event) => setSite(event.target.value)}><option>小红书</option><option>微信公众号</option><option>抖音</option><option>淘宝</option></select></label></div><label>账号标识（可选）<input placeholder="团队内易于识别的账号名称" /></label></fieldset>
        <fieldset><legend>浏览器 Provider</legend><div className="provider-choice-list"><label className={provider === "CloakBrowser" ? "selected" : ""}><input type="radio" name="provider" checked={provider === "CloakBrowser"} onChange={() => setProvider("CloakBrowser")} /><ShieldCheck size={18} /><span><strong>CloakBrowser</strong><small>推荐 · 由 WebEnvoy 管理安装、更新与修复</small></span></label><label className={provider === "官方 Chrome" ? "selected" : ""}><input type="radio" name="provider" checked={provider === "官方 Chrome"} onChange={() => setProvider("官方 Chrome")} /><Monitor size={18} /><span><strong>官方 Chrome</strong><small>使用本机安装 · 部分环境能力受限</small></span></label></div></fieldset>
        <fieldset><legend>环境预设</legend><div className="inline-form-grid three"><label>地区<select defaultValue="中国大陆"><option>中国大陆</option><option>美国</option><option>日本</option></select></label><label>语言<select defaultValue="简体中文"><option>简体中文</option><option>English</option></select></label><label>时区<select defaultValue="自动"><option>自动</option><option>Asia/Shanghai</option></select></label></div><button className="inline-link" type="button">展开高级设置</button></fieldset>
        <div className="form-footer"><span>保存后将打开新环境，由你完成首次登录。</span><button className="prototype-button primary" type="submit" disabled={name.trim() === ""}><UserRoundPlus size={14} />创建并登录</button></div>
      </form>
    </div>
  );
}

function ProviderRecovery({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"ready" | "installing" | "complete">("ready");
  useEffect(() => {
    if (phase !== "installing") return;
    const timer = window.setTimeout(() => setPhase("complete"), 1400);
    return () => window.clearTimeout(timer);
  }, [phase]);
  return (
    <div className="prototype-page provider-recovery-page">
      <header className="prototype-page-heading"><div><div className="prototype-eyebrow">Browser · 环境修复</div><h1>{phase === "complete" ? "CloakBrowser 已可用" : "安装 CloakBrowser"}</h1><p>修复完成后会验证版本、完整性和启动能力，再返回原账号。</p></div></header>
      <section className="recovery-focus">
        <span className={`provider-large-icon ${phase}`} >{phase === "complete" ? <Check size={28} /> : phase === "installing" ? <LoaderCircle size={28} /> : <Download size={28} />}</span>
        <div><h2>{phase === "ready" ? "已找到适用于 macOS 的稳定版本" : phase === "installing" ? "正在下载并安装" : "安装与启动验证通过"}</h2><p>{phase === "ready" ? "版本 126.4 · 由 Harbor 管理 · 约 184 MB" : phase === "installing" ? "请保持 WebEnvoy 运行。下载完成后会自动执行完整性检查。" : "4 个受影响的账号身份已恢复为可打开状态。"}</p></div>
        {phase === "ready" ? <button className="prototype-button primary" type="button" onClick={() => setPhase("installing")}><Download size={14} />下载并安装</button> : phase === "complete" ? <button className="prototype-button primary" type="button" onClick={onDone}>返回账号身份</button> : null}
      </section>
      <div className="recovery-steps"><RecoveryStep done={phase !== "ready"} active={phase === "installing"} label="下载" detail="校验官方安装来源" /><RecoveryStep done={phase === "complete"} active={phase === "installing"} label="安装与完整性检查" detail="保留已有账号环境" /><RecoveryStep done={phase === "complete"} active={false} label="启动验证" detail="确认版本和启动能力" /></div>
      <section className="prototype-section affected-identities"><div className="prototype-section-title"><div><h2>受影响的账号身份</h2><p>安装不会读取或迁移账号中的敏感内容。</p></div></div>{["内容研究号", "商品观察号", "品牌发布号", "竞品归档号"].map((name) => <div className="affected-row" key={name}><span className="prototype-account-mark">{name.slice(0, 1)}</span><strong>{name}</strong><span>{phase === "complete" ? "已恢复" : "等待 Provider"}</span></div>)}</section>
    </div>
  );
}

function RecoveryStep({ active, detail, done, label }: { active: boolean; detail: string; done: boolean; label: string }) {
  return <div className={`recovery-step ${active ? "active" : ""} ${done ? "done" : ""}`}><span>{done ? <Check size={14} /> : active ? <LoaderCircle size={14} /> : null}</span><div><strong>{label}</strong><small>{detail}</small></div></div>;
}

function LiveBrowser({ identity, onReturnToTask, onTakeoverCompleted }: { identity: Identity; onReturnToTask: () => void; onTakeoverCompleted: () => void }) {
  const [controlState, setControlState] = useState<"viewing" | "controlling" | "validating" | "complete">("viewing");
  useEffect(() => {
    if (controlState !== "validating") return;
    const timer = window.setTimeout(() => { setControlState("complete"); onTakeoverCompleted(); }, 1100);
    return () => window.clearTimeout(timer);
  }, [controlState, onTakeoverCompleted]);
  return (
    <div className="live-browser-page">
      <div className="live-browser-toolbar"><div><span className="browser-control-dot" /><span className="browser-control-dot" /><span className="browser-control-dot" /></div><div className="browser-address"><KeyRound size={13} />xiaohongshu.com/explore</div><button type="button" aria-label="刷新"><RefreshCw size={14} /></button></div>
      <div className="live-browser-content"><div className="sample-site-sidebar"><strong>小红书</strong><span>首页</span><span className="selected">发现</span><span>消息</span><span>我</span></div><div className="sample-login-surface"><div className="sample-login-complete"><Check size={28} /><h2>登录已完成</h2><p>当前页面显示账号主页，等待 WebEnvoy 校验。</p></div></div></div>
      <div className="takeover-bar"><div><strong>{identity.name}</strong><span>{controlState === "viewing" ? "任务已暂停，当前为只读查看" : controlState === "controlling" ? "你正在控制浏览器" : controlState === "validating" ? "正在校验登录与页面状态" : "校验成功，可以继续任务"}</span></div><div className="section-actions">{controlState === "viewing" ? <button className="prototype-button primary" type="button" onClick={() => setControlState("controlling")}><Monitor size={14} />接管</button> : null}{controlState === "controlling" ? <><button className="prototype-button" type="button"><CircleStop size={14} />无法完成</button><button className="prototype-button primary" type="button" onClick={() => setControlState("validating")}><Check size={14} />已完成，继续</button></> : null}{controlState === "validating" ? <button className="prototype-button" type="button" disabled><LoaderCircle size={14} />正在校验</button> : null}{controlState === "complete" ? <button className="prototype-button primary" type="button" onClick={onReturnToTask}><RotateCcw size={14} />返回任务</button> : null}</div></div>
    </div>
  );
}
