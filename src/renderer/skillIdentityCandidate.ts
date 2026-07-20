import type { IdentityEnvironmentProjection } from "./identityEnvironmentFixtures";
import { catalogSkillSiteId, type LodeCatalogSkill } from "./lodeCatalogClient";

export function isDeterministicSkillIdentityCandidate(
  skill: LodeCatalogSkill,
  identity: IdentityEnvironmentProjection,
) {
  const siteId = catalogSkillSiteId(skill);
  return siteId != null &&
    identity.source === "Harbor live" &&
    identity.siteId === siteId &&
    identity.readiness.state !== "blocked" &&
    skill.actions.every((action) =>
      action.supportedOrigins.length === 0 || action.supportedOrigins.includes(identity.origin),
    );
}
