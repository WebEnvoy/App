import { Braces, FileText, Image as ImageIcon, LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";

import samplePagePreview from "../../../artifacts/app-208-real-read-task.png";
import { PanelTabs } from "../shellPrimitives";
import { productRows, resultRows, type ArtifactSet, type PrototypeTask } from "./prototypeData";

const downloadFiles = [
  { name: "新品发布会-主片.mp4", size: "126 MB", state: "已保存" },
  { name: "产品特写-竖版.mp4", size: "84 MB", state: "已保存" },
  { name: "用户访谈-片段.mp4", size: "42 MB", state: "已保存" },
  { name: "幕后花絮.mp4", size: null, state: "来源已失效" },
];

export function PrototypeArtifactPanel({ task }: { task: PrototypeTask }) {
  const state = task.artifactState ?? (task.artifactSet == null ? "none" : "ready");
  const artifact = state === "ready" && task.artifactSet != null ? createArtifact(task, task.artifactSet) : null;
  const unavailable = state === "pending" ? <ArtifactPending /> : <ArtifactEmpty />;

  return (
    <aside className="prototype-artifact-panel codex-scrollbar" aria-label="任务文件预览">
      <PanelTabs
        ariaLabel="任务文件预览"
        defaultValue={task.artifactSet === "article" ? "markdown" : "json"}
        tabs={[
          { id: "json", label: "result.json", content: artifact == null ? unavailable : <FilePreview icon={<Braces size={16} />} name="result.json" meta={artifact.jsonMeta}><pre>{JSON.stringify(artifact.payload, null, 2)}</pre></FilePreview> },
          { id: "markdown", label: "summary.md", content: artifact == null ? unavailable : <FilePreview icon={<FileText size={16} />} name="summary.md" meta="Markdown"><ArtifactMarkdown task={task} set={task.artifactSet} /></FilePreview> },
          { id: "image", label: "page.png", content: artifact == null ? unavailable : task.artifactSet === "xhs-notes" ? <FilePreview icon={<ImageIcon size={16} />} name="page.png" meta="PNG · 1280 × 800"><img className="artifact-image-preview" src={samplePagePreview} alt="小红书采集任务页面截图样例" /></FilePreview> : <ArtifactEmpty /> },
        ]}
      />
    </aside>
  );
}

function createArtifact(task: PrototypeTask, set: ArtifactSet) {
  if (set === "xhs-notes") {
    const items = resultRows.map(([title, author, interactions, readAt]) => ({ title, author, interactions, readAt }));
    const total = task.artifactTotal ?? items.length;
    return { jsonMeta: `JSON · ${items.length}/${total} 条预览`, payload: { task: task.title, status: task.stateLabel, total, preview: items } };
  }
  if (set === "shop-products") {
    const items = productRows.map(([title, price, stock, readAt]) => ({ title, price, stock, readAt }));
    const current = task.artifactCurrent ?? items.length;
    return { jsonMeta: `JSON · ${items.length}/${current} 条预览`, payload: { task: task.title, status: task.stateLabel, current, expected: task.artifactTotal, preview: items } };
  }
  if (set === "article") {
    return { jsonMeta: "JSON · 文章摘要", payload: { task: task.title, title: "我们如何把重复的网站工作变成可复用任务", author: "WebEnvoy 产品团队", publishedAt: "2026-07-14" } };
  }
  if (set === "download-files") {
    return { jsonMeta: `JSON · ${downloadFiles.length} 个文件`, payload: { task: task.title, files: downloadFiles } };
  }
  return { jsonMeta: "JSON · 未提交", payload: { task: task.title, submitted: false, title: "三个让我每天省下两小时的 AI 工具", topics: ["AI工具", "效率提升", "内容创作", "工作流"] } };
}

function ArtifactMarkdown({ set, task }: { set: ArtifactSet | undefined; task: PrototypeTask }) {
  return (
    <article className="markdown-preview">
      <h1>{task.title}</h1>
      <p>{task.summary}</p>
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
  return <div className="artifact-empty"><ImageIcon size={20} /><strong>没有可预览文件</strong><span>当前任务或当前 Run 尚未返回此类文件。</span></div>;
}

function FilePreview({ children, icon, meta, name }: { children: ReactNode; icon: ReactNode; meta: string; name: string }) {
  return <section className="artifact-file-preview"><header>{icon}<div><strong>{name}</strong><span>{meta}</span></div></header><div className="artifact-preview-body">{children}</div></section>;
}
