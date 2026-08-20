import {
  RuleId,
  HypothesisId,
  EvidenceId,
} from "./identifiers";

export type RuleOperator =
  | "all"
  | "any"
  | "none";

export interface RuleCondition {

  evidenceId?: EvidenceId;

  hypothesisId?: HypothesisId;

  expectedValue?: unknown;

}

export interface RuleAction {

  type: string;

  targetId?: string;

  value?: number;

}

export interface Rule {

  id: RuleId;

  domainId: string;

  name: string;

  priority: number;

  operator: RuleOperator;

  conditions: RuleCondition[];

  actions: RuleAction[];

}
