export type DiagnosticActionType =
  | "ask-question"
  | "request-observation"
  | "request-measurement"
  | "request-photo"
  | "request-video"
  | "request-obd-code"
  | "request-vin"
  | "show-diagram"
  | "recommend-test"
  | "show-warning"
  | "complete-diagnosis";

export type DiagnosticAudience =
  | "particulier"
  | "bricoleur"
  | "vendeur-pieces-auto"
  | "mecanicien-garage"
  | "depanneur"
  | "etudiant-mecanique"
  | "autre-professionnel";

export type DiagnosticComplexity =
  | "simple"
  | "intermediate"
  | "technical";

export type DiagnosticActionOption = {
  id: string;

  label: string;

  value: string;

  addsEvidence?: string[];

  rejectsEvidence?: string[];

  supportsHypotheses?: string[];

  rejectsHypotheses?: string[];

  nextActionId?: string;
};

export type DiagnosticAction = {
  id: string;

  workflowId: string;

  type: DiagnosticActionType;

  title?: string;

  text: string;

  purpose?: string;

  audiences: DiagnosticAudience[];

  complexity: DiagnosticComplexity;

  options?: DiagnosticActionOption[];

  requiredEvidence?: string[];

  excludedByEvidence?: string[];

  requiredActions?: string[];

  repeatable?: boolean;

  priority: number;

  nextActionId?: string;

  diagnosisId?: string;
};

export type DiagnosticActionResult = {
  actionId: string;

  optionId?: string;

  value: string;

  completedAt: string;

  addedEvidenceIds: string[];

  rejectedEvidenceIds: string[];

  supportedHypothesisIds: string[];

  rejectedHypothesisIds: string[];
};

export type DiagnosticActionExecution = {
  action: DiagnosticAction | null;

  completed: boolean;

  diagnosisId: string | null;

  reason: string;
};


