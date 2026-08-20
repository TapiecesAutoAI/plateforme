import type {
  Evidence,
  Hypothesis,
} from "../types";

import {
  getEntityById,
  getEntitiesByType,
  getRelationsFrom,
} from "./graph";

import type {
  KnowledgeEntity,
  KnowledgeRelation,
} from "./types";

type DiagnosticRelation =
  KnowledgeRelation & {
    type:
      | "produces"
      | "supports"
      | "contradicts";
  };

type ScoredProblem = {
  problem: KnowledgeEntity;

  score: number;

  positiveScore: number;
  negativeScore: number;
  coverageScore: number;

  evidenceFor: Evidence[];
  evidenceAgainst: Evidence[];

  missingEvidence: string[];
};

const MAX_CONFIDENCE = 0.98;
const ELIMINATION_THRESHOLD = 0.05;

const BASE_HYPOTHESIS_SCORE = 0.08;

function clamp(
  value: number,
  minimum = 0,
  maximum = 1,
): number {
  if (!Number.isFinite(value)) {
    return minimum;
  }

  return Math.max(
    minimum,
    Math.min(value, maximum),
  );
}

function normalizeWeight(
  weight: number,
): number {
  return clamp(
    Math.abs(weight),
  );
}

function isDiagnosticRelation(
  relation: KnowledgeRelation,
): relation is DiagnosticRelation {
  return (
    relation.type === "produces" ||
    relation.type === "supports" ||
    relation.type === "contradicts"
  );
}

function isPositiveRelation(
  relation: DiagnosticRelation,
): boolean {
  return (
    relation.type === "produces" ||
    relation.type === "supports"
  );
}

function createEvidence(params: {
  entity: KnowledgeEntity;
  relation: KnowledgeRelation;
  source: Evidence["source"];
  weight: number;
}): Evidence {
  const {
    entity,
    relation,
    source,
    weight,
  } = params;

  return {
    id: `${relation.id}-${entity.id}`,
    label: entity.name,
    source,
    weight: normalizeWeight(weight),
    entityId: entity.id,
  };
}

function getEvidenceSource(
  entity: KnowledgeEntity,
): Evidence["source"] {
  if (entity.type === "symptom") {
    return "symptom";
  }

  if (entity.type === "test") {
    return "test";
  }

  return "observation";
}

/**
 * Combine plusieurs preuves indépendantes sans
 * permettre au score de dépasser 100 %.
 */
function calculateCombinedSupport(
  weights: number[],
): number {
  if (weights.length === 0) {
    return 0;
  }

  const remainingUncertainty =
    weights.reduce(
      (
        remaining,
        weight,
      ) =>
        remaining *
        (1 - normalizeWeight(weight)),
      1,
    );

  return clamp(
    1 - remainingUncertainty,
  );
}

/**
 * Une hypothèse soutenue par plusieurs indices
 * indépendants reçoit un bonus de cohérence.
 */
function calculateEvidenceCountBonus(
  evidenceCount: number,
): number {
  if (evidenceCount >= 5) {
    return 0.2;
  }

  if (evidenceCount === 4) {
    return 0.16;
  }

  if (evidenceCount === 3) {
    return 0.12;
  }

  if (evidenceCount === 2) {
    return 0.06;
  }

  return 0;
}

function calculateContradictionPenalty(
  contradictionWeights: number[],
): number {
  if (
    contradictionWeights.length === 0
  ) {
    return 0;
  }

  const combinedContradiction =
    calculateCombinedSupport(
      contradictionWeights,
    );

  return clamp(
    combinedContradiction * 0.85,
    0,
    0.9,
  );
}

function calculateCoverage(
  detectedWeight: number,
  possibleWeight: number,
): number {
  if (possibleWeight <= 0) {
    return 0;
  }

  return clamp(
    detectedWeight /
      possibleWeight,
  );
}

function addUniqueEvidence(
  collection: Evidence[],
  evidence: Evidence,
): void {
  const alreadyExists =
    collection.some(
      (currentEvidence) =>
        currentEvidence.entityId ===
          evidence.entityId &&
        currentEvidence.source ===
          evidence.source,
    );

  if (!alreadyExists) {
    collection.push(evidence);
  }
}

