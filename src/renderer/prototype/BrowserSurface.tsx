import {
  BriefcaseBusiness,
  Check,
  CircleAlert,
  Download,
  Import,
  Images,
  KeyRound,
  LoaderCircle,
  Monitor,
  MessageCircle,
  Music2,
  Pencil,
  Play,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  UserRoundPlus,
} from "lucide-react";
import { useEffect, useState } from "react";

import type { Identity, ProxyProfile } from "./prototypeData";

type BrowserMode = "detail" | "create" | "repair" | "edit" | "dependencies";

type BrowserSurfaceProps = {
  cloakProviderInstalled: boolean;
  identities: Identity[];
  identity: Identity;
  initialIdentitySite: string;
  mode: BrowserMode;
  proxies: ProxyProfile[];
  onCreate: (identity: Identity) => void;
  onDeleteIdentity: (identityId: string) => void;
  onManageProxies: () => void;
  onModeChange: (mode: BrowserMode) => void;
  onOpenInstance: (identityId: string) => void;
  onProviderRepaired: () => void;
  onUpdateIdentity: (identity: Identity) => void;
  onUseSkill: () => void;
};

export function BrowserSurface({
  cloakProviderInstalled,
  identities,
  identity,
  initialIdentitySite,
  mode,
  proxies,
  onCreate,
  onDeleteIdentity,
  onManageProxies,
  onModeChange,
  onOpenInstance,
  onProviderRepaired,
  onUpdateIdentity,
  onUseSkill,
}: BrowserSurfaceProps) {
  if (mode === "create") return <CreateIdentity cloakProviderInstalled={cloakProviderInstalled} initialSite={initialIdentitySite} proxies={proxies} onCreate={onCreate} onManageProxies={onManageProxies} />;
  if (mode === "repair") {
    return <ProviderRecovery onDone={() => { onProviderRepaired(); onModeChange("dependencies"); }} />;
  }
  if (mode === "edit") {
    return <EditIdentity cloakProviderInstalled={cloakProviderInstalled} identity={identity} proxies={proxies} onDelete={onDeleteIdentity} onManageProxies={onManageProxies} onSave={onUpdateIdentity} />;
  }
  if (mode === "dependencies") {
    return <EnvironmentDependencies cloakProviderInstalled={cloakProviderInstalled} identities={identities} onModeChange={onModeChange} />;
  }
  return <IdentityDetail identity={identity} onModeChange={onModeChange} onOpenInstance={onOpenInstance} onUseSkill={onUseSkill} />;
}

function IdentitySectionTabs({ active, onModeChange }: { active: "identities" | "dependencies"; onModeChange: (mode: BrowserMode) => void }) {
  return (
    <nav className="identity-section-tabs" aria-label="账号身份管理">
      <button className={active === "identities" ? "selected" : ""} type="button" onClick={() => onModeChange("detail")}>账号身份</button>
      <button className={active === "dependencies" ? "selected" : ""} type="button" onClick={() => onModeChange("dependencies")}>环境依赖</button>
    </nav>
  );
}

