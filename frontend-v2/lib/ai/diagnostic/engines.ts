import type {
  KnowledgeEntity,
  KnowledgeGraphData,
  KnowledgeRelation,
  KnowledgeSeverity,
} from "../knowledge/types";

import type {
  DiagnosticConfidenceLevel,
  DiagnosticEngineOptions,
  DiagnosticEvidence,
  DiagnosticEvidenceExplanation,
  DiagnosticHypothesis,
  DiagnosticResult,
  DiagnosticScoreBreakdown,
  DiagnosticSession,
  DiagnosticSessionStatus,
  DiagnosticWarning,
} from "./types";

import { defaultDiagnosticEngineOptions } from "./types";

/*
 * ============================================================
 * CONSTANTES
 * ============================================================
 */

const DEFAULT_BASE_SCORE = 0.15;

const TEST_SOURCE_MULTIPLIER = 1.2;
const OBD_SOURCE_MULTIPLIER = 1.15;
const USER_SOURCE_MULTIPLIER = 1;

const SUPPORTING_RELATION_TYPES = new Set([
  "produces",
  "supports",
  "verified-by",
  "related-to",
  "affects",
]);

/*
 * ============================================================
 * OUTILS INTERNES
 * ============================================================
 */

function clamp(value: number, minimum = 0, maximum = 1): number {
  return Math.min(Math.max(value, minimum), maximum);
}

function normalizeConfidence(confidence: number): number {
  return clamp(confidence);
}

function isAffirmativeEvidence(evidence: DiagnosticEvidence): boolean {
  const { value } = evidence;

  if (value === true || value === "yes") {
    return true;
  }

  if (typeof value === "number") {
    return value > 0;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();

    return [
      "oui",
      "yes",
      "true",
      "present",
      "présent",
      "detected",
      "détecté",
      "confirmed",
      "confirmé",
      "positive",
      "positif",
    ].includes(normalizedValue);
  }

  return false;
}

function isNegativeEvidence(evidence: DiagnosticEvidence): boolean {
  const { value } = evidence;

  if (value === false || value === "no") {
    return true;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();

    return [
      "non",
      "no",
      "false",
      "absent",
      "not-detected",
      "non détecté",
      "negative",
      "négatif",
    ].includes(normalizedValue);
  }

  return false;
}

function getEvidenceSourceMultiplier(
  evidence: DiagnosticEvidence,
): number {
  switch (evidence.source) {
    case "test":
      return TEST_SOURCE_MULTIPLIER;

    case "obd":
      return OBD_SOURCE_MULTIPLIER;

    case "vehicle-data":
    case "system":
      return 1.1;

    case "user":
    default:
      return USER_SOURCE_MULTIPLIER;
  }
}

function getConfidenceLevel(
  score: number,
): DiagnosticConfidenceLevel {
  if (score >= 0.85) {
    return "very-high";
  }

  if (score >= 0.7) {
    return "high";
  }

  if (score >= 0.5) {
    return "medium";
  }

  if (score >= 0.3) {
    return "low";
  }

  return "very-low";
}

function getSeverityPriority(
  severity?: KnowledgeSeverity,
): number {
  switch (severity) {
    case "critical":
      return 4;

    case "high":
      return 3;

    case "medium":
      return 2;

    case "low":
      return 1;

    default:
      return 0;
  }
}

function getEntityById(
  graph: KnowledgeGraphData,
  entityId: string,
): KnowledgeEntity | undefined {
  return graph.entities.find(
    (entity) => entity.id === entityId,
  );
}

function findRelationsBetween(
  relations: KnowledgeRelation[],
  firstEntityId: string,
  secondEntityId: string,
): KnowledgeRelation[] {
  return relations.filter((relation) => {
    const directRelation =
      relation.from === firstEntityId &&
      relation.to === secondEntityId;

    const inverseRelation =
      relation.from === secondEntityId &&
      relation.to === firstEntityId;

    return directRelation || inverseRelation;
  });
}

