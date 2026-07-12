import { coreReadTaskSpecs, fetchCoreRunProjectionById, isStrictWritePrecheckProjection as strictWritePrecheckProjection, type CoreReadTaskSpec } from "./coreReadTaskClient";
import type { IdentityEnvironmentProjection } from "./identityEnvironmentFixtures";
import { requestOwnerJson } from "./ownerApiClient";
import { runtimeService, type RuntimeSupervisorState } from "./runtimeSupervisorState";
import type { RunProjection, TaskProjection } from "./taskThreadFixtures";

export type CoreTaskSubmitState =
  | { status: "idle"; summary: string }
  | { status: "blocked"; summary: string }
  | { status: "submitting"; summary: string }
  | { status: "polling"; summary: string; runId: string }
  | { status: "ready"; summary: string; runId: string; run: RunProjection }
  | { status: "failed"; summary: string; runId?: string; run?: RunProjection };

type SubmitReadiness =
  | { ok: true; spec: CoreReadTaskSpec; identity: IdentityEnvironmentProjection; payload: CoreTaskPayload | CoreWritePrecheckPayload }
  | { ok: false; reason: string };

type CoreTaskPayload = {
  run_id: string;
  package_ref: string;
  public_query: { query: string; city_code?: string; page?: 1; limit?: number };
  task_intent: {
    schema_version: "webenvoy.task-intent.v0";
    intent_id: string;
    entrypoint: "app";
    user_intent: {
      summary: string;
    };
    capability: {
      ref: string;
      version: string;
      source_ref: string;
      lock_ref?: string;
    };
    input: {
      summary: string;
      refs?: string[];
    };
    scope: {
      target_type: "site" | "boss_job_search";
      target_ref: string;
    };
    policy: {
      risk: "read";
      execution_intent: "read";
      timeout_ms: number;
    };
    resource_requirement_refs: string[];
    evidence_policy_ref: string;
  };
  harbor: {
    identity_environment_ref: string;
    url: string;
    reuse_existing: true;
  };
};

type CoreDetailTaskPayload = Omit<CoreTaskPayload, "public_query" | "harbor" | "task_intent"> & {
  task_intent: Omit<CoreTaskPayload["task_intent"], "scope"> & {
    scope: { target_type: "xiaohongshu_note_detail"; target_ref: string };
  };
  harbor: { identity_environment_ref: string; reuse_existing: true };
};

type CoreWritePrecheckPayload = Omit<CoreTaskPayload, "public_query" | "harbor" | "task_intent"> & {
  task_intent: Omit<CoreTaskPayload["task_intent"], "scope" | "policy"> & {
    scope: { target_type: "xiaohongshu_publish_note_precheck"; target_ref: string };
    policy: { risk: "write"; execution_intent: "validate_only"; timeout_ms: number };
  };
  validate_only: {
    url: string;
    target_ref: string;
    no_submit_guard: "active";
    requested_fields: ["title", "summary", "canonical_url", "source_status"];
    include_source_refs: true;
    proposed_input_summary: string;
  };
  harbor: { identity_environment_ref: string; url: string; reuse_existing: true };
};

type CoreTaskSubmitOptions = {
  pollAttempts?: number;
  pollIntervalMs?: number;
};

const sensitivePayloadPattern =
  /\b(token|cookie|secret|bearer|credential|password|authorization|profile_storage|raw_evidence|dom|har|trace)\b/i;
const requiredRestrictedFallbackWarnings = ["provider_conflict", "fingerprint_conflict"];
const allowedRestrictedFallbackWarnings = new Set(requiredRestrictedFallbackWarnings);
const supportedBossCityCodes = new Set(["101020100"]);
const xhsWritePrecheckPackageRef = "lode://site-capability/xiaohongshu/publish-note-precheck@0.1.0";
const xhsWritePrecheckLockRef = "lode://lock/site-capability/xiaohongshu/publish-note-precheck@0.1.1";

