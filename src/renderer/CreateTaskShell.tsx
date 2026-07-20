import { ArrowRight, CircleAlert, CircleUserRound, FileUp, Send } from "lucide-react";
import { type FormEvent, useRef, useState } from "react";

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
  createSkillInputDraft,
  type SkillInputDraft,
  type SkillInputValue,
  validateSkillInputDraft,
} from "./skillInputDraft";

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
  onTargetChange: (skill: LodeCatalogSkill, identityId: string) => void;
};

type CreateTaskIdentity = HarborIdentityLoadState["identities"][number];

type CreateTaskCombination = {
  skill: LodeCatalogSkill;
  identity: CreateTaskIdentity;
  candidate: IdentityCompatibilityCandidate | undefined;
};

export function CreateTaskShell(props: CreateTaskShellProps) {
  return (
    <section className="create-task-shell" aria-labelledby="create-task-heading">
      <div className="create-task-intro">
        <h1 id="create-task-heading">这次要让 WebEnvoy 完成什么？</h1>
        <p>{props.selection == null ? "选择账号身份与站点技能后填写业务输入。" : "业务输入由当前技能合同定义。"}</p>
      </div>
      <CreateTaskContent {...props} />
    </section>
  );
}

function CreateTaskContent(props: CreateTaskShellProps) {
  const { catalog, compatibilityBySkill, identities, selection, onRecover } = props;
  if (catalog.status === "loading") return <OwnerState title="正在读取站点技能" summary={catalog.summary} />;
  if (catalog.status === "offline") return <OwnerState title="站点技能暂不可用" summary={catalog.summary} onRecover={onRecover} />;
  if (catalog.status === "stale") return <OwnerState title="站点技能目录需要刷新" summary={catalog.summary} onRecover={onRecover} />;
  if (selection == null) return <CreateTaskChooser {...props} />;
  return (
    <CreateTaskComposer
      key={`${selection.skill.packageRef}:${selection.skill.version}:${selection.identityId ?? "none"}`}
      compatibility={compatibilityBySkill[selection.skill.id]}
      identity={identities.find((identity) => identity.id === selection.identityId)}
      selection={selection}
      onCheckCompatibility={props.onCheckCompatibility}
      onRecover={onRecover}
      onRecoverCandidate={props.onRecoverCandidate}
      onTargetChange={props.onTargetChange}
    />
  );
}