function scoreProblem(
  problem: KnowledgeEntity,
  confirmedEntityIds: Set<string>,
  rejectedEntityIds: Set<string>,
): ScoredProblem {
  const diagnosticRelations =
    getRelationsFrom(
      problem.id,
    ).filter(
      isDiagnosticRelation,
    );

  const evidenceFor: Evidence[] = [];
  const evidenceAgainst: Evidence[] = [];

  const missingEvidence =
    new Set<string>();

  const positiveWeights: number[] = [];
  const contradictionWeights: number[] = [];

  let detectedPositiveWeight = 0;
  let totalPossiblePositiveWeight = 0;

  for (
    const relation
    of diagnosticRelations
  ) {
    const targetEntity =
      getEntityById(
        relation.to,
      );

    if (!targetEntity) {
      continue;
    }

    const relationWeight =
      normalizeWeight(
        relation.weight,
      );

    const entityIsConfirmed =
      confirmedEntityIds.has(
        targetEntity.id,
      );

    const entityIsRejected =
      rejectedEntityIds.has(
        targetEntity.id,
      );

    if (
      isPositiveRelation(relation)
    ) {
      totalPossiblePositiveWeight +=
        relationWeight;

      if (entityIsConfirmed) {
        detectedPositiveWeight +=
          relationWeight;

        positiveWeights.push(
          relationWeight,
        );

        addUniqueEvidence(
          evidenceFor,
          createEvidence({
            entity: targetEntity,
            relation,
            source:
              getEvidenceSource(
                targetEntity,
              ),
            weight: relationWeight,
          }),
        );

        continue;
      }

      /*
       * Une observation attendue explicitement rejetée
       * devient une preuve défavorable.
       */
      if (entityIsRejected) {
        contradictionWeights.push(
          relationWeight,
        );

        addUniqueEvidence(
          evidenceAgainst,
          createEvidence({
            entity: targetEntity,
            relation,
            source: "answer",
            weight: relationWeight,
          }),
        );

        continue;
      }

      missingEvidence.add(
        targetEntity.name,
      );

      continue;
    }

    /*
     * Une relation "contradicts" signifie que la
     * présence de l'entité affaiblit l'hypothèse.
     */
    if (
      relation.type ===
        "contradicts" &&
      entityIsConfirmed
    ) {
      contradictionWeights.push(
        relationWeight,
      );

      addUniqueEvidence(
        evidenceAgainst,
        createEvidence({
          entity: targetEntity,
          relation,
          source:
            getEvidenceSource(
              targetEntity,
            ),
          weight: relationWeight,
        }),
      );
    }

    /*
     * Le rejet d'une contradiction constitue une
     * preuve légèrement favorable.
     */
    if (
      relation.type ===
        "contradicts" &&
      entityIsRejected
    ) {
      const indirectSupport =
        relationWeight * 0.35;

      positiveWeights.push(
        indirectSupport,
      );

      addUniqueEvidence(
        evidenceFor,
        createEvidence({
          entity: targetEntity,
          relation,
          source: "answer",
          weight: indirectSupport,
        }),
      );
    }
  }

  if (
    evidenceFor.length === 0 &&
    evidenceAgainst.length === 0
  ) {
    return {
      problem,
      score: 0,
      positiveScore: 0,
      negativeScore: 0,
      coverageScore: 0,
      evidenceFor,
      evidenceAgainst,
      missingEvidence: [
        ...missingEvidence,
      ],
    };
  }

  const coverageScore =
    calculateCoverage(
      detectedPositiveWeight,
      totalPossiblePositiveWeight,
    );

  const combinedSupport =
    calculateCombinedSupport(
      positiveWeights,
    );

  const evidenceCountBonus =
    calculateEvidenceCountBonus(
      evidenceFor.length,
    );

  const positiveScore =
    clamp(
      BASE_HYPOTHESIS_SCORE +
        coverageScore * 0.38 +
        combinedSupport * 0.42 +
        evidenceCountBonus,
    );

  const negativeScore =
    calculateContradictionPenalty(
      contradictionWeights,
    );

  const score =
    evidenceFor.length === 0
      ? 0
      : clamp(
          positiveScore -
            negativeScore,
          0,
          MAX_CONFIDENCE,
        );

  return {
    problem,
    score,
    positiveScore,
    negativeScore,
    coverageScore,
    evidenceFor,
    evidenceAgainst,
    missingEvidence: [
      ...missingEvidence,
    ],
  };
}