export const BOSS_DEFERRED_REASON = "目标站点当前访问受限，功能延期";

export function isBossDeferredTask(taskId: string) {
  return taskId === "task-boss-real-read" || taskId === "task-boss-greeting-write-preview";
}

export function projectDeferredBossTask(task: TaskProjection): TaskProjection {
  if (!isBossDeferredTask(task.id)) return task;
  const historicalFailures = task.runs.filter(
    (run) => run.source === "Core live" && (run.failureRecovery != null || run.outcome === "failure-safe" || run.outcome === "unavailable"),
  ).map((run) => {
    return {
      ...run,
      label: `历史失败 · ${run.label}`,
      lifecycle: "blocked" as const,
      resultRows: run.ownerUpdatedAt && !run.resultRows.some((row) => row.label === "Owner updated at")
        ? [{ label: "Owner updated at", value: run.ownerUpdatedAt, source: "Core live" as const }, ...run.resultRows]
        : run.resultRows,
    };
  });
  const deferredRun: RunProjection = {
    id: `boss-deferred-${task.id}`,
    label: "访问受限",
    lifecycle: "blocked",
    outcome: "unavailable",
    summary: BOSS_DEFERRED_REASON,
    actionIntent: "可继续查看身份摘要、手动浏览器现场和历史失败诊断；自动任务命令不可执行。",
    owner: "Core",
    source: "App local-only",
    resultRows: [
      { label: "当前访问", value: "受限", source: "App local-only" },
      { label: "自动任务", value: "延期且不可执行", source: "App local-only" },
    ],
    evidenceCards: [],
    capabilityAttribution: {
      capabilityRef: task.packageSource.capabilityRef,
      version: task.packageSource.version,
      sourceRef: task.packageSource.sourceRef,
      failureClass: "runtime_admission_disabled",
      summary: "保留 capability metadata 仅供历史诊断；不代表当前可运行。",
    },
    failureRecovery: {
      state: "访问受限",
      reason: BOSS_DEFERRED_REASON,
      nextActions: ["保留历史诊断", "等待目标站点恢复评估"],
      source: "App local-only",
    },
    process: ["BOSS production task commands are disabled before Core submission."],
  };
  return {
    ...task,
    blocker: BOSS_DEFERRED_REASON,
    packageSource: {
      ...task.packageSource,
      boundary: `${BOSS_DEFERRED_REASON}；metadata 和历史失败仅供诊断，不构成当前 capability 可用证明。`,
    },
    runs: [deferredRun, ...historicalFailures],
  };
}

export const initialCoreTaskSubmitState: CoreTaskSubmitState = {
  status: "idle",
  summary: "真实只读任务尚未提交；按钮只在 Core admission、Harbor live identity 和只读 submit spec 都可用时启用。",
};