function IdentityDetail({ identity, onModeChange, onOpenInstance, onUseSkill }: { identity: Identity; onModeChange: (mode: BrowserMode) => void; onOpenInstance: (identityId: string) => void; onUseSkill: () => void }) {
  const unavailable = identity.state === "repair";
  const running = identity.sessionState === "running";
  const sessionFailed = identity.sessionState === "failed";
  const canCreateTask = !unavailable && !sessionFailed && identity.loginState === "logged-in";
  const loginLabel = identity.loginState === "logged-in" ? "已登录" : identity.loginState === "login-required" ? "需要登录" : "登录状态未知";
  const loginNote = identity.loginState === "logged-in" ? "14:31 确认" : identity.loginState === "login-required" ? "登录已失效" : unavailable ? "待 Provider 恢复后确认" : "等待登录确认";
  return (
    <div className="prototype-page identity-detail-page">
      <IdentitySectionTabs active="identities" onModeChange={onModeChange} />
      <header className="prototype-page-heading identity-heading">
        <div className="identity-title-group">
            <span className="identity-site-mark"><SiteGlyph site={identity.site} /></span>
            <span className="identity-avatar">{identity.accountAvatar ?? identity.account.slice(0, 1)}</span>
            <div>
              <div className="prototype-eyebrow">{identity.site}</div>
              <h1>{identity.account}</h1>
              <p>{identity.name} · {identity.platformId ?? "平台 ID 待同步"}</p>
          </div>
        </div>
        <div className="identity-heading-actions">
          <button className="prototype-button" type="button" onClick={() => onModeChange("edit")}><Pencil size={14} />编辑身份</button>
          <span className={`prototype-state-chip ${identity.state}`}>{identity.state === "available" || running ? <Check size={13} /> : <CircleAlert size={13} />}{identity.stateLabel}</span>
        </div>
      </header>

      <section className="identity-status-line" aria-label="账号身份状态">
        <span className={identity.loginState === "logged-in" ? "ready" : "needs-action"}>{identity.loginState === "logged-in" ? <Check size={13} /> : <CircleAlert size={13} />}<strong>{loginLabel}</strong><small>{loginNote}</small></span>
        <span className={unavailable ? "needs-action" : "ready"}><ShieldCheck size={13} /><strong>{unavailable ? "Provider 未安装" : "环境可用"}</strong><small>{identity.provider}</small></span>
        <span className={sessionFailed ? "needs-action" : running ? "running" : "neutral"}><Monitor size={13} /><strong>{sessionFailed ? "实例启动失败" : running ? "实例运行中" : "实例空闲"}</strong><small>{identity.currentPage ?? "未打开"}</small></span>
        <span className={identity.controller === "任务占用" ? "running" : "neutral"}><KeyRound size={13} /><strong>控制者</strong><small>{identity.controller ?? "空闲"}</small></span>
      </section>

      <section className="identity-instance-section">
        <div className="identity-instance-copy">
          <span className="identity-instance-icon"><Monitor size={19} /></span>
          <div>
            <h2>{unavailable ? "浏览器当前不可用" : sessionFailed ? "浏览器实例启动失败" : running ? "浏览器实例正在运行" : identity.loginState === "login-required" ? "登录需要恢复" : "浏览器环境已就绪"}</h2>
            <p>{identity.provider} · {identity.currentPage ?? identity.detail} · {running ? "最近正常" : "实例健康"}：{identity.lastHealthyAt ?? "尚未启动"}</p>
          </div>
        </div>
        <div className="section-actions">
          <button className="prototype-button primary" type="button" disabled={unavailable} onClick={() => onOpenInstance(identity.id)}><Monitor size={14} />{running ? "聚焦浏览器" : sessionFailed ? "重试启动" : identity.loginState === "login-required" || identity.loginState === "unknown" ? "打开浏览器并登录" : "启动浏览器"}</button>
          <button className="prototype-button" type="button" disabled={!canCreateTask} onClick={onUseSkill}><Play size={14} />创建任务</button>
        </div>
      </section>

      <div className="identity-management-grid">
        <section className="prototype-section identity-facts-section">
          <div className="prototype-section-title"><div><h2>站点账号</h2><p>登录校验后从目标站点同步，只读展示</p></div></div>
          <div className="site-account-profile"><span className="identity-avatar account-avatar">{identity.accountAvatar ?? identity.account.slice(0, 1)}</span><div><strong>{identity.account}</strong><span>{identity.platformId ?? "平台 ID 待登录后同步"}</span></div><span className={`prototype-state-chip ${identity.loginState === "logged-in" ? "available" : "login"}`}>{identity.loginState === "logged-in" ? <Check size={13} /> : <CircleAlert size={13} />}{loginLabel}</span></div>
          <dl className="prototype-detail-list">
            <div><dt>目标站点</dt><dd>{identity.site}</dd></div>
            <div><dt>平台 ID</dt><dd>{identity.platformId ?? "待同步"}</dd></div>
            <div><dt>本地名称</dt><dd>{identity.name}</dd></div>
            <div><dt>标签</dt><dd>{(identity.tags ?? [identity.site, identity.account]).join(" · ")}</dd></div>
          </dl>
        </section>
        <section className="prototype-section identity-facts-section">
          <div className="prototype-section-title"><div><h2>环境配置</h2><p>Provider、代理、地区与浏览器参数</p></div></div>
          <dl className="prototype-detail-list">
            <div><dt>Provider</dt><dd>{identity.provider}</dd></div>
            <div><dt>地区与语言</dt><dd>{identity.region ?? "跟随 IP"} · {identity.language ?? "跟随 IP"} · {identity.timezone ?? "跟随 IP"}</dd></div>
            <div><dt>代理</dt><dd>{identity.proxy ?? "团队推荐线路"} · 可用</dd></div>
            <div><dt>启动页面</dt><dd>{identity.startPage ?? "站点首页"}</dd></div>
          </dl>
          <details className="identity-profile-details"><summary>浏览器配置详情</summary><dl className="prototype-detail-list"><div><dt>Profile</dt><dd>{identity.id}</dd></div><div><dt>指纹摘要</dt><dd>{identity.fingerprint ?? "Provider 默认指纹"}</dd></div><div><dt>User agent</dt><dd>{identity.userAgent ?? "跟随 Provider 稳定版本"}</dd></div><div><dt>屏幕</dt><dd>{identity.screen ?? "跟随本机显示器"}</dd></div><div><dt>当前页面</dt><dd>{identity.currentPage ?? "未打开"}</dd></div><div><dt>最近正常</dt><dd>{identity.lastHealthyAt ?? "尚未验证"}</dd></div><div><dt>存储</dt><dd>本机持久环境 · 已隔离</dd></div></dl></details>
        </section>
      </div>
    </div>
  );
}

