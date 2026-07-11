import {
  ArrowUp,
  Mic,
  Paperclip,
  Plus,
  ShieldCheck,
  Target,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { coreTaskSubmitReadiness, type CoreTaskSubmitState } from "./coreTaskSubmitClient";
import { registerComposerInput } from "./focusComposer";
import type { HarborIdentityLoadState } from "./harborIdentityTypes";
import type { RuntimeSupervisorState } from "./runtimeSupervisorState";
import type { RunProjection, TaskProjection } from "./taskThreadFixtures";

export function TaskThreadComposer({
  coreSubmitState,
  harborIdentityState,
  runtimeSupervisorState,
  businessInput,
  selectedRun,
  selectedTask,
  onBusinessInputChange,
  onSubmitCoreTask,
}: {
  coreSubmitState: CoreTaskSubmitState;
  harborIdentityState: HarborIdentityLoadState;
  runtimeSupervisorState: RuntimeSupervisorState;
  businessInput: string;
  selectedRun: RunProjection;
  selectedTask: TaskProjection;
  onBusinessInputChange: (value: string) => void;
  onSubmitCoreTask: () => void;
}) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const [footerMeasure, setFooterMeasure] = useState({
    actionsWidth: 0,
    columnGap: 0,
    containerWidth: 0,
  });
  const availableFooterWidth = Math.max(
    0,
    footerMeasure.containerWidth -
      footerMeasure.actionsWidth -
      (footerMeasure.actionsWidth > 0 ? footerMeasure.columnGap : 0),
  );
  const hideRunContext = availableFooterWidth > 0 && availableFooterWidth < 128;
  const hideSkillContext = availableFooterWidth > 0 && availableFooterWidth < 96;
  const hideAccessControl = availableFooterWidth > 0 && availableFooterWidth < 62;
  const submitReadiness = coreTaskSubmitReadiness(
    selectedTask,
    runtimeSupervisorState,
    harborIdentityState.identities,
  );
  const isBusy = coreSubmitState.status === "submitting" || coreSubmitState.status === "polling";
  const canSubmit = submitReadiness.ok && !isBusy;
  const isRestrictedFallback = submitReadiness.ok && submitReadiness.identity.readiness.state === "warning";
  const submitSummary = submitReadiness.ok
    ? isRestrictedFallback
      ? `Warning：官方 Chrome 受限后备，仅允许单次 ${selectedTask.id.includes("boss") ? "BOSS 职位搜索" : "小红书"}只读任务。${coreSubmitState.summary}`
      : coreSubmitState.summary
    : submitReadiness.reason;

  useEffect(() => {
    const composerInput = inputRef.current;
    if (composerInput == null) {
      return;
    }

    return registerComposerInput(composerInput, {
      composerId: "task-thread-primary",
      isPrimaryComposer: true,
    });
  }, []);

  useEffect(() => {
    const toolbar = toolbarRef.current;
    const actions = actionsRef.current;
    if (
      toolbar == null ||
      actions == null ||
      typeof ResizeObserver === "undefined"
    ) {
      return;
    }

    let animationFrame = 0;
    const readMeasure = () => {
      const { columnGap, gap } = window.getComputedStyle(toolbar);
      const nextMeasure = {
        actionsWidth: actions.getBoundingClientRect().width,
        columnGap: Number.parseFloat(columnGap) || Number.parseFloat(gap) || 0,
        containerWidth: toolbar.getBoundingClientRect().width,
      };

      setFooterMeasure((currentMeasure) =>
        Math.abs(currentMeasure.actionsWidth - nextMeasure.actionsWidth) < 0.5 &&
        Math.abs(currentMeasure.columnGap - nextMeasure.columnGap) < 0.5 &&
        Math.abs(currentMeasure.containerWidth - nextMeasure.containerWidth) < 0.5
          ? currentMeasure
          : nextMeasure,
      );
    };
    const scheduleMeasure = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(readMeasure);
    };

    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(toolbar);
    observer.observe(actions);
    readMeasure();
    window.addEventListener("resize", scheduleMeasure);
    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, []);

  return (
    <form
      className="thread-composer"
      aria-label="Task thread composer"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit) onSubmitCoreTask();
      }}
    >
      <textarea
        ref={inputRef}
        data-webenvoy-composer=""
        value={businessInput}
        rows={2}
        onChange={(event) => onBusinessInputChange(event.currentTarget.value)}
        placeholder={selectedTask.id.includes("boss") ? '{"query":"前端工程师","city_code":"101020100","page":1,"limit":15}' : "当前任务的结构化业务输入"}
      />
      <div className="composer-toolbar" ref={toolbarRef}>
        <div className="composer-inline-controls">
          <button className="composer-icon-button" type="button" aria-label="添加上下文">
            <Plus size={15} />
          </button>
          <button
            className={
              hideAccessControl
                ? "composer-access composer-control-hidden"
                : "composer-access"
            }
            type="button"
          >
            <ShieldCheck size={14} />
            <span className="composer-button-label">{selectedRun.writePrecheck ? "No-submit 边界" : "只读边界"}</span>
          </button>
        </div>
        <div className="composer-expanding-controls">
          <button
            className={
              hideSkillContext
                ? "composer-context-pill composer-context-skill composer-control-hidden"
                : "composer-context-pill composer-context-skill"
            }
            type="button"
          >
            <Target size={14} />
            <span className="composer-button-label">{selectedTask.siteSkill}</span>
          </button>
          <button
            className={
              hideRunContext
                ? "composer-context-pill composer-context-run composer-control-hidden"
                : "composer-context-pill composer-context-run"
            }
            type="button"
          >
            <Zap size={14} />
            <span className="composer-button-label">{selectedRun.label}</span>
          </button>
        </div>
        <div className="composer-actions" ref={actionsRef}>
          <button className="composer-icon-button" type="button" aria-label="附件">
            <Paperclip size={15} />
          </button>
          <button className="composer-icon-button" type="button" aria-label="语音输入">
            <Mic size={15} />
          </button>
          <button
            className="composer-send"
            type="submit"
            aria-label="提交只读 Core task"
            disabled={!canSubmit}
            title={submitSummary}
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
      <p className={isRestrictedFallback ? "composer-submit-status warning" : canSubmit ? "composer-submit-status ready" : "composer-submit-status blocked"}>
        {submitSummary}
      </p>
    </form>
  );
}
