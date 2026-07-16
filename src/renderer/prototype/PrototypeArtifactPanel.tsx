import * as Tabs from "@radix-ui/react-tabs";
import { Braces, ExternalLink, FileText, Image as ImageIcon, LoaderCircle, Plus, X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import samplePagePreview from "../../../artifacts/app-208-real-read-task.png";
import { productRows, resultRows, type ArtifactSet, type PrototypePreviewSelection, type PrototypeRun, type PrototypeTask } from "./prototypeData";

const downloadFiles = [
  { name: "新品发布会-主片.mp4", size: "126 MB", state: "已保存" },
  { name: "产品特写-竖版.mp4", size: "84 MB", state: "已保存" },
  { name: "用户访谈-片段.mp4", size: "42 MB", state: "已保存" },
  { name: "幕后花絮.mp4", size: null, state: "来源已失效" },
];

type FileTabId = "json" | "markdown" | "image";
type ResultTabId = `result:${string}`;
type ArtifactTabId = FileTabId | ResultTabId;
type RunTabState = { openTabIds: ArtifactTabId[]; activeTabId: ArtifactTabId | null };
type ResultSelection = Extract<PrototypePreviewSelection, { kind: "note" | "product" }>;

const artifactTabLabels: Record<FileTabId, string> = {
  json: "result.json",
  markdown: "summary.md",
  image: "page.png",
};

export function PrototypeArtifactPanel({ requestKey, run, selection, tabHost, task }: { requestKey: number; run: PrototypeRun | null; selection: PrototypePreviewSelection | null; tabHost: Element | null; task: PrototypeTask }) {
  const artifactSet = run?.artifactSet ?? (run == null ? undefined : task.artifactSet);
  const state = run == null ? "none" : run.artifactState ?? task.artifactState ?? (artifactSet == null ? "none" : "ready");
  const artifact = run != null && state === "ready" && artifactSet != null ? createArtifact(run, artifactSet) : null;
  const [resultTabs, setResultTabs] = useState<Record<ResultTabId, ResultSelection>>({});
  const [tabStateByRun, setTabStateByRun] = useState<Record<string, RunTabState>>({});
  const tabState = run == null ? initialRunTabState() : tabStateByRun[run.id] ?? initialRunTabState();
  const addButtonRef = useRef<HTMLButtonElement | null>(null);
  const panelContentRef = useRef<HTMLDivElement | null>(null);
  const previousRequestKeyRef = useRef(requestKey);
  const availableTabIds = useMemo<ArtifactTabId[]>(() => {
    if (run == null) return [];
    const result: ArtifactTabId[] = Object.entries(resultTabs).filter(([, item]) => item.runId === run.id).map(([tabId]) => tabId as ResultTabId);
    if (artifact != null) result.push("json", "markdown");
    if (artifact != null && artifactSet === "xhs-notes") result.push("image");
    return result;
  }, [artifact, artifactSet, resultTabs, run]);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  useEffect(() => {
    if (selection == null || run == null) return;
    const tabId = selection.kind === "file" ? selection.tab : resultTabId(selection);
    if (selection.kind !== "file") setResultTabs((current) => ({ ...current, [tabId as ResultTabId]: selection }));
    setTabStateByRun((current) => {
      const currentRun = current[run.id] ?? initialRunTabState();
      return { ...current, [run.id]: { openTabIds: currentRun.openTabIds.includes(tabId) ? currentRun.openTabIds : [...currentRun.openTabIds, tabId], activeTabId: tabId } };
    });
  }, [requestKey, run, selection]);

  useEffect(() => {
    const activeTab = Array.from(tabHost?.querySelectorAll<HTMLElement>("[data-artifact-tab-id]") ?? []).find((element) => element.dataset.artifactTabId === tabState.activeTabId);
    activeTab?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [tabHost, tabState.activeTabId, tabState.openTabIds.length]);

  useEffect(() => {
    if (previousRequestKeyRef.current === requestKey) return;
    previousRequestKeyRef.current = requestKey;
    const frame = window.requestAnimationFrame(() => panelContentRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [requestKey]);

  function activateTab(tabId: ArtifactTabId) {
    if (run == null) return;
    setTabStateByRun((current) => {
      const currentRun = current[run.id] ?? initialRunTabState();
      return { ...current, [run.id]: { ...currentRun, activeTabId: tabId } };
    });
  }

  function focusTab(tabId: ArtifactTabId | null) {
    if (tabId == null) return;
    window.requestAnimationFrame(() => {
      Array.from(tabHost?.querySelectorAll<HTMLElement>("[data-artifact-tab-id]") ?? []).find((element) => element.dataset.artifactTabId === tabId)?.focus();
    });
  }

  function closeTab(tabId: ArtifactTabId) {
    if (run == null) return;
    const index = tabState.openTabIds.indexOf(tabId);
    const nextTabs = tabState.openTabIds.filter((id) => id !== tabId);
    const nextActiveTab = tabState.activeTabId === tabId ? nextTabs[Math.min(index, nextTabs.length - 1)] ?? null : tabState.activeTabId;
    setTabStateByRun((current) => {
      return { ...current, [run.id]: { openTabIds: nextTabs, activeTabId: nextActiveTab } };
    });
    focusTab(nextActiveTab);
  }

  function openTab(tabId: ArtifactTabId) {
    if (run == null) return;
    setTabStateByRun((current) => {
      const currentRun = current[run.id] ?? initialRunTabState();
      return { ...current, [run.id]: { openTabIds: currentRun.openTabIds.includes(tabId) ? currentRun.openTabIds : [...currentRun.openTabIds, tabId], activeTabId: tabId } };
    });
    setAddMenuOpen(false);
    focusTab(tabId);
  }

  const closedTabIds = availableTabIds.filter((id) => !tabState.openTabIds.includes(id));

  return (
    <aside className="prototype-artifact-panel codex-scrollbar" aria-label="任务文件预览">
      <Tabs.Root className="panel-tabs prototype-controlled-tabs" value={tabState.activeTabId ?? ""} onValueChange={(value) => activateTab(value as ArtifactTabId)}>
        {tabHost == null ? null : createPortal(
          <div className="panel-tab-strip prototype-artifact-tab-strip">
            <div className="panel-tab-scroll"><Tabs.List className="panel-tab-list" aria-label="任务文件预览">{tabState.openTabIds.map((tabId) => <div className={`prototype-closable-tab ${tabState.activeTabId === tabId ? "active" : ""}`} key={tabId}><Tabs.Trigger className="panel-tab-trigger" data-artifact-tab-id={tabId} title={tabLabel(tabId, resultTabs)} value={tabId}><span className="panel-tab-label">{tabLabel(tabId, resultTabs)}</span></Tabs.Trigger><button className="prototype-tab-close" type="button" aria-label={`关闭 ${tabLabel(tabId, resultTabs)}`} title="关闭" onClick={() => closeTab(tabId)}><X size={12} /></button></div>)}</Tabs.List></div>
            <div className="prototype-tab-add-wrap" onKeyDown={(event) => { if (event.key === "Escape" && addMenuOpen) { event.preventDefault(); setAddMenuOpen(false); addButtonRef.current?.focus(); } }}><button ref={addButtonRef} className="prototype-tab-add" type="button" aria-label="打开文件" title="打开文件" disabled={closedTabIds.length === 0} onClick={() => setAddMenuOpen((open) => !open)}><Plus size={14} /></button>{addMenuOpen ? <div className="prototype-tab-add-menu">{closedTabIds.map((tabId) => <button type="button" key={tabId} onClick={() => openTab(tabId)}>{tabLabel(tabId, resultTabs)}</button>)}</div> : null}</div>
          </div>,
          tabHost,
        )}
        <div ref={panelContentRef} className="panel-tab-content" tabIndex={-1}>{run == null ? <ArtifactIdle /> : tabState.activeTabId == null ? state === "pending" ? <ArtifactPending /> : availableTabIds.length > 0 ? <ArtifactTabsClosed /> : <ArtifactEmpty /> : renderTab(tabState.activeTabId, artifact, artifactSet, resultTabs, run, state, task)}</div>
      </Tabs.Root>
    </aside>
  );
}

function initialRunTabState(): RunTabState {
  return { openTabIds: [], activeTabId: null };
}

function resultTabId(result: ResultSelection): ResultTabId {
  return `result:${result.runId}:${result.kind}:${result.row[0]}`;
}

function isResultTabId(tabId: ArtifactTabId): tabId is ResultTabId {
  return tabId.startsWith("result:");
}

function tabLabel(tabId: ArtifactTabId, resultTabs: Record<ResultTabId, ResultSelection>) {
  if (!isResultTabId(tabId)) return artifactTabLabels[tabId];
  const result = resultTabs[tabId];
  return result == null ? "结果详情" : `${result.kind === "product" ? "商品" : "笔记"} · ${result.row[0]}`;
}

function renderTab(tabId: ArtifactTabId, artifact: ReturnType<typeof createArtifact> | null, artifactSet: ArtifactSet | undefined, resultTabs: Record<ResultTabId, ResultSelection>, run: PrototypeRun, state: "ready" | "pending" | "none", task: PrototypeTask) {
  if (isResultTabId(tabId)) return resultTabs[tabId] == null ? <ArtifactEmpty /> : <ResultItemPreview result={resultTabs[tabId]} />;
  if (artifact == null) return state === "pending" ? <ArtifactPending /> : <ArtifactEmpty />;
  if (tabId === "json") return <FilePreview icon={<Braces size={16} />} name="result.json" meta={artifact.jsonMeta}><pre>{JSON.stringify(artifact.payload, null, 2)}</pre></FilePreview>;
  if (tabId === "markdown") return <FilePreview icon={<FileText size={16} />} name="summary.md" meta="Markdown"><ArtifactMarkdown run={run} task={task} set={artifactSet} /></FilePreview>;
  return <FilePreview icon={<ImageIcon size={16} />} name="page.png" meta="PNG · 1280 × 800"><img className="artifact-image-preview" src={samplePagePreview} alt="小红书采集任务页面截图样例" /></FilePreview>;
}

function ResultItemPreview({ result }: { result: ResultSelection }) {
  const { row } = result;
  const product = result.kind === "product";
  return (
    <article className="artifact-result-preview">
      <div className="artifact-result-heading">
        <div><span>{product ? "采集结果 · 商品" : "采集结果 · 笔记"}</span><h2>{row[0]}</h2><p>{product ? `${row[1]} · ${row[2]} · ${row[3]}读取` : `${row[1]} · ${row[3]}`}</p></div>
        <button type="button" aria-label={product ? "打开商品详情" : "打开来源页面"} title={product ? "打开商品详情" : "打开来源页面"}><ExternalLink size={15} /></button>
      </div>
      <div className="artifact-result-body">
        <p>{product ? "轻量便携的桌面补光设备，适合直播、视频会议和近距离产品拍摄。" : "把资料交给 AI 之前，先明确最终要消费的业务结果。适合自动化的不是打开网页本身，而是可重复的搜索、阅读、整理和交付过程。"}</p>
        {!product ? <p>这篇笔记整理了五种常见方法，并对适用场景、输入要求和结果形式进行了对比。</p> : null}
      </div>
      <dl className="artifact-result-facts">
        {product ? <><div><dt>价格</dt><dd>{row[1]}</dd></div><div><dt>库存</dt><dd>{row[2]}</dd></div><div><dt>店铺</dt><dd>示例数码配件店</dd></div><div><dt>发货地</dt><dd>浙江杭州</dd></div></> : <><div><dt>互动</dt><dd>{row[2]}</dd></div><div><dt>评论</dt><dd>126</dd></div><div><dt>收藏</dt><dd>943</dd></div><div><dt>话题</dt><dd>#AI工具 #效率提升</dd></div></>}
      </dl>
    </article>
  );
}

function createArtifact(run: PrototypeRun, set: ArtifactSet) {
  if (set === "xhs-notes") {
    const items = resultRows.map(([title, author, interactions, readAt]) => ({ title, author, interactions, readAt }));
    const total = run.artifactTotal ?? items.length;
    return { jsonMeta: `JSON · ${items.length}/${total} 条预览`, payload: { input: run.input, status: run.stateLabel, total, preview: items } };
  }
  if (set === "shop-products") {
    const items = productRows.map(([title, price, stock, readAt]) => ({ title, price, stock, readAt }));
    const current = run.artifactCurrent ?? items.length;
    return { jsonMeta: `JSON · ${items.length}/${current} 条预览`, payload: { input: run.input, status: run.stateLabel, current, expected: run.artifactTotal, preview: items } };
  }
  if (set === "article") {
    return { jsonMeta: "JSON · 文章摘要", payload: { input: run.input, title: "我们如何把重复的网站工作变成可复用任务", author: "WebEnvoy 产品团队", publishedAt: "2026-07-14" } };
  }
  if (set === "download-files") {
    return { jsonMeta: `JSON · ${downloadFiles.length} 个文件`, payload: { input: run.input, files: downloadFiles } };
  }
  return { jsonMeta: "JSON · 未提交", payload: { input: run.input, submitted: false, title: "三个让我每天省下两小时的 AI 工具", topics: ["AI工具", "效率提升", "内容创作", "工作流"] } };
}

function ArtifactMarkdown({ run, set, task }: { run: PrototypeRun; set: ArtifactSet | undefined; task: PrototypeTask }) {
  return (
    <article className="markdown-preview">
      <h1>{run.input}</h1>
      <p>{run.summary}</p>
      <h2>{set === "write-preview" ? "提交状态" : set === "download-files" ? "文件结果" : "任务结果"}</h2>
      {set === "write-preview" ? <p><strong>未提交</strong>。页面内容已填写并校验，没有点击发布。</p> : null}
      {set === "download-files" ? <ul>{downloadFiles.map((file) => <li key={file.name}>{file.name}：{file.state}</li>)}</ul> : null}
      {set !== "write-preview" && set !== "download-files" ? <ul><li>站点：{task.site}</li><li>站点技能：{task.skill}</li><li>账号身份：{task.identity}</li></ul> : null}
      <blockquote>这是交互原型中的样例文件预览。</blockquote>
    </article>
  );
}

function ArtifactPending() {
  return <div className="artifact-empty"><LoaderCircle size={20} /><strong>文件尚未生成</strong><span>任务产出首个文件后会显示在这里。</span></div>;
}

function ArtifactIdle() {
  return <div className="artifact-empty"><FileText size={20} /><strong>尚未打开预览</strong><span>从中栏的任务回合中打开结果或文件。</span></div>;
}

function ArtifactEmpty() {
  return <div className="artifact-empty"><ImageIcon size={20} /><strong>没有可预览文件</strong><span>当前运行尚未返回文件。</span></div>;
}

function ArtifactTabsClosed() {
  return <div className="artifact-empty"><FileText size={20} /><strong>没有打开的文件</strong><span>点击上方“+”打开当前运行的文件。</span></div>;
}

function FilePreview({ children, icon, meta, name }: { children: ReactNode; icon: ReactNode; meta: string; name: string }) {
  return <section className="artifact-file-preview"><header>{icon}<div><strong>{name}</strong><span>{meta}</span></div></header><div className="artifact-preview-body">{children}</div></section>;
}
