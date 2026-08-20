import type {
  DiagnosticState,
  WorkflowResult,
} from "../types";

import {
  getQuestionForProfile,
} from "../questionRegistry";

export type StartingWorkflowNode = {
  id: string;

  questionId:
    string | null;

  diagnosisId:
    string | null;

  nextNodeId:
    string | null;
};

const STARTING_WORKFLOW_NODES:
  StartingWorkflowNode[] = [
    {
      id:
        "starting-root",

      questionId:
        "question-no-start",

      diagnosisId:
        null,

      nextNodeId:
        "starting-noise",
    },

    {
      id:
        "starting-noise",

      questionId:
        "question-click-start",

      diagnosisId:
        null,

      nextNodeId:
        "starting-lights",
    },

    {
      id:
        "starting-lights",

      questionId:
        "question-dim-lights",

      diagnosisId:
        null,

      nextNodeId:
        "starting-booster",
    },

    {
      id:
        "starting-booster",

      questionId:
        "question-jump-start",

      diagnosisId:
        null,

      nextNodeId:
        "starting-intermittent",
    },

    {
      id:
        "starting-intermittent",

      questionId:
        "question-starter-intermittent",

      diagnosisId:
        null,

      nextNodeId:
        "starting-hot",
    },

    {
      id:
        "starting-hot",

      questionId:
        "question-hot-engine-start",

      diagnosisId:
        null,

      nextNodeId:
        "starting-end",
    },

    {
      id:
        "starting-end",

      questionId:
        null,

      diagnosisId:
        "diagnosis-starting-required",

      nextNodeId:
        null,
    },
  ];

function getNodeById(
  nodeId: string,
): StartingWorkflowNode | null {
  return (
    STARTING_WORKFLOW_NODES.find(
      (node) =>
        node.id ===
        nodeId,
    ) ?? null
  );
}

function getEntryNode():
  StartingWorkflowNode {
  const entryNode =
    getNodeById(
      "starting-root",
    );

  if (
    !entryNode
  ) {
    throw new Error(
      "Le noeud d'entrée du workflow de démarrage est introuvable.",
    );
  }

  return entryNode;
}

function questionIsAvailable(
  node:
    StartingWorkflowNode,
  state:
    DiagnosticState,
): boolean {
  if (
    !node.questionId
  ) {
    return false;
  }

  return (
    getQuestionForProfile(
      node.questionId,
      state.profile,
    ) !== null
  );
}

function findNextNode(
  startNode:
    StartingWorkflowNode,
  state:
    DiagnosticState,
): StartingWorkflowNode | null {
  let currentNode:
    StartingWorkflowNode | null =
      startNode;

  const visitedNodeIds =
    new Set<string>();

  while (
    currentNode
  ) {
    if (
      visitedNodeIds.has(
        currentNode.id,
      )
    ) {
      throw new Error(
        `Boucle détectée dans le workflow de démarrage au noeud ${currentNode.id}.`,
      );
    }

    visitedNodeIds.add(
      currentNode.id,
    );

    if (
      currentNode.questionId &&
      questionIsAvailable(
        currentNode,
        state,
      ) &&
      !state.askedQuestions.includes(
        currentNode.questionId,
      )
    ) {
      return currentNode;
    }

    if (
      !currentNode.nextNodeId
    ) {
      return currentNode;
    }

    currentNode =
      getNodeById(
        currentNode.nextNodeId,
      );
  }

  return null;
}

export function runStartingWorkflow(
  state: DiagnosticState,
): WorkflowResult {
  const currentNode =
    getNodeById(
      state.workflow.currentNode,
    ) ??
    getEntryNode();

  const nextNode =
    findNextNode(
      currentNode,
      state,
    );

  if (
    !nextNode
  ) {
    return {
      nextQuestionId:
        null,

      diagnosisId:
        null,

      completed:
        false,
    };
  }

  state.workflow.currentNode =
    nextNode.id;

  if (
    nextNode.questionId
  ) {
    return {
      nextQuestionId:
        nextNode.questionId,

      diagnosisId:
        null,

      completed:
        false,
    };
  }

  state.workflow.completed =
    true;

  return {
    nextQuestionId:
      null,

    diagnosisId:
      nextNode.diagnosisId,

    completed:
      true,
  };
}
