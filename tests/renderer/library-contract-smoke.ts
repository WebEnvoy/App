import { ownerApiResponseMaxBytes, readBoundedJsonResponse } from "../../src/electron/boundedJsonResponse";
import {
  compatibilityTargetFieldId,
  createSkillIdentityCompatibilityRequest,
  parseSkillIdentityCompatibilityResponse,
  projectCompatibilityTarget,
} from "../../src/renderer/coreIdentityCompatibilityClient";
import { projectLodeCatalogDisplayCache, type LodeCatalogLoadState, type LodeCatalogSkill } from "../../src/renderer/lodeCatalogClient";
import { createLatestRequestGate } from "../../src/renderer/latestRequestGate";
import { browserAttachments, refreshLocalAttachments, selectLocalAttachments } from "../../src/renderer/localFileClient";
import { projectOwnerHttpStatusError } from "../../src/renderer/ownerApiClient";
import { createSkillInputDraft, validateSkillInputDraft } from "../../src/renderer/skillInputDraft";
import { clearSkillInputDraft, loadSkillInputDraft, saveSkillInputDraft } from "../../src/renderer/skillInputDraftStore";
import { compatibilityRecoveryCopy } from "../../src/renderer/skillCompatibilityPresentation";

type SmokeInput = {
  catalog: LodeCatalogLoadState;
  detailSkill: LodeCatalogSkill;
  identityEnvironmentRef: string;
  protectedDrafts: Map<string, unknown>;
  xhsSkill: LodeCatalogSkill;
};

const consumerBoundary =
  "Core returns bounded compatibility reasons and public freshness only; no task, thread, run, session, browser action, credential, cookie, token, profile storage, evidence body, or raw owner response is created or exposed.";

export async function runLibraryContractSmoke(input: SmokeInput) {
  const request = checkRequestProjection(input);
  checkResponseProjection(request);
  await checkDraftProjection(input);
  await checkOwnerBoundaries(input.catalog);
}

function checkRequestProjection({ detailSkill, identityEnvironmentRef, xhsSkill }: SmokeInput) {
  const request = createSkillIdentityCompatibilityRequest(xhsSkill, [identityEnvironmentRef]);
  if (request == null) throw new Error("Compatibility request was not projected from owner metadata.");
  const ambiguousAction = createSkillIdentityCompatibilityRequest({ ...xhsSkill, actions: [...xhsSkill.actions, xhsSkill.actions[0]!] }, [identityEnvironmentRef]);
  const ambiguousProfile = createSkillIdentityCompatibilityRequest({
    ...xhsSkill,
    actions: [{ ...xhsSkill.actions[0]!, resourceRequirementProfileIds: ["profile-a", "profile-b"] }],
  }, [identityEnvironmentRef]);
  const detailUrl = "https://www.xiaohongshu.com/explore/66aa00000000000001000111?xsec_token=public";
  const detailRef = "detail_ref_123e4567-e89b-12d3-a456-426614174000";
  const detailRequest = createSkillIdentityCompatibilityRequest(detailSkill, [identityEnvironmentRef], detailRef);
  const extraTargetField = { ...detailSkill, inputFields: [...detailSkill.inputFields, { ...detailSkill.inputFields[0]!, id: "alternate_url" }] };
  if (ambiguousAction != null || ambiguousProfile != null ||
    createSkillIdentityCompatibilityRequest(detailSkill, [identityEnvironmentRef]) != null ||
    createSkillIdentityCompatibilityRequest(detailSkill, [identityEnvironmentRef], detailUrl) != null ||
    detailRequest?.target_ref !== detailRef || projectCompatibilityTarget(detailSkill, detailUrl).status !== "direct_url_unavailable" ||
    projectCompatibilityTarget(detailSkill, "https://www.xiaohongshu.com/profile/id").status !== "invalid" ||
    projectCompatibilityTarget(detailSkill, "https://example.test/explore/id").status !== "invalid" ||
    compatibilityTargetFieldId(detailSkill) !== "url" || compatibilityTargetFieldId(extraTargetField) !== undefined) {
    throw new Error("Exact-target compatibility accepted an ambiguous action, URL target_ref, or invalid target context.");
  }
  return request;
}