function compareScoredProblems(
  first: ScoredProblem,
  second: ScoredProblem,
): number {
  if (
    second.score !== first.score
  ) {
    return (
      second.score -
      first.score
    );
  }

  if (
    second.evidenceFor.length !==
    first.evidenceFor.length
  ) {
    return (
      second.evidenceFor.length -
      first.evidenceFor.length
    );
  }

  if (
    first.evidenceAgainst.length !==
    second.evidenceAgainst.length
  ) {
    return (
      first.evidenceAgainst.length -
      second.evidenceAgainst.length
    );
  }

  return first.problem.id.localeCompare(
    second.problem.id,
  );
}

export function generateGraphHypotheses(
  confirmedEntities: KnowledgeEntity[],
  rejectedEntities: KnowledgeEntity[] = [],
): Hypothesis[] {
  const confirmedEntityIds =
    new Set(
      confirmedEntities.map(
        (entity) => entity.id,
      ),
    );

  const rejectedEntityIds =
    new Set(
      rejectedEntities.map(
        (entity) => entity.id,
      ),
    );

  /*
   * Une confirmation récente prend priorité sur
   * un ancien rejet contradictoire.
   */
  for (
    const confirmedEntityId
    of confirmedEntityIds
  ) {
    rejectedEntityIds.delete(
      confirmedEntityId,
    );
  }

  const problems =
    getEntitiesByType(
      "problem",
    );

  return problems
    .map((problem) =>
      scoreProblem(
        problem,
        confirmedEntityIds,
        rejectedEntityIds,
      ),
    )
    .filter(
      (result) =>
        result.evidenceFor.length > 0 ||
        result.evidenceAgainst.length > 0,
    )
    .sort(compareScoredProblems)
    .map(
      (
        result,
      ): Hypothesis => ({
        id: result.problem.id,

        label:
          result.problem.name,

        probability:
          result.score,

        eliminated:
          result.score <=
            ELIMINATION_THRESHOLD ||
          (
            result.evidenceFor.length ===
              0 &&
            result.evidenceAgainst.length >
              0
          ),

        evidenceFor: [
          ...result.evidenceFor,
        ],

        evidenceAgainst: [
          ...result.evidenceAgainst,
        ],

        missingEvidence: [
          ...result.missingEvidence,
        ],
      }),
    );
}

function getRelatedEntities(
  sourceEntityId: string,
  relationType:
    | "requires-part"
    | "verified-by",
  targetEntityType:
    | "part"
    | "test",
): KnowledgeEntity[] {
  const entityIds =
    new Set<string>();

  const entities:
    KnowledgeEntity[] = [];

  for (
    const relation
    of getRelationsFrom(
      sourceEntityId,
    )
  ) {
    if (
      relation.type !==
      relationType
    ) {
      continue;
    }

    const entity =
      getEntityById(
        relation.to,
      );

    if (
      !entity ||
      entity.type !==
        targetEntityType ||
      entityIds.has(entity.id)
    ) {
      continue;
    }

    entityIds.add(entity.id);
    entities.push(entity);
  }

  return entities;
}

export function getProblemParts(
  problemId: string,
): KnowledgeEntity[] {
  return getRelatedEntities(
    problemId,
    "requires-part",
    "part",
  );
}

export function getProblemTests(
  problemId: string,
): KnowledgeEntity[] {
  return getRelatedEntities(
    problemId,
    "verified-by",
    "test",
  );
}

