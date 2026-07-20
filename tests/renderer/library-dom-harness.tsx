import { useState } from "react";
import { createRoot } from "react-dom/client";

import { ownerApiResponseMaxBytes, readBoundedJsonResponse } from "../../src/electron/boundedJsonResponse";
import { identityEnvironmentFixtures } from "../../src/renderer/identityEnvironmentFixtures";
import {
  compatibilityTargetFieldId,
  createAwaitingTargetCompatibility,
  createSkillIdentityCompatibilityRequest,
  parseSkillIdentityCompatibilityResponse,
} from "../../src/renderer/coreIdentityCompatibilityClient";
import { CreateTaskShell, type CreateTaskSelection } from "../../src/renderer/CreateTaskShell";
import {
  projectLodeCatalogDisplayCache,
  type LodeCatalogLoadState,
  type LodeCatalogSkill,
} from "../../src/renderer/lodeCatalogClient";
import { createLatestRequestGate } from "../../src/renderer/latestRequestGate";
import { projectOwnerHttpStatusError } from "../../src/renderer/ownerApiClient";
import { createSkillInputDraft, validateSkillInputDraft } from "../../src/renderer/skillInputDraft";
import type { RuntimeSupervisorState } from "../../src/renderer/runtimeSupervisorState";
import { SiteSkillLibrary } from "../../src/renderer/SiteSkillPages";
import "../../src/renderer/uiFoundation.css";
import "../../src/renderer/styles.css";
import "../../src/renderer/workbench.css";