function checkResponseProjection(request: NonNullable<ReturnType<typeof createSkillIdentityCompatibilityRequest>>) {
  const response = compatibilityResponse(request);
  const now = Date.parse("2026-07-20T00:00:30.000Z");
  const parsed = parseSkillIdentityCompatibilityResponse(response, request, now);
  const rejects = (candidate: Record<string, unknown>) => parseSkillIdentityCompatibilityResponse({
    ...response,
    candidates: [{ ...response.candidates[0], ...candidate }],
  }, request, now) === null;
  const invalidSemantics = [
    rejects({ status: "compatible", missing_requirement_categories: ["runtime_facts"], recovery_action: "none" }),
    rejects({ status: "compatible", missing_requirement_categories: [], fact_freshness: [], recovery_action: "retry_at_task_submission" }),
    rejects({ status: "unknown_until_runtime", fact_freshness: [] }),
    rejects({ status: "unknown_until_runtime", recovery_action: "none" }),
    rejects({ freshness: { state: "fresh", observed_at: "2026-07-20T00:00:00.000Z", age_ms: 60_000 } }),
  ].every(Boolean);
  const malformed = parseSkillIdentityCompatibilityResponse({
    ...response,
    candidates: [{ ...response.candidates[0], credential: "forbidden" }],
  }, request, now);
  const stale = parseSkillIdentityCompatibilityResponse({
    ...response,
    candidates: [{ ...response.candidates[0], owner_status: { lode: "available", harbor: "stale" }, freshness: { state: "stale", observed_at: "2026-07-20T00:00:00.000Z", age_ms: 30_000 } }],
  }, request, now);
  const expired = parseSkillIdentityCompatibilityResponse({ ...response, generated_at: "2026-07-19T00:00:00.000Z" }, request, now);
  if (parsed?.[0]?.status !== "unknown_until_runtime" || malformed !== null || stale !== null || expired !== null || !invalidSemantics) {
    throw new Error("Compatibility response validation accepted stale, malformed, or contradictory owner data.");
  }
}

function compatibilityResponse(request: NonNullable<ReturnType<typeof createSkillIdentityCompatibilityRequest>>) {
  return {
    schema_version: "webenvoy.identity-compatibility-preview.v0",
    package_ref: request.package_ref,
    lock_ref: request.lock_ref,
    version: request.version,
    operation_id: request.operation_id,
    operation_mode: request.operation_mode,
    target_ref: request.target_ref,
    target_origin: request.target_origin,
    resource_requirement_ref: request.resource_requirement_ref,
    resource_requirement_profile_id: request.resource_requirement_profile_id,
    generated_at: "2026-07-20T00:00:00.000Z",
    candidates: [{
      identity_environment_ref: request.identity_environment_refs[0],
      status: "unknown_until_runtime",
      reason_codes: ["runtime_facts_require_task_admission"],
      missing_requirement_categories: ["runtime_facts"],
      fact_freshness: [{ fact_key: "runtime.execution_surface.available", required_freshness: "current_execution_window", state: "unknown_until_runtime" }],
      owner_status: { lode: "available", harbor: "available" },
      freshness: { state: "fresh", observed_at: "2026-07-20T00:00:00.000Z", age_ms: 0 },
      recovery_action: "retry_at_task_submission",
    }],
    consumer_boundary: consumerBoundary,
  };
}

