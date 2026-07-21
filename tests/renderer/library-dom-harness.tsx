import { useState } from "react";
import { createRoot } from "react-dom/client";

import { createAwaitingTargetCompatibility } from "../../src/renderer/coreIdentityCompatibilityClient";
import { AppShellView } from "../../src/renderer/AppShellView";
import { CreateTaskShell, type CreateTaskSelection } from "../../src/renderer/CreateTaskShell";
import { SiteSkillLibrary } from "../../src/renderer/SiteSkillPages";
import { useAppController, type AppController } from "../../src/renderer/useAppController";
import { runLibraryContractSmoke } from "./library-contract-smoke";
import {
  bossSkill, catalog, detailSkill, identity, identityB, installLibraryShellMock,
  protectedDrafts, runtime, setProtectedDraftDeleteStatus, setProtectedDraftSaveDelay, xhsSkill,
} from "./library-harness-fixtures";
import "../../src/renderer/uiFoundation.css";
import "../../src/renderer/styles.css";
import "../../src/renderer/workbench.css";

installLibraryShellMock();
let controllerSnapshot: AppController | undefined;

function ControllerProbe() {
  controllerSnapshot = useAppController();
  return null;
}

function ProductionHarness() {
  const controller = useAppController();
  controllerSnapshot = controller;
  return <AppShellView controller={controller} />;
}

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
      <ControllerProbe />
      {createSelection == null ? (
        <SiteSkillLibrary
          catalog={catalog} compatibilityBySkill={compatibilityBySkill} identities={[identity, identityB]}
          runtimeSupervisorState={runtime} onCreateIdentity={() => setSelection("create-identity")} onNavigation={() => {}}
          onRecoveryConsumed={() => {}}
          onRecoverCandidate={(_skill, identityId, candidate) => setSelection(`${identityId}:${candidate.recoveryAction}`)}
          onUse={(skill, identityId) => { setSelection(`${skill.packageRef}:${identityId}`); setCreateSelection({ skill, identityId }); }}
        />
      ) : (
        <CreateTaskShell
          catalog={catalog} compatibilityBySkill={compatibilityBySkill} identities={[identity, identityB]}
          selection={createSelection} runtimeSupervisorState={runtime} onSelect={() => {}}
          onCreateIdentity={() => setSelection("create-identity")}
          onCheckCompatibility={async (_skill, identityId) => ({
            status: "ready", summary: "目标已检查。", candidates: [{
              identityEnvironmentRef: [identity, identityB].find((item) => item.id === identityId)!.identityEnvironmentRef,
              status: "compatible", reasonCodes: [], recoveryAction: "none",
            }],
          })}
          onRecover={() => setSelection("check-task-owner")}
          onRecoverCandidate={(_skill, identityId, candidate) => setSelection(`${identityId}:${candidate.recoveryAction}`)}
          onRecoverExactTarget={() => setSelection("use-search-skill")} onTargetChange={() => {}}
        />
      )}
      {createSelection != null ? <button type="button" data-library-switch onClick={() => setCreateSelection(null)}>切换技能</button> : null}
      {createSelection != null ? <button type="button" data-catalog-refresh onClick={() => setCreateSelection((current) => current == null ? null : ({ ...current, skill: { ...current.skill, summary: `${current.skill.summary} refreshed` } }))}>刷新目录</button> : null}
      <output data-library-selection="">{selection}</output>
    </main>
  );
}

const productionMode = new URLSearchParams(window.location.search).has("production");
if (productionMode) window.localStorage.setItem("webenvoy.workbench.task-grouping.v1", "skill");
createRoot(document.getElementById("root")!).render(productionMode ? <ProductionHarness /> : <Harness />);

