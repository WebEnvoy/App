import { useEffect, useState } from "react";

import {
  loadingSkillIdentityCompatibility,
  type IdentityCompatibilityCandidate,
  type SkillIdentityCompatibilityState,
} from "./coreIdentityCompatibilityClient";
import type { IdentityEnvironmentProjection } from "./identityEnvironmentFixtures";
import type { LodeCatalogLoadState, LodeCatalogSkill } from "./lodeCatalogClient";
import type { RuntimeSupervisorState } from "./runtimeSupervisorState";
import { SiteSkillDetail } from "./SiteSkillDetail";
import { SiteSkillDirectory } from "./SiteSkillDirectory";
import "./SiteSkillPages.css";

type LibraryMode = "catalog" | "detail";

type SiteSkillLibraryProps = {
  catalog: LodeCatalogLoadState;
  compatibilityBySkill: Record<string, SkillIdentityCompatibilityState>;
  identities: IdentityEnvironmentProjection[];
  runtimeSupervisorState: RuntimeSupervisorState;
  onCreateIdentity: () => void;
  onNavigation: () => void;
  onRecoverCandidate: (skill: LodeCatalogSkill, identityId: string, candidate: IdentityCompatibilityCandidate) => void;
  onUse: (skill: LodeCatalogSkill, identityId?: string) => void;
};

export function SiteSkillLibrary(props: SiteSkillLibraryProps) {
  const { catalog, compatibilityBySkill } = props;
  const [mode, setMode] = useState<LibraryMode>("catalog");
  const [selectedSkillId, setSelectedSkillId] = useState(catalog.skills[0]?.id ?? "");
  const selectedSkill = catalog.skills.find((skill) => skill.id === selectedSkillId);

  useEffect(() => {
    if (mode === "detail" && selectedSkill == null) setMode("catalog");
  }, [mode, selectedSkill]);

  if (mode === "detail" && selectedSkill != null) {
    return (
      <SiteSkillDetail
        catalogStatus={catalog.status}
        compatibility={compatibilityBySkill[selectedSkill.id] ?? loadingSkillIdentityCompatibility()}
        identities={props.identities}
        runtimeSupervisorState={props.runtimeSupervisorState}
        skill={selectedSkill}
        onBack={() => { props.onNavigation(); setMode("catalog"); }}
        onContextChange={props.onNavigation}
        onCreateIdentity={props.onCreateIdentity}
        onRecoverCandidate={props.onRecoverCandidate}
        onUse={props.onUse}
      />
    );
  }

  return (
    <SiteSkillDirectory
      catalog={catalog}
      compatibilityBySkill={compatibilityBySkill}
      identities={props.identities}
      runtimeSupervisorState={props.runtimeSupervisorState}
      onOpen={(skill) => { props.onNavigation(); setSelectedSkillId(skill.id); setMode("detail"); }}
      onUse={props.onUse}
    />
  );
}
