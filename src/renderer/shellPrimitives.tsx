import * as Tabs from "@radix-ui/react-tabs";
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { useState } from "react";

export type FocusAreaName = "left-panel" | "thread-workspace" | "right-panel" | "bottom-panel";

type AppShellProps = {
  left: ReactNode;
  workspace: ReactNode;
  right: ReactNode;
};

export function AppShell({ left, workspace, right }: AppShellProps) {
  const [rightWidth, setRightWidth] = useState(336);
  const [activeFocusArea, setActiveFocusArea] = useState<FocusAreaName>("thread-workspace");
  const [hoveredFocusArea, setHoveredFocusArea] = useState<FocusAreaName>("thread-workspace");

  function resolveFocusArea(target: EventTarget | null) {
    if (!(target instanceof Element)) {
      return "thread-workspace";
    }

    const area = target.closest<HTMLElement>("[data-focus-area]")?.dataset.focusArea;
    return isFocusAreaName(area) ? area : "thread-workspace";
  }

  return (
    <main
      className="app-shell"
      data-active-focus-area={activeFocusArea}
      data-hovered-focus-area={hoveredFocusArea}
      style={{ "--right-panel-width": `${rightWidth}px` } as CSSProperties}
      onFocusCapture={(event) => setActiveFocusArea(resolveFocusArea(event.target))}
      onPointerOverCapture={(event) => setHoveredFocusArea(resolveFocusArea(event.target))}
    >
      <div className="app-shell-body">
        {left}
        <div className="main-surface">{workspace}</div>
        <ResizablePanel
          className="right-panel-resizer"
          side="left"
          minWidth={300}
          maxWidth={468}
          width={rightWidth}
          onResize={setRightWidth}
        >
          {right}
        </ResizablePanel>
      </div>
    </main>
  );
}

export function FocusArea({
  area,
  className = "",
  children,
}: {
  area: FocusAreaName;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className} data-focus-area={area} tabIndex={-1}>
      {children}
    </div>
  );
}

export function LeftPanel({ children }: { children: ReactNode }) {
  return (
    <FocusArea area="left-panel" className="left-panel">
      {children}
    </FocusArea>
  );
}

export function ThreadWorkspace({
  header,
  children,
  bottom,
}: {
  header: ReactNode;
  children: ReactNode;
  bottom: ReactNode;
}) {
  return (
    <FocusArea area="thread-workspace" className="thread-workspace">
      {header}
      <div className="main-content-viewport">
        <div className="main-content-frame">{children}</div>
      </div>
      <BottomPanelSlot>{bottom}</BottomPanelSlot>
    </FocusArea>
  );
}

export function RightPanel({ children }: { children: ReactNode }) {
  return (
    <FocusArea area="right-panel" className="right-panel">
      {children}
    </FocusArea>
  );
}

export function BottomPanelSlot({ children }: { children: ReactNode }) {
  return (
    <FocusArea area="bottom-panel" className="bottom-panel-slot">
      {children}
    </FocusArea>
  );
}

export function PanelTabs({
  tabs,
  defaultValue,
  ariaLabel,
}: {
  tabs: Array<{ id: string; label: string; content: ReactNode }>;
  defaultValue: string;
  ariaLabel: string;
}) {
  return (
    <Tabs.Root className="panel-tabs" defaultValue={defaultValue}>
      <Tabs.List className="panel-tab-list" aria-label={ariaLabel}>
        {tabs.map((tab) => (
          <Tabs.Trigger className="panel-tab-trigger" value={tab.id} key={tab.id}>
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {tabs.map((tab) => (
        <Tabs.Content className="panel-tab-content" value={tab.id} key={tab.id}>
          {tab.content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}

export function ResizablePanel({
  side,
  width,
  minWidth,
  maxWidth,
  onResize,
  className = "",
  children,
}: {
  side: "left" | "right";
  width: number;
  minWidth: number;
  maxWidth: number;
  onResize: (width: number) => void;
  className?: string;
  children: ReactNode;
}) {
  function startResize(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    const startX = event.clientX;
    const startWidth = width;

    function handlePointerMove(moveEvent: PointerEvent) {
      const delta = moveEvent.clientX - startX;
      const nextWidth = side === "left" ? startWidth - delta : startWidth + delta;
      onResize(Math.min(maxWidth, Math.max(minWidth, nextWidth)));
    }

    function handlePointerUp() {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }

  return (
    <div className={`resizable-panel ${className}`}>
      <div
        className={`resize-handle resize-handle-${side}`}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panel"
        onPointerDown={startResize}
      />
      {children}
    </div>
  );
}

function isFocusAreaName(area: string | undefined): area is FocusAreaName {
  return (
    area === "left-panel" ||
    area === "thread-workspace" ||
    area === "right-panel" ||
    area === "bottom-panel"
  );
}
