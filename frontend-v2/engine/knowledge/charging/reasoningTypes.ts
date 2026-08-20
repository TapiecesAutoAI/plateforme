import type {
  ChargingAudience,
} from "./types";

export type ChargingRuleEffect =
  | "support"
  | "contradict"
  | "eliminate";

export type ChargingRule = {
  id: string;

  evidenceId: string;

  hypothesisId: string;

  effect: ChargingRuleEffect;

  weight: number;

  explanation: string;
};

export type ChargingQuestionOption = {
  id: string;

  label: string;

  addsEvidenceIds: string[];

  rejectsEvidenceIds?: string[];
};

export type ChargingQuestion = {
  id: string;

  text: string;

  purpose: string;

  audiences: ChargingAudience[];

  difficulty: number;

  requiresMeasurement: boolean;

  estimatedSeconds: number;

  baseInformationGain: number;

  targetHypothesisIds: string[];

  requiredEvidenceIds?: string[];

  forbiddenEvidenceIds?: string[];

  options: ChargingQuestionOption[];
};

export type ChargingQuestionCandidate = {
  question: ChargingQuestion;

  score: number;

  reasons: string[];
};