function getRelationEffect(
  relation: KnowledgeRelation,
  evidence: DiagnosticEvidence,
): "supports" | "contradicts" | "neutral" {
  if (
    !isAffirmativeEvidence(evidence) &&
    !isNegativeEvidence(evidence)
  ) {
    return "neutral";
  }

  const relationSupportsProblem =
    SUPPORTING_RELATION_TYPES.has(relation.type);

  const relationContradictsProblem =
    relation.type === "contradicts";

  if (relationSupportsProblem) {
    return isAffirmativeEvidence(evidence)
      ? "supports"
      : "contradicts";
  }

  if (relationContradictsProblem) {
    return isAffirmativeEvidence(evidence)
      ? "contradicts"
      : "supports";
  }

  return "neutral";
}

function createEvidenceExplanation(
  evidence: DiagnosticEvidence,
  relation: KnowledgeRelation,
  effect: "supports" | "contradicts" | "neutral",
  weight: number,
  graph: KnowledgeGraphData,
): DiagnosticEvidenceExplanation {
  const evidenceEntity = getEntityById(
    graph,
    evidence.entityId,
  );

  const evidenceName =
    evidenceEntity?.name ?? evidence.entityId;

  let explanation: string;

  if (effect === "supports") {
    explanation =
      `« ${evidenceName} » est compatible avec cette panne.`;
  } else if (effect === "contradicts") {
    explanation =
      `« ${evidenceName} » réduit la probabilité de cette panne.`;
  } else {
    explanation =
      `« ${evidenceName} » ne permet pas encore de départager cette panne.`;
  }

  return {
    evidenceId: evidence.id,
    entityId: evidence.entityId,
    effect,
    weight,
    explanation,
  };
}

/*
 * ============================================================
 * EXTRACTION DES TESTS, PIÈCES ET RÉPARATIONS
 * ============================================================
 */

function getRelatedEntityIds(
  problemId: string,
  graph: KnowledgeGraphData,
  relationTypes: string[],
): string[] {
  const entityIds = graph.relations
    .filter(
      (relation) =>
        relation.from === problemId &&
        relationTypes.includes(relation.type),
    )
    .map((relation) => relation.to);

  return [...new Set(entityIds)];
}

function getRecommendedTestIds(
  problemId: string,
  graph: KnowledgeGraphData,
): string[] {
  return getRelatedEntityIds(
    problemId,
    graph,
    ["verified-by", "measured-by"],
  ).filter(
    (entityId) =>
      getEntityById(graph, entityId)?.type === "test" ||
      getEntityById(graph, entityId)?.type ===
        "measurement",
  );
}

function getRequiredPartIds(
  problemId: string,
  graph: KnowledgeGraphData,
): string[] {
  return getRelatedEntityIds(
    problemId,
    graph,
    ["requires-part"],
  ).filter(
    (entityId) =>
      getEntityById(graph, entityId)?.type === "part",
  );
}

function getRepairIds(
  problemId: string,
  graph: KnowledgeGraphData,
): string[] {
  return getRelatedEntityIds(
    problemId,
    graph,
    ["repaired-by"],
  ).filter((entityId) => {
    const entity = getEntityById(graph, entityId);

    return (
      entity?.type === "repair" ||
      entity?.type === "procedure"
    );
  });
}

/*
 * ============================================================
 * CALCUL D’UNE HYPOTHÈSE
 * ============================================================
 */

