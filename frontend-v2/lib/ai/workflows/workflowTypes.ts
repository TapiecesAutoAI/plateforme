/*
|--------------------------------------------------------------------------
| TYPES COMMUNS A TOUS LES WORKFLOWS
|--------------------------------------------------------------------------
*/

export type WorkflowId =
  | "starting"
  | "battery-discharge"
  | "charging"
  | "cooling"
  | "engine"
  | "noise"
  | "braking"
  | "steering"
  | "suspension"
  | "transmission"
  | "general";

export type WorkflowNodeType =
  | "question"
  | "branch"
  | "decision"
  | "diagnosis"
  | "end";

export interface WorkflowCondition {

  entityId?: string;

  hypothesisId?: string;

  minimumProbability?: number;

  answerId?: string;

}

export interface WorkflowTransition {

  id: string;

  targetNodeId: string;

  priority: number;

  conditions?: WorkflowCondition[];

}

export interface WorkflowNode {

  id: string;

  type: WorkflowNodeType;

  title?: string;

  questionId?: string;

  diagnosisId?: string;

  transitions: WorkflowTransition[];

}

export interface DiagnosticWorkflow {

  id: WorkflowId;

  title: string;

  description: string;

  entryNodeId: string;

  nodes: WorkflowNode[];

}