import {
  Check,
  CircleAlert,
  Dices,
  Download,
  Import,
  KeyRound,
  LoaderCircle,
  Monitor,
  Pencil,
  Play,
  RefreshCw,
  ShieldCheck,
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
  const loginReady = identity.loginState === "logged-in" || identity.loginState === "not-required";
  const canCreateTask = !unavailable && !sessionFailed && loginReady;
  const loginLabel = identity.loginState === "logged-in" ? "已登录" : identity.loginState === "not-required" ? "无需登录" : identity.loginState === "login-required" ? "需要登录" : "登录状态未知";
  const loginNote = identity.loginState === "logged-in" ? "14:31 确认" : identity.loginState === "not-required" ? "可直接使用" : identity.loginState === "login-required" ? "等待登录确认" : unavailable ? "待 Provider 恢复后确认" : "等待登录确认";
  return (
    <div className="prototype-page identity-detail-page">
      <IdentitySectionTabs active="identities" onModeChange={onModeChange} />
      <header className="prototype-page-heading identity-heading">
        <div className="identity-title-group">
            <span className="identity-avatar">{identity.accountAvatar ?? identity.account.slice(0, 1)}</span>
            <div>
              <div className="prototype-eyebrow">{identity.site}</div>
              <h1>{identity.account}</h1>
              <p>{identity.name} · {identity.loginState === "not-required" ? "无需登录" : identity.platformId ?? "平台 ID 待同步"}</p>
          </div>
        </div>
        <div className="identity-heading-actions">
          <button className="prototype-button" type="button" onClick={() => onModeChange("edit")}><Pencil size={14} />编辑身份</button>
        </div>
      </header>

      <section className="identity-status-line" aria-label="账号身份状态">
        <span className={loginReady ? "ready" : "needs-action"}>{loginReady ? <Check size={13} /> : <CircleAlert size={13} />}<strong>{loginLabel}</strong><small>{loginNote}</small></span>
        <span className={unavailable ? "needs-action" : "ready"}><ShieldCheck size={13} /><strong>{unavailable ? "Provider 未安装" : "环境可用"}</strong></span>
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

        <section className="prototype-section identity-environment-section">
          <div className="prototype-section-title"><div><h2>环境配置</h2><p>Provider、代理、地区与浏览器参数</p></div></div>
          <dl className="prototype-detail-list">
            <div><dt>Provider</dt><dd>{identity.provider}</dd></div>
            <div><dt>地区与语言</dt><dd>{identity.region ?? "跟随 IP"} · {identity.language ?? "跟随 IP"} · {identity.timezone ?? "跟随 IP"}</dd></div>
            <div><dt>代理</dt><dd>{identity.proxy ?? "团队推荐线路"} · 可用</dd></div>
            <div><dt>启动页面</dt><dd>{identity.startPage ?? "站点首页"}</dd></div>
          </dl>
          <details className="identity-profile-details"><summary>浏览器配置详情</summary><dl className="prototype-detail-list"><div><dt>平台</dt><dd>{identity.platform ?? "跟随 Provider"}</dd></div><div><dt>指纹摘要</dt><dd>{identity.fingerprint ?? "Provider 默认指纹"}</dd></div><div><dt>User agent</dt><dd>{identity.userAgent ?? "跟随 Provider 稳定版本"}</dd></div><div><dt>屏幕</dt><dd>{identity.screen ?? "跟随本机显示器"}</dd></div><div><dt>硬件并发</dt><dd>{identity.hardwareConcurrency ?? "Provider 推荐"}</dd></div><div><dt>GPU</dt><dd>{identity.gpuPreset ?? "Provider 推荐"}</dd></div><div><dt>操作速度</dt><dd>{normalizeInteractionPreset(identity.interactionPreset)}</dd></div><div><dt>当前页面</dt><dd>{identity.currentPage ?? "未打开"}</dd></div><div><dt>最近正常</dt><dd>{identity.lastHealthyAt ?? "尚未验证"}</dd></div><div><dt>存储</dt><dd>本机持久环境 · 已隔离</dd></div></dl></details>
        </section>
    </div>
  );
}

