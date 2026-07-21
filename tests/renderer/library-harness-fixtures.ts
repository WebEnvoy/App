import { identityEnvironmentFixtures } from "../../src/renderer/identityEnvironmentFixtures";
import type { LodeCatalogLoadState, LodeCatalogSkill } from "../../src/renderer/lodeCatalogClient";
import type { RuntimeSupervisorState } from "../../src/renderer/runtimeSupervisorState";

export const xhsSkill: LodeCatalogSkill = {
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
    { id: "url", label: "Entry URL", kind: "text", required: true, description: "Owner-provided entry URL", format: "uri", pattern: "^https://www\\.xiaohongshu\\.com/(?:explore|search_result/?.*)$", patternSafety: "linear" },
    { id: "keyword", label: "Keyword", kind: "text", required: true, description: "Owner-provided search keyword", minLength: 1, maxLength: 80 },
    { id: "limit", label: "Limit", kind: "number", required: false, description: "Owner-provided result limit", minimum: 1, maximum: 20, integer: true },
    { id: "attachments", label: "Attachments", kind: "file", required: false, description: "Optional local files" },
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

export const bossSkill: LodeCatalogSkill = {
  ...xhsSkill,
  id: "lode://site-capability/boss/job-search@0.1.0",
  packageRef: "lode://site-capability/boss/job-search@0.1.0",
  lockRef: "lode://lock/site-capability/boss/job-search@0.1.0",
  siteSlug: "boss",
  siteName: "BOSS",
  name: "Search jobs",
  actions: [{
    ...xhsSkill.actions[0]!,
    id: "boss_job_search",
    supportedOrigins: ["https://www.zhipin.com"],
    resourceRequirementRef: "boss.job-search.resources",
    resourceRequirementProfileIds: ["job-search-logged-in-ready-page"],
  }],
};

export const detailSkill: LodeCatalogSkill = {
  ...xhsSkill,
  id: "lode://site-capability/xiaohongshu/read-note-detail@0.1.0",
  packageRef: "lode://site-capability/xiaohongshu/read-note-detail@0.1.0",
  name: "Read note detail",
  category: "Content detail",
  inputFields: [{ id: "url", label: "Detail URL", kind: "text", required: true, description: "Exact detail URL", format: "uri", pattern: "^https://www\\.xiaohongshu\\.com/(?:explore|search_result)/[A-Za-z0-9]+(?:\\?.*)?$", patternSafety: "linear" }],
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

export const catalog: LodeCatalogLoadState = {
  status: new URLSearchParams(window.location.search).has("stale") ? "stale" : "ready",
  fetchedAt: "2026-07-20T00:00:00Z",
  source: "packaged-path",
  summary: "读取 2 个站点技能。",
  skills: [xhsSkill, detailSkill, bossSkill, sampleSkill],
};

export const identity = { ...identityEnvironmentFixtures[0], source: "Harbor live" as const };
export const identityB = {
  ...identity,
  id: "identity-xhs-ops-b",
  accountLabel: "运营号 B",
  identityEnvironmentRef: "harbor://identity-environment/xhs-ops-b",
};

export const runtime: RuntimeSupervisorState = {
  mode: "real",
  checkedAt: "2026-07-20T00:00:00Z",
  services: [],
  lodeAssets: {
    state: "ready", source: "packaged-path", packageCount: 2, requiredPackageRefs: [], missingPackageRefs: [],
    checkedAt: "2026-07-20T00:00:00Z", summary: "ready", consumerBoundary: "test",
  },
  canUseLiveRuntime: true,
  failClosed: false,
  summary: "ready",
};

export const protectedDrafts = new Map<string, unknown>();
let protectedDraftSaveDelayMs = 0;
let protectedDraftDeleteStatus: "ready" | "unavailable" = "ready";

export function setProtectedDraftSaveDelay(value: number) {
  protectedDraftSaveDelayMs = value;
}

export function setProtectedDraftDeleteStatus(value: "ready" | "unavailable") {
  protectedDraftDeleteStatus = value;
}

export function installLibraryShellMock() {
  const key = (context: { packageRef: string; version: string; identityId: string }) => `${context.packageRef}:${context.version}:${context.identityId}`;
  window.webenvoyShell = {
    getShellContext: async () => ({ platform: "test", colorScheme: "light", configScope: "local-ui-only" }),
    getLodeCatalog: async () => ({ ...catalog, status: "ready" }),
    getRuntimeSupervisorState: async () => runtime,
    requestOwnerJson: async (request) => {
      if (request.path === "/threads") {
        return {
          ok: true,
          body: {
            ok: true,
            threads: [{
              schema_version: "webenvoy.task-thread.v0",
              thread_id: "thread_11111111111111111111111111111111",
              capability_ref: "lode:capability/search-notes",
              identity_environment_ref: "identity-env:xhs-ops-a",
              created_at: "2026-07-20T00:00:00.000Z",
              updated_at: "2026-07-20T00:00:00.000Z",
              turns: [],
            }],
          },
        };
      }
      if (request.path === "/identity-compatibility-preview") {
        const body = request.body as Record<string, unknown>;
        const generatedAt = new Date().toISOString();
        const refs = body.identity_environment_refs as string[];
        return {
          ok: true,
          body: {
            schema_version: "webenvoy.identity-compatibility-preview.v0",
            package_ref: body.package_ref,
            lock_ref: body.lock_ref,
            version: body.version,
            operation_id: body.operation_id,
            operation_mode: body.operation_mode,
            target_ref: body.target_ref,
            target_origin: body.target_origin,
            resource_requirement_ref: body.resource_requirement_ref,
            resource_requirement_profile_id: body.resource_requirement_profile_id,
            generated_at: generatedAt,
            candidates: refs.map((identityEnvironmentRef) => ({
              identity_environment_ref: identityEnvironmentRef,
              status: "unknown_until_runtime",
              reason_codes: ["runtime_facts_require_task_admission"],
              missing_requirement_categories: ["runtime_facts"],
              fact_freshness: [{
                fact_key: "runtime.execution_surface.available",
                required_freshness: "current_execution_window",
                state: "unknown_until_runtime",
              }],
              owner_status: { lode: "available", harbor: "available" },
              freshness: { state: "fresh", observed_at: generatedAt, age_ms: 0 },
              recovery_action: "retry_at_task_submission",
            })),
            consumer_boundary: "Core returns bounded compatibility reasons and public freshness only; no task, thread, run, session, browser action, credential, cookie, token, profile storage, evidence body, or raw owner response is created or exposed.",
          },
        };
      }
      throw new Error(`Unexpected owner request: ${request.path}`);
    },
    selectLocalFiles: async () => ({ status: "ready", files: [
      { localRef: "local_file_ref_00000000-0000-4000-8000-000000000001", name: "library-harness-attachment.txt", size: 12, type: "text/plain", lastModified: 1 },
      { localRef: "local_file_ref_00000000-0000-4000-8000-000000000003", name: `${"long-file-name-".repeat(18)}.txt`.slice(0, 255), size: 24, type: "text/plain", lastModified: 2 },
    ] }),
    checkLocalFiles: async (localRefs) => localRefs.map((localRef) => localRef.endsWith("000000000002")
      ? { localRef, readable: false, reason: "unreadable" }
      : { localRef, readable: true, reason: "readable" }),
    releaseLocalFiles: async () => ({ status: "ready" }),
    loadProtectedDraft: async (context) => ({ status: "ready", draft: protectedDrafts.get(key(context as Parameters<typeof key>[0])) }),
    saveProtectedDraft: async (draft) => {
      const value = draft as { context: Parameters<typeof key>[0] };
      if (protectedDraftSaveDelayMs > 0) await new Promise((resolve) => setTimeout(resolve, protectedDraftSaveDelayMs));
      protectedDrafts.set(key(value.context), structuredClone(value));
      return { status: "ready" };
    },
    deleteProtectedDraft: async (context) => {
      if (protectedDraftDeleteStatus === "ready") protectedDrafts.delete(key(context as Parameters<typeof key>[0]));
      return { status: protectedDraftDeleteStatus };
    },
  };
}
