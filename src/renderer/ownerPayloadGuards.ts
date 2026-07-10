const fixtureToken = /(^|[\s:._/-])(demo|fixture|smoke)([\s:._/-]|$)/i;
const metadataKey = /(capture_method|environment|id|kind|locator|mode|provenance|ref|refs|runtime|schema|source|type)/i;

export function fixtureOrDemoPayloadReason(value: unknown): string | null {
  return fixtureOrDemoReason(value, "$", 0);
}

function fixtureOrDemoReason(value: unknown, path: string, depth: number): string | null {
  if (typeof value === "string" && metadataKey.test(path) && fixtureToken.test(value)) {
    return `${path}=${value}`;
  }
  if (depth > 8) return null;
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const reason = fixtureOrDemoReason(value[index], `${path}[${index}]`, depth + 1);
      if (reason) return reason;
    }
    return null;
  }
  if (!isRecord(value)) return null;

  for (const [key, field] of Object.entries(value)) {
    if ((key === "demo" || key === "fixture" || key === "is_demo" || key === "is_fixture") && field === true) {
      return `${path}.${key}=true`;
    }
    if (typeof field === "string" && metadataKey.test(key) && fixtureToken.test(field)) {
      return `${path}.${key}=${field}`;
    }
    if (isRecord(field) || Array.isArray(field)) {
      const reason = fixtureOrDemoReason(field, `${path}.${key}`, depth + 1);
      if (reason) return reason;
    }
  }
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
