import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronDown,
  CircleAlert,
  CircleCheck,
  Cloud,
  Download,
  Filter,
  Images,
  Library,
  MessageCircle,
  Music2,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Stethoscope,
} from "lucide-react";
import { useMemo, useState } from "react";

import { skills, type AuthorizationPolicy, type Skill } from "./prototypeData";

const tags = ["全部", "数据采集", "内容发布", "内容下载", "内容浏览"];

export function LibrarySurface({
  mode,
  siteFilter,
  selectedSkill,
  skillPolicies,
  onModeChange,
  onSelectSkill,
  onSkillPolicyChange,
  onUse,
}: {
  mode: "catalog" | "detail";
  siteFilter: string;
  selectedSkill: Skill;
  skillPolicies: Record<string, AuthorizationPolicy>;
  onModeChange: (mode: "catalog" | "detail") => void;
  onSelectSkill: (skillId: string) => void;
  onSkillPolicyChange: (skillId: string, policy: AuthorizationPolicy) => void;
  onUse: (skillId: string) => void;
}) {
  const [tag, setTag] = useState("全部");
  const [query, setQuery] = useState("");
  const filteredSkills = useMemo(() => skills.filter((skill) => {
    const matchesTag = tag === "全部" || skill.tags.includes(tag);
    const matchesSite = siteFilter === "全部" || skill.site === siteFilter;
    const normalized = `${skill.site}${skill.name}${skill.description}`.toLowerCase();
    return matchesSite && matchesTag && normalized.includes(query.toLowerCase());
  }), [query, siteFilter, tag]);

  if (mode === "detail") {
    return <SkillDetail policy={skillPolicies[selectedSkill.id] ?? "inherit"} skill={selectedSkill} onBack={() => onModeChange("catalog")} onPolicyChange={(policy) => onSkillPolicyChange(selectedSkill.id, policy)} onUse={onUse} />;
  }

  const sites = Array.from(new Set(filteredSkills.map((skill) => skill.site)));
  return (
    <div className="prototype-page library-page">
      <header className="prototype-page-heading"><div><div className="prototype-eyebrow">Library</div><h1>站点技能</h1><p>按站点与业务场景找到可复用的任务能力。</p></div></header>
      <div className="library-toolbar"><label className="prototype-search"><Search size={15} /><input value={query} placeholder="搜索站点或技能" onChange={(event) => setQuery(event.target.value)} /></label>{siteFilter !== "全部" ? <span className="active-site-filter">{siteFilter}</span> : null}<div className="tag-filter" role="group" aria-label="业务场景筛选">{tags.map((item) => <button className={tag === item ? "selected" : ""} type="button" key={item} onClick={() => setTag(item)}>{item}</button>)}</div><button className="icon-plain-button" type="button" aria-label="更多筛选"><Filter size={15} /></button></div>
      {sites.length === 0 ? <div className="prototype-empty"><Search size={24} /><h2>没有匹配的站点技能</h2><p>当前筛选：{tag} · “{query}”</p><button className="prototype-button" type="button" onClick={() => { setTag("全部"); setQuery(""); }}>清除筛选</button></div> : null}
      <div className="skill-site-groups">{sites.map((site) => <section className="skill-site-group" key={site}>{siteFilter === "全部" ? <div className="skill-site-heading"><div><span className="site-mark"><SiteGlyph site={site} size={16} /></span><div><h2>{site}</h2><p>{filteredSkills.filter((skill) => skill.site === site).length} 个技能</p></div></div></div> : null}<div className="skill-list">{filteredSkills.filter((skill) => skill.site === site).map((skill) => <SkillRow key={skill.id} skill={skill} onOpen={() => { onSelectSkill(skill.id); onModeChange("detail"); }} onUse={() => onUse(skill.id)} />)}</div></section>)}</div>
    </div>
  );
}

function SkillRow({ skill, onOpen, onUse }: { skill: Skill; onOpen: () => void; onUse: () => void }) {
  return (
    <div className={`skill-row ${skill.availability}`}>
      <button className="skill-row-main" type="button" onClick={onOpen}><span className="skill-icon"><SiteGlyph site={skill.site} size={17} /></span><span><strong>{skill.name}</strong><small>{skill.description}</small><span className="skill-tags">{skill.tags.map((tag) => <em key={tag}>{tag}</em>)}</span></span></button>
      <div className="skill-row-actions">{skill.availability === "available" ? <><span className="availability"><span />可用</span><button className="prototype-button primary compact" type="button" onClick={onUse}>去使用</button></> : <><span className="availability unavailable"><CircleAlert size={13} />已延期</span><button className="prototype-button compact" type="button" onClick={onOpen}>查看说明</button></>}</div>
    </div>
  );
}

