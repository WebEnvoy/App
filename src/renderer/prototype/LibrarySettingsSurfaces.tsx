import {
  ArrowRight,
  ChevronDown,
  CircleAlert,
  ExternalLink,
  Filter,
  KeyRound,
  Library,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";

import { skills, type Skill } from "./prototypeData";

const tags = ["全部", "数据采集", "内容发布", "内容下载", "内容浏览"];

export function LibrarySurface({
  mode,
  siteFilter,
  selectedSkill,
  onModeChange,
  onSelectSkill,
  onUse,
}: {
  mode: "catalog" | "detail";
  siteFilter: string;
  selectedSkill: Skill;
  onModeChange: (mode: "catalog" | "detail") => void;
  onSelectSkill: (skillId: string) => void;
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
    return <SkillDetail skill={selectedSkill} onBack={() => onModeChange("catalog")} onUse={onUse} />;
  }

  const sites = Array.from(new Set(filteredSkills.map((skill) => skill.site)));
  return (
    <div className="prototype-page library-page">
      <header className="prototype-page-heading"><div><div className="prototype-eyebrow">Library</div><h1>站点技能</h1><p>按站点与业务场景找到可复用的任务能力。</p></div></header>
      <div className="library-toolbar"><label className="prototype-search"><Search size={15} /><input value={query} placeholder="搜索站点或技能" onChange={(event) => setQuery(event.target.value)} /></label>{siteFilter !== "全部" ? <span className="active-site-filter">{siteFilter}</span> : null}<div className="tag-filter" role="group" aria-label="业务场景筛选">{tags.map((item) => <button className={tag === item ? "selected" : ""} type="button" key={item} onClick={() => setTag(item)}>{item}</button>)}</div><button className="icon-plain-button" type="button" aria-label="更多筛选"><Filter size={15} /></button></div>
      {sites.length === 0 ? <div className="prototype-empty"><Search size={24} /><h2>没有匹配的站点技能</h2><p>当前筛选：{tag} · “{query}”</p><button className="prototype-button" type="button" onClick={() => { setTag("全部"); setQuery(""); }}>清除筛选</button></div> : null}
      <div className="skill-site-groups">{sites.map((site) => <section className="skill-site-group" key={site}><div className="skill-site-heading"><div><span className="site-mark">{site.slice(0, 1)}</span><div><h2>{site}</h2><p>{filteredSkills.filter((skill) => skill.site === site).length} 个技能</p></div></div></div><div className="skill-list">{filteredSkills.filter((skill) => skill.site === site).map((skill) => <SkillRow key={skill.id} skill={skill} onOpen={() => { onSelectSkill(skill.id); onModeChange("detail"); }} onUse={() => onUse(skill.id)} />)}</div></section>)}</div>
    </div>
  );
}

function SkillRow({ skill, onOpen, onUse }: { skill: Skill; onOpen: () => void; onUse: () => void }) {
  return (
    <div className={`skill-row ${skill.availability}`}>
      <button className="skill-row-main" type="button" onClick={onOpen}><span className="skill-icon"><Library size={17} /></span><span><strong>{skill.name}</strong><small>{skill.description}</small><span className="skill-tags">{skill.tags.map((tag) => <em key={tag}>{tag}</em>)}</span></span></button>
      <div className="skill-row-actions">{skill.availability === "available" ? <><span className="availability"><span />可用</span><button className="prototype-button primary compact" type="button" onClick={onUse}>去使用</button></> : <><span className="availability unavailable"><CircleAlert size={13} />已延期</span><button className="prototype-button compact" type="button" onClick={onOpen}>查看说明</button></>}</div>
    </div>
  );
}

function SkillDetail({ skill, onBack, onUse }: { skill: Skill; onBack: () => void; onUse: (skillId: string) => void }) {
  return (
    <div className="prototype-page skill-detail-page">
      <button className="inline-link back-link" type="button" onClick={onBack}>返回站点技能</button>
      <header className="prototype-page-heading skill-detail-heading"><div className="skill-detail-title"><span className="skill-icon large"><Library size={22} /></span><div><div className="prototype-eyebrow">{skill.site}</div><h1>{skill.name}</h1><div className="skill-tags">{skill.tags.map((tag) => <em key={tag}>{tag}</em>)}</div></div></div>{skill.availability === "available" ? <button className="prototype-button primary" type="button" onClick={() => onUse(skill.id)}>去使用 <ArrowRight size={14} /></button> : <button className="prototype-button" type="button" disabled>当前不可用</button>}</header>
      {skill.availability === "unavailable" ? <section className="prototype-callout action-needed"><CircleAlert size={18} /><div><strong>目标站点当前访问受限</strong><p>人工访问同样无法稳定进入结果与详情页。本技能保留为延期项，不会创建生产任务。</p></div></section> : null}
      <div className="skill-detail-grid"><section className="prototype-section"><h2>这个技能能做什么</h2><p className="lead-copy">{skill.description}</p><dl className="prototype-detail-list"><div><dt>需要提供</dt><dd>{skill.inputLabel}</dd></div><div><dt>返回结果</dt><dd>{skill.output}</dd></div><div><dt>兼容账号</dt><dd>{skill.site} · 登录状态可用</dd></div></dl></section><section className="prototype-section"><h2>创建任务时的输入</h2><div className="sample-contract-field"><label>{skill.inputLabel}</label><div>{skill.inputPlaceholder}</div></div><p className="muted-copy">App 会按技能合同渲染字段、选项和校验，不接受任意开放指令。</p></section></div>
      <section className="prototype-disclosure"><button type="button"><ChevronDown size={15} />版本、维护与诊断<span>当前版本 1.4.2 · 由 Lode 提供</span></button></section>
    </div>
  );
}

export function SettingsSurface() {
  const [defaultPolicy, setDefaultPolicy] = useState("ask");
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [skillPoliciesOpen, setSkillPoliciesOpen] = useState(false);
  return (
    <div className="prototype-page settings-page">
      <header className="prototype-page-heading"><div><div className="prototype-eyebrow">设置</div><h1>授权策略</h1><p>统一控制 App、CLI、MCP、API、SDK 和 Agent 发起的任务。</p></div></header>
      <div className="settings-layout">
        <section className="settings-main">
          <div className="settings-section"><div className="settings-section-heading"><ShieldCheck size={18} /><div><h2>全局默认</h2><p>没有更具体配置时使用。更具体的任务或单次选择优先。</p></div></div><div className="segmented-policy" role="group" aria-label="全局默认授权"><button className={defaultPolicy === "ask" ? "selected" : ""} type="button" onClick={() => setDefaultPolicy("ask")}><strong>按需询问</strong><span>推荐</span></button><button className={defaultPolicy === "read" ? "selected" : ""} type="button" onClick={() => setDefaultPolicy("read")}><strong>自动允许只读</strong><span>读取和下载</span></button><button className={defaultPolicy === "strict" ? "selected" : ""} type="button" onClick={() => setDefaultPolicy("strict")}><strong>每次询问</strong><span>所有外部动作</span></button></div></div>
          <div className="settings-section"><div className="settings-section-heading"><SlidersHorizontal size={18} /><div><h2>授权范围</h2><p>从全局到单次逐级覆盖，实际动作仍不能超出技能声明。</p></div></div><div className="scope-table"><ScopeRow level="全局" description="所有入口的默认策略" value={defaultPolicy === "read" ? "自动允许只读" : defaultPolicy === "strict" ? "每次询问" : "按需询问"} /><ScopeRow level="站点技能" description="例如：小红书发布笔记" value="3 项自定义" /><ScopeRow level="当前任务" description="只在一个任务生命周期内有效" value="随任务设置" /><ScopeRow level="单次" description="只允许当前动作一次" value="运行时选择" /></div></div>
          <div className="settings-section"><div className="settings-section-heading"><KeyRound size={18} /><div><h2>外部动作分类</h2><p>用一致的动作含义替代每个页面各自的“审批”。</p></div></div><div className="action-category-grid"><div><strong>读取</strong><span>浏览、采集、读取内容</span></div><div><strong>准备</strong><span>填写、预览、校验但不提交</span></div><div><strong>提交</strong><span>发布、发送、保存到外部站点</span></div><div><strong>环境</strong><span>安装 Provider、删除本机环境</span></div></div></div>
        </section>
        <aside className="settings-aside"><section><h2>当前效果</h2><p>只读任务会在技能允许的范围内直接运行；发布等外部写入动作会在需要时请求一次、任务级或技能级授权。</p><button className="prototype-button" type="button" onClick={() => setSkillPoliciesOpen((open) => !open)}>{skillPoliciesOpen ? "收起技能级配置" : "查看技能级配置"}</button>{skillPoliciesOpen ? <div className="settings-diagnostics"><span>搜索并读取笔记 · 自动允许只读</span><span>发布笔记 · 提交前询问</span><span>公开视频下载 · 按需询问</span></div> : null}</section><section><h2>连接与诊断</h2><p>Core、Harbor 和 Lode 当前可用。技术连接信息默认折叠。</p><button className="inline-link" type="button" onClick={() => setDiagnosticsOpen((open) => !open)}>{diagnosticsOpen ? "收起诊断" : "展开诊断"}</button>{diagnosticsOpen ? <div className="settings-diagnostics"><span>Core · 可用</span><span>Harbor · 可用</span><span>Lode · 可用</span><button type="button"><ExternalLink size={13} />导出诊断</button></div> : null}</section></aside>
      </div>
    </div>
  );
}

function ScopeRow({ description, level, value }: { description: string; level: string; value: string }) {
  return <div className="scope-row"><span><strong>{level}</strong><small>{description}</small></span><span>{value}</span></div>;
}
