import type {
  KnowledgeEntity,
  KnowledgeSeverity,
} from "../knowledge/types";

/*
 * ============================================================
 * TYPES GÉNÉRAUX DU MOTEUR DE DIAGNOSTIC
 * ============================================================
 */

/**
 * Réponse possible à une question de diagnostic.
 */
export type DiagnosticAnswerValue =
  | "yes"
  | "no"
  | "unknown"
  | string
  | number
  | boolean;

/**
 * Niveau de confiance du moteur.
 */
export type DiagnosticConfidenceLevel =
  | "very-low"
  | "low"
  | "medium"
  | "high"
  | "very-high";

/**
 * État d'une session de diagnostic.
 */
export type DiagnosticSessionStatus =
  | "collecting-information"
  | "analyzing"
  | "needs-test"
  | "diagnosis-ready"
  | "completed"
  | "blocked";

/*
 * ============================================================
 * INFORMATIONS SUR LE VÉHICULE
 * ============================================================
 */

export type VehicleContext = {
  vin?: string;

  make?: string;
  model?: string;
  year?: number;

  mileageKm?: number;

  fuelType?:
    | "petrol"
    | "diesel"
    | "hybrid"
    | "plug-in-hybrid"
    | "electric"
    | "lpg"
    | "unknown";

  transmissionType?:
    | "manual"
    | "automatic"
    | "robotized"
    | "cvt"
    | "unknown";

  engineCode?: string;
  engineDisplacement?: number;

  outsideTemperatureCelsius?: number;

  metadata?: Record<
    string,
    string | number | boolean | string[] | number[]
  >;
};

/*
 * ============================================================
 * SYMPTÔMES ET OBSERVATIONS
 * ============================================================
 */

/**
 * Information déclarée par l'utilisateur.
 *
 * Exemple :
 * - le véhicule ne démarre pas
 * - bruit à l'avant
 * - bruit uniquement en virage
 */
export type DiagnosticEvidence = {
  id: string;

  /**
   * Identifiant d'une entité du graphe.
   *
   * Exemple :
   * symptom-no-start
   */
  entityId: string;

  value: DiagnosticAnswerValue;

  /**
   * Niveau de certitude de l'utilisateur.
   *
   * 1 = totalement certain
   * 0 = aucune certitude
   */
  confidence: number;

  source:
    | "user"
    | "vehicle-data"
    | "obd"
    | "test"
    | "system";

  createdAt: string;
};

/*
 * ============================================================
 * QUESTIONS DE DIAGNOSTIC
 * ============================================================
 */

export type DiagnosticQuestionOption = {
  value: DiagnosticAnswerValue;
  label: string;
};

export type DiagnosticQuestion = {
  id: string;

  /**
   * Texte présenté à l'utilisateur.
   */
  text: string;

  /**
   * Entité que cette question cherche à confirmer
   * ou à réfuter.
   */
  targetEntityId: string;

  type:
    | "yes-no"
    | "single-choice"
    | "multiple-choice"
    | "number"
    | "text";

  options?: DiagnosticQuestionOption[];

  /**
   * Importance de la question.
   *
   * Plus la valeur est élevée,
   * plus la réponse peut modifier le classement.
   */
  informationGain: number;

  /**
   * Explication interne ou affichable.
   */
  reason?: string;

  unit?: string;

  min?: number;
  max?: number;
};

/*
 * ============================================================
 * HYPOTHÈSES DE PANNE
 * ============================================================
 */

export type DiagnosticScoreBreakdown = {
  /**
   * Score de départ basé sur la fréquence
   * ou la plausibilité générale de la panne.
   */
  baseScore: number;

  /**
   * Points ajoutés par les éléments compatibles.
   */
  supportingScore: number;

  /**
   * Points retirés par les éléments contradictoires.
   */
  contradictingScore: number;

  /**
   * Ajustement selon le véhicule.
   */
  vehicleContextScore: number;

  /**
   * Ajustement selon les tests réalisés.
   */
  testScore: number;

  /**
   * Score final normalisé entre 0 et 1.
   */
  finalScore: number;
};

export type DiagnosticEvidenceExplanation = {
  evidenceId: string;
  entityId: string;

  effect:
    | "supports"
    | "contradicts"
    | "neutral";

  weight: number;
  explanation: string;
};

export type DiagnosticHypothesis = {
  /**
   * Identifiant de l'entité de type problem.
   */
  problemId: string;

  problem: KnowledgeEntity;

  score: number;
  confidenceLevel: DiagnosticConfidenceLevel;

  severity?: KnowledgeSeverity;

  breakdown: DiagnosticScoreBreakdown;

  supportingEvidence: DiagnosticEvidenceExplanation[];
  contradictingEvidence: DiagnosticEvidenceExplanation[];

  /**
   * Tests recommandés pour confirmer la panne.
   */
  recommendedTestIds: string[];

  /**
   * Pièces potentiellement nécessaires.
   */
  requiredPartIds: string[];

  /**
   * Procédures ou réparations possibles.
   */
  repairIds: string[];
};

/*
 * ============================================================
 * RÉSULTAT DU DIAGNOSTIC
 * ============================================================
 */

export type DiagnosticWarning = {
  id: string;

  level:
    | "information"
    | "caution"
    | "danger"
    | "stop-vehicle";

  message: string;

  relatedEntityIds?: string[];
};

export type DiagnosticResult = {
  sessionId: string;

  status: DiagnosticSessionStatus;

  hypotheses: DiagnosticHypothesis[];

  bestHypothesis?: DiagnosticHypothesis;

  nextQuestion?: DiagnosticQuestion;

  warnings: DiagnosticWarning[];

  /**
   * Résumé destiné à l'utilisateur.
   */
  summary: string;

  /**
   * Explication plus détaillée du raisonnement.
   */
  explanation?: string;

  createdAt: string;
};

/*
 * ============================================================
 * SESSION DE DIAGNOSTIC
 * ============================================================
 */

export type DiagnosticSession = {
  id: string;

  status: DiagnosticSessionStatus;

  vehicle: VehicleContext;

  evidence: DiagnosticEvidence[];

  askedQuestionIds: string[];

  currentResult?: DiagnosticResult;

  createdAt: string;
  updatedAt: string;
};

/*
 * ============================================================
 * OPTIONS DU MOTEUR
 * ============================================================
 */

export type DiagnosticEngineOptions = {
  /**
   * Nombre maximal d'hypothèses retournées.
   */
  maxHypotheses: number;

  /**
   * Score minimal pour conserver une hypothèse.
   */
  minimumHypothesisScore: number;

  /**
   * Score à partir duquel le diagnostic
   * peut être considéré comme suffisamment fiable.
   */
  diagnosisReadyThreshold: number;

  /**
   * Nombre maximal de questions.
   */
  maximumQuestions: number;

  /**
   * Active les avertissements de sécurité.
   */
  enableSafetyWarnings: boolean;
};

export const defaultDiagnosticEngineOptions: DiagnosticEngineOptions = {
  maxHypotheses: 5,
  minimumHypothesisScore: 0.1,
  diagnosisReadyThreshold: 0.85,
  maximumQuestions: 12,
  enableSafetyWarnings: true,
};
