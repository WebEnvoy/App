import { CircleAlert, CircleCheck, Save, Send, ShieldAlert, Square, Trash2 } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { CreateTaskFields } from "./CreateTaskFields";
import {
  declaredExecutionCategories,
  fetchEffectiveExecutionPolicy,
  fetchSkillExecutionPolicyConfiguration,
  loadingExecutionPolicyState,
  policyModesByCategory,
  policySourceForCategory,
  policySourceLabel,
  putSkillExecutionPolicy,
  putThreadExecutionPolicy,
  sourceVersionForPolicy,
  type EffectiveExecutionPolicy,
  type ExecutionCategory,
  type ExecutionMode,
  type ExecutionPolicyLoadState,
  type ExecutionPolicyModes,
} from "./executionPolicyClient";
import type { HarborIdentityLoadState } from "./harborIdentityTypes";
import { catalogSkillName, catalogSkillSiteName, type LodeCatalogSkill } from "./lodeCatalogClient";
import { releaseLocalAttachments } from "./localFileClient";
import type { RuntimeSupervisorState } from "./runtimeSupervisorState";
import { validateSkillInputDraft, type SkillInputAttachment, type SkillInputDraft, type SkillInputValue } from "./skillInputDraft";
import { sealSkillInput, type SkillInputOwnerRefs } from "./skillInputOwnerClient";
import { initialTaskThreadSubmitState, type TaskThreadSubmitState } from "./coreTaskThreadSubmitClient";
import { registerComposerInput } from "./focusComposer";
import type { TaskProjection } from "./taskThreadFixtures";
import { useCreateTaskDraft } from "./useCreateTaskDraft";

type Identity = HarborIdentityLoadState["identities"][number];

export type StructuredTaskComposerProps = {
  endpoint: string;
  identity: Identity;
  runtime: RuntimeSupervisorState;
  skill: LodeCatalogSkill;
  threadRef?: string;
  submitBlockedReason?: string;
  activeTurnLabel?: string;
  submitLabel: string;
  onPreSubmit?: (draft: SkillInputDraft) => Promise<{ ok: true } | { ok: false; reason: string }>;
  onSubmit: (draft: SkillInputDraft, ownerRefs: SkillInputOwnerRefs, policy: EffectiveExecutionPolicy, modes: ExecutionPolicyModes) => Promise<TaskThreadSubmitState>;
  onCancelActiveTurn?: () => Promise<TaskThreadSubmitState>;
  onTask: (task: TaskProjection) => void;
};

