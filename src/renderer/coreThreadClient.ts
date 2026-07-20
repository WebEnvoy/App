import type { CoreReadTaskLoadState } from "./coreReadTaskClient";
import { fixtureOrDemoPayloadReason } from "./ownerPayloadGuards";
import { requestOwnerJson } from "./ownerApiClient";
import type { OutcomeKind, RunProjection, TaskProjection } from "./taskThreadFixtures";

type JsonRecord = Record<string, unknown>;

type CoreThreadInputField = {
  field_id: string;
  kind: "scalar" | "url" | "long_text" | "file" | "attachment";
  summary?: string;
  owner_ref?: string;
};

type CoreThreadInputSnapshot = {
  schema_version: "webenvoy.task-turn-input.v0";
  fields: CoreThreadInputField[];
  attachment_refs: string[];
  consumer_boundary: string;
};

type CoreThreadTurn = {
  turn_id: string;
  sequence: number;
  idempotency_key: string;
  run_id: string;
  creation_channel: "api" | "cli" | "mcp" | "sdk" | "app";
  input: CoreThreadInputSnapshot;
  created_at: string;
  updated_at: string;
  submission_state: "submitting" | "accepted" | "rejected";
  status:
    | "submitting"
    | "accepted"
    | "running"
    | "waiting_for_user"
    | "completed"
    | "failed"
    | "cancelled"
    | "status_unknown";
  run_status?: string;
  failure_code?: string;
  submission_error?: {
    category: string;
    code: string;
    phase: string;
    recovery_hint: string;
  };
  terminal_at?: string;
  terminated_at?: string;
};

type CoreThread = {
  schema_version: "webenvoy.task-thread.v0";
  thread_id: string;
  capability_ref: string;
  identity_environment_ref: string;
  created_at: string;
  updated_at: string;
  turns: CoreThreadTurn[];
};

export function loadingCoreThreadState(endpoint: string): CoreReadTaskLoadState {
  return {
    status: "loading",
    endpoint,
    fetchedAt: "pending",
    summary: "正在读取 Core 任务线程。",
    tasks: [],
    liveTaskIds: [],
  };
}

export function unavailableCoreThreadState(endpoint: string, summary = "暂时无法读取任务线程，请检查本机服务后重试。"): CoreReadTaskLoadState {
  return {
    status: "offline",
    endpoint,
    fetchedAt: new Date().toISOString(),
    summary,
    tasks: [],
    liveTaskIds: [],
  };
}

export async function fetchCoreThreadState(endpoint: string): Promise<CoreReadTaskLoadState> {
  const fetchedAt = new Date().toISOString();
  let response: unknown;
  try {
    response = await requestOwnerJson(endpoint, "/threads", { timeoutMs: 2500 });
  } catch (error) {
    return unavailableCoreThreadState(
      endpoint,
      `Core /threads 读取失败：${error instanceof Error ? error.message : String(error)}`,
    );
  }
  const fixtureReason = fixtureOrDemoPayloadReason(response);
  if (fixtureReason) {
    return unavailableCoreThreadState(endpoint, `Core /threads 返回了不可用于生产的 payload：${fixtureReason}`);
  }
  const threads = parseCoreThreads(response);
  if (threads == null) {
    return unavailableCoreThreadState(endpoint, "Core /threads 未返回可消费的公开任务线程投影。");
  }
  const tasks = projectCoreThreads(threads, fetchedAt);
  return {
    status: "ready",
    endpoint,
    fetchedAt,
    summary: tasks.length === 0 ? "Core 当前没有任务线程。" : `已读取 ${tasks.length} 个 Core 任务线程。`,
    tasks,
    liveTaskIds: tasks.map((task) => task.id),
  };
}

export function retainLastKnownCoreThreads(
  current: CoreReadTaskLoadState,
  next: CoreReadTaskLoadState,
): CoreReadTaskLoadState {
  if (next.status !== "offline" || current.endpoint !== next.endpoint || current.tasks.length === 0) {
    return next;
  }
  return {
    ...next,
    summary: `${next.summary} 已保留上次读取的线程终态；活动回合继续由 runtime gate 阻断。`,
    tasks: current.tasks,
    liveTaskIds: [],
  };
}