function EditIdentity({ cloakProviderInstalled, identity, proxies, onDelete, onManageProxies, onSave }: { cloakProviderInstalled: boolean; identity: Identity; proxies: ProxyProfile[]; onDelete: (identityId: string) => void; onManageProxies: () => void; onSave: (identity: Identity) => void }) {
  const [name, setName] = useState(identity.name);
  const [provider, setProvider] = useState(identity.provider);
  const [region, setRegion] = useState(identity.region ?? "中国大陆");
  const [language, setLanguage] = useState(identity.language ?? "简体中文");
  const [timezone, setTimezone] = useState(identity.timezone ?? "跟随 IP");
  const [proxy, setProxy] = useState(identity.proxy ?? "团队推荐线路");
  const [startPage, setStartPage] = useState(identity.startPage ?? defaultStartPage(identity.site));
  const [tags, setTags] = useState((identity.tags ?? []).join("，"));
  const [pathOpened, setPathOpened] = useState(false);

  function saveChanges() {
    const providerUnavailable = provider === "CloakBrowser" && !cloakProviderInstalled;
    const providerChanged = provider !== identity.provider;
    const providerRecovered = identity.state === "repair" && !providerUnavailable;
    const loginConfirmed = identity.loginState === "logged-in" && !providerChanged;
    const providerReset = providerChanged || providerRecovered;
    onSave({
      ...identity,
      name,
      provider,
      region,
      language,
      timezone,
      proxy,
      startPage,
      tags: tags.split(/[，,]/).map((tag) => tag.trim()).filter(Boolean),
      state: providerUnavailable ? "repair" : providerReset ? loginConfirmed ? "available" : "login" : identity.state,
      stateLabel: providerUnavailable ? "需要修复" : providerReset ? loginConfirmed ? "可用" : "需要登录" : identity.stateLabel,
      loginState: providerChanged ? "unknown" : identity.loginState,
      sessionState: providerUnavailable ? "failed" : providerReset ? "idle" : identity.sessionState,
      controller: providerReset ? "空闲" : identity.controller,
      currentPage: providerChanged ? undefined : identity.currentPage,
      fingerprint: providerChanged ? "待首次启动生成" : identity.fingerprint,
      userAgent: providerChanged ? "待首次启动确认" : identity.userAgent,
      lastHealthyAt: providerReset ? "尚未启动" : identity.lastHealthyAt,
      detail: providerUnavailable ? "CloakBrowser 未安装" : providerReset ? loginConfirmed ? "空闲 · Provider 启动验证通过" : "Provider 已验证 · 等待登录确认" : identity.detail,
    });
  }

  return (
    <div className="prototype-page edit-identity-page">
      <header className="prototype-page-heading"><div><div className="prototype-eyebrow">账号身份</div><h1>编辑 {identity.account}</h1><p>在一个页面统一管理站点账号信息和持久浏览器环境。</p></div></header>
      <form className="prototype-form identity-form" onSubmit={(event) => { event.preventDefault(); saveChanges(); }}>
        <fieldset><legend>站点账号</legend><div className="site-account-profile editable-account-profile"><span className="identity-avatar account-avatar">{identity.accountAvatar ?? identity.account.slice(0, 1)}</span><div><strong>{identity.account}</strong><span>{identity.site} · {identity.platformId ?? "平台 ID 待同步"}</span></div><span className={`prototype-state-chip ${identity.loginState === "logged-in" ? "available" : "login"}`}>{identity.loginState === "logged-in" ? "已登录" : "待登录"}</span></div><p className="muted-copy">昵称、头像、平台 ID 和登录状态由登录校验同步，不能在本地修改。</p><div className="inline-form-grid"><label>本地身份名称<input required value={name} onChange={(event) => setName(event.target.value)} /></label><label>标签<input value={tags} placeholder="内容运营，品牌号" onChange={(event) => setTags(event.target.value)} /></label></div></fieldset>
        <fieldset><legend>浏览器环境</legend><label>Provider<select value={provider} onChange={(event) => setProvider(event.target.value)}><option value="CloakBrowser" disabled={!cloakProviderInstalled}>CloakBrowser{cloakProviderInstalled ? "" : "（未安装）"}</option><option value="官方 Chrome">官方 Chrome</option></select></label><div className="inline-form-grid three"><label>地区<select value={region} onChange={(event) => setRegion(event.target.value)}><option>跟随 IP</option><option>跟随本机</option><option>中国大陆</option><option>美国</option><option>日本</option></select></label><label>语言<select value={language} onChange={(event) => setLanguage(event.target.value)}><option>跟随 IP</option><option>跟随本机</option><option>简体中文</option><option>English</option></select></label><label>时区<select value={timezone} onChange={(event) => setTimezone(event.target.value)}><option>跟随 IP</option><option>跟随本机</option><option>Asia/Shanghai</option><option>America/Los_Angeles</option></select></label></div><div className="inline-form-grid"><label>代理<select value={proxy} onChange={(event) => setProxy(event.target.value)}>{proxyOptions(proxies)}<option>不使用代理</option></select><button className="inline-link field-link" type="button" onClick={onManageProxies}>新增或管理代理</button></label><label>启动页面<input type="url" value={startPage} onChange={(event) => setStartPage(event.target.value)} /></label></div></fieldset>
        <fieldset><legend>本机环境</legend><div className="environment-path-row"><span><strong>数据目录</strong><small>~/Library/Application Support/WebEnvoy/profiles/{identity.id}</small></span><button className="prototype-button" type="button" onClick={() => setPathOpened(true)}>{pathOpened ? "已在访达中显示" : "在访达中显示"}</button></div><p className="muted-copy">删除身份、清理本机环境等操作集中在这里管理。</p></fieldset>
        <div className="form-footer"><button className="prototype-button danger" type="button" onClick={() => onDelete(identity.id)}>删除账号身份</button><button className="prototype-button primary" type="submit">保存更改</button></div>
      </form>
    </div>
  );
}

