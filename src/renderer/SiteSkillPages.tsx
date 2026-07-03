import {
  ArrowLeft,
  BadgeCheck,
  Box,
  DatabaseZap,
  ExternalLink,
  Filter,
  Globe2,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { useMemo, useState } from "react";

import { type SiteSkill, type SiteSkillStatus, siteSkillFixtures } from "./siteSkillFixtures";

const directoryTabs = ["全部", "电商", "内容发布", "账号身份", "诊断"] as const;
type DirectoryTab = (typeof directoryTabs)[number];

export function SiteSkillDirectoryPage({
  selectedSkillId,
  onSelectSkill,
}: {
  selectedSkillId: string;
  onSelectSkill: (skill: SiteSkill) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<DirectoryTab>("全部");
  const filteredSkills = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return siteSkillFixtures.filter((skill) => {
      const tabMatches = selectedTab === "全部" || skill.category === selectedTab;
      if (!tabMatches) {
        return false;
      }

      if (query.length === 0) {
        return true;
      }

      return [skill.name, skill.description, skill.category, skill.packageName, ...skill.tags]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [searchQuery, selectedTab]);
  const sections =
    searchQuery.trim().length > 0
      ? [{ id: "search", title: "搜索结果", skills: filteredSkills }]
      : [
          {
            id: "ready",
            title: "已可用",
            skills: filteredSkills.filter((skill) => skill.status === "ready"),
          },
          {
            id: "recommended",
            title: "推荐和待配置",
            skills: filteredSkills.filter((skill) => skill.status === "fixture" || skill.status === "needs-identity"),
          },
          {
            id: "blocked",
            title: "暂不可用",
            skills: filteredSkills.filter((skill) => skill.status === "unavailable"),
          },
        ];

  return (
    <div className="site-skill-page">
      <header className="site-skill-directory-header">
        <div>
          <h1>站点技能</h1>
          <p>Lode capability metadata fixture；App 只展示入口和边界，不执行技能。</p>
        </div>
        <span className="status-pill status-fixture">fixture</span>
      </header>

      <div className="site-skill-toolbar" aria-label="站点技能筛选">
        <label className="site-skill-search">
          <Search size={15} />
          <input
            aria-label="搜索站点技能"
            placeholder="搜索站点技能"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>
        <div className="site-skill-directory-tabs" role="tablist" aria-label="站点技能目录">
          {directoryTabs.map((tab) => (
            <button
              className={tab === selectedTab ? "site-skill-directory-tab selected" : "site-skill-directory-tab"}
              type="button"
              role="tab"
              aria-selected={tab === selectedTab}
              onClick={() => setSelectedTab(tab)}
              key={tab}
            >
              {tab}
            </button>
          ))}
        </div>
        <button className="site-skill-filter-button" type="button" aria-label="分组筛选">
          <Filter size={15} />
        </button>
      </div>

      <div className="site-skill-sections">
        {sections.map((section) =>
          section.skills.length === 0 ? null : (
            <section className="site-skill-section" key={section.id}>
              <div className="site-skill-section-title">
                <h2>{section.title}</h2>
                <span>{section.skills.length}</span>
              </div>
              <div className="site-skill-grid">
                {section.skills.map((skill) => (
                  <SiteSkillCard
                    isSelected={skill.id === selectedSkillId}
                    skill={skill}
                    onSelect={() => onSelectSkill(skill)}
                    key={skill.id}
                  />
                ))}
              </div>
            </section>
          ),
        )}

        {filteredSkills.length === 0 ? (
          <div className="site-skill-empty">没有匹配的站点技能。</div>
        ) : null}
      </div>
    </div>
  );
}

export function SiteSkillDetailPage({
  skill,
  onBack,
  onOpenTask,
}: {
  skill: SiteSkill;
  onBack: () => void;
  onOpenTask: (taskId: string) => void;
}) {
  const firstRelatedTaskId = skill.relatedTaskIds[0] ?? null;

  return (
    <div className="site-skill-page site-skill-detail-page">
      <div className="site-skill-detail-toolbar">
        <button className="site-skill-back-button" type="button" onClick={onBack}>
          <ArrowLeft size={15} />
          站点技能
        </button>
        <StatusPill status={skill.status} />
      </div>

      <section className="site-skill-detail-hero">
        <SkillIcon skill={skill} size="large" />
        <div className="site-skill-detail-title">
          <h1>{skill.name}</h1>
          <p>{skill.description}</p>
          <div className="site-skill-tags">
            {skill.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
        <div className="site-skill-detail-actions">
          <button
            className="site-skill-primary-action"
            type="button"
            disabled={firstRelatedTaskId == null}
            onClick={() => firstRelatedTaskId != null && onOpenTask(firstRelatedTaskId)}
          >
            <Target size={15} />
            {firstRelatedTaskId == null ? "暂无任务" : "打开任务"}
          </button>
        </div>
      </section>

      <section className="site-skill-prompt-band" aria-label="业务输入模板">
        {skill.inputTemplates.map((template) => (
          <button className="site-skill-prompt" type="button" key={template}>
            <Sparkles size={14} />
            <span>{template}</span>
          </button>
        ))}
      </section>

      <div className="site-skill-detail-grid">
        <section className="site-skill-detail-card">
          <div className="card-title">
            <BadgeCheck size={18} />
            <h3>Readiness</h3>
          </div>
          <div className="site-skill-readiness-list">
            {skill.readiness.map((item) => (
              <div className="site-skill-readiness-row" key={item.label}>
                <span>{item.label}</span>
                <StatusPill status={item.status} />
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="site-skill-detail-card">
          <div className="card-title">
            <DatabaseZap size={18} />
            <h3>Lode metadata</h3>
          </div>
          <dl className="site-skill-facts">
            <SkillFact label="Package" value={skill.packageName} />
            <SkillFact label="Version" value={skill.version} />
            <SkillFact label="Source" value={skill.source} />
            <SkillFact label="Capability ref" value={skill.capabilityRef} />
            <SkillFact label="Fetched at" value={skill.fetchedAt} />
          </dl>
        </section>
      </div>

      <section className="site-skill-detail-card">
        <div className="card-title">
          <ShieldCheck size={18} />
          <h3>边界</h3>
        </div>
        <ul className="site-skill-boundaries">
          {skill.boundaries.map((boundary) => (
            <li key={boundary}>{boundary}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function SiteSkillCard({
  skill,
  isSelected,
  onSelect,
}: {
  skill: SiteSkill;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={isSelected ? "site-skill-card selected" : "site-skill-card"}
      type="button"
      onClick={onSelect}
    >
      <SkillIcon skill={skill} />
      <span className="site-skill-card-copy">
        <strong>{skill.name}</strong>
        <span>{skill.description}</span>
        <span className="site-skill-card-badges">
          <StatusPill status={skill.status} />
          <span>{skill.category}</span>
          <span>{skill.source}</span>
        </span>
      </span>
      <span className="site-skill-card-action">
        <ExternalLink size={14} />
      </span>
    </button>
  );
}

function SkillIcon({ skill, size = "normal" }: { skill: SiteSkill; size?: "normal" | "large" }) {
  return (
    <span className={size === "large" ? "site-skill-icon large" : "site-skill-icon"} aria-hidden="true">
      {skill.category === "电商" ? (
        <Box size={size === "large" ? 28 : 18} />
      ) : skill.category === "账号身份" ? (
        <ShieldCheck size={size === "large" ? 28 : 18} />
      ) : skill.category === "诊断" ? (
        <DatabaseZap size={size === "large" ? 28 : 18} />
      ) : (
        <Globe2 size={size === "large" ? 28 : 18} />
      )}
    </span>
  );
}

function StatusPill({ status }: { status: SiteSkillStatus }) {
  const statusClass =
    status === "ready"
      ? "status-ready"
      : status === "unavailable"
        ? "status-unavailable"
        : status === "needs-identity"
          ? "status-degraded"
          : "status-fixture";

  return <span className={`status-pill ${statusClass}`}>{statusText(status)}</span>;
}

function statusText(status: SiteSkillStatus) {
  if (status === "ready") {
    return "可用";
  }
  if (status === "needs-identity") {
    return "待配置";
  }
  if (status === "unavailable") {
    return "不可用";
  }
  return "fixture";
}

function SkillFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
      <span className="source-chip">fixture</span>
    </div>
  );
}