export function mergeSubmittedCoreTaskOverrides(
  current: CoreReadTaskLoadState,
  submitted: Array<{ taskId: string; task: TaskProjection }>,
): CoreReadTaskLoadState {
  if (current.status !== "ready" || submitted.length === 0) return current;
  const submittedTasksById = new Map(submitted.map((override) => [override.taskId, override.task]));
  return {
    ...current,
    summary: `${current.summary} 已包含 UI 提交产生的 live run。`,
    tasks: current.tasks.map((task) => submittedTasksById.get(task.id) ?? task),
    liveTaskIds: Array.from(new Set([...current.liveTaskIds, ...submittedTasksById.keys()])),
  };
}

export function projectCoreThreads(threads: CoreThread[], fetchedAt: string): TaskProjection[] {
  return threads
    .map((thread) => projectCoreThread(thread, fetchedAt))
    .sort((left, right) => (right.updatedAt ?? "").localeCompare(left.updatedAt ?? ""));
}

function projectCoreThread(thread: CoreThread, fetchedAt: string): TaskProjection {
  const capabilityLabels = labelsForCapabilityRef(thread.capability_ref);
  const identityLabel = thread.identity_environment_ref;
  const turns = [...thread.turns]
    .sort((left, right) => right.sequence - left.sequence)
    .map(projectCoreTurn);
  const latestInput = [...thread.turns]
    .sort((left, right) => right.sequence - left.sequence)[0]?.input;
  return {
    id: thread.thread_id,
    updatedAt: thread.updated_at,
    threadContext: {
      siteLabel: capabilityLabels.site,
      siteSkillKey: thread.capability_ref,
      accountIdentityKey: thread.identity_environment_ref,
    },
    title: `${capabilityLabels.skill} · ${identityLabel}`,
    accountIdentity: identityLabel,
    identitySource: "Core live",
    siteSkill: capabilityLabels.skill,
    businessInput: inputSummary(latestInput),
    source: "Core live",
    packageSource: {
      name: thread.capability_ref,
      version: "未读取",
      capabilityRef: thread.capability_ref,
      sourceRef: thread.capability_ref,
      fetchedAt,
      source: "Core live",
      boundary: "Core 只向 App 提供线程绑定、结构化字段摘要和 owner refs；App 不读取附件内容或浏览器敏感材料。",
    },
    runs: turns,
  };
}

function projectCoreTurn(turn: CoreThreadTurn): RunProjection {
  const lifecycle = turnLifecycle(turn.status);
  const outcome = turnOutcome(turn.status);
  const rows: RunProjection["resultRows"] = [
    { label: "回合序号", value: String(turn.sequence), source: "Core live" },
    { label: "状态", value: turn.status, source: "Core live" },
    ...(turn.creation_channel === "app"
      ? []
      : [{ label: "创建渠道", value: creationChannelLabel(turn.creation_channel), source: "Core live" as const }]),
    ...(turn.failure_code
      ? [{ label: "失败代码", value: turn.failure_code, source: "Core live" as const }]
      : []),
  ];
  return {
    id: turn.run_id,
    label: `第 ${turn.sequence} 回合`,
    lifecycle,
    outcome,
    summary: turnSummary(turn),
    actionIntent: turnActionIntent(turn.status),
    owner: "Core",
    source: "Core live",
    resultRows: rows,
    evidenceCards: [],
    process: [
      `Core turn: ${turn.turn_id}`,
      `Created at: ${turn.created_at}`,
      `Updated at: ${turn.updated_at}`,
      ...(turn.terminal_at ? [`Terminal at: ${turn.terminal_at}`] : []),
    ],
    turnStatus: turn.status,
    creationChannel: turn.creation_channel,
    createdAt: turn.created_at,
    updatedAt: turn.updated_at,
    terminalAt: turn.terminal_at ?? turn.terminated_at,
  };
}

