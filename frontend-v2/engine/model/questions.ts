import {
  QuestionId,
  EvidenceId,
  HypothesisId,
} from "./identifiers";

export type QuestionType =
  | "boolean"
  | "single_choice"
  | "multiple_choice"
  | "number"
  | "text";

export interface QuestionOption {

  id: string;

  label: string;

  evidenceId?: EvidenceId;

  value?: string | number | boolean;

}

export interface Question {

  id: QuestionId;

  domainId: string;

  text: string;

  type: QuestionType;

  purpose: string;

  targetHypothesisIds: HypothesisId[];

  targetEvidenceIds: EvidenceId[];

  requiredEvidenceIds?: EvidenceId[];

  options: QuestionOption[];

  cost: number;

}


