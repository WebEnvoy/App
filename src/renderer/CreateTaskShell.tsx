import { ArrowRight, CircleAlert, CircleUserRound, Send, Trash2 } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";

import type { HarborIdentityLoadState } from "./harborIdentityTypes";
import {
  catalogSkillName,
  catalogSkillSiteName,
  type LodeCatalogLoadState,
  type LodeCatalogSkill,
} from "./lodeCatalogClient";
import { OwnerState } from "./OwnerState";
import type { RuntimeSupervisorState } from "./runtimeSupervisorState";
import {
  compatibilityTargetFieldId,
  createAwaitingTargetCompatibility,
  isCandidateUsable,
  type IdentityCompatibilityCandidate,
  type SkillIdentityCompatibilityState,
} from "./coreIdentityCompatibilityClient";
import {
  candidateIdentityList,
  compatibilityCandidate,
  compatibilityCandidateLabel,
  compatibilityRecoveryCopy,
} from "./skillCompatibilityPresentation";
import {
  compatibilityTargetValue,
  type SkillInputAttachment,
  type SkillInputDraft,
  type SkillInputValue,
  validateSkillInputDraft,
} from "./skillInputDraft";
import { CreateTaskFields } from "./CreateTaskFields";
import { releaseLocalAttachments } from "./localFileClient";
import { useCreateTaskDraft } from "./useCreateTaskDraft";
export type CreateTaskSelection = {
  skill: LodeCatalogSkill;
  identityId?: string;
};

type CheckCompatibility = (
  skill: LodeCatalogSkill,
  identityId: string,
  targetRef?: string,
) => Promise<SkillIdentityCompatibilityState | null>;

type CreateTaskShellProps = {
  catalog: LodeCatalogLoadState;
  compatibilityBySkill: Record<string, SkillIdentityCompatibilityState>;
  identities: HarborIdentityLoadState["identities"];
  selection: CreateTaskSelection | null;
  runtimeSupervisorState: RuntimeSupervisorState;
  onSelect: (skill: LodeCatalogSkill, identityId?: string) => void;
  onCreateIdentity: () => void;
  onCheckCompatibility: CheckCompatibility;
  onRecover: () => void;
  onRecoverCandidate: (skill: LodeCatalogSkill, identityId: string, candidate: IdentityCompatibilityCandidate) => void;
  onRecoverExactTarget: (skill: LodeCatalogSkill, identityId: string) => void;
  onTargetChange: (skill: LodeCatalogSkill, identityId: string) => void;
};

type CreateTaskIdentity = HarborIdentityLoadState["identities"][number];

type CreateTaskCombination = {
  skill: LodeCatalogSkill;
  identity: CreateTaskIdentity;
  candidate: IdentityCompatibilityCandidate | undefined;
};

export function CreateTaskShell(props: CreateTaskShellProps) {
  const selectedIdentity = props.identities.find((identity) => identity.id === props.selection?.identityId);
  const intro = props.selection == null
    ? "选择账号身份与站点技能后填写业务输入。"
    : selectedIdentity == null
    ? "为当前站点技能选择账号身份。"
    : "业务输入由当前技能合同定义。";
  return (
    <section className="create-task-shell" aria-labelledby="create-task-heading">
      <div className="create-task-intro">
        <h1 id="create-task-heading">这次要让 WebEnvoy 完成什么？</h1>
        <p aria-live="polite">{intro}</p>
      </div>
      <CreateTaskContent {...props} />
    </section>
  );
}

function CreateTaskContent(props: CreateTaskShellProps) {
  const { catalog, compatibilityBySkill, identities, selection, onRecover } = props;
  const identity = identities.find((item) => item.id === selection?.identityId);
  if (catalog.status === "loading") return <OwnerState title="正在读取站点技能" summary={catalog.summary} />;
  if (catalog.status === "offline") return <OwnerState title="站点技能暂不可用" summary={catalog.summary} onRecover={onRecover} />;
  if (catalog.status === "stale") return <OwnerState title="站点技能目录需要刷新" summary={catalog.summary} onRecover={onRecover} />;
  if (selection == null || identity == null) {
    return <CreateTaskChooser
      {...props}
      focusIdentitySelection={selection?.identityId != null && identity == null}
      selectedSkill={selection?.skill}
    />;
  }
  return (
    <CreateTaskComposer
      key={`${selection.skill.packageRef}:${selection.skill.version}:${selection.identityId ?? "none"}`}
      compatibility={compatibilityBySkill[selection.skill.id]}
      identity={identity}
      selection={selection}
      onCheckCompatibility={props.onCheckCompatibility}
      onRecover={onRecover}
      onRecoverCandidate={props.onRecoverCandidate}
      onRecoverExactTarget={props.onRecoverExactTarget}
      onTargetChange={props.onTargetChange}
    />
  );
}