export function coreTaskSubmitReadiness(
  task: TaskProjection,
  runtime: RuntimeSupervisorState,
  identities: IdentityEnvironmentProjection[],
): SubmitReadiness {
  if (isBossDeferredTask(task.id)) return { ok: false, reason: BOSS_DEFERRED_REASON };
  const core = runtimeService(runtime, "core");
  const harbor = runtimeService(runtime, "harbor");
  const spec = coreReadTaskSpecs.find((item) => item.taskId === task.id);

  if (!runtime.canUseLiveRuntime) {
    return { ok: false, reason: "生产 live runtime 不可用；fixture/demo 不可提交为 live task。" };
  }
  if (core?.health.state !== "ready" || core.admission?.state !== "ready") {
    return { ok: false, reason: "Core health/admission 未 ready；提交保持 fail closed。" };
  }
  if (harbor?.health.state !== "ready") {
    return { ok: false, reason: "Harbor runtime health 未 ready；提交保持 fail closed。" };
  }
  if (!spec) {
    return { ok: false, reason: "当前任务缺少 Core submit spec；不构造 task payload。" };
  }
  if (spec.resourceRequirementRefs.length === 0) {
    return { ok: false, reason: "当前任务缺少 Lode resource requirement refs；不构造 Core task payload。" };
  }

  const site = siteForTask(task);
  const identity = identities.find(
    (item) =>
      item.source === "Harbor live" &&
      item.siteId === site &&
      (spec.mode === "write-precheck"
        ? isWritePrecheckIdentityAdmitted(item)
        : isReadOnlyIdentityAdmitted(item, site, spec)),
  );
  if (!identity) {
    return { ok: false, reason: "缺少符合当前任务 admission 的 Harbor live identity；未证明的 warning、needs-auth、fixture/local identity 不可提交真实任务。" };
  }

  if (spec.mode === "write-precheck") {
    const capability = spec.capabilities[0];
    if (
      task.id !== "task-xhs-publish-write-preview" ||
      capability.packageRef !== xhsWritePrecheckPackageRef ||
      capability.lockRef !== xhsWritePrecheckLockRef ||
      task.packageSource.sourceRef !== xhsWritePrecheckPackageRef ||
      task.packageSource.lockRef !== xhsWritePrecheckLockRef
    ) {
      return { ok: false, reason: "小红书写前验证 package/lock 未精确绑定 Lode authoritative refs；已 fail closed。" };
    }
    if (!isWritePrecheckIdentityAdmitted(identity)) {
      return { ok: false, reason: "小红书真实写前验证只接受 ready 的 Harbor live identity；其余状态 fail closed。" };
    }
    const runId = `app-xiaohongshu-precheck-${crypto.randomUUID()}`;
    const url = "https://creator.xiaohongshu.com/publish/publish?from=menu_left&target=image";
    const targetRef = "writable-target:xiaohongshu/creator-publish-note";
    const safeSummary = "校验创作中心发布页和内容编辑目标，生成草稿预览，不保存、不上传、不发布。";
    const payload: CoreWritePrecheckPayload = {
      run_id: runId,
      package_ref: capability.packageRef,
      task_intent: {
        schema_version: "webenvoy.task-intent.v0",
        intent_id: `intent_${runId}`,
        entrypoint: "app",
        user_intent: { summary: safeSummary },
        capability: {
          ref: capability.capabilityRef,
          version: capability.capabilityVersion,
          source_ref: capability.packageRef,
          lock_ref: xhsWritePrecheckLockRef,
        },
        input: { summary: safeSummary },
        scope: { target_type: "xiaohongshu_publish_note_precheck", target_ref: url },
        policy: { risk: "write", execution_intent: "validate_only", timeout_ms: 60_000 },
        resource_requirement_refs: spec.resourceRequirementRefs,
        evidence_policy_ref: spec.evidencePolicyRef,
      },
      validate_only: {
        url,
        target_ref: targetRef,
        no_submit_guard: "active",
        requested_fields: ["title", "summary", "canonical_url", "source_status"],
        include_source_refs: true,
        proposed_input_summary: safeSummary,
      },
      harbor: { identity_environment_ref: identity.identityEnvironmentRef, url, reuse_existing: true },
    };
    return containsSensitiveField(payload)
      ? { ok: false, reason: "Core write-precheck payload 含敏感字段；已 fail closed。" }
      : { ok: true, spec, identity, payload };
  }

  const bossQuery = site === "boss" ? parseBossJobSearchInput(task.businessInput) : null;
  if (site === "boss" && !bossQuery?.ok) {
    return { ok: false, reason: bossQuery?.reason ?? "BOSS 搜索输入无效；已 fail closed。" };
  }
  const query = bossQuery?.ok ? bossQuery.value.query : task.searchQuery;
  const maxQueryLength = site === "boss" ? 80 : 256;
  if (typeof query !== "string" || query.length === 0 || query !== query.trim() || query.length > maxQueryLength) {
    return { ok: false, reason: `当前任务缺少明确、已修剪且不超过 ${maxQueryLength} 字符的公开搜索 query；不发送自由格式业务输入。` };
  }

  const capability = spec.capabilities[0];
  const runId = `app-${site}-${Date.now().toString(36)}`;
  const inputTargetRef = targetRefForTask(task.businessInput, identity);
  if (inputTargetRef == null) {
    return { ok: false, reason: "业务输入中的 URL 不属于所选 Harbor identity origin；已 fail closed。" };
  }
  const targetUrl = new URL(site === "boss" ? "/web/geek/job" : "/search_result", identity.origin);
  targetUrl.searchParams.set(site === "boss" ? "query" : "keyword", query);
  if (bossQuery?.ok) targetUrl.searchParams.set("city", bossQuery.value.city_code);
  const targetRef = targetUrl.toString();
  const payload: CoreTaskPayload = {
    run_id: runId,
    package_ref: capability.packageRef,
    public_query: bossQuery?.ok ? bossQuery.value : { query },
    task_intent: {
      schema_version: "webenvoy.task-intent.v0",
      intent_id: `intent_${runId}`,
      entrypoint: "app",
      user_intent: {
        summary: task.title,
      },
      capability: {
        ref: capability.capabilityRef,
        version: capability.capabilityVersion,
        source_ref: capability.packageRef,
        ...(task.packageSource.lockRef === undefined ? {} : { lock_ref: task.packageSource.lockRef }),
      },
      input: {
        summary: task.title,
        ...(targetRef === identity.origin ? {} : { refs: [targetRef] }),
      },
      scope: {
        target_type: site === "boss" ? "boss_job_search" : "site",
        target_ref: targetRef,
      },
      policy: {
        risk: "read",
        execution_intent: "read",
        timeout_ms: 60_000,
      },
      resource_requirement_refs: spec.resourceRequirementRefs,
      evidence_policy_ref: spec.evidencePolicyRef,
    },
    harbor: {
      identity_environment_ref: identity.identityEnvironmentRef,
      url: targetRef,
      reuse_existing: true,
    },
  };

  return containsSensitiveField(payload)
    ? { ok: false, reason: "Core task payload 含敏感字段；已 fail closed。" }
    : { ok: true, spec, identity, payload };
}

