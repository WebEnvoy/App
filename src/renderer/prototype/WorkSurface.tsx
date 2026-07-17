import {
  ArrowUpRight,
  Check,
  CheckCircle2,
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
  identityCanUseSkill,
  productRows,
  resultRows,
  skills,
  type AuthorizationPolicy,
  type Identity,
  type PrototypeRun,
  type PrototypePreviewSelection,
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
  onCreateIdentity,
  onCreateTask,
  onOpenPreview,
  onOpenBrowser,
  onOpenLibrary,
  onTakeoverCompleted,
  onSelectSkill,
}: {
  globalPolicy: Exclude<AuthorizationPolicy, "inherit">;
  identities: Identity[];
  mode: "detail" | "create";
  preferredIdentityId: string;
  selectedSkill: Skill;
  skillPolicy: AuthorizationPolicy;
  task: PrototypeTask;
  onCreateIdentity: () => void;
  onCreateTask: (task: PrototypeTask) => void;
  onOpenPreview: (selection: PrototypePreviewSelection) => void;
  onOpenBrowser: () => void;
  onOpenLibrary: () => void;
  onTakeoverCompleted: () => void;
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

  return (
    <TaskDetail
      identities={identities}
      task={task}
      onOpenBrowser={onOpenBrowser}
      onOpenPreview={onOpenPreview}
      onTakeoverCompleted={onTakeoverCompleted}
    />
  );
}

function TaskDetail({
  identities,
  task,
  onOpenBrowser,
  onOpenPreview,
  onTakeoverCompleted,
}: {
  identities: Identity[];
  task: PrototypeTask;
  onOpenBrowser: () => void;
  onOpenPreview: (selection: PrototypePreviewSelection) => void;
  onTakeoverCompleted: () => void;
}) {
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [takeoverStep, setTakeoverStep] = useState<"idle" | "opened" | "validating">("idle");
  const identity = identities.find((item) => item.id === task.identityId);
  const identityLabel = identity?.account ?? task.identity;
  const storedRuns = task.runs ?? [{ id: "run-current", label: task.title, input: task.title, state: task.state, stateLabel: task.stateLabel, summary: task.summary, artifactSet: task.artifactSet, artifactState: task.artifactState, artifactTotal: task.artifactTotal, artifactCurrent: task.artifactCurrent }];
  const taskResumed = task.kind === "takeover" && task.state === "running";
  const runs = taskResumed ? storedRuns.map((run, index) => index === storedRuns.length - 1 ? { ...run, state: "running" as const, stateLabel: "正在继续", summary: "登录状态校验成功，任务已恢复执行。" } : run) : storedRuns;

  useEffect(() => setTakeoverStep("idle"), [task.id]);

  useEffect(() => {
    if (takeoverStep !== "validating") return;
    const timer = window.setTimeout(onTakeoverCompleted, 900);
    return () => window.clearTimeout(timer);
  }, [onTakeoverCompleted, takeoverStep]);

  return (
    <div className="prototype-page task-detail-page">
      <div className="prototype-task-thread-layout">
        <PrototypeRunRail runs={runs} taskId={task.id} />
        <div className="prototype-task-thread-content">
          <div className="task-turn-timeline">
            {runs.map((run, index) => <TaskTurn key={`${task.id}-${run.id}`} run={run} task={task} latest={index === runs.length - 1} taskResumed={taskResumed} takeoverStep={takeoverStep} onOpenBrowser={onOpenBrowser} onOpenPreview={onOpenPreview} onTakeoverStepChange={setTakeoverStep} />)}
          </div>

          <section className={`task-source-strip ${task.authorization != null ? "with-authorization" : ""}`} data-content-search-unit-key={`${task.id}-sources`}><div><span>账号身份</span><strong>{identityLabel}</strong></div><div><span>站点技能</span><strong>{task.skill}</strong></div><div><span>创建来源</span><strong>{task.source}</strong></div><div><span>更新时间</span><strong>{task.updatedAt}</strong></div>{task.authorization != null ? <div><span>任务授权</span><strong>{task.authorization}</strong></div> : null}</section>

          <section className="prototype-disclosure" data-content-search-unit-key={`${task.id}-diagnostics`}><button type="button" onClick={() => setDiagnosticsOpen((open) => !open)}><ChevronDown size={15} className={diagnosticsOpen ? "rotated" : ""} />运行详情与诊断<span>仅在排查问题时查看</span></button>{diagnosticsOpen ? <div className="diagnostic-detail"><p><strong>最近阶段</strong> 页面读取与结果标准化</p><p><strong>来源摘要</strong> 目标页面在 {task.updatedAt} 完成确认</p><p><strong>内部记录</strong> 已保留，可从诊断导出；默认不占用业务结果区域。</p></div> : null}</section>
        </div>
      </div>
    </div>
  );
}

