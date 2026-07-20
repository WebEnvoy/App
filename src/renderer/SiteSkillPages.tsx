import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  CircleCheck,
  Download,
  Globe2,
  Plus,
  Search,
  UserRound,
} from "lucide-react";
import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";

import type { IdentityEnvironmentProjection } from "./identityEnvironmentFixtures";
import {
  catalogSkillName,
  catalogSkillSiteId,
  catalogSkillSiteName,
  type LodeCatalogLoadState,
  type LodeCatalogSkill,
} from "./lodeCatalogClient";
import type { RuntimeSupervisorState } from "./runtimeSupervisorState";
import { isDeterministicSkillIdentityCandidate } from "./skillIdentityCandidate";
import "./SiteSkillPages.css";

type LibraryMode = "catalog" | "detail";

export function SiteSkillLibrary({
  catalog,
  identities,
  runtimeSupervisorState,
  onCreateIdentity,
  onUse,
}: {
  catalog: LodeCatalogLoadState;
  identities: IdentityEnvironmentProjection[];
  runtimeSupervisorState: RuntimeSupervisorState;
  onCreateIdentity: () => void;
  onUse: (skill: LodeCatalogSkill, identityId?: string) => void;
}) {
  const [mode, setMode] = useState<LibraryMode>("catalog");
  const [selectedSkillId, setSelectedSkillId] = useState(catalog.skills[0]?.id ?? "");
  const selectedSkill = catalog.skills.find((skill) => skill.id === selectedSkillId);

  useEffect(() => {
    if (mode === "detail" && selectedSkill == null) setMode("catalog");
  }, [mode, selectedSkill]);

  if (mode === "detail" && selectedSkill != null) {
    return (
      <SiteSkillDetail
        catalogStatus={catalog.status}
        identities={identities}
        runtimeSupervisorState={runtimeSupervisorState}
        skill={selectedSkill}
        onBack={() => setMode("catalog")}
        onCreateIdentity={onCreateIdentity}
        onUse={onUse}
      />
    );
  }

  return (
    <SiteSkillDirectory
      catalog={catalog}
      identities={identities}
      runtimeSupervisorState={runtimeSupervisorState}
      onOpen={(skill) => {
        setSelectedSkillId(skill.id);
        setMode("detail");
      }}
      onUse={onUse}
    />
  );
}