export function parseBossJobSearchInput(value: string):
  | { ok: true; value: { query: string; city_code: string; page: 1; limit: number } }
  | { ok: false; reason: string } {
  let input: unknown;
  try {
    input = JSON.parse(value);
  } catch {
    return { ok: false, reason: "BOSS 搜索只接受 JSON 结构化输入，不接受自由文本城市。" };
  }
  if (typeof input !== "object" || input == null || Array.isArray(input)) {
    return { ok: false, reason: "BOSS 搜索输入必须是单个 JSON object。" };
  }
  const record = input as Record<string, unknown>;
  const allowedKeys = new Set(["query", "city_code", "page", "limit"]);
  if (Object.keys(record).some((key) => !allowedKeys.has(key))) {
    return { ok: false, reason: "BOSS 搜索包含未知 filter；仅允许 query、city_code、page、limit。" };
  }
  const query = record.query;
  if (typeof query !== "string" || query.length === 0 || query !== query.trim() || query.length > 80) {
    return { ok: false, reason: "BOSS query 必须明确、已修剪且不超过 80 字符。" };
  }
  if (typeof record.city_code !== "string" || !supportedBossCityCodes.has(record.city_code)) {
    return { ok: false, reason: "BOSS city_code 未明确或不在当前支持列表；自由文本城市和未知城市代码均被拒绝。" };
  }
  const page = record.page ?? 1;
  const limit = record.limit ?? 15;
  if (page !== 1 || !Number.isInteger(limit) || typeof limit !== "number" || limit < 1 || limit > 15) {
    return { ok: false, reason: "BOSS 单次搜索仅允许 page=1 且 limit 为 1..15。" };
  }
  return { ok: true, value: { query, city_code: record.city_code, page: 1, limit } };
}

