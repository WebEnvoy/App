import * as Tabs from "@radix-ui/react-tabs";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Box,
  Braces,
  CircleDot,
  DatabaseZap,
  FolderKanban,
  Globe2,
  HardDrive,
  PanelRightOpen,
  Search,
  Settings,
  ShieldCheck,
  Waypoints,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import {
  defaultConnectionConfig,
  loadLocalConnectionConfig,
  saveLocalConnectionConfig,
  type LocalConnectionConfig,
} from "./localConnectionConfig";
import { sourceHealthFixture, taskThreadFixture, type SourceHealth } from "./sourceHealthFixture";

type ShellContext = {
  platform: string;
  colorScheme: "light" | "dark";
  configScope: "local-ui-only";
};

const taskTree = [
  {
    account: "运营账号 A",
    skills: [
      {
        name: "商品详情采集",
        tasks: ["采集商品详情页", "采集竞品价格"],
      },
      {
        name: "评论读取",
        tasks: ["读取最新评论"],
      },
    ],
  },
  {
    account: "本机 Chrome",
    skills: [
      {
        name: "页面采集",
        tasks: ["未登录页面详情"],
      },
    ],
  },
];

const contextTabs = [
  { id: "evidence", label: "结果依据" },
  { id: "session", label: "执行现场" },
  { id: "identity", label: "账号身份" },
  { id: "skill", label: "站点技能" },
  { id: "diagnostics", label: "诊断" },
];

function statusLabel(status: SourceHealth["status"]) {
  if (status === "ready") {
    return "ready";
  }

  if (status === "unavailable") {
    return "unavailable";
  }

  return "fixture";
}