export function StructuredTaskComposer(props: StructuredTaskComposerProps) {
  const { clearDraft, clearing, draft, loading, restored, setDraft } = useCreateTaskDraft(props.skill, props.identity.id);
  const [touched, setTouched] = useState<Set<string>>(() => new Set());
  const [submitted, setSubmitted] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [submitState, setSubmitState] = useState<TaskThreadSubmitState>(initialTaskThreadSubmitState);
  const [policyState, setPolicyState] = useState<ExecutionPolicyLoadState>(loadingExecutionPolicyState);
  const [modes, setModes] = useState<ExecutionPolicyModes>({});
  const formRef = useRef<HTMLFormElement>(null);
  const errors = validateSkillInputDraft(props.skill, draft);

  useEffect(() => {
    let cancelled = false;
    setPolicyState(loadingExecutionPolicyState());
    void fetchEffectiveExecutionPolicy(props.endpoint, props.skill.packageRef, props.threadRef).then((state) => {
      if (cancelled) return;
      setPolicyState(state);
      if (state.status === "ready") setModes(policyModesByCategory(state.policy));
    });
    return () => { cancelled = true; };
  }, [props.endpoint, props.skill.packageRef, props.threadRef]);

  useEffect(() => {
    const input = formRef.current?.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input:not([type='hidden']), textarea, select");
    if (input == null) return;
    input.dataset.webenvoyComposer = "";
    return registerComposerInput(input, { composerId: props.threadRef ? "task-thread-primary" : "create-task-primary", isPrimaryComposer: true });
  }, [props.skill.packageRef, props.threadRef]);

  if (loading) return <div className="composer-owner-state" role="status">正在恢复受保护草稿。</div>;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) {
      announceAndFocus(`有 ${Object.keys(errors).length} 个字段需要修正。`);
      return;
    }
    if (props.submitBlockedReason != null) {
      setSubmitState({ status: "blocked", summary: props.submitBlockedReason });
      return;
    }
    if (policyState.status !== "ready") {
      setSubmitState({ status: "blocked", summary: policyState.summary });
      return;
    }
    const preflight = await props.onPreSubmit?.(draft);
    if (preflight != null && !preflight.ok) {
      setSubmitState({ status: "blocked", summary: preflight.reason });
      return;
    }
    setSubmitState({ status: "submitting", summary: "正在封存业务输入并提交 Core 任务回合。" });
    const sealed = await sealSkillInput(props.skill, props.identity.id, draft);
    if (!sealed.ok) {
      setSubmitState({ status: "blocked", summary: sealed.reason });
      return;
    }
    const result = await props.onSubmit(draft, sealed.refs, policyState.policy, modes);
    setSubmitState(result);
    if ("task" in result && result.task != null) props.onTask(result.task);
    if (result.status !== "ready") return;
    const persistence = await clearDraft();
    setTouched(new Set());
    setSubmitted(false);
    setAnnouncement(persistence === "ready"
      ? "任务回合已提交，业务输入已清空。"
      : "任务回合已提交，当前输入已清空，但无法确认系统受保护存储中的旧草稿已删除。");
  }

  function announceAndFocus(message: string) {
    setAnnouncement(message);
    window.requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
  }

  function updateValue(id: string, value: SkillInputValue) {
    setDraft((current) => ({ ...current, values: { ...current.values, [id]: value } }));
    setSubmitState(initialTaskThreadSubmitState);
  }

  function updateFiles(id: string, files: SkillInputAttachment[]) {
    const retained = new Set(files.map((file) => file.id));
    void releaseLocalAttachments((draft.files[id] ?? []).filter((file) => !retained.has(file.id)));
    setDraft((current) => ({ ...current, files: { ...current.files, [id]: files } }));
    setSubmitState(initialTaskThreadSubmitState);
  }

  async function clearEntireDraft() {
    const persistence = await clearDraft();
    setTouched(new Set());
    setSubmitted(false);
    setSubmitState(initialTaskThreadSubmitState);
    setAnnouncement(persistence === "ready"
      ? "业务输入已清空。"
      : "当前输入已清空，但无法确认系统受保护存储中的旧记录已删除。");
  }

  async function cancelActiveTurn() {
    if (props.onCancelActiveTurn == null) return;
    setSubmitState({ status: "submitting", summary: `正在停止${props.activeTurnLabel ?? "当前回合"}。` });
    const result = await props.onCancelActiveTurn();
    setSubmitState(result);
    if ("task" in result && result.task != null) props.onTask(result.task);
  }

  return (
    <form ref={formRef} className="thread-composer create-task-composer structured-task-composer" noValidate onSubmit={submit}>
      <div className="sr-only" aria-live="assertive" aria-atomic="true">{announcement}</div>
      {restored.restored || restored.persistence === "unavailable" ? (
        <div className="create-task-draft-state" role="status">
          {restored.restored ? "已恢复草稿。" : ""}
          {restored.omittedFieldIds.length > 0 ? "敏感字段需重新填写。" : ""}
          {restored.persistence === "unavailable" ? "系统受保护存储不可用。" : ""}
        </div>
      ) : null}
      <fieldset className="create-task-fieldset" disabled={clearing || submitState.status === "submitting"}>
        <CreateTaskFields
          draft={draft}
          errors={errors}
          submitted={submitted}
          touched={touched}
          onBlur={(fieldId) => setTouched((current) => new Set(current).add(fieldId))}
          onFiles={updateFiles}
          onValue={updateValue}
          skill={props.skill}
        />
      </fieldset>
      <ComposerFooter {...props} clearing={clearing} modes={modes} policyState={policyState} submitState={submitState} onCancel={cancelActiveTurn} onClear={clearEntireDraft} onModes={setModes} onPolicyState={setPolicyState} />
      <ComposerStatus blockedReason={props.submitBlockedReason} state={submitState} />
    </form>
  );
}

function ComposerFooter(props: StructuredTaskComposerProps & {
  clearing: boolean;
  modes: ExecutionPolicyModes;
  policyState: ExecutionPolicyLoadState;
  submitState: TaskThreadSubmitState;
  onCancel: () => void;
  onClear: () => void;
  onModes: (modes: ExecutionPolicyModes) => void;
  onPolicyState: (state: ExecutionPolicyLoadState) => void;
}) {
  const busy = props.clearing || props.submitState.status === "submitting";
  return (
    <div className="create-task-composer-toolbar">
      <button className="composer-icon-button" type="button" disabled={busy} aria-label="清空业务输入" title="清空业务输入" onClick={props.onClear}><Trash2 size={14} /></button>
      <span className="create-task-context" title={`${catalogSkillSiteName(props.skill)} · ${catalogSkillName(props.skill)} · ${props.identity.accountLabel}`}>
        <strong>{catalogSkillName(props.skill)}</strong><small>{props.identity.accountLabel} · {catalogSkillSiteName(props.skill)}</small>
      </span>
      <ExecutionPolicyMenu {...props} />
      {props.onCancelActiveTurn == null ? null : (
        <button className="composer-icon-button" type="button" disabled={busy} aria-label="停止当前回合" title="停止当前回合" onClick={props.onCancel}><Square size={13} /></button>
      )}
      <button className="production-primary-button create-task-submit" type="submit" disabled={busy || props.submitBlockedReason != null || props.policyState.status !== "ready"}>
        <Send size={14} />{busy ? "提交中" : props.submitLabel}
      </button>
    </div>
  );
}