export function isReadOnlyIdentityAdmitted(
  identity: IdentityEnvironmentProjection,
  site: "xiaohongshu" | "boss",
  spec: CoreReadTaskSpec,
) {
  if (spec.mode !== "read") return false;
  if (
    identity.readiness.state === "ready" &&
    identity.provider.state === "ready" &&
    !identity.login.recoveryRequired
  ) {
    return true;
  }
  const facts = identity.admissionFacts;
  const warnings = facts?.warningReasonCodes ?? [];
  const allowsMissingProxy =
    site === "boss" &&
    spec.taskId === "task-boss-real-read" &&
    spec.capabilities.some((capability) => capability.capabilityRef === "lode:capability/job-search");
  return (
    identity.readiness.state === "warning" &&
    identity.provider.state === "warning" &&
    facts?.providerId === "chrome_official" &&
    facts.providerRole === "restricted_fallback" &&
    facts.authenticationProvenance === "user_confirmed_managed_session" &&
    facts.loginState === "logged_in" &&
    facts.manualAuthenticationState === "completed" &&
    facts.recoveryRequired === false &&
    facts.browserStorageState === "present" &&
    requiredRestrictedFallbackWarnings.every((code) => warnings.includes(code)) &&
    warnings.every((code) => allowedRestrictedFallbackWarnings.has(code) || (allowsMissingProxy && code === "proxy_missing"))
  );
}

export function isWritePrecheckIdentityAdmitted(identity: IdentityEnvironmentProjection) {
  const facts = identity.admissionFacts;
  const refs = [identity.identityEnvironmentRef, identity.executionIdentityRef, identity.profileRef];
  const common = (
    identity.source === "Harbor live" &&
    identity.siteId === "xiaohongshu" &&
    identity.login.state === "已登录" &&
    identity.login.manualAuthenticationState === "已完成" &&
    identity.login.recoveryRequired === false &&
    identity.storage.profileStorage === "存在" &&
    facts != null &&
    facts.authenticationProvenance === "user_confirmed_managed_session" &&
    facts.loginState === "logged_in" &&
    facts.manualAuthenticationState === "completed" &&
    facts.recoveryRequired === false &&
    facts.browserStorageState === "present" &&
    refs.every((ref) => safeOwnerRef(ref))
  );
  if (!common) return false;
  if (identity.provider.selected === "CloakBrowser") {
    return identity.readiness.state === "ready" && identity.provider.state === "ready" &&
      facts.providerId === "cloakbrowser" && facts.providerRole === "primary" && facts.warningReasonCodes.length === 0;
  }
  return identity.provider.selected === "官方 Chrome" &&
    identity.readiness.state === "warning" && identity.provider.state === "warning" &&
    facts.providerId === "chrome_official" && facts.providerRole === "restricted_fallback" &&
    requiredRestrictedFallbackWarnings.every((code) => facts.warningReasonCodes.includes(code)) &&
    facts.warningReasonCodes.every((code) => allowedRestrictedFallbackWarnings.has(code));
}

export function readOnlyIdentityAdmissionBlockReason(
  identity: IdentityEnvironmentProjection,
  taskId: string,
) {
  if (isBossDeferredTask(taskId)) return BOSS_DEFERRED_REASON;
  if (identity.source !== "Harbor live") {
    return "缺少 Harbor live identity；fixture/local identity 只能管理或认证，不能启动真实 Core task。";
  }
  if (identity.login.recoveryRequired || identity.readiness.state === "needs-auth") {
    return "需要先在 Harbor 身份浏览器完成登录/人工认证；未登录身份不能启动真实 Core task。";
  }
  const readSpec = coreReadTaskSpecs.find((spec) => spec.taskId === taskId && spec.mode === "read");
  if (!readSpec) {
    return "当前入口不是已登记的真实只读任务；保持 fail closed。";
  }
  if (isReadOnlyIdentityAdmitted(identity, identity.siteId, readSpec)) {
    return null;
  }
  return "身份环境尚未 ready；受限或告警状态不能直接启动真实 Core task。";
}

