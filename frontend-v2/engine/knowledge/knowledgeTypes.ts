import type {
  DiagnosticAction,
} from "../core/actionTypes";

import type {
  KnowledgeDomain,
} from "./KnowledgeLoader";

export type DiagnosticDomain = KnowledgeDomain;

export type KnowledgeEvidence = {
  id: string;
  label: string;
  defaultConfidence: number;
};

export type KnowledgeHypothesis = {
  id: string;
  label: string;
  explanation?: string;
  possibleParts: string[];
  recommendedChecks: string[];
};

export type KnowledgeRuleEffect =
  | "support"
  | "contradict";

export type KnowledgeRule = {
  id: string;
  evidenceId: string;
  evidenceIds?: string[];
  hypothesisId: string;
  effect: KnowledgeRuleEffect;
  weight: number;
};

export type KnowledgePart = {
  id: string;
  name: string;
  category: string;
  saleLabel: string;
  requiresVehicleIdentification: boolean;
  purchaseWarning: string | null;
};

export type KnowledgeWorkflow = {
  id: string;
  title: string;
  entryActionId: string;
  locked: boolean;
};

export type KnowledgePackage = {
  domain: DiagnosticDomain;
  actions: DiagnosticAction[];
  evidences: KnowledgeEvidence[];
  hypotheses: KnowledgeHypothesis[];
  rules: KnowledgeRule[];
  parts: KnowledgePart[];
  workflow: KnowledgeWorkflow;
};