function TaskTurn({ run, task, latest, taskResumed, takeoverStep, onOpenBrowser, onOpenPreview, onTakeoverStepChange }: { run: PrototypeRun; task: PrototypeTask; latest: boolean; taskResumed: boolean; takeoverStep: "idle" | "opened" | "validating"; onOpenBrowser: () => void; onOpenPreview: (selection: PrototypePreviewSelection) => void; onTakeoverStepChange: (step: "idle" | "opened" | "validating") => void }) {
  const waiting = latest && task.kind === "takeover" && task.state === "waiting";
  const resumed = latest && taskResumed;
  const newlyCreated = latest && !resumed && run.state === "running" && run.artifactState === "pending";
  const progressSummary = run.state === "running" || run.state === "waiting";
  const actions = taskExecutionActions(task, run, { newlyCreated, resumed, waiting });
  const summaryCopy = taskSummaryCopy(run, { newlyCreated, resumed, waiting });
  const previewTab = run.artifactSet === "article" ? "markdown" : run.artifactSet === "download-files" ? "media" : "json";
  const executionState = run.state === "running" ? "running" : run.state === "waiting" ? "waiting" : "complete";
  const executionLabel = executionState === "running" ? "正在执行" : executionState === "waiting" ? "等待处理" : "已处理";

  return (
    <article className="task-turn-detail" data-content-search-unit-key={`${task.id}-${run.id}`}>
      <TaskInputCard task={task} run={run} />
      <section className="task-progress-block" aria-label={`${run.label}执行记录`}>
        <details className="task-execution-disclosure">
          <summary><span className={`task-execution-status ${executionState}`}><ChevronDown size={14} /><strong>{executionLabel}</strong><small>{executionState === "complete" ? run.duration ?? "耗时未知" : executionState === "running" ? `${actions.length} 个动作` : "需要人工处理"}</small></span></summary>
          <ol>{actions.map((action, index) => <li key={`${action.label}-${index}`}><span className={`task-action-marker ${action.state}`} aria-hidden="true">{action.state === "running" ? <LoaderCircle size={12} /> : action.state === "success" ? <Check size={12} /> : <CircleAlert size={12} />}</span><div><strong>{action.label}</strong><p>{action.detail}</p></div></li>)}</ol>
        </details>
        {waiting ? <section className="prototype-callout action-needed"><CircleAlert size={18} /><div><strong>需要你完成登录</strong><p>{takeoverStep === "idle" ? "任务已暂停。打开对应账号的浏览器，登录后返回这里确认。" : takeoverStep === "opened" ? "浏览器已拉起；完成登录后点击“我已完成”。" : "正在校验登录与页面状态，成功后会继续当前回合。"}</p></div>{takeoverStep === "idle" ? <button className="prototype-button primary" type="button" onClick={() => { onOpenBrowser(); onTakeoverStepChange("opened"); }}>打开浏览器</button> : takeoverStep === "opened" ? <button className="prototype-button primary" type="button" onClick={() => onTakeoverStepChange("validating")}><Check size={14} />我已完成</button> : <button className="prototype-button" type="button" disabled><LoaderCircle size={14} />正在校验</button>}</section> : null}
      </section>
      <section className="task-summary-block" aria-label={`${run.label}${progressSummary ? "进度" : "结果"}`}>
        <header><div className={`task-summary-heading ${run.state}`}><span className="task-summary-state-icon" aria-hidden="true">{run.state === "success" || run.state === "not-submitted" ? <CheckCircle2 size={17} /> : run.state === "running" ? <LoaderCircle size={17} /> : <CircleAlert size={17} />}</span><h2>{summaryCopy}</h2></div>{run.artifactState !== "none" ? <button className="task-preview-button" type="button" aria-label={`在右侧打开${run.label}结果`} title="在右侧打开结果" onClick={() => onOpenPreview({ kind: "file", runId: run.id, tab: previewTab })}><ArrowUpRight size={15} /></button> : null}</header>
        {newlyCreated ? <div className="task-progress-snapshot"><div className="prototype-progress"><span style={{ width: "16%" }} /></div><span>准备中</span></div> : null}
        {!newlyCreated && task.kind === "collection" ? <CollectionResult run={run} task={task} onOpenPreview={onOpenPreview} /> : null}
        {!newlyCreated && task.kind === "article" ? <ArticleResult /> : null}
        {!newlyCreated && task.kind === "download" ? <DownloadResult /> : null}
        {!newlyCreated && task.kind === "write" ? <WriteResult /> : null}
        {resumed ? <div className="task-progress-snapshot"><div className="prototype-progress"><span style={{ width: "22%" }} /></div><span>已读取 3 / 18</span></div> : null}
      </section>
    </article>
  );
}

