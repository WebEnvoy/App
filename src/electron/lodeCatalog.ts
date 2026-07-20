import path from "node:path";

import {
  createLodeCatalogReadBudget,
  LodeReadBudgetExceededError,
  readLodeJsonObject,
  readLodeJsonObjectSha256,
  resolveLodeAssetPath,
  type LodeReadBudget,
} from "./lodeAssetAccess.js";
import {
  resolveLodeAssetBundle,
  supportedLodePackageRefs,
  type LodeAssetBundleState,
} from "./lodeAssetBundle.js";

export type LodeCatalogField = {
  id: string;
  label: string;
  kind: "text" | "multiline" | "number" | "boolean" | "select" | "multi-select" | "file" | "constant" | "unknown";
  required: boolean;
  description: string;
  options?: string[];
  defaultValue?: string | number | boolean | string[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  format?: "uri";
  integer?: boolean;
};

export type LodeCatalogAction = {
  id: string;
  category: "read" | "prepare" | "commit" | "destructive";
  operationMode: "read" | "validate_only" | "draft" | "preview";
  targetTypes: string[];
  supportedOrigins: string[];
  externalEffects: string[];
  resourceRequirementRef: string;
  resourceRequirementProfileIds: string[];
};

export type LodeCatalogResultView =
  | {
      mode: "standard";
      fallback: "standard_renderer";
      reason: "not_declared" | "incompatible";
    }
  | {
      mode: "skill";
      fallback: "standard_renderer";
      declarationVersion: "0.1.0";
      viewId: string;
      viewVersion: string;
      resourceRef: string;
      lockRef: string;
    };

export type LodeCatalogSkill = {
  id: string;
  packageRef: string;
  lockRef?: string;
  siteSlug: string;
  siteName: string;
  name: string;
  summary: string;
  category: string;
  version: string;
  latestVersion: string;
  lifecycle: string;
  facets: string[];
  sourceHealth: string;
  updatedAt: string;
  availability: "available" | "incompatible";
  availabilityReason: string;
  inputSchemaId: string;
  inputFields: LodeCatalogField[];
  outputSchemaId: string;
  outputKind: string;
  resultView: LodeCatalogResultView;
  actions: LodeCatalogAction[];
};

export type LodeCatalogState = {
  status: "ready" | "unavailable";
  fetchedAt: string;
  source: LodeAssetBundleState["source"];
  summary: string;
  skills: LodeCatalogSkill[];
};

type LocalCatalogQuery = {
  schema_version?: unknown;
  queries?: { results?: unknown[] }[];
};

type LocalPackageRegistry = {
  entries?: unknown[];
};

const maxCatalogSkills = 200;
const maxCatalogFields = 100;
const maxCatalogActions = 50;
export function readLodeCatalog(bundle = resolveLodeAssetBundle()): LodeCatalogState {
  const fetchedAt = new Date().toISOString();
  if (bundle.state !== "ready" || !bundle.rootPath || !bundle.registryPath) {
    return {
      status: "unavailable",
      fetchedAt,
      source: bundle.source,
      summary: bundle.summary,
      skills: [],
    };
  }

  try {
    const budget = createLodeCatalogReadBudget();
    const queryPath = resolveLodeAssetPath(bundle.rootPath, "registry/local-query.fixture.json");
    const query = readLodeJsonObject(queryPath, budget) as LocalCatalogQuery;
    const registry = readLodeJsonObject(bundle.registryPath, budget) as LocalPackageRegistry;
    if (query.schema_version !== "lode.local-registry-query-fixture.v0") {
      throw new Error("Unsupported Lode catalog query contract.");
    }
    const entries = new Map<string, Record<string, unknown>>();
    const packageEntries = new Map(
      (Array.isArray(registry.entries) ? registry.entries : []).flatMap((entry) =>
        isRecord(entry) && optionalString(entry.package_ref) != null
          ? [[entry.package_ref as string, entry] as const]
          : [],
      ),
    );
    for (const result of (Array.isArray(query.queries) ? query.queries : []).flatMap((item) =>
      Array.isArray(item.results) ? item.results : [],
    )) {
      if (!isRecord(result)) continue;
      const packageRef = optionalString(result.package_ref);
      if (packageRef) entries.set(packageRef, { ...packageEntries.get(packageRef), ...entries.get(packageRef), ...result });
      if (entries.size > maxCatalogSkills) throw new Error("Lode catalog exceeds the supported skill count.");
    }
    const skills = [...entries.values()]
      .flatMap((entry) => projectCatalogEntry(bundle.rootPath!, entry, budget))
      .sort((left, right) =>
        left.siteName.localeCompare(right.siteName, "zh-CN") ||
        left.name.localeCompare(right.name, "zh-CN"),
      );
    const incompatibleCount = skills.filter((skill) => skill.availability === "incompatible").length;

    return {
      status: skills.length > 0 ? "ready" : "unavailable",
      fetchedAt,
      source: bundle.source,
      summary:
        skills.length === 0
          ? "站点技能目录中没有可用的技能。"
          : `读取 ${skills.length} 个站点技能${incompatibleCount > 0 ? `，${incompatibleCount} 个合同不完整` : ""}。`,
      skills,
    };
  } catch {
    return {
      status: "unavailable",
      fetchedAt,
      source: bundle.source,
      summary: "站点技能目录无法读取。",
      skills: [],
    };
  }
}

function projectCatalogEntry(rootPath: string, entry: Record<string, unknown>, budget: LodeReadBudget): LodeCatalogSkill[] {
  try {
    return [readCatalogSkill(rootPath, entry, budget)];
  } catch (error) {
    if (error instanceof LodeReadBudgetExceededError) throw error;
    const packageRef = optionalString(entry.package_ref);
    const siteSlug = optionalString(entry.site_slug);
    if (!packageRef || !siteSlug) return [];

    const capabilityId = packageRef.match(/\/([^/@]+)@[^/]+$/)?.[1] ?? packageRef;
    return [{
      id: packageRef,
      packageRef,
      lockRef: optionalString(entry.lock_ref),
      siteSlug,
      siteName: siteSlug,
      name: capabilityId,
      summary: "技能合同无法读取。",
      category: "unknown",
      version: optionalString(entry.version) ?? "unknown",
      latestVersion: optionalString(entry.version) ?? "unknown",
      lifecycle: optionalString(entry.lifecycle) ?? "unknown",
      facets: [],
      sourceHealth: "invalid",
      updatedAt: "unknown",
      availability: "incompatible",
      availabilityReason: "技能合同无法读取，已停止使用。",
      inputSchemaId: "",
      inputFields: [],
      outputSchemaId: "",
      outputKind: "unknown",
      resultView: standardResultView("incompatible"),
      actions: [],
    }];
  }
}

function readCatalogSkill(rootPath: string, entry: Record<string, unknown>, budget: LodeReadBudget): LodeCatalogSkill {
  const packageRef = requiredString(entry.package_ref, "registry package_ref");
  const siteSlug = requiredString(entry.site_slug, `${packageRef} site_slug`);
  const manifestPath = resolveLodeAssetPath(rootPath, requiredString(entry.manifest_path, `${packageRef} manifest_path`));
  const manifest = readLodeJsonObject(manifestPath, budget);
  const packageRoot = path.dirname(manifestPath);
  const packageLock = readLodeJsonObject(
    resolveLodeAssetPath(rootPath, requiredString(entry.lock_path, `${packageRef} lock_path`)),
    budget,
  );
  const catalog = readLodeJsonObject(resolveLodeAssetPath(rootPath, manifestAssetPath(manifest, "catalog_metadata", packageRef), packageRoot), budget);
  const inputSchema = readLodeJsonObject(resolveLodeAssetPath(rootPath, manifestAssetPath(manifest, "input_schema", packageRef), packageRoot), budget);
  const outputSchema = readLodeJsonObject(resolveLodeAssetPath(rootPath, manifestAssetPath(manifest, "normalized_output_schema", packageRef), packageRoot), budget);
  const manifestSite = requiredRecord(manifest.site, `${packageRef} manifest site`);
  const manifestCapability = requiredRecord(manifest.capability, `${packageRef} manifest capability`);
  const queryAdmission = requiredRecord(entry.core_admission_fields, `${packageRef} query admission fields`);
  const catalogAdmission = requiredRecord(catalog.core_admission_fields, `${packageRef} catalog admission fields`);
  const version = requiredRecord(catalog.version, `${packageRef} catalog version`);
  const entryVersion = requiredString(entry.version, `${packageRef} query version`);
  const currentVersion = requiredString(version.current, `${packageRef} catalog version.current`);
  const latestVersion = optionalString(version.latest) ?? currentVersion;
  const lifecycle = requiredString(version.lifecycle, `${packageRef} catalog lifecycle`);
  const lockRef = requiredString(catalog.lock_ref, `${packageRef} catalog lock_ref`);
  const inputSchemaId = optionalString(inputSchema.$id) ?? "";
  const outputSchemaId = optionalString(outputSchema.$id) ?? "";
  if (
    requiredString(manifest.package_ref, `${packageRef} manifest package_ref`) !== packageRef ||
    requiredString(catalog.package_ref, `${packageRef} catalog package_ref`) !== packageRef ||
    requiredString(packageLock.package_ref, `${packageRef} package lock package_ref`) !== packageRef ||
    requiredString(packageLock.lock_ref, `${packageRef} package lock lock_ref`) !== lockRef ||
    requiredString(packageLock.package_version, `${packageRef} package lock version`) !== currentVersion ||
    requiredString(manifestSite.slug, `${packageRef} manifest site slug`) !== siteSlug ||
    requiredString(entry.lock_ref, `${packageRef} query lock_ref`) !== lockRef ||
    requiredString(queryAdmission.lock_ref, `${packageRef} query admission lock_ref`) !== lockRef ||
    requiredString(queryAdmission.input_schema_id, `${packageRef} query input schema`) !== inputSchemaId ||
    requiredString(queryAdmission.output_schema_id, `${packageRef} query output schema`) !== outputSchemaId ||
    requiredString(catalogAdmission.input_schema_id, `${packageRef} catalog input schema`) !== inputSchemaId ||
    requiredString(catalogAdmission.output_schema_id, `${packageRef} catalog output schema`) !== outputSchemaId ||
    requiredString(manifestCapability.version, `${packageRef} manifest version`) !== entryVersion ||
    packageRef.slice(packageRef.lastIndexOf("@") + 1) !== entryVersion ||
    currentVersion !== entryVersion ||
    requiredString(entry.lifecycle, `${packageRef} query lifecycle`) !== lifecycle
  ) {
    throw new Error(`Mismatched Lode package metadata for ${packageRef}.`);
  }
  const display = requiredRecord(catalog.display, `${packageRef} catalog display`);
  const status = requiredRecord(catalog.status, `${packageRef} catalog status`);
  const operationMode = optionalString(catalogAdmission.operation_mode);
  const resourceRequirementRef = optionalString(catalogAdmission.resource_requirements_id);
  const actionDeclaration = isRecord(manifest.action_declaration) ? manifest.action_declaration : null;
  const actions = actionDeclaration == null || operationMode == null || resourceRequirementRef == null
    ? []
    : projectActions(actionDeclaration.actions, siteSlug, operationMode, resourceRequirementRef);
  const inputFields = projectInputFields(inputSchema);
  const projectedOutputKind = outputKind(outputSchema);
  const resultView = projectResultView(
    catalog.result_view,
    manifest,
    packageRef,
    siteSlug,
    outputSchemaId,
    projectedOutputKind,
    lockRef,
    packageLock,
    packageRoot,
    rootPath,
    budget,
  );
  const catalogAvailable = status.catalog_state === "available";
  const lifecycleAvailable = lifecycle !== "broken" && lifecycle !== "deprecated";
  const versionCompatible = supportedLodePackageRefs.includes(packageRef);
  const contractComplete = inputSchemaId.length > 0 &&
    outputSchemaId.length > 0 &&
    inputFields.length > 0 &&
    inputFields.every((field) => field.kind !== "unknown") &&
    actions.length > 0 &&
    projectedOutputKind != null;
  const availability = catalogAvailable && lifecycleAvailable && versionCompatible && contractComplete ? "available" : "incompatible";

  return {
    id: packageRef,
    packageRef,
    lockRef,
    siteSlug,
    siteName: requiredString(display.site_name, `${packageRef} display.site_name`),
    name: requiredString(display.name, `${packageRef} display.name`),
    summary: requiredString(display.summary, `${packageRef} display.summary`),
    category: requiredString(display.category, `${packageRef} display.category`),
    version: currentVersion,
    latestVersion,
    lifecycle,
    facets: catalog.facets === undefined ? [] : requiredStringArray(catalog.facets, `${packageRef} facets`),
    sourceHealth: optionalString(status.source_health) ?? "unknown",
    updatedAt: optionalString(status.updated_at) ?? "unknown",
    availability,
    availabilityReason: availability === "available"
      ? "输入、输出与业务动作声明可用。"
      : !catalogAvailable
      ? "技能目录状态不可用。"
      : !lifecycleAvailable
      ? "当前技能版本已停用。"
      : !versionCompatible
      ? "当前技能合同版本与 App 不兼容。"
      : actions.length === 0
      ? "缺少业务动作声明，已停止使用。"
      : projectedOutputKind == null
      ? "输出合同缺少结果类型，已停止使用。"
      : "输入或输出合同缺失，已停止使用。",
    inputSchemaId,
    inputFields,
    outputSchemaId,
    outputKind: projectedOutputKind ?? "unknown",
    resultView,
    actions,
  };
}

function projectResultView(
  value: unknown,
  manifest: Record<string, unknown>,
  packageRef: string,
  siteSlug: string,
  outputSchemaId: string,
  projectedOutputKind: string | undefined,
  lockRef: string,
  packageLock: Record<string, unknown>,
  packageRoot: string,
  rootPath: string,
  budget: LodeReadBudget,
): LodeCatalogResultView {
  const resourceAsset = uniqueManifestAsset(manifest, "result_view_resource");
  if (value === undefined) return standardResultView(resourceAsset == null ? "not_declared" : "incompatible");
  if (!isRecord(value)) return standardResultView("incompatible");
  if (value.status === "absent") {
    return resourceAsset == null && hasOnlyKeys(value, ["status", "fallback"]) && value.fallback === "standard_renderer"
      ? standardResultView("not_declared")
      : standardResultView("incompatible");
  }
  if (value.status !== "present" || !hasOnlyKeys(value, [
    "status",
    "declaration_version",
    "view_id",
    "view_version",
    "resource_ref",
    "resource_path",
    "compatible_outputs",
    "integrity",
    "lock_ref",
    "fallback",
  ])) return standardResultView("incompatible");

  const viewId = optionalString(value.view_id);
  const viewVersion = optionalString(value.view_version);
  const resourceRef = optionalString(value.resource_ref);
  const resourcePath = optionalString(value.resource_path);
  const compatibleOutputs = isRecord(value.compatible_outputs) ? value.compatible_outputs : null;
  const integrity = isRecord(value.integrity) ? value.integrity : null;
  const outputAsset = uniqueManifestAsset(manifest, "normalized_output_schema");
  const lockedResourceAsset = uniqueLockedAsset(packageLock, "result_view_resource");
  const schemas = compatibleOutputs?.schemas;
  const resultKinds = compatibleOutputs?.result_kinds;
  const schemasValid = schemas === undefined || (Array.isArray(schemas) && schemas.length > 0 && schemas.length <= 100 &&
    schemas.every((candidate) => isRecord(candidate) && hasOnlyKeys(candidate, ["schema_ref", "schema_version"]) &&
      optionalString(candidate.schema_ref) != null && optionalString(candidate.schema_version) != null));
  const kindsValid = resultKinds === undefined || (Array.isArray(resultKinds) && resultKinds.length > 0 &&
    resultKinds.length <= 100 && resultKinds.every((kind) => optionalString(kind) != null));
  const schemaCompatible = Array.isArray(schemas) && schemas.some((candidate) => isRecord(candidate) &&
    candidate.schema_ref === outputSchemaId && candidate.schema_version === outputAsset?.schema_version);
  const kindCompatible = Array.isArray(resultKinds) && projectedOutputKind != null && resultKinds.includes(projectedOutputKind);
  const capabilityId = packageRef.match(/\/([^/@]+)@[^/]+$/)?.[1];
  const expectedResourceRef = capabilityId != null && viewId != null && viewVersion != null
    ? `lode://result-view/${siteSlug}/${capabilityId}/${viewId}@${viewVersion}`
    : null;
  const declaredDigest = optionalString(integrity?.digest);
  const resourceBindingValid =
    resourceRef != null && resourceRef === expectedResourceRef &&
    resourcePath != null && isSafePackagePath(resourcePath) &&
    declaredDigest != null && /^[a-f0-9]{64}$/.test(declaredDigest) &&
    resourceAsset?.status === "present" &&
    resourceAsset.resource_ref === resourceRef &&
    resourceAsset.resource_version === viewVersion &&
    resourceAsset.path === resourcePath &&
    lockedResourceAsset?.ref === resourceRef &&
    lockedResourceAsset.version === viewVersion &&
    lockedResourceAsset.path === resourcePath &&
    lockedResourceAsset.sha256 === declaredDigest;
  const resource = resourceBindingValid
    ? readResultViewResource(rootPath, packageRoot, resourcePath, budget)
    : null;
  const valid =
    value.declaration_version === "0.1.0" &&
    value.fallback === "standard_renderer" &&
    value.lock_ref === lockRef &&
    viewId != null && /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/.test(viewId) &&
    viewVersion != null && /^\d+\.\d+\.\d+$/.test(viewVersion) &&
    resourceBindingValid &&
    compatibleOutputs != null && hasOnlyKeys(compatibleOutputs, [
      ...(schemas === undefined ? [] : ["schemas"]),
      ...(resultKinds === undefined ? [] : ["result_kinds"]),
    ]) && (schemas !== undefined || resultKinds !== undefined) && schemasValid && kindsValid &&
    (schemas === undefined || schemaCompatible) && (resultKinds === undefined || kindCompatible) &&
    integrity != null && hasOnlyKeys(integrity, ["algorithm", "digest"]) &&
    integrity?.algorithm === "sha256" &&
    resource === declaredDigest &&
    outputAsset?.schema_id === outputSchemaId;
  return valid
    ? {
        mode: "skill",
        fallback: "standard_renderer",
        declarationVersion: "0.1.0",
        viewId,
        viewVersion,
        resourceRef,
        lockRef,
      }
    : standardResultView("incompatible");
}

function standardResultView(reason: "not_declared" | "incompatible"): LodeCatalogResultView {
  return { mode: "standard", fallback: "standard_renderer", reason };
}

function uniqueManifestAsset(manifest: Record<string, unknown>, role: string) {
  const matches = (Array.isArray(manifest.asset_refs) ? manifest.asset_refs : [])
    .filter((value): value is Record<string, unknown> => isRecord(value) && value.role === role);
  return matches.length === 1 ? matches[0] : undefined;
}

function uniqueLockedAsset(packageLock: Record<string, unknown>, role: string) {
  const matches = (Array.isArray(packageLock.locked_assets) ? packageLock.locked_assets : [])
    .filter((value): value is Record<string, unknown> => isRecord(value) && value.role === role);
  return matches.length === 1 ? matches[0] : undefined;
}

function readResultViewResource(
  rootPath: string,
  packageRoot: string,
  resourcePath: string,
  budget: LodeReadBudget,
) {
  try {
    return readLodeJsonObjectSha256(resolveLodeAssetPath(rootPath, resourcePath, packageRoot), budget);
  } catch {
    return null;
  }
}

function isSafePackagePath(value: string) {
  return !path.isAbsolute(value) && !value.includes("\0") && !value.split(/[\\/]/).includes("..");
}

function hasOnlyKeys(value: Record<string, unknown>, keys: string[]) {
  return Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}

function projectInputFields(schema: Record<string, unknown>): LodeCatalogField[] {
  const properties = requiredRecord(schema.properties, "input schema properties");
  const required = new Set(schema.required === undefined ? [] : requiredStringArray(schema.required, "input schema required"));
  if (Object.keys(properties).length > maxCatalogFields) throw new Error("Input schema exceeds the supported field count.");
  return Object.entries(properties).map(([id, value]) => {
    if (!isRecord(value)) {
      return { id, label: fieldLabel(id), kind: "unknown", required: required.has(id), description: "字段合同不兼容。" };
    }
    const options = value.enum === undefined ? [] : requiredStringArray(value.enum, `${id} enum`);
    const type = optionalString(value.type);
    const arrayItems = isRecord(value.items) ? value.items : null;
    const arrayOptions = arrayItems?.enum === undefined ? [] : requiredStringArray(arrayItems.enum, `${id} items enum`);
    const contentType = optionalString(value.contentMediaType);
    const format = optionalString(value.format);
    const constant = typeof value.const === "string" || typeof value.const === "number" || typeof value.const === "boolean"
      ? value.const
      : undefined;
    const kind = constant !== undefined
      ? "constant"
      : type === "array" && arrayOptions.length > 0
      ? "multi-select"
      : options.length > 0
      ? "select"
      : type === "string" && (contentType != null || value.contentEncoding === "base64")
      ? "file"
      : type === "string" && (format === "multiline" || format === "textarea")
      ? "multiline"
      : type === "string"
      ? "text"
      : type === "integer" || type === "number"
      ? "number"
      : type === "boolean"
      ? "boolean"
      : "unknown";
    const defaultValue = constant ?? (
      typeof value.default === "string" || typeof value.default === "number" || typeof value.default === "boolean"
        ? value.default
        : Array.isArray(value.default) && value.default.every((item) => typeof item === "string")
        ? value.default
        : undefined
    );
    return {
      id,
      label: optionalString(value.title) ?? fieldLabel(id),
      kind,
      required: required.has(id),
      description: optionalString(value.description) ?? "由技能合同定义。",
      options: options.length > 0 ? options : arrayOptions.length > 0 ? arrayOptions : undefined,
      defaultValue,
      minimum: typeof value.minimum === "number" ? value.minimum : undefined,
      maximum: typeof value.maximum === "number" ? value.maximum : undefined,
      minLength: Number.isInteger(value.minLength) && Number(value.minLength) >= 0 ? Number(value.minLength) : undefined,
      maxLength: Number.isInteger(value.maxLength) && Number(value.maxLength) >= 0 ? Number(value.maxLength) : undefined,
      format: format === "uri" ? "uri" : undefined,
      integer: type === "integer" ? true : undefined,
    };
  });
}

function projectActions(
  value: unknown,
  siteSlug: string,
  operationMode: string,
  resourceRequirementRef: string,
): LodeCatalogAction[] {
  if (!["read", "validate_only", "draft", "preview"].includes(operationMode)) return [];
  if (!Array.isArray(value) || value.length > maxCatalogActions) return [];
  const projected: LodeCatalogAction[] = [];
  for (const action of value) {
    if (!isRecord(action)) return [];
    const category = action.category;
    const targetScope = isRecord(action.target_scope) ? action.target_scope : null;
    const targetTypes = targetScope == null ? null : strictStringArray(targetScope.target_types);
    const supportedOrigins = targetScope == null ? null : strictStringArray(targetScope.supported_origins);
    const externalEffects = strictStringArray(action.external_effects);
    const resourceRequirements = isRecord(action.resource_requirements) ? action.resource_requirements : null;
    const resourceRequirementProfileIds = resourceRequirements == null ? null : strictStringArray(resourceRequirements.profile_ids);
    if (
      typeof action.action_id !== "string" ||
      !["read", "prepare", "commit", "destructive"].includes(String(category)) ||
      targetScope == null ||
      targetScope.site_slug !== siteSlug ||
      targetTypes == null || targetTypes.length === 0 ||
      supportedOrigins == null || supportedOrigins.length === 0 ||
      externalEffects == null ||
      resourceRequirements?.id !== resourceRequirementRef ||
      resourceRequirementProfileIds == null || resourceRequirementProfileIds.length === 0
    ) return [];
    projected.push({
      id: action.action_id,
      category: category as LodeCatalogAction["category"],
      operationMode: operationMode as LodeCatalogAction["operationMode"],
      targetTypes,
      supportedOrigins,
      externalEffects,
      resourceRequirementRef,
      resourceRequirementProfileIds,
    });
  }
  return projected;
}

function outputKind(schema: Record<string, unknown>) {
  const properties = isRecord(schema.properties) ? schema.properties : {};
  const resultKind = isRecord(properties.result_kind) ? optionalString(properties.result_kind.const) : undefined;
  return resultKind;
}

function fieldLabel(id: string) {
  return id.replaceAll("_", " ");
}

function manifestAssetPath(manifest: Record<string, unknown>, role: string, packageRef: string) {
  const assets = Array.isArray(manifest.asset_refs) ? manifest.asset_refs : [];
  const asset = assets.find((value) => isRecord(value) && value.role === role && value.status === "present");
  if (!isRecord(asset)) throw new Error(`Missing ${role} asset for ${packageRef}.`);
  return requiredString(asset.path, `${packageRef} ${role} path`);
}

function requiredRecord(value: unknown, label: string) {
  if (!isRecord(value)) throw new Error(`Invalid ${label}.`);
  return value;
}

function requiredString(value: unknown, label: string) {
  const result = optionalString(value);
  if (!result) throw new Error(`Missing ${label}.`);
  return result;
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.length > 0 && value.length <= 1000 ? value : undefined;
}

function strictStringArray(value: unknown) {
  return Array.isArray(value) && value.length <= 100 && value.every((item) => optionalString(item) != null)
    ? value as string[]
    : null;
}

function requiredStringArray(value: unknown, label: string) {
  const result = strictStringArray(value);
  if (result == null) throw new Error(`Invalid ${label}.`);
  return result;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