function turnLifecycle(status: CoreThreadTurn["status"]): RunProjection["lifecycle"] {
  if (status === "submitting" || status === "accepted") return "queued";
  if (status === "running") return "running";
  if (status === "waiting_for_user" || status === "status_unknown") return "needs-action";
  if (status === "failed") return "blocked";
  return "completed";
}

function turnOutcome(status: CoreThreadTurn["status"]): OutcomeKind {
  if (status === "completed") return "success";
  if (status === "failed") return "failure";
  if (status === "cancelled" || status === "waiting_for_user") return "failure-safe";
  if (status === "status_unknown") return "unknown";
  return "partial";
}

function turnSummary(turn: CoreThreadTurn) {
  const input = inputSummary(turn.input);
  const state = turn.status === "completed"
    ? "已完成"
    : turn.status === "failed"
      ? "执行失败"
      : turn.status === "cancelled"
        ? "已取消"
        : turn.status === "waiting_for_user"
          ? "等待用户处理"
          : turn.status === "status_unknown"
            ? "状态未知，不会自动重复提交"
            : turn.status === "running"
              ? "正在执行"
              : "等待 Core 接受";
  const recovery = turn.submission_error?.recovery_hint;
  return [state, input, recovery].filter(Boolean).join(" · ");
}

function turnActionIntent(status: CoreThreadTurn["status"]) {
  if (status === "waiting_for_user") return "等待用户完成当前业务动作后由 Core 恢复。";
  if (status === "status_unknown") return "重新读取 owner 状态；在结果明确前不重复提交。";
  if (status === "failed") return "查看失败分类并修订下一回合业务输入。";
  if (status === "cancelled") return "当前回合已终止，可提交新的业务输入。";
  if (status === "completed") return "查看结果或提交下一回合。";
  return "等待 Core 更新当前回合。";
}

function inputSummary(snapshot: CoreThreadInputSnapshot | undefined) {
  if (!snapshot) return "";
  const fields = snapshot.fields
    .map((field) => field.summary ? `${field.field_id}：${field.summary}` : field.owner_ref ? `${field.field_id}：已附加 owner 内容` : field.field_id)
    .filter(Boolean);
  const attachments = snapshot.attachment_refs.length > 0 ? `附件 ${snapshot.attachment_refs.length} 个` : "";
  return [...fields, attachments].filter(Boolean).join(" · ");
}

function labelsForCapabilityRef(capabilityRef: string) {
  const knownLabels: Record<string, { site: string; skill: string }> = {
    "lode:capability/search-notes": { site: "小红书", skill: "搜索并读取笔记" },
    "lode:capability/read-note-detail": { site: "小红书", skill: "读取笔记详情" },
    "lode:capability/job-search": { site: "BOSS 直聘", skill: "职位搜索" },
    "lode:capability/xiaohongshu-draft-precheck": { site: "小红书", skill: "发布笔记草稿" },
  };
  return knownLabels[capabilityRef] ?? { site: "未解析站点", skill: capabilityRef };
}

function creationChannelLabel(channel: CoreThreadTurn["creation_channel"]) {
  return channel.toUpperCase();
}

function parseCoreThreads(value: unknown): CoreThread[] | null {
  const envelope = asRecord(value);
  if (envelope?.ok !== true || !Array.isArray(envelope.threads)) return null;
  const parsed = envelope.threads.map(parseCoreThread);
  return parsed.every((thread): thread is CoreThread => thread != null) ? parsed : null;
}

function parseCoreThread(value: unknown): CoreThread | null {
  const thread = asRecord(value);
  if (
    thread?.schema_version !== "webenvoy.task-thread.v0" ||
    !isThreadId(thread.thread_id) ||
    !isCapabilityRef(thread.capability_ref) ||
    !isIdentityEnvironmentRef(thread.identity_environment_ref) ||
    !isDateTime(thread.created_at) ||
    !isDateTime(thread.updated_at) ||
    !Array.isArray(thread.turns)
  ) return null;
  const turns = thread.turns.map(parseCoreTurn);
  if (!turns.every((turn): turn is CoreThreadTurn => turn != null)) return null;
  return { ...thread, turns } as CoreThread;
}