window.__runLibraryDomSmoke = async (mode) => {
  await twoFrames();
  if (mode === "production") return runProductionShellFlow();
  const directory = await checkDirectory(mode);
  if (mode === "stale") return { mode, staleCreateDisabled: true };
  const controllerRecovery = mode === "desktop" ? await checkControllerIdentityRecovery() : true;
  directory.xhsRow.click();
  await twoFrames();
  checkSkillDetail();
  document.querySelector<HTMLButtonElement>(".production-back-link")?.click();
  await twoFrames();
  const restoredSkillTrigger = document.activeElement as HTMLButtonElement | null;
  if (!restoredSkillTrigger?.classList.contains("production-skill-row-main") ||
    !restoredSkillTrigger.textContent?.includes(xhsSkill.name)) {
    throw new Error("Library detail did not restore focus to its skill trigger.");
  }
  restoredSkillTrigger.click();
  await twoFrames();
  checkSkillDetail();
  const radios = Array.from(document.querySelectorAll<HTMLButtonElement>("[role='radio']"));
  radios[0]!.focus();
  radios[0]!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
  await nextFrame();
  if (radios[1]!.getAttribute("aria-checked") !== "true" || document.activeElement !== radios[1] ||
    document.querySelector<HTMLButtonElement>(".skill-detail-heading .production-primary-button")?.disabled !== true ||
    !document.body.textContent?.includes("登录账号")) throw new Error("Library identity recovery or keyboard navigation failed.");
  radios[1]!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
  await nextFrame();
  document.querySelector<HTMLButtonElement>(".skill-detail-heading .production-primary-button")?.click();
  await twoFrames();
  return { ...await runComposerFlow(mode, directory.searchHeight), controllerRecovery };
};

async function runProductionShellFlow() {
  await waitForController();
  controllerSnapshot!.actions.onHarborStateChange({
    status: "ready",
    fetchedAt: "2026-07-21T00:00:00Z",
    summary: "Identity owner state ready.",
    identities: [identity, identityB],
  });
  await waitUntil(() => controllerSnapshot?.skillWorkbench.compatibilityBySkill[xhsSkill.id]?.status === "ready", "initial compatibility");
  const sidebarAdd = document.querySelector<HTMLButtonElement>(".task-group-add");
  if (sidebarAdd == null) throw new Error("Production sidebar did not render the skill-group create control.");
  sidebarAdd.click();
  await twoFrames();
  const choices = Array.from(document.querySelectorAll<HTMLButtonElement>(".create-task-recommendations > button"));
  if (document.querySelector(".create-task-composer") != null || choices.length !== 2 ||
    choices.some((choice) => !choice.textContent?.includes(xhsSkill.name))) {
    throw new Error("Skill-only task creation did not require a compatible identity selection.");
  }
  assertNoHorizontalOverflow("skill-only chooser");
  choices[0]!.click();
  await waitUntil(() => document.querySelector(".create-task-composer") != null, "identity selection composer");
  assertNoHorizontalOverflow("create-task composer");
  controllerSnapshot!.actions.onHarborStateChange({
    status: "ready",
    fetchedAt: "2026-07-21T00:01:00Z",
    summary: "Selected identity was removed by owner refresh.",
    identities: [identityB],
  });
  await waitUntil(() => document.querySelector(".create-task-composer") == null &&
    document.querySelectorAll(".create-task-recommendations > button").length === 1 &&
    document.activeElement?.matches(".create-task-recommendations > button") === true, "removed identity fallback");
  assertNoHorizontalOverflow("removed identity fallback");
  document.querySelector<HTMLButtonElement>(".create-task-recommendations > button")?.click();
  await waitUntil(() => document.querySelector(".create-task-composer") != null, "replacement identity composer");
  assertNoHorizontalOverflow("replacement identity composer");

  controllerSnapshot!.sources.setLodeCatalogState({ ...catalog, status: "stale", summary: "Catalog stale." });
  await waitUntil(() => controllerSnapshot?.skillWorkbench.compatibilityBySkill[xhsSkill.id]?.status === "unavailable", "stale compatibility");
  controllerSnapshot!.sources.setLodeCatalogState({ ...catalog, status: "ready" });
  await waitUntil(() => controllerSnapshot?.skillWorkbench.compatibilityBySkill[xhsSkill.id]?.status === "ready", "refreshed compatibility");

  controllerSnapshot!.sources.setLodeCatalogState({ ...catalog, status: "offline", summary: "Catalog offline." });
  controllerSnapshot!.skillWorkbench.recoverCandidate(xhsSkill, identityB.id, {
    identityEnvironmentRef: identityB.identityEnvironmentRef,
    status: "incompatible",
    reasonCodes: ["package_contract_invalid"],
    recoveryAction: "repair_package_contract",
  });
  await waitUntil(() => controllerSnapshot?.navigation.activeView === "library" &&
    controllerSnapshot?.skillWorkbench.siteSkillRecoveryRequest != null, "deferred site-skill recovery");
  controllerSnapshot!.actions.openView("work");
  await waitUntil(() => controllerSnapshot?.skillWorkbench.siteSkillRecoveryRequest == null, "abandoned site-skill recovery");

  controllerSnapshot!.sources.setLodeCatalogState({ ...catalog, status: "ready" });
  controllerSnapshot!.skillWorkbench.recoverCandidate(xhsSkill, identityB.id, {
    identityEnvironmentRef: identityB.identityEnvironmentRef,
    status: "incompatible",
    reasonCodes: ["package_contract_invalid"],
    recoveryAction: "repair_package_contract",
  });
  await waitUntil(() => controllerSnapshot?.navigation.activeView === "library" &&
    controllerSnapshot?.skillWorkbench.siteSkillRecoveryRequest == null &&
    document.querySelector<HTMLDetailsElement>(".production-skill-maintenance")?.open === true, "site-skill recovery consumption");
  const horizontalOverflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  if (horizontalOverflow > 1) throw new Error(`Production shell overflowed by ${horizontalOverflow}px.`);
  return {
    sidebarSkillCreate: true,
    skillOnlyIdentityChooser: true,
    removedIdentityRecovered: true,
    staleReadyRecomputed: true,
    abandonedRecoveryCleared: true,
    recoveryRequestConsumed: true,
    horizontalOverflow: false,
  };
}