async function checkDraftProjection({ protectedDrafts, xhsSkill }: SmokeInput) {
  const skill: LodeCatalogSkill = {
    ...xhsSkill,
    inputFields: [
      { id: "body", label: "Body", kind: "multiline", required: true, description: "Long text", minLength: 2, maxLength: 10 },
      { id: "attachments", label: "Attachments", kind: "file", required: true, description: "Declared files" },
      { id: "sections", label: "Sections", kind: "multi-select", required: true, description: "Declared options", options: ["title", "summary", "links"], defaultValue: ["title"], minItems: 1, maxItems: 2, uniqueItems: true },
      { id: "guard", label: "Guard", kind: "constant", required: true, description: "Declared constant", defaultValue: "active" },
      { id: "accessToken", label: "Access token", kind: "text", required: false, description: "Credential" },
      { id: "detailUrl", label: "Detail URL", kind: "text", required: false, description: "Public URL" },
      { id: "downloadUrl", label: "Download URL", kind: "text", required: false, description: "Public URL" },
      { id: "awsUrl", label: "AWS URL", kind: "text", required: false, description: "Public URL" },
      { id: "gcsUrl", label: "GCS URL", kind: "text", required: false, description: "Public URL" },
      { id: "oauthUrl", label: "OAuth URL", kind: "text", required: false, description: "Public URL" },
      { id: "fragmentSasUrl", label: "Fragment SAS URL", kind: "text", required: false, description: "Public URL" },
      { id: "securityId", label: "Security ID", kind: "text", required: false, description: "Credential" },
    ],
  };
  const draft = createSkillInputDraft(skill);
  const initialErrors = validateSkillInputDraft(skill, draft);
  draft.values.body = "draft";
  draft.files.attachments = browserAttachments([new File(["public"], "public.txt", { type: "text/plain" })]);
  if (Object.keys(validateSkillInputDraft(skill, draft)).length !== 0) throw new Error("Valid structured draft was rejected.");
  draft.values.sections = ["title", "summary", "links"];
  const excessive = validateSkillInputDraft(skill, draft).sections;
  draft.values.sections = ["title", "title"];
  const duplicate = validateSkillInputDraft(skill, draft).sections;
  draft.values.sections = ["title"];
  draft.values.guard = "changed";
  const constant = validateSkillInputDraft(skill, draft).guard;
  draft.values.guard = "active";
  draft.values.accessToken = "secret-token";
  draft.values.detailUrl = "https://www.xiaohongshu.com/explore/id?xsec_token=secret";
  draft.values.downloadUrl = "https://blob.example.test/file?sv=2024-11-04&sp=r&sig=synthetic-secret";
  draft.values.awsUrl = "https://s3.example.test/file?X-Amz-Signature=synthetic-secret";
  draft.values.gcsUrl = "https://storage.example.test/file?X-Goog-Signature=synthetic-secret";
  draft.values.oauthUrl = "https://auth.example.test/callback#access_token=synthetic-secret";
  draft.values.fragmentSasUrl = "https://blob.example.test/file#?sv=2024-11-04&sig=synthetic-secret";
  draft.values.securityId = "secret-id";
  await saveSkillInputDraft(skill, "restart-safe-identity", draft);
  const originalSave = window.webenvoyShell?.saveProtectedDraft;
  if (window.webenvoyShell != null) window.webenvoyShell.saveProtectedDraft = async () => ({ status: "unavailable" });
  const unavailablePersistence = await saveSkillInputDraft(skill, "memory-only-identity", draft);
  const memoryOnlyDraft = await loadSkillInputDraft(skill, "memory-only-identity");
  let raceCall = 0;
  if (window.webenvoyShell != null) window.webenvoyShell.saveProtectedDraft = async () => {
    const call = ++raceCall;
    if (call === 1) await new Promise((resolve) => setTimeout(resolve, 20));
    return { status: call === 1 ? "ready" : "unavailable" };
  };
  const olderDraft = createSkillInputDraft(skill);
  olderDraft.values.body = "older";
  const newerDraft = createSkillInputDraft(skill);
  newerDraft.values.body = "newer";
  await Promise.all([
    saveSkillInputDraft(skill, "save-race-identity", olderDraft),
    saveSkillInputDraft(skill, "save-race-identity", newerDraft),
  ]);
  const racedDraft = await loadSkillInputDraft(skill, "save-race-identity");
  const loadRaceIdentity = "clear-load-race-identity";
  const loadRaceContext = { packageRef: skill.packageRef, version: skill.version, identityId: loadRaceIdentity };
  protectedDrafts.set(`${skill.packageRef}:${skill.version}:${loadRaceIdentity}`, {
    context: loadRaceContext, values: { body: "stale-before-clear" }, attachments: {}, omittedFieldIds: [],
  });
  const originalLoad = window.webenvoyShell?.loadProtectedDraft;
  let releaseLoad: (() => void) | undefined;
  let loadStarted: (() => void) | undefined;
  const loadStartedPromise = new Promise<void>((resolve) => { loadStarted = resolve; });
  const releaseLoadPromise = new Promise<void>((resolve) => { releaseLoad = resolve; });
  if (window.webenvoyShell != null && originalLoad != null) window.webenvoyShell.loadProtectedDraft = async (context) => {
    const stale = await originalLoad(context);
    loadStarted?.();
    await releaseLoadPromise;
    return stale;
  };
  const staleLoad = loadSkillInputDraft(skill, loadRaceIdentity);
  await loadStartedPromise;
  await clearSkillInputDraft(skill, loadRaceIdentity);
  releaseLoad?.();
  const clearedLoad = await staleLoad;
  if (window.webenvoyShell != null) window.webenvoyShell.loadProtectedDraft = originalLoad;
  const originalSelect = window.webenvoyShell?.selectLocalFiles;
  if (window.webenvoyShell != null) window.webenvoyShell.selectLocalFiles = async () => ({ status: "unavailable", files: [] });
  const browserFileFallback = await selectLocalAttachments();
  if (window.webenvoyShell != null) window.webenvoyShell.selectLocalFiles = originalSelect;
  if (window.webenvoyShell != null) window.webenvoyShell.saveProtectedDraft = originalSave;
  const persisted = [...protectedDrafts.values()].find((value) => JSON.stringify(value).includes("restart-safe-identity"));
  const refreshed = await refreshLocalAttachments([{ id: "missing", localRef: "local_file_ref_00000000-0000-4000-8000-000000000002", name: "missing.txt", size: 1, type: "text/plain", lastModified: 1, state: "reselect" }]);
  const persistedText = JSON.stringify(persisted);
  if (initialErrors.body == null || initialErrors.attachments == null || excessive == null || duplicate == null || constant == null ||
    !JSON.stringify(persisted).includes("draft") || !JSON.stringify(persisted).includes("public.txt") ||
    /secret-token|xsec_token|synthetic-secret|secret-id/.test(persistedText) || !persistedText.includes("accessToken") ||
    !persistedText.includes("detailUrl") || !persistedText.includes("downloadUrl") || !persistedText.includes("awsUrl") ||
    !persistedText.includes("gcsUrl") || !persistedText.includes("securityId") ||
    !persistedText.includes("oauthUrl") || !persistedText.includes("fragmentSasUrl") ||
    unavailablePersistence !== "unavailable" || memoryOnlyDraft.persistence !== "unavailable" ||
    !memoryOnlyDraft.omittedFieldIds.includes("accessToken") || racedDraft.draft.values.body !== "newer" || racedDraft.persistence !== "unavailable" ||
    clearedLoad.restored || clearedLoad.draft.values.body === "stale-before-clear" || browserFileFallback !== null ||
    Object.keys(window.localStorage).some((key) => key.includes("skillInputDraft")) || refreshed[0]?.state !== "unreadable") {
    throw new Error("Draft validation, protected persistence, or attachment revalidation failed.");
  }
}

