import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Box,
  DatabaseZap,
  Download,
  ExternalLink,
  Filter,
  Globe2,
  LockKeyhole,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

import { type SiteSkill, type SiteSkillStatus, siteSkillFixtures } from "./siteSkillFixtures";

const directoryTabs = ["全部", "电商", "内容平台", "招聘", "内容发布", "账号身份", "诊断"] as const;
type DirectoryTab = (typeof directoryTabs)[number];
const app239ReadOnlyTaskIds = new Set<string>(["task-xhs-real-read", "task-boss-real-read"]);

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
    <div className="site-skill-page we-sectioned-page">
      <header className="site-skill-directory-header">
        <div>
          <h1>Library</h1>
          <p>只读 capability catalog；App 只保存本地 UI 意图，package truth 仍归属 Lode。</p>
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
              className={
                tab === selectedTab
                  ? "site-skill-directory-tab we-panel-tab cursor-interaction selected"
                  : "site-skill-directory-tab we-panel-tab cursor-interaction"
              }
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
  onOpenTask: (skill: SiteSkill) => void;
}) {
  const firstRelatedTaskId = skill.relatedTaskIds[0] ?? null;
  const canLaunchTask = firstRelatedTaskId != null && app239ReadOnlyTaskIds.has(firstRelatedTaskId) && skill.status !== "unavailable";

  return (
    <div className="site-skill-page site-skill-detail-page we-sectioned-page">
      <div className="site-skill-detail-toolbar">
        <button className="site-skill-back-button" type="button" onClick={onBack}>
          <ArrowLeft size={15} />
          Library
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
          <button className="site-skill-secondary-action" type="button">
            <Download size={15} />
            {installActionText(skill.installState)}
          </button>
          <button className="site-skill-secondary-action" type="button">
            <LockKeyhole size={15} />
            {skill.lockRef == null ? "锁定版本" : "已锁定"}
          </button>
          <button className="site-skill-secondary-action" type="button" disabled={skill.updateState !== "update-available"}>
            <RefreshCw size={15} />
            {updateActionText(skill.updateState)}
          </button>
          <button
            className="site-skill-primary-action"
            type="button"
            disabled={!canLaunchTask}
            onClick={canLaunchTask ? () => onOpenTask(skill) : undefined}
          >
            <Play size={15} />
            {readOnlyTaskActionText(skill, canLaunchTask)}
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
            <SkillFact label="Installed" value={skill.version} />
            <SkillFact label="Latest" value={skill.latestVersion} />
            <SkillFact label="Source" value={skill.source} />
            <SkillFact label="Package ref" value={skill.packageRef} />
            <SkillFact label="Capability ref" value={skill.capabilityRef} />
            {skill.lockRef == null ? null : <SkillFact label="Lock ref" value={skill.lockRef} />}
            <SkillFact label="Fetched at" value={skill.fetchedAt} />
          </dl>
        </section>

        <section className="site-skill-detail-card">
          <div className="card-title">
            <ShieldCheck size={18} />
            <h3>本地状态</h3>
          </div>
          <dl className="site-skill-facts">
            <SkillFact label="Install" value={installStateText(skill.installState)} />
            <SkillFact label="Update" value={updateStateText(skill.updateState)} />
            <SkillFact label="Risk" value={riskText(skill.risk)} />
            <SkillFact label="Source health" value={skill.sourceHealth.label} status={skill.sourceHealth.status} />
          </dl>
          <p className="site-skill-state-detail">{skill.sourceHealth.detail}</p>
        </section>
      </div>

      <div className="site-skill-detail-grid">
        <section className="site-skill-detail-card">
          <div className="card-title">
            <BadgeCheck size={18} />
            <h3>Tests</h3>
          </div>
          {skill.recentTest ? (
            <dl className="site-skill-facts">
              <SkillFact
                label="Latest run"
                value={skill.recentTest.label}
                status={testStatusToSkillStatus(skill.recentTest.status)}
              />
              <SkillFact
                label="Post-check"
                value={skill.recentTest.postCheck}
                status={testStatusToSkillStatus(skill.recentTest.status)}
              />
              <SkillFact
                label="Failure reason"
                value={skill.recentTest.failureReason}
                status={testStatusToSkillStatus(skill.recentTest.status)}
              />
              <SkillFact label="Ran at" value={skill.recentTest.ranAt} status="fixture" />
            </dl>
          ) : (
            <p className="site-skill-state-detail">No recent test fixture is available.</p>
          )}
        </section>

        <section className="site-skill-detail-card">
          <div className="card-title">
            <AlertTriangle size={18} />
            <h3>Report</h3>
          </div>
          {skill.reportIntent ? (
            <>
              <button
                className="site-skill-secondary-action"
                type="button"
                disabled={skill.reportIntent.state === "unavailable"}
              >
                <AlertTriangle size={15} />
                {skill.reportIntent.label}
              </button>
              <p className="site-skill-state-detail">{skill.reportIntent.detail}</p>
            </>
          ) : (
            <p className="site-skill-state-detail">No report intent is available for this fixture.</p>
          )}
        </section>

        <section className="site-skill-detail-card">
          <div className="card-title">
            <RefreshCw size={18} />
            <h3>Repair drafts</h3>
          </div>
          <div className="site-skill-readiness-list">
            {(skill.repairDrafts ?? []).map((draft) => (
              <div className="site-skill-readiness-row" key={draft.ref}>
                <span>{draft.state}</span>
                <StatusPill status={repairStateToSkillStatus(draft.state)} />
                <p>{draft.reason} · {draft.provenance} · {draft.ref}</p>
              </div>
            ))}
            {skill.repairDrafts == null || skill.repairDrafts.length === 0 ? (
              <p className="site-skill-state-detail">No repair draft fixture is available.</p>
            ) : null}
          </div>
        </section>
      </div>

      {skill.overlayBoundary ? (
        <section className="site-skill-detail-card">
          <div className="card-title">
            <ShieldCheck size={18} />
            <h3>Overlay and platform fix boundary</h3>
          </div>
          <dl className="site-skill-facts">
            {skill.overlayBoundary.map((item) => (
              <SkillFact
                label={item.label}
                value={`${item.detail} · ${item.source}`}
                status="fixture"
                key={item.label}
              />
            ))}
          </dl>
        </section>
      ) : null}

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

function readOnlyTaskActionText(skill: SiteSkill, canLaunchTask: boolean) {
  if (canLaunchTask) return "启动只读任务";
  if (skill.relatedTaskIds.some((taskId) => taskId.includes("write-preview"))) return "等写前验证";
  if (skill.relatedTaskIds.length > 0) return "非只读任务";
  return "暂无任务";
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
      className={
        isSelected
          ? "site-skill-card we-list-row cursor-interaction selected"
          : "site-skill-card we-list-row cursor-interaction"
      }
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
          <span>{skill.version === skill.latestVersion ? skill.version : `${skill.version} -> ${skill.latestVersion}`}</span>
          <span>{installStateText(skill.installState)}</span>
          <span>{riskText(skill.risk)}</span>
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
      ) : skill.category === "内容平台" || skill.category === "招聘" ? (
        <Globe2 size={size === "large" ? 28 : 18} />
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

function installActionText(state: SiteSkill["installState"]) {
  if (state === "not-installed") {
    return "安装";
  }
  if (state === "locked") {
    return "已安装";
  }
  return "安装偏好";
}

function updateActionText(state: SiteSkill["updateState"]) {
  if (state === "update-available") {
    return "更新";
  }
  if (state === "blocked") {
    return "更新阻塞";
  }
  return "已最新";
}

function installStateText(state: SiteSkill["installState"]) {
  if (state === "not-installed") {
    return "未安装";
  }
  if (state === "locked") {
    return "已锁定";
  }
  return "已安装";
}

function updateStateText(state: SiteSkill["updateState"]) {
  if (state === "update-available") {
    return "有更新";
  }
  if (state === "blocked") {
    return "不可更新";
  }
  return "latest";
}

function riskText(risk: SiteSkill["risk"]) {
  if (risk === "blocked") {
    return "blocked";
  }
  if (risk === "medium") {
    return "medium";
  }
  return "low";
}

function testStatusToSkillStatus(status: NonNullable<SiteSkill["recentTest"]>["status"]): SiteSkillStatus {
  if (status === "passed") {
    return "ready";
  }
  if (status === "failed" || status === "blocked") {
    return "unavailable";
  }
  return "fixture";
}

function repairStateToSkillStatus(state: NonNullable<SiteSkill["repairDrafts"]>[number]["state"]): SiteSkillStatus {
  if (state === "validated" || state === "promoted") {
    return "ready";
  }
  if (state === "rejected" || state === "unavailable") {
    return "unavailable";
  }
  return "fixture";
}

function SkillFact({ label, value, status = "fixture" }: { label: string; value: string; status?: SiteSkillStatus }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
      <StatusPill status={status} />
    </div>
  );
}