export function App() {
  const [shellContext, setShellContext] = useState<ShellContext | null>(null);
  const [connectionConfig, setConnectionConfig] = useState<LocalConnectionConfig>(
    defaultConnectionConfig,
  );
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsError, setSettingsError] = useState("");

  useEffect(() => {
    let cancelled = false;

    setConnectionConfig(loadLocalConnectionConfig());

    window.webenvoyShell.getShellContext().then((context) => {
      if (!cancelled) {
        setShellContext(context);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  function updateEndpoint(field: keyof LocalConnectionConfig, value: string) {
    setSettingsSaved(false);
    setSettingsError("");
    setConnectionConfig((currentConfig) => ({ ...currentConfig, [field]: value }));
  }

  function saveSettings() {
    const validation = saveLocalConnectionConfig(connectionConfig);

    if (!validation.ok) {
      setSettingsSaved(false);
      setSettingsError(Object.values(validation.errors).join(" "));
      return;
    }

    setConnectionConfig(validation.config);
    setSettingsError("");
    setSettingsSaved(true);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Task Thread navigation">
        <div className="brand-lockup">
          <div className="brand-mark">WE</div>
          <div>
            <p className="eyebrow">WebEnvoy App</p>
            <h1>Task Thread</h1>
          </div>
        </div>

        <nav className="global-nav" aria-label="Global navigation">
          <a className="nav-item nav-item-active" href="#task-thread">
            <FolderKanban size={16} />
            任务
          </a>
          <a className="nav-item" href="#source-health">
            <DatabaseZap size={16} />
            Source health
          </a>
          <a className="nav-item" href="#settings">
            <Settings size={16} />
            Settings
          </a>
          <a className="nav-item" href="#search">
            <Search size={16} />
            Search
          </a>
        </nav>

        <section className="task-tree" aria-label="Tasks grouped by account identity">
          <div className="section-heading">
            <span>任务</span>
            <button type="button" aria-label="Create task is out of scope for GH-101">
              +
            </button>
          </div>

          {taskTree.map((account) => (
            <div className="tree-account" key={account.account}>
              <div className="tree-account-label">
                <HardDrive size={14} />
                {account.account}
              </div>
              {account.skills.map((skill) => (
                <div className="tree-skill" key={skill.name}>
                  <span>{skill.name}</span>
                  {skill.tasks.map((task) => (
                    <button
                      className={task === taskThreadFixture.title ? "tree-task selected" : "tree-task"}
                      type="button"
                      key={task}
                    >
                      <CircleDot size={12} />
                      {task}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </section>
      </aside>

      <section className="thread-column" id="task-thread" aria-labelledby="thread-title">
        <header className="thread-header">
          <div>
            <p className="eyebrow">GH-101 shell batch</p>
            <h2 id="thread-title">{taskThreadFixture.title}</h2>
            <div className="thread-meta">
              <span>{taskThreadFixture.accountIdentity}</span>
              <span>{taskThreadFixture.siteSkill}</span>
              <span>{taskThreadFixture.state}</span>
            </div>
          </div>
          <button className="panel-button" type="button">
            <PanelRightOpen size={16} />
            打开上下文
          </button>
        </header>

        <div className="thread-body">
          <div className="run-rail" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <div className="thread-content">
            <section className="report-card">
              <div className="card-title">
                <BadgeCheck size={18} />
                <h3>任务结束报告</h3>
              </div>
              <p>{taskThreadFixture.report}</p>
              <dl className="input-grid">
                <div>
                  <dt>业务输入</dt>
                  <dd>{taskThreadFixture.businessInput}</dd>
                </div>
                <div>
                  <dt>Run</dt>
                  <dd>{taskThreadFixture.runLabel}</dd>
                </div>
              </dl>
            </section>

            <section className="process-card">
              <div className="card-title">
                <Waypoints size={18} />
                <h3>执行过程</h3>
              </div>
              <ol>
                {taskThreadFixture.process.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </section>
          </div>
        </div>

        <footer className="thread-actions" aria-label="Task actions">
          <button type="button" disabled>
            修改输入
          </button>
          <button type="button" disabled>
            再次执行
          </button>
          <button type="button">查看结果依据</button>
          <button type="button">打开执行现场</button>
        </footer>
      </section>

      <aside className="context-panel" aria-label="Task context">
        <section className="source-health" id="source-health">
          <div className="section-heading">
            <span>Source health fixture</span>
            <span className="badge">no live calls</span>
          </div>
          {sourceHealthFixture.map((source) => (
            <article className="source-card" key={source.id}>
              <div>
                <strong>{source.name}</strong>
                <span>{source.ownerTruth}</span>
              </div>
              <p>{source.summary}</p>
              <div className={`status-pill status-${source.status}`}>{statusLabel(source.status)}</div>
            </article>
          ))}
        </section>

        <Tabs.Root className="context-tabs" defaultValue="evidence">
          <Tabs.List className="tab-list" aria-label="Task context tabs">
            {contextTabs.map((tab) => (
              <Tabs.Trigger className="tab-trigger" value={tab.id} key={tab.id}>
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Tabs.Content className="tab-panel" value="evidence">
            <ContextPanel
              icon={<Braces size={18} />}
              title="结果依据"
              body="GH-101 不展示真实 evidence。只有 Core task path 产生 result/evidence/failure 后，这里才显示 owner refs。"
            />
          </Tabs.Content>
          <Tabs.Content className="tab-panel" value="session">
            <ContextPanel
              icon={<Globe2 size={18} />}
              title="执行现场"
              body="direct Identity Runtime Session 属于 Browser/Harbor 管理路径，可由用户或 Agent/API/CLI/MCP 发起；它不是 Core task outcome。"
            />
          </Tabs.Content>
          <Tabs.Content className="tab-panel" value="identity">
            <ContextPanel
              icon={<ShieldCheck size={18} />}
              title="账号身份"
              body="只显示账号身份和环境入口，不保存 credential、cookie、token 或 profile storage。"
            />
          </Tabs.Content>
          <Tabs.Content className="tab-panel" value="skill">
            <ContextPanel
              icon={<Box size={18} />}
              title="站点技能"
              body="当前读取 capability package metadata fixture；workflow package 和 runtime/editor UI 不在 GH-101 范围。"
            />
          </Tabs.Content>
          <Tabs.Content className="tab-panel" value="diagnostics">
            <ContextPanel
              icon={<Activity size={18} />}
              title="诊断"
              body={`Shell context: ${shellContext?.platform ?? "loading"} / ${
                shellContext?.colorScheme ?? "loading"
              } / ${shellContext?.configScope ?? "loading"}`}
            />
          </Tabs.Content>
        </Tabs.Root>

        <section className="settings-panel" id="settings">
          <div className="card-title">
            <AlertTriangle size={18} />
            <h3>Settings local boundary</h3>
          </div>
          <p>仅保存本地 endpoint choice。不要输入 token、cookie、profile path 或 raw evidence。</p>
          <ConnectionInput
            label="Core endpoint"
            value={connectionConfig.coreEndpoint}
            onChange={(value) => updateEndpoint("coreEndpoint", value)}
          />
          <ConnectionInput
            label="Harbor endpoint"
            value={connectionConfig.harborEndpoint}
            onChange={(value) => updateEndpoint("harborEndpoint", value)}
          />
          <ConnectionInput
            label="Lode endpoint"
            value={connectionConfig.lodeEndpoint}
            onChange={(value) => updateEndpoint("lodeEndpoint", value)}
          />
          <button className="save-button" type="button" onClick={saveSettings}>
            保存本地配置
          </button>
          {settingsError ? <p className="settings-error" role="alert">{settingsError}</p> : null}
          <span className="settings-saved">{settingsSaved ? "Saved locally" : "Not saved"}</span>
        </section>
      </aside>
    </main>
  );
}

function ContextPanel({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="context-copy">
      <div className="card-title">
        {icon}
        <h3>{title}</h3>
      </div>
      <p>{body}</p>
    </div>
  );
}

function ConnectionInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="connection-field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.currentTarget.value)} />
    </label>
  );
}
