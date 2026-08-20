import type {
  KnowledgeQuestionTemplate,
} from "../knowledge/questions";

export type WorkflowNodeType =
  | "question"
  | "diagnosis"
  | "branch";

export interface WorkflowNode {
  id: string;

  type: WorkflowNodeType;

  questionId?: string;

  diagnosisId?: string;

  next?: string[];

  priority: number;
}

export interface DiagnosticWorkflow {
  id: string;

  title: string;

  entryNode: string;

  nodes: WorkflowNode[];
}

/*
|--------------------------------------------------------------------------
| WORKFLOW DEMARRAGE — V1
|--------------------------------------------------------------------------
|
| Ce fichier définit uniquement l’ordre logique
| des questions de démarrage de la V1.
|
*/

export const startingWorkflow:
  DiagnosticWorkflow = {
    id:
      "starting",

    title:
      "Diagnostic démarrage",

    entryNode:
      "no-start",

    nodes: [
      {
        id:
          "no-start",

        type:
          "question",

        questionId:
          "question-no-start",

        priority:
          100,

        next: [
          "starter-noise",
        ],
      },

      {
        id:
          "starter-noise",

        type:
          "question",

        questionId:
          "question-click-start",

        priority:
          95,

        next: [
          "lights",
        ],
      },

      {
        id:
          "lights",

        type:
          "question",

        questionId:
          "question-dim-lights",

        priority:
          90,

        next: [
          "booster",
        ],
      },

      {
        id:
          "booster",

        type:
          "question",

        questionId:
          "question-jump-start",

        priority:
          85,

        next: [
          "intermittent",
        ],
      },

      {
        id:
          "intermittent",

        type:
          "question",

        questionId:
          "question-starter-intermittent",

        priority:
          80,

        next: [
          "hot-engine",
        ],
      },

      {
        id:
          "hot-engine",

        type:
          "question",

        questionId:
          "question-hot-engine-start",

        priority:
          75,

        next: [
          "diagnosis",
        ],
      },

      {
        id:
          "diagnosis",

        type:
          "diagnosis",

        priority:
          0,
      },
    ],
  };

export function getWorkflowNode(
  nodeId: string,
): WorkflowNode | null {
  return (
    startingWorkflow.nodes.find(
      (node) =>
        node.id ===
        nodeId,
    ) ?? null
  );
}

export function getFirstWorkflowQuestion():
  string {
  return (
    startingWorkflow.entryNode
  );
}
