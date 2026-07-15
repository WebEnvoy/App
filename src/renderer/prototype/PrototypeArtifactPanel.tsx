import { Braces, ExternalLink, FileText, Image as ImageIcon, LoaderCircle, Plus, X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import samplePagePreview from "../../../artifacts/app-208-real-read-task.png";
import { productRows, resultRows, type ArtifactSet, type PrototypeResultSelection, type PrototypeRun, type PrototypeTask } from "./prototypeData";

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

const artifactTabLabels: Record<FileTabId, string> = {
  json: "result.json",
  markdown: "summary.md",
  image: "page.png",
};

export function PrototypeArtifactPanel({ requestKey, run, selectedResult, task }: { requestKey: number; run: PrototypeRun; selectedResult: PrototypeResultSelection | null; task: PrototypeTask }) {
  const artifactSet = run.artifactSet ?? task.artifactSet;
  const state = run.artifactState ?? task.artifactState ?? (artifactSet == null ? "none" : "ready");
  const artifact = state === "ready" && artifactSet != null ? createArtifact(run, artifactSet) : null;
  const [resultTabs, setResultTabs] = useState<Record<ResultTabId, PrototypeResultSelection>>({});
  const defaultTab: FileTabId | null = state === "ready" ? artifactSet === "article" ? "markdown" : "json" : null;
  const [tabStateByRun, setTabStateByRun] = useState<Record<string, RunTabState>>({});
  const tabState = tabStateByRun[run.id] ?? initialRunTabState(defaultTab);
  const availableTabIds = useMemo<ArtifactTabId[]>(() => {
    const result: ArtifactTabId[] = Object.entries(resultTabs).filter(([, selection]) => selection.runId === run.id).map(([tabId]) => tabId as ResultTabId);
    if (artifact != null) result.push("json", "markdown");
    if (artifact != null && artifactSet === "xhs-notes") result.push("image");
    return result;
  }, [artifact, artifactSet, resultTabs, run.id]);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  useEffect(() => {
    if (selectedResult == null) return;
    const tabId = resultTabId(selectedResult);
    setResultTabs((current) => ({ ...current, [tabId]: selectedResult }));
    setTabStateByRun((current) => {
      const currentRun = current[run.id] ?? initialRunTabState(defaultTab);
      return { ...current, [run.id]: { openTabIds: currentRun.openTabIds.includes(tabId) ? currentRun.openTabIds : [...currentRun.openTabIds, tabId], activeTabId: tabId } };
    });
  }, [defaultTab, requestKey, run.id, selectedResult]);

  function closeTab(tabId: ArtifactTabId) {
    setTabStateByRun((current) => {
      const currentRun = current[run.id] ?? initialRunTabState(defaultTab);
      const index = currentRun.openTabIds.indexOf(tabId);
      const nextTabs = currentRun.openTabIds.filter((id) => id !== tabId);
      return { ...current, [run.id]: { openTabIds: nextTabs, activeTabId: currentRun.activeTabId === tabId ? nextTabs[Math.min(index, nextTabs.length - 1)] ?? null : currentRun.activeTabId } };
    });
  }

  function openTab(tabId: ArtifactTabId) {
    setTabStateByRun((current) => {
      const currentRun = current[run.id] ?? initialRunTabState(defaultTab);
      return { ...current, [run.id]: { openTabIds: currentRun.openTabIds.includes(tabId) ? currentRun.openTabIds : [...currentRun.openTabIds, tabId], activeTabId: tabId } };
    });
    setAddMenuOpen(false);
  }

  const closedTabIds = availableTabIds.filter((id) => !tabState.openTabIds.includes(id));

  return (
    <aside className="prototype-artifact-panel codex-scrollbar" aria-label="任务文件预览">
      <div className="panel-tabs prototype-controlled-tabs">
        <div className="panel-tab-strip">
          <div className="panel-tab-scroll"><div className="panel-tab-list" role="tablist" aria-label="任务文件预览">{tabState.openTabIds.map((tabId) => <div className={`prototype-closable-tab ${tabState.activeTabId === tabId ? "active" : ""}`} key={tabId}><button className="panel-tab-trigger" type="button" role="tab" aria-selected={tabState.activeTabId === tabId} onClick={() => setTabStateByRun((current) => ({ ...current, [run.id]: { ...tabState, activeTabId: tabId } }))}><span className="panel-tab-label">{tabLabel(tabId, resultTabs)}</span></button><button className="prototype-tab-close" type="button" aria-label={`关闭 ${tabLabel(tabId, resultTabs)}`} title="关闭" onClick={() => closeTab(tabId)}><X size={12} /></button></div>)}</div></div>
          <div className="prototype-tab-add-wrap"><button className="prototype-tab-add" type="button" aria-label="打开文件" title="打开文件" disabled={closedTabIds.length === 0} onClick={() => setAddMenuOpen((open) => !open)}><Plus size={14} /></button>{addMenuOpen ? <div className="prototype-tab-add-menu">{closedTabIds.map((tabId) => <button type="button" key={tabId} onClick={() => openTab(tabId)}>{tabLabel(tabId, resultTabs)}</button>)}</div> : null}</div>
        </div>
        <div className="panel-tab-content">{tabState.activeTabId == null ? state === "pending" ? <ArtifactPending /> : availableTabIds.length > 0 ? <ArtifactTabsClosed /> : <ArtifactEmpty /> : renderTab(tabState.activeTabId, artifact, artifactSet, resultTabs, run, state, task)}</div>
      </div>
    </aside>
  );
}

function initialRunTabState(defaultTab: FileTabId | null): RunTabState {
  return { openTabIds: defaultTab == null ? [] : [defaultTab], activeTabId: defaultTab };
}

function resultTabId(result: PrototypeResultSelection): ResultTabId {
  return `result:${result.runId}:${result.kind}:${result.row[0]}`;
}

function isResultTabId(tabId: ArtifactTabId): tabId is ResultTabId {
  return tabId.startsWith("result:");
}

function tabLabel(tabId: ArtifactTabId, resultTabs: Record<ResultTabId, PrototypeResultSelection>) {
  if (!isResultTabId(tabId)) return artifactTabLabels[tabId];
  const result = resultTabs[tabId];
  return result == null ? "结果详情" : `${result.kind === "product" ? "商品" : "笔记"} · ${result.row[0]}`;
}

function renderTab(tabId: ArtifactTabId, artifact: ReturnType<typeof createArtifact> | null, artifactSet: ArtifactSet | undefined, resultTabs: Record<ResultTabId, PrototypeResultSelection>, run: PrototypeRun, state: "ready" | "pending" | "none", task: PrototypeTask) {
  if (isResultTabId(tabId)) return resultTabs[tabId] == null ? <ArtifactEmpty /> : <ResultItemPreview result={resultTabs[tabId]} />;
  if (artifact == null) return state === "pending" ? <ArtifactPending /> : <ArtifactEmpty />;
  if (tabId === "json") return <FilePreview icon={<Braces size={16} />} name="result.json" meta={artifact.jsonMeta}><pre>{JSON.stringify(artifact.payload, null, 2)}</pre></FilePreview>;
  if (tabId === "markdown") return <FilePreview icon={<FileText size={16} />} name="summary.md" meta="Markdown"><ArtifactMarkdown run={run} task={task} set={artifactSet} /></FilePreview>;
  return <FilePreview icon={<ImageIcon size={16} />} name="page.png" meta="PNG · 1280 × 800"><img className="artifact-image-preview" src={samplePagePreview} alt="小红书采集任务页面截图样例" /></FilePreview>;
}

function ResultItemPreview({ result }: { result: PrototypeResultSelection }) {
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

function ArtifactEmpty() {
  return <div className="artifact-empty"><ImageIcon size={20} /><strong>没有可预览文件</strong><span>当前运行尚未返回文件。</span></div>;
}

function ArtifactTabsClosed() {
  return <div className="artifact-empty"><FileText size={20} /><strong>没有打开的文件</strong><span>点击上方“+”打开当前运行的文件。</span></div>;
}

function FilePreview({ children, icon, meta, name }: { children: ReactNode; icon: ReactNode; meta: string; name: string }) {
  return <section className="artifact-file-preview"><header>{icon}<div><strong>{name}</strong><span>{meta}</span></div></header><div className="artifact-preview-body">{children}</div></section>;
}