function EnvironmentDependencies({ cloakProviderInstalled, identities, onModeChange }: { cloakProviderInstalled: boolean; identities: Identity[]; onModeChange: (mode: BrowserMode) => void }) {
  const cloakDependents = identities.filter((identity) => identity.provider === "CloakBrowser").length;
  const cloakNeedsRepair = !cloakProviderInstalled;
  const [lastChecked, setLastChecked] = useState<"cloak" | "chrome" | null>(null);
  return (
    <div className="prototype-page environment-dependencies-page">
      <IdentitySectionTabs active="dependencies" onModeChange={onModeChange} />
      <header className="prototype-page-heading"><div><div className="prototype-eyebrow">账号身份</div><h1>环境依赖</h1><p>集中检测、安装、更新和修复本机浏览器 Provider。</p></div></header>
      <div className="provider-dependency-list">
        <section className={`provider-dependency-row ${cloakNeedsRepair ? "needs-action" : ""}`}><span className="provider-dependency-icon"><ShieldCheck size={20} /></span><div><h2>CloakBrowser</h2><p>{cloakNeedsRepair ? "未安装" : "版本 126.4 · 启动验证通过"} · {cloakDependents} 个账号身份使用</p><small>{lastChecked === "cloak" ? "刚刚完成检测" : "首次使用时从 CloakBrowser 官方渠道下载，不随 App 分发"}</small></div><span className={`prototype-state-chip ${cloakNeedsRepair ? "repair" : "available"}`}>{cloakNeedsRepair ? <CircleAlert size={13} /> : <Check size={13} />}{cloakNeedsRepair ? "需要安装" : "可用"}</span><button className={`prototype-button ${cloakNeedsRepair ? "primary" : ""}`} type="button" onClick={() => cloakNeedsRepair ? onModeChange("repair") : setLastChecked("cloak")}>{cloakNeedsRepair ? <Download size={14} /> : <RefreshCw size={14} />}{cloakNeedsRepair ? "从官方渠道安装" : lastChecked === "cloak" ? "检测完成" : "重新检测"}</button></section>
        <section className="provider-dependency-row"><span className="provider-dependency-icon"><Monitor size={20} /></span><div><h2>官方 Chrome</h2><p>版本 126.0.6478.127 · 启动验证通过</p><small>{lastChecked === "chrome" ? "刚刚完成检测" : "/Applications/Google Chrome.app"}</small></div><span className="prototype-state-chip available"><Check size={13} />可用</span><button className="prototype-button" type="button" onClick={() => setLastChecked("chrome")}><RefreshCw size={14} />{lastChecked === "chrome" ? "检测完成" : "重新检测"}</button></section>
      </div>
      <section className="prototype-section dependency-preferences"><h2>安装与更新</h2><label><input type="checkbox" defaultChecked /> 自动下载 CloakBrowser 安全更新</label><label><input type="checkbox" defaultChecked /> Provider 不可用时通知我</label></section>
    </div>
  );
}

