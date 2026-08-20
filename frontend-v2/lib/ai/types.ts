export type FuelType =
  | "essence"
  | "diesel"
  | "hybride"
  | "electrique";

export type Vehicle = {
  brand: string | null;
  model: string | null;
  year: number | null;
  engine: string | null;
  fuel: FuelType | null;
  vin: string | null;
};

export type Symptom = {
  id: string;
  label: string;
  category: string;
  confidence: number;
};

export type EvidenceSource =
  | "symptom"
  | "answer"
  | "vehicle"
  | "observation"
  | "test";

export type Evidence = {
  id: string;
  label: string;
  source: EvidenceSource;
  weight: number;

  entityId?: string;
  questionId?: string;
  answerId?: string;
};

export type Hypothesis = {
  id: string;
  label: string;
  probability: number;
  eliminated: boolean;

  evidenceFor: Evidence[];
  evidenceAgainst: Evidence[];

  missingEvidence: string[];
};

export type QuestionOption = {
  id: string;
  label: string;
  value: string;

  addsEvidence?: string[];
  supports?: string[];
  rejects?: string[];
};

export type Question = {
  id: string;
  text: string;
  reason: string;

  targetHypotheses: string[];

  expectedInformationGain: number;

  options: QuestionOption[];
};

export type DiagnosticDecisionStatus =
  | "collecting-information"
  | "diagnosis-probable"
  | "diagnosis-complete"
  | "manual-review-required";

export type DiagnosticDecision = {
  status: DiagnosticDecisionStatus;

  primaryHypothesisId: string | null;

  confidence: number;

  explanation: string | null;
};

export type DiagnosticResult = {
  title: string;

  confidence: number;

  explanation: string;

  evidence: string[];

  recommendedChecks: string[];

  possibleParts: string[];

  recommendedProcedures: string[];
};

export type DiagnosticAnswer = {
  questionId: string;
  optionId: string;
  value: string;
  answeredAt: string;
};

/*
 * ============================================================
 * MÉMOIRE DIAGNOSTIQUE
 * ============================================================
 */

export type DiagnosticDomain =
  | "starting"
  | "noise"
  | "engine"
  | "cooling"
  | "electrical"
  | "braking"
  | "transmission"
  | "steering"
  | "suspension"
  | "general";

export type DiagnosticMemoryEntityStatus =
  | "detected"
  | "confirmed"
  | "rejected"
  | "unknown";

export type DiagnosticMemorySource =
  | "free-text"
  | "question-answer"
  | "structured-option"
  | "system";

export type DiagnosticMemoryEvent = {
  id: string;

  entityId: string | null;

  questionId: string | null;

  optionId: string | null;

  status: DiagnosticMemoryEntityStatus;

  source: DiagnosticMemorySource;

  value: string;

  createdAt: string;
};

export type DiagnosticConfidenceSnapshot = {
  hypothesisId: string;

  probability: number;

  recordedAt: string;
};

export type DiagnosticMemory = {
  /*
   * Entités reconnues dans le texte libre, mais pas encore
   * nécessairement confirmées par une réponse structurée.
   */
  detectedEntityIds: string[];

  /*
   * Entités considérées comme vraies pour le raisonnement.
   */
  confirmedEntityIds: string[];

  /*
   * Entités explicitement rejetées.
   */
  rejectedEntityIds: string[];

  /*
   * Entités pour lesquelles l’utilisateur a répondu
   * « Je ne sais pas » ou n’a pas pu vérifier.
   */
  unknownEntityIds: string[];

  /*
   * Domaine principal actuellement suivi.
   */
  activeDomain: DiagnosticDomain | null;

  /*
   * Question en attente d’une réponse exploitable.
   */
  pendingQuestionId: string | null;

  /*
   * Questions déjà traitées.
   */
  askedQuestionIds: string[];

  /*
   * Historique chronologique des changements de mémoire.
   */
  history: DiagnosticMemoryEvent[];

  /*
   * Évolution des probabilités au fil de la conversation.
   */
  confidenceHistory: DiagnosticConfidenceSnapshot[];
};

export type ConversationState = {
  vehicle: Vehicle;

  symptoms: Symptom[];

  hypotheses: Hypothesis[];

  askedQuestions: string[];

  answers: DiagnosticAnswer[];

  /*
   * Champs historiques conservés pendant la migration.
   */
  confirmedEntityIds: string[];

  rejectedEntityIds: string[];

  /*
   * Nouvelle mémoire centrale.
   *
   * Le champ reste optionnel pendant la migration afin que
   * les autres fichiers continuent à compiler avant leur
   * remplacement progressif.
   */
  memory?: DiagnosticMemory;

  nextQuestion: Question | null;

  decision: DiagnosticDecision;

  diagnosisComplete: boolean;

  diagnostic: DiagnosticResult | null;
};