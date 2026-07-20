import { useState } from "react";
import { createRoot } from "react-dom/client";

import { readBoundedJsonResponse } from "../../src/electron/boundedJsonResponse";
import { identityEnvironmentFixtures } from "../../src/renderer/identityEnvironmentFixtures";
import {
  createSkillIdentityCompatibilityRequest,
  parseSkillIdentityCompatibilityResponse,
} from "../../src/renderer/coreIdentityCompatibilityClient";
import type { LodeCatalogLoadState, LodeCatalogSkill } from "../../src/renderer/lodeCatalogClient";
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
    { id: "keyword", label: "关键词", kind: "text", required: true, description: "搜索关键词" },
    { id: "limit", label: "数量", kind: "number", required: false, description: "结果数量", minimum: 1, maximum: 20 },
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
  siteSlug: "boss",
  siteName: "BOSS",
  name: "Search jobs",
  availability: "incompatible",
  availabilityReason: "缺少业务动作声明，已停止使用。",
  actions: [],
};
const detailSkill: LodeCatalogSkill = {
  ...xhsSkill,
  id: "lode://site-capability/xiaohongshu/read-note-detail@0.1.0",
  packageRef: "lode://site-capability/xiaohongshu/read-note-detail@0.1.0",
  name: "Read note detail",
  category: "Content detail",
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
const identityB = { ...identity, id: "identity-xhs-ops-b", accountLabel: "运营号 B" };
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
  return (
    <main style={{ width: "100vw", height: "100vh", overflow: "auto", background: "var(--we-surface-primary)" }}>
      <SiteSkillLibrary
        catalog={catalog}
        compatibilityBySkill={Object.fromEntries(catalog.skills.map((skill) => [
          skill.id,
          {
            status: "ready" as const,
            summary: "兼容性已检查。",
            candidates: [identity, identityB].map((item) => ({
              identityEnvironmentRef: item.identityEnvironmentRef,
              status: "unknown_until_runtime" as const,
              reasonCodes: ["runtime_facts_require_task_admission"],
              recoveryAction: "retry_at_task_submission" as const,
            })),
          },
        ]))}
        identities={[identity, identityB]}
        runtimeSupervisorState={runtime}
        onCreateIdentity={() => setSelection("create-identity")}
        onUse={(skill, identityId) => setSelection(`${skill.packageRef}:${identityId}`)}
      />
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
    .find((button) => button.textContent?.includes("搜索并读取笔记"));
  const bossUse = Array.from(document.querySelectorAll<HTMLButtonElement>(".production-skill-row .production-primary-button"))
    .find((button) => button.closest(".production-skill-row")?.textContent?.includes("搜索职位"));
  const xhsUse = Array.from(document.querySelectorAll<HTMLButtonElement>(".production-skill-row .production-primary-button"))
    .find((button) => button.closest(".production-skill-row")?.textContent?.includes("搜索并读取笔记"));
  const contentBrowseFilters = Array.from(document.querySelectorAll(".production-library-filters button"))
    .filter((button) => button.textContent === "内容浏览");
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
      fact_freshness: [],
      owner_status: { lode: "available", harbor: "available" },
      freshness: { state: "fresh", observed_at: "2026-07-20T00:00:00.000Z", age_ms: 0 },
      recovery_action: "retry_at_task_submission",
    }],
    consumer_boundary: "Core returns bounded compatibility reasons and public freshness only; no task, thread, run, session, browser action, credential, cookie, token, profile storage, evidence body, or raw owner response is created or exposed.",
  };
  const compatibilityNow = Date.parse("2026-07-20T00:00:30.000Z");
  const parsedCompatibility = parseSkillIdentityCompatibilityResponse(compatibilityResponse, compatibilityRequest, compatibilityNow);
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
  let oversizedCancelled = false;
  await readBoundedJsonResponse(new Response(new ReadableStream<Uint8Array>({
    start(controller) { controller.enqueue(new Uint8Array(64 * 1024 + 1)); },
    cancel() { oversizedCancelled = true; },
  }), { headers: { "content-type": "application/json" } })).then(
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
    !oversizedCancelled ||
    (mode === "narrow" && searchHeight > 50)
  ) {
    throw new Error("Library directory did not render owner skills or fail closed for the incompatible skill.");
  }
  if (mode === "stale") return { mode, staleCreateDisabled: true };
  xhsRow.click();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const detailText = document.body.textContent ?? "";
  const primaryUse = document.querySelector<HTMLButtonElement>(".skill-detail-heading .production-primary-button");
  const radios = Array.from(document.querySelectorAll<HTMLButtonElement>("[role='radio']"));
  if (
    !detailText.includes("关键词") ||
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
  if (radios[1]!.getAttribute("aria-checked") !== "true" || document.activeElement !== radios[1]) {
    throw new Error("Library identity radio keyboard navigation failed.");
  }
  primaryUse.click();
  await new Promise((resolve) => requestAnimationFrame(resolve));
  const selection = document.querySelector("[data-library-selection]")?.textContent ?? "";
  const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  if (!selection.includes("xiaohongshu/search-notes") || overflow > 1) {
    throw new Error(`Library selection or responsive layout failed: selection=${selection}, overflow=${overflow}, searchHeight=${searchHeight}`);
  }
  return { mode, selection, overflow, searchHeight };
};