function CreateIdentity({ cloakProviderInstalled, initialSite, proxies, onCreate, onManageProxies }: { cloakProviderInstalled: boolean; initialSite: string; proxies: ProxyProfile[]; onCreate: (identity: Identity) => void; onManageProxies: () => void }) {
  const [name, setName] = useState("");
  const [site, setSite] = useState(initialSite);
  const [provider, setProvider] = useState(cloakProviderInstalled ? "CloakBrowser" : "官方 Chrome");
  const [region, setRegion] = useState("中国大陆");
  const [language, setLanguage] = useState("简体中文");
  const [timezone, setTimezone] = useState("跟随 IP");
  const [proxy, setProxy] = useState("团队推荐线路");
  return (
    <div className="prototype-page create-identity-page">
      <header className="prototype-page-heading"><div><div className="prototype-eyebrow">账号身份</div><h1>创建账号身份</h1><p>为一个站点账号创建独立、持久的浏览器环境。</p></div><button className="prototype-button" type="button"><Import size={14} />从已有环境导入</button></header>
      <form className="prototype-form identity-form" onSubmit={(event) => { event.preventDefault(); onCreate({ id: `identity-${Date.now()}`, name, site, account: "待登录同步", accountAvatar: "?", provider, region, language, timezone, proxy, startPage: defaultStartPage(site), tags: [site], fingerprint: provider === "CloakBrowser" ? "独立种子 · WebGL/Canvas 隔离" : "Chrome 默认指纹", userAgent: "跟随 Provider 稳定版本", screen: "跟随本机显示器", loginState: "login-required", sessionState: "idle", controller: "空闲", lastHealthyAt: "刚刚创建", state: "login", stateLabel: "需要登录", detail: "环境已创建 · 等待首次登录" }); }}>
        <fieldset><legend>账号身份</legend><div className="inline-form-grid"><label>本地身份名称<input required value={name} placeholder="例如：小红书品牌号" onChange={(event) => setName(event.target.value)} /></label><label>目标站点<select value={site} onChange={(event) => setSite(event.target.value)}><option>小红书</option><option>微信公众号</option><option>抖音</option><option>淘宝</option></select></label></div><p className="muted-copy">创建环境并完成首次登录后，App 会同步账号头像、昵称、平台 ID 和登录状态。</p></fieldset>
        <fieldset><legend>浏览器 Provider</legend><div className="provider-choice-list"><label className={provider === "CloakBrowser" ? "selected" : ""}><input type="radio" name="provider" disabled={!cloakProviderInstalled} checked={provider === "CloakBrowser"} onChange={() => setProvider("CloakBrowser")} /><ShieldCheck size={18} /><span><strong>CloakBrowser</strong><small>{cloakProviderInstalled ? "独立进程运行 · 由 App 启动和管理" : "尚未安装 · 首次使用从官方渠道下载"}</small></span></label><label className={provider === "官方 Chrome" ? "selected" : ""}><input type="radio" name="provider" checked={provider === "官方 Chrome"} onChange={() => setProvider("官方 Chrome")} /><Monitor size={18} /><span><strong>官方 Chrome</strong><small>使用本机安装 · 部分环境能力受限</small></span></label></div></fieldset>
        <fieldset><legend>环境预设</legend><div className="inline-form-grid three"><label>地区<select value={region} onChange={(event) => setRegion(event.target.value)}><option>跟随 IP</option><option>跟随本机</option><option>中国大陆</option><option>美国</option><option>日本</option></select></label><label>语言<select value={language} onChange={(event) => setLanguage(event.target.value)}><option>跟随 IP</option><option>跟随本机</option><option>简体中文</option><option>English</option></select></label><label>时区<select value={timezone} onChange={(event) => setTimezone(event.target.value)}><option>跟随 IP</option><option>跟随本机</option><option>Asia/Shanghai</option><option>America/Los_Angeles</option></select></label></div><label>代理<select value={proxy} onChange={(event) => setProxy(event.target.value)}>{proxyOptions(proxies)}<option>不使用代理</option></select><button className="inline-link field-link" type="button" onClick={onManageProxies}>新增或管理代理</button></label></fieldset>
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
      <header className="prototype-page-heading"><div><div className="prototype-eyebrow">环境依赖</div><h1>{phase === "complete" ? "CloakBrowser 已可用" : "安装 CloakBrowser"}</h1><p>App 只获取官方安装器，浏览器二进制由 CloakBrowser 官方服务器提供。</p></div></header>
      <section className="recovery-focus"><span className={`provider-large-icon ${phase}`}>{phase === "complete" ? <Check size={28} /> : phase === "installing" ? <LoaderCircle size={28} /> : <Download size={28} />}</span><div><h2>{phase === "ready" ? "已找到适用于 macOS 的官方安装器" : phase === "installing" ? "正在从官方渠道下载并安装" : "安装与启动验证通过"}</h2><p>{phase === "ready" ? "浏览器二进制不会打包在 WebEnvoy App 中" : phase === "installing" ? "下载完成后会自动执行完整性检查。" : "浏览器将在独立进程中运行，由 App 启动和管理。"}</p></div>{phase === "ready" ? <button className="prototype-button primary" type="button" onClick={() => setPhase("installing")}><Download size={14} />从官方渠道安装</button> : phase === "complete" ? <button className="prototype-button primary" type="button" onClick={onDone}>返回环境依赖</button> : null}</section>
      <div className="recovery-steps"><RecoveryStep done={phase !== "ready"} active={phase === "installing"} label="获取官方安装器" detail="确认来源与版本" /><RecoveryStep done={phase === "complete"} active={phase === "installing"} label="下载浏览器并安装" detail="保留已有账号环境" /><RecoveryStep done={phase === "complete"} active={false} label="启动验证" detail="确认独立进程可启动" /></div>
    </div>
  );
}