function calculateHypothesis(
  problem: KnowledgeEntity,
  evidenceList: DiagnosticEvidence[],
  graph: KnowledgeGraphData,
): DiagnosticHypothesis {
  let supportingScore = 0;
  let contradictingScore = 0;
  let testScore = 0;

  const supportingEvidence: DiagnosticEvidenceExplanation[] =
    [];

  const contradictingEvidence: DiagnosticEvidenceExplanation[] =
    [];

  for (const evidence of evidenceList) {
    const relations = findRelationsBetween(
      graph.relations,
      problem.id,
      evidence.entityId,
    );

    for (const relation of relations) {
      const effect = getRelationEffect(
        relation,
        evidence,
      );

      if (effect === "neutral") {
        continue;
      }

      const confidence =
        normalizeConfidence(evidence.confidence);

      const sourceMultiplier =
        getEvidenceSourceMultiplier(evidence);

      const weightedEffect = clamp(
        relation.weight *
          confidence *
          sourceMultiplier,
      );

      const explanation = createEvidenceExplanation(
        evidence,
        relation,
        effect,
        weightedEffect,
        graph,
      );

      if (effect === "supports") {
        supportingScore += weightedEffect;
        supportingEvidence.push(explanation);

        if (
          evidence.source === "test" ||
          evidence.source === "obd"
        ) {
          testScore += weightedEffect;
        }
      }

      if (effect === "contradicts") {
        contradictingScore += weightedEffect;
        contradictingEvidence.push(explanation);

        if (
          evidence.source === "test" ||
          evidence.source === "obd"
        ) {
          testScore -= weightedEffect;
        }
      }
    }
  }

  const totalRelevantEvidence =
    supportingEvidence.length +
    contradictingEvidence.length;

  let finalScore = DEFAULT_BASE_SCORE;

  if (totalRelevantEvidence > 0) {
    const evidenceBalance =
      (supportingScore - contradictingScore) /
      totalRelevantEvidence;

    finalScore =
      DEFAULT_BASE_SCORE +
      evidenceBalance * 0.85;
  }

  finalScore = clamp(finalScore);

  const breakdown: DiagnosticScoreBreakdown = {
    baseScore: DEFAULT_BASE_SCORE,
    supportingScore,
    contradictingScore,
    vehicleContextScore: 0,
    testScore,
    finalScore,
  };

  return {
    problemId: problem.id,
    problem,
    score: finalScore,
    confidenceLevel: getConfidenceLevel(finalScore),
    severity: problem.severity,
    breakdown,
    supportingEvidence,
    contradictingEvidence,
    recommendedTestIds: getRecommendedTestIds(
      problem.id,
      graph,
    ),
    requiredPartIds: getRequiredPartIds(
      problem.id,
      graph,
    ),
    repairIds: getRepairIds(problem.id, graph),
  };
}

/*
 * ============================================================
 * AVERTISSEMENTS DE SÉCURITÉ
 * ============================================================
 */

function createSafetyWarnings(
  hypotheses: DiagnosticHypothesis[],
): DiagnosticWarning[] {
  const warnings: DiagnosticWarning[] = [];

  const criticalHypothesis = hypotheses.find(
    (hypothesis) =>
      hypothesis.severity === "critical" &&
      hypothesis.score >= 0.5,
  );

  if (criticalHypothesis) {
    warnings.push({
      id: `warning-critical-${criticalHypothesis.problemId}`,
      level: "stop-vehicle",
      message:
        "Une panne potentiellement critique a été détectée. N’utilisez pas le véhicule avant un contrôle professionnel.",
      relatedEntityIds: [
        criticalHypothesis.problemId,
      ],
    });

    return warnings;
  }

  const highSeverityHypothesis = hypotheses.find(
    (hypothesis) =>
      hypothesis.severity === "high" &&
      hypothesis.score >= 0.65,
  );

  if (highSeverityHypothesis) {
    warnings.push({
      id: `warning-high-${highSeverityHypothesis.problemId}`,
      level: "danger",
      message:
        "La panne la plus probable peut affecter la sécurité ou immobiliser le véhicule. Un contrôle rapide est recommandé.",
      relatedEntityIds: [
        highSeverityHypothesis.problemId,
      ],
    });
  }

  return warnings;
}

