import { Evidence } from "./evidences";
import { Hypothesis } from "./hypotheses";
import { Question } from "./questions";
import { DiagnosticAction } from "./actions";

export type ReasoningProfileId =
  | "particulier"
  | "bricoleur"
  | "vendeur-pieces-auto"
  | "mecanicien-garage"
  | "depanneur";

export type ReasoningFailureBranch =
  | "unknown"
  | "no-crank-no-sound"
  | "single-click"
  | "rapid-clicks"
  | "starter-spins"
  | "engine-cranks";

export interface ReasoningContextMetadata {
  sessionId?: string;

  profileId?: ReasoningProfileId;

  domainId?: string;

  workflowId?: string;

  language?: string;

  createdAt?: string;

  updatedAt?: string;
}

export interface ReasoningContextProgress {
  answeredQuestionCount: number;

  maximumQuestionCount?: number;

  currentQuestionId?: string | null;

  failureBranch?: ReasoningFailureBranch;

  answeredQuestionFamilies: Set<string>;

  unavailableCapabilities: Set<string>;
}

export interface ReasoningContext {
  evidences: Map<string, Evidence>;

  hypotheses: Map<string, Hypothesis>;

  questions: Map<string, Question>;

  actions: Map<string, DiagnosticAction>;

  activeHypothesisIds: Set<string>;

  eliminatedHypothesisIds: Set<string>;

  confirmedEvidenceIds: Set<string>;

  rejectedEvidenceIds: Set<string>;

  completedQuestionIds: Set<string>;

  metadata?: ReasoningContextMetadata;

  progress?: ReasoningContextProgress;
}