function SiteGlyph({ site, size }: { site: string; size: number }) {
  if (site === "小红书") return <Images size={size} />;
  if (site === "微信公众号") return <MessageCircle size={size} />;
  if (site === "抖音") return <Music2 size={size} />;
  if (site === "淘宝") return <ShoppingBag size={size} />;
  if (site === "BOSS 直聘") return <BriefcaseBusiness size={size} />;
  return <Library size={size} />;
}

function SkillDetail({ policy, skill, onBack, onPolicyChange, onUse }: { policy: AuthorizationPolicy; skill: Skill; onBack: () => void; onPolicyChange: (policy: AuthorizationPolicy) => void; onUse: (skillId: string) => void }) {
  return (
    <div className="prototype-page skill-detail-page">
      <button className="inline-link back-link" type="button" onClick={onBack}>返回站点技能</button>
      <header className="prototype-page-heading skill-detail-heading"><div className="skill-detail-title"><span className="skill-icon large"><SiteGlyph site={skill.site} size={22} /></span><div><div className="prototype-eyebrow">{skill.site}</div><h1>{skill.name}</h1><div className="skill-tags">{skill.tags.map((tag) => <em key={tag}>{tag}</em>)}</div></div></div>{skill.availability === "available" ? <button className="prototype-button primary" type="button" onClick={() => onUse(skill.id)}>去使用 <ArrowRight size={14} /></button> : <button className="prototype-button" type="button" disabled>当前不可用</button>}</header>
      {skill.availability === "unavailable" ? <section className="prototype-callout action-needed"><CircleAlert size={18} /><div><strong>目标站点当前访问受限</strong><p>人工访问同样无法稳定进入结果与详情页。本技能保留为延期项，不会创建生产任务。</p></div></section> : null}
      <div className="skill-detail-grid"><section className="prototype-section"><h2>这个技能能做什么</h2><p className="lead-copy">{skill.description}</p><dl className="prototype-detail-list"><div><dt>需要提供</dt><dd>{skill.inputLabel}</dd></div><div><dt>返回结果</dt><dd>{skill.output}</dd></div><div><dt>兼容账号</dt><dd>{skill.site} · 登录状态可用</dd></div></dl></section><section className="prototype-section"><h2>创建任务时的输入</h2><div className="sample-contract-field"><label>{skill.inputLabel}</label><div>{skill.inputPlaceholder}</div></div><p className="muted-copy">App 会按技能合同渲染字段、选项和校验，不接受任意开放指令。</p></section></div>
      <section className="prototype-section skill-authorization-section"><div className="prototype-section-title"><div><h2>技能授权</h2><p>只影响“{skill.name}”，任务创建时仍可覆盖。</p></div></div><label>这个技能默认使用<select value={policy} onChange={(event) => onPolicyChange(event.target.value as AuthorizationPolicy)}><option value="inherit">继承全局设置</option><option value="full">完全访问</option><option value="ask">写入批准</option><option value="read">只读</option><option value="strict">每一步都要批准</option></select></label><span>技能声明范围：{skill.tags.includes("内容发布") ? "读取、准备、提交" : "读取"}</span></section>
      <section className="prototype-disclosure"><button type="button"><ChevronDown size={15} />版本、维护与诊断<span>当前版本 1.4.2 · 由 Lode 提供</span></button></section>
    </div>
  );
}

type SettingsSection = "authorization" | "connections" | "diagnostics";

export function SettingsSurface({ globalPolicy, section, onGlobalPolicyChange }: { globalPolicy: Exclude<AuthorizationPolicy, "inherit">; section: SettingsSection; onGlobalPolicyChange: (policy: Exclude<AuthorizationPolicy, "inherit">) => void }) {
  if (section === "connections") return <ConnectionSettings />;
  if (section === "diagnostics") return <DiagnosticsSettings />;
  return <GlobalAuthorizationSettings policy={globalPolicy} onPolicyChange={onGlobalPolicyChange} />;
}