export async function submitCoreReadOnlyTask(
  endpoint: string,
  task: TaskProjection,
  runtime: RuntimeSupervisorState,
  identities: IdentityEnvironmentProjection[],
  options: CoreTaskSubmitOptions = {},
): Promise<CoreTaskSubmitState> {
  const readiness = coreTaskSubmitReadiness(task, runtime, identities);
  if (!readiness.ok) {
    return { status: "blocked", summary: readiness.reason };
  }

  const submitResponse = await requestJson(endpoint, "/tasks", {
    method: "POST",
    body: JSON.stringify(readiness.payload),
  });
  const runId = runIdFromSubmitResponse(submitResponse) ?? readiness.payload.run_id;

  if (!isOkResponse(submitResponse)) {
    const projection = await fetchCoreRunProjectionById(endpoint, runId, readiness.spec);
    return {
      status: "failed",
      runId,
      ...(projection.ok ? { run: projection.run } : {}),
      summary: responseError(submitResponse, "Core /tasks did not accept the read-only task."),
    };
  }

  const projected = await pollSubmittedRun(endpoint, runId, readiness.spec, options);
  return projected.ok
    ? {
        status: "ready",
        runId,
        run: projected.run,
        summary: `Core accepted /tasks and returned live run ${runId}; result/evidence/failure/session refs were polled from owner endpoints.`,
      }
    : projected.terminal ? {
        status: "failed",
        runId,
        summary: projected.error,
      } : {
        status: "polling",
        runId,
        summary: `Core accepted /tasks as ${runId}; owner refs are not queryable yet. ${projected.error}`,
      };
}

export async function submitCoreXhsDetailTask(
  endpoint: string,
  task: TaskProjection,
  detailRef: string,
  runtime: RuntimeSupervisorState,
  identities: IdentityEnvironmentProjection[],
  options: CoreTaskSubmitOptions = {},
): Promise<CoreTaskSubmitState> {
  if (!/^detail_ref_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(detailRef)) {
    return { status: "blocked", summary: "Core detail target 无效；只接受搜索 owner result 返回的 opaque detail ref。" };
  }
  const searchReadiness = coreTaskSubmitReadiness(task, runtime, identities);
  if (!searchReadiness.ok || task.id !== "task-xhs-real-read") {
    return { status: "blocked", summary: searchReadiness.ok ? "当前任务不是小红书搜索详情 handoff。" : searchReadiness.reason };
  }
  const detailCapability = searchReadiness.spec.capabilities.find((item) => item.capabilityRef === "lode:capability/read-note-detail");
  if (!detailCapability) return { status: "blocked", summary: "缺少 Lode read-note-detail capability pin。" };
  const runId = `app-xiaohongshu-detail-${crypto.randomUUID()}`;
  const payload: CoreDetailTaskPayload = {
    run_id: runId,
    package_ref: detailCapability.packageRef,
    task_intent: {
      schema_version: "webenvoy.task-intent.v0",
      intent_id: `intent_${runId}`,
      entrypoint: "app",
      user_intent: { summary: "读取搜索结果中的小红书笔记详情" },
      capability: {
        ref: detailCapability.capabilityRef,
        version: detailCapability.capabilityVersion,
        source_ref: detailCapability.packageRef,
        lock_ref: "lode://lock/site-capability/xiaohongshu/read-note-detail@0.1.0",
      },
      input: { summary: "读取搜索结果中的小红书笔记详情", refs: [detailRef] },
      scope: { target_type: "xiaohongshu_note_detail", target_ref: detailRef },
      policy: { risk: "read", execution_intent: "read", timeout_ms: 60_000 },
      resource_requirement_refs: ["xiaohongshu.read-note-detail.resources"],
      evidence_policy_ref: searchReadiness.spec.evidencePolicyRef,
    },
    harbor: { identity_environment_ref: searchReadiness.identity.identityEnvironmentRef, reuse_existing: true },
  };
  if (containsSensitiveField(payload) || /https?:|xsec|public_query/i.test(JSON.stringify(payload))) {
    return { status: "blocked", summary: "详情 payload 包含禁止的公开 URL/query 或敏感字段；已 fail closed。" };
  }
  const response = await requestJson(endpoint, "/tasks", { method: "POST", body: JSON.stringify(payload) });
  const submittedRunId = runIdFromSubmitResponse(response) ?? runId;
  if (!isOkResponse(response)) return { status: "failed", runId: submittedRunId, summary: responseError(response, "Core /tasks 未接受详情任务。") };
  const projected = await pollSubmittedRun(endpoint, submittedRunId, {
    ...searchReadiness.spec,
    capabilities: [detailCapability],
    resourceRequirementRefs: ["xiaohongshu.read-note-detail.resources"],
  }, options);
  return projected.ok
    ? { status: "ready", runId: submittedRunId, run: projected.run, summary: `Core 已完成详情 run ${submittedRunId}；结果与 refs 来自 owner API。` }
    : projected.terminal
      ? { status: "failed", runId: submittedRunId, summary: projected.error }
      : { status: "polling", runId: submittedRunId, summary: `Core 已受理详情 run ${submittedRunId}；owner refs 尚不可查询。 ${projected.error}` };
}