async function checkOwnerBoundaries(catalog: LodeCatalogLoadState) {
  const cache = JSON.stringify(projectLodeCatalogDisplayCache({
    ...catalog,
    credential: "top-secret",
    skills: catalog.skills.map((skill) => ({ ...skill, token: "skill-secret" })),
  } as LodeCatalogLoadState));
  const gate = createLatestRequestGate();
  const superseded = gate.begin();
  const latest = gate.begin();
  const supersededCorrectly = superseded.signal.aborted && !superseded.isCurrent() && latest.isCurrent();
  gate.invalidate();
  const safeError = projectOwnerHttpStatusError("/owner", 409, { error: { category: "owner_contract", code: "identity_not_ready", message: "Bearer raw-secret" }, token: "raw-secret" });
  const unsafeError = projectOwnerHttpStatusError("/owner", 409, { error: { category: "Bearer raw-secret", code: "token=raw-secret" } });
  const recoveries = [
    compatibilityRecoveryCopy({ identityEnvironmentRef: "a", status: "incompatible", reasonCodes: [], recoveryAction: "repair_package_contract" })?.destination,
    compatibilityRecoveryCopy({ identityEnvironmentRef: "a", status: "incompatible", reasonCodes: [], recoveryAction: "select_matching_identity" })?.destination,
    compatibilityRecoveryCopy({ identityEnvironmentRef: "a", status: "requires_setup", reasonCodes: [], recoveryAction: "install_or_select_provider" })?.destination,
  ];
  let cancelled = false;
  await readBoundedJsonResponse(new Response(new ReadableStream<Uint8Array>({
    start(controller) { controller.enqueue(new Uint8Array(64 * 1024 + 1)); },
    cancel() { cancelled = true; },
  }), { headers: { "content-type": "application/json" } }), ownerApiResponseMaxBytes("/identity-compatibility-preview")).then(
    () => { throw new Error("Oversized owner response was accepted."); },
    () => undefined,
  );
  if (/secret|credential|token|pattern/.test(cache) || !supersededCorrectly || latest.isCurrent() ||
    safeError !== "/owner returned 409: owner_contract: identity_not_ready" || unsafeError !== "/owner returned 409" ||
    recoveries.join(",") !== "skill_repair,identity_selection,identity" || !cancelled ||
    ownerApiResponseMaxBytes("/threads") <= 64 * 1024 || ownerApiResponseMaxBytes("/runtime/identity-environments") <= 64 * 1024) {
    throw new Error("Display cache, request freshness, recovery projection, or response budget boundary failed.");
  }
}