function CreateTaskChooser(props: CreateTaskShellProps & { focusIdentitySelection?: boolean; selectedSkill?: LodeCatalogSkill }) {
  const chooserRef = useRef<HTMLDivElement>(null);
  const skills = props.selectedSkill == null
    ? props.catalog.skills
    : props.catalog.skills.filter((skill) => skill.packageRef === props.selectedSkill?.packageRef);
  const combinations = createTaskCombinations(skills, props.compatibilityBySkill, props.identities);
  const compatibilityLoading = skills.some((skill) =>
    skill.availability === "available" &&
    (props.compatibilityBySkill[skill.id] == null || props.compatibilityBySkill[skill.id]?.status === "loading"),
  );
  useEffect(() => {
    if (!props.focusIdentitySelection) return;
    const frame = window.requestAnimationFrame(() => chooserRef.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [props.focusIdentitySelection]);
  if (combinations.length === 0) {
    return props.identities.length === 0
      ? <OwnerState title="还没有账号身份" summary="先创建账号身份，再继续创建任务。" actionLabel="创建账号身份" onRecover={props.onCreateIdentity} />
      : <OwnerState title="没有匹配站点的账号身份" summary={props.selectedSkill == null ? "已有账号身份与当前站点技能不匹配。" : "当前技能没有可用的账号身份。"} actionLabel="管理账号身份" onRecover={props.onCreateIdentity} />;
  }
  if (compatibilityLoading && combinations.every(({ candidate }) => candidate == null)) {
    return <OwnerState title="正在检查账号身份" summary="Core 正在预检查站点技能与账号身份是否兼容。" />;
  }
  return (
    <div ref={chooserRef} className="create-task-recommendations" aria-label="账号身份与站点技能组合">
      {combinations.map((combination) => (
        <CreateTaskRecommendation {...combination} {...props} key={`${combination.skill.id}:${combination.identity.id}`} />
      ))}
    </div>
  );
}

function CreateTaskRecommendation({
  skill,
  identity,
  candidate,
  runtimeSupervisorState,
  onSelect,
  onRecoverCandidate,
}: CreateTaskCombination & Pick<CreateTaskShellProps, "runtimeSupervisorState" | "onSelect" | "onRecoverCandidate">) {
  const runtimeUnavailable = skill.availability !== "available" || !runtimeSupervisorState.canUseLiveRuntime;
  const usable = !runtimeUnavailable && isCandidateUsable(candidate);
  const recovery = compatibilityRecoveryCopy(candidate);
  return (
    <button
      type="button"
      disabled={!usable && recovery == null}
      title={runtimeUnavailable ? skill.availabilityReason || runtimeSupervisorState.summary : compatibilityCandidateLabel(candidate)}
      onClick={() => usable ? onSelect(skill, identity.id) : candidate != null && onRecoverCandidate(skill, identity.id, candidate)}
    >
      <span className="create-task-recommendation-icon"><CircleUserRound size={16} /></span>
      <span><strong>{catalogSkillName(skill)}</strong><small>{identity.accountLabel} · {compatibilityCandidateLabel(candidate)}</small></span>
      <ArrowRight size={15} />
    </button>
  );
}

function createTaskCombinations(
  skills: LodeCatalogSkill[],
  compatibilityBySkill: Record<string, SkillIdentityCompatibilityState>,
  identities: HarborIdentityLoadState["identities"],
) {
  return skills.flatMap((skill) => candidateIdentityList(skill, identities).map((identity) => ({
    skill,
    identity,
    candidate: compatibilityCandidate(identity, compatibilityBySkill[skill.id]),
  })));
}

type CreateTaskComposerProps = {
  compatibility?: SkillIdentityCompatibilityState;
  identity?: CreateTaskIdentity;
  selection: CreateTaskSelection;
  onCheckCompatibility: CheckCompatibility;
  onRecover: () => void;
  onRecoverCandidate: (skill: LodeCatalogSkill, identityId: string, candidate: IdentityCompatibilityCandidate) => void;
  onRecoverExactTarget: (skill: LodeCatalogSkill, identityId: string) => void;
  onTargetChange: (skill: LodeCatalogSkill, identityId: string) => void;
};

function CreateTaskComposer(props: CreateTaskComposerProps) {
  const { identity, selection } = props;
  const { clearDraft, clearing, draft, loading, restored, setDraft } = useCreateTaskDraft(selection.skill, identity?.id);
  const [touched, setTouched] = useState<Set<string>>(() => new Set());
  const [submitted, setSubmitted] = useState(false);
  const [ownerUnavailable, setOwnerUnavailable] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const errors = validateSkillInputDraft(selection.skill, draft);
  const compatibility = useCreateTaskCompatibility(props, draft);

  if (loading) return <OwnerState title="正在恢复草稿" summary="正在从系统安全存储读取当前技能输入。" />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    setOwnerUnavailable(false);
    if (Object.keys(errors).length > 0) {
      setAnnouncement(`有 ${Object.keys(errors).length} 个字段需要修正。`);
      window.requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    setAnnouncement("输入校验通过，正在检查账号身份兼容性。");
    const latestCandidate = await compatibility.check();
    if (latestCandidate != null && (latestCandidate.status === "compatible" || latestCandidate.status === "unknown_until_runtime")) {
      setOwnerUnavailable(true);
    }
  }

  function updateValue(id: string, value: SkillInputValue) {
    setDraft((current) => ({ ...current, values: { ...current.values, [id]: value } }));
    setOwnerUnavailable(false);
    if (id === compatibility.targetFieldId) compatibility.invalidateTarget();
  }

  function updateFiles(id: string, files: SkillInputAttachment[]) {
    const retained = new Set(files.map((file) => file.id));
    void releaseLocalAttachments((draft.files[id] ?? []).filter((file) => !retained.has(file.id)));
    setDraft((current) => ({ ...current, files: { ...current.files, [id]: files } }));
    setOwnerUnavailable(false);
  }

  async function clearEntireDraft() {
    const persistence = await clearDraft();
    setTouched(new Set());
    setSubmitted(false);
    setOwnerUnavailable(false);
    setAnnouncement(persistence === "ready"
      ? "草稿字段、附件和持久化记录已清空。"
      : "当前字段和附件已清空，但无法确认系统安全存储中的旧记录已删除。");
  }

  return (
    <form ref={formRef} className="thread-composer create-task-composer" noValidate onSubmit={submit}>
      <div className="sr-only" aria-live="assertive" aria-atomic="true">{announcement}</div>
      <CreateTaskDraftNotice restored={restored} />
      <fieldset className="create-task-fieldset" disabled={clearing}>
        <CreateTaskFields
          draft={draft}
          errors={errors}
          submitted={submitted}
          touched={touched}
          onBlur={(fieldId) => {
            setTouched((current) => new Set(current).add(fieldId));
            if (fieldId === compatibility.targetFieldId && errors[fieldId] == null) void compatibility.check();
          }}
          onFiles={updateFiles}
          onValue={updateValue}
          skill={selection.skill}
        />
      </fieldset>
      <CreateTaskToolbar checking={compatibility.checking} clearing={clearing} identity={identity} skill={selection.skill} onClear={clearEntireDraft} />
      <CreateTaskSubmitState
        candidate={compatibility.candidate}
        checkedCompatibility={compatibility.checked}
        ownerUnavailable={ownerUnavailable}
        recovery={compatibility.recovery}
        onRecover={props.onRecover}
        onRecoverCandidate={() => recoverCreateTaskCompatibility(props, compatibility, formRef.current)}
        onRecoverExactTarget={() => identity != null && props.onRecoverExactTarget(selection.skill, identity.id)}
      />
    </form>
  );
}

function CreateTaskDraftNotice({ restored }: { restored: ReturnType<typeof useCreateTaskDraft>["restored"] }) {
  if (!restored.restored && restored.persistence !== "unavailable") return null;
  return (
    <div className="create-task-draft-state" role="status">
      {restored.restored ? "已恢复草稿。" : ""}
      {restored.omittedFieldIds.length > 0 ? "敏感或未知合同字段需重新填写。" : ""}
      {restored.persistence === "unavailable" ? "系统安全存储不可用；关闭应用后不会恢复本次输入。" : ""}
    </div>
  );
}

function CreateTaskToolbar({ checking, clearing, identity, skill, onClear }: {
  checking: boolean;
  clearing: boolean;
  identity: CreateTaskIdentity | undefined;
  skill: LodeCatalogSkill;
  onClear: () => void;
}) {
  return (
    <div className="create-task-composer-toolbar">
      <button className="production-secondary-button" type="button" disabled={clearing} onClick={onClear}><Trash2 size={14} />{clearing ? "清空中" : "清空草稿"}</button>
      <span className="create-task-context" title={`${catalogSkillSiteName(skill)} · ${catalogSkillName(skill)} · ${identity?.accountLabel ?? "未选择身份"}`}>
        <strong>{catalogSkillName(skill)}</strong><small>{identity?.accountLabel ?? "未选择账号身份"} · {catalogSkillSiteName(skill)}</small>
      </span>
      <button className="production-primary-button create-task-submit" type="submit" disabled={checking || clearing || identity == null}>
        {checking ? <CircleAlert size={14} /> : <Send size={14} />}{checking ? "检查中" : "创建任务"}
      </button>
    </div>
  );
}

function recoverCreateTaskCompatibility(
  props: CreateTaskComposerProps,
  compatibility: ReturnType<typeof useCreateTaskCompatibility>,
  form: HTMLFormElement | null,
) {
  if (props.identity == null || compatibility.candidate == null) return;
  if (compatibility.recovery?.destination === "target" && compatibility.targetFieldId != null) {
    form?.querySelector<HTMLElement>(`[name="${CSS.escape(compatibility.targetFieldId)}"]`)?.focus();
    return;
  }
  props.onRecoverCandidate(props.selection.skill, props.identity.id, compatibility.candidate);
}

function useCreateTaskCompatibility(props: CreateTaskComposerProps, draft: SkillInputDraft) {
  const { identity, selection } = props;
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(props.compatibility);
  const requestGeneration = useRef(0);
  const targetFieldId = compatibilityTargetFieldId(selection.skill);
  const candidate = compatibilityCandidate(identity, checked);
  const recovery = compatibilityRecoveryCopy(candidate);

  async function check() {
    if (identity == null) return null;
    const generation = ++requestGeneration.current;
    setChecking(true);
    const next = await props.onCheckCompatibility(
      selection.skill,
      identity.id,
      compatibilityTargetValue(draft, targetFieldId),
    );
    if (generation !== requestGeneration.current) return null;
    setChecking(false);
    if (next == null) return null;
    setChecked(next);
    return compatibilityCandidate(identity, next);
  }

  function invalidateTarget() {
    if (identity == null) return;
    requestGeneration.current += 1;
    setChecking(false);
    setChecked(createAwaitingTargetCompatibility([identity.identityEnvironmentRef]));
    props.onTargetChange(selection.skill, identity.id);
  }

  return { candidate, checked, checking, recovery, targetFieldId, check, invalidateTarget };
}

function CreateTaskSubmitState({
  candidate,
  checkedCompatibility,
  ownerUnavailable,
  recovery,
  onRecover,
  onRecoverCandidate,
  onRecoverExactTarget,
}: {
  candidate: IdentityCompatibilityCandidate | undefined;
  checkedCompatibility: SkillIdentityCompatibilityState | undefined;
  ownerUnavailable: boolean;
  recovery: ReturnType<typeof compatibilityRecoveryCopy>;
  onRecover: () => void;
  onRecoverCandidate: () => void;
  onRecoverExactTarget: () => void;
}) {
  if (ownerUnavailable) {
    return <ComposerState title="任务提交服务尚未接入" summary="业务输入已保留；当前版本不会创建任务或伪造成功状态。" action="检查任务服务" onAction={onRecover} />;
  }
  if (checkedCompatibility?.status === "unavailable") {
    return <ComposerState title="暂时无法验证当前目标" summary={checkedCompatibility.summary} action="检查连接" onAction={onRecover} />;
  }
  if (checkedCompatibility?.status === "direct_url_unavailable") {
    return <ComposerState title="当前不能从网址创建详情任务" summary={checkedCompatibility.summary} action="选择其他站点技能" onAction={onRecoverExactTarget} />;
  }
  if (candidate != null && !isCandidateUsable(candidate) && recovery != null) {
    return <ComposerState title={compatibilityCandidateLabel(candidate)} summary="完成恢复后才能继续创建任务。" action={recovery.label} onAction={onRecoverCandidate} />;
  }
  return null;
}

function ComposerState({ title, summary, action, onAction }: {
  title: string;
  summary: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="create-task-submit-state" role="status">
      <CircleAlert size={15} />
      <span><strong>{title}</strong><small>{summary}</small></span>
      {action != null && onAction != null ? <button type="button" onClick={onAction}>{action}</button> : null}
    </div>
  );
}