function RecoveryStep({ active, detail, done, label }: { active: boolean; detail: string; done: boolean; label: string }) {
  return <div className={`recovery-step ${active ? "active" : ""} ${done ? "done" : ""}`}><span>{done ? <Check size={14} /> : active ? <LoaderCircle size={14} /> : null}</span><div><strong>{label}</strong><small>{detail}</small></div></div>;
}

function defaultStartPage(site: string) {
  if (site === "小红书") return "https://www.xiaohongshu.com/explore";
  if (site === "微信公众号") return "https://mp.weixin.qq.com/";
  if (site === "抖音") return "https://www.douyin.com/";
  if (site === "淘宝") return "https://www.taobao.com/";
  return "https://example.com/";
}

function proxyOptions(proxies: ProxyProfile[]) {
  return proxies.map((proxy) => <option value={proxy.name} key={proxy.id}>{proxy.name}{proxy.state === "可用" ? "" : `（${proxy.state}）`}</option>);
}

function SiteGlyph({ site }: { site: string }) {
  if (site === "小红书") return <Images size={15} />;
  if (site === "微信公众号") return <MessageCircle size={15} />;
  if (site === "抖音") return <Music2 size={15} />;
  if (site === "淘宝") return <ShoppingBag size={15} />;
  return <BriefcaseBusiness size={15} />;
}