async function checkControllerIdentityRecovery() {
  await waitForController();
  controllerSnapshot!.actions.onHarborStateChange({
    status: "ready",
    fetchedAt: "2026-07-21T00:00:00Z",
    summary: "Identity fixtures ready.",
    identities: [identity, identityB],
  });
  await twoFrames();
  controllerSnapshot!.skillWorkbench.recoverCandidate(xhsSkill, identityB.id, {
    identityEnvironmentRef: identityB.identityEnvironmentRef,
    status: "requires_setup",
    reasonCodes: ["authentication_required"],
    recoveryAction: "open_manual_auth",
  });
  await twoFrames();
  const recovery = controllerSnapshot!;
  if (recovery.navigation.activeView !== "browser" || recovery.skillWorkbench.identityRecoveryRequest == null ||
    recovery.skillWorkbench.createTaskSelection?.skill.packageRef !== xhsSkill.packageRef ||
    recovery.skillWorkbench.createTaskSelection.identityId !== identityB.id) {
    throw new Error("Controller did not preserve the selected skill and identity while opening authentication recovery.");
  }
  recovery.actions.openView("work");
  await twoFrames();
  const resumed = controllerSnapshot!;
  if (resumed.navigation.activeView !== "work" || resumed.navigation.workMode !== "create" ||
    resumed.skillWorkbench.identityRecoveryRequest != null ||
    resumed.skillWorkbench.createTaskSelection?.skill.packageRef !== xhsSkill.packageRef ||
    resumed.skillWorkbench.createTaskSelection.identityId !== identityB.id) {
    throw new Error("Controller did not consume identity recovery while preserving task creation context.");
  }
  await assertIdentityRecoveryAbandoned("library", () => controllerSnapshot!.actions.openView("library"));
  const task = controllerSnapshot!.tasks.taskThreads[0];
  if (task == null) throw new Error("Controller recovery smoke requires one task thread.");
  await assertIdentityRecoveryAbandoned("task", () => controllerSnapshot!.actions.selectTask(task));
  await assertIdentityRecoveryAbandoned("settings", () => controllerSnapshot!.actions.openSettings());
  await assertIdentityRecoveryAbandoned("new task", () => controllerSnapshot!.actions.createTask());
  controllerSnapshot!.skillWorkbench.selectCreateTaskSkill(detailSkill);
  await twoFrames();
  controllerSnapshot!.skillWorkbench.recoverExactTarget(detailSkill, identity.id);
  await twoFrames();
  if (controllerSnapshot!.navigation.activeView !== "library" || controllerSnapshot!.skillWorkbench.createTaskSelection != null) {
    throw new Error("Exact-target recovery guessed a replacement skill instead of returning to Library.");
  }
  return true;
}

async function assertIdentityRecoveryAbandoned(label: string, navigate: () => void) {
  controllerSnapshot!.skillWorkbench.recoverCandidate(xhsSkill, identityB.id, {
    identityEnvironmentRef: identityB.identityEnvironmentRef,
    status: "requires_setup",
    reasonCodes: ["authentication_required"],
    recoveryAction: "open_manual_auth",
  });
  await waitUntil(() => controllerSnapshot?.navigation.activeView === "browser" &&
    controllerSnapshot?.skillWorkbench.identityRecoveryRequest != null, `${label} identity recovery start`);
  navigate();
  await waitUntil(() => controllerSnapshot?.skillWorkbench.identityRecoveryRequest == null, `${label} identity recovery abandonment`);
  controllerSnapshot!.actions.openView("work");
  await twoFrames();
  if (controllerSnapshot!.skillWorkbench.identityRecoveryRequest != null ||
    controllerSnapshot!.skillWorkbench.createTaskSelection != null) {
    throw new Error(`Controller replayed identity recovery after ${label} navigation.`);
  }
}