function parseCoreTurn(value: unknown): CoreThreadTurn | null {
  const turn = asRecord(value);
  const input = parseInputSnapshot(turn?.input);
  if (
    !turn ||
    !isString(turn.turn_id) ||
    !Number.isInteger(turn.sequence) || Number(turn.sequence) < 1 ||
    !isString(turn.idempotency_key) ||
    !isString(turn.run_id) ||
    !isCreationChannel(turn.creation_channel) ||
    !input ||
    !isDateTime(turn.created_at) ||
    !isDateTime(turn.updated_at) ||
    !isSubmissionState(turn.submission_state) ||
    !isTurnStatus(turn.status)
  ) return null;
  const submissionError = parseSubmissionError(turn.submission_error);
  if (turn.submission_error !== undefined && submissionError == null) return null;
  if (
    !isOptionalString(turn.failure_code) ||
    !isOptionalDateTime(turn.terminal_at) ||
    !isOptionalDateTime(turn.terminated_at)
  ) return null;
  return { ...turn, input, ...(submissionError ? { submission_error: submissionError } : {}) } as CoreThreadTurn;
}

function parseInputSnapshot(value: unknown): CoreThreadInputSnapshot | null {
  const snapshot = asRecord(value);
  if (
    !snapshot ||
    !hasOnlyKeys(snapshot, inputSnapshotKeys) ||
    findPrivateField(snapshot) != null ||
    snapshot.schema_version !== "webenvoy.task-turn-input.v0" ||
    !Array.isArray(snapshot.fields) ||
    snapshot.fields.length > 64 ||
    (snapshot.attachment_refs !== undefined && !Array.isArray(snapshot.attachment_refs)) ||
    (Array.isArray(snapshot.attachment_refs) && !snapshot.attachment_refs.every(isOwnerRef)) ||
    snapshot.consumer_boundary !== "Core stores bounded field summaries and owner refs only; raw content remains with its owner."
  ) return null;
  const attachmentRefs = (snapshot.attachment_refs as string[] | undefined) ?? [];
  if (attachmentRefs.length > 32 || new Set(attachmentRefs).size !== attachmentRefs.length) return null;
  const fieldIds = new Set<string>();
  const fields = snapshot.fields.map((fieldValue) => {
    const field = asRecord(fieldValue);
    if (
      !field ||
      !hasOnlyKeys(field, inputFieldKeys) ||
      !isFieldId(field.field_id) ||
      isPrivateFieldId(field.field_id) ||
      fieldIds.has(field.field_id) ||
      !isInputKind(field.kind) ||
      !isValidInputField(field)
    ) return null;
    fieldIds.add(field.field_id);
    return field as CoreThreadInputField;
  });
  return fields.every((field): field is CoreThreadInputField => field != null)
    ? { ...snapshot, fields, attachment_refs: attachmentRefs } as CoreThreadInputSnapshot
    : null;
}

function parseSubmissionError(value: unknown): CoreThreadTurn["submission_error"] | null {
  if (value === undefined) return undefined;
  const error = asRecord(value);
  if (!error || !isString(error.category) || !isString(error.code) || !isString(error.phase) || !isString(error.recovery_hint)) return null;
  return error as CoreThreadTurn["submission_error"];
}

function isValidInputField(field: JsonRecord) {
  const usesOwnerRef = field.kind === "long_text" || field.kind === "file" || field.kind === "attachment";
  if (usesOwnerRef) return field.summary === undefined && isOwnerRef(field.owner_ref);
  if (field.owner_ref !== undefined || !isBoundedSummary(field.summary)) return false;
  return field.kind !== "url" || isPersistedPublicUrlSummary(field.summary);
}

