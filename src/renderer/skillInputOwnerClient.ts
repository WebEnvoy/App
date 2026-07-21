import type { LodeCatalogSkill } from "./lodeCatalogClient";
import type { SkillInputDraft } from "./skillInputDraft";
import { projectProtectedSkillInput } from "./skillInputDraftStore";

export type SkillInputOwnerRefs = {
  ownerRef: string;
  fieldOwnerRefs: Record<string, string>;
  attachmentRefs: Record<string, string[]>;
};

export async function sealSkillInput(
  skill: LodeCatalogSkill,
  identityId: string,
  draft: SkillInputDraft,
): Promise<{ ok: true; refs: SkillInputOwnerRefs } | { ok: false; reason: string }> {
  const seal = window.webenvoyShell?.sealProtectedInput;
  if (seal == null) return { ok: false, reason: "受保护输入服务不可用；不会把业务输入写入 Core。" };
  try {
    const result = await seal(projectProtectedSkillInput(skill, identityId, draft));
    return result.status === "ready"
      ? { ok: true, refs: result.refs }
      : { ok: false, reason: "业务输入无法保存为受保护 owner 引用；草稿已保留。" };
  } catch (error) {
    return { ok: false, reason: `受保护输入封存失败：${error instanceof Error ? error.message : String(error)}` };
  }
}