function ExecutionPolicyMenu(props: StructuredTaskComposerProps & {
  modes: ExecutionPolicyModes;
  policyState: ExecutionPolicyLoadState;
  onModes: (modes: ExecutionPolicyModes) => void;
  onPolicyState: (state: ExecutionPolicyLoadState) => void;
}) {
  const categories = declaredExecutionCategories(props.skill);
  const current = props.policyState.status === "ready" ? policySummary(props.policyState.policy, categories[0]) : props.policyState.summary;
  async function save(destination: "thread" | "skill") {
    if (props.policyState.status !== "ready") return;
    props.onPolicyState({ status: "loading", summary: "正在保存执行方式。" });
    let sourceVersion = sourceVersionForPolicy(props.policyState.policy, "thread_revision");
    if (destination === "skill") {
      const configuration = await fetchSkillExecutionPolicyConfiguration(props.endpoint, props.skill.packageRef);
      if (configuration.status !== "ready") {
        props.onPolicyState({ status: "unavailable", summary: configuration.summary });
        return;
      }
      sourceVersion = configuration.configuration?.sourceVersion ?? null;
    }
    const state = destination === "thread" && props.threadRef
      ? await putThreadExecutionPolicy(props.endpoint, props.threadRef, props.skill.packageRef, props.modes, sourceVersion)
      : await putSkillExecutionPolicy(props.endpoint, props.skill.packageRef, props.modes, sourceVersion);
    if (state.status !== "ready") {
      props.onPolicyState(state);
      return;
    }
    const effective = await fetchEffectiveExecutionPolicy(props.endpoint, props.skill.packageRef, props.threadRef);
    props.onPolicyState(effective);
    if (effective.status === "ready") props.onModes(policyModesByCategory(effective.policy));
  }
  return (
    <details className="composer-execution-menu">
      <summary title="当前执行方式"><ShieldAlert size={14} /><span>{current}</span></summary>
      <div className="composer-execution-popover">
        {categories.map((category) => (
          <div className="composer-execution-row" key={category}>
            <span><strong>{categoryLabel(category)}</strong><small>{categoryDetail(category)}</small></span>
            <div role="group" aria-label={`${categoryLabel(category)}执行方式`}>
              {(["auto", "confirm", "deny"] as ExecutionMode[]).map((mode) => (
                <button type="button" className={props.modes[category] === mode ? "selected" : ""} aria-pressed={props.modes[category] === mode} onClick={() => props.onModes({ ...props.modes, [category]: mode })} key={mode}>{modeLabel(mode)}</button>
              ))}
            </div>
          </div>
        ))}
        {props.threadRef ? (
          <div className="composer-execution-actions">
            <button type="button" onClick={() => void save("thread")}><CircleCheck size={13} />保存到当前线程</button>
            <button type="button" onClick={() => void save("skill")}><Save size={13} />另存为我的技能默认</button>
          </div>
        ) : <small>所选方式将在创建时写入当前线程，不修改技能或全局默认。</small>}
      </div>
    </details>
  );
}

function ComposerStatus({ blockedReason, state }: { blockedReason?: string; state: TaskThreadSubmitState }) {
  if (state.status === "idle" && blockedReason == null) return null;
  const status = blockedReason == null ? state.status : "blocked";
  const summary = blockedReason ?? state.summary;
  return <div className={`create-task-submit-state ${status}`} role="status"><CircleAlert size={15} /><span><strong>{status === "submitting" ? "正在处理" : status === "ready" ? "已处理" : "暂不可提交"}</strong><small>{summary}</small></span></div>;
}

function policySummary(policy: EffectiveExecutionPolicy, category: ExecutionCategory | undefined) {
  const effective = category == null ? null : policySourceForCategory(policy, category);
  return effective == null || category == null ? "执行方式不可用" : `${categoryLabel(category)} · ${modeLabel(effective.mode)} · ${policySourceLabel(effective.source)}`;
}

function categoryLabel(category: ExecutionCategory) {
  return { read: "读取和下载", prepare: "填写但不提交", commit: "发布或提交", destructive: "危险行为" }[category];
}

function categoryDetail(category: ExecutionCategory) {
  return { read: "浏览、读取或下载", prepare: "填写或生成内容并停在提交前", commit: "发布、发送或提交", destructive: "删除、付款或其他难以撤销的动作" }[category];
}

function modeLabel(mode: ExecutionMode) {
  return { auto: "自动", confirm: "确认", deny: "禁止" }[mode];
}