function TaskInputCard({ task, run }: { task: PrototypeTask; run: PrototypeRun }) {
  const fields = taskInputFields(task, run);
  return (
    <section className={`task-input-card ${task.kind}`} aria-label={`${task.skill}输入`}>
      <div className="task-input-kind"><span>{task.skill}</span></div>
      <dl>{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    </section>
  );
}

function taskInputFields(task: PrototypeTask, run: PrototypeRun): Array<[string, string]> {
  if (task.kind === "collection" && task.site === "淘宝") return [["时间范围", run.input], ["采集字段", "标题、价格、库存"]];
  if (task.kind === "collection") return [["关键词", run.input], ["数量", `${run.artifactTotal ?? task.artifactTotal ?? 0} 条`]];
  if (task.kind === "article") return [["文章", run.input], ["来源", targetUrl(task.site, task.kind)]];
  if (task.kind === "download") return [["素材链接", run.input], ["保存方式", "下载到本机"]];
  if (task.kind === "write") return [["草稿", run.input], ["提交方式", "仅填写，不发布"]];
  return [["目标收藏夹", run.input], ["账号身份", task.identity]];
}

type TaskExecutionAction = { label: string; detail: string; state: "success" | "running" | "waiting" | "failed" };

function taskExecutionActions(task: PrototypeTask, run: PrototypeRun, state: { newlyCreated: boolean; resumed: boolean; waiting: boolean }): TaskExecutionAction[] {
  const finalState = state.waiting || run.state === "not-submitted" ? "waiting" : run.state === "running" ? "running" : run.state === "partial" || run.state === "failed" ? "failed" : "success";
  const commonStart: TaskExecutionAction[] = [{ label: "打开目标页面", detail: targetUrl(task.site, task.kind), state: "success" }];
  if (state.newlyCreated) return [{ label: "准备账号环境", detail: `正在启动“${task.identity}”的浏览器环境。`, state: "running" }];
  if (task.kind === "takeover") return [...commonStart, { label: "检查账号登录状态", detail: state.resumed ? "登录校验已通过，继续读取收藏夹。" : "登录状态已过期，任务已暂停。", state: finalState }];
  if (task.kind === "download") return [...commonStart, { label: "解析文件地址", detail: "识别 4 个公开视频文件。", state: "success" }, { label: "下载文件", detail: "3 个文件已保存，1 个来源失效。", state: finalState }];
  if (task.kind === "write") return [...commonStart, { label: "填写标题与正文", detail: run.input, state: "success" }, { label: "添加话题与图片", detail: "页面内容已完成填写。", state: "success" }, { label: "停在提交前", detail: "校验通过，尚未点击发布。", state: finalState }];
  if (task.kind === "article") return [...commonStart, { label: "等待文章加载", detail: "正文与图片区域已加载。", state: "success" }, { label: "读取页面内容", detail: "正文、作者信息和图片已整理。", state: finalState }];
  const submitAction = task.site === "淘宝" ? { label: "点击“上新商品”筛选", detail: "等待商品列表刷新。", state: "success" as const } : { label: "点击“搜索”按钮", detail: `提交“${task.skill}”操作。`, state: "success" as const };
  return [...commonStart, { label: "填写业务输入", detail: run.input, state: "success" }, submitAction, { label: "向下滚动一屏", detail: "加载更多页面结果。", state: "success" }, { label: "读取并整理结果", detail: run.artifactCurrent != null && run.artifactTotal != null ? `已返回 ${run.artifactCurrent}/${run.artifactTotal} 条。` : run.summary, state: finalState }];
}

function targetUrl(site: string, kind: PrototypeTask["kind"]) {
  if (site === "小红书") return kind === "write" ? "https://creator.xiaohongshu.com/publish/publish" : "https://www.xiaohongshu.com/explore";
  if (site === "淘宝") return "https://www.taobao.com/";
  if (site === "微信公众号") return "https://mp.weixin.qq.com/s/example";
  if (site === "抖音") return "https://www.douyin.com/";
  return `https://${site}/`;
}

function taskSummaryCopy(run: PrototypeRun, state: { newlyCreated: boolean; resumed: boolean; waiting: boolean }) {
  if (state.waiting) return "正在等待登录恢复；完成登录并通过校验后会自动继续。";
  if (state.resumed) return "登录校验已通过，任务已恢复执行。";
  if (state.newlyCreated) return "任务已经开始；业务结果就绪后会显示在这里。";
  if (run.state === "running" && run.artifactCurrent != null && run.artifactTotal != null) return `已返回 ${run.artifactCurrent}/${run.artifactTotal} 条结果，任务仍在继续。`;
  if (run.state === "partial") return "已保存 3/4 个文件；未完成项保留在结果中，可单独重试。";
  if (run.state === "not-submitted") return "内容已准备完成但尚未发布，当前状态保持为未提交。";
  return run.summary;
}

function PrototypeRunRail({ runs, taskId }: { runs: PrototypeRun[]; taskId: string }) {
  return (
    <nav className="thread-navigation-rail prototype-run-rail" aria-label="当前任务线程回合导航">
      <div className="thread-navigation-rail-list">
        <div className="thread-navigation-rail-rows">
          {runs.map((run) => (
            <button
              className="thread-navigation-row"
              type="button"
              aria-label={`跳转到回合：${run.input}`}
              title={`${run.label} · ${run.input}`}
              key={run.id}
              onClick={() => document.querySelector(`[data-content-search-unit-key="${taskId}-${run.id}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
            >
              <span className="thread-navigation-marker-frame"><span className="thread-navigation-marker" /></span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

function CollectionResult({ run, task, onOpenPreview }: { run: PrototypeRun; task: PrototypeTask; onOpenPreview: (selection: PrototypePreviewSelection) => void }) {
  const [visibleCount, setVisibleCount] = useState(5);
  const running = run.state === "running";
  const isProductCollection = task.site === "淘宝";
  const rows = isProductCollection ? productRows : resultRows;
  const total = running ? run.artifactCurrent ?? rows.length : run.artifactTotal ?? rows.length;
  const availableRows = rows.slice(0, Math.min(total, rows.length));
  const visibleRows = availableRows.slice(0, visibleCount);
  const nextCount = Math.min(5, availableRows.length - visibleRows.length);

  return (
    <section className="prototype-section result-section">
      <div className="prototype-section-title">
        <div>
          <h2>采集结果</h2>
        </div>
        <div className="section-actions"><button className="prototype-button" type="button"><ListFilter size={14} />筛选</button><button className="prototype-button" type="button">导出</button></div>
      </div>
      {running ? <div className="prototype-progress"><span style={{ width: "45%" }} /></div> : null}
      <div className="prototype-table-wrap">
        <table className="prototype-table">
          <thead><tr>{(isProductCollection ? ["商品", "价格", "库存", "读取时间"] : ["笔记标题", "作者", "互动", "读取时间"]).map((heading) => <th key={heading}>{heading}</th>)}<th aria-label="操作" /></tr></thead>
          <tbody>{visibleRows.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}<td><button type="button" aria-label={`在右侧预览 ${row[0]}`} title="在右侧预览" onClick={() => onOpenPreview({ kind: isProductCollection ? "product" : "note", row, runId: run.id })}><ArrowUpRight size={14} /></button></td></tr>)}</tbody>
        </table>
      </div>
      <footer className="result-table-footer"><span>共 {total} 条数据</span>{nextCount > 0 ? <button className="prototype-button compact" type="button" onClick={() => setVisibleCount((count) => count + nextCount)}>再展示 {nextCount} 条</button> : null}</footer>
    </section>
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
    ["新品发布会-封面.png", "8 MB", "已保存"],
    ["产品讲解-音轨.mp3", "42 MB", "已保存"],
    ["活动素材-源文件.zip", "—", "来源已失效"],
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
  const compatibleIdentities = identities.filter((identity) => identityCanUseSkill(identity, selectedSkill));
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
      identity: identity.account,
      identityId: identity.id,
      source: "App",
      state: "running",
      stateLabel: "正在运行",
      updatedAt: "刚刚",
      summary: `已使用“${businessInput}”创建任务，结果会在此页面持续更新。`,
      kind,
      authorization: authorizationPolicyLabels[resolvedPolicy],
      runs: [{ id: "run-01", label: "本回合", input: businessInput, state: "running", stateLabel: "正在运行", summary: `正在使用“${identity.account}”执行“${selectedSkill.name}”。`, artifactSet: kind === "article" ? "article" : kind === "download" ? "download-files" : kind === "write" ? "write-preview" : selectedSkill.site === "淘宝" ? "shop-products" : "xhs-notes", artifactState: "pending" }],
      artifactSet: kind === "article" ? "article" : kind === "download" ? "download-files" : kind === "write" ? "write-preview" : selectedSkill.site === "淘宝" ? "shop-products" : "xhs-notes",
      artifactState: "pending",
    });
  }

  return (
    <div className="prototype-page create-task-page">
      <header className="prototype-page-heading"><div><div className="prototype-eyebrow">任务</div><h1>创建任务</h1><p>任务输入由站点技能定义，不使用开放式指令。</p></div></header>
      <div className="create-task-layout">
        <form className="prototype-form" onSubmit={submitTask}>
          <fieldset><legend>1. 选择站点技能</legend><label>站点技能<select value={selectedSkill.id} onChange={(event) => onSelectSkill(event.target.value)}>{skills.filter((skill) => skill.availability === "available").map((skill) => <option key={skill.id} value={skill.id}>{skill.site} · {skill.name}</option>)}</select></label><button className="inline-link" type="button" onClick={onOpenLibrary}>浏览全部站点技能</button></fieldset>
          <fieldset><legend>2. 选择账号身份</legend>{compatibleIdentities.length > 0 ? <label>账号身份<select value={identityId} onChange={(event) => setIdentityId(event.target.value)}>{compatibleIdentities.map((identity) => <option key={identity.id} value={identity.id}>{identity.account} · {identity.platformId ?? identity.name} · {identity.stateLabel}</option>)}</select></label> : <div className="empty-inline"><CircleAlert size={16} /><span>没有兼容的账号身份</span><button type="button" onClick={onCreateIdentity}>创建账号身份</button></div>}</fieldset>
          <fieldset><legend>3. 填写业务输入</legend><label>{selectedSkill.inputLabel}<input required value={businessInput} placeholder={selectedSkill.inputPlaceholder} onChange={(event) => setBusinessInput(event.target.value)} /></label>{selectedSkill.id === "xhs-search" ? <div className="inline-form-grid"><label>结果数量<select defaultValue="20"><option>20</option><option>50</option><option>100</option></select></label><label>排序<select defaultValue="综合"><option>综合</option><option>最新</option><option>最多点赞</option></select></label></div> : null}</fieldset>
          <fieldset><legend>4. 检查并创建</legend><div className="task-review-row"><span>预期结果</span><strong>{selectedSkill.output}</strong></div><label>本任务授权<select value={taskPolicy} onChange={(event) => setTaskPolicy(event.target.value as AuthorizationPolicy)}><option value="inherit">继承技能设置（{authorizationPolicyLabels[inheritedPolicy]}）</option><option value="full">完全访问</option><option value="ask">写入批准</option><option value="read">只读</option><option value="strict">每一步都要批准</option></select></label><p className="muted-copy">只影响这个任务；需要单次确认的动作会在执行时询问。</p><button className="prototype-button primary create-submit" type="submit" disabled={businessInput.trim() === "" || compatibleIdentities.length === 0}><Play size={14} />创建并运行</button></fieldset>
        </form>
        <aside className="create-task-summary"><div className="skill-mark"><Download size={18} /></div><h2>{selectedSkill.name}</h2><p>{selectedSkill.description}</p><dl><div><dt>站点</dt><dd>{selectedSkill.site}</dd></div><div><dt>业务输入</dt><dd>{selectedSkill.inputLabel}</dd></div><div><dt>结果</dt><dd>{selectedSkill.output}</dd></div></dl></aside>
      </div>
    </div>
  );
}
