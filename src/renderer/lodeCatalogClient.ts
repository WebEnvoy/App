export type LodeCatalogSkill = WebEnvoyLodeCatalogSkill;

export type LodeCatalogLoadState = {
  status: "loading" | "ready" | "stale" | "offline";
  fetchedAt: string;
  source: WebEnvoyLodeAssetBundleState["source"];
  summary: string;
  skills: LodeCatalogSkill[];
};

const cacheKey = "webenvoy.lodeCatalog.displayCache.v1";

export const loadingLodeCatalogState: LodeCatalogLoadState = {
  status: "loading",
  fetchedAt: "pending",
  source: "not_configured",
  summary: "正在读取已安装的站点技能。",
  skills: [],
};

export async function fetchLodeCatalog(): Promise<LodeCatalogLoadState> {
  const readCatalog = window.webenvoyShell?.getLodeCatalog;
  if (readCatalog == null) return cachedOrOffline("站点技能目录接口暂不可用。");

  try {
    const state = await readCatalog();
    if (!isCatalogState(state)) return cachedOrOffline("站点技能目录返回了不兼容的数据。");
    if (state.status !== "ready") return cachedOrOffline(state.summary);

    const readyState: LodeCatalogLoadState = {
      status: "ready",
      fetchedAt: state.fetchedAt,
      source: state.source,
      summary: state.summary,
      skills: state.skills,
    };
    try {
      window.localStorage.setItem(cacheKey, JSON.stringify(displayCache(readyState)));
    } catch {
      // A display cache failure must not hide the live owner response.
    }
    return readyState;
  } catch (error) {
    return cachedOrOffline(error instanceof Error ? error.message : String(error));
  }
}

export function catalogSkillSiteId(skill: LodeCatalogSkill) {
  return skill.siteSlug === "xiaohongshu" || skill.siteSlug === "boss" ? skill.siteSlug : null;
}

export function catalogSkillSiteName(skill: LodeCatalogSkill) {
  return skill.siteSlug === "xiaohongshu"
    ? "小红书"
    : skill.siteSlug === "boss"
    ? "BOSS 直聘"
    : skill.siteName;
}

export function catalogSkillName(skill: LodeCatalogSkill) {
  const names: Record<string, string> = {
    "search-notes": "搜索并读取笔记",
    "read-note-detail": "读取笔记详情",
    "publish-note-precheck": "发布笔记写前检查",
    "job-search": "搜索职位",
    "read-job-detail": "读取职位详情",
    "greet-precheck": "打招呼写前检查",
  };
  const capabilityId = skill.packageRef.match(/\/([^/@]+)@[^/]+$/)?.[1];
  return capabilityId == null ? skill.name : names[capabilityId] ?? skill.name;
}

function cachedOrOffline(summary: string): LodeCatalogLoadState {
  const cached = readCache();
  return cached == null
    ? { status: "offline", fetchedAt: new Date().toISOString(), source: "not_configured", summary, skills: [] }
    : {
        ...cached,
        status: "stale",
        summary: `${summary} 当前展示最近一次非敏感目录缓存。`,
      };
}

function displayCache(state: LodeCatalogLoadState): LodeCatalogLoadState {
  return {
    ...state,
    skills: state.skills.map((skill) => ({
      ...skill,
      inputFields: skill.inputFields.map(({ id, label, kind, required, description, options }) => ({
        id,
        label,
        kind,
        required,
        description,
        options,
      })),
      actions: skill.actions.map(({ id, category }) => ({
        id,
        category,
        targetTypes: [],
        supportedOrigins: [],
        externalEffects: [],
      })),
    })),
  };
}

function readCache(): LodeCatalogLoadState | null {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(cacheKey) ?? "null") as unknown;
    if (!isLoadState(parsed) || parsed.status !== "ready") return null;
    return parsed;
  } catch {
    return null;
  }
}

function isCatalogState(value: unknown): value is WebEnvoyLodeCatalogState {
  return isRecord(value) &&
    (value.status === "ready" || value.status === "unavailable") &&
    isString(value.fetchedAt) &&
    isCatalogSource(value.source) &&
    isString(value.summary) &&
    Array.isArray(value.skills) &&
    value.skills.every(isSkill);
}

function isLoadState(value: unknown): value is LodeCatalogLoadState {
  return isRecord(value) &&
    ["loading", "ready", "stale", "offline"].includes(String(value.status)) &&
    isString(value.fetchedAt) &&
    isCatalogSource(value.source) &&
    isString(value.summary) &&
    Array.isArray(value.skills) &&
    value.skills.every(isSkill);
}

function isSkill(value: unknown): value is LodeCatalogSkill {
  if (!isRecord(value)) return false;
  const stringsValid = [
    "id",
    "packageRef",
    "siteSlug",
    "siteName",
    "name",
    "summary",
    "category",
    "version",
    "latestVersion",
    "lifecycle",
    "sourceHealth",
    "updatedAt",
    "availabilityReason",
    "outputKind",
  ].every((key) => isString(value[key]));
  const availabilityValid = value.availability === "available" || value.availability === "incompatible";
  const schemaIdsValid = value.availability === "available"
    ? isString(value.inputSchemaId) && isString(value.outputSchemaId)
    : isText(value.inputSchemaId) && isText(value.outputSchemaId);
  return stringsValid && availabilityValid && schemaIdsValid &&
    (value.lockRef === undefined || isString(value.lockRef)) &&
    isStringArray(value.facets) &&
    Array.isArray(value.inputFields) &&
    value.inputFields.every(isField) &&
    Array.isArray(value.actions) &&
    value.actions.every(isAction);
}

function isCatalogSource(value: unknown): value is WebEnvoyLodeAssetBundleState["source"] {
  return ["env-path", "packaged-path", "build-output", "not_configured"].includes(String(value));
}

function isField(value: unknown): value is WebEnvoyLodeCatalogField {
  return isRecord(value) &&
    isString(value.id) &&
    isString(value.label) &&
    ["text", "number", "boolean", "select", "unknown"].includes(String(value.kind)) &&
    typeof value.required === "boolean" &&
    isString(value.description) &&
    (value.options === undefined || isStringArray(value.options)) &&
    (value.defaultValue === undefined || ["string", "number", "boolean"].includes(typeof value.defaultValue)) &&
    (value.minimum === undefined || typeof value.minimum === "number") &&
    (value.maximum === undefined || typeof value.maximum === "number");
}

function isAction(value: unknown): value is WebEnvoyLodeCatalogAction {
  return isRecord(value) &&
    isString(value.id) &&
    ["read", "prepare", "commit", "destructive"].includes(String(value.category)) &&
    isStringArray(value.targetTypes) &&
    isStringArray(value.supportedOrigins) &&
    isStringArray(value.externalEffects);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isText(value: unknown): value is string {
  return typeof value === "string";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}
