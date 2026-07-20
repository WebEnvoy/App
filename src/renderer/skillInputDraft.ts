import type { LodeCatalogSkill } from "./lodeCatalogClient";

export type SkillInputValue = string | boolean | string[];

export type SkillInputDraft = {
  values: Record<string, SkillInputValue>;
  files: Record<string, File[]>;
};

export type SkillInputErrors = Record<string, string>;

export function createSkillInputDraft(skill: LodeCatalogSkill): SkillInputDraft {
  return {
    values: Object.fromEntries(skill.inputFields.map((field) => [field.id, initialValue(field)])),
    files: Object.fromEntries(skill.inputFields.filter((field) => field.kind === "file").map((field) => [field.id, []])),
  };
}

export function validateSkillInputDraft(skill: LodeCatalogSkill, draft: SkillInputDraft): SkillInputErrors {
  return Object.fromEntries(skill.inputFields.flatMap((field) => {
    const error = validateField(field, draft);
    return error == null ? [] : [[field.id, error]];
  }));
}

export function compatibilityTargetValue(draft: SkillInputDraft, fieldId: string | undefined) {
  const value = fieldId == null ? undefined : draft.values[fieldId];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function initialValue(field: WebEnvoyLodeCatalogField): SkillInputValue {
  if (Array.isArray(field.defaultValue)) return [...field.defaultValue];
  if (typeof field.defaultValue === "boolean") return field.defaultValue;
  if (typeof field.defaultValue === "number") return String(field.defaultValue);
  if (typeof field.defaultValue === "string") return field.defaultValue;
  if (field.kind === "boolean") return false;
  if (field.kind === "multi-select" || field.kind === "file") return [];
  return "";
}

function validateField(field: WebEnvoyLodeCatalogField, draft: SkillInputDraft) {
  if (field.kind === "constant") return null;
  if (field.kind === "file") {
    return field.required && (draft.files[field.id]?.length ?? 0) === 0 ? "请选择文件" : null;
  }
  const value = draft.values[field.id];
  if (field.kind === "multi-select") {
    const selections = Array.isArray(value) ? value : [];
    if (field.required && selections.length === 0) return "请至少选择一项";
    return selections.some((item) => !field.options?.includes(item)) ? "包含合同未声明的选项" : null;
  }
  if (field.kind === "boolean") return typeof value === "boolean" ? null : "请选择是否启用";
  const text = typeof value === "string" ? value : "";
  if (field.required && text.trim().length === 0) return "此项为必填";
  if (text.length === 0) return null;
  if (field.kind === "number") {
    const number = Number(text);
    if (!Number.isFinite(number) || field.integer && !Number.isInteger(number)) return field.integer ? "请输入整数" : "请输入数字";
    if (field.minimum != null && number < field.minimum) return `不能小于 ${field.minimum}`;
    if (field.maximum != null && number > field.maximum) return `不能大于 ${field.maximum}`;
    return null;
  }
  if (field.kind === "select" && !field.options?.includes(text)) return "请选择合同声明的选项";
  if (field.minLength != null && text.length < field.minLength) return `至少输入 ${field.minLength} 个字符`;
  if (field.maxLength != null && text.length > field.maxLength) return `最多输入 ${field.maxLength} 个字符`;
  if (field.format === "uri" && !isValidUrl(text)) return "请输入有效网址";
  return null;
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && !url.username && !url.password;
  } catch {
    return false;
  }
}