const inputSnapshotKeys = new Set(["schema_version", "fields", "attachment_refs", "consumer_boundary"]);
const inputFieldKeys = new Set(["field_id", "kind", "summary", "owner_ref"]);
const privateFieldNames = new Set([
  "cookie", "cookies", "token", "tokens", "password", "profile", "profile_path",
  "storage", "storage_value", "dom", "har", "video", "raw_payload", "network_body",
  "secret", "credential", "authorization", "auth", "api_key", "access_key",
  "verification_code", "otp", "one_time_password", "passcode", "session_token",
]);
const privateFieldIdFragments = [
  "cookie", "token", "password", "secret", "credential", "authorization",
  "apikey", "accesskey", "profilepath", "storagevalue", "rawpayload", "networkbody",
  "verificationcode", "onetimepassword", "passcode", "sessiontoken",
];

function hasOnlyKeys(value: JsonRecord, allowed: ReadonlySet<string>) {
  return Object.keys(value).every((key) => allowed.has(key));
}

function findPrivateField(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findPrivateField(item);
      if (found) return found;
    }
    return undefined;
  }
  const record = asRecord(value);
  if (!record) return undefined;
  for (const [key, child] of Object.entries(record)) {
    if (privateFieldNames.has(key.toLowerCase())) return key;
    const found = findPrivateField(child);
    if (found) return found;
  }
  return undefined;
}

function isPrivateFieldId(fieldId: string) {
  const segments = fieldId.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const normalized = fieldId.toLowerCase().replaceAll(/[^a-z0-9]/g, "");
  return privateFieldNames.has(fieldId.toLowerCase()) ||
    segments.some((segment) => segment === "auth" || segment === "otp") ||
    privateFieldIdFragments.some((name) => normalized.includes(name));
}

function isBoundedSummary(value: unknown): value is string {
  return typeof value === "string" && value.length >= 1 && value.length <= 512;
}

function isPersistedPublicUrlSummary(value: string) {
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") &&
      !url.username && !url.password && !url.search && !url.hash;
  } catch {
    return false;
  }
}

function isInputKind(value: unknown): value is CoreThreadInputField["kind"] {
  return value === "scalar" || value === "url" || value === "long_text" || value === "file" || value === "attachment";
}

function isFieldId(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/.test(value);
}

function isOwnerRef(value: unknown): value is string {
  return typeof value === "string" && /^(attachment|draft|owner):[A-Za-z0-9][A-Za-z0-9._~:/%-]{0,2047}$/.test(value);
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || isString(value);
}

function isThreadId(value: unknown): value is string {
  return typeof value === "string" && /^thread_[a-f0-9]{32}$/.test(value);
}

function isCapabilityRef(value: unknown): value is string {
  return typeof value === "string" && /^lode:capability\/[A-Za-z0-9][A-Za-z0-9._~/-]{0,2030}$/.test(value);
}

function isIdentityEnvironmentRef(value: unknown): value is string {
  return typeof value === "string" && /^identity-env:[A-Za-z0-9][A-Za-z0-9._~:/-]{0,2030}$/.test(value);
}

function isDateTime(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && Number.isFinite(Date.parse(value));
}

function isOptionalDateTime(value: unknown): value is string | undefined {
  return value === undefined || isDateTime(value);
}

function asRecord(value: unknown): JsonRecord | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as JsonRecord : null;
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isCreationChannel(value: unknown): value is CoreThreadTurn["creation_channel"] {
  return value === "api" || value === "cli" || value === "mcp" || value === "sdk" || value === "app";
}

function isSubmissionState(value: unknown): value is CoreThreadTurn["submission_state"] {
  return value === "submitting" || value === "accepted" || value === "rejected";
}

function isTurnStatus(value: unknown): value is CoreThreadTurn["status"] {
  return value === "submitting" || value === "accepted" || value === "running" || value === "waiting_for_user" || value === "completed" || value === "failed" || value === "cancelled" || value === "status_unknown";
}