function CreateTaskChooser(props: CreateTaskShellProps) {
  const combinations = createTaskCombinations(props.catalog, props.compatibilityBySkill, props.identities);
  const compatibilityLoading = props.catalog.skills.some((skill) =>
    skill.availability === "available" &&
    (props.compatibilityBySkill[skill.id] == null || props.compatibilityBySkill[skill.id]?.status === "loading"),
  );
  if (combinations.length === 0) {
    return props.identities.length === 0
      ? <OwnerState title="还没有账号身份" summary="先创建账号身份，再选择站点技能。" actionLabel="创建账号身份" onRecover={props.onCreateIdentity} />
      : <OwnerState title="没有匹配站点的账号身份" summary="已有账号身份与当前站点技能不匹配。" actionLabel="管理账号身份" onRecover={props.onCreateIdentity} />;
  }
  if (compatibilityLoading && combinations.every(({ candidate }) => candidate == null)) {
    return <OwnerState title="正在检查账号身份" summary="Core 正在预检查站点技能与账号身份是否兼容。" />;
  }
  return (
    <div className="create-task-recommendations" aria-label="账号身份与站点技能组合">
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
  catalog: LodeCatalogLoadState,
  compatibilityBySkill: Record<string, SkillIdentityCompatibilityState>,
  identities: HarborIdentityLoadState["identities"],
) {
  return catalog.skills.flatMap((skill) => candidateIdentityList(skill, identities).map((identity) => ({
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
  onTargetChange: (skill: LodeCatalogSkill, identityId: string) => void;
};

function CreateTaskComposer(props: CreateTaskComposerProps) {
  const { identity, selection } = props;
  const [draft, setDraft] = useState(() => createSkillInputDraft(selection.skill));
  const [touched, setTouched] = useState<Set<string>>(() => new Set());
  const [submitted, setSubmitted] = useState(false);
  const [ownerUnavailable, setOwnerUnavailable] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = validateSkillInputDraft(selection.skill, draft);
  const compatibility = useCreateTaskCompatibility(props, draft);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    setOwnerUnavailable(false);
    if (Object.keys(errors).length > 0) return;
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

  function recover() {
    if (identity == null || compatibility.candidate == null) return;
    if (compatibility.recovery?.destination === "target" && compatibility.targetFieldId != null) {
      formRef.current?.querySelector<HTMLElement>(`[name="${CSS.escape(compatibility.targetFieldId)}"]`)?.focus();
      return;
    }
    props.onRecoverCandidate(selection.skill, identity.id, compatibility.candidate);
  }

  return (
    <form ref={formRef} className="thread-composer create-task-composer" noValidate onSubmit={submit}>
      <CreateTaskFields
        draft={draft}
        errors={errors}
        submitted={submitted}
        touched={touched}
        onBlur={(fieldId) => {
          setTouched((current) => new Set(current).add(fieldId));
          if (fieldId === compatibility.targetFieldId && errors[fieldId] == null) void compatibility.check();
        }}
        onFiles={(fieldId, files) => setDraft((current) => ({ ...current, files: { ...current.files, [fieldId]: files } }))}
        onValue={updateValue}
        skill={selection.skill}
      />
      <div className="create-task-composer-toolbar">
        <span className="create-task-context" title={`${catalogSkillSiteName(selection.skill)} · ${catalogSkillName(selection.skill)} · ${identity?.accountLabel ?? "未选择身份"}`}>
          <strong>{catalogSkillName(selection.skill)}</strong>
          <small>{identity?.accountLabel ?? "未选择账号身份"} · {catalogSkillSiteName(selection.skill)}</small>
        </span>
        <button className="production-primary-button create-task-submit" type="submit" disabled={compatibility.checking || identity == null}>
          {compatibility.checking ? <CircleAlert size={14} /> : <Send size={14} />}{compatibility.checking ? "检查中" : "创建任务"}
        </button>
      </div>
      <CreateTaskSubmitState
        candidate={compatibility.candidate}
        checkedCompatibility={compatibility.checked}
        ownerUnavailable={ownerUnavailable}
        recovery={compatibility.recovery}
        onRecover={props.onRecover}
        onRecoverCandidate={recover}
      />
    </form>
  );
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

function CreateTaskFields({
  draft,
  errors,
  skill,
  submitted,
  touched,
  onBlur,
  onFiles,
  onValue,
}: {
  draft: SkillInputDraft;
  errors: Record<string, string>;
  skill: LodeCatalogSkill;
  submitted: boolean;
  touched: Set<string>;
  onBlur: (fieldId: string) => void;
  onFiles: (fieldId: string, files: File[]) => void;
  onValue: (fieldId: string, value: SkillInputValue) => void;
}) {
  return (
    <div className="create-task-fields">
      {skill.inputFields.filter((field) => field.kind !== "constant").map((field) => (
        <SkillFieldControl
          draft={draft}
          error={submitted || touched.has(field.id) ? errors[field.id] : undefined}
          field={field}
          onBlur={() => onBlur(field.id)}
          onFiles={(files) => onFiles(field.id, files)}
          onValue={(value) => onValue(field.id, value)}
          key={field.id}
        />
      ))}
    </div>
  );
}

function CreateTaskSubmitState({
  candidate,
  checkedCompatibility,
  ownerUnavailable,
  recovery,
  onRecover,
  onRecoverCandidate,
}: {
  candidate: IdentityCompatibilityCandidate | undefined;
  checkedCompatibility: SkillIdentityCompatibilityState | undefined;
  ownerUnavailable: boolean;
  recovery: ReturnType<typeof compatibilityRecoveryCopy>;
  onRecover: () => void;
  onRecoverCandidate: () => void;
}) {
  if (ownerUnavailable) {
    return <ComposerState title="任务提交服务尚未接入" summary="业务输入已保留；当前版本不会创建任务或伪造成功状态。" action="检查任务服务" onAction={onRecover} />;
  }
  if (checkedCompatibility?.status === "unavailable") {
    return <ComposerState title="暂时无法验证当前目标" summary={checkedCompatibility.summary} action="检查连接" onAction={onRecover} />;
  }
  if (candidate != null && !isCandidateUsable(candidate) && recovery != null) {
    return <ComposerState title={compatibilityCandidateLabel(candidate)} summary="完成恢复后才能继续创建任务。" action={recovery.label} onAction={onRecoverCandidate} />;
  }
  return null;
}

function ComposerState({ title, summary, action, onAction }: {
  title: string;
  summary: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="create-task-submit-state" role="status">
      <CircleAlert size={15} />
      <span><strong>{title}</strong><small>{summary}</small></span>
      <button type="button" onClick={onAction}>{action}</button>
    </div>
  );
}

function SkillFieldControl({
  draft,
  error,
  field,
  onBlur,
  onFiles,
  onValue,
}: {
  draft: SkillInputDraft;
  error?: string;
  field: WebEnvoyLodeCatalogField;
  onBlur: () => void;
  onFiles: (files: File[]) => void;
  onValue: (value: SkillInputValue) => void;
}) {
  const value = draft.values[field.id];
  const errorId = `create-field-${field.id}-error`;
  const common = { name: field.id, onBlur, "aria-invalid": error != null, "aria-describedby": error == null ? undefined : errorId };
  let control;
  if (field.kind === "boolean") {
    control = <input {...common} type="checkbox" checked={value === true} onChange={(event) => onValue(event.currentTarget.checked)} />;
  } else if (field.kind === "select") {
    control = <select {...common} value={typeof value === "string" ? value : ""} onChange={(event) => onValue(event.currentTarget.value)}><option value="">请选择</option>{field.options?.map((option) => <option value={option} key={option}>{option}</option>)}</select>;
  } else if (field.kind === "multi-select") {
    const selected = Array.isArray(value) ? value : [];
    control = <div className="create-task-multi-select" role="group">{field.options?.map((option) => <label key={option}><input type="checkbox" checked={selected.includes(option)} onBlur={onBlur} onChange={(event) => onValue(event.currentTarget.checked ? [...selected, option] : selected.filter((item) => item !== option))} />{option}</label>)}</div>;
  } else if (field.kind === "file") {
    control = <label className="create-task-file-control"><FileUp size={15} /><span>{draft.files[field.id]?.map((file) => file.name).join("、") || "选择文件"}</span><input {...common} type="file" onChange={(event) => onFiles(Array.from(event.currentTarget.files ?? []))} /></label>;
  } else if (field.kind === "multiline") {
    control = <textarea {...common} value={typeof value === "string" ? value : ""} maxLength={field.maxLength} onChange={(event) => onValue(event.currentTarget.value)} />;
  } else {
    control = <input {...common} type={field.kind === "number" ? "number" : field.format === "uri" ? "url" : "text"} value={typeof value === "string" ? value : ""} min={field.minimum} max={field.maximum} step={field.integer ? 1 : undefined} minLength={field.minLength} maxLength={field.maxLength} onChange={(event) => onValue(event.currentTarget.value)} />;
  }
  return (
    <label className={`create-task-field ${field.kind === "multiline" ? "wide" : ""}`}>
      <span><strong>{field.label}</strong>{field.required ? <em>必填</em> : null}</span>
      {control}
      <small>{error ?? field.description}</small>
      {error != null ? <span className="sr-only" id={errorId}>{error}</span> : null}
    </label>
  );
}