const xhsSkill: LodeCatalogSkill = {
  id: "lode://site-capability/xiaohongshu/search-notes@0.1.0",
  packageRef: "lode://site-capability/xiaohongshu/search-notes@0.1.0",
  lockRef: "lode://lock/site-capability/xiaohongshu/search-notes@0.1.0",
  siteSlug: "xiaohongshu",
  siteName: "Xiaohongshu",
  name: "Search Xiaohongshu notes",
  summary: "Owner metadata summary",
  category: "Social search",
  version: "0.1.0",
  latestVersion: "0.1.0",
  lifecycle: "proposed",
  facets: ["site:xiaohongshu"],
  sourceHealth: "contract_ready",
  updatedAt: "2026-07-20T00:00:00Z",
  availability: "available",
  availabilityReason: "输入、输出与业务动作声明可用。",
  inputSchemaId: "lode://schema/site-capability/xiaohongshu/search-notes/input@0.1.0",
  inputFields: [
    { id: "url", label: "Entry URL", kind: "text", required: true, description: "Owner-provided entry URL", format: "uri" },
    { id: "keyword", label: "Keyword", kind: "text", required: true, description: "Owner-provided search keyword", minLength: 1, maxLength: 80 },
    { id: "limit", label: "Limit", kind: "number", required: false, description: "Owner-provided result limit", minimum: 1, maximum: 20, integer: true },
  ],
  outputSchemaId: "lode://schema/site-capability/xiaohongshu/search-notes/output@0.1.0",
  outputKind: "xhs_note_search",
  resultView: { mode: "standard", fallback: "standard_renderer", reason: "not_declared" },
  actions: [{
    id: "xhs_search_notes",
    category: "read",
    operationMode: "read",
    targetTypes: ["search_results_page"],
    supportedOrigins: ["https://www.xiaohongshu.com"],
    externalEffects: [],
    resourceRequirementRef: "xiaohongshu.search-notes.resources",
    resourceRequirementProfileIds: ["search-notes-logged-in-ready-page"],
  }],
};
const bossSkill: LodeCatalogSkill = {
  ...xhsSkill,
  id: "lode://site-capability/boss/job-search@0.1.0",
  packageRef: "lode://site-capability/boss/job-search@0.1.0",
  lockRef: "lode://lock/site-capability/boss/job-search@0.1.0",
  siteSlug: "boss",
  siteName: "BOSS",
  name: "Search jobs",
  availability: "available",
  availabilityReason: "输入、输出与业务动作声明可用。",
  actions: [{
    ...xhsSkill.actions[0]!,
    id: "boss_job_search",
    supportedOrigins: ["https://www.zhipin.com"],
    resourceRequirementRef: "boss.job-search.resources",
    resourceRequirementProfileIds: ["job-search-logged-in-ready-page"],
  }],
};
const detailSkill: LodeCatalogSkill = {
  ...xhsSkill,
  id: "lode://site-capability/xiaohongshu/read-note-detail@0.1.0",
  packageRef: "lode://site-capability/xiaohongshu/read-note-detail@0.1.0",
  name: "Read note detail",
  category: "Content detail",
  inputFields: [
    { id: "url", label: "Detail URL", kind: "text", required: true, description: "Exact detail URL", format: "uri" },
  ],
  actions: [{ ...xhsSkill.actions[0]!, id: "xhs_read_note_detail", targetTypes: ["note_detail_page"] }],
};
const sampleSkill: LodeCatalogSkill = {
  ...xhsSkill,
  id: "lode://site-capability/example/read-public-page@0.1.0",
  packageRef: "lode://site-capability/example/read-public-page@0.1.0",
  siteSlug: "example",
  siteName: "Example Domain",
  name: "示例技能",
  facets: ["sample"],
};
const catalog: LodeCatalogLoadState = {
  status: new URLSearchParams(window.location.search).has("stale") ? "stale" : "ready",
  fetchedAt: "2026-07-20T00:00:00Z",
  source: "packaged-path",
  summary: "读取 2 个站点技能。",
  skills: [xhsSkill, detailSkill, bossSkill, sampleSkill],
};
const identity = { ...identityEnvironmentFixtures[0], source: "Harbor live" as const };
const identityB = {
  ...identity,
  id: "identity-xhs-ops-b",
  accountLabel: "运营号 B",
  identityEnvironmentRef: "harbor://identity-environment/xhs-ops-b",
};
const runtime: RuntimeSupervisorState = {
  mode: "real",
  checkedAt: "2026-07-20T00:00:00Z",
  services: [],
  lodeAssets: {
    state: "ready",
    source: "packaged-path",
    packageCount: 2,
    requiredPackageRefs: [],
    missingPackageRefs: [],
    checkedAt: "2026-07-20T00:00:00Z",
    summary: "ready",
    consumerBoundary: "test",
  },
  canUseLiveRuntime: true,
  failClosed: false,
  summary: "ready",
};
function Harness() {
  const [selection, setSelection] = useState("");
  const [createSelection, setCreateSelection] = useState<CreateTaskSelection | null>(null);
  const compatibilityBySkill = Object.fromEntries(catalog.skills.map((skill) => [
    skill.id,
    skill === detailSkill
      ? createAwaitingTargetCompatibility([identity.identityEnvironmentRef, identityB.identityEnvironmentRef])
      : {
          status: "ready" as const,
          summary: "兼容性已检查。",
          candidates: [identity, identityB].map((item, index) => ({
            identityEnvironmentRef: item.identityEnvironmentRef,
            status: index === 0 ? "unknown_until_runtime" as const : "requires_setup" as const,
            reasonCodes: index === 0 ? ["runtime_facts_require_task_admission"] : ["authentication_required"],
            recoveryAction: index === 0 ? "retry_at_task_submission" as const : "open_manual_auth" as const,
          })),
        },
  ]));
  return (
    <main style={{ width: "100vw", height: "100vh", overflow: "auto", background: "var(--we-surface-primary)" }}>
      {createSelection == null ? (
        <SiteSkillLibrary
          catalog={catalog}
          compatibilityBySkill={compatibilityBySkill}
          identities={[identity, identityB]}
          runtimeSupervisorState={runtime}
          onCreateIdentity={() => setSelection("create-identity")}
          onNavigation={() => {}}
          onRecoverCandidate={(_skill, identityId, candidate) => setSelection(`${identityId}:${candidate.recoveryAction}`)}
          onUse={(skill, identityId) => {
            setSelection(`${skill.packageRef}:${identityId}`);
            setCreateSelection({ skill, identityId });
          }}
        />
      ) : (
        <CreateTaskShell
          catalog={catalog}
          compatibilityBySkill={compatibilityBySkill}
          identities={[identity, identityB]}
          selection={createSelection}
          runtimeSupervisorState={runtime}
          onSelect={() => {}}
          onCreateIdentity={() => setSelection("create-identity")}
          onCheckCompatibility={async (skill, identityId) => ({
            status: "ready",
            summary: "目标已检查。",
            candidates: [{
              identityEnvironmentRef: [identity, identityB].find((item) => item.id === identityId)!.identityEnvironmentRef,
              status: "compatible",
              reasonCodes: [],
              recoveryAction: "none",
            }],
          })}
          onRecover={() => setSelection("check-task-owner")}
          onRecoverCandidate={(_skill, identityId, candidate) => setSelection(`${identityId}:${candidate.recoveryAction}`)}
          onTargetChange={() => {}}
        />
      )}
      <output data-library-selection="">{selection}</output>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<Harness />);

declare global {
  interface Window {
    __runLibraryDomSmoke: (mode: "desktop" | "narrow" | "stale") => Promise<Record<string, unknown>>;
  }
}

window.__runLibraryDomSmoke = async (mode) => {
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const bodyText = document.body.textContent ?? "";
  const xhsRow = Array.from(document.querySelectorAll<HTMLButtonElement>(".production-skill-row-main"))
    .find((button) => button.textContent?.includes(xhsSkill.name));
  const bossUse = Array.from(document.querySelectorAll<HTMLButtonElement>(".production-skill-row .production-primary-button"))
    .find((button) => button.closest(".production-skill-row")?.textContent?.includes(bossSkill.name));
  const xhsUse = Array.from(document.querySelectorAll<HTMLButtonElement>(".production-skill-row .production-primary-button"))
    .find((button) => button.closest(".production-skill-row")?.textContent?.includes(xhsSkill.name));
  const contentBrowseFilters = Array.from(document.querySelectorAll(".production-library-filters button"))
    .filter((button) => button.textContent === xhsSkill.category);
  const searchHeight = document.querySelector(".production-library-search")?.getBoundingClientRect().height ?? 0;
  const compatibilityRequest = createSkillIdentityCompatibilityRequest(xhsSkill, [identity.identityEnvironmentRef]);
  if (compatibilityRequest == null) throw new Error("Compatibility request was not projected from owner metadata.");
  if (
    createSkillIdentityCompatibilityRequest({ ...xhsSkill, actions: [...xhsSkill.actions, xhsSkill.actions[0]!] }, [identity.identityEnvironmentRef]) != null ||
    createSkillIdentityCompatibilityRequest({
      ...xhsSkill,
      actions: [{ ...xhsSkill.actions[0]!, resourceRequirementProfileIds: ["profile-a", "profile-b"] }],
    }, [identity.identityEnvironmentRef]) != null
  ) {
    throw new Error("Ambiguous action or resource profile was accepted for compatibility preview.");
  }
  const detailUrl = "https://www.xiaohongshu.com/explore/66aa00000000000001000111?xsec_token=public";
  const detailRequest = createSkillIdentityCompatibilityRequest(detailSkill, [identity.identityEnvironmentRef], detailUrl);
  if (
    createSkillIdentityCompatibilityRequest(detailSkill, [identity.identityEnvironmentRef]) != null ||
    createSkillIdentityCompatibilityRequest(detailSkill, [identity.identityEnvironmentRef], "https://example.test/detail") != null ||
    detailRequest?.target_ref !== detailUrl ||
    compatibilityTargetFieldId(detailSkill) !== "url" ||
    compatibilityTargetFieldId({
      ...detailSkill,
      inputFields: [...detailSkill.inputFields, { ...detailSkill.inputFields[0]!, id: "alternate_url" }],
    }) !== undefined
  ) {
    throw new Error("Detail compatibility did not require and preserve an exact target.");
  }
  const compatibilityResponse = {
    schema_version: "webenvoy.identity-compatibility-preview.v0",
    package_ref: compatibilityRequest.package_ref,
    lock_ref: compatibilityRequest.lock_ref,
    version: compatibilityRequest.version,
    operation_id: compatibilityRequest.operation_id,
    operation_mode: compatibilityRequest.operation_mode,
    target_ref: compatibilityRequest.target_ref,
    target_origin: compatibilityRequest.target_origin,
    resource_requirement_ref: compatibilityRequest.resource_requirement_ref,
    resource_requirement_profile_id: compatibilityRequest.resource_requirement_profile_id,
    generated_at: "2026-07-20T00:00:00.000Z",
    candidates: [{
      identity_environment_ref: identity.identityEnvironmentRef,
      status: "unknown_until_runtime",
      reason_codes: ["runtime_facts_require_task_admission"],
      missing_requirement_categories: ["runtime_facts"],
      fact_freshness: [{
        fact_key: "runtime.execution_surface.available",
        required_freshness: "current_execution_window",
        state: "unknown_until_runtime",
      }],
      owner_status: { lode: "available", harbor: "available" },
      freshness: { state: "fresh", observed_at: "2026-07-20T00:00:00.000Z", age_ms: 0 },
      recovery_action: "retry_at_task_submission",
    }],
    consumer_boundary: "Core returns bounded compatibility reasons and public freshness only; no task, thread, run, session, browser action, credential, cookie, token, profile storage, evidence body, or raw owner response is created or exposed.",
  };
  const compatibilityNow = Date.parse("2026-07-20T00:00:30.000Z");
  const parsedCompatibility = parseSkillIdentityCompatibilityResponse(compatibilityResponse, compatibilityRequest, compatibilityNow);
  const rejectsCandidate = (candidate: Record<string, unknown>) => parseSkillIdentityCompatibilityResponse({
    ...compatibilityResponse,
    candidates: [{ ...compatibilityResponse.candidates[0], ...candidate }],
  }, compatibilityRequest, compatibilityNow) === null;
  const malformedCompatibility = parseSkillIdentityCompatibilityResponse({
    ...compatibilityResponse,
    candidates: [{ ...compatibilityResponse.candidates[0], credential: "forbidden" }],
  }, compatibilityRequest, compatibilityNow);
  const staleOwnerCompatibility = parseSkillIdentityCompatibilityResponse({
    ...compatibilityResponse,
    candidates: [{
      ...compatibilityResponse.candidates[0],
      owner_status: { lode: "available", harbor: "stale" },
      freshness: { state: "stale", observed_at: "2026-07-20T00:00:00.000Z", age_ms: 30_000 },
    }],
  }, compatibilityRequest, compatibilityNow);
  const expiredCompatibility = parseSkillIdentityCompatibilityResponse({
    ...compatibilityResponse,
    generated_at: "2026-07-19T00:00:00.000Z",
  }, compatibilityRequest, compatibilityNow);
  const invalidCrossConstraints = [
    rejectsCandidate({ status: "compatible", missing_requirement_categories: ["runtime_facts"], recovery_action: "none" }),
    rejectsCandidate({ status: "compatible", fact_freshness: [{
      fact_key: "runtime.execution_surface.available",
      required_freshness: "current_execution_window",
      state: "missing",
    }], missing_requirement_categories: [], recovery_action: "none" }),
    rejectsCandidate({ status: "compatible", missing_requirement_categories: [], fact_freshness: [], recovery_action: "retry_at_task_submission" }),
    rejectsCandidate({ status: "unknown_until_runtime", fact_freshness: [] }),
    rejectsCandidate({ status: "unknown_until_runtime", recovery_action: "none" }),
    rejectsCandidate({
      status: "incompatible",
      reason_codes: ["harbor_owner_unavailable"],
      missing_requirement_categories: ["owner_contract"],
      fact_freshness: [],
      owner_status: { lode: "available", harbor: "unavailable" },
      freshness: { state: "unavailable", observed_at: "2026-07-20T00:00:00.000Z", age_ms: 0 },
      recovery_action: "connect_identity_environment",
    }),
    rejectsCandidate({ freshness: { state: "fresh", observed_at: "2026-07-20T00:00:00.000Z", age_ms: 60_000 } }),
  ].every(Boolean);
  const cacheProjection = projectLodeCatalogDisplayCache({
    ...catalog,
    credential: "top-secret",
    skills: [{
      ...xhsSkill,
      token: "skill-secret",
      inputFields: [{ ...xhsSkill.inputFields[0]!, token: "field-secret" }],
      resultView: { ...xhsSkill.resultView, token: "view-secret" },
      actions: [{ ...xhsSkill.actions[0]!, token: "action-secret" }],
    }],
  } as LodeCatalogLoadState);
  const cacheJson = JSON.stringify(cacheProjection);
  const requestGate = createLatestRequestGate();
  const supersededRequest = requestGate.begin();
  const latestRequest = requestGate.begin();
  const requestGateSuperseded = supersededRequest.signal.aborted && !supersededRequest.isCurrent() && latestRequest.isCurrent();
  requestGate.invalidate();
  const safeBrowserError = projectOwnerHttpStatusError("/owner", 409, {
    error: { category: "owner_contract", code: "identity_not_ready", message: "Bearer raw-secret" },
    token: "raw-secret",
  });
  const unsafeBrowserError = projectOwnerHttpStatusError("/owner", 409, {
    error: { category: "Bearer raw-secret", code: "token=raw-secret" },
  });
  const structuredFieldSkill: LodeCatalogSkill = {
    ...xhsSkill,
    inputFields: [
      { id: "body", label: "Body", kind: "multiline", required: true, description: "Long text", minLength: 2, maxLength: 10 },
      { id: "attachments", label: "Attachments", kind: "file", required: true, description: "Declared files" },
      { id: "sections", label: "Sections", kind: "multi-select", required: true, description: "Declared options", options: ["title", "summary"], defaultValue: ["title"] },
      { id: "guard", label: "Guard", kind: "constant", required: true, description: "Declared constant", defaultValue: "active" },
    ],
  };
  const structuredDraft = createSkillInputDraft(structuredFieldSkill);
  const initialStructuredErrors = validateSkillInputDraft(structuredFieldSkill, structuredDraft);
  structuredDraft.values.body = "draft";
  structuredDraft.files.attachments = [new File(["public"], "public.txt", { type: "text/plain" })];
  const validStructuredErrors = validateSkillInputDraft(structuredFieldSkill, structuredDraft);
  let oversizedCancelled = false;
  await readBoundedJsonResponse(new Response(new ReadableStream<Uint8Array>({
    start(controller) { controller.enqueue(new Uint8Array(64 * 1024 + 1)); },
    cancel() { oversizedCancelled = true; },
  }), { headers: { "content-type": "application/json" } }), ownerApiResponseMaxBytes("/identity-compatibility-preview")).then(
    () => { throw new Error("Oversized owner response was accepted."); },
    () => undefined,
  );
  if (
    !bodyText.includes("发现站点技能") ||
    bodyText.includes("示例技能") ||
    !xhsRow ||
    bossUse?.disabled !== true ||
    (mode === "stale" && xhsUse?.disabled !== true) ||
    contentBrowseFilters.length !== 1 ||
    parsedCompatibility?.[0]?.status !== "unknown_until_runtime" ||
    malformedCompatibility !== null ||
    staleOwnerCompatibility !== null ||
    expiredCompatibility !== null ||
    !invalidCrossConstraints ||
    /secret|credential|token/.test(cacheJson) ||
    !requestGateSuperseded || latestRequest.isCurrent() ||
    safeBrowserError !== "/owner returned 409: owner_contract: identity_not_ready" ||
    unsafeBrowserError !== "/owner returned 409" ||
    initialStructuredErrors.body == null || initialStructuredErrors.attachments == null ||
    Object.keys(validStructuredErrors).length !== 0 ||
    structuredDraft.values.guard !== "active" ||
    ownerApiResponseMaxBytes("/identity-compatibility-preview") !== 64 * 1024 ||
    ownerApiResponseMaxBytes("/threads") <= 64 * 1024 ||
    ownerApiResponseMaxBytes("/runs/run-id/result") <= ownerApiResponseMaxBytes("/threads") / 2 ||
    ownerApiResponseMaxBytes("/runtime/identity-environments") <= 64 * 1024 ||
    !oversizedCancelled ||
    (mode === "narrow" && searchHeight > 50)
  ) {
    throw new Error(`Library directory did not render owner skills or fail closed: ${JSON.stringify({
      hasExpectedCopy: bodyText.includes("发现站点技能"),
      hasSample: bodyText.includes("示例技能"),
      hasXhsRow: Boolean(xhsRow),
      bossDisabled: bossUse?.disabled,
      xhsDisabled: xhsUse?.disabled,
      contentBrowseFilterCount: contentBrowseFilters.length,
      parsedStatus: parsedCompatibility?.[0]?.status,
      malformedAccepted: malformedCompatibility !== null,
      staleAccepted: staleOwnerCompatibility !== null,
      expiredAccepted: expiredCompatibility !== null,
      invalidCrossConstraints,
      cacheJson,
      requestGateSuperseded,
      latestStillCurrent: latestRequest.isCurrent(),
      safeBrowserError,
      unsafeBrowserError,
      initialStructuredErrors,
      validStructuredErrors,
      oversizedCancelled,
      searchHeight,
    })}`);
  }
  if (mode === "stale") return { mode, staleCreateDisabled: true };
  xhsRow.click();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const detailText = document.body.textContent ?? "";
  const primaryUse = document.querySelector<HTMLButtonElement>(".skill-detail-heading .production-primary-button");
  const radios = Array.from(document.querySelectorAll<HTMLButtonElement>("[role='radio']"));
  if (
    !detailText.includes("Keyword") ||
    !detailText.includes("读取和下载") ||
    !detailText.includes("App 标准结构化视图") ||
    !detailText.includes("提交时再检查") ||
    primaryUse?.disabled ||
    document.activeElement?.classList.contains("production-back-link") !== true ||
    radios.length !== 2 ||
    radios.filter((radio) => radio.tabIndex === 0).length !== 1
  ) {
    throw new Error("Library detail did not project input, action, output, or compatible identity state.");
  }
  radios[0]!.focus();
  radios[0]!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
  await new Promise((resolve) => requestAnimationFrame(resolve));
  if (
    radios[1]!.getAttribute("aria-checked") !== "true" ||
    document.activeElement !== radios[1] ||
    primaryUse?.disabled !== true ||
    !document.body.textContent?.includes("登录账号")
  ) {
    throw new Error(`Library identity recovery state or keyboard navigation failed: ${JSON.stringify({
      checked: radios[1]!.getAttribute("aria-checked"),
      focused: document.activeElement === radios[1],
      primaryDisabled: primaryUse?.disabled,
      text: document.body.textContent,
    })}`);
  }
  radios[1]!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
  await new Promise((resolve) => requestAnimationFrame(resolve));
  primaryUse.click();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const selection = document.querySelector("[data-library-selection]")?.textContent ?? "";
  const composer = document.querySelector<HTMLFormElement>(".create-task-composer");
  const submit = document.querySelector<HTMLButtonElement>(".create-task-submit");
  const initialInvalid = document.querySelectorAll(".create-task-field [aria-invalid='true']").length;
  submit?.click();
  await new Promise((resolve) => requestAnimationFrame(resolve));
  const submittedInvalid = document.querySelectorAll(".create-task-field [aria-invalid='true']").length;
  const urlInput = document.querySelector<HTMLInputElement>("[name='url']");
  const keywordInput = document.querySelector<HTMLInputElement>("[name='keyword']");
  setInputValue(urlInput, "https://www.xiaohongshu.com/explore");
  setInputValue(keywordInput, "AI tools");
  submit?.click();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const submitState = document.querySelector(".create-task-submit-state")?.textContent ?? "";
  const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  if (
    !selection.includes("xiaohongshu/search-notes") ||
    composer == null ||
    initialInvalid !== 0 ||
    submittedInvalid < 2 ||
    !submitState.includes("任务提交服务尚未接入") ||
    keywordInput?.value !== "AI tools" ||
    overflow > 1
  ) {
    throw new Error(`Library selection or responsive layout failed: selection=${selection}, overflow=${overflow}, searchHeight=${searchHeight}`);
  }
  return { mode, selection, overflow, searchHeight, submittedInvalid, draftPreserved: keywordInput.value };
};

function setInputValue(input: HTMLInputElement | null, value: string) {
  if (input == null) throw new Error("Expected schema-driven input is missing.");
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}
