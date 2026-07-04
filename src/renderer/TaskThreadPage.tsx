import { AlertTriangle, Braces, HardDrive, Waypoints } from "lucide-react";

import { outcomeLabel, SourceField } from "./TaskThreadFields";
import { ThreadNavigationRail, type ThreadNavigationItem } from "./ThreadNavigationRail";
import { RunStatusGlyph, runReportTitle } from "./RunStatusGlyph";
import type { RunProjection, TaskProjection } from "./taskThreadFixtures";

export function TaskThreadPage({
  navigationItems,
  selectedRun,
  selectedTask,
  onActiveRunChange,
}: {
  navigationItems: ThreadNavigationItem[];
  selectedRun: RunProjection;
  selectedTask: TaskProjection;
  onActiveRunChange: (runId: string) => void;
}) {
  return (
    <div className="thread-body">
      <ThreadNavigationRail
        items={navigationItems}
        onActiveItemChange={onActiveRunChange}
      />

      <div className="thread-content">
        <div className="thread-context-strip" aria-label="Task context">
          <span>站点技能 · {selectedTask.siteSkill}</span>
          <span>账号身份 · {selectedTask.accountIdentity}</span>
          <span>业务输入 · {selectedTask.businessInput}</span>
        </div>

        <TaskIntentTurn selectedTask={selectedTask} />

        {selectedTask.blocker ? (
          <section className="blocker-card">
            <div className="card-title">
              <AlertTriangle size={18} />
              <h3>Blocker: missing source</h3>
            </div>
            <p>{selectedTask.blocker}</p>
          </section>
        ) : null}

        <div className="run-turn-list" aria-label="Core-owned run timeline">
          {selectedTask.runs.map((run) => (
            <RunTurn
              isSelected={run.id === selectedRun.id}
              key={run.id}
              run={run}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TaskIntentTurn({ selectedTask }: { selectedTask: TaskProjection }) {
  return (
    <section className="thread-intent-turn" aria-label="Task thread intent">
      <div className="thread-intent-title">
        <HardDrive size={16} />
        <div>
          <strong>Task = 站点技能 + 账号身份 + 业务输入</strong>
          <p>App 只组织用户意图；Core、Harbor、Lode 仍拥有各自事实来源。</p>
        </div>
        <span className="badge">fixture projection</span>
      </div>
      <dl className="thread-intent-grid">
        <SourceField
          label="Site Skill"
          value={selectedTask.siteSkill}
          source={selectedTask.packageSource.source}
        />
        <SourceField
          label="Identity"
          value={selectedTask.accountIdentity}
          source="Harbor fixture"
        />
        <SourceField
          label="Business input"
          value={selectedTask.businessInput}
          source="App local-only"
        />
      </dl>
      <p className="boundary-copy">
        Managed Core Task 展示 Run / Result / Evidence；direct Identity Runtime Session 只作为
        Harbor session context，不会被转换成 task success。
      </p>
    </section>
  );
}

function RunTurn({ run, isSelected }: { run: RunProjection; isSelected: boolean }) {
  return (
    <article
      className={isSelected ? "run-turn selected" : "run-turn"}
      data-content-search-unit-key={run.id}
      data-turn-key={run.id}
    >
      <section className="run-summary-card">
        <div className="card-title">
          <span className="disclosure">›</span>
          <RunStatusGlyph run={run} />
          <h3>{run.label}</h3>
          <span>{run.process[0] ?? run.lifecycle}</span>
        </div>
        <button type="button">查看详情</button>
      </section>

      <section className={`report-card outcome-${run.outcome} lifecycle-${run.lifecycle}`}>
        <div className="card-title">
          <RunStatusGlyph run={run} />
          <h3>{runReportTitle(run)}</h3>
          <span className="badge">{outcomeLabel(run.outcome)}</span>
        </div>
        <p>{run.summary}</p>
        <h3 className="subsection-title">提取结果</h3>
        <dl className="input-grid">
          {run.resultRows.slice(0, 4).map((row) => (
            <SourceField
              label={row.label}
              value={row.value}
              source={row.source}
              key={`${run.id}-${row.label}`}
            />
          ))}
        </dl>
        <h3 className="subsection-title">运行边界</h3>
        <dl className="input-grid">
          <SourceField label="Run" value={run.label} source={run.source} />
          <SourceField label="Lifecycle" value={run.lifecycle} source={run.source} />
        </dl>
        <p className="action-intent">{run.actionIntent}</p>
      </section>

      <section className="process-card">
        <div className="card-title compact-title">
          <Braces size={18} />
          <h3>证据预览</h3>
        </div>
        <dl className="result-table">
          {run.evidenceCards.map((row) => (
            <SourceField
              label={row.title}
              value={row.summary}
              source={row.source}
              key={row.id}
            />
          ))}
        </dl>
        <div className="card-title compact-title process-title">
          <Waypoints size={18} />
          <h3>执行过程</h3>
        </div>
        <ol>
          {run.process.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>
    </article>
  );
}