function SiteSkillDirectory({
  catalog,
  identities,
  runtimeSupervisorState,
  onOpen,
  onUse,
}: {
  catalog: LodeCatalogLoadState;
  identities: IdentityEnvironmentProjection[];
  runtimeSupervisorState: RuntimeSupervisorState;
  onOpen: (skill: LodeCatalogSkill) => void;
  onUse: (skill: LodeCatalogSkill, identityId?: string) => void;
}) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const [installNoticeOpen, setInstallNoticeOpen] = useState(false);
  const visibleSkills = useMemo(
    () => catalog.skills.filter((skill) => !skill.facets.includes("sample")),
    [catalog.skills],
  );
  const categories = useMemo(
    () => ["全部", ...Array.from(new Set(visibleSkills.map((skill) => categoryLabel(skill.category))))],
    [visibleSkills],
  );
  const filteredSkills = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return visibleSkills.filter((skill) =>
      (category === "全部" || categoryLabel(skill.category) === category) &&
      (normalizedQuery.length === 0 ||
        `${catalogSkillSiteName(skill)} ${catalogSkillName(skill)} ${skill.summary} ${skill.category}`
          .toLowerCase()
          .includes(normalizedQuery)),
    );
  }, [visibleSkills, category, query]);
  const sites = Array.from(new Set(filteredSkills.map(catalogSkillSiteName)));

  useEffect(() => searchRef.current?.focus(), []);

  return (
    <div className="production-library-page">
      <header className="production-page-heading">
        <div>
          <h1>发现站点技能</h1>
          <p>按站点和业务类型查找已安装技能。</p>
        </div>
        <button
          className="production-icon-button"
          type="button"
          aria-label="添加站点技能"
          title="添加站点技能"
          onClick={() => setInstallNoticeOpen((open) => !open)}
        >
          <Plus size={16} />
        </button>
      </header>

      {catalog.status === "stale" ? (
        <div className="library-source-notice warning" role="status">
          <CircleAlert size={15} />
          <span>{catalog.summary}</span>
        </div>
      ) : null}
      {installNoticeOpen ? (
        <div className="library-source-notice" role="status">
          <Download size={15} />
          <span>当前只展示本机已安装技能；新增与更新将在 Lode 安装接口可用后开放。</span>
        </div>
      ) : null}

      <div className="production-library-toolbar">
        <label className="production-library-search">
          <Search size={15} />
          <input
            ref={searchRef}
            aria-label="搜索站点或技能"
            value={query}
            placeholder="搜索站点或技能"
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
        </label>
        <div className="production-library-filters" role="group" aria-label="业务类型筛选">
          {categories.map((item) => (
            <button
              className={category === item ? "selected" : ""}
              type="button"
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {sites.length === 0 ? (
        <div className="production-library-empty" role="status">
          <Search size={22} />
          <h2>没有匹配的站点技能</h2>
          <button type="button" onClick={() => { setQuery(""); setCategory("全部"); }}>清除筛选</button>
        </div>
      ) : (
        <div className="production-skill-sites">
          {sites.map((site) => (
            <section className="production-skill-site" aria-labelledby={`site-${site}`} key={site}>
              <div className="production-skill-site-heading">
                <span className="production-site-glyph"><Globe2 size={15} /></span>
                <h2 id={`site-${site}`}>{site}</h2>
              </div>
              <div className="production-skill-list">
                {filteredSkills.filter((skill) => catalogSkillSiteName(skill) === site).map((skill) => (
                  <SiteSkillRow
                    catalogStatus={catalog.status}
                    identities={identities}
                    runtimeSupervisorState={runtimeSupervisorState}
                    skill={skill}
                    onOpen={() => onOpen(skill)}
                    onUse={onUse}
                    key={skill.id}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function SiteSkillRow({
  catalogStatus,
  identities,
  runtimeSupervisorState,
  skill,
  onOpen,
  onUse,
}: {
  catalogStatus: LodeCatalogLoadState["status"];
  identities: IdentityEnvironmentProjection[];
  runtimeSupervisorState: RuntimeSupervisorState;
  skill: LodeCatalogSkill;
  onOpen: () => void;
  onUse: (skill: LodeCatalogSkill, identityId?: string) => void;
}) {
  const compatibleIdentities = compatibleIdentityList(skill, identities);
  const defaultIdentity = compatibleIdentities.find(identityCanLaunch);
  const launch = skillLaunchState(skill, defaultIdentity, runtimeSupervisorState, catalogStatus);
  return (
    <div className="production-skill-row">
      <button className="production-skill-row-main" type="button" onClick={onOpen}>
        <span className="production-skill-icon"><Globe2 size={17} /></span>
        <span>
          <strong>{catalogSkillName(skill)}</strong>
          <small>{displaySummary(skill)}</small>
          <span className="production-skill-tags">
            <em>{categoryLabel(skill.category)}</em>
            {skill.actions.map((action) => <em key={action.id}>{actionLabel(action.category)}</em>)}
          </span>
        </span>
      </button>
      <div className="production-skill-row-actions">
        <span className={skill.availability === "available" ? "skill-status available" : "skill-status warning"}>
          {skill.availability === "available" ? <CircleCheck size={13} /> : <CircleAlert size={13} />}
          {skillStatusLabel(skill)}
        </span>
        <button
          className="production-primary-button compact"
          type="button"
          disabled={!launch.ok}
          title={launch.reason}
          onClick={() => onUse(skill, defaultIdentity?.id)}
        >
          去使用
        </button>
      </div>
    </div>
  );
}

function SiteSkillDetail({
  catalogStatus,
  identities,
  runtimeSupervisorState,
  skill,
  onBack,
  onCreateIdentity,
  onUse,
}: {
  catalogStatus: LodeCatalogLoadState["status"];
  identities: IdentityEnvironmentProjection[];
  runtimeSupervisorState: RuntimeSupervisorState;
  skill: LodeCatalogSkill;
  onBack: () => void;
  onCreateIdentity: () => void;
  onUse: (skill: LodeCatalogSkill, identityId?: string) => void;
}) {
  const backRef = useRef<HTMLButtonElement>(null);
  const compatibleIdentities = compatibleIdentityList(skill, identities);
  const [selectedIdentityId, setSelectedIdentityId] = useState(
    compatibleIdentities.find(identityCanLaunch)?.id ?? compatibleIdentities[0]?.id ?? "",
  );
  const selectedIdentity = compatibleIdentities.find((identity) => identity.id === selectedIdentityId);
  const launch = skillLaunchState(skill, selectedIdentity, runtimeSupervisorState, catalogStatus);

  useEffect(() => backRef.current?.focus(), []);
  return (
    <div className="production-library-page production-skill-detail">
      <button ref={backRef} className="production-back-link" type="button" onClick={onBack}>
        <ArrowLeft size={14} />返回站点技能
      </button>
      <header className="production-page-heading skill-detail-heading">
        <div className="production-skill-title">
          <span className="production-skill-icon large"><Globe2 size={21} /></span>
          <div>
            <span className="production-eyebrow">{catalogSkillSiteName(skill)}</span>
            <h1>{catalogSkillName(skill)}</h1>
            <div className="production-skill-tags">
              <em>{categoryLabel(skill.category)}</em>
              {skill.actions.map((action) => <em key={action.id}>{actionLabel(action.category)}</em>)}
            </div>
          </div>
        </div>
        <button
          className="production-primary-button"
          type="button"
          disabled={!launch.ok || selectedIdentityId.length === 0}
          title={launch.reason}
          onClick={() => onUse(skill, selectedIdentityId)}
        >
          去使用<ArrowRight size={14} />
        </button>
      </header>

      {skill.availability !== "available" ? (
        <div className="library-source-notice warning" role="status">
          <CircleAlert size={15} /><span>{skill.availabilityReason}</span>
        </div>
      ) : null}

      <div className="production-skill-detail-grid">
        <section>
          <h2>这个技能能做什么</h2>
          <p className="production-lead-copy">{displaySummary(skill)}</p>
          <dl className="production-skill-facts">
            <div><dt>业务动作</dt><dd>{skill.actions.length > 0 ? skill.actions.map((action) => actionLabel(action.category)).join("、") : "未声明"}</dd></div>
            <div><dt>返回结果</dt><dd>{outputLabel(skill.outputKind)}</dd></div>
            <div><dt>结果视图</dt><dd>App 标准结构化视图</dd></div>
          </dl>
        </section>
        <section>
          <h2>创建任务时的输入</h2>
          <div className="production-contract-fields">
            {skill.inputFields.map((field) => (
              <div key={field.id}>
                <span><strong>{field.label}</strong>{field.required ? <em>必填</em> : null}</span>
                <small>{field.options?.join(" / ") ?? field.description}</small>
              </div>
            ))}
          </div>
          <p className="production-muted-copy">字段、选项与校验来自当前技能合同。</p>
        </section>
      </div>

      <section className="compatible-identities-section">
        <div>
          <h2>选择账号身份候选</h2>
          <p>先按站点和公开状态筛选，最终兼容性由 Core 预检查确认。</p>
        </div>
        {compatibleIdentities.length === 0 ? (
          <button className="production-secondary-button" type="button" onClick={onCreateIdentity}>
            <Plus size={14} />创建账号身份
          </button>
        ) : (
          <div className="compatible-identity-list" role="radiogroup" aria-label="账号身份候选">
            {compatibleIdentities.map((identity) => (
              <button
                className={identity.id === selectedIdentityId ? "selected" : ""}
                type="button"
                role="radio"
                aria-checked={identity.id === selectedIdentityId}
                tabIndex={identity.id === selectedIdentityId ? 0 : -1}
                onClick={() => setSelectedIdentityId(identity.id)}
                onKeyDown={(event) => selectIdentityByKey(event, compatibleIdentities, identity.id, setSelectedIdentityId)}
                key={identity.id}
              >
                <span className="compatible-identity-icon"><UserRound size={15} /></span>
                <span><strong>{identity.accountLabel}</strong><small>{identity.readiness.label}</small></span>
                {identity.id === selectedIdentityId ? <CircleCheck size={15} /> : null}
              </button>
            ))}
          </div>
        )}
      </section>

      <details className="production-skill-maintenance">
        <summary>版本与兼容性<span>当前版本 {skill.version}</span></summary>
        <dl>
          <div><dt>技能包版本</dt><dd>{skill.version}{skill.latestVersion !== skill.version ? `（可更新至 ${skill.latestVersion}）` : ""}</dd></div>
          <div><dt>状态</dt><dd>{skillStatusLabel(skill)} · {skill.lifecycle}</dd></div>
          <div><dt>来源</dt><dd>本机已安装</dd></div>
          <div><dt>更新时间</dt><dd>{skill.updatedAt}</dd></div>
          <div><dt>输入合同</dt><dd>{skill.inputSchemaId || "缺失"}</dd></div>
          <div><dt>输出合同</dt><dd>{skill.outputSchemaId || "缺失"}</dd></div>
          <div><dt>技能包</dt><dd>{skill.packageRef}</dd></div>
        </dl>
      </details>
    </div>
  );
}

function compatibleIdentityList(skill: LodeCatalogSkill, identities: IdentityEnvironmentProjection[]) {
  return identities.filter((identity) => isDeterministicSkillIdentityCandidate(skill, identity));
}

function skillLaunchState(
  skill: LodeCatalogSkill,
  identity: IdentityEnvironmentProjection | undefined,
  runtime: RuntimeSupervisorState,
  catalogStatus: LodeCatalogLoadState["status"],
) {
  if (catalogStatus !== "ready") return { ok: false, reason: "站点技能目录需要刷新后才能创建任务。" };
  if (skill.availability !== "available") return { ok: false, reason: skill.availabilityReason };
  if (skill.siteSlug === "boss") return { ok: false, reason: "BOSS 生产任务当前已延期。" };
  if (identity == null) return { ok: false, reason: "没有可用的账号身份候选。" };
  if (!identityCanLaunch(identity)) return { ok: false, reason: "当前账号身份需要先恢复到可用状态。" };
  if (!runtime.canUseLiveRuntime) return { ok: false, reason: runtime.summary };
  return { ok: true, reason: "使用当前技能和账号身份创建任务。" };
}

function identityCanLaunch(identity: IdentityEnvironmentProjection) {
  return identity.readiness.state === "ready" || identity.readiness.state === "warning";
}

function selectIdentityByKey(
  event: KeyboardEvent<HTMLButtonElement>,
  identities: IdentityEnvironmentProjection[],
  currentId: string,
  select: (id: string) => void,
) {
  const delta = event.key === "ArrowRight" || event.key === "ArrowDown"
    ? 1
    : event.key === "ArrowLeft" || event.key === "ArrowUp"
    ? -1
    : 0;
  if (delta === 0 || identities.length < 2) return;
  event.preventDefault();
  const currentIndex = identities.findIndex((identity) => identity.id === currentId);
  const nextIndex = (currentIndex + delta + identities.length) % identities.length;
  select(identities[nextIndex]!.id);
  const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("[role='radio']");
  buttons?.[nextIndex]?.focus();
}

function displaySummary(skill: LodeCatalogSkill) {
  const summaries: Record<string, string> = {
    "search-notes": "按关键词搜索小红书笔记，并返回可继续查看的笔记列表。",
    "read-note-detail": "读取指定小红书笔记的公开内容与来源信息。",
    "publish-note-precheck": "检查发布页面与草稿输入是否就绪，停在提交前。",
    "job-search": "按关键词和城市搜索职位，当前生产入口已延期。",
    "read-job-detail": "读取指定职位详情，当前生产入口已延期。",
    "greet-precheck": "检查打招呼内容与目标，停在发送前；当前生产入口已延期。",
  };
  const capabilityId = skill.packageRef.match(/\/([^/@]+)@[^/]+$/)?.[1];
  return capabilityId == null ? skill.summary : summaries[capabilityId] ?? skill.summary;
}

function actionLabel(category: WebEnvoyLodeCatalogAction["category"]) {
  return category === "read"
    ? "读取和下载"
    : category === "prepare"
    ? "填写但不提交"
    : category === "commit"
    ? "发布或提交"
    : "危险行为";
}

function categoryLabel(category: string) {
  return category === "Social search"
    ? "内容浏览"
    : category === "Content detail"
    ? "内容浏览"
    : category === "Content publishing"
    ? "内容发布"
    : category === "全部"
    ? "全部"
    : category;
}

function outputLabel(outputKind: string) {
  return outputKind === "xhs_note_search"
    ? "笔记列表"
    : outputKind.includes("detail")
    ? "单条结构化详情"
    : outputKind.includes("precheck")
    ? "写前检查结果"
    : "结构化业务结果";
}

function skillStatusLabel(skill: LodeCatalogSkill) {
  if (skill.lifecycle === "deprecated") return "已停用";
  if (skill.lifecycle === "broken") return "已失效";
  if (skill.availability !== "available") return "合同不完整";
  if (skill.latestVersion !== skill.version) return "可更新";
  return "已安装";
}
