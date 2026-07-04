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

import { handleTypeToComposer, registerComposerInput } from "./focusComposer";
import type { RunProjection, TaskProjection } from "./taskThreadFixtures";

export function TaskThreadComposer({
  selectedRun,
  selectedTask,
}: {
  selectedRun: RunProjection;
  selectedTask: TaskProjection;
}) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const [draft, setDraft] = useState("");
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
    function handleKeyDown(event: KeyboardEvent) {
      const composerInput = inputRef.current;
      if (composerInput == null) {
        return;
      }

      handleTypeToComposer({
        event,
        composerController: {
          focus: () => composerInput.focus(),
          insertTextAtSelection: (text) =>
            insertComposerText(composerInput, text, setDraft),
        },
      });
    }

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
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
      onSubmit={(event) => event.preventDefault()}
    >
      <textarea
        ref={inputRef}
        data-webenvoy-composer=""
        value={draft}
        rows={2}
        placeholder="要求后续变更"
        onChange={(event) => setDraft(event.target.value)}
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
            <span className="composer-button-label">只读边界</span>
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
          <button className="composer-send" type="submit" aria-label="发送" disabled>
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </form>
  );
}

function insertComposerText(
  composerInput: HTMLTextAreaElement,
  text: string,
  setDraft: (value: string) => void,
) {
  const selectionStart = composerInput.selectionStart;
  const selectionEnd = composerInput.selectionEnd;
  const nextValue =
    composerInput.value.slice(0, selectionStart) +
    text +
    composerInput.value.slice(selectionEnd);

  setDraft(nextValue);
  requestAnimationFrame(() => {
    const nextPosition = selectionStart + text.length;
    composerInput.selectionStart = nextPosition;
    composerInput.selectionEnd = nextPosition;
  });
}