async function waitForController() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (controllerSnapshot?.sources.lodeCatalogState.status === "ready" && controllerSnapshot.sources.runtimeSupervisorState.canUseLiveRuntime) return;
    await nextFrame();
  }
  throw new Error("Controller probe did not load owner catalog and runtime state.");
}

async function waitUntil(predicate: () => boolean, label: string) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (predicate()) return;
    await nextFrame();
  }
  throw new Error(`Timed out waiting for ${label}: ${JSON.stringify({
    activeView: controllerSnapshot?.navigation.activeView,
    workMode: controllerSnapshot?.navigation.workMode,
    catalogStatus: controllerSnapshot?.sources.lodeCatalogState.status,
    compatibilityStatus: controllerSnapshot?.skillWorkbench.compatibilityBySkill[xhsSkill.id]?.status,
    recoveryRequest: controllerSnapshot?.skillWorkbench.siteSkillRecoveryRequest,
    body: document.body.textContent?.slice(0, 500),
  })}`);
}

function assertNoHorizontalOverflow(label: string) {
  const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  if (overflow > 1) throw new Error(`${label} overflowed by ${overflow}px.`);
}

async function checkDirectory(mode: "desktop" | "narrow" | "stale") {
  const bodyText = document.body.textContent ?? "";
  const xhsRow = Array.from(document.querySelectorAll<HTMLButtonElement>(".production-skill-row-main")).find((button) => button.textContent?.includes(xhsSkill.name));
  const bossUse = skillUseButton(bossSkill.name);
  const xhsUse = skillUseButton(xhsSkill.name);
  const categoryCount = Array.from(document.querySelectorAll(".production-library-filters button")).filter((button) => button.textContent === xhsSkill.category).length;
  const searchHeight = document.querySelector(".production-library-search")?.getBoundingClientRect().height ?? 0;
  await runLibraryContractSmoke({ catalog, detailSkill, identityEnvironmentRef: identity.identityEnvironmentRef, protectedDrafts, xhsSkill });
  if (!bodyText.includes("发现站点技能") || bodyText.includes("示例技能") || xhsRow == null || bossUse?.disabled !== true ||
    mode === "stale" && xhsUse?.disabled !== true || categoryCount !== 1 || mode === "narrow" && searchHeight > 50) {
    throw new Error("Library directory did not render owner skills or fail closed.");
  }
  return { searchHeight, xhsRow };
}

function checkSkillDetail() {
  const text = document.body.textContent ?? "";
  const primaryUse = document.querySelector<HTMLButtonElement>(".skill-detail-heading .production-primary-button");
  const radios = Array.from(document.querySelectorAll<HTMLButtonElement>("[role='radio']"));
  if (!text.includes("Keyword") || !text.includes("读取和下载") || !text.includes("App 标准结构化视图") ||
    !text.includes("提交时再检查") || primaryUse?.disabled || document.activeElement?.classList.contains("production-back-link") !== true ||
    radios.length !== 2 || radios.filter((radio) => radio.tabIndex === 0).length !== 1) {
    throw new Error("Library detail did not project input, action, output, or compatible identity state.");
  }
}

