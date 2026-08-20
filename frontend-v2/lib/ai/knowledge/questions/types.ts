export type QuestionDomain =
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

export type QuestionAudience =
  | "particulier"
  | "bricoleur"
  | "vendeur-pieces-auto"
  | "mecanicien-garage"
  | "depanneur"
  | "etudiant-mecanique"
  | "autre-professionnel";

export type QuestionComplexity =
  | "simple"
  | "intermediate"
  | "technical";

export interface QuestionOption {
  /**
   * Identifiant unique de la réponse.
   */
  id: string;

  /**
   * Valeur enregistrée lorsque cette réponse est choisie.
   */
  value: string;

  /**
   * Texte affiché à l’utilisateur.
   */
  label: string;

  /**
   * Entités observées lorsque cette réponse est choisie.
   */
  addsEvidence?: string[];

  /**
   * Hypothèses renforcées.
   */
  supports?: string[];

  /**
   * Hypothèses affaiblies ou éliminées.
   */
  rejects?: string[];
}

export interface KnowledgeQuestionTemplate {
  /**
   * Identifiant unique de la question.
   */
  id: string;

  /**
   * Domaines diagnostiques concernés.
   */
  domains: QuestionDomain[];

  /**
   * Texte affiché à l’utilisateur.
   */
  text: string;

  /**
   * Objectif diagnostique interne.
   */
  purpose?: string;

  /**
   * Entité observée par la question.
   */
  targetEntityId: string;

  /**
   * Une valeur faible signifie une priorité élevée
   * dans le moteur actuel.
   */
  priority: number;

  /**
   * Hypothèses que la question permet de départager.
   */
  discriminates: string[];

  /**
   * Profils autorisés à recevoir cette question.
   *
   * Sans valeur, la question reste accessible
   * à tous les profils pendant la migration.
   */
  audiences?: QuestionAudience[];

  /**
   * Niveau technique de la question.
   *
   * simple :
   * observation visuelle ou comportement facilement constatable.
   *
   * intermediate :
   * contrôle simple avec booster, chargeur ou multimètre.
   *
   * technical :
   * mesure professionnelle, isolement de circuit,
   * mise en sommeil, oscilloscope, LIN/CAN, etc.
   */
  complexity?: QuestionComplexity;

  /**
   * Questions devant avoir été posées auparavant.
   */
  prerequisites?: string[];

  /**
   * Entités devant déjà être observées.
   */
  requiredEvidence?: string[];

  /**
   * Entités incompatibles avec cette question.
   */
  excludedByEvidence?: string[];

  /**
   * Autorise la question à être reposée.
   */
  repeatable?: boolean;

  /**
   * Réponses proposées à l’utilisateur.
   */
  options: QuestionOption[];
}