function GlobalAuthorizationSettings({ policy, onPolicyChange }: { policy: Exclude<AuthorizationPolicy, "inherit">; onPolicyChange: (policy: Exclude<AuthorizationPolicy, "inherit">) => void }) {
  return (
    <div className="prototype-page settings-page">
      <header className="prototype-page-heading"><div><div className="prototype-eyebrow">设置</div><h1>全局授权</h1><p>设置所有入口创建任务时使用的默认策略。</p></div></header>
      <section className="settings-main settings-single-column">
        <div className="settings-section"><div className="settings-section-heading"><ShieldCheck size={18} /><div><h2>默认策略</h2><p>站点技能或任务没有单独配置时使用此策略。</p></div></div><div className="segmented-policy" role="group" aria-label="全局默认授权"><button className={policy === "full" ? "selected" : ""} type="button" onClick={() => onPolicyChange("full")}><strong>完全访问</strong><span>自动执行技能声明内的动作</span></button><button className={policy === "ask" ? "selected" : ""} type="button" onClick={() => onPolicyChange("ask")}><strong>写入批准</strong><span>读取自动运行，写入前确认</span></button><button className={policy === "read" ? "selected" : ""} type="button" onClick={() => onPolicyChange("read")}><strong>只读</strong><span>仅允许读取和下载</span></button><button className={policy === "strict" ? "selected" : ""} type="button" onClick={() => onPolicyChange("strict")}><strong>每一步都要批准</strong><span>每个外部动作都确认</span></button></div></div>
        <div className="settings-section"><div className="settings-section-heading"><ShieldCheck size={18} /><div><h2>适用入口</h2><p>同一默认策略用于 App、CLI、MCP、API、SDK 和 Agent。</p></div></div><div className="settings-entry-list">{["App", "CLI", "MCP", "API", "SDK", "Agent"].map((entry) => <span key={entry}><CircleCheck size={14} />{entry}</span>)}</div></div>
      </section>
    </div>
  );
}

function ConnectionSettings() {
  return (
    <div className="prototype-page settings-page">
      <header className="prototype-page-heading"><div><div className="prototype-eyebrow">设置</div><h1>连接</h1><p>管理 App 使用的本机服务连接。</p></div></header>
      <section className="settings-main settings-single-column">
        <ServiceConnection name="Core" detail="任务与结果" endpoint="http://127.0.0.1:8787" />
        <ServiceConnection name="Harbor" detail="账号身份与浏览器实例" endpoint="http://127.0.0.1:8788" />
        <ServiceConnection name="Lode" detail="站点技能" endpoint="http://127.0.0.1:8789" />
      </section>
    </div>
  );
}

function ServiceConnection({ detail, endpoint, name }: { detail: string; endpoint: string; name: string }) {
  const [checked, setChecked] = useState(false);
  return <div className="service-connection-row"><span className="service-icon"><Cloud size={17} /></span><div><h2>{name}</h2><p>{detail}</p><small>{checked ? "刚刚验证连接" : endpoint}</small></div><span className="prototype-state-chip available"><CircleCheck size={13} />已连接</span><button className="prototype-button" type="button" onClick={() => setChecked(true)}><RefreshCw size={14} />{checked ? "连接正常" : "测试连接"}</button></div>;
}

function DiagnosticsSettings() {
  const [checked, setChecked] = useState(false);
  const [exported, setExported] = useState(false);
  return (
    <div className="prototype-page settings-page">
      <header className="prototype-page-heading"><div><div className="prototype-eyebrow">设置</div><h1>诊断</h1><p>在任务或环境出现问题时检查本机组件并导出诊断信息。</p></div></header>
      <section className="diagnostics-summary"><span className="diagnostics-icon"><Stethoscope size={20} /></span><div><h2>所有组件运行正常</h2><p>{checked ? "刚刚重新检查完成" : "最近检查：刚刚"} · Core、Harbor、Lode 与浏览器 Provider 均可访问</p></div><button className="prototype-button" type="button" onClick={() => setChecked(true)}><RefreshCw size={14} />{checked ? "检查完成" : "重新检查"}</button></section>
      <section className="prototype-section diagnostic-actions"><div><h2>诊断包</h2><p>{exported ? "诊断包已保存到下载目录。" : "导出运行日志和组件状态，不包含密码、Cookie 或浏览器数据。"}</p></div><button className="prototype-button" type="button" onClick={() => setExported(true)}><Download size={14} />{exported ? "已导出" : "导出诊断包"}</button></section>
    </div>
  );
}