async function runComposerFlow(mode: string, searchHeight: number) {
  const selection = document.querySelector("[data-library-selection]")?.textContent ?? "";
  const initialInvalid = document.querySelectorAll(".create-task-field [aria-invalid='true']").length;
  document.querySelector<HTMLButtonElement>(".create-task-file-control")?.click();
  await twoFrames();
  const attachmentAdded = document.body.textContent?.includes("library-harness-attachment.txt") === true;
  const longFileName = Array.from(document.querySelectorAll<HTMLElement>(".create-task-file-name"))
    .find((name) => (name.textContent?.length ?? 0) > 200);
  const longFileRemove = longFileName?.parentElement?.querySelector<HTMLButtonElement>("button");
  const longFileLayoutSafe = longFileName != null && longFileRemove != null &&
    longFileName.scrollWidth > longFileName.clientWidth &&
    longFileRemove.getBoundingClientRect().right <= (longFileName.parentElement?.getBoundingClientRect().right ?? 0) + 1;
  document.querySelector<HTMLButtonElement>(".create-task-submit")?.click();
  await nextFrame();
  const submittedInvalid = document.querySelectorAll(".create-task-field [aria-invalid='true']").length;
  const firstErrorFocused = document.activeElement?.getAttribute("name") === "url";
  const live = document.querySelector("[aria-live='assertive']")?.textContent ?? "";
  setInputValue(document.querySelector("[name='url']"), "https://www.xiaohongshu.com/explore");
  setInputValue(document.querySelector("[name='keyword']"), "AI tools");
  document.querySelector<HTMLButtonElement>("[data-catalog-refresh]")?.click();
  await twoFrames();
  const catalogRefreshPreserved = document.querySelector<HTMLInputElement>("[name='keyword']")?.value === "AI tools";
  await reopenComposer();
  const restoredKeyword = document.querySelector<HTMLInputElement>("[name='keyword']")?.value;
  const attachmentRestored = document.body.textContent?.includes("library-harness-attachment.txt") === true;
  document.querySelector<HTMLButtonElement>(".create-task-submit")?.click();
  await twoFrames();
  const submitState = document.querySelector(".create-task-submit-state")?.textContent ?? "";
  setProtectedDraftSaveDelay(300);
  document.querySelector<HTMLButtonElement>("[aria-label^='移除附件']")?.click();
  await new Promise((resolve) => setTimeout(resolve, 220));
  const attachmentRemoved = !document.body.textContent?.includes("library-harness-attachment.txt");
  document.querySelector<HTMLButtonElement>(".create-task-composer-toolbar .production-secondary-button")?.click();
  await new Promise((resolve) => setTimeout(resolve, 450));
  setProtectedDraftSaveDelay(0);
  const cleared = document.querySelector<HTMLInputElement>("[name='keyword']")?.value === "" && !document.body.textContent?.includes("library-harness-attachment.txt");
  const clearedDraftStayedDeleted = ![...protectedDrafts.values()].some((value) => JSON.stringify(value).includes(identity.id));
  setInputValue(document.querySelector("[name='keyword']"), "cannot-delete-persisted-draft");
  await nextFrame();
  setProtectedDraftDeleteStatus("unavailable");
  document.querySelector<HTMLButtonElement>(".create-task-composer-toolbar .production-secondary-button")?.click();
  await twoFrames();
  const unavailableDeleteWarning = document.querySelector("[aria-live='assertive']")?.textContent?.includes("无法确认系统安全存储中的旧记录已删除") === true;
  setProtectedDraftDeleteStatus("ready");
  const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  if (!selection.includes("xiaohongshu/search-notes") || initialInvalid !== 0 || submittedInvalid < 2 || !attachmentAdded ||
    !attachmentRestored || !attachmentRemoved || restoredKeyword !== "AI tools" || !catalogRefreshPreserved || !cleared || !clearedDraftStayedDeleted || !firstErrorFocused ||
    !live.includes("字段需要修正") || !submitState.includes("任务提交服务尚未接入") || overflow > 1 ||
    !unavailableDeleteWarning || mode === "narrow" && !longFileLayoutSafe) {
    throw new Error(`Library composer recovery or responsive layout failed: ${JSON.stringify({ selection, overflow, searchHeight })}`);
  }
  return { mode, selection, overflow, searchHeight, submittedInvalid, draftPreserved: restoredKeyword, catalogRefreshPreserved, attachmentAdded, attachmentRemoved, attachmentRestored, cleared, clearedDraftStayedDeleted, firstErrorFocused, longFileLayoutSafe, unavailableDeleteWarning };
}

async function reopenComposer() {
  document.querySelector<HTMLButtonElement>("[data-library-switch]")?.click();
  await twoFrames();
  Array.from(document.querySelectorAll<HTMLButtonElement>(".production-skill-row-main")).find((button) => button.textContent?.includes(xhsSkill.name))?.click();
  await twoFrames();
  document.querySelector<HTMLButtonElement>(".skill-detail-heading .production-primary-button")?.click();
  await twoFrames();
}

function skillUseButton(name: string) {
  return Array.from(document.querySelectorAll<HTMLButtonElement>(".production-skill-row .production-primary-button"))
    .find((button) => button.closest(".production-skill-row")?.textContent?.includes(name));
}

function setInputValue(input: HTMLInputElement | null, value: string) {
  if (input == null) throw new Error("Expected schema-driven input is missing.");
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));
const twoFrames = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

declare global {
  interface Window {
    __runLibraryDomSmoke: (mode: "desktop" | "narrow" | "stale" | "production") => Promise<Record<string, unknown>>;
  }
}