export async function resumeCoreXhsDetailPolling(
  endpoint: string,
  runId: string,
  options: CoreTaskSubmitOptions = {},
): Promise<CoreTaskSubmitState> {
  const spec = coreReadTaskSpecs.find((item) => item.taskId === "task-xhs-real-read" && item.mode === "read");
  const detailCapability = spec?.capabilities.find((item) => item.capabilityRef === "lode:capability/read-note-detail");
  if (!spec || !detailCapability) return { status: "failed", runId, summary: "缺少 read-note-detail polling spec。" };
  const projected = await pollSubmittedRun(endpoint, runId, {
    ...spec,
    capabilities: [detailCapability],
    resourceRequirementRefs: ["xiaohongshu.read-note-detail.resources"],
  }, options);
  return projected.ok
    ? { status: "ready", runId, run: projected.run, summary: `Core 已完成详情 run ${runId}；结果与 refs 来自 owner API。` }
    : projected.terminal
      ? { status: "failed", runId, summary: projected.error }
      : { status: "polling", runId, summary: `详情 run ${runId} 仍在执行；可继续查询，不会再次提交。 ${projected.error}` };
}

export function promoteSubmittedDetailRun(task: TaskProjection, run: RunProjection): TaskProjection {
  return { ...task, source: "Core live", identitySource: "Harbor live", runs: [run, ...task.runs.filter((item) => item.id !== run.id)] };
}

export function promoteSubmittedCoreTask(task: TaskProjection, run: RunProjection): TaskProjection {
  return {
    ...task,
    source: "Core live",
    identitySource: "Harbor live",
    blocker: undefined,
    runs: [run],
  };
}

function siteForTask(task: TaskProjection): "xiaohongshu" | "boss" {
  return task.id.includes("boss") || task.siteSkill.toLowerCase().includes("boss") ? "boss" : "xiaohongshu";
}

function firstHttpUrl(value: string) {
  return /https?:\/\/[^\s；;，,]+/.exec(value)?.[0];
}

function targetRefForTask(value: string, identity: IdentityEnvironmentProjection): string | null {
  const explicitUrl = firstHttpUrl(value);
  if (explicitUrl == null) return identity.origin;
  return isSameOrigin(explicitUrl, identity.origin) ? explicitUrl : null;
}

function isSameOrigin(candidate: string, expectedOrigin: string): boolean {
  try {
    return new URL(candidate).origin === new URL(expectedOrigin).origin;
  } catch {
    return false;
  }
}

