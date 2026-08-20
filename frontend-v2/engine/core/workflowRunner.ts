import type {
  DiagnosticAction,
  DiagnosticActionExecution,
  DiagnosticActionResult,
} from "./actionTypes";

import type {
  DiagnosticSession,
} from "./sessionTypes";

import type {
  DiagnosticWorkflow,
} from "./workflowTypes";

import {
  getWorkflowAction,
} from "./workflowTypes";

export type WorkflowRunnerInput = {
  session: DiagnosticSession;

  workflow: DiagnosticWorkflow;
};

function findLatestActionResult(
  session: DiagnosticSession,
  actionId: string,
): DiagnosticActionResult | null {
  for (
    let index =
      session.actionResults.length - 1;
    index >= 0;
    index -= 1
  ) {
    const result =
      session.actionResults[index];

    if (
      result.actionId ===
      actionId
    ) {
      return result;
    }
  }

  return null;
}

function resolveNextActionId(
  action: DiagnosticAction,
  result:
    DiagnosticActionResult | null,
): string | null {
  if (
    result?.optionId &&
    action.options
  ) {
    const selectedOption =
      action.options.find(
        (option) =>
          option.id ===
          result.optionId,
      );

    if (
      selectedOption?.nextActionId
    ) {
      return selectedOption.nextActionId;
    }
  }

  return (
    action.nextActionId ??
    null
  );
}

function getEntryAction(
  workflow: DiagnosticWorkflow,
): DiagnosticAction | null {
  const entryNode =
    workflow.nodes.find(
      (node) =>
        node.id ===
        workflow.entryNodeId,
    );

  if (
    !entryNode?.actionId
  ) {
    return null;
  }

  return getWorkflowAction(
    workflow,
    entryNode.actionId,
  );
}

function getCurrentAction(
  session: DiagnosticSession,
  workflow: DiagnosticWorkflow,
): DiagnosticAction | null {
  if (
    session.currentActionId
  ) {
    const currentAction =
      getWorkflowAction(
        workflow,
        session.currentActionId,
      );

    if (
      currentAction
    ) {
      return currentAction;
    }
  }

  return getEntryAction(
    workflow,
  );
}

function findNextAvailableAction(
  session: DiagnosticSession,
  workflow: DiagnosticWorkflow,
  startAction: DiagnosticAction,
): DiagnosticAction | null {
  let currentAction:
    DiagnosticAction | null =
      startAction;

  const visitedActionIds =
    new Set<string>();

  while (
    currentAction
  ) {
    if (
      visitedActionIds.has(
        currentAction.id,
      )
    ) {
      throw new Error(
        `Boucle détectée dans le workflow ${workflow.id} à l'action ${currentAction.id}.`,
      );
    }

    visitedActionIds.add(
      currentAction.id,
    );

    const isCompleted =
      session.completedActionIds.includes(
        currentAction.id,
      );

    if (
      !isCompleted ||
      currentAction.repeatable
    ) {
      return currentAction;
    }

    const latestResult =
      findLatestActionResult(
        session,
        currentAction.id,
      );

    const nextActionId =
      resolveNextActionId(
        currentAction,
        latestResult,
      );

    if (
      !nextActionId
    ) {
      return null;
    }

    currentAction =
      getWorkflowAction(
        workflow,
        nextActionId,
      );
  }

  return null;
}

function completeDiagnosis(
  session: DiagnosticSession,
  action: DiagnosticAction,
): DiagnosticActionExecution {
  session.status =
    "diagnosis-ready";

  session.currentActionId =
    action.id;

  session.pendingAction =
    null;

  session.updatedAt =
    new Date().toISOString();

  return {
    action:
      null,

    completed:
      true,

    diagnosisId:
      action.diagnosisId ??
      null,

    reason:
      "Le workflow a atteint l'action de conclusion.",
  };
}

export function runWorkflow(
  input: WorkflowRunnerInput,
): DiagnosticActionExecution {
  const {
    session,
    workflow,
  } = input;

  session.workflowId =
    workflow.id;

  session.workflowLocked =
    workflow.id !==
    "general";

  const currentAction =
    getCurrentAction(
      session,
      workflow,
    );

  if (
    !currentAction
  ) {
    session.status =
      "manual-review-required";

    session.pendingAction =
      null;

    session.updatedAt =
      new Date().toISOString();

    return {
      action:
        null,

      completed:
        false,

      diagnosisId:
        null,

      reason:
        "Aucune action d'entrée valide n'a été trouvée.",
    };
  }

  const nextAction =
    findNextAvailableAction(
      session,
      workflow,
      currentAction,
    );

  if (
    !nextAction
  ) {
    session.status =
      "manual-review-required";

    session.pendingAction =
      null;

    session.updatedAt =
      new Date().toISOString();

    return {
      action:
        null,

      completed:
        false,

      diagnosisId:
        null,

      reason:
        "Aucune action suivante n'est disponible.",
    };
  }

  if (
    nextAction.type ===
    "complete-diagnosis"
  ) {
    return completeDiagnosis(
      session,
      nextAction,
    );
  }

  session.currentActionId =
    nextAction.id;

  session.pendingAction =
    nextAction;

  session.status =
    "waiting-for-user";

  session.updatedAt =
    new Date().toISOString();

  return {
    action:
      nextAction,

    completed:
      false,

    diagnosisId:
      null,

    reason:
      "La prochaine action du workflow est prête.",
  };
}

export function recordActionResult(
  session: DiagnosticSession,
  action: DiagnosticAction,
  result: DiagnosticActionResult,
): void {
  session.actionResults.push(
    result,
  );

  if (
    !session.completedActionIds.includes(
      action.id,
    )
  ) {
    session.completedActionIds.push(
      action.id,
    );
  }

  session.pendingAction =
    null;

  const nextActionId =
    resolveNextActionId(
      action,
      result,
    );

  session.currentActionId =
    nextActionId;

  session.status =
    "collecting-information";

  session.updatedAt =
    new Date().toISOString();
}
