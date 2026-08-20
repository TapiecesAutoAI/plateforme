import type {
  DiagnosticResult,
  Hypothesis,
} from "./types";

import {
  getEntityById,
  getRelationsFrom,
} from "./knowledge/graph";

import type {
  KnowledgeEntity,
  KnowledgeRelation,
} from "./knowledge/types";

function getRelatedEntities(
  sourceEntityId: string,
  relationType: KnowledgeRelation["type"],
  expectedType?: KnowledgeEntity["type"],
): KnowledgeEntity[] {
  const entitiesById =
    new Map<string, KnowledgeEntity>();

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

    if (!entity) {
      continue;
    }

    if (
      expectedType &&
      entity.type !== expectedType
    ) {
      continue;
    }

    entitiesById.set(
      entity.id,
      entity,
    );
  }

  return [
    ...entitiesById.values(),
  ];
}

function getRelationNames(
  sourceEntityId: string,
  relationType: KnowledgeRelation["type"],
  expectedType?: KnowledgeEntity["type"],
): string[] {
  return getRelatedEntities(
    sourceEntityId,
    relationType,
    expectedType,
  ).map(
    (entity) =>
      entity.name,
  );
}

function getUniqueEvidenceLabels(
  hypothesis: Hypothesis,
): string[] {
  return [
    ...new Set(
      hypothesis.evidenceFor.map(
        (evidence) =>
          evidence.label,
      ),
    ),
  ];
}

function getUniqueContradictionLabels(
  hypothesis: Hypothesis,
): string[] {
  return [
    ...new Set(
      hypothesis.evidenceAgainst.map(
        (evidence) =>
          evidence.label,
      ),
    ),
  ];
}

function buildExplanation(
  hypothesis: Hypothesis,
  problem: KnowledgeEntity | null,
): string {
  const baseExplanation =
    problem?.description ??
    "Aucune explication détaillée n’est disponible.";

  const contradictions =
    getUniqueContradictionLabels(
      hypothesis,
    );

  if (
    contradictions.length === 0
  ) {
    return baseExplanation;
  }

  return (
    `${baseExplanation} ` +
    `Éléments défavorables : ${contradictions.join(", ")}.`
  );
}

export function buildDiagnostic(
  hypothesis: Hypothesis | null,
): DiagnosticResult | null {
  if (
    !hypothesis ||
    hypothesis.eliminated
  ) {
    return null;
  }

  const problem =
    getEntityById(
      hypothesis.id,
    );

  return {
    title:
      hypothesis.label,

    confidence:
      Math.round(
        Math.max(
          0,
          Math.min(
            hypothesis.probability,
            1,
          ),
        ) * 100,
      ),

    explanation:
      buildExplanation(
        hypothesis,
        problem,
      ),

    evidence:
      getUniqueEvidenceLabels(
        hypothesis,
      ),

    recommendedChecks:
      getRelationNames(
        hypothesis.id,
        "verified-by",
        "test",
      ),

    possibleParts:
      getRelationNames(
        hypothesis.id,
        "requires-part",
        "part",
      ),

    recommendedProcedures:
      getRelationNames(
        hypothesis.id,
        "repaired-by",
        "repair",
      ),
  };
}