function containsSensitiveField(value: unknown): boolean {
  if (typeof value === "string") return false;
  if (Array.isArray(value)) return value.some(containsSensitiveField);
  if (typeof value !== "object" || value == null) return false;
  return Object.entries(value).some(([key, entry]) => sensitivePayloadPattern.test(key) || containsSensitiveField(entry));
}

async function pollSubmittedRun(
  endpoint: string,
  runId: string,
  spec: CoreReadTaskSpec,
  options: CoreTaskSubmitOptions,
) {
  let lastError = "";
  const attempts = Math.max(1, options.pollAttempts ?? 30);
  const intervalMs = Math.max(0, options.pollIntervalMs ?? 1000);
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const statusResponse = await requestJson(endpoint, `/runs/${encodeURIComponent(runId)}`, { method: "GET" });
    const status = runStatus(statusResponse);
    if (status && ["failed", "blocked", "cancelled", "expired", "unknown_outcome", "requires_user_action", "manual_recovery_required"].includes(status)) {
      return { ok: false as const, terminal: true as const, error: `Core run ${runId} terminated as ${status}` };
    }
    if (status !== "succeeded") {
      lastError = `Core run ${runId} is ${status ?? "not queryable"}`;
      if (attempt + 1 < attempts && intervalMs > 0) await new Promise((resolve) => globalThis.setTimeout(resolve, intervalMs));
      continue;
    }
    const projection = await fetchCoreRunProjectionById(endpoint, runId, spec);
    if (projection.ok && (
      (spec.mode === "read" && projection.run.lifecycle === "completed" && projection.run.outcome === "success") ||
      (spec.mode === "write-precheck" && isStrictWritePrecheckProjection(projection.run, runId))
    )) return projection;
    lastError = projection.ok ? `Core run ${runId} did not produce strict success` : projection.error;
    if (attempt + 1 < attempts && intervalMs > 0) {
      await new Promise((resolve) => globalThis.setTimeout(resolve, intervalMs));
    }
  }
  return { ok: false as const, terminal: false as const, error: `Core run ${runId} was accepted but not ready: ${lastError}` };
}

export function isStrictWritePrecheckProjection(run: RunProjection, expectedRunId: string) {
  return strictWritePrecheckProjection(run, expectedRunId);
}

function safeOwnerRef(value: string) {
  return value.length > 0 && value.length <= 512 && /^[A-Za-z][A-Za-z0-9:._/-]+$/.test(value) && !sensitivePayloadPattern.test(value);
}

function runStatus(value: unknown) {
  if (!isRecord(value) || value.ok !== true) return undefined;
  return stringValue(recordValue(value.run)?.status);
}

async function requestJson(base: string, path: string, init: RequestInit): Promise<unknown> {
  return requestOwnerJson(base, path, {
    method: init.method === "POST" || init.method === "PATCH" || init.method === "DELETE" ? init.method : "GET",
    body: typeof init.body === "string" ? parseJson(init.body) : undefined,
    timeoutMs: path === "/tasks" && init.method === "POST" ? 65_000 : 3500,
  });
}

function parseJson(value: string): unknown {
  try {
    return value ? JSON.parse(value) : undefined;
  } catch {
    return undefined;
  }
}

function runIdFromSubmitResponse(value: unknown): string | undefined {
  if (!isRecord(value)) return undefined;
  const task = recordValue(value.task);
  const run = recordValue(value.run);
  return stringValue(value.run_id) ?? stringValue(task?.run_id) ?? stringValue(run?.run_id);
}

function isOkResponse(value: unknown) {
  return isRecord(value) && value.ok === true;
}

function responseError(value: unknown, fallback: string) {
  if (!isRecord(value)) return fallback;
  const body = recordValue(value.body);
  const error = recordValue(body?.error) ?? recordValue(body?.failure) ?? recordValue(value.error) ?? recordValue(value.failure);
  return stringValue(error?.message) ?? stringValue(error?.code) ?? stringValue(value.error) ?? fallback;
}

function recordValue(value: unknown): Record<string, unknown> | null {
  return isRecord(value) ? value : null;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
