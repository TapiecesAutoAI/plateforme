import type {
  DiagnosticAction,
} from "./actionTypes";

import type {
  DiagnosticSession,
  DiagnosticWorkflowId,
} from "./sessionTypes";

export type WorkflowTransitionCondition = {
  evidenceId?: string;

  rejectedEvidenceId?: string;

  completedActionId?: string;

  selectedOptionId?: string;

  minimumHypothesisProbability?: number;

  hypothesisId?: string;
};

export type WorkflowTransition = {
  id: string;

  targetNodeId: string;

  priority: number;

  conditions?: WorkflowTransitionCondition[];
};

export type WorkflowNodeType =
  | "action"
  | "decision"
  | "diagnosis"
  | "end";

export type WorkflowNode = {
  id: string;

  type: WorkflowNodeType;

  actionId?: string;

  diagnosisId?: string;

  transitions: WorkflowTransition[];
};

export type DiagnosticWorkflow = {
  id: DiagnosticWorkflowId;

  title: string;

  description: string;

  entryNodeId: string;

  nodes: WorkflowNode[];

  actions: DiagnosticAction[];
};

export type WorkflowExecutionInput = {
  session: DiagnosticSession;

  workflow: DiagnosticWorkflow;
};

export type WorkflowExecutionResult = {
  workflowId: DiagnosticWorkflowId;

  currentNodeId: string;

  nextNodeId: string | null;

  nextAction: DiagnosticAction | null;

  diagnosisId: string | null;

  completed: boolean;

  reason: string;
};

export function getWorkflowNode(
  workflow: DiagnosticWorkflow,
  nodeId: string,
): WorkflowNode | null {
  return (
    workflow.nodes.find(
      (node) =>
        node.id === nodeId,
    ) ?? null
  );
}

export function getWorkflowAction(
  workflow: DiagnosticWorkflow,
  actionId: string,
): DiagnosticAction | null {
  return (
    workflow.actions.find(
      (action) =>
        action.id === actionId,
    ) ?? null
  );
}
