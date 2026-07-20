import { ArrowRight, CircleUserRound } from "lucide-react";

import type { HarborIdentityLoadState } from "./harborIdentityTypes";
import {
  catalogSkillName,
  catalogSkillSiteName,
  type LodeCatalogLoadState,
  type LodeCatalogSkill,
} from "./lodeCatalogClient";
import { OwnerState } from "./OwnerState";
import type { RuntimeSupervisorState } from "./runtimeSupervisorState";
import { isDeterministicSkillIdentityCandidate } from "./skillIdentityCandidate";

export type CreateTaskSelection = {
  skill: LodeCatalogSkill;
  identityId?: string;
};

export function CreateTaskShell({
  catalog,
  identities,
  selection,
  runtimeSupervisorState,
  onSelect,
  onCreateIdentity,
  onRecover,
}: {
  catalog: LodeCatalogLoadState;
  identities: HarborIdentityLoadState["identities"];
  selection: CreateTaskSelection | null;
  runtimeSupervisorState: RuntimeSupervisorState;
  onSelect: (skill: LodeCatalogSkill, identityId?: string) => void;
  onCreateIdentity: () => void;
  onRecover: () => void;
}) {
  const combinations = catalog.skills.flatMap((skill) =>
    identities
      .filter((identity) =>
        skill.availability === "available" &&
        skill.siteSlug !== "boss" &&
        isDeterministicSkillIdentityCandidate(skill, identity) &&
        (identity.readiness.state === "ready" || identity.readiness.state === "warning"),
      )
      .map((identity) => ({ skill, identity })),
  );

  return (
    <section className="create-task-shell" aria-labelledby="create-task-heading">
      <div className="create-task-intro">
        <h1 id="create-task-heading">这次要让 WebEnvoy 完成什么？</h1>
        <p>
          {selection == null
            ? "选择账号身份与站点技能后，业务输入将由技能字段定义生成。"
            : `已选择 ${catalogSkillName(selection.skill)}；业务输入由当前技能合同定义。`}
        </p>
      </div>
      {catalog.status === "loading" ? (
        <OwnerState title="正在读取站点技能" summary={catalog.summary} />
      ) : catalog.status === "offline" ? (
        <OwnerState title="站点技能暂不可用" summary={catalog.summary} onRecover={onRecover} />
      ) : catalog.status === "stale" ? (
        <OwnerState title="站点技能目录需要刷新" summary={catalog.summary} onRecover={onRecover} />
      ) : selection == null ? (
        combinations.length === 0 ? (
          <OwnerState title="没有可用组合" summary="需要一个同站点候选账号身份，以及合同完整的站点技能。最终兼容性由 Core 预检查确认。" actionLabel="创建账号身份" onRecover={onCreateIdentity} />
        ) : (
          <div className="create-task-recommendations" aria-label="推荐的账号身份与站点技能组合">
            {combinations.map(({ skill, identity }) => {
              const unavailable = skill.availability !== "available" || skill.siteSlug === "boss" || !runtimeSupervisorState.canUseLiveRuntime;
              return (
                <button
                  type="button"
                  disabled={unavailable}
                  title={unavailable ? skill.availabilityReason || runtimeSupervisorState.summary : "选择此组合"}
                  onClick={() => onSelect(skill, identity.id)}
                  key={`${skill.id}:${identity.id}`}
                >
                  <span className="create-task-recommendation-icon"><CircleUserRound size={16} /></span>
                  <span><strong>{catalogSkillName(skill)}</strong><small>{identity.accountLabel} · {identity.siteName}</small></span>
                  <ArrowRight size={15} />
                </button>
              );
            })}
          </div>
        )
      ) : (
        <div className="create-task-selection">
          <div className="create-task-context-row">
            <span><strong>{catalogSkillName(selection.skill)}</strong><small>{catalogSkillSiteName(selection.skill)} · {selection.skill.version}</small></span>
            <span><strong>{identities.find((identity) => identity.id === selection.identityId)?.accountLabel ?? "待选择账号身份"}</strong><small>账号身份</small></span>
          </div>
          <div className="create-task-contract-preview">
            {selection.skill.inputFields.map((field) => (
              <div key={field.id}><strong>{field.label}{field.required ? " *" : ""}</strong><small>{field.description}</small></div>
            ))}
          </div>
          <OwnerState title="暂时无法创建任务" summary="已保留当前技能和账号身份，请检查任务服务后重试。" onRecover={onRecover} />
        </div>
      )}
    </section>
  );
}