/*
 * ============================================================
 * STATUT ET RÉSUMÉ
 * ============================================================
 */

function determineStatus(
  hypotheses: DiagnosticHypothesis[],
  session: DiagnosticSession,
  options: DiagnosticEngineOptions,
): DiagnosticSessionStatus {
  const bestHypothesis = hypotheses[0];

  if (!bestHypothesis) {
    return "blocked";
  }

  if (
    bestHypothesis.score >=
    options.diagnosisReadyThreshold
  ) {
    return "diagnosis-ready";
  }

  if (
    session.askedQuestionIds.length >=
    options.maximumQuestions
  ) {
    return "needs-test";
  }

  if (
    bestHypothesis.recommendedTestIds.length > 0 &&
    bestHypothesis.score >= 0.5
  ) {
    return "needs-test";
  }

  return "collecting-information";
}

function createSummary(
  hypotheses: DiagnosticHypothesis[],
): string {
  const bestHypothesis = hypotheses[0];

  if (!bestHypothesis) {
    return (
      "Aucune panne ne peut encore être identifiée avec " +
      "les informations disponibles."
    );
  }

  const percentage = Math.round(
    bestHypothesis.score * 100,
  );

  return (
    `La panne actuellement la plus probable est : ` +
    `${bestHypothesis.problem.name} ` +
    `avec un score de confiance de ${percentage} %.`
  );
}

/*
 * ============================================================
 * MOTEUR PUBLIC
 * ============================================================
 */

export class DiagnosticEngine {
  private readonly graph: KnowledgeGraphData;

  private readonly options: DiagnosticEngineOptions;

  constructor(
    graph: KnowledgeGraphData,
    options: Partial<DiagnosticEngineOptions> = {},
  ) {
    this.graph = graph;

    this.options = {
      ...defaultDiagnosticEngineOptions,
      ...options,
    };
  }

  analyze(session: DiagnosticSession): DiagnosticResult {
    const problems = this.graph.entities.filter(
      (entity) => entity.type === "problem",
    );

    const hypotheses = problems
      .map((problem) =>
        calculateHypothesis(
          problem,
          session.evidence,
          this.graph,
        ),
      )
      .filter(
        (hypothesis) =>
          hypothesis.score >=
          this.options.minimumHypothesisScore,
      )
      .sort((firstHypothesis, secondHypothesis) => {
        const scoreDifference =
          secondHypothesis.score -
          firstHypothesis.score;

        if (scoreDifference !== 0) {
          return scoreDifference;
        }

        return (
          getSeverityPriority(
            secondHypothesis.severity,
          ) -
          getSeverityPriority(
            firstHypothesis.severity,
          )
        );
      })
      .slice(0, this.options.maxHypotheses);

    const bestHypothesis = hypotheses[0];

    const status = determineStatus(
      hypotheses,
      session,
      this.options,
    );

    const warnings =
      this.options.enableSafetyWarnings
        ? createSafetyWarnings(hypotheses)
        : [];

    return {
      sessionId: session.id,
      status,
      hypotheses,
      bestHypothesis,
      warnings,
      summary: createSummary(hypotheses),
      explanation: bestHypothesis
        ? this.createExplanation(bestHypothesis)
        : undefined,
      createdAt: new Date().toISOString(),
    };
  }

  private createExplanation(
    hypothesis: DiagnosticHypothesis,
  ): string {
    const supportingCount =
      hypothesis.supportingEvidence.length;

    const contradictingCount =
      hypothesis.contradictingEvidence.length;

    if (
      supportingCount === 0 &&
      contradictingCount === 0
    ) {
      return (
        "Cette hypothèse possède uniquement un score de départ. " +
        "Des informations supplémentaires sont nécessaires."
      );
    }

    return (
      `${supportingCount} élément(s) soutiennent cette hypothèse ` +
      `et ${contradictingCount} élément(s) la contredisent.`
    );
  }
}
