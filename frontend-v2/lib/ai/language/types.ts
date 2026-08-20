/*
 * ============================================================
 * TYPES DU MOTEUR DE COMPRÉHENSION AUTOMOBILE
 * ============================================================
 */

/**
 * Catégories générales détectables dans une phrase utilisateur.
 */
export type AutomotiveIntent =
  | "describe-symptom"
  | "report-noise"
  | "report-starting-problem"
  | "report-braking-problem"
  | "report-steering-problem"
  | "report-vibration"
  | "report-warning-light"
  | "report-fluid-leak"
  | "report-power-loss"
  | "report-overheating"
  | "request-diagnosis"
  | "request-part"
  | "unknown";

/**
 * Types de bruits automobiles courants.
 */
export type AutomotiveNoiseType =
  | "clicking"
  | "clunking"
  | "grinding"
  | "squeaking"
  | "squealing"
  | "whistling"
  | "humming"
  | "buzzing"
  | "rattling"
  | "knocking"
  | "scraping"
  | "metallic"
  | "unknown";

/**
 * Localisation supposée d’un problème.
 */
export type AutomotiveLocation =
  | "front"
  | "rear"
  | "left"
  | "right"
  | "front-left"
  | "front-right"
  | "rear-left"
  | "rear-right"
  | "engine-bay"
  | "under-vehicle"
  | "inside-vehicle"
  | "wheel"
  | "steering"
  | "exhaust"
  | "unknown";

/**
 * Situation dans laquelle le symptôme apparaît.
 */
export type AutomotiveCondition =
  | "at-startup"
  | "engine-cold"
  | "engine-hot"
  | "while-idling"
  | "while-accelerating"
  | "while-decelerating"
  | "while-braking"
  | "while-turning"
  | "turning-left"
  | "turning-right"
  | "while-driving"
  | "at-low-speed"
  | "at-high-speed"
  | "on-bumps"
  | "on-bad-road"
  | "when-stationary"
  | "in-reverse"
  | "with-engine-off"
  | "unknown";

/**
 * Manière dont le symptôme évolue.
 */
export type AutomotiveVariation =
  | "increases-with-speed"
  | "decreases-with-speed"
  | "increases-with-engine-speed"
  | "disappears-with-speed"
  | "disappears-when-hot"
  | "appears-when-hot"
  | "constant"
  | "intermittent"
  | "sudden"
  | "progressive"
  | "unknown";

/**
 * Intensité exprimée ou estimée.
 */
export type AutomotiveIntensity =
  | "very-low"
  | "low"
  | "medium"
  | "high"
  | "very-high"
  | "unknown";

/**
 * Élément extrait d’une phrase utilisateur.
 */
export type ExtractedAutomotiveValue<TValue extends string> = {
  value: TValue;

  /**
   * Texte exact ou partiel ayant permis la détection.
   */
  matchedText: string;

  /**
   * Confiance de détection entre 0 et 1.
   */
  confidence: number;
};

/**
 * Entité du graphe de connaissances potentiellement reconnue.
 */
export type MatchedKnowledgeEntity = {
  entityId: string;
  entityName: string;

  matchedText: string;

  confidence: number;

  matchType:
    | "exact-name"
    | "exact-alias"
    | "partial-name"
    | "partial-alias"
    | "semantic-rule";
};

/**
 * Information structurée extraite du langage naturel.
 */
export type ParsedAutomotiveComplaint = {
  /**
   * Texte original saisi par l’utilisateur.
   */
  originalText: string;

  /**
   * Texte nettoyé pour faciliter les comparaisons.
   */
  normalizedText: string;

  /**
   * Intention principale détectée.
   */
  intent: AutomotiveIntent;

  /**
   * Confiance globale dans l’interprétation.
   */
  confidence: number;

  noiseTypes: Array<
    ExtractedAutomotiveValue<AutomotiveNoiseType>
  >;

  locations: Array<
    ExtractedAutomotiveValue<AutomotiveLocation>
  >;

  conditions: Array<
    ExtractedAutomotiveValue<AutomotiveCondition>
  >;

  variations: Array<
    ExtractedAutomotiveValue<AutomotiveVariation>
  >;

  intensity?: ExtractedAutomotiveValue<AutomotiveIntensity>;

  /**
   * Entités reconnues dans le graphe.
   */
  matchedEntities: MatchedKnowledgeEntity[];

  /**
   * Mots encore inconnus ou non exploités.
   */
  unmatchedTerms: string[];

  /**
   * Indique si une question supplémentaire est nécessaire.
   */
  requiresClarification: boolean;

  /**
   * Question simple pouvant être posée ensuite.
   */
  clarificationQuestion?: string;
};

/**
 * Règle lexicale utilisée par le moteur.
 */
export type AutomotiveLanguageRule<TValue extends string> = {
  value: TValue;

  /**
   * Expressions reconnues.
   *
   * Elles doivent être écrites en minuscules
   * et sans accents pour faciliter la comparaison.
   */
  patterns: string[];

  confidence: number;
};

/**
 * Options générales du moteur de langage.
 */
export type AutomotiveLanguageOptions = {
  minimumMatchConfidence: number;

  maximumEntityMatches: number;

  detectKnowledgeEntities: boolean;

  includeUnmatchedTerms: boolean;
};

export const defaultAutomotiveLanguageOptions: AutomotiveLanguageOptions = {
  minimumMatchConfidence: 0.55,
  maximumEntityMatches: 10,
  detectKnowledgeEntities: true,
  includeUnmatchedTerms: true,
};