function EditIdentity({ cloakProviderInstalled, identity, proxies, onDelete, onManageProxies, onSave }: { cloakProviderInstalled: boolean; identity: Identity; proxies: ProxyProfile[]; onDelete: (identityId: string) => void; onManageProxies: () => void; onSave: (identity: Identity) => void }) {
  const [name, setName] = useState(identity.name);
  const [provider, setProvider] = useState(identity.provider);
  const [profile, setProfile] = useState<ProfilePreset>(() => profileFromIdentity(identity));
  const [region, setRegion] = useState(identity.region ?? "中国大陆");
  const [language, setLanguage] = useState(identity.language ?? "简体中文");
  const [timezone, setTimezone] = useState(identity.timezone ?? "跟随 IP");
  const [proxy, setProxy] = useState(identity.proxy ?? "团队推荐线路");
  const [startPage, setStartPage] = useState(identity.startPage ?? defaultStartPage(identity.site));
  const [tags, setTags] = useState((identity.tags ?? []).join("，"));
  const [interactionPreset, setInteractionPreset] = useState(normalizeInteractionPreset(identity.interactionPreset));
  const [fingerprintSeed, setFingerprintSeed] = useState(identity.fingerprintSeed ?? createFingerprintSeed());
  const [randomized, setRandomized] = useState(false);
  const [pathOpened, setPathOpened] = useState(false);

  function randomizeProfile() {
    setProfile(randomProfileAlternative(profile));
    setFingerprintSeed(createFingerprintSeed());
    setRandomized(true);
  }

  function saveChanges() {
    const providerUnavailable = provider === "CloakBrowser" && !cloakProviderInstalled;
    const providerChanged = provider !== identity.provider;
    const providerRecovered = identity.state === "repair" && !providerUnavailable;
    const loginConfirmed = (identity.loginState === "logged-in" || identity.loginState === "not-required") && !providerChanged;
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
      platform: profile.platform,
      screen: profile.screen,
      hardwareConcurrency: profile.hardwareConcurrency,
      gpuPreset: profile.gpuPreset,
      interactionPreset,
      fingerprintSeed,
      tags: tags.split(/[，,]/).map((tag) => tag.trim()).filter(Boolean),
      state: providerUnavailable ? "repair" : providerReset ? loginConfirmed ? "available" : "login" : identity.state,
      stateLabel: providerUnavailable ? "需要修复" : providerReset ? loginConfirmed ? "可用" : "需要登录" : identity.stateLabel,
      loginState: providerChanged && identity.loginState !== "not-required" ? "unknown" : identity.loginState,
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
        <fieldset><legend>{identity.loginState === "not-required" ? "浏览器身份" : "站点账号"}</legend><div className="site-account-profile editable-account-profile"><span className="identity-avatar account-avatar">{identity.accountAvatar ?? identity.account.slice(0, 1)}</span><div><strong>{identity.account}</strong><span>{identity.site} · {identity.loginState === "not-required" ? "无需登录" : identity.platformId ?? "平台 ID 待同步"}</span></div><span className={`prototype-state-chip ${identity.loginState === "logged-in" || identity.loginState === "not-required" ? "available" : "login"}`}>{identity.loginState === "logged-in" ? "已登录" : identity.loginState === "not-required" ? "无需登录" : "待登录"}</span></div><p className="muted-copy">{identity.loginState === "not-required" ? "这个环境不预置站点登录状态；以后仍可在浏览器中人工登录。" : "昵称、头像、平台 ID 和登录状态由登录校验同步，不能在本地修改。"}</p><div className="inline-form-grid"><label>本地身份名称<input required value={name} onChange={(event) => setName(event.target.value)} /></label><label>标签<input value={tags} placeholder="内容运营，品牌号" onChange={(event) => setTags(event.target.value)} /></label></div></fieldset>
        <fieldset><legend>登录目标</legend><label>目标网站 URL<input type="url" value={startPage} onChange={(event) => setStartPage(event.target.value)} /></label></fieldset>
        <fieldset><legend>浏览器 Provider</legend><ProviderChoices cloakProviderInstalled={cloakProviderInstalled} provider={provider} onChange={setProvider} /></fieldset>
        <ProfileEnvironmentFields profile={profile} proxy={proxy} proxies={proxies} region={region} language={language} timezone={timezone} interactionPreset={interactionPreset} fingerprintSeed={fingerprintSeed} randomized={randomized} onManageProxies={onManageProxies} onProfileChange={setProfile} onProxyChange={setProxy} onRegionChange={setRegion} onLanguageChange={setLanguage} onTimezoneChange={setTimezone} onInteractionPresetChange={setInteractionPreset} onFingerprintSeedChange={setFingerprintSeed} onRandomize={randomizeProfile} />
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

type LoginRequirement = "required" | "not-required";
type ProfilePreset = { platform: NonNullable<Identity["platform"]>; screen: string; hardwareConcurrency: string; gpuPreset: string };

const profilePresets: ProfilePreset[] = [
  { platform: "Windows", screen: "1920 × 1080", hardwareConcurrency: "8 核", gpuPreset: "NVIDIA · 主流桌面" },
  { platform: "macOS", screen: "1440 × 900", hardwareConcurrency: "8 核", gpuPreset: "Apple · 集成图形" },
  { platform: "Linux", screen: "1920 × 1080", hardwareConcurrency: "4 核", gpuPreset: "Intel · 集成图形" },
];

function CreateIdentity({ cloakProviderInstalled, initialSite, proxies, onCreate, onManageProxies }: { cloakProviderInstalled: boolean; initialSite: string; proxies: ProxyProfile[]; onCreate: (identity: Identity) => void; onManageProxies: () => void }) {
  const [loginRequirement, setLoginRequirement] = useState<LoginRequirement>("required");
  const [name, setName] = useState("");
  const [loginUrl, setLoginUrl] = useState(defaultStartPage(initialSite));
  const [provider, setProvider] = useState(cloakProviderInstalled ? "CloakBrowser" : "官方 Chrome");
  const [profile, setProfile] = useState<ProfilePreset>(profilePresets[0]);
  const [region, setRegion] = useState("跟随 IP");
  const [language, setLanguage] = useState("跟随 IP");
  const [timezone, setTimezone] = useState("跟随 IP");
  const [proxy, setProxy] = useState("团队推荐线路");
  const [interactionPreset, setInteractionPreset] = useState("正常速度");
  const [fingerprintSeed, setFingerprintSeed] = useState(createFingerprintSeed);
  const [randomized, setRandomized] = useState(false);
  const site = loginRequirement === "required" ? siteFromUrl(loginUrl, initialSite) : initialSite;
  const urlValid = loginRequirement === "not-required" || isHttpUrl(loginUrl);
  const canCreate = loginRequirement === "required" ? urlValid : name.trim() !== "";

  function randomizeProfile() {
    setProfile(randomProfileAlternative(profile));
    setFingerprintSeed(createFingerprintSeed());
    setRandomized(true);
  }

  function submitIdentity() {
    const requiresLogin = loginRequirement === "required";
    const identityName = requiresLogin ? `${site}登录身份` : name.trim();
    onCreate({
      id: `identity-${Date.now()}`, name: identityName, site, account: requiresLogin ? "等待登录同步" : identityName,
      accountAvatar: requiresLogin ? "?" : identityName.slice(0, 1), provider, region, language, timezone, proxy,
      startPage: requiresLogin ? loginUrl : defaultStartPage(site), tags: [site], platform: profile.platform,
      fingerprintSeed, fingerprint: provider === "CloakBrowser" ? `独立种子 · ${profile.gpuPreset}` : "Chrome 默认指纹",
      userAgent: `按 ${profile.platform} 预设生成`, screen: profile.screen, hardwareConcurrency: profile.hardwareConcurrency,
      gpuPreset: profile.gpuPreset, interactionPreset, loginState: requiresLogin ? "login-required" : "not-required",
      sessionState: requiresLogin ? "running" : "idle", controller: requiresLogin ? "用户控制" : "空闲",
      currentPage: requiresLogin ? loginUrl : undefined, lastHealthyAt: "刚刚创建",
      state: requiresLogin ? "running" : "available", stateLabel: requiresLogin ? "等待登录" : "可用",
      detail: requiresLogin ? "浏览器已打开 · 等待完成登录" : "环境已创建 · 无需预置登录",
    });
  }

  return (
    <div className="prototype-page create-identity-page">
      <header className="prototype-page-heading"><div><div className="prototype-eyebrow">账号身份</div><h1>创建账号身份</h1><p>创建一个独立、持久的浏览器环境；需要时再关联站点账号。</p></div><button className="prototype-button" type="button"><Import size={14} />从已有环境导入</button></header>
      <form className="prototype-form identity-form" onSubmit={(event) => { event.preventDefault(); submitIdentity(); }}>
        <fieldset><legend>使用方式</legend><div className="identity-login-choice"><button className={loginRequirement === "required" ? "selected" : ""} type="button" onClick={() => setLoginRequirement("required")}><KeyRound size={17} /><span><strong>需要账号登录</strong><small>打开目标网址，登录后同步账号信息</small></span></button><button className={loginRequirement === "not-required" ? "selected" : ""} type="button" onClick={() => setLoginRequirement("not-required")}><Monitor size={17} /><span><strong>无需账号登录</strong><small>创建一个不预置登录状态的浏览器身份</small></span></button></div></fieldset>
        <fieldset><legend>{loginRequirement === "required" ? "登录目标" : "身份名称"}</legend>{loginRequirement === "required" ? <><label>目标网站 URL<input required type="url" value={loginUrl} placeholder="https://www.example.com/login" onChange={(event) => setLoginUrl(event.target.value)} /></label><p className={`identity-url-status ${urlValid ? "valid" : "invalid"}`}>{urlValid ? `已识别为 ${site}；创建后将用新环境打开此网址。` : "请输入以 http:// 或 https:// 开头的完整网址。"}</p></> : <label>身份名称<input required value={name} placeholder={`例如：${initialSite}公开浏览`} onChange={(event) => setName(event.target.value)} /></label>}</fieldset>
        <fieldset><legend>浏览器 Provider</legend><ProviderChoices cloakProviderInstalled={cloakProviderInstalled} provider={provider} onChange={setProvider} /></fieldset>
        <ProfileEnvironmentFields profile={profile} proxy={proxy} proxies={proxies} region={region} language={language} timezone={timezone} interactionPreset={interactionPreset} fingerprintSeed={fingerprintSeed} randomized={randomized} onManageProxies={onManageProxies} onProfileChange={setProfile} onProxyChange={setProxy} onRegionChange={setRegion} onLanguageChange={setLanguage} onTimezoneChange={setTimezone} onInteractionPresetChange={setInteractionPreset} onFingerprintSeedChange={setFingerprintSeed} onRandomize={randomizeProfile} />
        <div className="form-footer"><span>{loginRequirement === "required" ? "创建后将拉起独立浏览器，由你完成登录。" : "创建后可直接用于不要求登录的站点技能。"}</span><button className="prototype-button primary" type="submit" disabled={!canCreate}><UserRoundPlus size={14} />{loginRequirement === "required" ? "创建环境并去登录" : "创建环境"}</button></div>
      </form>
    </div>
  );
}

function ProviderChoices({ cloakProviderInstalled, provider, onChange }: { cloakProviderInstalled: boolean; provider: string; onChange: (provider: string) => void }) {
  return (
    <div className="provider-choice-list">
      <label className={provider === "CloakBrowser" ? "selected" : ""}>
        <input type="radio" name="provider" disabled={!cloakProviderInstalled} checked={provider === "CloakBrowser"} onChange={() => onChange("CloakBrowser")} />
        <ShieldCheck size={18} />
        <span><strong>CloakBrowser</strong><small>{cloakProviderInstalled ? "独立进程运行 · 由 App 启动和管理" : "尚未安装 · 首次使用从官方渠道下载"}</small></span>
      </label>
      <label className={provider === "官方 Chrome" ? "selected" : ""}>
        <input type="radio" name="provider" checked={provider === "官方 Chrome"} onChange={() => onChange("官方 Chrome")} />
        <Monitor size={18} />
        <span><strong>官方 Chrome</strong><small>使用本机安装 · 部分环境能力受限</small></span>
      </label>
    </div>
  );
}

type ProfileEnvironmentFieldsProps = {
  profile: ProfilePreset;
  proxy: string;
  proxies: ProxyProfile[];
  region: string;
  language: string;
  timezone: string;
  interactionPreset: string;
  fingerprintSeed: string;
  randomized: boolean;
  onManageProxies: () => void;
  onProfileChange: (profile: ProfilePreset) => void;
  onProxyChange: (proxy: string) => void;
  onRegionChange: (region: string) => void;
  onLanguageChange: (language: string) => void;
  onTimezoneChange: (timezone: string) => void;
  onInteractionPresetChange: (preset: string) => void;
  onFingerprintSeedChange: (seed: string) => void;
  onRandomize: () => void;
};

function ProfileEnvironmentFields({ profile, proxy, proxies, region, language, timezone, interactionPreset, fingerprintSeed, randomized, onManageProxies, onProfileChange, onProxyChange, onRegionChange, onLanguageChange, onTimezoneChange, onInteractionPresetChange, onFingerprintSeedChange, onRandomize }: ProfileEnvironmentFieldsProps) {
  const followsIp = region === "跟随 IP" && language === "跟随 IP" && timezone === "跟随 IP";
  const knownScreens = ["1920 × 1080", "1440 × 900", "1366 × 768"];
  const knownConcurrency = ["4 核", "8 核", "12 核", "16 核"];
  return (
    <fieldset className="profile-environment-fieldset">
      <legend>浏览器环境</legend>
      <button className="prototype-button compact profile-randomize-button" type="button" onClick={onRandomize}><Dices size={14} />一键随机</button>
      <div className="inline-form-grid">
        <label>平台<select value={profile.platform} onChange={(event) => onProfileChange(profilePresets.find((preset) => preset.platform === event.target.value) ?? profilePresets[0])}><option>Windows</option><option>macOS</option><option>Linux</option></select></label>
        <div className="profile-proxy-field"><label>代理<select value={proxy} onChange={(event) => onProxyChange(event.target.value)}>{proxyOptions(proxies)}<option>不使用代理</option></select></label><button className="inline-link field-link" type="button" onClick={onManageProxies}>新增或管理代理</button></div>
      </div>
      <label className="profile-auto-row"><input type="checkbox" checked={followsIp} onChange={(event) => { if (event.target.checked) { onRegionChange("跟随 IP"); onLanguageChange("跟随 IP"); onTimezoneChange("跟随 IP"); } else { onRegionChange("中国大陆"); onLanguageChange("简体中文"); onTimezoneChange("Asia/Shanghai"); } }} /><span><strong>根据代理 IP 自动设置</strong><small>保持地区、语言和时区一致</small></span></label>
      <div className="inline-form-grid three">
        <label>地区<select value={region} onChange={(event) => onRegionChange(event.target.value)}><option>跟随 IP</option><option>跟随本机</option><option>中国大陆</option><option>美国</option><option>日本</option></select></label>
        <label>语言<select value={language} onChange={(event) => onLanguageChange(event.target.value)}><option>跟随 IP</option><option>跟随本机</option><option>简体中文</option><option>English</option></select></label>
        <label>时区<select value={timezone} onChange={(event) => onTimezoneChange(event.target.value)}><option>跟随 IP</option><option>跟随本机</option><option>Asia/Shanghai</option><option>America/Los_Angeles</option></select></label>
      </div>
      {randomized ? <p className="profile-randomized"><Check size={13} />已生成一组相互兼容的设备参数</p> : null}
      <details className="profile-advanced-settings">
        <summary>高级设置<span>指纹、屏幕与设备参数</span></summary>
        <div className="profile-advanced-body">
          <div className="inline-form-grid three">
            <label>屏幕分辨率<select value={profile.screen} onChange={(event) => onProfileChange({ ...profile, screen: event.target.value })}>{knownScreens.includes(profile.screen) ? null : <option>{profile.screen}</option>}{knownScreens.map((screen) => <option key={screen}>{screen}</option>)}</select></label>
            <label>硬件并发<select value={profile.hardwareConcurrency} onChange={(event) => onProfileChange({ ...profile, hardwareConcurrency: event.target.value })}>{knownConcurrency.includes(profile.hardwareConcurrency) ? null : <option>{profile.hardwareConcurrency}</option>}{knownConcurrency.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label>GPU 预设<select value={profile.gpuPreset} onChange={(event) => onProfileChange({ ...profile, gpuPreset: event.target.value })}>{gpuPresets(profile.platform).includes(profile.gpuPreset) ? null : <option>{profile.gpuPreset}</option>}{gpuPresets(profile.platform).map((preset) => <option key={preset}>{preset}</option>)}</select></label>
          </div>
          <div className="inline-form-grid">
            <label>操作速度<select value={interactionPreset} onChange={(event) => onInteractionPresetChange(event.target.value)}><option value="正常速度">正常速度</option><option value="降低速度">降低速度（操作间隔更长）</option></select></label>
            <div className="fingerprint-seed-row"><span><strong>指纹种子</strong><small>当前尾号 {fingerprintSeed.slice(-8)} · 保存后保持稳定</small></span><button className="prototype-button compact" type="button" onClick={() => onFingerprintSeedChange(createFingerprintSeed())}><RefreshCw size={13} />重新生成</button></div>
          </div>
        </div>
      </details>
    </fieldset>
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

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function siteFromUrl(value: string, fallback: string) {
  if (!isHttpUrl(value)) return fallback;
  const hostname = new URL(value).hostname;
  if (hostname.endsWith("xiaohongshu.com")) return "小红书";
  if (hostname.endsWith("weixin.qq.com")) return "微信公众号";
  if (hostname.endsWith("douyin.com")) return "抖音";
  if (hostname.endsWith("taobao.com") || hostname.endsWith("tmall.com")) return "淘宝";
  return fallback;
}

function createFingerprintSeed() {
  return `fp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function profileFromIdentity(identity: Identity): ProfilePreset {
  const inferredPlatform = identity.userAgent?.includes("macOS") ? "macOS" : identity.userAgent?.includes("Linux") ? "Linux" : "Windows";
  const platform = identity.platform ?? inferredPlatform;
  const fallback = profilePresets.find((preset) => preset.platform === platform) ?? profilePresets[0];
  return {
    platform,
    screen: identity.screen?.split(" · ")[0] ?? fallback.screen,
    hardwareConcurrency: identity.hardwareConcurrency ?? fallback.hardwareConcurrency,
    gpuPreset: identity.gpuPreset ?? fallback.gpuPreset,
  };
}

function randomProfileAlternative(current: ProfilePreset) {
  const alternatives = profilePresets.filter((preset) => preset.platform !== current.platform || preset.gpuPreset !== current.gpuPreset);
  return alternatives[Math.floor(Math.random() * alternatives.length)] ?? profilePresets[0];
}

function normalizeInteractionPreset(value?: string) {
  return value === "谨慎" || value === "降低速度" ? "降低速度" : "正常速度";
}

function gpuPresets(platform: NonNullable<Identity["platform"]>) {
  if (platform === "macOS") return ["Apple · 集成图形"];
  if (platform === "Linux") return ["Intel · 集成图形", "NVIDIA · 主流桌面"];
  return ["NVIDIA · 主流桌面", "Intel · 集成图形"];
}

function proxyOptions(proxies: ProxyProfile[]) {
  return proxies.map((proxy) => <option value={proxy.name} key={proxy.id}>{proxy.name}{proxy.state === "可用" ? "" : `（${proxy.state}）`}</option>);
}
