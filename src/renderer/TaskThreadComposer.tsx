import { CircleAlert } from "lucide-react";

import { appendTaskThreadTurn, cancelTaskThreadTurn } from "./coreTaskThreadSubmitClient";
import type { HarborIdentityLoadState } from "./harborIdentityTypes";
import type { LodeCatalogSkill } from "./lodeCatalogClient";
import type { RuntimeSupervisorState } from "./runtimeSupervisorState";
import { StructuredTaskComposer } from "./StructuredTaskComposer";
import type { TaskProjection } from "./taskThreadFixtures";

export function TaskThreadComposer({
  coreEndpoint,
  harborIdentityState,
  runtimeSupervisorState,
  selectedTask,
  skill,
  onTask,
}: {
  coreEndpoint: string;
  harborIdentityState: HarborIdentityLoadState;
  runtimeSupervisorState: RuntimeSupervisorState;
  selectedTask: TaskProjection;
  skill?: LodeCatalogSkill;
  onTask: (task: TaskProjection) => void;
}) {
  const identity = harborIdentityState.identities.find((item) =>
    item.identityEnvironmentRef === selectedTask.threadContext?.accountIdentityKey,
  );
  if (skill == null || identity == null || selectedTask.threadContext == null) {
    return (
      <div className="thread-composer composer-owner-state" role="status">
        <CircleAlert size={15} />
        <span>{skill == null ? "当前线程的站点技能合同不可用。" : "当前线程绑定的账号身份不可用。"}</span>
      </div>
    );
  }
  const activeRun = selectedTask.runs.find((run) =>
    run.turnStatus === "submitting" || run.turnStatus === "accepted" || run.turnStatus === "running" ||
    run.turnStatus === "waiting_for_user" || run.turnStatus === "status_unknown",
  );
  const submitBlockedReason = activeRun == null
    ? undefined
    : `${activeRun.label}尚未结束；可以继续编辑下一次业务输入，结束后再提交。`;
  return (
    <StructuredTaskComposer
      endpoint={coreEndpoint}
      identity={identity}
      runtime={runtimeSupervisorState}
      skill={skill}
      threadRef={selectedTask.id}
      submitBlockedReason={submitBlockedReason}
      activeTurnLabel={activeRun?.label}
      submitLabel="提交回合"
      onCancelActiveTurn={activeRun?.turnId == null ? undefined : () => cancelTaskThreadTurn(coreEndpoint, selectedTask.id, activeRun.turnId!)}
      onSubmit={(draft, ownerRefs, executionPolicy) => appendTaskThreadTurn({
        endpoint: coreEndpoint,
        threadRef: selectedTask.id,
        skill,
        identity,
        draft,
        ownerRefs,
        executionPolicy,
        runtime: runtimeSupervisorState,
      })}
      onTask={onTask}
    />
  );
}
