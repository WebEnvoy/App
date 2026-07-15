import {
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleAlert,
  Download,
  ExternalLink,
  FileText,
  FolderOpen,
  ListFilter,
  LoaderCircle,
  Play,
  ShieldCheck,
  Square,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import {
  authorizationPolicyLabels,
  resultRows,
  skills,
  type AuthorizationPolicy,
  type Identity,
  type PrototypeTask,
  type Skill,
} from "./prototypeData";

export function WorkSurface({
  globalPolicy,
  identities,
  mode,
  preferredIdentityId,
  selectedSkill,
  skillPolicy,
  task,
  takeoverCompleted,
  onCreateIdentity,
  onCreateTask,
  onOpenBrowser,
  onOpenLibrary,
  onSelectSkill,
}: {
  globalPolicy: Exclude<AuthorizationPolicy, "inherit">;
  identities: Identity[];
  mode: "detail" | "create";
  preferredIdentityId: string;
  selectedSkill: Skill;
  skillPolicy: AuthorizationPolicy;
  task: PrototypeTask;
  takeoverCompleted: boolean;
  onCreateIdentity: () => void;
  onCreateTask: (task: PrototypeTask) => void;
  onOpenBrowser: () => void;
  onOpenLibrary: () => void;
  onSelectSkill: (skillId: string) => void;
}) {
  if (mode === "create") {
    return (
      <CreateTaskSurface
        globalPolicy={globalPolicy}
        identities={identities}
        preferredIdentityId={preferredIdentityId}
        selectedSkill={selectedSkill}
        skillPolicy={skillPolicy}
        onCreateIdentity={onCreateIdentity}
        onCreateTask={onCreateTask}
        onOpenLibrary={onOpenLibrary}
        onSelectSkill={onSelectSkill}
      />
    );
  }

  return <TaskDetail task={task} takeoverCompleted={takeoverCompleted} onOpenBrowser={onOpenBrowser} />;
}

function TaskDetail({ task, takeoverCompleted, onOpenBrowser }: { task: PrototypeTask; takeoverCompleted: boolean; onOpenBrowser: () => void }) {
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const waiting = task.kind === "takeover" && !takeoverCompleted;
  const newlyCreated = task.id.startsWith("task-") && task.state === "running";

  return (
    <div className="prototype-page task-detail-page">
      <header className="prototype-page-heading task-heading">
        <div>
          <div className="prototype-eyebrow">{task.site} · {task.skill}</div>
          <h1>{task.title}</h1>
          <p>{task.summary}</p>
        </div>
        <span className={`prototype-state-chip ${waiting ? "waiting" : takeoverCompleted && task.kind === "takeover" ? "running" : task.state}`}>
          {takeoverCompleted && task.kind === "takeover" ? <LoaderCircle size={13} /> : task.state === "success" ? <Check size={13} /> : null}
          {takeoverCompleted && task.kind === "takeover" ? "已恢复 · 正在继续" : task.stateLabel}
        </span>
      </header>

      {waiting ? (
        <section className="prototype-callout action-needed">
          <CircleAlert size={18} />
          <div><strong>需要你完成登录</strong><p>任务已暂停。打开对应账号的浏览器，登录后由系统校验并继续原任务。</p></div>
          <button className="prototype-button primary" type="button" onClick={onOpenBrowser}>打开浏览器</button>
        </section>
      ) : null}

      {newlyCreated ? <NewTaskRunning task={task} /> : null}
      {!newlyCreated && task.kind === "collection" ? <CollectionResult task={task} /> : null}
      {!newlyCreated && task.kind === "article" ? <ArticleResult /> : null}
      {!newlyCreated && task.kind === "download" ? <DownloadResult /> : null}
      {!newlyCreated && task.kind === "write" ? <WriteResult /> : null}
      {task.kind === "takeover" && takeoverCompleted ? (
        <section className="prototype-section running-result">
          <div className="prototype-section-title"><div><h2>任务已继续</h2><p>登录状态校验成功，正在读取收藏夹内容。</p></div><span>3 / 18</span></div>
          <div className="prototype-progress"><span style={{ width: "22%" }} /></div>
        </section>
      ) : null}

      <section className={`task-source-strip ${task.authorization != null ? "with-authorization" : ""}`}>
        <div><span>账号身份</span><strong>{task.identity}</strong></div>
        <div><span>站点技能</span><strong>{task.skill}</strong></div>
        <div><span>创建来源</span><strong>{task.source}</strong></div>
        <div><span>更新时间</span><strong>{task.updatedAt}</strong></div>
        {task.authorization != null ? <div><span>任务授权</span><strong>{task.authorization}</strong></div> : null}
      </section>

      <section className="prototype-disclosure">
        <button type="button" onClick={() => setDiagnosticsOpen((open) => !open)}>
          <ChevronDown size={15} className={diagnosticsOpen ? "rotated" : ""} />
          运行详情与诊断
          <span>仅在排查问题时查看</span>
        </button>
        {diagnosticsOpen ? (
          <div className="diagnostic-detail">
            <p><strong>最近阶段</strong> 页面读取与结果标准化</p>
            <p><strong>来源摘要</strong> 目标页面在 {task.updatedAt} 完成确认</p>
            <p><strong>内部记录</strong> 已保留，可从诊断导出；默认不占用业务结果区域。</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function NewTaskRunning({ task }: { task: PrototypeTask }) {
  return (
    <section className="prototype-section running-result">
      <div className="prototype-section-title"><div><h2>任务已开始</h2><p>正在使用“{task.identity}”执行“{task.skill}”。首批结果就绪后会显示在这里。</p></div><span>准备中</span></div>
      <div className="prototype-progress"><span style={{ width: "16%" }} /></div>
    </section>
  );
}

function CollectionResult({ task }: { task: PrototypeTask }) {
  const running = task.state === "running";
  const [selectedRow, setSelectedRow] = useState<string[] | null>(null);

  if (selectedRow != null) {
    return <ResultItemDetail row={selectedRow} onBack={() => setSelectedRow(null)} />;
  }

  return (
    <section className="prototype-section result-section">
      <div className="prototype-section-title">
        <div><h2>{running ? "已读取的商品" : "采集结果"}</h2><p>{running ? "任务继续运行时，已完成的数据仍可查看。" : "12 条笔记 · 0 条失败 · 当前显示 5 条"}</p></div>
        <div className="section-actions"><button className="prototype-button" type="button"><ListFilter size={14} />筛选</button><button className="prototype-button" type="button">导出</button></div>
      </div>
      {running ? <div className="prototype-progress"><span style={{ width: "45%" }} /></div> : null}
      <div className="prototype-table-wrap">
        <table className="prototype-table">
          <thead><tr><th>笔记标题</th><th>作者</th><th>互动</th><th>读取时间</th><th aria-label="操作" /></tr></thead>
          <tbody>{resultRows.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}<td><button type="button" aria-label={`打开 ${row[0]}`} onClick={() => setSelectedRow(row)}><ArrowUpRight size={14} /></button></td></tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}

function ResultItemDetail({ row, onBack }: { row: string[]; onBack: () => void }) {
  return (
    <article className="prototype-section result-item-detail">
      <button className="inline-link" type="button" onClick={onBack}>返回采集结果</button>
      <div className="result-item-heading">
        <div><div className="prototype-eyebrow">采集结果 · 笔记</div><h2>{row[0]}</h2><p>{row[1]} · {row[3]}</p></div>
        <button className="prototype-button" type="button"><ExternalLink size={14} />打开来源页面</button>
      </div>
      <div className="result-item-body"><p>把资料交给 AI 之前，先明确最终要消费的业务结果。适合自动化的不是“打开网页”本身，而是可重复的搜索、阅读、整理和交付过程。</p><p>这篇笔记整理了五种常见方法，并对适用场景、输入要求和结果形式进行了对比。</p></div>
      <dl className="result-item-facts"><div><dt>点赞</dt><dd>{row[2]}</dd></div><div><dt>评论</dt><dd>126</dd></div><div><dt>收藏</dt><dd>943</dd></div><div><dt>话题</dt><dd>#AI工具 #效率提升</dd></div></dl>
    </article>
  );
}

function ArticleResult() {
  return (
    <article className="prototype-section article-result">
      <div className="article-kicker">产品周报 · 第 28 期</div>
      <h2>我们如何把重复的网站工作变成可复用任务</h2>
      <div className="article-byline">WebEnvoy 产品团队 · 2026 年 7 月 14 日</div>
      <p>本周我们重新梳理了账号身份、站点技能与任务之间的关系。用户无需理解运行时组件，只需要选择要完成的业务目标和对应账号。</p>
      <p>任务完成后，App 首先呈现可阅读的内容和可操作的结果。运行记录与诊断仍然保留，但只在需要追溯或排查时展开。</p>
      <button className="prototype-button" type="button"><ExternalLink size={14} />打开来源文章</button>
    </article>
  );
}

function DownloadResult() {
  const files = [
    ["新品发布会-主片.mp4", "126 MB", "已保存"],
    ["产品特写-竖版.mp4", "84 MB", "已保存"],
    ["用户访谈-片段.mp4", "42 MB", "已保存"],
    ["幕后花絮.mp4", "—", "来源已失效"],
  ];
  return (
    <section className="prototype-section">
      <div className="prototype-section-title"><div><h2>下载文件</h2><p>3 个已保存到“下载/WebEnvoy/活动素材”</p></div><button className="prototype-button" type="button"><FolderOpen size={14} />在访达中显示</button></div>
      <div className="file-result-list">{files.map(([name, size, state], index) => <div className="file-result-row" key={name}><FileText size={18} /><div><strong>{name}</strong><span>{size}</span></div><span className={index === 3 ? "failed" : "saved"}>{state}</span>{index === 3 ? <button className="prototype-button compact" type="button">重试</button> : <button type="button" aria-label={`打开 ${name}`}><ExternalLink size={14} /></button>}</div>)}</div>
    </section>
  );
}

function WriteResult() {
  return (
    <section className="prototype-section write-result">
      <div className="write-state"><Square size={16} /><div><strong>未提交</strong><span>页面内容已填写并通过校验，没有点击发布。</span></div></div>
      <div className="write-preview"><div><span>目标账号</span><strong>小红书运营号 A</strong></div><div><span>标题</span><strong>三个让我每天省下两小时的 AI 工具</strong></div><div><span>正文</span><p>最近把日常资料整理、内容归档和选题研究重新做了一遍……</p></div><div><span>话题</span><strong>#AI工具　#效率提升　#内容创作　#工作流</strong></div></div>
      <div className="write-actions"><button className="prototype-button" type="button">返回编辑</button><button className="prototype-button primary" type="button"><ShieldCheck size={14} />按当前策略继续</button></div>
    </section>
  );
}

function CreateTaskSurface({ globalPolicy, identities, preferredIdentityId, selectedSkill, skillPolicy, onCreateIdentity, onCreateTask, onOpenLibrary, onSelectSkill }: { globalPolicy: Exclude<AuthorizationPolicy, "inherit">; identities: Identity[]; preferredIdentityId: string; selectedSkill: Skill; skillPolicy: AuthorizationPolicy; onCreateIdentity: () => void; onCreateTask: (task: PrototypeTask) => void; onOpenLibrary: () => void; onSelectSkill: (skillId: string) => void }) {
  const [businessInput, setBusinessInput] = useState("");
  const [identityId, setIdentityId] = useState(preferredIdentityId);
  const [taskPolicy, setTaskPolicy] = useState<AuthorizationPolicy>("inherit");
  useEffect(() => setBusinessInput(""), [selectedSkill.id]);
  const compatibleIdentities = identities.filter((identity) => identity.site === selectedSkill.site && (identity.state === "available" || identity.state === "running"));
  const inheritedPolicy = skillPolicy === "inherit" ? globalPolicy : skillPolicy;
  const resolvedPolicy = taskPolicy === "inherit" ? inheritedPolicy : taskPolicy;
  useEffect(() => {
    const preferredIsCompatible = compatibleIdentities.some((identity) => identity.id === preferredIdentityId);
    setIdentityId(preferredIsCompatible ? preferredIdentityId : compatibleIdentities[0]?.id ?? "");
  }, [preferredIdentityId, selectedSkill.id]);

  function submitTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const identity = compatibleIdentities.find((item) => item.id === identityId);
    if (identity == null) return;
    const kind = selectedSkill.id === "wechat-read" ? "article" : selectedSkill.tags.includes("内容发布") ? "write" : selectedSkill.tags.includes("内容下载") ? "download" : "collection";
    onCreateTask({
      id: `task-${Date.now()}`,
      title: `${selectedSkill.name} · ${businessInput}`,
      skill: selectedSkill.name,
      site: selectedSkill.site,
      identity: identity.name,
      identityId: identity.id,
      source: "App",
      state: "running",
      stateLabel: "正在运行",
      updatedAt: "刚刚",
      summary: `已使用“${businessInput}”创建任务，结果会在此页面持续更新。`,
      kind,
      authorization: authorizationPolicyLabels[resolvedPolicy],
    });
  }

  return (
    <div className="prototype-page create-task-page">
      <header className="prototype-page-heading"><div><div className="prototype-eyebrow">Work</div><h1>创建任务</h1><p>任务输入由站点技能定义，不使用开放式指令。</p></div></header>
      <div className="create-task-layout">
        <form className="prototype-form" onSubmit={submitTask}>
          <fieldset><legend>1. 选择站点技能</legend><label>站点技能<select value={selectedSkill.id} onChange={(event) => onSelectSkill(event.target.value)}>{skills.filter((skill) => skill.availability === "available").map((skill) => <option key={skill.id} value={skill.id}>{skill.site} · {skill.name}</option>)}</select></label><button className="inline-link" type="button" onClick={onOpenLibrary}>在 Library 中浏览全部技能</button></fieldset>
          <fieldset><legend>2. 选择账号身份</legend>{compatibleIdentities.length > 0 ? <label>账号身份<select value={identityId} onChange={(event) => setIdentityId(event.target.value)}>{compatibleIdentities.map((identity) => <option key={identity.id} value={identity.id}>{identity.name} · {identity.stateLabel}</option>)}</select></label> : <div className="empty-inline"><CircleAlert size={16} /><span>没有兼容的账号身份</span><button type="button" onClick={onCreateIdentity}>创建账号身份</button></div>}</fieldset>
          <fieldset><legend>3. 填写业务输入</legend><label>{selectedSkill.inputLabel}<input required value={businessInput} placeholder={selectedSkill.inputPlaceholder} onChange={(event) => setBusinessInput(event.target.value)} /></label>{selectedSkill.id === "xhs-search" ? <div className="inline-form-grid"><label>结果数量<select defaultValue="20"><option>20</option><option>50</option><option>100</option></select></label><label>排序<select defaultValue="综合"><option>综合</option><option>最新</option><option>最多点赞</option></select></label></div> : null}</fieldset>
          <fieldset><legend>4. 检查并创建</legend><div className="task-review-row"><span>预期结果</span><strong>{selectedSkill.output}</strong></div><label>本任务授权<select value={taskPolicy} onChange={(event) => setTaskPolicy(event.target.value as AuthorizationPolicy)}><option value="inherit">继承技能设置（{authorizationPolicyLabels[inheritedPolicy]}）</option><option value="read">自动允许本任务的只读动作</option><option value="ask">按需询问</option><option value="strict">每个外部动作前询问</option></select></label><p className="muted-copy">只影响这个任务；需要单次确认的动作会在执行时询问。</p><button className="prototype-button primary create-submit" type="submit" disabled={businessInput.trim() === "" || compatibleIdentities.length === 0}><Play size={14} />创建并运行</button></fieldset>
        </form>
        <aside className="create-task-summary"><div className="skill-mark"><Download size={18} /></div><h2>{selectedSkill.name}</h2><p>{selectedSkill.description}</p><dl><div><dt>站点</dt><dd>{selectedSkill.site}</dd></div><div><dt>业务输入</dt><dd>{selectedSkill.inputLabel}</dd></div><div><dt>结果</dt><dd>{selectedSkill.output}</dd></div></dl></aside>
      </div>
    </div>
  );
}
